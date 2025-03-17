"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscount = exports.updateManyDiscount = exports.findAllDiscountPublishAvailableByShop = exports.checkConflictDiscountInShop = exports.findAllDiscount = exports.findDiscountById = exports.isExistsDiscount = exports.createDiscount = void 0;
const lodash_1 = __importDefault(require("lodash"));
const discount_model_1 = __importDefault(require("../../discount.model"));
const mongoose_util_1 = require("../../../utils/mongoose.util");
/* ---------------------------------------------------------- */
/*                           Common                           */
/* ---------------------------------------------------------- */
const queryCreate = async (data) => {
    return await discount_model_1.default.create(data);
};
/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
const createDiscount = async (data) => {
    /* -------------------- Create discount  -------------------- */
    const discount = await queryCreate(data);
    return lodash_1.default.omit(discount.toObject(), [
        'is_admin_voucher',
        'created_at',
        'updated_at',
        '__v'
    ]);
};
exports.createDiscount = createDiscount;
/* ---------------------------------------------------------- */
/*                         Is exists                          */
/* ---------------------------------------------------------- */
const isExistsDiscount = async (shop, code) => {
    return await discount_model_1.default.exists({
        discount_code: code,
        discount_shop: (0, mongoose_util_1.convertToMongooseId)(shop)
    });
};
exports.isExistsDiscount = isExistsDiscount;
/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
const findDiscountById = async (discountId, projection = {}) => {
    return await discount_model_1.default.findById(discountId, projection).lean();
};
exports.findDiscountById = findDiscountById;
/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
/* ------------------- Find all discount  ------------------- */
exports.findAllDiscount = (0, mongoose_util_1.generateFindAllPageSplit)(discount_model_1.default);
/* ----------- Find all discount in shop by code ------------ */
const checkConflictDiscountInShop = async ({ discount_start_at, discount_end_at, discount_code, discount_shop }) => {
    return await discount_model_1.default
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
exports.checkConflictDiscountInShop = checkConflictDiscountInShop;
/* ------ Find all discount publish available by shop  ------ */
const findAllDiscountPublishAvailableByShop = async (shop) => {
    const date = new Date();
    return await discount_model_1.default.find({
        discount_shop: shop,
        is_publish: true,
        is_available: true,
        discount_start_at: { $lte: date },
        discount_end_at: { $gte: date }
    });
};
exports.findAllDiscountPublishAvailableByShop = findAllDiscountPublishAvailableByShop;
/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
exports.updateManyDiscount = (0, mongoose_util_1.generateUpdateAll)(discount_model_1.default);
/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
const deleteDiscount = async (id) => {
    const { deletedCount } = await discount_model_1.default.deleteOne({ _id: id });
    return deletedCount > 0;
};
exports.deleteDiscount = deleteDiscount;
