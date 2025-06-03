import { z } from "zod";
import { apiService } from '../services/api.js';
import type { ApiResponse } from '../services/api.js';

export const getUserProfileTool = {
    name: "get-user-profile",
    description: "Lấy thông tin profile người dùng hiện tại với access token",
    inputSchema: {
        accessToken: z.string().optional().describe("Access token của người dùng để xác thực (optional)")
    },
    handler: async ({ accessToken }: { accessToken?: string }) => {
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
                                _id: "guest",
                                user_fullName: "Khách",
                                user_email: null,
                                phoneNumber: null,
                                user_role: "guest",
                                user_avatar: null,
                                user_sex: null,
                                user_status: "active",
                                user_dayOfBirth: null,
                                role_name: "USER",
                                isGuest: true
                            }, null, 2)
                        }
                    ]
                };
            }

            // Call API with authorization header
            const response = await apiService.getUserProfile(accessToken);

            console.log('👤 [get-user-profile] API response received');

            // Process user data and prepare response
            let userData = response.metadata?.user || response.metadata || response;

            // Handle avatar URL
            if (userData.user_avatar && !userData.user_avatar.startsWith('http')) {
                userData.user_avatar = 'https://aliconcon.tail61bbbd.ts.net:4000/media/' + userData.user_avatar;
            }

            // Add markdown formatted profile info for rich display
            let profileMarkdown = `# 👤 Thông tin Profile\n\n`;

            if (userData.user_avatar) {
                profileMarkdown += `![Avatar của ${userData.user_fullName || 'User'}](${userData.user_avatar})\n\n`;
            }

            profileMarkdown += `**Tên**: ${userData.user_fullName || 'Chưa cập nhật'}\n`;
            profileMarkdown += `**Email**: ${userData.user_email || 'Chưa cập nhật'}\n`;
            profileMarkdown += `**Điện thoại**: ${userData.phoneNumber || 'Chưa cập nhật'}\n`;
            profileMarkdown += `**Vai trò**: ${userData.role_name || userData.user_role || 'USER'}\n`;
            profileMarkdown += `**Trạng thái**: ${userData.user_status === 'active' ? '✅ Hoạt động' : '❌ Ngưng hoạt động'}\n\n`;

            if (userData.user_dayOfBirth) {
                profileMarkdown += `**Ngày sinh**: ${new Date(userData.user_dayOfBirth).toLocaleDateString('vi-VN')}\n`;
            }

            // Return both JSON data and markdown
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify({
                            ...userData,
                            isGuest: false,
                            accessToken: accessToken,
                            profileMarkdown: profileMarkdown
                        }, null, 2)
                    }
                ]
            };

        } catch (error: any) {
            console.error('Error getting user profile:', error);

            // Return guest user on error
            const errorResponse = {
                _id: "guest",
                user_fullName: "Khách",
                user_email: null,
                phoneNumber: null,
                user_role: "guest",
                user_avatar: null,
                user_sex: null,
                user_status: "active",
                user_dayOfBirth: null,
                role_name: "USER",
                isGuest: true,
                error: error.message || 'Failed to get user profile',
                errorType: error.name || 'ProfileError',
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