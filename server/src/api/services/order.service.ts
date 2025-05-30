/* -------------------------- Enum -------------------------- */
import { PessimisticKeys } from '@/enums/redis.enum.js';
import { OrderStatus } from '@/enums/order.enum.js';

/* ------------------------- Models ------------------------- */
import { findOneCheckout } from '@/models/repository/checkout/index.js';
import orderModel from '@/models/order.model.js';
import { userModel } from '@/models/user.model.js';
import { findAddressById } from '@/models/repository/address/index.js';

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
        const location = shippingAddress.location as any;
        if (!location) throw new NotFoundErrorResponse({ message: 'Shipping address not found!' });

        /* ---------- Check product quantity in inventory  ---------- */
        const shops = checkout.shops_info.flatMap((shop) =>
            shop.products_info.map((x) => ({
                discount_code: '',
                discount_id: '',
                ..._.pick(x, ['id', 'quantity']),
                ..._.pick(shop.discount, ['discount_code', 'discount_id'])
            }))
        );

        /* ------------- Check admin discount if exists ------------- */
        const discountAdmin = checkout.discount;
        if (discountAdmin?.discount_id) {
            await DiscountService.useDiscount({
                userId,
                discountId: discountAdmin.discount_id.toString(),
                discountCode: discountAdmin.discount_code
            });
        }

        /* ----------- Handle inventory and shop discount ----------- */
        console.log("SHOPS", shops)
        return await Promise.allSettled(
            shops.map(async ({ id, quantity, discount_id, discount_code }, index) => {
                /* -------------------- Check inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_sku: id },
                    select: ['_id']
                }).lean();
                if (!inventory)
                    throw new NotFoundErrorResponse({ message: 'Not found inventory!' });

                /* ------------ Check and handle inventory stock ------------ */
                const orderedInventory = await pessimisticLock(
                    PessimisticKeys.INVENTORY,
                    inventory._id,
                    async () => await orderProductInventory(id, quantity)
                );
                if (!orderedInventory) {
                    throw new BadRequestErrorResponse({
                        message: 'Product stock is not enough!',
                        hideOnProduction: true
                    });
                }

                /* --------------------- Check discount --------------------- */
                await DiscountService.useDiscount({
                    userId,
                    discountCode: discount_code?.toString() || '',
                    discountId: discount_id?.toString() || ''
                });

                return {
                    productId: id,
                    quantity,
                    discountCode: discount_code,
                    discountId: discount_id,
                    index
                };
            })
        )
            .then(async (results) => {
                const isSuccessAll = results.every((x) => x.status === 'fulfilled');
                if (isSuccessAll) return Promise.resolve(); // Move to next then

                /* ----------- Otherwise cleanup successfully item ----------- */
                const successfullyResults = results.filter(assertFulfilled);
                const firstRejectMessage =
                    results.find(assertRejected)?.reason || 'Some error when ordering!';

                await Promise.all(
                    successfullyResults.map(async ({ value }) => {
                        /* ----------------- Revert inventory stock ----------------- */
                        await revertProductInventory(value.productId, value.quantity);

                        /* -------------------- Revert discount  -------------------- */
                        await cancelDiscount(value.discountId);
                    })
                );

                /* ------------- Return first error to frontend ------------- */
                return Promise.reject(firstRejectMessage);
            })
            .then(async () => {
                /* ------------- Remove product ordered in cart ------------- */
                console.log("1")
                console.log(
                    await CartService.deleteProductsFromCart({
                        user: userId,
                        products: shops.map((x) => x.id)
                    })
                );
                console.log("2")
            })
            .then(async () => {
                /* ------------------ Handle create order  ------------------ */
                return await orderModel.create({
                    /* ------------------------ Customer ------------------------ */
                    customer: userId,
                    customer_address: `${location.address}, ${location.ward?.ward_name ? location.ward.ward_name + ', ' : ''}${location.district.district_name}, ${location.province.province_name}`,
                    customer_avatar: user.user_avatar?.toString() || '',
                    customer_email: user.user_email,
                    customer_full_name: shippingAddress.recipient_name,
                    customer_phone: shippingAddress.recipient_phone,

                    /* ------------------------ Payment  ------------------------ */
                    payment_type: paymentType,
                    payment_paid: false,
                    price_to_payment: checkout.total_checkout,
                    price_total_raw: checkout.total_price_raw,

                    /* ------------------------ Discount ------------------------ */
                    discount: discountAdmin,

                    /* ------------------------- Order  ------------------------- */
                    order_checkout: checkout,
                    order_status:
                        paymentType === PaymentType.COD ?
                            OrderStatus.PENDING :
                            OrderStatus.PENDING_PAYMENT
                });
            });
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
        const shops = order.order_checkout.shops_info.flatMap((shop) =>
            shop.products_info.map((product) => ({
                id: product.id,
                quantity: product.quantity
            }))
        );

        await Promise.all(
            shops.map(async ({ id, quantity }) => {
                /* -------------------- Find inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_sku: id },
                    select: ['_id']
                }).lean();

                if (inventory) {
                    /* ------------ Use pessimistic lock to revert inventory ------------ */
                    await pessimisticLock(
                        PessimisticKeys.INVENTORY,
                        inventory._id,
                        async () => await revertProductInventory(id, quantity)
                    );
                }
            })
        );

        /* ------------- Cancel discounts if any ------------- */
        if (order.discount?.discount_id) {
            await cancelDiscount(order.discount.discount_id.toString());
        }

        // Cancel shop discounts
        await Promise.all(
            order.order_checkout.shops_info.map(async (shop) => {
                if (shop.discount?.discount_id) {
                    await cancelDiscount(shop.discount.discount_id);
                }
            })
        );

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
        const query: any = {
            'order_checkout.shops_info.shop_id': shopId
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
        /* ------------------- Find the order ------------------- */
        const order = await orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        /* ----------- Check if order belongs to shop ----------- */
        const orderBelongsToShop = order.order_checkout.shops_info.some(
            shop => shop.shop_id === shopId
        );

        if (!orderBelongsToShop) {
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
        /* ------------------- Find the order ------------------- */
        const order = await orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        /* ----------- Check if order belongs to shop ----------- */
        const orderBelongsToShop = order.order_checkout.shops_info.some(
            shop => shop.shop_id === shopId
        );

        if (!orderBelongsToShop) {
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
        const shopProducts = order.order_checkout.shops_info
            .filter(shop => shop.shop_id === shopId)
            .flatMap(shop => shop.products_info.map(product => ({
                id: product.id,
                quantity: product.quantity
            })));

        await Promise.all(
            shopProducts.map(async ({ id, quantity }) => {
                /* -------------------- Find inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_sku: id },
                    select: ['_id']
                }).lean();

                if (inventory) {
                    /* ------------ Use pessimistic lock to revert inventory ------------ */
                    await pessimisticLock(
                        PessimisticKeys.INVENTORY,
                        inventory._id,
                        async () => await revertProductInventory(id, quantity)
                    );
                }
            })
        );

        /* ------------- Cancel shop discounts if any ------------- */
        const shopInfo = order.order_checkout.shops_info.find(shop => shop.shop_id === shopId);
        if (shopInfo?.discount?.discount_id) {
            await cancelDiscount(shopInfo.discount.discount_id);
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
})();
