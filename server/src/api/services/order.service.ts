/* -------------------------- Enum -------------------------- */
import { PessimisticKeys } from '@/enums/redis.enum.js';
import { OrderStatus } from '@/enums/order.enum.js';

/* ------------------------- Models ------------------------- */
import { findOneCheckout, deleteCheckout } from '@/models/repository/checkout/index.js';
import orderModel from '@/models/order.model.js';
import { userModel } from '@/models/user.model.js';
import { findAddressById } from '@/models/repository/address/index.js';
import { findShopById, findShopByUser } from '@/models/repository/shop/index.js';
import paymentModel from '@/models/payment.model.js';

/* -------------------------- Repo -------------------------- */
import { cancelDiscount } from '@/models/repository/discount/index.js';
import {
    findOneInventory,
    orderProductInventory,
    revertProductInventory
} from '@/models/repository/inventory/index.js';

import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

/* ------------------------ Services ------------------------ */
import { pessimisticLock } from './redis.service.js';
import DiscountService from './discount.service.js';
import paymentService from './payment.service.js';

/* ------------------------- Utils  ------------------------- */
import { assertFulfilled, assertRejected, sleep } from '@/utils/promise.util.js';

import _ from 'lodash';
import CartService from './cart.service.js';
import { PaymentType } from '@/enums/payment.enum.js';
import { findOneOrder } from '@/models/repository/order/index.js';
import PaymentService from './payment.service.js';

