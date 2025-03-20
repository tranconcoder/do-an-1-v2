import { generateFindOne, generateFindOneAndUpdate } from 'src/api/utils/mongoose.util.js';
import checkoutModel from '../../checkout.model.js';

export const findOneAndUpdateCheckout =
    generateFindOneAndUpdate<modelTypes.checkout.CheckoutSchema>(checkoutModel);

export const findOneCheckout = generateFindOne<modelTypes.checkout.CheckoutSchema>(checkoutModel);

