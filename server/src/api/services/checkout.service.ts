import { findOneCartByUser } from '../models/repository/cart/index';
import { findDiscountById } from '../models/repository/discount/index';
import { userModel } from '../models/user.model';
import { NotFoundErrorResponse } from '../response/error.response';
import DiscountService from './discount.service';
import { calculateDiscount } from '../utils/discount.util';
import { CartItemStatus } from '../enums/cart.enum';

export default new (class CheckoutService {
    public async checkout({
        user,
        shopsDiscount,
        discountId
    }: serviceTypes.checkout.arguments.Checkout) {
        /* --------- Check user address, phone number --------------- */

        /* ----------------------- Check cart ----------------------- */
        const cart = await findOneCartByUser({
            user: user,
            query: { 'cart_shop.products.status': CartItemStatus.Active }
        });

        cart.cart_shop.forEach((shop) => {
            shop.products = shop.products.filter(
                (product) => product.status === CartItemStatus.Active
            );
        });

        const checkoutResult: serviceTypes.checkout.definition.CheckoutResult = {
            totalPriceRaw: 0,
            totalFeeShip: 0,
            totalDiscountAdminPrice: 0,
            totalDiscountShopPrice: 0,
            totalDiscountPrice: 0,
            totalCheckout: 0,
            shopsInfo: []
        };

        /* --------------------- Admin voucher  --------------------- */
        let totalPriceProductToApplyAdminVoucher = 0;
        const discountAdmin = discountId ? await findDiscountById(discountId) : null;

        /* ----------------------- Each shop  ----------------------- */
        await Promise.all(
            cart.cart_shop.map(async (shop) => {
                const foundShop = await userModel.findById(shop.shop);
                if (!foundShop) throw new NotFoundErrorResponse('Not found shop!');

                const FEE_SHIP_DEFAULT = 30_000;

                let totalPriceRaw = 0;

                /* --------------- Calculating discount price --------------- */
                const discountInfo = shopsDiscount.find(
                    (discount) => discount.shopId === shop.shop
                );
                const discount = discountInfo?.discountId
                    ? await findDiscountById(discountInfo.discountId)
                    : null;
                const discountPrice = discount
                    ? (
                          await DiscountService.getDiscountAmount({
                              discountCode: discount.discount_code as string,
                              products: shop.products.map((x) => ({
                                  id: x.id,
                                  quantity: x.quantity
                              }))
                          })
                      ).totalDiscount
                    : 0;
                const productsInfo = shop.products.map((product) => {
                    totalPriceRaw += product.quantity * product.price;

                    /* --------------- Calculating admin discount --------------- */
                    if (
                        discountAdmin &&
                        discountAdmin.is_available &&
                        (discountAdmin.is_apply_all_product ||
                            discountAdmin?.discount_products?.includes(product.id))
                    ) {
                        totalPriceProductToApplyAdminVoucher += product.quantity * product.price;
                    }

                    return {
                        id: product.id,
                        name: product.name,
                        quantity: product.quantity,
                        thumb: product.thumb,
                        price: product.price,
                        priceRaw: product.quantity * product.price
                    };
                });

                /* ---------------------- Each product ---------------------- */
                checkoutResult.shopsInfo.push({
                    shopId: foundShop._id.toString(),
                    shopName: foundShop.fullName,
                    feeShip: FEE_SHIP_DEFAULT,
                    totalDiscountPrice: discountPrice,
                    totalPriceRaw,
                    productsInfo
                });
            })
        );

        checkoutResult.totalPriceRaw = checkoutResult.shopsInfo.reduce(
            (acc, cur) => cur.totalPriceRaw + acc,
            0
        );
        checkoutResult.totalFeeShip = checkoutResult.shopsInfo.reduce(
            (acc, cur) => cur.feeShip + acc,
            0
        );
        checkoutResult.totalDiscountShopPrice = checkoutResult.shopsInfo.reduce(
            (acc, cur) => cur.totalDiscountPrice + acc,
            0
        );
        checkoutResult.totalDiscountAdminPrice = discountAdmin
            ? calculateDiscount(
                  totalPriceProductToApplyAdminVoucher,
                  discountAdmin.discount_value,
                  discountAdmin.discount_type,
                  discountAdmin.discount_max_value
              )
            : 0;
        checkoutResult.totalDiscountPrice =
            checkoutResult.totalDiscountShopPrice + checkoutResult.totalDiscountAdminPrice;

        checkoutResult.totalCheckout =
            checkoutResult.totalPriceRaw +
            checkoutResult.totalFeeShip -
            checkoutResult.totalDiscountPrice;

        return checkoutResult;
    }
})();
