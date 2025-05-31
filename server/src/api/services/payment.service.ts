import crypto from 'crypto';
import querystring from 'qs';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import orderModel from '@/models/order.model.js';
import { OrderStatus } from '@/enums/order.enum.js';
import paymentModel from '@/models/payment.model.js';
import { ignoreLogger, VNPay, VnpLocale, ProductCode, dateFormat, VnpCurrCode, Bank } from 'vnpay';

export default new (class PaymentService {
    private static vnpay = new VNPay({
        tmnCode: 'FNAX6Q4P',
        secureSecret: 'ZVXPMEMXF4K5UU246CAA3DNO2DCV6QSR',
        vnpayHost: 'https://sandbox.vnpayment.vn',
        queryDrAndRefundHost: 'https://sandbox.vnpayment.vn', // tùy chọn, trường hợp khi url của querydr và refund khác với url khởi tạo thanh toán (thường sẽ sử dụng cho production)

        testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
        hashAlgorithm: 'SHA512' as const, // tùy chọn

        /**
         * Bật/tắt ghi log
         * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
         */
        enableLog: true, // tùy chọn

        /**
         * Hàm `loggerFn` sẽ được gọi để ghi log khi enableLog là true
         * Mặc định, loggerFn sẽ ghi log ra console
         * Bạn có thể cung cấp một hàm khác nếu muốn ghi log vào nơi khác
         *
         * `ignoreLogger` là một hàm không làm gì cả
         */
        loggerFn: ignoreLogger, // tùy chọn

        /**
         * Tùy chỉnh các đường dẫn API của VNPay
         * Thường không cần thay đổi trừ khi:
         * - VNPay cập nhật đường dẫn của họ
         * - Có sự khác biệt giữa môi trường sandbox và production
         */
        endpoints: {
            paymentEndpoint: 'paymentv2/vpcpay.html',
            queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
            getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
        }, // tùy chọn
    });

    private readonly vnpayConfig = {
        tmnCode: 'FNAX6Q4P',
        hashSecret: 'ZVXPMEMXF4K5UU246CAA3DNO2DCV6QSR',
        url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        returnUrl: 'https://aliconcon.tail61bbbd.ts.net:3000/payment/vnpay-return',
        ipnUrl: 'https://3.107.91.101:4000/payment/vnpay-ipn'
    };


    private sortParams(obj: any) {
        const sortedObj: any = Object.entries(obj)
            .filter(
                ([key, value]) => value !== "" && value !== undefined && value !== null
            )
            .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
            .reduce((acc: any, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        return sortedObj;
    }

    private createVNPaySignature(params: any, hashSecret: string): string {
        // Remove secure hash fields if they exist
        const paramsToSign = { ...params };
        delete paramsToSign['vnp_SecureHash'];
        delete paramsToSign['vnp_SecureHashType'];

        // Sort parameters alphabetically using the working sortParams method
        const sortedParams = this.sortParams(paramsToSign);

        // Create query string using URLSearchParams (like in working code)
        const urlParams = new URLSearchParams();
        for (let [key, value] of Object.entries(sortedParams)) {
            urlParams.append(key, String(value));
        }

        const querystring = urlParams.toString();
        console.log('Data to sign:', querystring);

        // Create HMAC-SHA512 signature (exactly like working code)
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signature = hmac.update(querystring).digest('hex');

        console.log('Generated signature:', signature);

        return signature;
    }


    private formatVNPayAmount(amount: number): number {
        // VNPay requires amount in smallest currency unit (VND cents)
        // Convert to integer and ensure no decimal places
        const vnpAmount = Math.round(amount);

        // Additional validation
        if (isNaN(vnpAmount) || vnpAmount <= 0) {
            throw new BadRequestErrorResponse({ message: 'Invalid payment amount' });
        }

        console.log(`Amount conversion: ${amount} VND -> ${vnpAmount} (VNPay format)`);
        return vnpAmount;
    }

    public async createVNPayPaymentUrl({
        orderId,
        amount,
        orderInfo,
        ipAddr,
        locale = 'vn',
        bankCode = ""
    }: {
        orderId: string;
        amount: number;
        orderInfo: string;
        ipAddr: string;
        locale?: string;
        bankCode?: string;
    }) {
        /* ------------------- Find the order ------------------- */
        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new NotFoundErrorResponse({ message: 'Order not found!' });
        }

        /* ----------- Check if order can be paid ----------- */
        if (order.order_status !== OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestErrorResponse({
                message: 'Order is not in pending payment status!'
            });
        }

        /* ------------------- Generate transaction reference ------------------- */
        const txnRef = `${orderId}-${Date.now()}`;

        /* ------------------- Set expiration date ------------------- */
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const paymentUrl = PaymentService.vnpay.buildPaymentUrl({
            vnp_Amount: this.formatVNPayAmount(amount),
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: this.vnpayConfig.returnUrl,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow),
            vnp_BankCode: bankCode || "VNPAYQR",
            vnp_CurrCode: VnpCurrCode.VND,
        });

        /* ------------------- Create payment record ------------------- */
        await paymentModel.create({
            order_id: orderId,
            txn_ref: txnRef,
            amount: amount,
            payment_method: 'vnpay',
            payment_status: 'pending',
            payment_url: paymentUrl,
            created_at: new Date(),
            vnpay_data: {
                vnp_TxnRef: txnRef,
                vnp_Amount: this.formatVNPayAmount(amount),
                vnp_OrderInfo: orderInfo,
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow)
            }
        });

        return {
            paymentUrl,
            txnRef
        };
    }

    public async handleVNPayReturn(vnpParams: any) {
        let secureHash = vnpParams['vnp_SecureHash'];

        console.log('VNPay return params received:', vnpParams);

        // Verify signature using the same method
        const expectedSignature = this.createVNPaySignature(vnpParams, this.vnpayConfig.hashSecret);

        console.log('Expected signature:', expectedSignature);
        console.log('Received signature:', secureHash);

        if (secureHash === expectedSignature) {
            console.log('✅ Signature verification successful');

            const vnpTxnRef = vnpParams['vnp_TxnRef'];
            const vnpResponseCode = vnpParams['vnp_ResponseCode'];
            const vnpTransactionNo = vnpParams['vnp_TransactionNo'];
            const vnpAmount = vnpParams['vnp_Amount'];

            /* ------------------- Find payment record ------------------- */
            const payment = await paymentModel.findOne({ txn_ref: vnpTxnRef });
            if (!payment) {
                throw new NotFoundErrorResponse({ message: 'Payment record not found!' });
            }

            /* ------------------- Update payment status ------------------- */
            if (vnpResponseCode === '00') {
                // Payment successful
                payment.payment_status = 'completed';
                payment.vnpay_transaction_no = vnpTransactionNo;
                payment.vnpay_response_code = vnpResponseCode;
                payment.completed_at = new Date();
                await payment.save();

                /* ------------------- Update order status ------------------- */
                await orderModel.findByIdAndUpdate(
                    payment.order_id,
                    {
                        order_status: OrderStatus.PENDING,
                        payment_paid: true,
                        payment_date: new Date()
                    },
                    { new: true }
                );

                return {
                    success: true,
                    message: 'Payment successful',
                    orderId: payment.order_id.toString(),
                    txnRef: vnpTxnRef,
                    amount: vnpAmount / 100
                };
            } else {
                // Payment failed
                payment.payment_status = 'failed';
                payment.vnpay_response_code = vnpResponseCode;
                payment.completed_at = new Date();
                await payment.save();

                return {
                    success: false,
                    message: 'Payment failed',
                    orderId: payment.order_id.toString(),
                    txnRef: vnpTxnRef,
                    responseCode: vnpResponseCode
                };
            }
        } else {
            console.log('❌ Signature verification failed');
            throw new BadRequestErrorResponse({ message: 'Invalid signature' });
        }
    }

    public async handleVNPayIPN(vnpParams: any) {
        // Similar to handleVNPayReturn but for server-to-server notification
        return await this.handleVNPayReturn(vnpParams);
    }

    public async getPaymentByTxnRef(txnRef: string) {
        const payment = await paymentModel.findOne({ txn_ref: txnRef }).populate('order_id');
        if (!payment) {
            throw new NotFoundErrorResponse({ message: 'Payment not found!' });
        }
        return payment;
    }

    public async getPaymentsByOrderId(orderId: string) {
        const payments = await paymentModel.find({ order_id: orderId });
        return payments;
    }

    // public testSignatureGeneration() {
    //     // Test with sample data from VNPay documentation
    //     const testParams = {
    //         vnp_Amount: "1806000",
    //         vnp_Command: "pay",
    //         vnp_CreateDate: "20210801153333",
    //         vnp_CurrCode: "VND",
    //         vnp_IpAddr: "127.0.0.1",
    //         vnp_Locale: "vn",
    //         vnp_OrderInfo: "Thanh toan don hang :5",
    //         vnp_OrderType: "other",
    //         vnp_ReturnUrl: "https://domainmerchant.vn/ReturnUrl",
    //         vnp_TmnCode: "DEMOV210",
    //         vnp_TxnRef: "5",
    //         vnp_Version: "2.1.0"
    //     };

    //     // Expected signature from VNPay documentation
    //     const expectedSignature = "3e0d61a0c0534b2e36680b3f7277743e8784cc4e1d68fa7d276e79c23be7d6318d338b477910a27992f5057bb1582bd44bd82ae8009ffaf6d141219218625c42";

    //     console.log('=== Testing Signature Generation with VNPay Sample Data ===');
    //     console.log('Test parameters:', testParams);

    //     const signature = this.createVNPaySignature(testParams, 'DEMOSECRETKEY');

    //     console.log('Generated signature:', signature);
    //     console.log('Expected signature :', expectedSignature);
    //     console.log('Signatures match   :', signature === expectedSignature);

    //     if (signature === expectedSignature) {
    //         console.log('✅ Signature generation is CORRECT');
    //     } else {
    //         console.log('❌ Signature generation is INCORRECT');
    //     }

    //     console.log('=== End Test ===');

    //     return {
    //         generated: signature,
    //         expected: expectedSignature,
    //         isCorrect: signature === expectedSignature
    //     };
    // }
})(); 