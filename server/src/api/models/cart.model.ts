import { Schema, model } from 'mongoose';
import { timestamps, required, unique } from '../../configs/mongoose.config';
import { CartItemStatus } from '../enums/cart.enum';
import { PRODUCT_MODEL_NAME } from './product.model';
import { userModel, USER_MODEL_NAME } from './user.model';

export const CART_MODEL_NAME = 'Cart';
export const CART_COLLECTION_NAME = 'carts';

const cartSchema = new Schema<modelTypes.cart.CartSchema>(
    {
        user: { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, required },
        cart_shop: {
            type: [
                {
                    shop: { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME },
                    products: {
                        type: [
                            {
                                id: {
                                    type: Schema.Types.ObjectId,
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
