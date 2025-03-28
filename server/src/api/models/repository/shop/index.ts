import shopModel from '@/models/shop.model.js';
import { generateFindById, generateFindOne } from '@/utils/mongoose.util.js';

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
