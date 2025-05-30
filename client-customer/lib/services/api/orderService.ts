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
        created_at: string;
        updated_at: string;
    };
}

export interface CancelOrderResponse {
    message: string;
    metadata: {
        _id: string;
        order_status: string;
        updated_at: string;
    };
}

export interface OrderHistoryItem {
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
    order_checkout: {
        shops_info: Array<{
            shop_id: string;
            shop_name: string;
            products_info: Array<{
                id: string;
                name: string;
                thumb: string;
                price: number;
                quantity: number;
                price_raw: number;
            }>;
            fee_ship: number;
            total_price_raw: number;
            total_discount_price: number;
            discount?: {
                discount_id: string;
                discount_name: string;
                discount_code: string;
                discount_value: number;
                discount_type: string;
            };
        }>;
        total_price_raw: number;
        total_checkout: number;
        total_fee_ship: number;
        total_discount_shop_price: number;
        total_discount_admin_price: number;
        total_discount_price: number;
        discount?: {
            discount_id: string;
            discount_name: string;
            discount_code: string;
            discount_value: number;
            discount_type: string;
        };
    };
    discount?: {
        discount_id: string;
        discount_name: string;
        discount_code: string;
        discount_value: number;
        discount_type: string;
    };
    created_at: string;
    updated_at: string;
}

export interface GetOrderHistoryParams {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'created_at' | 'updated_at' | 'price_to_payment';
    sortOrder?: 'asc' | 'desc';
    paymentType?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface GetOrderHistoryResponse {
    message: string;
    metadata: {
        orders: OrderHistoryItem[];
        pagination: PaginationInfo;
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

    /**
     * Get order history for the authenticated user
     */
    async getOrderHistory(params?: GetOrderHistoryParams): Promise<GetOrderHistoryResponse> {
        const queryParams: any = {};

        if (params?.status && params.status !== 'all') {
            queryParams.status = params.status;
        }
        if (params?.page) {
            queryParams.page = params.page;
        }
        if (params?.limit) {
            queryParams.limit = params.limit;
        }
        if (params?.search) {
            queryParams.search = params.search;
        }
        if (params?.sortBy) {
            queryParams.sortBy = params.sortBy;
        }
        if (params?.sortOrder) {
            queryParams.sortOrder = params.sortOrder;
        }
        if (params?.paymentType) {
            queryParams.paymentType = params.paymentType;
        }
        if (params?.dateFrom) {
            queryParams.dateFrom = params.dateFrom;
        }
        if (params?.dateTo) {
            queryParams.dateTo = params.dateTo;
        }

        const response = await apiClient.get<GetOrderHistoryResponse>('/order/history', {
            params: queryParams
        });
        return response.data;
    }

    /**
     * Cancel an order
     */
    async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
        const response = await apiClient.patch<CancelOrderResponse>(`/order/${orderId}/cancel`);
        return response.data;
    }
}

const orderService = new OrderService();
export default orderService; 