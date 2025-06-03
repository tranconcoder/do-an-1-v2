import { z } from "zod";
import { apiService } from '../services/api.js';
import type { ApiResponse } from '../services/api.js';

export const getUserProfileTool = {
    name: "get-user-profile",
    description: "Lấy thông tin profile của người dùng hiện tại với access token",
    inputSchema: {
        accessToken: z.string().optional().describe("Access token của người dùng (nếu có)")
    },
    handler: async ({ accessToken }: { accessToken?: string }) => {
        try {
            // Create a new service instance with authorization header if token provided
            let response: ApiResponse<any>;

            if (accessToken) {
                // Call API with authorization header
                response = await apiService.getUserProfile(accessToken);
            } else {
                // Return guest user info if no token
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify({
                                isGuest: true,
                                user: {
                                    _id: "guest",
                                    user_fullName: "Khách",
                                    user_email: null,
                                    phoneNumber: null,
                                    user_role: "guest",
                                    user_avatar: null,
                                    user_sex: null,
                                    user_status: "active",
                                    user_dayOfBirth: null,
                                    role_name: "USER"
                                },
                                message: "Người dùng chưa đăng nhập"
                            }, null, 2)
                        }
                    ]
                };
            }

            // Return profile data
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify({
                            isGuest: false,
                            ...response.metadata.user,
                            message: "Lấy thông tin profile thành công"
                        }, null, 2)
                    }
                ]
            };

        } catch (error: any) {
            console.error('Error getting user profile:', error);

            const errorResponse = {
                error: true,
                isGuest: true,
                message: error.message || 'Không thể lấy thông tin profile',
                type: error.name || 'ProfileError',
                timestamp: new Date().toISOString(),
                user: {
                    _id: "guest",
                    user_fullName: "Khách",
                    user_email: null,
                    phoneNumber: null,
                    user_role: "guest",
                    user_avatar: null,
                    user_sex: null,
                    user_status: "active",
                    user_dayOfBirth: null,
                    role_name: "USER"
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