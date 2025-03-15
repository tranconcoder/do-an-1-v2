import { generateFindOneAndUpdate } from 'src/api/utils/mongoose.util';
import cartModel from '../../cart.model';

export const findOneAndUpdateCart = generateFindOneAndUpdate<modelTypes.cart.CartSchema>(cartModel);
