import _ from 'lodash';
import {
    checkDiscountCodeIsValid,
    createDiscount,
    findAllDiscountInShopByCode
} from '../models/repository/discount/index';
import { BadRequestErrorResponse } from '../response/error.response';

export default class DiscountService {
    /* -------------------- Create discount  -------------------- */
    public static createDiscount = async ({
        userId,
        ...payload
    }: serviceTypes.discount.arguments.CreateDiscount) => {
        /* ---------------------------------------------------------- */
        /*           Missing check is admin voucher by shop           */
        /* ---------------------------------------------------------- */
        const isAdmin = false;

        /* ------------------ Check code is valid  ------------------ */
        const equalCodeInShop = await findAllDiscountInShopByCode({
            shop: userId,
            code: payload.discount_code
        });

        return await createDiscount({
            ...payload,
            discount_shop: userId,
            is_admin_voucher: isAdmin
        });
    };
}
