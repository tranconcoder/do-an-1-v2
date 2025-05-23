import _ from 'lodash';
import discountModel from '@/models/discount.model.js';
import {
    convertToMongooseId,
    generateFindAllPaganation,
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate,
    generateUpdateAll
} from '@/utils/mongoose.util.js';
import { ProjectionType } from 'mongoose';
import discountUsedModel from '@/models/discountUsed.model.js';
import { pessimisticLock } from '@/services/redis.service.js';
import { PessimisticKeys } from '@/enums/redis.enum.js';

/* ---------------------------------------------------------- */
/*                           Common                           */
/* ---------------------------------------------------------- */
const queryCreate = async (data: repo.discount.arguments.QueryCreate) => {
    return await discountModel.create(data);
};

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createDiscount = async (data: repo.discount.arguments.QueryCreate) => {
    /* -------------------- Create discount  -------------------- */
    const discount = await queryCreate(data);

    return _.omit(discount.toObject(), ['is_admin_voucher', 'created_at', 'updated_at', '__v']);
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
export const findOneAndUpdateDiscount =
    generateFindOneAndUpdate<model.discount.DiscountSchema>(discountModel);

export const findOneDiscount = generateFindOne<model.discount.DiscountSchema>(discountModel);

/* ------------------ Find discount by id ------------------ */
export const findDiscountById = generateFindById<model.discount.DiscountSchema>(discountModel);

/* ----------------- Find discount by code  ----------------- */
export const findDiscountByCode = async (discountCode: string) => {
    return await discountModel.findOne({ discount_code: discountCode }).lean();
};

/* -------------- Find discount valid by code  -------------- */
export const findDiscountValidByCode = (discountCode: string) => {
    return findOneDiscount({
        query: {
            discount_code: discountCode,
            is_available: true,
            discount_start_at: { $lte: new Date() },
            discount_end_at: { $gte: new Date() },
            $or: [
                { discount_count: null },
                {
                    $expr: {
                        $lt: ['discount_used_count', 'discount_count']
                    }
                }
            ]
        },
        projection: '+is_admin_voucher +is_apply_all_product'
    });
};

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */

/* ------------------- Find all discount  ------------------- */
export const findDiscountPageSplitting =
    generateFindAllPaganation<model.discount.DiscountSchema>(discountModel);

/* ----------- Find all discount in shop by code ------------ */
export const checkConflictDiscountInShop = async ({
    discount_start_at,
    discount_end_at,
    discount_code,
    discount_shop
}: repo.discount.arguments.CheckConflictDiscountInShop) => {
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
export const updateManyDiscount = generateUpdateAll(discountModel);

/* -------------------- Cancel discount  -------------------- */
export const cancelDiscount = async (discountId: moduleTypes.mongoose.ObjectId) => {
    return await Promise.all([
        pessimisticLock(PessimisticKeys.DISCOUNT, discountId.toString(), async () =>
            findOneAndUpdateDiscount({
                query: { _id: discountId },
                update: {
                    $inc: { discount_used_count: -1 }
                }
            })
        ),
        discountUsedModel.deleteOne({ discount_used_discount: discountId })
    ]);
};

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const deleteDiscount = async (id: string) => {
    const { deletedCount } = await discountModel.deleteOne({ _id: id });

    return deletedCount > 0;
};
