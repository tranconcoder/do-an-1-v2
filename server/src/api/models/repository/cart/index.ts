import { NotFoundErrorResponse } from '../../../response/error.response';
import { generateFindOneAndUpdate } from '../../../utils/mongoose.util';
import cartModel from '../../cart.model';

export const findOneAndUpdateCart = generateFindOneAndUpdate<modelTypes.cart.CartSchema>(cartModel);

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const findOneCartByUser = async ({
    user,
    ...options
}: Partial<Parameters<typeof findOneAndUpdateCart>[0]> & { user: string }) => {
    return await findOneAndUpdateCart({
        query: { user, ...options.query },
        update: {},
        options: { new: true, upsert: true },
        omit: 'metadata',
        sort: options.sort
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

/* ---------------------------------------------------------- */
/*                           Check                            */
/* ---------------------------------------------------------- */
export const checkShopListExistsInCart = async ({
    user,
    shopList
}: repoTypes.cart.CheckShopListExistsInCart) => {
    const cart = await cartModel.findOne({
        user
    });

    if (!cart) throw new NotFoundErrorResponse('Not found cart!');

    return (
        cart?.cart_shop?.filter((x) => shopList.includes(x.shop.toString())).length ===
        shopList.length
    );
};
