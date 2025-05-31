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

            const vnpParams = req.query;

            // Validate required parameters
            if (!vnpParams.vnp_TxnRef || !vnpParams.vnp_ResponseCode || !vnpParams.vnp_SecureHash) {
                console.error('❌ Missing required VNPay IPN parameters');
                return res.status(200).json({
                    RspCode: '97',
                    Message: 'Invalid parameters'
                });
            }

            console.log('Processing VNPay IPN for transaction:', vnpParams.vnp_TxnRef);

            const result = await paymentService.handleVNPayIPN(vnpParams);

            console.log('VNPay IPN processing result:', result);

            // VNPay requires specific response format for IPN
            if (result.success) {
                console.log('✅ VNPay IPN processed successfully');
                res.status(200).json({
                    RspCode: '00',
                    Message: 'Confirm Success'
                });
            } else {
                console.log('❌ VNPay IPN processing failed:', result.message);
                res.status(200).json({
                    RspCode: '01',
                    Message: result.message || 'Order not found'
                });
            }
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

    public testVNPay = async (req: Request, res: Response, _: any) => {
        try {
            // Example: Client should get IP from ipify.org before calling this API
            // const clientIp = await fetch('https://api.ipify.org').then(res => res.text());

            const testData = {
                orderId: '6745a1b2c3d4e5f6789012ab', // Make sure this order exists in your database
                amount: 100000, // 100,000 VND
                orderInfo: 'Test payment for order #6745a1b2c3d4e5f6789012ab',
                ipAddr: '203.113.152.1', // Example IP - in real usage, get from ipify.org
                locale: 'vn' as const,
                bankCode: 'VNPAYQR' // Optional: for QR code payment
            };

            const result = await paymentService.createVNPayPaymentUrl(testData);

            res.json({
                success: true,
                message: 'VNPay URL generated successfully',
                data: result,
                testInfo: {
                    usedIP: testData.ipAddr,
                    amount: testData.amount,
                    amountInVND: testData.amount,
                    note: 'In production, client should get IP from https://api.ipify.org'
                }
            });
        } catch (error: any) {
            console.error('VNPay test error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Unknown error',
                error: error.stack
            });
        }
    };

    // public testVNPaySignature = async (req: Request, res: Response, _: any) => {
    //     try {
    //         const testSignature = await paymentService.testSignatureGeneration();

    //         res.json({
    //             success: true,
    //             message: 'Signature generation test completed',
    //             testSignature,
    //             note: 'Check console logs for detailed steps'
    //         });
    //     } catch (error: any) {
    //         console.error('Signature test error:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: error.message || 'Unknown error',
    //             error: error.stack
    //         });
    //     }
    // };
})(); 