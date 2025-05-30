import { z } from 'zod';
import { PaymentType } from '@/enums/payment.enum.js';
import { OrderStatus } from '@/enums/order.enum.js';
import { generateValidateWithBody, generateValidateWithQuery, generateValidateWithParams } from '@/middlewares/zod.middleware.js';

export const createOrderSchema = z.object({
    paymentType: z.nativeEnum(PaymentType, {
        required_error: 'Payment type is required',
        invalid_type_error: 'Invalid payment type'
    })
});

export const getShopOrdersQuerySchema = z.object({
    status: z.enum(['all', ...Object.values(OrderStatus)]).optional(),
    page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['created_at', 'updated_at', 'price_to_payment']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    paymentType: z.nativeEnum(PaymentType).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional()
});

export const orderParamsSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required')
});

export const rejectOrderSchema = z.object({
    reason: z.string().optional()
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type GetShopOrdersQuerySchema = z.infer<typeof getShopOrdersQuerySchema>;
export type OrderParamsSchema = z.infer<typeof orderParamsSchema>;
export type RejectOrderSchema = z.infer<typeof rejectOrderSchema>;

export const validateCreateOrder = generateValidateWithBody(createOrderSchema);
export const validateGetShopOrdersQuery = generateValidateWithQuery(getShopOrdersQuerySchema);
export const validateOrderParams = generateValidateWithParams(orderParamsSchema);
export const validateRejectOrder = generateValidateWithBody(rejectOrderSchema);
