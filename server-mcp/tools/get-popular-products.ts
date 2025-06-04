import { z } from "zod";
import { apiService } from '../services/api.js';

export const getPopularProductsTool = {
    name: "get-popular-products",
    description: "Lấy danh sách sản phẩm phổ biến hiện tại trên nền tảng với định dạng table markdown",
    inputSchema: {
        limit: z.number().min(1).max(50).default(10).describe("Số lượng sản phẩm muốn lấy (1-50, mặc định: 10)"),
        showTable: z.boolean().default(true).describe("Hiển thị kết quả dưới dạng table markdown (mặc định: true)")
    },
    handler: async ({ limit = 10, showTable = true }: { limit?: number, showTable?: boolean }) => {
        try {
            console.log(`🔥 [get-popular-products] Fetching ${limit} popular products...`);

            const response = await apiService.getPopularProducts(1, limit);

            console.log('✅ [get-popular-products] API response received');

            if (!response.metadata || !Array.isArray(response.metadata)) {
                throw new Error('Invalid response format');
            }

            const products = response.metadata;

            if (showTable) {
                // Create beautiful markdown table
                let markdownTable = `# 🔥 Top ${products.length} Sản Phẩm Phổ Biến\n\n`;
                markdownTable += `*Dữ liệu được cập nhật thời gian thực từ hệ thống Aliconcon*\n\n`;

                // Table header
                markdownTable += `| # | Sản phẩm | Giá bán | Đã bán | Đánh giá | Cửa hàng | Tình trạng |\n`;
                markdownTable += `|---|----------|---------|--------|----------|----------|------------|\n`;

                // Table rows
                products.forEach((product: any, index: number) => {
                    const ranking = index + 1;
                    const name = product.product_name || 'N/A';
                    const price = product.sku?.sku_price
                        ? new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(product.sku.sku_price)
                        : 'Liên hệ';
                    const sold = product.product_sold || 0;
                    const rating = product.product_rating_avg
                        ? '⭐'.repeat(Math.round(product.product_rating_avg))
                        : 'Chưa có';
                    const shop = product.shop?.shop_name || 'N/A';
                    const stock = product.sku?.sku_stock
                        ? (product.sku.sku_stock > 0 ? '✅ Còn hàng' : '❌ Hết hàng')
                        : '❓ Chưa rõ';

                    markdownTable += `| ${ranking} | ${name} | ${price} | ${sold.toLocaleString()} | ${rating} | ${shop} | ${stock} |\n`;
                });

                markdownTable += `\n---\n\n`;
                markdownTable += `📊 **Thống kê**: Hiển thị ${products.length} sản phẩm bán chạy nhất\n`;
                markdownTable += `🕒 **Cập nhật**: ${new Date().toLocaleString('vi-VN')}\n`;
                markdownTable += `💡 **Gợi ý**: Nhấp vào tên sản phẩm để xem chi tiết!\n\n`;
                markdownTable += `🛒 Muốn mua sản phẩm nào? Hỏi tôi: *"Tôi muốn mua [tên sản phẩm]"*`;

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: markdownTable
                        }
                    ]
                };
            } else {
                // Return JSON format
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify({
                                success: true,
                                message: `Tìm thấy ${products.length} sản phẩm phổ biến`,
                                data: products,
                                limit: limit,
                                timestamp: new Date().toISOString()
                            }, null, 2)
                        }
                    ]
                };
            }

        } catch (error: any) {
            console.error('Error getting popular products:', error);

            const errorMarkdown = `# ❌ Không thể tải danh sách sản phẩm phổ biến

**Lỗi**: ${error.message || 'Lỗi không xác định'}

## 🔧 Các bước khắc phục:

1. **Kiểm tra kết nối mạng** - Đảm bảo internet ổn định
2. **Thử lại sau** - Server có thể đang bận
3. **Liên hệ hỗ trợ** - Nếu lỗi vẫn tiếp diễn

---

💡 **Thay thế**: Bạn có thể hỏi tôi về:
- Thông tin sản phẩm cụ thể
- Danh mục sản phẩm  
- Khuyến mãi hiện tại

[🏠 Về trang chủ](/) | [📞 Hỗ trợ](/support)`;

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