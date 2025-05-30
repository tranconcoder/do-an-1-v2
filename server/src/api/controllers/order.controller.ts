import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody } from '@/types/request.js';
import orderService from '@/services/order.service.js';
import { Request } from 'express';

export default new (class OrderController {
    public createOrder: RequestWithBody<joiTypes.order.CreateOrder> = async (req, res, _) => {
        new CreatedResponse({
            message: 'Order created successfully',
            metadata: await orderService.createOrder({
                ...req.body,
                userId: req.userId as string
            })
        }).send(res);
    };

    public getOrderHistory = async (req: Request, res: any, _: any) => {
        const { status } = req.query;
        new OkResponse({
            message: 'Get order history successfully',
            metadata: await orderService.getOrderHistory({
                userId: req.userId as string,
                status: status as string
            })
        }).send(res);
    };
})();
