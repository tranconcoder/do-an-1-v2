import { ShopStatus } from '@/enums/shop.enum.js';
import shopModel from '@/models/shop.model.js';
import {
    generateFindAll,
    generateFindAllPageSplit,
    generateFindById,
    generateFindOne
} from '@/utils/mongoose.util.js';

export const isExistsShop = async ({
    shop_certificate,
    shop_email,
    shop_name,
    shop_owner_cardID,
    shop_phoneNumber
}: repo.shop.IsExists) => {
    return await shopModel
        .findOne({
            $or: [
                { shop_certificate },
                { shop_email },
                { shop_name },
                { shop_owner_cardID },
                { shop_phoneNumber }
            ]
        })
        .lean();
};

/* ------------------------ Find one ------------------------ */
export const findOneShop = generateFindOne<model.shop.ShopSchema>(shopModel);

/* ----------------------- Find by id ----------------------- */
export const findShopById = generateFindById<model.shop.ShopSchema>(shopModel);

/* ------------------------ Find all ------------------------ */
export const findShop = generateFindAll<model.shop.ShopSchema>(shopModel);

export const findShopPageSplit = generateFindAllPageSplit<model.shop.ShopSchema>(shopModel);

export const findAllPendingShop = async (
    payload: repo.shop.FindPendingShop<model.shop.ShopSchema>
) => {
    return await findShopPageSplit({
        ...payload,
        query: {
            shop_status: ShopStatus.PENDING,
            is_deleted: false
        },
        omit: ['__v', 'is_deleted', ...(payload.omit as any)] as any
    });
};
