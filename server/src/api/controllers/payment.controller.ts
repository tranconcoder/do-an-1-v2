import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody, RequestWithQuery } from '@/types/request.js';
import paymentService from '@/services/payment.service.js';
import { Request, Response } from 'express';
import {
    CreateVNPayPaymentSchema,
    VNPayReturnSchema,
    PaymentQuerySchema
} from '@/validations/zod/payment.zod.js';

export default new (class PaymentController {
    public createVNPayPayment: RequestWithBody<CreateVNPayPaymentSchema> = async (req, res, _) => {
        const { orderId, amount, orderInfo, locale, bankCode, ipAddr } = req.body;

        console.log('Payment request received:', {
            orderId,
            amount,
            originalAmount: req.body.amount,
            amountType: typeof amount,
            orderInfo,
            bankCode,
            ipAddr
        });

        // Use IP address from client (obtained via ipify.org) or fallback to server detection
        let clientIpAddr = ipAddr || '';
        if (!clientIpAddr) {
            // Fallback to server-side detection if client doesn't provide IP
            const detectedIp = req.headers['x-forwarded-for'] as string ||
                req.connection.remoteAddress ||
                req.socket?.remoteAddress ||
                (req.connection as any)?.socket?.remoteAddress ||
                req.ip ||
                '127.0.0.1';

            clientIpAddr = Array.isArray(detectedIp) ? detectedIp[0] : detectedIp;
        }

        console.log('IP Address used for VNPay:', clientIpAddr);

        new CreatedResponse({
            message: 'VNPay payment URL created successfully',
            metadata: await paymentService.createVNPayPaymentUrl({
                orderId,
                amount,
                orderInfo,
                ipAddr: clientIpAddr,
                locale,
                bankCode
            })
        }).send(res);
    };

    public handleVNPayReturn: RequestWithQuery<VNPayReturnSchema> = async (req, res, _) => {
        const vnpParams = req.query;

        new OkResponse({
            message: 'VNPay return processed successfully',
            metadata: await paymentService.handleVNPayReturn(vnpParams)
        }).send(res);
    };

    public handleVNPayIPN = async (req: Request, res: Response, _: any) => {
        try {
            console.log('=== VNPay IPN Notification Received ===');
            console.log('IPN Headers:', req.headers);
            console.log('IPN Query Params:', req.query);
            console.log('IPN Body:', req.body);
            console.log('IPN Method:', req.method);
            console.log('IPN URL:', req.url);
            console.log('IPN IP:', req.ip || req.connection.remoteAddress);

            // Handle both GET (query params) and POST (body params) requests
            const vnpParams = req.method === 'GET' ? req.query : req.body;

            // Validate required parameters
            if (!vnpParams.vnp_TxnRef || !vnpParams.vnp_ResponseCode || !vnpParams.vnp_SecureHash) {
                console.error('❌ Missing required VNPay IPN parameters');
                return res.status(200).json({
                    RspCode: '97',
                    Message: 'Invalid parameters'
                });
            }

            console.log('Processing VNPay IPN for transaction:', vnpParams.vnp_TxnRef);

            // Use the new VNPay library method for IPN verification
            const result = await paymentService.handleVNPayIPN(vnpParams);

            console.log('VNPay IPN processing result:', result);

            // Return the result directly from VNPay library (it returns proper IPN response format)
            return res.status(200).json(result);

        } catch (error: any) {
            console.error('❌ VNPay IPN Error:', error);
            console.error('Error stack:', error.stack);

            // Always return 200 status with error code for VNPay
            res.status(200).json({
                RspCode: '99',
                Message: 'Unknown error'
            });
        }
    };

    public getPaymentByTxnRef = async (req: Request, res: Response, _: any) => {
        const { txnRef } = req.params;

        new OkResponse({
            message: 'Payment retrieved successfully',
            metadata: await paymentService.getPaymentByTxnRef(txnRef)
        }).send(res);
    };

    public getPaymentsByOrderId = async (req: Request, res: Response, _: any) => {
        const { orderId } = req.params;

        new OkResponse({
            message: 'Payments retrieved successfully',
            metadata: await paymentService.getPaymentsByOrderId(orderId)
        }).send(res);
    };

    public getPayments: RequestWithQuery<PaymentQuerySchema> = async (req, res, _) => {
        // This would be for admin to view all payments with filters
        // Implementation can be added later if needed
        new OkResponse({
            message: 'Payments retrieved successfully',
            metadata: []
        }).send(res);
    };

    public updatePaymentStatus = async (req: Request, res: Response, _: any) => {
        try {
            const { paymentId } = req.body;

            console.log('🔄 Updating payment status for payment ID:', paymentId);

            if (!paymentId) {
                res.status(400).json({
                    success: false,
                    message: 'Payment ID is required'
                });
                return;
            }

            // Find payment by ID
            const payment = await paymentService.updatePaymentStatusById(paymentId);

            console.log('✅ Payment status updated successfully');

            res.status(200).json({
                success: true,
                message: 'Payment status updated successfully',
                data: payment
            });

        } catch (error: any) {
            console.error('❌ Update payment status error:', error);

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update payment status'
            });
        }
    };
})(); 