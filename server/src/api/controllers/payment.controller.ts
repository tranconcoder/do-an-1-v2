import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { RequestWithBody, RequestWithQuery } from '@/types/request.js';
import paymentService from '@/services/payment.service.js';
import { Request, Response } from 'express';
import {
    CreateVNPayPaymentSchema,
    VNPayReturnSchema,
    PaymentQuerySchema
} from '@/validations/zod/payment.zod.js';
import { BadRequestErrorResponse } from '@/response/error.response.js';

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
        const { paymentId } = req.body;

        if (!paymentId) {
            throw new BadRequestErrorResponse({ message: 'Payment ID is required!' });
        }

        new OkResponse({
            message: 'Payment status updated successfully',
            metadata: await paymentService.updatePaymentStatusById(paymentId)
        }).send(res);
    };

    // ==================== REFUND ENDPOINTS ====================

    public createRefund = async (req: Request, res: Response, _: any) => {
        try {
            const { paymentId, amount, reason, notes } = req.body;

            console.log('🔄 Creating refund:', { paymentId, amount, reason });

            if (!paymentId || !amount) {
                res.status(400).json({
                    success: false,
                    message: 'Payment ID and amount are required'
                });
                return;
            }

            const result = await paymentService.createRefund({
                paymentId,
                amount: parseFloat(amount),
                reason,
                notes
            });

            console.log('✅ Refund created successfully');

            res.status(201).json({
                success: true,
                message: 'Refund created successfully',
                data: {
                    refund_id: result.refundId,
                    payment_id: paymentId,
                    amount: amount,
                    status: 'pending',
                    refund_entry: result.refundEntry
                }
            });

        } catch (error: any) {
            console.error('❌ Create refund error:', error);

            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to create refund'
            });
        }
    };

    public updateRefundStatus = async (req: Request, res: Response, _: any) => {
        try {
            const { paymentId, refundId, status, transactionId, notes } = req.body;

            console.log('🔄 Updating refund status:', { paymentId, refundId, status });

            if (!paymentId || !refundId || !status) {
                res.status(400).json({
                    success: false,
                    message: 'Payment ID, refund ID, and status are required'
                });
                return;
            }

            if (!['completed', 'failed'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Status must be either "completed" or "failed"'
                });
                return;
            }

            const payment = await paymentService.updateRefundStatus({
                paymentId,
                refundId,
                status,
                transactionId,
                notes
            });

            console.log('✅ Refund status updated successfully');

            res.status(200).json({
                success: true,
                message: 'Refund status updated successfully',
                data: payment
            });

        } catch (error: any) {
            console.error('❌ Update refund status error:', error);

            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to update refund status'
            });
        }
    };

    public getRefundHistory = async (req: Request, res: Response, _: any) => {
        try {
            const { paymentId } = req.params;

            console.log('🔍 Getting refund history for payment:', paymentId);

            if (!paymentId) {
                res.status(400).json({
                    success: false,
                    message: 'Payment ID is required'
                });
                return;
            }

            const refundHistory = await paymentService.getRefundHistory(paymentId);

            console.log('✅ Refund history retrieved successfully');

            res.status(200).json({
                success: true,
                message: 'Refund history retrieved successfully',
                data: refundHistory
            });

        } catch (error: any) {
            console.error('❌ Get refund history error:', error);

            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get refund history'
            });
        }
    };

    public getRefundsByStatus = async (req: Request, res: Response, _: any) => {
        try {
            const { status } = req.params;

            console.log('🔍 Getting refunds by status:', status);

            if (!['pending', 'completed', 'failed'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be pending, completed, or failed'
                });
                return;
            }

            const refunds = await paymentService.getRefundsByStatus(status as 'pending' | 'completed' | 'failed');

            console.log('✅ Refunds retrieved successfully');

            res.status(200).json({
                success: true,
                message: 'Refunds retrieved successfully',
                data: refunds
            });

        } catch (error: any) {
            console.error('❌ Get refunds by status error:', error);

            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get refunds'
            });
        }
    };

    public processVNPayRefund = async (req: Request, res: Response, _: any) => {
        try {
            const { paymentId, refundId, amount } = req.body;

            console.log('🔄 Processing VNPay refund:', { paymentId, refundId, amount });

            if (!paymentId || !refundId || !amount) {
                res.status(400).json({
                    success: false,
                    message: 'Payment ID, refund ID, and amount are required'
                });
                return;
            }

            const result = await paymentService.processVNPayRefund({
                paymentId,
                refundId,
                amount: parseFloat(amount)
            });

            console.log('✅ VNPay refund processed successfully');

            res.status(200).json({
                success: true,
                message: 'VNPay refund processed successfully',
                data: result
            });

        } catch (error: any) {
            console.error('❌ Process VNPay refund error:', error);

            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to process VNPay refund'
            });
        }
    };

    // ==================== END REFUND ENDPOINTS ====================
})(); 