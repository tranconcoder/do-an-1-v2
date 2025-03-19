import { PessimisticKeys } from '../enums/redis.enum.js';
import { findOneCheckout } from '../models/repository/checkout/index.js';
import { findOneInventory, orderProductInventory } from '../models/repository/inventory/index.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '../response/error.response.js';
import { pessimisticLock } from './redis.service.js';
import _ from 'lodash';

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
        const productIds = checkout.shops_info.flatMap((shop) =>
            shop.products_info.map((x) => _.pick(x, ['id', 'quantity']))
        );
        await Promise.all(
            productIds.map(async ({ id, quantity }) => {
                /* -------------------- Check inventory  -------------------- */
                const inventory = await findOneInventory({
                    query: { inventory_product: id },
                    select: ['_id', 'inventory_stock']
                }).lean();
                if (!inventory) throw new NotFoundErrorResponse('Not found inventory!');

                /* ----------------- Check inventory stock  ----------------- */
                const orderedInventory = await pessimisticLock(
                    PessimisticKeys.INVENTORY_STOCK,
                    inventory._id,
                    async () => {
                        return await orderProductInventory(id, quantity);
                    }
                );
                if (!orderedInventory) {
                    throw new BadRequestErrorResponse('Product stock is not enough!', true);
                }

                /* --------------------- Check discount --------------------- */
            })
        );
    }
})();
