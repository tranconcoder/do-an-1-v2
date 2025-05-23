import { ShopStatus } from '@/enums/shop.enum.js';
import {
    findAllPendingShop,
    findOneAndUpdateShop,
    findShopById
} from '@/models/repository/shop/index.js';
import shopModel from '@/models/shop.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

export default new (class ShopService {
    /* ------------------------------------------------------ */
    /*                     Get all shops                      */
    /* ------------------------------------------------------ */

    /* ------------------------------------------------------ */
    /*                     Get a shop by id                   */
    /* ------------------------------------------------------ */

    /* ------------------------------------------------------ */
    /*                  Get pending shops                     */
    /* ------------------------------------------------------ */
    public async getPendingShops({ limit = 30, page = 1 }: service.shop.arguments.GetPendingShop) {
        return await findAllPendingShop({ limit, page });
    }

    /* ------------------------------------------------------ */
    /*                   Get shop by id                       */
    /* ------------------------------------------------------ */
    public async getShopById(shopId: string) {
        const shop = await findShopById({ id: shopId });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found' });
        return shop;
    }

    /* ------------------------------------------------------ */
    /*                   Approve shop                         */
    /* ------------------------------------------------------ */
    public async approveShop(shopId: string) {
        const shop = await findShopById({ id: shopId, options: { lean: true } });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found' });

        if (shop.shop_status !== ShopStatus.PENDING) {
            throw new BadRequestErrorResponse({
                message: `Cannot approve shop with status ${shop.shop_status}`
            });
        }

        // Update shop status to ACTIVE
        const updatedShop = await findOneAndUpdateShop({
            query: {
                _id: shopId,
                shop_status: ShopStatus.PENDING
            },
            update: {
                shop_status: ShopStatus.ACTIVE
            },
            options: { new: true, lean: true }
        });
        if (!updatedShop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found' });
        }

        return updatedShop;
    }

    /* ------------------------------------------------------ */
    /*                    Reject shop                         */
    /* ------------------------------------------------------ */
    public async rejectShop(shopId: string) {
        const shop = await findShopById({ id: shopId });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found' });

        if (shop.shop_status !== ShopStatus.PENDING) {
            throw new BadRequestErrorResponse({
                message: `Cannot reject shop with status ${shop.shop_status}`
            });
        }

        // Update shop status to REJECTED and store rejection reason
        const updatedShop = await findOneAndUpdateShop({
            query: {
                _id: shopId,
                shop_status: ShopStatus.PENDING
            },
            update: {
                shop_status: ShopStatus.INACTIVE
            },
            options: { new: true, lean: true }
        });
        if (!updatedShop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found' });
        }

        return updatedShop;
    }
})();
