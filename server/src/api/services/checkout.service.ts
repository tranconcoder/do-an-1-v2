import { ForbiddenErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

/* -------------------------- Enum -------------------------- */
import { CartItemStatus } from '@/enums/cart.enum.js';

/* ------------------------- Utils  ------------------------- */
import { calculateDiscount } from '@/utils/discount.util.js';
import _ from 'lodash';

/* ------------------------ Services ------------------------ */
import DiscountService from './discount.service.js';

/* ------------------------- Models ------------------------- */
import { userModel } from '@/models/user.model.js';
import { findOneCartByUser } from '@/models/repository/cart/index.js';
import { findDiscountByCode } from '@/models/repository/discount/index.js';
import { findOneAndUpdateCheckout } from '@/models/repository/checkout/index.js';

export default new (class CheckoutService {
    public async checkout({
        user,
        shopsDiscount = [],
        discountCode
    }: service.checkout.arguments.Checkout) {
        /* ----------------------- Check cart ----------------------- */
        const cart = await findOneCartByUser({ user: user });

        /* ----------- Select all item selected from cart ----------- */
        cart.cart_shop.forEach((shop) => {
            shop.products = shop.products.filter(
                (product) => product.product_status === CartItemStatus.Active
            );
        });

        /* ------------------ Initial result data  ------------------ */
        const checkoutResult: service.checkout.definition.CheckoutResult = {
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

        if (discountAdmin) {
            if (!discountAdmin.is_admin_voucher)
                throw new ForbiddenErrorResponse({ message: 'Invalid voucher!' });

            /* -------------- Add admin discount to result -------------- */
            checkoutResult.discount = {
                ..._.pick(discountAdmin, [
                    'discount_code',
                    'discount_name',
                    'discount_type',
                    'discount_value'
                ]),
                discount_id: discountAdmin._id
            };
        }

        /* ----------------------- Each shop  ----------------------- */
        await Promise.all(
            cart.cart_shop.map(async (shop) => {
                const foundShop = await userModel.findById(shop.shop);
                if (!foundShop) throw new NotFoundErrorResponse({ message: 'Not found shop!' });

                const FEE_SHIP_DEFAULT = 30_000;

                /* -------------- Initial total price raw shop -------------- */
                let totalPriceRawShop = 0;

                /* ----------------- Get discount shop info ----------------- */
                const discountInfo = shopsDiscount.find(
                    (discount) => discount.shopId === shop.shop.toString()
                );
                const discount =
                    discountInfo && (await findDiscountByCode(discountInfo.discountCode));

                /* ------------- Get amount of discount by shop ------------- */
                const discountPriceShop = discount
                    ? (
                          await DiscountService.getDiscountAmount({
                              discountCode: discountInfo.discountCode,
                              products: shop.products.map((x) => ({
                                  id: x.sku.toString(),
                                  quantity: x.cart_quantity,
                              }))
                          })
                      ).totalDiscount
                    : 0;

                const productsInfo = shop.products.map((product) => {
                    totalPriceRawShop += product.cart_quantity * product.product_price;

                    /* --------------- Calculating admin discount --------------- */
                    if (
                        discountAdmin &&
                        discountAdmin.is_available &&
                        (discountAdmin.is_apply_all_product ||
                            discountAdmin?.discount_skus
                                ?.map((x) => x.toString())
                                ?.includes(product.sku.toString()))
                    ) {
                        totalPriceProductToApplyAdminVoucher += product.cart_quantity * product.product_price;
                    }

                    return {
                        id: product.sku.toString(),
                        name: product.product_name,
                        quantity: product.cart_quantity,
                        thumb: product.product_thumb,
                        price: product.product_price,
                        price_raw: product.cart_quantity * product.product_price
                    };
                });

                /* ---------------------- Each product ---------------------- */
                checkoutResult.shops_info.push({
                    shop_id: foundShop._id.toString(),
                    shop_name: foundShop.user_fullName,
                    discount: discount
                        ? {
                              ..._.pick(discount, [
                                  'discount_name',
                                  'discount_type',
                                  'discount_value',
                                  'discount_code'
                              ]),
                              discount_id: discount._id
                          }
                        : undefined,
                    fee_ship: FEE_SHIP_DEFAULT,
                    total_discount_price: discountPriceShop,
                    total_price_raw: totalPriceRawShop,
                    products_info: productsInfo.map((product) => {
                        return {
                            ...product,
                            thumb: product.thumb.toString()
                        };
                    })
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
                  discountAdmin.discount_type,
                  totalPriceProductToApplyAdminVoucher,
                  discountAdmin.discount_value,
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
