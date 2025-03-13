import _ from 'lodash';
import discountModel from '../../discount.model';
import {
    convertToMongooseId,
    generateFindAllPageSplit
} from '../../../utils/mongoose.util';

/* ---------------------------------------------------------- */
/*                           Common                           */
/* ---------------------------------------------------------- */
const queryCreate = async (data: repoTypes.discount.arguments.QueryCreate) => {
    return await discountModel.create(data);
};

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createDiscount = async (
    data: repoTypes.discount.arguments.QueryCreate
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

/* --------------- Check discount own by shop --------------- */
export const checkDiscountOwnByShop = async ({
    _id,
    discount_shop
}: repoTypes.discount.arguments.CheckDiscountOwnByShop) => {
    return await discountModel.exists({
        _id,
        discount_shop
    });
};

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const findDiscountById = async (discountId: string) => {
    return await discountModel.findById(discountId).lean();
};

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */

/* ------------------- Find all discount  ------------------- */
export const findAllDiscount =
    generateFindAllPageSplit<modelTypes.discount.DiscountSchema>(discountModel);

/* ----------- Find all discount in shop by code ------------ */
export const checkConflictDiscountInShop = async ({
    discount_start_at,
    discount_end_at,
    discount_code,
    discount_shop
}: repoTypes.discount.arguments.CheckConflictDiscountInShop) => {
    return await discountModel
        .findOne({
            discount_code,
            discount_shop,
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

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const deleteDiscount = async (id: string) => {
    const { deletedCount } = await discountModel.deleteOne({ _id: id });

    return deletedCount > 0;
};
