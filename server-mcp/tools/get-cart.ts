import { z } from "zod";
import { apiService } from '../services/api.js';
import type { ApiResponse } from '../services/api.js';

export const getCartTool = {
    name: "get-cart",
    description: "Lấy giỏ hàng của người dùng hiện tại với access token",
    inputSchema: {
        accessToken: z.string().describe("Access token của người dùng để xác thực")
    },
    handler: async ({ accessToken }: { accessToken: string }) => {
        try {
            console.log({
                accessToken: accessToken ? 'Present' : 'Missing'
            });

            if (!accessToken) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify({
                                error: true,
                                message: "Access token is required to get cart",
                                data: null
                            }, null, 2)
                        }
                    ]
                };
            }

            // Call API with authorization header
            const response = await apiService.getUserCart(accessToken);

            console.log('🛒 [get-cart] API response received');

            // Return cart data
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            message: "Lấy giỏ hàng thành công",
                            data: response.metadata || response,
                            cartItemCount: Array.isArray(response.metadata) ? response.metadata.length : 0
                        }, null, 2)
                    }
                ]
            };

        } catch (error: any) {
            console.error('Error getting user cart:', error);

            const errorResponse = {
                error: true,
                message: error.message || 'Không thể lấy giỏ hàng',
                type: error.name || 'CartError',
                timestamp: new Date().toISOString(),
                data: null,
                cartItemCount: 0
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