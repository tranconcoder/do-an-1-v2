import { generateFindOneAndUpdate } from 'src/api/utils/mongoose.util';
import checkoutModel from '../../checkout.model';

export const findOneAndUpdateCheckout = generateFindOneAndUpdate(checkoutModel);
