import { CreatedResponse } from '../response/success.response';
import DiscountService from '../services/discount.service';
import { RequestWithBody } from '../types/request';

export default class DiscountController {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */

    /* -------------------- Create discount  -------------------- */
    public static createDiscount: RequestWithBody<joiTypes.discount.CreateDiscount> =
        async (req, res, _) => {
            new CreatedResponse({
                message: 'Discount created successfully',
                metadata: await DiscountService.createDiscount({
                    ...req.body,
                    userId: req.userId as string
                })
            }).send(res);
        };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    /* ----------------- Set available discount ----------------- */

    /* ---------------- Set unavailable discount ---------------- */
}
