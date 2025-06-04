import apiClient from '../axiosInstance';

export interface CreateReviewRequest {
    order_id: string;
    sku_id: string;
    review_content: string;
    review_rating: number;
    review_images?: string[];
}

export interface Review {
    _id: string;
    user_id: {
        _id: string;
        user_fullName: string;
        user_avatar?: string;
    } | string;
    order_id: string;
    shop_id: string;
    sku_id: string;
    review_content: string;
    review_rating: number;
    review_images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStatistics {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

export interface ReviewsWithStatistics {
    reviews: Review[];
    statistics: ReviewStatistics;
}

export interface CreateReviewResponse {
    message: string;
    metadata: Review;
}

export interface GetReviewsByOrderResponse {
    message: string;
    metadata: Review[];
}

export interface GetLastReviewBySkuResponse {
    message: string;
    metadata: Review | null;
}

export interface GetReviewsBySkuResponse {
    message: string;
    metadata: ReviewsWithStatistics;
}

class ReviewService {
    /**
     * Create a new review for a completed order
     */
    async createReview(request: CreateReviewRequest): Promise<CreateReviewResponse> {
        const response = await apiClient.post<CreateReviewResponse>('/review/create', request);
        return response.data;
    }

    /**
     * Get reviews by order ID
     */
    async getReviewsByOrderId(orderId: string): Promise<GetReviewsByOrderResponse> {
        const response = await apiClient.get<GetReviewsByOrderResponse>(`/review/order/${orderId}`);
        return response.data;
    }

    /**
     * Get last review by SKU ID
     */
    async getLastReviewBySkuId(skuId: string): Promise<GetLastReviewBySkuResponse> {
        const response = await apiClient.get<GetLastReviewBySkuResponse>(`/review/sku/${skuId}`);
        return response.data;
    }

    /**
     * Get all reviews by SKU ID with statistics
     */
    async getReviewsBySkuId(skuId: string): Promise<GetReviewsBySkuResponse> {
        const response = await apiClient.get<GetReviewsBySkuResponse>(`/review/sku/${skuId}/all`);
        return response.data;
    }
}

const reviewService = new ReviewService();
export default reviewService; 