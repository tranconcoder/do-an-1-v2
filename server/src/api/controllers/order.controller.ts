import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody, RequestWithQuery, RequestWithParams } from '@/types/request.js';
import orderService from '@/services/order.service.js';
import { Request } from 'express';
import { OrderStatus } from '@/enums/order.enum.js';
import { PaymentType } from '@/enums/payment.enum.js';
import {
    CreateOrderSchema,
    GetShopOrdersQuerySchema,
    OrderParamsSchema,
    RejectOrderSchema
} from '@/validations/zod/order.zod.js';

export default new (class OrderController {
    public createOrder: RequestWithBody<CreateOrderSchema> = async (req, res, _) => {
        new CreatedResponse({
            message: 'Order created successfully',
            metadata: await orderService.createOrder({
                userId: req.userId as string,
                paymentType: req.body.paymentType as PaymentType
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

    public getShopOrders: RequestWithQuery<GetShopOrdersQuerySchema> = async (req, res, _) => {
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
            message: 'Get shop orders successfully',
            metadata: await orderService.getShopOrders({
                shopId: req.userId as string,
                status: (status as OrderStatus) || undefined,
                page: page,
                limit: limit,
                search: search,
                sortBy: sortBy,
                sortOrder: sortOrder,
                paymentType: paymentType as any,
                dateFrom: dateFrom,
                dateTo: dateTo
            })
        }).send(res);
    };

    public cancelOrder: RequestWithParams<OrderParamsSchema> = async (req, res, _) => {
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

    public approveOrder: RequestWithParams<OrderParamsSchema> = async (req, res, _) => {
        const { orderId } = req.params;
        const result = await orderService.approveOrder({
            shopId: req.userId as string,
            orderId: orderId
        });

        new OkResponse({
            message: 'Order approved successfully',
            metadata: result ? {
                _id: result._id.toString(),
                order_status: result.order_status
            } : {}
        }).send(res);
    };

    public rejectOrder: RequestWithBody<RejectOrderSchema> & RequestWithParams<OrderParamsSchema> = async (req, res, _) => {
        const { orderId } = req.params;
        const { reason } = req.body;
        const result = await orderService.rejectOrder({
            shopId: req.userId as string,
            orderId: orderId,
            reason: reason
        });

        new OkResponse({
            message: 'Order rejected successfully',
            metadata: result ? {
                _id: result._id.toString(),
                order_status: result.order_status
            } : {}
        }).send(res);
    };

    public createOrderWithVNPay = async (req: Request, res: any, _: any) => {
        new CreatedResponse({
            message: 'Order created with VNPay payment successfully',
            metadata: await orderService.createOrderWithVNPay({
                userId: req.userId as string
            })
        }).send(res);
    };

    public createOrderWithVNPayPayment = async (req: Request, res: any, _: any) => {
        const { bankCode } = req.body;
        const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';

        new CreatedResponse({
            message: 'Orders created and payment URL generated successfully',
            metadata: await orderService.createOrderWithVNPayPayment({
                userId: req.userId as string,
                bankCode,
                ipAddr
            })
        }).send(res);
    };
})();
