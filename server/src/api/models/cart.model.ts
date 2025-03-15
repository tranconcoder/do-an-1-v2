import { Schema, model } from 'mongoose';
import { timestamps, required, unique } from '../../configs/mongoose.config';
import { PRODUCT_MODEL_NAME } from './product.model';
import { USER_MODEL_NAME } from './user.model';

export const CART_MODEL_NAME = 'Cart';
export const CART_COLLECTION_NAME = 'carts';

const cartSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, required },
        cart_product: [
            {
                product: { type: Schema.Types.ObjectId, ref: PRODUCT_MODEL_NAME, required },
                quantity: { type: Number, required, default: 0 },
                price: Number,
                status: { type: String, enum: ['active', 'inactive'], default: 'active' }
            }
        ]
    },
    {
        timestamps,
        collection: CART_COLLECTION_NAME
    }
);

export default model(CART_MODEL_NAME, cartSchema);
