import {
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from 'src/api/utils/mongoose.util.js';
import checkoutModel from '../../checkout.model.js';

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
export const findOneAndUpdateCheckout =
    generateFindOneAndUpdate<model.checkout.CheckoutSchema>(checkoutModel);

export const findOneCheckout = generateFindOne<model.checkout.CheckoutSchema>(checkoutModel);
