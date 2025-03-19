import { PessimisticKeys } from '../enums/redis.enum.js';
import { findOneCheckout } from '../models/repository/checkout/index.js';
import { findOneInventory, orderProductInventory } from '../models/repository/inventory/index.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '../response/error.response.js';
import { pessimisticLock } from './redis.service.js';
import _ from 'lodash';
import DiscountService from './discount.service.js';

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
                    ..._.pick(x, ['id', 'quantity']),
                    ..._.pick(shop.discount, ['discount_code', 'discount_id'])
                }))
            );

        /* ------------- Check admin discount if exists ------------- */
        await Promise.allSettled(
            shops.map(async ({ id, quantity, discount_id, discount_code }) => {
                /* -------------------- Check inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_product: id },
                    select: ['_id']
                }).lean();
                if (!inventory) throw new NotFoundErrorResponse('Not found inventory!');

                /* ----------------- Check inventory stock  ----------------- */
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
            })
        );
    }
})();
