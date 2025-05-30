import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody } from '@/types/request.js';
import orderService from '@/services/order.service.js';
import { Request } from 'express';
import { OrderStatus } from '@/enums/order.enum.js';

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
        const {
            status,
            page,
            limit,
            search,
            sortBy,
            sortOrder,
            paymentType,
            dateFrom,
            dateTo
        } = req.query;

        new OkResponse({
            message: 'Get order history successfully',
            metadata: await orderService.getOrderHistory({
                userId: req.userId as string,
                status: (status as OrderStatus) || undefined,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                search: search as string,
                sortBy: sortBy as 'created_at' | 'updated_at' | 'price_to_payment',
                sortOrder: sortOrder as 'asc' | 'desc',
                paymentType: paymentType as any,
                dateFrom: dateFrom as string,
                dateTo: dateTo as string
            })
        }).send(res);
    };

    public cancelOrder = async (req: Request, res: any, _: any) => {
        const { orderId } = req.params;
        const result = await orderService.cancelOrder({
            userId: req.userId as string,
            orderId: orderId
        });

        new OkResponse({
            message: 'Order cancelled successfully',
            metadata: result ? {
                _id: result._id.toString(),
                order_status: result.order_status
            } : {}
        }).send(res);
    };
})();
