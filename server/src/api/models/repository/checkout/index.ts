import {
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate,
    generateFindOneAndDelete
} from 'src/api/utils/mongoose.util.js';
import checkoutModel from '../../checkout.model.js';

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
export const findOneAndUpdateCheckout =
    generateFindOneAndUpdate<model.checkout.CheckoutSchema>(checkoutModel);

export const findOneCheckout = generateFindOne<model.checkout.CheckoutSchema>(checkoutModel);

/* ---------------------------------------------------------- */
/*                          Delete                            */
/* ---------------------------------------------------------- */
export const deleteCheckout = generateFindOneAndDelete<model.checkout.CheckoutSchema>(checkoutModel);
