"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clothesModel = exports.CLOTHES_COLLECTION_NAME = exports.CLOTHES_MODEL_NAME = exports.phoneModel = exports.PHONE_COLLECTION_NAME = exports.PHONE_MODEL_NAME = exports.productModel = exports.PRODUCT_COLLECTION_NAME = exports.PRODUCT_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_config_1 = require("../../configs/mongoose.config");
const user_model_1 = require("./user.model");
const product_middleware_1 = require("./middlewares/product.middleware");
const product_enum_1 = require("../enums/product.enum");
const PRODUCT_SHOP_FIELD = {
    product_shop: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: mongoose_config_1.required,
        ref: user_model_1.USER_MODEL_NAME
    }
};
/* ------------------------------------------------------ */
/*                        Product                         */
/* ------------------------------------------------------ */
exports.PRODUCT_MODEL_NAME = 'Product';
exports.PRODUCT_COLLECTION_NAME = 'products';
const productSchema = new mongoose_1.Schema({
    ...PRODUCT_SHOP_FIELD,
    product_name: { type: String, required: mongoose_config_1.required },
    product_cost: { type: Number, required: mongoose_config_1.required },
    product_thumb: { type: String, required: mongoose_config_1.required },
    product_quantity: { type: Number, required: mongoose_config_1.required },
    product_description: { type: String, required: mongoose_config_1.required },
    product_category: {
        type: String,
        enum: product_enum_1.CategoryEnum,
        required: mongoose_config_1.required
    },
    product_rating_avg: {
        default: 0,
        type: Number,
        min: 0,
        max: 5,
        set: (v) => Math.round(v * 100) / 100
    },
    product_slug: { type: String, default: '' },
    product_attributes: { type: mongoose_1.Schema.Types.Mixed, required: mongoose_config_1.required },
    is_draft: { type: Boolean, default: true, select: false },
    is_publish: { type: Boolean, default: false, select: false }
}, {
    collection: exports.PRODUCT_COLLECTION_NAME,
    timestamps: mongoose_config_1.timestamps
});
// Create index to search product
productSchema.index({
    product_name: 'text',
    product_description: 'text',
    product_category: 'text'
});
// Create slug for product
productSchema.pre('save', product_middleware_1.addSlug);
exports.productModel = (0, mongoose_1.model)(exports.PRODUCT_MODEL_NAME, productSchema);
/* ------------------------------------------------------ */
/*                         Phone                          */
/* ------------------------------------------------------ */
exports.PHONE_MODEL_NAME = product_enum_1.CategoryEnum.Phone;
exports.PHONE_COLLECTION_NAME = 'phone';
const phoneSchema = new mongoose_1.Schema({
    ...PRODUCT_SHOP_FIELD,
    phone_processor: { type: String, required: mongoose_config_1.required },
    phone_memory: { type: String, required: mongoose_config_1.required },
    phone_storage: { type: Number, required: mongoose_config_1.required },
    phone_color: { type: String, required: mongoose_config_1.required },
    phone_battery: {
        capacity: { type: Number, required: mongoose_config_1.required },
        battery_techology: { type: String, required: mongoose_config_1.required },
        charge_technology: String
    },
    phone_warranty: { type: String, required: mongoose_config_1.required },
    phone_camera: {
        front: String,
        back: String
    },
    phone_screen: {
        size: { type: Number, required: mongoose_config_1.required },
        resolution: {
            width: { type: Number, required: mongoose_config_1.required },
            height: { type: Number, required: mongoose_config_1.required }
        },
        max_brightness: { type: Number },
        technology: { type: String, required: mongoose_config_1.required },
        refresh_rate: Number
    },
    phone_connectivity: {
        sim_count: { type: Number, required: mongoose_config_1.required },
        network: { type: String, required: mongoose_config_1.required },
        usb: { type: String, required: mongoose_config_1.required },
        wifi: String,
        bluetooth: String,
        gps: String
    },
    phone_special_features: { type: [String], default: [] },
    phone_material: { type: String, required: mongoose_config_1.required },
    phone_weight: { type: Number, required: mongoose_config_1.required },
    phone_brand: { type: String, required: mongoose_config_1.required },
    is_smartphone: { type: Boolean, default: true }
}, {
    collection: exports.PHONE_COLLECTION_NAME,
    timestamps: mongoose_config_1.timestamps
});
exports.phoneModel = (0, mongoose_1.model)(exports.PHONE_MODEL_NAME, phoneSchema);
/* ------------------------------------------------------ */
/*                        Clothes                         */
/* ------------------------------------------------------ */
exports.CLOTHES_MODEL_NAME = product_enum_1.CategoryEnum.Clothes;
exports.CLOTHES_COLLECTION_NAME = 'clothes';
const clothesSchema = new mongoose_1.Schema({
    ...PRODUCT_SHOP_FIELD,
    size: { type: String, required: mongoose_config_1.required },
    color: { type: String, required: mongoose_config_1.required }
}, {
    collection: exports.CLOTHES_COLLECTION_NAME,
    timestamps: mongoose_config_1.timestamps
});
exports.clothesModel = (0, mongoose_1.model)(exports.CLOTHES_MODEL_NAME, clothesSchema);
