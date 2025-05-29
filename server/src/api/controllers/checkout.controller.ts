import { RequestWithBody, RequestWithQuery } from '@/types/request.js';
import { OkResponse } from '@/response/success.response.js';
import checkoutService from '@/services/checkout.service.js';

export default class CheckoutController {
    public static checkout: RequestWithBody<joiTypes.checkout.Checkout> = async (req, res, _) => {
        new OkResponse({
            message: 'Checkout successfully',
            metadata: await checkoutService.checkout({
                ...req.body,
                user: req.userId as string,
            })
        }).send(res);
    };
}
