import { Schema, model } from 'mongoose';
import { required, unique, ObjectId, timestamps } from '@/configs/mongoose.config.js';
import { ShopStatus, ShopType } from '@/enums/shop.enum.js';
import { USER_MODEL_NAME } from './user.model.js';
import { MEDIA_MODEL_NAME } from './media.model.js';
import { warehouseSchema } from './warehouse.model.js';
import { LOCATION_MODEL_NAME } from './location.model.js';

export const SHOP_MODEL_NAME = 'Shop';
export const SHOP_COLLECTION_NAME = 'shops';

export const shopSchema = new Schema<model.shop.ShopSchema>(
    {
        /* -------------------- Shop information -------------------- */
        shop_userId: { type: ObjectId, ref: USER_MODEL_NAME, required, index: true },
        shop_name: { type: String, required, unique },
        shop_email: { type: String, required, unique },
        shop_type: { type: String, enum: ShopType, required },
        shop_logo: { type: ObjectId, ref: MEDIA_MODEL_NAME },
        shop_certificate: { type: String, required },
        shop_location: { type: ObjectId, ref: LOCATION_MODEL_NAME, required },
        shop_phoneNumber: { type: String, required },
        shop_description: String,

        /* ----------------------- Shop owner ----------------------- */
        shop_owner_fullName: { type: String, required },
        shop_owner_email: { type: String, required },
        shop_owner_phoneNumber: { type: String, required },
        shop_owner_cardID: { type: String, required },

        /* --------------------- Shop status --------------------- */
        shop_status: { type: String, enum: ShopStatus, default: ShopStatus.PENDING },
        is_brand: { type: Boolean, default: false },
        is_deleted: { type: Boolean, default: false }
    },
    {
        timestamps,
        collection: SHOP_COLLECTION_NAME
    }
);

export default model(SHOP_MODEL_NAME, shopSchema);
