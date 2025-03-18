import mongoose, { Schema, model } from 'mongoose';
import { timestamps, required } from 'src/configs/mongoose.config';

export const CHECKOUT_MODEL_NAME = 'Checkout';
export const CHECKOUT_COLLECTION_NAME = 'checkouts';

const checkoutSchema = new Schema<modelTypes.checkout.CheckoutSchema>(
    {
        user: { type: Schema.Types.ObjectId, required },
        totalPriceRaw: { type: Number, required },
        totalFeeShip: { type: Number, required },
        totalDiscountShopPrice: { type: Number, required },
        totalDiscountAdminPrice: { type: Number, required },
        totalDiscountPrice: { type: Number, required },
        totalCheckout: { type: Number, required },
        shopsInfo: [
            {
                shopId: { type: String, required },
                shopName: { type: String, required },
                productsInfo: [
                    {
                        id: { type: String, required },
                        name: { type: String, required },
                        quantity: { type: Number, required },
                        thumb: { type: String, required },
                        price: { type: Number, required },
                        priceRaw: { type: Number, required }
                    }
                ],
                feeShip: { type: Number, required },
                totalPriceRaw: { type: Number, required },
                totalDiscountPrice: { type: Number, required }
            }
        ]
    },
    {
        timestamps,
        collection: CHECKOUT_COLLECTION_NAME,
        expireAfterSeconds: 1 * 24 * 60 * 60
    }
);

export default model(CHECKOUT_MODEL_NAME, checkoutSchema);
