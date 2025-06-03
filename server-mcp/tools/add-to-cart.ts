import { z } from "zod";
import { apiService } from '../services/api.js';
import type { ApiResponse } from '../services/api.js';

export const addToCartTool = {
    name: "add-to-cart",
    description: "Thêm sản phẩm vào giỏ hàng của người dùng",
    inputSchema: {
        accessToken: z.string().describe("Access token của người dùng để xác thực"),
        skuId: z.string().describe("ID của SKU sản phẩm cần thêm vào cart"),
        quantity: z.number().min(1).default(1).describe("Số lượng sản phẩm cần thêm (mặc định: 1)")
    },
    handler: async ({ accessToken, skuId, quantity = 1 }: { accessToken: string, skuId: string, quantity?: number }) => {
        try {
            console.log({
                accessToken: accessToken ? 'Present' : 'Missing',
                skuId,
                quantity
            });

            if (!accessToken) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify({
                                error: true,
                                message: "Access token is required to add to cart",
                                data: null
                            }, null, 2)
                        }
                    ]
                };
            }

            if (!skuId) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify({
                                error: true,
                                message: "SKU ID is required to add product to cart",
                                data: null
                            }, null, 2)
                        }
                    ]
                };
            }

            // Call API to add to cart
            const response = await apiService.addToCart(accessToken, skuId, quantity);

            console.log('🛒 [add-to-cart] Product added to cart successfully');

            // Return success response
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            message: "Đã thêm sản phẩm vào giỏ hàng thành công",
                            data: response.metadata || response,
                            productInfo: {
                                skuId,
                                quantity
                            }
                        }, null, 2)
                    }
                ]
            };

        } catch (error: any) {
            console.error('Error adding to cart:', error);

            const errorResponse = {
                error: true,
                message: error.message || 'Không thể thêm sản phẩm vào giỏ hàng',
                type: error.name || 'AddToCartError',
                timestamp: new Date().toISOString(),
                productInfo: {
                    skuId,
                    quantity
                }
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