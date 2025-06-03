import { z } from "zod";
import { apiService } from '../services/api.js';
import type { ApiResponse, PopularProduct } from '../services/api.js';

export const getPopularProductsTool = {
    name: "popular-products",
    description: "Lấy danh sách sản phẩm phổ biến dựa trên số lượng đã bán - trả về raw response",
    inputSchema: {
        page: z.number().min(1).optional().describe("Số trang (mặc định: 1)"),
        limit: z.number().min(1).max(100).optional().describe("Số sản phẩm trên mỗi trang (mặc định: 50, tối đa: 100)")
    },
    handler: async ({ page = 1, limit = 50 }: { page?: number; limit?: number }) => {
        try {
            // Use axios service to get popular products
            const response: ApiResponse<PopularProduct[]> = await apiService.getPopularProducts(page, limit);

            // Return raw response as JSON
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(response, null, 2)
                    }
                ]
            };

        } catch (error: any) {
            console.error('Error getting popular products:', error);

            const errorResponse = {
                error: true,
                message: error.message || 'Lỗi không xác định',
                type: error.name || 'UnknownError',
                timestamp: new Date().toISOString()
            };

            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify(errorResponse, null, 2)
                    }
                ]
            };
        }
    }
}; 