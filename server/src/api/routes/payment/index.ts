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
 * @route GET/POST /api/payment/vnpay-ipn
 * @access Public
 * @param {object} req.query - VNPay IPN parameters
 * @returns {object} 200 - A success message with RspCode and Message
 */
paymentRoute.get(
    '/vnpay-ipn',
    validateVNPayReturn,
    catchError(paymentController.handleVNPayIPN as any)
);

paymentRoute.post(
    '/vnpay-ipn',
    catchError(paymentController.handleVNPayIPN as any)
);

/**
 * Update payment status by payment ID
 * @route POST /api/payment/update-status
 * @access Private
 * @param {string} paymentId - Payment ID to update
 * @returns {object} 200 - Updated payment status
 */
paymentRoute.post(
    '/update-status',
    authenticate,
    catchError(paymentController.updatePaymentStatus)
);

/**
 * Get payment by transaction reference
 * @route GET /api/payment/txn/:txnRef
 * @access Private
 * @param {string} txnRef - Transaction reference
 * @returns {object} 200 - Payment details
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

// ==================== REFUND ROUTES ====================

/**
 * Create a refund for a payment
 * @route POST /api/payment/refund/create
 * @access Private
 * @param {string} paymentId - Payment ID to refund
 * @param {number} amount - Amount to refund
 * @param {string} reason - Reason for refund (optional)
 * @param {string} notes - Additional notes (optional)
 * @returns {object} 201 - Refund creation success response
 */
paymentRoute.post(
    '/refund/create',
    authenticate,
    catchError(paymentController.createRefund)
);

/**
 * Update refund status
 * @route PUT /api/payment/refund/status
 * @access Private
 * @param {string} paymentId - Payment ID
 * @param {string} refundId - Refund ID
 * @param {string} status - New status (completed/failed)
 * @param {string} transactionId - Transaction ID (optional)
 * @param {string} notes - Additional notes (optional)
 * @returns {object} 200 - Refund status update success response
 */
paymentRoute.put(
    '/refund/status',
    authenticate,
    catchError(paymentController.updateRefundStatus)
);

/**
 * Get refund history for a payment
 * @route GET /api/payment/:paymentId/refunds
 * @access Private
 * @param {string} paymentId - Payment ID
 * @returns {object} 200 - Refund history with total amounts and refund list
 */
paymentRoute.get(
    '/:paymentId/refunds',
    authenticate,
    catchError(paymentController.getRefundHistory)
);

/**
 * Get refunds by status (admin endpoint)
 * @route GET /api/payment/refunds/status/:status
 * @access Private
 * @param {string} status - Refund status (pending/completed/failed)
 * @returns {array} 200 - Array of payments with refunds matching the status
 */
paymentRoute.get(
    '/refunds/status/:status',
    authenticate,
    catchError(paymentController.getRefundsByStatus)
);

/**
 * Process VNPay refund
 * @route POST /api/payment/refund/vnpay/process
 * @access Private
 * @param {string} paymentId - Payment ID
 * @param {string} refundId - Refund ID
 * @param {number} amount - Amount to refund
 * @returns {object} 200 - VNPay refund processing result
 */
paymentRoute.post(
    '/refund/vnpay/process',
    authenticate,
    catchError(paymentController.processVNPayRefund)
);

// ==================== END REFUND ROUTES ====================

export default paymentRoute; 