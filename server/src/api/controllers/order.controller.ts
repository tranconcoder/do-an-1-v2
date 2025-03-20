import { CreatedResponse } from '../response/success.response.js';
import { RequestWithBody } from '../types/request.js';
import orderService from '../services/order.service.js';

export default new (class OrderController {
    public createOrder: RequestWithBody<any> = async (req, res, _) => {
        new CreatedResponse({
            message: 'Order created successfully',
            metadata: await orderService.createOrder(req.body)
        }).send(res);
    };
})();
