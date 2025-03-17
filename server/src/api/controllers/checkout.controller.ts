import { RequestWithBody } from '../types/request';
import { OkResponse } from '../response/success.response';
import checkoutService from '../services/checkout.service';

export default class CheckoutController {
    public static checkout: RequestWithBody<joiTypes.checkout.Checkout> = async (req, res, _) => {
        new OkResponse({
            message: 'Checkout successfully',
            metadata: await checkoutService.checkout({
                ...req.body,
                user: req.userId as string
            })
        }).send(res);
    };
}
