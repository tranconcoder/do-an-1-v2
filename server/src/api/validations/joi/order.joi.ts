import Joi from 'joi';
import { PaymentType } from '@/enums/payment.enum.js';

export const createOrder = Joi.object<joiTypes.order.CreateOrder>({
    paymentType: Joi.string()
        .valid(...Object.values(PaymentType))
        .required()
});
