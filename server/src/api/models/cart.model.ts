import { Schema, model } from 'mongoose';
import { timestamps, required } from '@/configs/mongoose.config.js';
import { CartItemStatus } from '@/enums/cart.enum.js';
import { PRODUCT_MODEL_NAME } from './product.model.js';
import { USER_MODEL_NAME } from './user.model.js';
import { ObjectId } from '@/configs/mongoose.config.js';

export const CART_MODEL_NAME = 'Cart';
export const CART_COLLECTION_NAME = 'carts';

const cartSchema = new Schema<modelTypes.cart.CartSchema>(
    {
        user: { type: ObjectId, ref: USER_MODEL_NAME, required },
        cart_shop: {
            type: [
                {
                    shop: { type: ObjectId, ref: USER_MODEL_NAME },
                    products: {
                        type: [
                            {
                                id: {
                                    type: ObjectId,
                                    required,
                                    ref: PRODUCT_MODEL_NAME
                                },
                                name: { type: String, required },
                                thumb: { type: String, required },
                                quantity: { type: Number, required },
                                price: { type: Number, required },
                                status: {
                                    type: String,
                                    enum: CartItemStatus,
                                    default: CartItemStatus.Active
                                }
                            }
                        ],
                        default: []
                    }
                }
            ],
            default: []
        }
    },
    {
        timestamps,
        collection: CART_COLLECTION_NAME
    }
);

export default model(CART_MODEL_NAME, cartSchema);
