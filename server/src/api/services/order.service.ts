/* -------------------------- Enum -------------------------- */
import { PessimisticKeys } from '@/enums/redis.enum.js';
import { OrderStatus } from '@/enums/order.enum.js';

/* ------------------------- Models ------------------------- */
import { findOneCheckout, deleteCheckout } from '@/models/repository/checkout/index.js';
import orderModel from '@/models/order.model.js';
import { userModel } from '@/models/user.model.js';
import { findAddressById } from '@/models/repository/address/index.js';
import { findShopById, findShopByUser } from '@/models/repository/shop/index.js';

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

/* ------------------------- Utils  ------------------------- */
import { assertFulfilled, assertRejected, sleep } from '@/utils/promise.util.js';

import _ from 'lodash';
import CartService from './cart.service.js';
import { PaymentType } from '@/enums/payment.enum.js';
import { findOneOrder } from '@/models/repository/order/index.js';

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
            { order_status: OrderStatus.CANCELLED },
            { new: true }
        );

        return updatedOrder;
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
                rejection_reason: reason || 'Order rejected by shop'
            },
            { new: true }
        );

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

                    /* ------------------------ Payment  ------------------------ */
                    payment_type: PaymentType.VNPAY,
                    payment_paid: false,
                    price_to_payment: shopInfo.total_price_raw + shopInfo.fee_ship - shopInfo.total_discount_price,
                    price_total_raw: shopInfo.total_price_raw,
                    total_discount_price: shopInfo.total_discount_price,

                    /* ------------------------ Discount ------------------------ */
                    discount: discountAdmin,
                    shop_discount: shopInfo.discount,

                    /* ------------------------- Order  ------------------------- */
                    order_status: OrderStatus.PENDING_PAYMENT
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
})();
