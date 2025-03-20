import { PessimisticKeys } from '../enums/redis.enum.js';
import { findOneCheckout } from '../models/repository/checkout/index.js';
import {
    findOneInventory,
    orderProductInventory,
    revertProductInventory
} from '../models/repository/inventory/index.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '../response/error.response.js';
import { pessimisticLock } from './redis.service.js';
import _ from 'lodash';
import DiscountService from './discount.service.js';
import { assertFulfilled, assertRejected } from '../utils/promise.util.js';
import { cancelDiscount } from '../models/repository/discount/index.js';

export default new (class OrderService {
    public async createOrder({ userId }: serviceTypes.order.arguments.CreateOrder) {
        /* ------------------- Check information  ------------------- */
        const shipInfo = {
            // ...
        };
        if (!shipInfo) throw new NotFoundErrorResponse('Not found ship info!');

        /* ------------------ Check checkout info  ------------------ */
        const checkout = await findOneCheckout({ query: { user: userId } });
        if (!checkout) throw new NotFoundErrorResponse('Not found checkout info!');

        /* ---------- Check product quantity in inventory  ---------- */
        const shops = checkout.shops_info
            .filter((x) => x.discount)
            .flatMap((shop) =>
                shop.products_info.map((x) => ({
                    discount_code: '',
                    discount_id: '',
                    ..._.pick(x, ['id', 'quantity']),
                    ..._.pick(shop.discount, ['discount_code', 'discount_id'])
                }))
            );

        /* ------------- Check admin discount if exists ------------- */
        return await Promise.allSettled(
            shops.map(async ({ id, quantity, discount_id, discount_code }, index) => {
                /* -------------------- Check inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_product: id },
                    select: ['_id']
                }).lean();
                if (!inventory) throw new NotFoundErrorResponse('Not found inventory!');

                /* ------------ Check and handle inventory stock ------------ */
                const orderedInventory = await pessimisticLock(
                    PessimisticKeys.INVENTORY,
                    inventory._id,
                    async () => await orderProductInventory(id, quantity)
                );
                if (!orderedInventory) {
                    throw new BadRequestErrorResponse('Product stock is not enough!', true);
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
        ).then(async (results) => {
            const isSuccessAll = results.every((x) => x.status === 'fulfilled');
            if (isSuccessAll) {
                return; // ....
            }

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
        });
    }
})();
