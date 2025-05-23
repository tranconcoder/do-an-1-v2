import { ShopStatus } from '@/enums/shop.enum.js';
import shopModel from '@/models/shop.model.js';
import {
    generateFindAll,
    generateFindAllPaganation,
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';
import { jwtPayloadSignSchema } from '@/validations/joi/jwt.joi.js';

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

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
/* ------------------------ Find one ------------------------ */
export const findOneShop = generateFindOne<model.shop.ShopSchema>(shopModel);

/* ----------------------- Find by id ----------------------- */
export const findShopById = generateFindById<model.shop.ShopSchema>(shopModel);

/* -------------------- Find shop by user ------------------- */
export const findShopByUser = 
async (args: repo.shop.FindShopByUser) => {
    const { userId, ...payload } = args

    return await findOneShop({
        ...payload,
        query: {            shop_userId: userId,
        }
    })

}

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
export const findShop = generateFindAll<model.shop.ShopSchema>(shopModel);

export const findShopPageSplit = generateFindAllPaganation<model.shop.ShopSchema>(shopModel);

export const findAllPendingShop = async ({
    omit = [],
    ...payload
}: repo.shop.FindPendingShop<model.shop.ShopSchema>) => {
    return await findShopPageSplit({
        ...payload,
        query: { shop_status: ShopStatus.PENDING },
        only: [
            '_id',
            'shop_userId',
            'shop_email',
            'shop_phoneNumber',
            'shop_name',
            'shop_type',
            'shop_logo',
            'shop_location',
            'shop_owner_fullName',
            'shop_owner_email',
            'shop_status',
            'is_brand'
        ]
    });
};

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const findOneAndUpdateShop = generateFindOneAndUpdate<model.shop.ShopSchema>(shopModel);
