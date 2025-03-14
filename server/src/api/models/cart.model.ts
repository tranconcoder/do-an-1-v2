import { Schema, model } from 'mongoose';
import { timestamps, required } from '../../configs/mongoose.config';
import { PRODUCT_MODEL_NAME } from './product.model';

export const CART_MODEL_NAME = 'Cart';
export const CART_COLLECTION_NAME = 'carts';

const cartSchema = new Schema(
    {
        cart_product: {
            type: Schema.Types.ObjectId,
            ref: PRODUCT_MODEL_NAME,
            required
        }
    },
    {}
);

export default model(CART_MODEL_NAME, cartSchema);
