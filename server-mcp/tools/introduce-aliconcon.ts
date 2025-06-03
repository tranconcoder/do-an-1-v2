import { z } from "zod";

export const introduceAliconconTool = {
    name: "introduce",
    description: "Giới thiệu về nền tảng thương mại điện tử Aliconcon theo cấu trúc JSON",
    inputSchema: {
        section: z.enum(["overview", "customer", "seller", "features", "all"]).optional().describe("Phần thông tin muốn xem: overview (tổng quan), customer (dành cho khách hàng), seller (dành cho người bán), features (tính năng nổi bật), all (tất cả)")
    },
    handler: async ({ section = "all" }: { section?: "overview" | "customer" | "seller" | "features" | "all" }) => {
        const aliconconData = {
            company: {
                name: "Aliconcon",
                type: "Nền tảng thương mại điện tử",
                description: "Nền tảng thương mại điện tử hiện đại, kết nối người mua và người bán",
                mission: "Mang đến trải nghiệm mua sắm tuyệt vời nhất với sản phẩm chất lượng, giá cả hợp lý và dịch vụ tận tâm",
                coreValues: [
                    { name: "Chất lượng", description: "Kiểm duyệt nghiêm ngặt mọi sản phẩm" },
                    { name: "Minh bạch", description: "Giá cả rõ ràng, không phí ẩn" },
                    { name: "Tin cậy", description: "Giao hàng đúng hẹn, hỗ trợ 24/7" },
                    { name: "Đổi mới", description: "Ứng dụng công nghệ AI tiên tiến" }
                ]
            },
            customer: {
                smartShopping: [
                    { feature: "Tìm kiếm thông minh", description: "Hệ thống AI giúp tìm sản phẩm nhanh chóng" },
                    { feature: "So sánh giá", description: "So sánh giá từ nhiều cửa hàng" },
                    { feature: "Đánh giá sản phẩm", description: "Xem review từ khách hàng thực tế" }
                ],
                shoppingExperience: [
                    { feature: "Giỏ hàng thông minh", description: "Lưu trữ và quản lý sản phẩm dễ dàng" },
                    { feature: "Danh sách yêu thích", description: "Theo dõi sản phẩm quan tâm" },
                    { feature: "Thanh toán an toàn", description: "Đa dạng phương thức thanh toán" },
                    { feature: "Giao hàng nhanh", description: "Logistics hiện đại, giao đúng hẹn" }
                ],
                customerSupport: [
                    { feature: "AI Assistant", description: "Tư vấn 24/7 bằng trí tuệ nhân tạo" },
                    { feature: "Chat trực tiếp", description: "Liên hệ trực tiếp với cửa hàng" },
                    { feature: "Theo dõi đơn hàng", description: "Cập nhật tình trạng real-time" }
                ]
            },
            seller: {
                storeManagement: [
                    { feature: "Tạo cửa hàng", description: "Đăng ký nhanh chóng trong vài phút" },
                    { feature: "Quản lý sản phẩm", description: "Upload và quản lý kho hàng hiệu quả" },
                    { feature: "Dashboard thông minh", description: "Theo dõi doanh số và hiệu suất" }
                ],
                salesTools: [
                    { feature: "Tạo khuyến mãi", description: "Thiết lập chương trình giảm giá" },
                    { feature: "Quản lý đơn hàng", description: "Xử lý đơn hàng nhanh chóng" },
                    { feature: "Phân tích dữ liệu", description: "Báo cáo chi tiết hiệu quả kinh doanh" }
                ],
                businessSupport: [
                    { feature: "Đào tạo miễn phí", description: "Hướng dẫn bán hàng hiệu quả" },
                    { feature: "Hỗ trợ marketing", description: "Công cụ quảng bá thương hiệu" },
                    { feature: "Chăm sóc đối tác", description: "Hỗ trợ chuyên nghiệp 24/7" }
                ]
            },
            features: {
                aiShopping: {
                    name: "AI Shopping Assistant",
                    capabilities: [
                        "Tư vấn sản phẩm thông minh dựa trên sở thích cá nhân",
                        "Gợi ý sản phẩm phù hợp với ngân sách",
                        "Hỗ trợ so sánh và lựa chọn sản phẩm tốt nhất"
                    ]
                },
                security: {
                    name: "Bảo mật & An toàn",
                    features: [
                        { feature: "Thanh toán bảo mật", description: "Mã hóa theo tiêu chuẩn quốc tế" },
                        { feature: "Xác thực 2 lớp", description: "Bảo vệ tài khoản tối đa" },
                        { feature: "Bảo vệ thông tin", description: "Cam kết bảo mật dữ liệu cá nhân" }
                    ]
                },
                customerService: {
                    name: "Dịch vụ khách hàng",
                    services: [
                        { service: "Hỗ trợ 24/7", description: "Chăm sóc khách hàng không ngừng nghỉ" },
                        { service: "Đổi trả dễ dàng", description: "Chính sách đổi trả trong 30 ngày" },
                        { service: "Bảo hành sản phẩm", description: "Hỗ trợ bảo hành theo chính sách" }
                    ]
                },
                platform: {
                    name: "Trải nghiệm đa nền tảng",
                    features: [
                        { feature: "Website responsive", description: "Mượt mà trên mọi thiết bị" },
                        { feature: "Giao diện thân thiện", description: "Thiết kế hiện đại, dễ sử dụng" },
                        { feature: "Tốc độ cao", description: "Tối ưu hóa hiệu suất tối đa" }
                    ]
                }
            },
            promotions: {
                specialOffers: [
                    { offer: "Miễn phí vận chuyển", condition: "Cho đơn hàng trên 500.000đ" },
                    { offer: "Tích điểm thưởng", condition: "Mỗi giao dịch đều được tích điểm" },
                    { offer: "Khuyến mãi hàng tuần", condition: "Deal hot cập nhật liên tục" },
                    { offer: "Chương trình thành viên", condition: "Ưu đãi đặc biệt cho khách VIP" }
                ]
            },
            commitments: [
                { commitment: "Chất lượng sản phẩm", description: "Kiểm duyệt nghiêm ngặt" },
                { commitment: "Giá cả minh bạch", description: "Không phí ẩn" },
                { commitment: "Giao hàng đúng hẹn", description: "Cam kết thời gian" },
                { commitment: "Hỗ trợ tận tình", description: "Lắng nghe và giải quyết" }
            ]
        };

        let responseData: any = {};

        switch (section) {
            case "overview":
                responseData = {
                    section: "overview",
                    data: {
                        company: aliconconData.company,
                        commitments: aliconconData.commitments
                    }
                };
                break;
            case "customer":
                responseData = {
                    section: "customer",
                    data: aliconconData.customer
                };
                break;
            case "seller":
                responseData = {
                    section: "seller",
                    data: aliconconData.seller
                };
                break;
            case "features":
                responseData = {
                    section: "features",
                    data: aliconconData.features
                };
                break;
            case "all":
            default:
                responseData = {
                    section: "all",
                    data: {
                        ...aliconconData,
                        promotions: aliconconData.promotions
                    }
                };
                break;
        }

        return {
            content: [
                {
                    type: "text" as const,
                    text: JSON.stringify(responseData, null, 2)
                }
            ]
        };
    }
}; 