import { generateFindOneAndUpdate } from 'src/api/utils/mongoose.util';
import cartModel from '../../cart.model';

export const findOneAndUpdateCart = generateFindOneAndUpdate<modelTypes.cart.CartSchema>(cartModel);

export const getCartUpsert = async (userId: string) => {
    return await findOneAndUpdateCart({
        query: { user: userId },
        update: {},
        options: { new: true, upsert: true },
        omit: 'metadata'
    });
};

export const findAndRemoveProductFromCart = async ({
    product,
    user
}: repoTypes.cart.FindAndRemoveProductFromCart) => {
    return await findOneAndUpdateCart({
        query: { user },
        update: { $pull: { cart_product: { product } } },
        options: { new: true, upsert: true },
        omit: 'metadata'
    });
};
