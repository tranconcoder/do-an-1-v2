import { Router, RequestHandler } from 'express';
import paymentController from '@/controllers/payment.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import {
    validateCreateVNPayPayment,
    validateVNPayReturn,
    validatePaymentQuery,
    VNPayReturnSchema
} from '@/validations/zod/payment.zod.js';

const paymentRoute = Router();

/**
 * Create VNPay payment URL (authenticated users only)
 * @route POST /api/payment/vnpay/create
 * @access Private
 * @returns {object} 200 - An object containing the payment URL and transaction reference
 */
paymentRoute.post(
    '/vnpay/create',
    authenticate,
    validateCreateVNPayPayment,
    catchError(paymentController.createVNPayPayment)
);

/**
 * VNPay return URL (public endpoint for VNPay callback)
 * This endpoint is called by VNPay after the user completes the payment.
 * @route GET /api/payment/vnpay/return
 * @access Public
 * @param {object} req.query - VNPay return parameters
 * @returns {object} 200 - An object indicating the success status and payment details
 */
paymentRoute.get(
    '/vnpay/return',
    validateVNPayReturn,
    catchError(paymentController.handleVNPayReturn as any)
);

/**
 * VNPay IPN URL (public endpoint for VNPay server-to-server notification)
 * This endpoint is called by VNPay to notify the server about the transaction status.
 * @route GET /api/payment/vnpay/ipn
 * @access Public
 * @param {object} req.query - VNPay IPN parameters
 * @returns {object} 200 - A success message with RspCode and Message
 */
paymentRoute.get(
    '/vnpay-ipn',
    (req, res, next) => {
        console.log({
            query: req.query,
            body: req.body,
        })

        res.send('OK');
    },
    // validateVNPayReturn,
    // catchError(paymentController.handleVNPayIPN as any)
);

/**
 * Get payment by transaction reference (authenticated users only)
 * @route GET /api/payment/txn/:txnRef
 * @access Private
 * @param {string} txnRef - Transaction reference ID
 * @returns {object} 200 - The payment details
 */
paymentRoute.get(
    '/txn/:txnRef',
    authenticate,
    catchError(paymentController.getPaymentByTxnRef)
);

/**
 * Get payments by order ID (authenticated users only)
 * @route GET /api/payment/order/:orderId
 * @access Private
 * @param {string} orderId - Order ID
 * @returns {array} 200 - An array of payment details for the order
 */
paymentRoute.get(
    '/order/:orderId',
    authenticate,
    catchError(paymentController.getPaymentsByOrderId)
);

/**
 * Get payments with filters (admin only - can be implemented later)
 * @route GET /api/payment/
 * @access Private
 * @param {object} req.query - Query parameters for filtering payments
 * @returns {array} 200 - An array of payment details
 */
paymentRoute.get(
    '/',
    authenticate,
    validatePaymentQuery,
    catchError(paymentController.getPayments)
);


export default paymentRoute; 