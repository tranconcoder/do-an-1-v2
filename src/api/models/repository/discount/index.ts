import _ from 'lodash';
import discountModel from '../../discount.model';
import { convertToMongooseId } from '../../../utils/mongoose.util';

/* ---------------------------------------------------------- */
/*                           Common                           */
/* ---------------------------------------------------------- */
const queryCreate = async (data: modelTypes.discount.DiscountSchema) =>
    await discountModel.create(data);

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createDiscount = async (
    data: modelTypes.discount.DiscountSchema
) => {
    /* -------------------- Create discount  -------------------- */
    const discount = await queryCreate(data);

    return _.omit(discount.toObject(), [
        'is_admin_voucher',
        'created_at',
        'updated_at',
        '__v'
    ]);
};

/* ---------------------------------------------------------- */
/*                         Is exists                          */
/* ---------------------------------------------------------- */
export const isExistsDiscount = async (shop: string, code: string) => {
    return await discountModel.exists({
        discount_code: code,
        discount_shop: convertToMongooseId(shop)
    });
};

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const checkDiscountCodeIsValid = async (shop: string, code: string) => {
    return await discountModel.exists({
        discount_shop: shop,
        discount_code: code,
        discount_start_at: { $lte: new Date() },
        discount_end_at: { $gte: new Date() },
        is_available: true
    });
};

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */

/* ----------- Find all discount in shop by code ------------ */
export const checkConflictDiscountInShop = async ({
    discount_start_at,
    discount_end_at,
    ...payload
}: Pick<
    modelTypes.discount.DiscountSchema,
    'discount_shop' | 'discount_code' | 'discount_start_at' | 'discount_end_at'
>) => {
    return await discountModel
        .find({
            ...payload,
            is_available: true,
            $or: [
                /* --------- Check discount start at in payload time --------- */
                {
                    discount_start_at: {
                        $gte: discount_start_at,
                        $lte: discount_end_at
                    }
                },

                /* --------- Check discount end at in payload time  --------- */
                {
                    discount_end_at: {
                        $gte: discount_start_at,
                        $lte: discount_end_at
                    }
                },

                /* ---------- Time range payload contain discount  ---------- */
                {
                    discount_start_at: { $lte: discount_start_at },
                    discount_end_at: { $gte: discount_end_at }
                }
            ]
        })
        .lean();
};

/* ------ Find all discount publish available by shop  ------ */
export const findAllDiscountPublishAvailableByShop = async (shop: string) => {
    const date = new Date();

    return await discountModel.find({
        discount_shop: shop,
        is_publish: true,
        is_available: true,
        discount_start_at: { $lte: date },
        discount_end_at: { $gte: date }
    });
};