export default new (class OrderService {
    public async createOrder({ userId, paymentType }: service.order.arguments.CreateOrder) {
        /* ------------------- Check user information  ------------------- */
        const user = await userModel.findById(userId);
        if (!user) throw new NotFoundErrorResponse({ message: 'User not found!' });

        /* ------------------ Check checkout info  ------------------ */
        const checkout = await findOneCheckout({ query: { user: userId } });
        if (!checkout) throw new NotFoundErrorResponse({ message: 'Not found checkout info!' });

        /* ------------------- Get shipping address  ------------------- */
        const shippingAddress = await findAddressById({
            id: checkout.ship_info,
            options: { lean: true, populate: 'location' }
        });
        if (!shippingAddress) throw new NotFoundErrorResponse({ message: 'Shipping address not found!' });

        // Type assertion for populated location
        const location = (shippingAddress.location as any).text as string;
        if (!location) throw new NotFoundErrorResponse({ message: 'Shipping address not found!' });

        /* ---------- Validate shops exist ---------- */
        if (checkout.shops_info.length === 0) {
            throw new BadRequestErrorResponse({
                message: 'No shops found in checkout!'
            });
        }

        /* ------------- Check admin discount if exists ------------- */
        const discountAdmin = checkout.discount;
        if (discountAdmin?.discount_id) {
            await DiscountService.useDiscount({
                userId,
                discountId: discountAdmin.discount_id.toString(),
                discountCode: discountAdmin.discount_code
            });
        }

        /* ----------- Process each shop separately ----------- */
        const orderResults = await Promise.allSettled(
            checkout.shops_info.map(async (shopInfo) => {
                /* ------------------- Get shop information ------------------- */
                const shop = await findShopById({ id: shopInfo.shop_id, options: { lean: true } });
                if (!shop) throw new NotFoundErrorResponse({ message: `Shop ${shopInfo.shop_id} not found!` });

                /* ---------- Check product quantity in inventory  ---------- */
                const products = shopInfo.products_info.map((product) => ({
                    sku_id: product.id,
                    quantity: product.quantity,
                    product_name: product.name,
                    thumb: product.thumb,
                    price: product.price,
                    price_raw: product.price_raw
                }));

                /* ----------- Handle inventory for this shop ----------- */
                const inventoryResults = await Promise.allSettled(
                    products.map(async ({ sku_id, quantity }, index) => {
                        /* -------------------- Check inventory  -------------------- */
                        const inventory = await findOneInventory({
                            query: { inventory_sku: sku_id },
                            select: ['_id']
                        }).lean();
                        if (!inventory)
                            throw new NotFoundErrorResponse({ message: 'Not found inventory!' });

                        /* ------------ Check and handle inventory stock ------------ */
                        const orderedInventory = await pessimisticLock(
                            PessimisticKeys.INVENTORY,
                            inventory._id,
                            async () => await orderProductInventory(sku_id, quantity)
                        );
                        if (!orderedInventory) {
                            throw new BadRequestErrorResponse({
                                message: 'Product stock is not enough!',
                                hideOnProduction: true
                            });
                        }

                        return {
                            sku_id,
                            quantity,
                            index
                        };
                    })
                );

                /* ----------- Check if all inventory operations succeeded ----------- */
                const isInventorySuccessAll = inventoryResults.every((x) => x.status === 'fulfilled');
                if (!isInventorySuccessAll) {
                    /* ----------- Cleanup successfully ordered items ----------- */
                    const successfulInventoryResults = inventoryResults.filter(assertFulfilled);
                    const firstInventoryRejectMessage =
                        inventoryResults.find(assertRejected)?.reason || 'Some error when ordering!';

                    await Promise.all(
                        successfulInventoryResults.map(async ({ value }) => {
                            /* ----------------- Revert inventory stock ----------------- */
                            await revertProductInventory(value.sku_id, value.quantity);
                        })
                    );

                    throw firstInventoryRejectMessage;
                }

                /* --------------------- Check shop discount --------------------- */
                if (shopInfo.discount?.discount_id) {
                    await DiscountService.useDiscount({
                        userId,
                        discountCode: shopInfo.discount.discount_code,
                        discountId: shopInfo.discount.discount_id.toString()
                    });
                }

                /* ------------- Remove products from cart for this shop ------------- */
                await CartService.deleteProductsFromCart({
                    user: userId,
                    products: products.map((x) => x.sku_id)
                });

                /* ------------------ Create order for this shop ------------------ */
                const order = await orderModel.create({
                    /* ------------------------ Customer ------------------------ */
                    customer: userId,
                    customer_address: location,
                    customer_avatar: user.user_avatar?.toString() || '',
                    customer_email: user.user_email,
                    customer_full_name: shippingAddress.recipient_name,
                    customer_phone: shippingAddress.recipient_phone,

                    /* -------------------------- Shop -------------------------- */
                    shop_id: shopInfo.shop_id,
                    shop_name: shop.shop_name,
                    shop_logo: shop.shop_logo,

                    /* ------------------------ Products ------------------------ */
                    products_info: products.map(product => ({
                        sku_id: product.sku_id,
                        product_name: product.product_name,
                        quantity: product.quantity,
                        thumb: product.thumb,
                        price: product.price,
                        price_raw: product.price_raw,
                        sku_variations: [] // Will be populated from SKU data if needed
                    })),

                    /* ------------------------ Shipping ------------------------ */
                    ship_info: checkout.ship_info,
                    fee_ship: shopInfo.fee_ship,
                    warehouses_info: shopInfo.warehouses_info || [],

                    /* ------------------------ Payment  ------------------------ */
                    payment_type: paymentType,
                    payment_paid: false,
                    price_to_payment: shopInfo.total_price_raw + shopInfo.fee_ship - shopInfo.total_discount_price,
                    price_total_raw: shopInfo.total_price_raw,
                    total_discount_price: shopInfo.total_discount_price,

                    /* ------------------------ Discount ------------------------ */
                    discount: discountAdmin,
                    shop_discount: shopInfo.discount,

                    /* ------------------------- Order  ------------------------- */
                    order_status:
                        paymentType === PaymentType.COD ?
                            OrderStatus.PENDING :
                            OrderStatus.PENDING_PAYMENT
                });

                return {
                    shopId: shopInfo.shop_id,
                    order,
                    products
                };
            })
        );

        /* ----------- Handle results from all shops ----------- */
        const successfulOrders = orderResults.filter(assertFulfilled);
        const failedOrders = orderResults.filter(assertRejected);

        /* ----------- If some orders failed, cleanup successful ones ----------- */
        if (failedOrders.length > 0) {
            /* ----------- Revert successful orders ----------- */
            await Promise.all(
                successfulOrders.map(async ({ value }) => {
                    /* ----------- Revert inventory for successful orders ----------- */
                    await Promise.all(
                        value.products.map(async ({ sku_id, quantity }) => {
                            const inventory = await findOneInventory({
                                query: { inventory_sku: sku_id },
                                select: ['_id']
                            }).lean();

                            if (inventory) {
                                await pessimisticLock(
                                    PessimisticKeys.INVENTORY,
                                    inventory._id,
                                    async () => await revertProductInventory(sku_id, quantity)
                                );
                            }
                        })
                    );

                    /* ----------- Delete the created order ----------- */
                    await orderModel.findByIdAndDelete(value.order._id);

                    /* ----------- Delete the associated payment record ----------- */
                    if (value.order.payment_id) {
                        await paymentModel.findByIdAndDelete(value.order.payment_id);
                    }
                })
            );

            /* ----------- Cancel admin discount if it was used ----------- */
            if (discountAdmin?.discount_id) {
                await cancelDiscount(discountAdmin.discount_id.toString());
            }

            /* ----------- Return first error ----------- */
            const firstError = failedOrders[0].reason;
            throw firstError;
        }

        /* ----------- Return all successful orders ----------- */
        const orders = successfulOrders.map(({ value }) => value.order);

        /* ----------- Delete checkout after successful order creation ----------- */
        try {
            await deleteCheckout({
                query: { user: userId }
            });
        } catch (error) {
            console.error('Failed to delete checkout after order creation:', error);
            // Don't throw error here as orders are already created successfully
        }

        return orders;
    }

    public async getOrderHistory({
        userId,
        status,
        page = 1,
        limit = 10,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc',
        paymentType,
        dateFrom,
        dateTo
    }: service.order.arguments.GetOrderHistory) {
        const query: any = { customer: userId };

        // Filter by status if provided
        if (status && status !== 'all') {
            query.order_status = status;
        }

        // Filter by payment type if provided
        if (paymentType) {
            query.payment_type = paymentType;
        }

        // Filter by date range if provided
        if (dateFrom || dateTo) {
            query.created_at = {};
            if (dateFrom) {
                query.created_at.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.created_at.$lte = new Date(dateTo);
            }
        }

        // Search functionality
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { customer_full_name: searchRegex },
                { customer_phone: searchRegex },
                { customer_email: searchRegex },
                { customer_address: searchRegex },
                { shop_name: searchRegex },
                { _id: searchRegex }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sortObj: any = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const [orders, totalCount] = await Promise.all([
            orderModel
                .find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean(),
            orderModel.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage,
                hasPrevPage
            }
        };
    }

    public async getOrderById({ userId, orderId }: service.order.arguments.GetOrderById) {
        /* ------------------- Find the order ------------------- */
        const order = await orderModel.findOne({
            _id: orderId,
            customer: userId
        }).lean();

        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        return order;
    }

    public async cancelOrder({ userId, orderId }: service.order.arguments.CancelOrder) {
        /* ------------------- Find the order ------------------- */
        const order = await findOneOrder({
            query: {
                customer: userId,
                _id: orderId
            },
            options: { lean: true }
        });

        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        /* ----------- Check if order can be cancelled ----------- */
        if (order.order_status !== OrderStatus.PENDING_PAYMENT && order.order_status !== OrderStatus.PENDING) {
            throw new BadRequestErrorResponse({
                message: 'Order cannot be cancelled at this stage!'
            });
        }

        /* ------------- Process refund for paid orders ------------- */
        let refundResult = null;

        // Only process refunds for orders that have a payment record
        if (order.payment_id) {
            const payment = await paymentModel.findById(order.payment_id);

            if (payment) {
                // Case 1: Order was actually paid (payment completed)
                if (order.payment_paid && payment.payment_status === 'completed') {
                    try {
                        console.log('🔄 Processing automatic refund for paid cancelled order:', orderId);

                        // Create refund for the full order amount
                        refundResult = await paymentService.createRefund({
                            paymentId: order.payment_id.toString(),
                            amount: order.price_to_payment,
                            reason: 'Order cancelled by customer',
                            notes: `Automatic refund for cancelled order #${orderId}`
                        });

                        console.log('✅ Refund created successfully:', refundResult.refundId);

                        // If payment method is VNPay, process the refund immediately
                        if (payment.payment_method === 'vnpay') {
                            try {
                                await paymentService.processVNPayRefund({
                                    paymentId: order.payment_id.toString(),
                                    refundId: refundResult.refundId,
                                    amount: order.price_to_payment
                                });
                                console.log('✅ VNPay refund processed successfully');
                            } catch (vnpayError) {
                                console.error('❌ VNPay refund processing failed:', vnpayError);
                                // Continue with order cancellation even if VNPay refund fails
                                // The refund status will be marked as failed and can be retried later
                            }
                        }

                    } catch (refundError) {
                        console.error('❌ Failed to create refund for cancelled order:', refundError);
                        // Continue with order cancellation even if refund creation fails
                        // This ensures the order can still be cancelled
                    }
                }
                // Case 2: Order was never paid (payment pending) - VNPay orders that were cancelled before payment
                else if (!order.payment_paid && payment.payment_status === 'pending' && payment.payment_method === 'vnpay') {
                    try {
                        console.log('🔄 Creating tracking refund for unpaid VNPay order:', orderId);

                        // Create a tracking refund record but don't process through VNPay
                        refundResult = await paymentService.createRefund({
                            paymentId: order.payment_id.toString(),
                            amount: order.price_to_payment,
                            reason: 'Order cancelled by customer (never paid)',
                            notes: `Tracking refund for cancelled order #${orderId} - no payment was processed`
                        });

                        // Immediately mark as completed since no actual payment was made
                        await paymentService.processVNPayRefund({
                            paymentId: order.payment_id.toString(),
                            refundId: refundResult.refundId,
                            amount: order.price_to_payment
                        });

                        console.log('✅ Tracking refund completed for unpaid order');

                    } catch (refundError) {
                        console.error('❌ Failed to create tracking refund:', refundError);
                        // Continue with order cancellation
                    }
                }
                // Case 3: COD orders - no refund needed since no payment was made
                else {
                    console.log('ℹ️ No refund needed for COD or unpaid order');
                }
            }
        }

        /* ------------- Revert inventory for products ------------- */
        await Promise.all(
            order.products_info.map(async ({ sku_id, quantity }) => {
                /* -------------------- Find inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_sku: sku_id },
                    select: ['_id']
                }).lean();

                if (inventory) {
                    /* ------------ Use pessimistic lock to revert inventory ------------ */
                    await pessimisticLock(
                        PessimisticKeys.INVENTORY,
                        inventory._id,
                        async () => await revertProductInventory(sku_id.toString(), quantity)
                    );
                }
            })
        );

        /* ------------- Cancel discounts if any ------------- */
        if (order.discount?.discount_id) {
            await cancelDiscount(order.discount.discount_id.toString());
        }

        if (order.shop_discount?.discount_id) {
            await cancelDiscount(order.shop_discount.discount_id.toString());
        }

        /* ------------- Update order status to cancelled ------------- */
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            {
                order_status: OrderStatus.CANCELLED,
                cancellation_reason: 'Cancelled by customer',
                cancelled_at: new Date()
            },
            { new: true }
        );

        if (!updatedOrder) {
            throw new NotFoundErrorResponse({ message: 'Failed to update order status!' });
        }

        // Return order with refund information
        return {
            ...updatedOrder.toObject(),
            refund_info: refundResult ? {
                refund_id: refundResult.refundId,
                refund_amount: order.price_to_payment,
                refund_status: 'pending'
            } : null
        };
    }

    public async getShopOrders({
        shopId,
        status,
        page = 1,
        limit = 10,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc',
        paymentType,
        dateFrom,
        dateTo
    }: service.order.arguments.GetShopOrders) {
        /* ----------- Find shop by user ID ----------- */
        const shop = await findShopByUser({
            userId: shopId,
            options: { lean: true }
        });

        if (!shop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found for this user!' });
        }

        const query: any = {
            shop_id: shop._id
        };

        // Filter by status if provided
        if (status && status !== 'all') {
            query.order_status = status;
        }

        // Filter by payment type if provided
        if (paymentType) {
            query.payment_type = paymentType;
        }

        // Filter by date range if provided
        if (dateFrom || dateTo) {
            query.created_at = {};
            if (dateFrom) {
                query.created_at.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.created_at.$lte = new Date(dateTo);
            }
        }

        // Search functionality
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { customer_full_name: searchRegex },
                { customer_phone: searchRegex },
                { customer_email: searchRegex },
                { customer_address: searchRegex },
                { _id: searchRegex }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sortObj: any = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const [orders, totalCount] = await Promise.all([
            orderModel
                .find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean(),
            orderModel.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage,
                hasPrevPage
            }
        };
    }

    public async approveOrder({ shopId, orderId }: service.order.arguments.ApproveOrder) {
        /* ----------- Find shop by user ID ----------- */
        const shop = await findShopByUser({
            userId: shopId,
            options: { lean: true }
        });

        if (!shop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found for this user!' });
        }

        /* ------------------- Find the order ------------------- */
        const order = await orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        /* ----------- Check if order belongs to shop ----------- */
        if (order.shop_id.toString() !== shop._id.toString()) {
            throw new BadRequestErrorResponse({
                message: 'This order does not belong to your shop!'
            });
        }

        /* ----------- Check if order can be approved ----------- */
        if (order.order_status !== OrderStatus.PENDING) {
            throw new BadRequestErrorResponse({
                message: 'Only pending orders can be approved!'
            });
        }

        /* ------------- Update order status to delivering ------------- */
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { order_status: OrderStatus.DELIVERING },
            { new: true }
        );

        return updatedOrder;
    }

    public async rejectOrder({ shopId, orderId, reason }: service.order.arguments.RejectOrder) {
        /* ----------- Find shop by user ID ----------- */
        const shop = await findShopByUser({
            userId: shopId,
            options: { lean: true }
        });

        if (!shop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found for this user!' });
        }

        /* ------------------- Find the order ------------------- */
        const order = await orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        /* ----------- Check if order belongs to shop ----------- */
        if (order.shop_id.toString() !== shop._id.toString()) {
            throw new BadRequestErrorResponse({
                message: 'This order does not belong to your shop!'
            });
        }

        /* ----------- Check if order can be rejected ----------- */
        if (order.order_status !== OrderStatus.PENDING) {
            throw new BadRequestErrorResponse({
                message: 'Only pending orders can be rejected!'
            });
        }

        /* ------------- Process refund for paid orders ------------- */
        let refundResult = null;

        // Only process refunds for orders that have a payment record
        if (order.payment_id) {
            const payment = await paymentModel.findById(order.payment_id);

            if (payment) {
                // Case 1: Order was actually paid (payment completed)
                if (order.payment_paid && payment.payment_status === 'completed') {
                    try {
                        console.log('🔄 Processing automatic refund for paid rejected order:', orderId);

                        // Create refund for the full order amount
                        refundResult = await paymentService.createRefund({
                            paymentId: order.payment_id.toString(),
                            amount: order.price_to_payment,
                            reason: 'Order rejected by shop',
                            notes: `Automatic refund for order rejected by shop. Reason: ${reason || 'No reason provided'}`
                        });

                        console.log('✅ Refund created successfully:', refundResult.refundId);

                        // If payment method is VNPay, process the refund immediately
                        if (payment.payment_method === 'vnpay') {
                            try {
                                await paymentService.processVNPayRefund({
                                    paymentId: order.payment_id.toString(),
                                    refundId: refundResult.refundId,
                                    amount: order.price_to_payment
                                });
                                console.log('✅ VNPay refund processed successfully');
                            } catch (vnpayError) {
                                console.error('❌ VNPay refund processing failed:', vnpayError);
                                // Continue with order rejection even if VNPay refund fails
                                // The refund status will be marked as failed and can be retried later
                            }
                        }

                    } catch (refundError) {
                        console.error('❌ Failed to create refund for rejected order:', refundError);
                        // Continue with order rejection even if refund creation fails
                        // This ensures the order can still be rejected
                    }
                }
                // Case 2: Order was never paid (payment pending) - VNPay orders that were rejected before payment
                else if (!order.payment_paid && payment.payment_status === 'pending' && payment.payment_method === 'vnpay') {
                    try {
                        console.log('🔄 Creating tracking refund for unpaid VNPay order:', orderId);

                        // Create a tracking refund record but don't process through VNPay
                        refundResult = await paymentService.createRefund({
                            paymentId: order.payment_id.toString(),
                            amount: order.price_to_payment,
                            reason: 'Order rejected by shop (never paid)',
                            notes: `Tracking refund for rejected order #${orderId} - no payment was processed. Reason: ${reason || 'No reason provided'}`
                        });

                        // Immediately mark as completed since no actual payment was made
                        await paymentService.processVNPayRefund({
                            paymentId: order.payment_id.toString(),
                            refundId: refundResult.refundId,
                            amount: order.price_to_payment
                        });

                        console.log('✅ Tracking refund completed for unpaid order');

                    } catch (refundError) {
                        console.error('❌ Failed to create tracking refund:', refundError);
                        // Continue with order rejection
                    }
                }
                // Case 3: COD orders - no refund needed since no payment was made
                else {
                    console.log('ℹ️ No refund needed for COD or unpaid order');
                }
            }
        }

        /* ------------- Revert inventory for products ------------- */
        await Promise.all(
            order.products_info.map(async ({ sku_id, quantity }) => {
                /* -------------------- Find inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_sku: sku_id },
                    select: ['_id']
                }).lean();

                if (inventory) {
                    /* ------------ Use pessimistic lock to revert inventory ------------ */
                    await pessimisticLock(
                        PessimisticKeys.INVENTORY,
                        inventory._id,
                        async () => await revertProductInventory(sku_id.toString(), quantity)
                    );
                }
            })
        );

        /* ------------- Cancel shop discount if any ------------- */
        if (order.shop_discount?.discount_id) {
            await cancelDiscount(order.shop_discount.discount_id.toString());
        }

        /* ------------- Update order status to cancelled ------------- */
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            {
                order_status: OrderStatus.CANCELLED,
                rejection_reason: reason || 'Order rejected by shop',
                rejected_at: new Date(),
                rejected_by_shop: true
            },
            { new: true }
        );

        if (!updatedOrder) {
            throw new NotFoundErrorResponse({ message: 'Failed to update order status!' });
        }

        // Return order with refund information
        return {
            ...updatedOrder.toObject(),
            refund_info: refundResult ? {
                refund_id: refundResult.refundId,
                refund_amount: order.price_to_payment,
                refund_status: 'pending'
            } : null
        };
    }

    public async completeOrder({ shopId, orderId }: service.order.arguments.CompleteOrder) {
        /* ----------- Find shop by user ID ----------- */
        const shop = await findShopByUser({
            userId: shopId,
            options: { lean: true }
        });

        if (!shop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found for this user!' });
        }

        /* ------------------- Find the order ------------------- */
        const order = await orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        /* ----------- Check if order belongs to shop ----------- */
        if (order.shop_id.toString() !== shop._id.toString()) {
            throw new BadRequestErrorResponse({
                message: 'This order does not belong to your shop!'
            });
        }

        /* ----------- Check if order can be completed ----------- */
        if (order.order_status !== OrderStatus.DELIVERING) {
            throw new BadRequestErrorResponse({
                message: 'Only orders with delivering status can be marked as completed!'
            });
        }

        /* ------------- Update order status to completed ------------- */
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            {
                order_status: OrderStatus.COMPLETED,
                completed_at: new Date()
            },
            { new: true }
        );

        if (!updatedOrder) {
            throw new NotFoundErrorResponse({ message: 'Failed to update order status!' });
        }

        return updatedOrder;
    }

    public async createOrderWithVNPay({ userId }: service.order.arguments.CreateOrderWithVNPay) {
        /* ------------------- Check user information  ------------------- */
        const user = await userModel.findById(userId);
        if (!user) throw new NotFoundErrorResponse({ message: 'User not found!' });

        /* ------------------ Check checkout info  ------------------ */
        const checkout = await findOneCheckout({ query: { user: userId } });
        if (!checkout) throw new NotFoundErrorResponse({ message: 'Not found checkout info!' });

        /* ------------------- Get shipping address  ------------------- */
        const shippingAddress = await findAddressById({
            id: checkout.ship_info,
            options: { lean: true, populate: 'location' }
        });
        if (!shippingAddress) throw new NotFoundErrorResponse({ message: 'Shipping address not found!' });

        // Type assertion for populated location
        const location = shippingAddress.location as any;
        if (!location) throw new NotFoundErrorResponse({ message: 'Shipping address not found!' });

        /* ---------- Validate shops exist ---------- */
        if (checkout.shops_info.length === 0) {
            throw new BadRequestErrorResponse({
                message: 'No shops found in checkout!'
            });
        }

        /* ------------- Check admin discount if exists ------------- */
        const discountAdmin = checkout.discount;
        if (discountAdmin?.discount_id) {
            await DiscountService.useDiscount({
                userId,
                discountId: discountAdmin.discount_id.toString(),
                discountCode: discountAdmin.discount_code
            });
        }

        /* ----------- Process each shop separately ----------- */
        const orderResults = await Promise.allSettled(
            checkout.shops_info.map(async (shopInfo) => {
                /* ------------------- Get shop information ------------------- */
                const shop = await findShopById({ id: shopInfo.shop_id, options: { lean: true } });
                if (!shop) throw new NotFoundErrorResponse({ message: `Shop ${shopInfo.shop_id} not found!` });

                /* ---------- Check product quantity in inventory  ---------- */
                const products = shopInfo.products_info.map((product) => ({
                    sku_id: product.id,
                    quantity: product.quantity,
                    product_name: product.name,
                    thumb: product.thumb,
                    price: product.price,
                    price_raw: product.price_raw
                }));

                /* ----------- Handle inventory for this shop ----------- */
                const inventoryResults = await Promise.allSettled(
                    products.map(async ({ sku_id, quantity }, index) => {
                        /* -------------------- Check inventory  -------------------- */
                        const inventory = await findOneInventory({
                            query: { inventory_sku: sku_id },
                            select: ['_id']
                        }).lean();
                        if (!inventory)
                            throw new NotFoundErrorResponse({ message: 'Not found inventory!' });

                        /* ------------ Check and handle inventory stock ------------ */
                        const orderedInventory = await pessimisticLock(
                            PessimisticKeys.INVENTORY,
                            inventory._id,
                            async () => await orderProductInventory(sku_id, quantity)
                        );
                        if (!orderedInventory) {
                            throw new BadRequestErrorResponse({
                                message: 'Product stock is not enough!',
                                hideOnProduction: true
                            });
                        }

                        return {
                            sku_id,
                            quantity,
                            index
                        };
                    })
                );

                /* ----------- Check if all inventory operations succeeded ----------- */
                const isInventorySuccessAll = inventoryResults.every((x) => x.status === 'fulfilled');
                if (!isInventorySuccessAll) {
                    /* ----------- Cleanup successfully ordered items ----------- */
                    const successfulInventoryResults = inventoryResults.filter(assertFulfilled);
                    const firstInventoryRejectMessage =
                        inventoryResults.find(assertRejected)?.reason || 'Some error when ordering!';

                    await Promise.all(
                        successfulInventoryResults.map(async ({ value }) => {
                            /* ----------------- Revert inventory stock ----------------- */
                            await revertProductInventory(value.sku_id, value.quantity);
                        })
                    );

                    throw firstInventoryRejectMessage;
                }

                /* --------------------- Check shop discount --------------------- */
                if (shopInfo.discount?.discount_id) {
                    await DiscountService.useDiscount({
                        userId,
                        discountCode: shopInfo.discount.discount_code,
                        discountId: shopInfo.discount.discount_id.toString()
                    });
                }

                /* ------------- Remove products from cart for this shop ------------- */
                await CartService.deleteProductsFromCart({
                    user: userId,
                    products: products.map((x) => x.sku_id)
                });

                /* ------------- Create payment record for this order ------------- */
                const paymentAmount = shopInfo.total_price_raw + shopInfo.fee_ship - shopInfo.total_discount_price;

                // Generate a temporary unique txn_ref
                const tempTxnRef = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                const payment = await paymentModel.create({
                    txn_ref: tempTxnRef, // Temporary unique value
                    amount: paymentAmount,
                    payment_method: 'vnpay',
                    payment_status: 'pending',
                    created_at: new Date(),
                    vnpay_data: {
                        amount: paymentAmount,
                        shop_name: shop.shop_name
                    }
                });

                /* ------------------ Create order for this shop ------------------ */
                const order = await orderModel.create({
                    /* ------------------------ Customer ------------------------ */
                    customer: userId,
                    customer_address: `${location.address}, ${location.ward?.ward_name ? location.ward.ward_name + ', ' : ''}${location.district.district_name}, ${location.province.province_name}`,
                    customer_avatar: user.user_avatar?.toString() || '',
                    customer_email: user.user_email,
                    customer_full_name: shippingAddress.recipient_name,
                    customer_phone: shippingAddress.recipient_phone,

                    /* -------------------------- Shop -------------------------- */
                    shop_id: shopInfo.shop_id,
                    shop_name: shop.shop_name,
                    shop_logo: shop.shop_logo,

                    /* ------------------------ Products ------------------------ */
                    products_info: products.map(product => ({
                        sku_id: product.sku_id,
                        product_name: product.product_name,
                        quantity: product.quantity,
                        thumb: product.thumb,
                        price: product.price,
                        price_raw: product.price_raw,
                        sku_variations: [] // Will be populated from SKU data if needed
                    })),

                    /* ------------------------ Shipping ------------------------ */
                    ship_info: checkout.ship_info,
                    fee_ship: shopInfo.fee_ship,
                    warehouses_info: shopInfo.warehouses_info || [],

                    /* ------------------------ Payment  ------------------------ */
                    payment_id: payment._id, // Link to payment record
                    payment_type: PaymentType.VNPAY,
                    payment_paid: false,
                    price_to_payment: paymentAmount,
                    price_total_raw: shopInfo.total_price_raw,
                    total_discount_price: shopInfo.total_discount_price,

                    /* ------------------------ Discount ------------------------ */
                    discount: discountAdmin,
                    shop_discount: shopInfo.discount,

                    /* ------------------------- Order  ------------------------- */
                    order_status: OrderStatus.PENDING_PAYMENT
                });

                /* ------------- Update payment record with order info ------------- */
                payment.txn_ref = payment._id.toString(); // Use payment ID as txnRef
                await payment.save();

                return {
                    shopId: shopInfo.shop_id,
                    order,
                    products
                };
            })
        );

        /* ----------- Handle results from all shops ----------- */
        const successfulOrders = orderResults.filter(assertFulfilled);
        const failedOrders = orderResults.filter(assertRejected);

        /* ----------- If some orders failed, cleanup successful ones ----------- */
        if (failedOrders.length > 0) {
            /* ----------- Revert successful orders ----------- */
            await Promise.all(
                successfulOrders.map(async ({ value }) => {
                    /* ----------- Revert inventory for successful orders ----------- */
                    await Promise.all(
                        value.products.map(async ({ sku_id, quantity }) => {
                            const inventory = await findOneInventory({
                                query: { inventory_sku: sku_id },
                                select: ['_id']
                            }).lean();

                            if (inventory) {
                                await pessimisticLock(
                                    PessimisticKeys.INVENTORY,
                                    inventory._id,
                                    async () => await revertProductInventory(sku_id, quantity)
                                );
                            }
                        })
                    );

                    /* ----------- Delete the created order ----------- */
                    await orderModel.findByIdAndDelete(value.order._id);

                    /* ----------- Delete the associated payment record ----------- */
                    if (value.order.payment_id) {
                        await paymentModel.findByIdAndDelete(value.order.payment_id);
                    }
                })
            );

            /* ----------- Cancel admin discount if it was used ----------- */
            if (discountAdmin?.discount_id) {
                await cancelDiscount(discountAdmin.discount_id.toString());
            }

            /* ----------- Return first error ----------- */
            const firstError = failedOrders[0].reason;
            throw firstError;
        }

        /* ----------- Return all successful orders ----------- */
        const orders = successfulOrders.map(({ value }) => value.order);

        /* ----------- Delete checkout after successful order creation ----------- */
        try {
            await deleteCheckout({
                query: { user: userId }
            });
        } catch (error) {
            console.error('Failed to delete checkout after order creation:', error);
            // Don't throw error here as orders are already created successfully
        }

        return orders;
    }

    public async createOrderWithVNPayPayment({
        userId,
        bankCode,
        ipAddr
    }: service.order.arguments.CreateOrderWithVNPayPayment) {
        /* ------------------- Create orders first ------------------- */
        const orders = await this.createOrderWithVNPay({ userId });

        /* ------------------- Calculate total amount ------------------- */
        const totalAmount = orders.reduce((sum, order) => sum + order.price_to_payment, 0);

        /* ------------------- Get first order for payment URL generation ------------------- */
        const firstOrder = orders[0];
        const orderInfo = orders.length === 1
            ? `Thanh toan don hang ${firstOrder._id}`
            : `Thanh toan ${orders.length} don hang`;

        /* ------------------- Create VNPay payment URL ------------------- */
        const paymentUrl = await PaymentService.createVNPayPaymentUrl({
            orderId: firstOrder._id.toString(),
            amount: totalAmount,
            orderInfo,
            ipAddr,
            bankCode
        });

        return {
            orders,
            paymentUrl: paymentUrl.paymentUrl,
            totalAmount,
            txnRef: paymentUrl.txnRef
        };
    }
})(); 