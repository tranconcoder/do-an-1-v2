import { z } from "zod";

export const paymentMethodsTool = {
    name: "payment",
    description: "Cung cấp thông tin về các phương thức thanh toán được hỗ trợ trên Aliconcon",
    inputSchema: {
        method: z.enum(["cod", "vnpay"]).optional().describe("Phương thức thanh toán cụ thể: cod (thanh toán khi nhận hàng), vnpay (VNPay)")
    },
    handler: async ({ method = "cod" }: { method?: "cod" | "vnpay" }) => {
        const paymentData = {
            introduction: {
                title: "Các phương thức hỗ trợ thanh toán",
                description: "Trong hệ thống mua sắm trực tuyến hiện nay, hai phương thức thanh toán phổ biến được nhiều khách hàng lựa chọn là thanh toán khi nhận hàng (COD) và thanh toán trực tuyến qua VNPay.",
                note: "Chúng tôi hỗ trợ các phương thức thanh toán sau để mang lại sự tiện lợi tối đa cho khách hàng:"
            },
            primaryMethods: {
                "cod": {
                    name: "Thanh toán khi nhận hàng (COD)",
                    description: "Khách hàng có thể đặt hàng mà không cần thanh toán trước, chỉ thanh toán trực tiếp cho nhân viên giao hàng khi nhận được sản phẩm",
                    icon: "💵",
                    benefits: [
                        "Tạo cảm giác an tâm và tin tưởng khi mua sắm",
                        "Không cần thanh toán trước",
                        "Kiểm tra hàng trước khi trả tiền",
                        "Phù hợp với mọi đối tượng khách hàng",
                        "Không cần tài khoản ngân hàng hay thẻ tín dụng"
                    ],
                    process: [
                        "Đặt hàng trên website và chọn phương thức COD",
                        "Nhận xác nhận đơn hàng qua email/SMS",
                        "Nhân viên giao hàng liên hệ xác nhận thời gian giao",
                        "Kiểm tra sản phẩm khi nhận hàng",
                        "Thanh toán tiền mặt trực tiếp cho nhân viên giao hàng"
                    ],
                    conditions: [
                        "Chỉ nhận tiền mặt, không nhận chuyển khoản tại chỗ"
                    ],
                    customerTips: [
                        "Chuẩn bị đủ tiền mặt theo đúng số tiền đơn hàng",
                        "Kiểm tra kỹ sản phẩm về chất lượng và số lượng",
                        "Giữ hóa đơn và phiếu giao hàng để bảo hành",
                        "Liên hệ hotline ngay nếu có vấn đề với sản phẩm"
                    ]
                },
                "vnpay": {
                    name: "Thanh toán trực tuyến qua VNPay",
                    description: "VNPay là một cổng thanh toán điện tử hiện đại, cho phép người dùng thanh toán nhanh chóng và an toàn thông qua các tài khoản ngân hàng, thẻ ATM, hoặc ví điện tử",
                    icon: "🟠",
                    advantages: [
                        "Tiết kiệm thời gian thanh toán",
                        "Hỗ trợ xử lý đơn hàng tự động",
                        "Phù hợp với xu hướng thanh toán không tiền mặt hiện nay",
                        "Bảo mật cao với công nghệ mã hóa tiên tiến",
                        "Hỗ trợ nhiều phương thức thanh toán trong một nền tảng"
                    ],
                    supportedMethods: [
                        {
                            type: "Ví điện tử VNPay",
                            description: "Sử dụng số dư trong ví VNPay",
                            features: ["Nạp tiền dễ dàng", "Quản lý chi tiêu", "Ưu đãi độc quyền"]
                        }
                    ],
                    process: [
                        "Chọn sản phẩm và thêm vào giỏ hàng",
                        "Tại trang thanh toán, chọn 'VNPay'",
                        "Chọn phương thức thanh toán (ngân hàng/thẻ ATM/ví VNPay)",
                        "Nhập thông tin thanh toán và xác thực OTP",
                        "Nhận xác nhận giao dịch thành công",
                        "Đơn hàng được xử lý tự động"
                    ],
                    security: [
                        "Mã hóa SSL 256-bit bảo vệ thông tin",
                        "Xác thực đa lớp với OTP",
                        "Giám sát giao dịch 24/7",
                        "Tuân thủ tiêu chuẩn bảo mật quốc tế PCI DSS"
                    ],
                    benefits: [
                        "Giao dịch tức thời, xử lý đơn hàng nhanh chóng",
                        "Không cần mang tiền mặt",
                        "Lịch sử giao dịch minh bạch",
                        "Hỗ trợ hoàn tiền tự động khi cần thiết",
                        "Tích hợp với hệ thống loyalty program"
                    ]
                }
            },
            comparison: {
                title: "So sánh COD vs VNPay",
                factors: [
                    {
                        factor: "Độ tin cậy",
                        cod: "Cao - Kiểm tra hàng trước khi trả tiền",
                        vnpay: "Cao - Bảo mật công nghệ hiện đại"
                    },
                    {
                        factor: "Tốc độ xử lý",
                        cod: "Chậm - Cần chờ giao hàng",
                        vnpay: "Nhanh - Xử lý tức thời"
                    },
                    {
                        factor: "Tiện lợi",
                        cod: "Trung bình - Cần có mặt nhận hàng",
                        vnpay: "Cao - Thanh toán mọi lúc mọi nơi"
                    },
                    {
                        factor: "Phí dịch vụ",
                        cod: "15.000đ (đơn < 500k), miễn phí (đơn ≥ 500k)",
                        vnpay: "Miễn phí cho khách hàng"
                    }
                ]
            },
            recommendations: {
                title: "Gợi ý lựa chọn phương thức thanh toán",
                scenarios: [
                    {
                        situation: "Lần đầu mua hàng online",
                        recommendation: "COD",
                        reason: "An tâm kiểm tra hàng trước khi thanh toán"
                    },
                    {
                        situation: "Mua hàng thường xuyên",
                        recommendation: "VNPay",
                        reason: "Tiết kiệm thời gian và tiện lợi"
                    },
                    {
                        situation: "Đơn hàng giá trị cao",
                        recommendation: "VNPay",
                        reason: "Bảo mật cao và có thể hoàn tiền"
                    },
                    {
                        situation: "Cần giao hàng gấp",
                        recommendation: "VNPay",
                        reason: "Xử lý đơn hàng tự động, giao hàng nhanh hơn"
                    }
                ]
            },
            callToAction: {
                message: "Bạn muốn thanh toán bằng phương thức nào? Chọn ngay để nhận hướng dẫn chi tiết nhé!",
                supportContact: {
                    hotline: "1900-1234",
                    email: "support@aliconcon.com",
                    chat: "Chat trực tiếp trên website",
                    hours: "Hỗ trợ 24/7"
                }
            },
        };

        let responseData: any = {};

        switch (method) {
            case "cod":
                responseData = {
                    method: "cod",
                    data: {
                        introduction: paymentData.introduction,
                        method: paymentData.primaryMethods.cod,
                        recommendations: paymentData.recommendations,
                        callToAction: paymentData.callToAction
                    }
                };
                break;
            case "vnpay":
                responseData = {
                    method: "vnpay",
                    data: {
                        introduction: paymentData.introduction,
                        method: paymentData.primaryMethods.vnpay,
                        recommendations: paymentData.recommendations,
                        callToAction: paymentData.callToAction
                    }
                };
                break;
            default:
                responseData = {
                    method: "cod",
                    data: paymentData
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