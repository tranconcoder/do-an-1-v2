import apiClient from '../axiosInstance';

export interface CreateOrderRequest {
    paymentType: 'cod' | 'vnpay' | 'bank_transfer' | 'credit_card';
}

export interface CreateOrderResponse {
    message: string;
    metadata: {
        _id: string;
        customer: string;
        customer_address: string;
        customer_avatar: string;
        customer_email: string;
        customer_full_name: string;
        customer_phone: string;
        payment_type: string;
        payment_paid: boolean;
        price_to_payment: number;
        price_total_raw: number;
        order_status: string;
        createdAt: string;
        updatedAt: string;
    };
}

class OrderService {
    /**
     * Create a new order
     */
    async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        const response = await apiClient.post<CreateOrderResponse>('/order/create', request);
        return response.data;
    }
}

const orderService = new OrderService();
export default orderService; 