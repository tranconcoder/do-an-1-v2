import { Schema, model } from 'mongoose';
import { required, unique, ObjectId, timestamps } from '@/configs/mongoose.config.js';
import { ShopStatus, ShopType } from '@/enums/shop.enum.js';

export const SHOP_MODEL_NAME = 'Shop';
export const SHOP_COLLECTION_NAME = 'shops';

export const shopSchema = new Schema<model.shop.ShopSchema>(
    {
        /* ---------------------- Authenticate ---------------------- */
        shop_email: { type: String, required, unique },
        shop_password: { type: String, required },

        /* -------------------- Shop information -------------------- */
        shop_name: { type: String, required, unique },
        shop_type: { type: String, enum: ShopType, required },
        shop_logo: { type: String, required },
        shop_certificate: { type: String, required },
        shop_address: { type: ObjectId },
        shop_phoneNumber: { type: String, required },
        shop_description: String,

        /* -------------------- Shop inventories -------------------- */
        shop_warehouses: {
            type: [
                {
                    name: { type: String, required },
                    address: { type: ObjectId, required },
                    phoneNumber: { type: String, required }
                }
            ],
            default: []
        },

        /* ----------------------- Shop owner ----------------------- */
        shop_owner_fullName: { type: String, required },
        shop_owner_email: { type: String, required },
        shop_owner_phoneNumber: { type: String, required },
        shop_owner_cardID: { type: String, required },

        /* --------------------- Shop status --------------------- */
        shop_status: { type: String, enum: ShopStatus, default: ShopStatus.PENDING },
        is_brand: { type: Boolean, default: false }
    },
    {
        timestamps,
        collection: SHOP_COLLECTION_NAME
    }
);

export default model(SHOP_MODEL_NAME, shopSchema);
