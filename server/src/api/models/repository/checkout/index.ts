import { generateFindOne, generateFindOneAndUpdate } from 'src/api/utils/mongoose.util';
import checkoutModel from '../../checkout.model';

export const findOneAndUpdateCheckout =
    generateFindOneAndUpdate<modelTypes.checkout.CheckoutSchema>(checkoutModel);

export const findOneCheckout = generateFindOne<modelTypes.checkout.CheckoutSchema>(checkoutModel);
