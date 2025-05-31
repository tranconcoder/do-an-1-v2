import { z } from 'zod';
import { generateValidateWithBody, generateValidateWithQuery } from '@/middlewares/zod.middleware.js';

// Create VNPay payment URL schema
export const createVNPayPaymentSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z.number().positive('Amount must be positive').transform(val => {
        return Math.round(val * 100) / 100; // Round to 2 decimal places max
    }),
    orderInfo: z.string().min(1, 'Order info is required'),
    locale: z.enum(['vn', 'en']).optional().default('vn'),
    bankCode: z.string(),
    ipAddr: z.string().ip('Invalid IP address format').optional()
});

// VNPay return/IPN parameters schema
export const vnpayReturnSchema = z.object({
    vnp_Amount: z.string(),
    vnp_BankCode: z.string().optional(),
    vnp_BankTranNo: z.string().optional(),
    vnp_CardType: z.string().optional(),
    vnp_OrderInfo: z.string(),
    vnp_PayDate: z.string().optional(),
    vnp_ResponseCode: z.string(),
    vnp_TmnCode: z.string(),
    vnp_TransactionNo: z.string().optional(),
    vnp_TransactionStatus: z.string().optional(),
    vnp_TxnRef: z.string(),
    vnp_SecureHash: z.string()
});

// Payment query parameters
export const paymentQuerySchema = z.object({
    orderId: z.string().optional(),
    txnRef: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
    method: z.enum(['cod', 'vnpay', 'bank_transfer']).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional()
});

// Type exports
export type CreateVNPayPaymentSchema = z.infer<typeof createVNPayPaymentSchema>;
export type VNPayReturnSchema = z.infer<typeof vnpayReturnSchema>;
export type PaymentQuerySchema = z.infer<typeof paymentQuerySchema>;

// Middleware exports
export const validateCreateVNPayPayment = generateValidateWithBody(createVNPayPaymentSchema);
export const validateVNPayReturn = generateValidateWithQuery(vnpayReturnSchema);
export const validatePaymentQuery = generateValidateWithQuery(paymentQuerySchema); 