import { NotFoundErrorResponse } from '../response/error.response';

/* -------------------------- Enum -------------------------- */
import { CartItemStatus } from '../enums/cart.enum';

/* ------------------------- Utils  ------------------------- */
import { calculateDiscount } from '../utils/discount.util';
import _ from 'lodash';

/* ------------------------ Services ------------------------ */
import DiscountService from './discount.service';

/* ------------------------- Models ------------------------- */
import { userModel } from '../models/user.model';
import { findOneCartByUser } from '../models/repository/cart/index';
import { findDiscountByCode } from '../models/repository/discount/index';
import { findOneAndUpdateCheckout } from '../models/repository/checkout/index';

export default new (class CheckoutService {
    public async checkout({
        user,
        shopsDiscount = [],
        discountCode
    }: serviceTypes.checkout.arguments.Checkout) {
        /* --------- Check user address, phone number --------------- */

        /* ----------------------- Check cart ----------------------- */
        const cart = await findOneCartByUser({ user: user });

        cart.cart_shop.forEach((shop) => {
            shop.products = shop.products.filter(
                (product) => product.status === CartItemStatus.Active
            );
        });

        const checkoutResult: serviceTypes.checkout.definition.CheckoutResult = {
            total_price_raw: 0,
            total_fee_ship: 0,
            total_discount_admin_price: 0,
            total_discount_shop_price: 0,
            total_discount_price: 0,
            total_checkout: 0,
            shops_info: []
        };

        /* --------------------- Admin voucher  --------------------- */
        let totalPriceProductToApplyAdminVoucher = 0;
        const discountAdmin = discountCode && (await findDiscountByCode(discountCode));

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
                const discount =
                    discountInfo && (await findDiscountByCode(discountInfo?.discountCode));
                const discountPrice = discountInfo
                    ? (
                          await DiscountService.getDiscountAmount({
                              discountCode: discountInfo.discountCode,
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
                        price_raw: product.quantity * product.price
                    };
                });

                /* ---------------------- Each product ---------------------- */
                checkoutResult.shops_info.push({
                    shop_id: foundShop._id.toString(),
                    shop_name: foundShop.fullName,
                    discount: discount
                        ? _.pick(discount, ['discount_name', 'discount_type', 'discount_value'])
                        : undefined,
                    fee_ship: FEE_SHIP_DEFAULT,
                    total_discount_price: discountPrice,
                    total_price_raw: totalPriceRaw,
                    products_info: productsInfo
                });
            })
        );

        checkoutResult.total_price_raw = checkoutResult.shops_info.reduce(
            (acc, cur) => cur.total_price_raw + acc,
            0
        );
        checkoutResult.total_fee_ship = checkoutResult.shops_info.reduce(
            (acc, cur) => cur.fee_ship + acc,
            0
        );
        checkoutResult.total_discount_shop_price = checkoutResult.shops_info.reduce(
            (acc, cur) => cur.total_discount_price + acc,
            0
        );
        checkoutResult.total_discount_admin_price = discountAdmin
            ? calculateDiscount(
                  totalPriceProductToApplyAdminVoucher,
                  discountAdmin.discount_value,
                  discountAdmin.discount_type,
                  discountAdmin.discount_max_value
              )
            : 0;
        checkoutResult.total_discount_price =
            checkoutResult.total_discount_shop_price + checkoutResult.total_discount_admin_price;

        checkoutResult.total_checkout =
            checkoutResult.total_price_raw +
            checkoutResult.total_fee_ship -
            checkoutResult.total_discount_price;

        return await findOneAndUpdateCheckout({
            query: { user },
            update: {
                ...checkoutResult,
                user
            },
            options: { new: true, upsert: true }
        });
    }
})();
