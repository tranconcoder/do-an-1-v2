import { getCartUpsert } from '../models/repository/cart/index';
import { findDiscountById } from '../models/repository/discount/index';
import { userModel } from '../models/user.model';
import { NotFoundErrorResponse } from '../response/error.response';

export default new (class CheckoutService {
    public async checkout({
        user,
        shopsDiscount,
        discountId
    }: serviceTypes.checkout.arguments.Checkout) {
        /* --------- Check user address, phone number --------------- */

        /* ----------------------- Check cart ----------------------- */
        const cart = await getCartUpsert({ userId: user });

        const checkoutResult: serviceTypes.checkout.definition.CheckoutResult = {
            totalPriceRaw: 0,
            totalFeeShip: 0,
            totalDiscountPrice: 0,
            totalCheckout: 0,
            shopsInfo: []
        };

        /* ----------------------- Each shop  ----------------------- */
        await Promise.all(
            cart.cart_shop.map(async (shop) => {
                const foundShop = await userModel.findById(shop.shop);
                if (!foundShop) throw new NotFoundErrorResponse('Not found shop!');

                const FEE_SHIP_DEFAULT = 30_000;

                let totalPriceRawShop = 0;
                let totalDiscountPriceShop = 0;
                const discountInfo = shopsDiscount.find(
                    (discount) => discount.shopId === shop.shop
                );
                const discount = discountInfo?.discountId
                    ? await findDiscountById(discountInfo.discountId)
                    : null;

                /* ---------------------- Each product ---------------------- */
                const productsInfo: serviceTypes.checkout.definition.CheckoutResult['shopsInfo'][number]['productsInfo'] =
                    await Promise.all(
                        shop.products.map(async (product) => {
                            let discountPrice = 0;

                            return {
                                id: product.id,
                                name: product.name,
                                quantity: product.quantity,
                                thumb: product.thumb,
                                price: product.price,
                                priceRaw: product.quantity * product.price,
                                discountPrice
                            };
                        })
                    );

                checkoutResult.shopsInfo.push({
                    shopId: foundShop._id.toString(),
                    shopName: foundShop.fullName,
                    feeShip: FEE_SHIP_DEFAULT,
                    totalDiscountPrice: totalDiscountPriceShop,
                    totalPriceRaw: totalPriceRawShop,
                    productsInfo
                });
            })
        );
    }
})();
