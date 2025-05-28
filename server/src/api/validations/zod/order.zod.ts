import { z } from 'zod';
import { PaymentType } from '@/enums/payment.enum.js';
import { generateValidateWithBody } from '@/middlewares/zod.middleware.js';

export const createOrderSchema = z.object({
    paymentType: z.nativeEnum(PaymentType, {
        required_error: 'Payment type is required',
        invalid_type_error: 'Invalid payment type'
    })
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export const validateCreateOrder = generateValidateWithBody(createOrderSchema);
