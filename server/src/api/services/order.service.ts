/* -------------------------- Enum -------------------------- */
import { PessimisticKeys } from '@/enums/redis.enum.js';
import { OrderStatus } from '@/enums/order.enum.js';

/* ------------------------- Models ------------------------- */
import { findOneCheckout } from '@/models/repository/checkout/index.js';
import orderModel from '@/models/order.model.js';

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

export default new (class OrderService {
    public async createOrder({ userId, paymentType }: service.order.arguments.CreateOrder) {
        /* ------------------- Check information  ------------------- */
        const shipInfo = {
            // ...
        };
        if (!shipInfo) throw new NotFoundErrorResponse({ message: 'Not found ship info!' });

        /* ------------------ Check checkout info  ------------------ */
        const checkout = await findOneCheckout({ query: { user: userId } });
        if (!checkout) throw new NotFoundErrorResponse({ message: 'Not found checkout info!' });

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
        return await Promise.allSettled(
            shops.map(async ({ id, quantity, discount_id, discount_code }, index) => {
                /* -------------------- Check inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_product: id },
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
                console.log(
                    await CartService.deleteProductsFromCart({
                        user: userId,
                        products: shops.map((x) => x.id)
                    })
                );
            })
            .then(async () => {
                /* ------------------ Handle create order  ------------------ */
                return await orderModel.create({
                    /* ------------------------ Customer ------------------------ */
                    customer: userId,
                    customer_address: 'Viet nam',
                    customer_avatar: 'avatar-test.png',
                    customer_email: 'tranvanconkg@test.com',
                    customer_full_name: 'Tran Van Con',
                    customer_phone: '0327781160',

                    /* ------------------------ Payment  ------------------------ */
                    payment_type: paymentType,
                    payment_paid: false,
                    price_to_payment: checkout.total_checkout,
                    price_total_raw: checkout.total_price_raw,

                    /* ------------------------ Discount ------------------------ */
                    discount: discountAdmin,

                    /* ------------------------- Order  ------------------------- */
                    order_checkout: checkout,
                    order_status: OrderStatus.PENDING_PAYMENT
                });
            });
    }
})();
