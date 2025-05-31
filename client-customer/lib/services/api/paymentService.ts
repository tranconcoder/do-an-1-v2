import apiClient from '../axiosInstance';

// Types
export interface CreateVNPayPaymentRequest {
    orderId: string;
    amount: number;
    orderInfo: string;
    locale?: 'vn' | 'en';
    bankCode?: string;
    ipAddr?: string;
}

export interface VNPayPaymentResponse {
    paymentUrl: string;
    txnRef: string;
}

export interface PaymentReturnData {
    success: boolean;
    message: string;
    orderId: string;
    txnRef: string;
    amount?: number;
    responseCode?: string;
}

export interface Payment {
    _id: string;
    order_id: string;
    txn_ref: string;
    amount: number;
    payment_method: 'cod' | 'vnpay' | 'bank_transfer';
    payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_url?: string;
    vnpay_transaction_no?: string;
    vnpay_response_code?: string;
    created_at: string;
    completed_at?: string;
}

export interface CreateOrderWithVNPayResponse {
    orders: Array<{
        _id: string;
        order_status: string;
        price_to_payment: number;
        payment_type: string;
        customer_full_name: string;
        shop_name: string;
        created_at: string;
    }>;
}

class PaymentService {
    // Get client IP address from ipify.org
    async getClientIP(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            console.log('Client IP from ipify.org:', data.ip);
            return data.ip;
        } catch (error) {
            console.error('Failed to get IP from ipify.org:', error);
            // Fallback to a default IP or let server handle it
            return '';
        }
    }

    // Create VNPay payment URL
    async createVNPayPayment(data: CreateVNPayPaymentRequest): Promise<VNPayPaymentResponse> {
        // Get client IP if not provided
        if (!data.ipAddr) {
            data.ipAddr = await this.getClientIP();
        }

        const response = await apiClient.post('/payment/vnpay/create', data);
        return response.data.metadata;
    }

    // Create order with VNPay payment
    async createOrderWithVNPay(): Promise<CreateOrderWithVNPayResponse> {
        const response = await apiClient.post('/order/create-vnpay');
        return response.data.metadata;
    }

    // Handle VNPay return (process payment result)
    async handleVNPayReturn(params: Record<string, string>): Promise<PaymentReturnData> {
        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(`/payment/vnpay/return?${queryString}`);
        return response.data.metadata;
    }

    // Get payment by transaction reference
    async getPaymentByTxnRef(txnRef: string): Promise<Payment> {
        const response = await apiClient.get(`/payment/txn/${txnRef}`);
        return response.data.metadata;
    }

    // Get payments by order ID
    async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
        const response = await apiClient.get(`/payment/order/${orderId}`);
        return response.data.metadata;
    }

    // Create payment URL for existing order
    async createPaymentUrlForOrder(orderId: string, orderInfo?: string, bankCode?: string): Promise<VNPayPaymentResponse> {
        const response = await apiClient.get(`/order/${orderId}`);
        const order = response.data.metadata;

        // Get client IP from ipify.org
        const clientIP = await this.getClientIP();

        return this.createVNPayPayment({
            orderId: order._id,
            amount: order.price_to_payment,
            orderInfo: orderInfo || `Thanh toán đơn hàng #${order._id.slice(-8)}`,
            locale: 'vn',
            bankCode,
            ipAddr: clientIP
        });
    }

    // Open payment window
    openPaymentWindow(paymentUrl: string, onSuccess?: () => void, onError?: () => void): Window | null {
        const paymentWindow = window.open(
            paymentUrl,
            'vnpay_payment',
            'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        if (!paymentWindow) {
            console.error('Failed to open payment window. Please check popup blocker.');
            onError?.();
            return null;
        }

        // Monitor the payment window
        const checkClosed = setInterval(() => {
            if (paymentWindow.closed) {
                clearInterval(checkClosed);
                // Payment window was closed, could be success or cancellation
                // The actual result should be handled by the return URL
                console.log('Payment window closed');
            }
        }, 1000);

        return paymentWindow;
    }

    // Process payment for checkout with bank code selection
    async processVNPayCheckout(bankCode?: string): Promise<{ orders: any[], paymentWindows: Window[] }> {
        try {
            // Get client IP first
            const clientIP = await this.getClientIP();
            console.log('Using client IP for VNPay checkout:', clientIP);

            // Create orders with VNPay payment
            const orderResult = await this.createOrderWithVNPay();
            const orders = orderResult.orders || orderResult;

            if (!Array.isArray(orders) || orders.length === 0) {
                throw new Error('No orders created');
            }

            const paymentWindows: Window[] = [];

            // Create payment URLs for each order and open payment windows
            for (const order of orders) {
                try {
                    const paymentData = await this.createVNPayPayment({
                        orderId: order._id,
                        amount: order.price_to_payment,
                        orderInfo: `Thanh toán đơn hàng #${order._id.slice(-8)} - ${order.shop_name}`,
                        locale: 'vn',
                        bankCode,
                        ipAddr: clientIP
                    });

                    const paymentWindow = this.openPaymentWindow(paymentData.paymentUrl);
                    if (paymentWindow) {
                        paymentWindows.push(paymentWindow);
                    }
                } catch (error) {
                    console.error(`Failed to create payment for order ${order._id}:`, error);
                }
            }

            return { orders, paymentWindows };
        } catch (error) {
            console.error('Failed to process VNPay checkout:', error);
            throw error;
        }
    }

    async simulateIPNCall(vnpayParams: Record<string, string>) {
        try {
            console.log('🔄 Calling IPN simulation API with params:', vnpayParams);
            console.log('🌐 API Base URL:', process.env.NEXT_PUBLIC_API_URL);
            console.log('📡 Full endpoint:', '/payment/vnpay-ipn');

            const response = await apiClient.post('/payment/vnpay-ipn', vnpayParams);

            console.log('✅ IPN API Response:', response.data);
            console.log('📊 Response status:', response.status);
            console.log('📋 Response headers:', response.headers);

            return response.data;
        } catch (error: any) {
            console.error('❌ IPN API Error:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error config:', error.config);
            throw error;
        }
    }

    async updatePaymentStatus(paymentId: string) {
        try {
            console.log('🔄 Updating payment status for payment ID:', paymentId);

            const response = await apiClient.post('/payment/update-status', {
                paymentId: paymentId
            });

            console.log('✅ Payment status updated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Update payment status error:', error);
            throw error;
        }
    }
}

export default new PaymentService(); 