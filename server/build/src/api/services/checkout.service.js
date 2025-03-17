"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../models/repository/cart/index");
const index_2 = require("../models/repository/discount/index");
const user_model_1 = require("../models/user.model");
const error_response_1 = require("../response/error.response");
const discount_service_1 = __importDefault(require("./discount.service"));
const discount_util_1 = require("../utils/discount.util");
const cart_enum_1 = require("../enums/cart.enum");
exports.default = new (class CheckoutService {
    async checkout({ user, shopsDiscount, discountId }) {
        /* --------- Check user address, phone number --------------- */
        /* ----------------------- Check cart ----------------------- */
        const cart = await (0, index_1.findOneCartByUser)({
            user: user,
            query: { 'cart_shop.products.status': cart_enum_1.CartItemStatus.Active }
        });
        cart.cart_shop.forEach((shop) => {
            shop.products = shop.products.filter((product) => product.status === cart_enum_1.CartItemStatus.Active);
        });
        const checkoutResult = {
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
        const discountAdmin = discountId ? await (0, index_2.findDiscountById)(discountId) : null;
        /* ----------------------- Each shop  ----------------------- */
        await Promise.all(cart.cart_shop.map(async (shop) => {
            const foundShop = await user_model_1.userModel.findById(shop.shop);
            if (!foundShop)
                throw new error_response_1.NotFoundErrorResponse('Not found shop!');
            const FEE_SHIP_DEFAULT = 30_000;
            let totalPriceRaw = 0;
            /* --------------- Calculating discount price --------------- */
            const discountInfo = shopsDiscount.find((discount) => discount.shopId === shop.shop);
            const discount = discountInfo?.discountId
                ? await (0, index_2.findDiscountById)(discountInfo.discountId)
                : null;
            const discountPrice = discount
                ? (await discount_service_1.default.getDiscountAmount({
                    discountCode: discount.discount_code,
                    products: shop.products.map((x) => ({
                        id: x.id,
                        quantity: x.quantity
                    }))
                })).totalDiscount
                : 0;
            const productsInfo = shop.products.map((product) => {
                totalPriceRaw += product.quantity * product.price;
                /* --------------- Calculating admin discount --------------- */
                if (discountAdmin &&
                    discountAdmin.is_available &&
                    (discountAdmin.is_apply_all_product ||
                        discountAdmin?.discount_products?.includes(product.id))) {
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
        }));
        checkoutResult.totalPriceRaw = checkoutResult.shopsInfo.reduce((acc, cur) => cur.totalPriceRaw + acc, 0);
        checkoutResult.totalFeeShip = checkoutResult.shopsInfo.reduce((acc, cur) => cur.feeShip + acc, 0);
        checkoutResult.totalDiscountShopPrice = checkoutResult.shopsInfo.reduce((acc, cur) => cur.totalDiscountPrice + acc, 0);
        checkoutResult.totalDiscountAdminPrice = discountAdmin
            ? (0, discount_util_1.calculateDiscount)(totalPriceProductToApplyAdminVoucher, discountAdmin.discount_value, discountAdmin.discount_type, discountAdmin.discount_max_value)
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
