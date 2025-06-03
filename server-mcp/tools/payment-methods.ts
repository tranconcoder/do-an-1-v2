import { z } from "zod";

export const paymentMethodsTool = {
    name: "payment-methods",
    description: "Cung cấp thông tin về các phương thức thanh toán được hỗ trợ trên Aliconcon",
    inputSchema: {
        method: z.enum(["all", "cod", "vnpay", "bank-transfer", "e-wallet", "credit-card"]).optional().describe("Phương thức thanh toán cụ thể: all (tất cả), cod (thanh toán khi nhận hàng), vnpay (VNPay), bank-transfer (chuyển khoản), e-wallet (ví điện tử), credit-card (thẻ tín dụng)")
    },
    handler: async ({ method = "all" }: { method?: "all" | "cod" | "vnpay" | "bank-transfer" | "e-wallet" | "credit-card" }) => {
        const paymentData = {
            primaryMethods: {
                cod: {
                    name: "Thanh toán khi nhận hàng (COD)",
                    description: "Thanh toán bằng tiền mặt khi nhận được sản phẩm",
                    icon: "💵",
                    features: [
                        "An tâm kiểm tra hàng trước khi thanh toán",
                        "Phù hợp cho lần đầu mua online",
                        "Không cần thẻ ngân hàng hay tài khoản",
                        "Áp dụng toàn quốc"
                    ],
                    advantages: [
                        "Tin cậy cao nhất",
                        "Kiểm tra hàng trước thanh toán",
                        "Không lo bị lừa đảo"
                    ],
                    limitations: [
                        "Phí COD 15.000đ cho đơn hàng dưới 500.000đ",
                        "Cần có người nhận tại nhà",
                        "Chỉ thanh toán bằng tiền mặt"
                    ],
                    processingTime: "Thanh toán ngay khi nhận hàng",
                    fees: "15.000đ (miễn phí cho đơn ≥ 500.000đ)"
                },
                vnpay: {
                    name: "VNPay - Cổng thanh toán điện tử",
                    description: "Thanh toán trực tuyến qua VNPay với đa dạng phương thức",
                    icon: "💳",
                    features: [
                        "Thanh toán nhanh chóng, tiện lợi",
                        "Xử lý đơn hàng tự động",
                        "Hỗ trợ nhiều ngân hàng",
                        "Bảo mật cao với mã hóa SSL"
                    ],
                    advantages: [
                        "Xử lý đơn hàng nhanh chóng",
                        "Không cần tiền mặt",
                        "Lịch sử giao dịch minh bạch",
                        "Ưu đãi từ ngân hàng đối tác"
                    ],
                    limitations: [
                        "Cần có tài khoản ngân hàng",
                        "Phụ thuộc vào kết nối internet",
                        "Một số ngân hàng có thể tính phí"
                    ],
                    processingTime: "Xử lý ngay lập tức",
                    fees: "Miễn phí (có thể có phí ngân hàng)"
                }
            },
            additionalMethods: {
                bankTransfer: {
                    name: "Chuyển khoản ngân hàng",
                    description: "Chuyển khoản trực tiếp vào tài khoản ngân hàng",
                    icon: "🏦",
                    features: [
                        "Phù hợp cho đơn hàng giá trị lớn",
                        "Không giới hạn số tiền",
                        "Có thể chuyển từ ATM hoặc Internet Banking"
                    ],
                    processingTime: "1-3 giờ làm việc để xác nhận",
                    fees: "Phí theo ngân hàng gửi tiền"
                },
                eWallet: {
                    name: "Ví điện tử",
                    description: "Thanh toán qua các ví điện tử phổ biến",
                    icon: "📱",
                    supportedWallets: ["MoMo", "ZaloPay", "ShopeePay", "ViettelPay"],
                    features: [
                        "Thanh toán nhanh bằng điện thoại",
                        "Tích điểm thưởng từ ví",
                        "Ưu đãi riêng từ các ví"
                    ],
                    processingTime: "Xử lý ngay lập tức",
                    fees: "Thường miễn phí"
                },
                creditCard: {
                    name: "Thẻ tín dụng quốc tế",
                    description: "Thanh toán bằng thẻ Visa, Mastercard, JCB",
                    icon: "💳",
                    supportedCards: ["Visa", "Mastercard", "JCB", "American Express"],
                    features: [
                        "Hỗ trợ thẻ quốc tế",
                        "Trả góp 0% lãi suất",
                        "Tích điểm thưởng thẻ"
                    ],
                    processingTime: "Xử lý ngay lập tức",
                    fees: "Miễn phí (có thể có phí ngân hàng)"
                }
            },
            comparison: {
                speed: {
                    fastest: ["vnpay", "e-wallet", "credit-card"],
                    medium: ["bank-transfer"],
                    manual: ["cod"]
                },
                security: {
                    highest: ["cod", "vnpay"],
                    high: ["bank-transfer", "credit-card"],
                    good: ["e-wallet"]
                },
                convenience: {
                    most: ["vnpay", "e-wallet"],
                    medium: ["credit-card", "bank-transfer"],
                    least: ["cod"]
                }
            },
            recommendations: {
                firstTimeBuyer: {
                    method: "cod",
                    reason: "An tâm kiểm tra hàng trước khi thanh toán"
                },
                regularCustomer: {
                    method: "vnpay",
                    reason: "Nhanh chóng, tiện lợi, nhiều ưu đãi"
                },
                largeOrder: {
                    method: "bank-transfer",
                    reason: "Không giới hạn số tiền, phí thấp"
                },
                mobileFriendly: {
                    method: "e-wallet",
                    reason: "Thanh toán nhanh bằng điện thoại"
                }
            }
        };

        let responseData: any = {};

        switch (method) {
            case "cod":
                responseData = {
                    method: "cod",
                    data: paymentData.primaryMethods.cod
                };
                break;
            case "vnpay":
                responseData = {
                    method: "vnpay",
                    data: paymentData.primaryMethods.vnpay
                };
                break;
            case "bank-transfer":
                responseData = {
                    method: "bank-transfer",
                    data: paymentData.additionalMethods.bankTransfer
                };
                break;
            case "e-wallet":
                responseData = {
                    method: "e-wallet",
                    data: paymentData.additionalMethods.eWallet
                };
                break;
            case "credit-card":
                responseData = {
                    method: "credit-card",
                    data: paymentData.additionalMethods.creditCard
                };
                break;
            case "all":
            default:
                responseData = {
                    method: "all",
                    data: {
                        primaryMethods: paymentData.primaryMethods,
                        additionalMethods: paymentData.additionalMethods,
                        comparison: paymentData.comparison,
                        recommendations: paymentData.recommendations,
                        summary: {
                            totalMethods: 5,
                            primaryCount: 2,
                            additionalCount: 3,
                            recommendedForNewUsers: "cod",
                            recommendedForRegularUsers: "vnpay"
                        }
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