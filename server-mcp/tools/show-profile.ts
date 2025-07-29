import { z } from "zod";
import { apiService } from '../services/api.js';
import type { ApiResponse } from '../services/api.js';

export const showProfileTool = {
    name: "show-profile",
    description: "Hiển thị thông tin profile người dùng với định dạng markdown đẹp mắt",
    inputSchema: {
        accessToken: z.string().describe("Access token của người dùng để xác thực")
    },
    handler: async ({ accessToken }: { accessToken: string }) => {
        try {
            console.log('👤 [show-profile] Getting user profile for display...');

            if (!accessToken) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `# ❌ Không thể hiển thị profile

Bạn cần đăng nhập để xem thông tin profile.

[Đăng nhập ngay](/auth/login) để có trải nghiệm tốt hơn! 🔐`
                        }
                    ]
                };
            }

            // Call API to get user profile
            const response = await apiService.getUserProfile(accessToken);
            const userData = response.metadata?.user || response.metadata || response;

            console.log('👤 [show-profile] Profile data retrieved successfully');

            // Handle avatar URL
            let avatarUrl = null;
            if (userData.user_avatar) {
                if (userData.user_avatar.startsWith('http')) {
                    avatarUrl = userData.user_avatar;
                } else {
                    avatarUrl = 'https://localhost:4000/media/' + userData.user_avatar;
                }
            }

            // Create beautiful markdown profile
            let profileMarkdown = `# 👤 Profile của ${userData.user_fullName || 'User'}\n\n`;

            if (avatarUrl) {
                profileMarkdown += `![Avatar của ${userData.user_fullName || 'User'}](${avatarUrl})\n\n`;
            }

            profileMarkdown += `---\n\n`;

            // Personal Information
            profileMarkdown += `## 📋 Thông tin cá nhân\n\n`;
            profileMarkdown += `**👤 Họ tên**: ${userData.user_fullName || '`Chưa cập nhật`'}\n`;
            profileMarkdown += `**📧 Email**: ${userData.user_email || '`Chưa cập nhật`'}\n`;
            profileMarkdown += `**📱 Điện thoại**: ${userData.phoneNumber || '`Chưa cập nhật`'}\n`;

            if (userData.user_dayOfBirth) {
                const birthDate = new Date(userData.user_dayOfBirth);
                profileMarkdown += `**🎂 Ngày sinh**: ${birthDate.toLocaleDateString('vi-VN')}\n`;
            }

            if (userData.user_sex !== null && userData.user_sex !== undefined) {
                profileMarkdown += `**👫 Giới tính**: ${userData.user_sex ? 'Nam' : 'Nữ'}\n`;
            }

            profileMarkdown += `\n`;

            // Account Information
            profileMarkdown += `## 🔐 Thông tin tài khoản\n\n`;
            profileMarkdown += `**🏷️ Vai trò**: ${userData.role_name || userData.user_role || 'USER'}\n`;

            const statusIcon = userData.user_status === 'active' ? '✅' : '❌';
            const statusText = userData.user_status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động';
            profileMarkdown += `**📊 Trạng thái**: ${statusIcon} ${statusText}\n\n`;

            // Additional Info
            profileMarkdown += `---\n\n`;
            profileMarkdown += `💡 **Gợi ý**: Bạn có thể cập nhật thông tin profile trong [Cài đặt tài khoản](/profile/settings)\n\n`;

            if (userData.role_name === 'ADMIN') {
                profileMarkdown += `🔧 **Admin Tools**: [Quản lý hệ thống](/admin) | [Thống kê](/admin/stats)\n\n`;
            } else if (userData.role_name === 'SHOP_OWNER') {
                profileMarkdown += `🏪 **Shop Tools**: [Quản lý cửa hàng](/shop/manage) | [Đơn hàng](/shop/orders)\n\n`;
            }

            profileMarkdown += `🛍️ Chúc bạn có trải nghiệm mua sắm vui vẻ tại **Aliconcon**! 😊`;

            return {
                content: [
                    {
                        type: "text" as const,
                        text: profileMarkdown
                    }
                ]
            };

        } catch (error: any) {
            console.error('❌ [show-profile] Error:', error);

            const errorMarkdown = `# ❌ Không thể tải thông tin profile

**Lỗi**: ${error.message || 'Lỗi không xác định'}

## 🔧 Gợi ý khắc phục:

- Kiểm tra kết nối internet
- Đăng nhập lại nếu phiên làm việc hết hạn
- Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn

[🔄 Thử lại](/profile) | [🏠 Về trang chủ](/) | [📞 Hỗ trợ](/support)`;

            return {
                content: [
                    {
                        type: "text" as const,
                        text: errorMarkdown
                    }
                ]
            };
        }
    }
}; 