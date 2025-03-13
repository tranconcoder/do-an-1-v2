import { Schema, model } from 'mongoose';
import { required, timestamps } from '../../configs/mongoose.config';
import { USER_MODEL_NAME } from './user.model';
import { addSlug } from './middlewares/product.middleware';
import { CategoryEnum } from '../enums/product.enum';

const PRODUCT_SHOP_FIELD = {
    product_shop: {
        type: Schema.Types.ObjectId,
        required,
        ref: USER_MODEL_NAME
    }
};

/* ------------------------------------------------------ */
/*                        Product                         */
/* ------------------------------------------------------ */
export const PRODUCT_MODEL_NAME = 'Product';
export const PRODUCT_COLLECTION_NAME = 'products';

const productSchema = new Schema<modelTypes.product.ProductSchema, true>(
    {
        ...PRODUCT_SHOP_FIELD,
        product_name: { type: String, required },
        product_cost: { type: Number, required },
        product_thumb: { type: String, required },
        product_quantity: { type: Number, required },
        product_description: { type: String, required },
        product_category: {
            type: String,
            enum: CategoryEnum,
            required
        },
        product_rating_avg: {
            default: 0,
            type: Number,
            min: 0,
            max: 5,
            set: (v: number) => Math.round(v * 100) / 100
        },
        product_slug: { type: String, default: '' },
        product_attributes: { type: Schema.Types.Mixed, required },
        is_draft: { type: Boolean, default: true, select: false },
        is_publish: { type: Boolean, default: false, select: false }
    },
    {
        collection: PRODUCT_COLLECTION_NAME,
        timestamps
    }
);
// Create index to search product
productSchema.index({
    product_name: 'text',
    product_description: 'text',
    product_category: 'text'
});

// Create slug for product
productSchema.pre('save', addSlug);

export const productModel = model(PRODUCT_MODEL_NAME, productSchema);

/* ------------------------------------------------------ */
/*                         Phone                          */
/* ------------------------------------------------------ */
export const PHONE_MODEL_NAME = CategoryEnum.Phone;
export const PHONE_COLLECTION_NAME = 'phone';

const phoneSchema = new Schema<modelTypes.product.PhoneSchema>(
    {
        ...PRODUCT_SHOP_FIELD,
        phone_processor: { type: String, required },
        phone_memory: { type: String, required },
        phone_storage: { type: Number, required },
        phone_color: { type: String, required },
        phone_battery: {
            capacity: { type: Number, required },
            battery_techology: { type: String, required },
            charge_technology: String
        },
        phone_warranty: { type: String, required },
        phone_camera: {
            front: String,
            back: String
        },
        phone_screen: {
            size: { type: Number, required },
            resolution: {
                width: { type: Number, required },
                height: { type: Number, required }
            },
            max_brightness: { type: Number },
            technology: { type: String, required },
            refresh_rate: Number
        },
        phone_connectivity: {
            sim_count: { type: Number, required },
            network: { type: String, required },
            usb: { type: String, required },
            wifi: String,
            bluetooth: String,
            gps: String
        },
        phone_special_features: { type: [String], default: [] },
        phone_material: { type: String, required },
        phone_weight: { type: Number, required },
        phone_brand: { type: String, required },
        is_smartphone: { type: Boolean, default: true }
    },
    {
        collection: PHONE_COLLECTION_NAME,
        timestamps
    }
);
export const phoneModel = model(PHONE_MODEL_NAME, phoneSchema);

/* ------------------------------------------------------ */
/*                        Clothes                         */
/* ------------------------------------------------------ */
export const CLOTHES_MODEL_NAME = CategoryEnum.Clothes;
export const CLOTHES_COLLECTION_NAME = 'clothes';

const clothesSchema = new Schema<modelTypes.product.ClothesSchema>(
    {
        ...PRODUCT_SHOP_FIELD,
        size: { type: String, required },
        color: { type: String, required }
    },
    {
        collection: CLOTHES_COLLECTION_NAME,
        timestamps
    }
);

export const clothesModel = model(CLOTHES_MODEL_NAME, clothesSchema);
