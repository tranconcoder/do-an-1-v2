'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wifi, Loader2 } from 'lucide-react';
import paymentService from '@/lib/services/api/paymentService';
import { useToast } from '@/hooks/use-toast';

interface VNPayPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        _id: string;
        price_to_payment: number;
        shop_name: string;
    };
    onPaymentSuccess?: () => void;
}

export default function VNPayPaymentModal({
    isOpen,
    onClose,
    order,
    onPaymentSuccess
}: VNPayPaymentModalProps) {
    const { toast } = useToast();
    const [selectedBankCode, setSelectedBankCode] = useState<string>('');
    const [clientIP, setClientIP] = useState<string>('');
    const [ipLoading, setIpLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Get client IP from ipify.org
    useEffect(() => {
        const getClientIP = async () => {
            try {
                setIpLoading(true);
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                setClientIP(data.ip);
                console.log('Client IP from ipify.org:', data.ip);
            } catch (error) {
                console.error('Failed to get IP from ipify.org:', error);
                setClientIP('');
            } finally {
                setIpLoading(false);
            }
        };

        if (isOpen) {
            getClientIP();
        }
    }, [isOpen]);

    const bankCodeOptions = [
        {
            value: '',
            label: 'Để VNPay tự động chọn',
            description: '(Khuyến nghị)',
            icon: '⚡'
        },
        {
            value: 'VNPAYQR',
            label: 'Thanh toán bằng QR Code',
            description: 'Quét mã QR để thanh toán',
            icon: '📱'
        },
        {
            value: 'VNBANK',
            label: 'Thẻ ATM - Ngân hàng nội địa',
            description: 'Thẻ ATM các ngân hàng Việt Nam',
            icon: '🏦'
        },
        {
            value: 'INTCARD',
            label: 'Thẻ thanh toán quốc tế',
            description: 'Visa, MasterCard, JCB',
            icon: '💳'
        }
    ];

    const handlePayment = async () => {
        try {
            setProcessing(true);

            // Create payment URL with selected bank code and client IP
            const paymentData = await paymentService.createVNPayPayment({
                orderId: order._id,
                amount: order.price_to_payment,
                orderInfo: `Thanh toán đơn hàng #${order._id.slice(-8)} - ${order.shop_name}`,
                locale: 'vn',
                bankCode: selectedBankCode || undefined,
                ipAddr: clientIP || undefined
            });

            // Close modal first
            onClose();

            // Open payment window
            const paymentWindow = paymentService.openPaymentWindow(
                paymentData.paymentUrl,
                () => {
                    // On success callback
                    toast({
                        title: 'Thanh toán thành công!',
                        description: `Đơn hàng #${order._id.slice(-8)} đã được thanh toán.`,
                        variant: 'default'
                    });
                    onPaymentSuccess?.();
                },
                () => {
                    // On error callback
                    toast({
                        title: 'Lỗi thanh toán',
                        description:
                            'Không thể mở cửa sổ thanh toán. Vui lòng kiểm tra popup blocker.',
                        variant: 'destructive'
                    });
                }
            );

            if (paymentWindow) {
                toast({
                    title: 'Đang chuyển hướng...',
                    description: 'Vui lòng hoàn tất thanh toán trên cửa sổ VNPay.',
                    variant: 'default'
                });
            }
        } catch (error: any) {
            console.error('Failed to process payment:', error);
            toast({
                title: 'Lỗi thanh toán',
                description:
                    error.response?.data?.message ||
                    'Không thể tạo liên kết thanh toán. Vui lòng thử lại.',
                variant: 'destructive'
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        if (!processing) {
            onClose();
            // Reset state when closing
            setSelectedBankCode('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        Chọn phương thức thanh toán VNPay
                        <div className="ml-auto">
                            {ipLoading ? (
                                <Badge variant="outline" className="text-xs">
                                    <Wifi className="h-3 w-3 mr-1 animate-pulse" />
                                    Đang lấy IP...
                                </Badge>
                            ) : clientIP ? (
                                <Badge variant="outline" className="text-xs">
                                    <Wifi className="h-3 w-3 mr-1" />
                                    IP: {clientIP}
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-xs">
                                    ⚠️ Không lấy được IP
                                </Badge>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Info */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                            <p>
                                <strong>Đơn hàng:</strong> #{order._id.slice(-8)}
                            </p>
                            <p>
                                <strong>Cửa hàng:</strong> {order.shop_name}
                            </p>
                            <p>
                                <strong>Số tiền:</strong>{' '}
                                {order.price_to_payment.toLocaleString('vi-VN')} VNĐ
                            </p>
                        </div>
                    </div>

                    {/* Bank Code Selection */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-800">
                            Chọn phương thức thanh toán:
                        </p>

                        <RadioGroup
                            value={selectedBankCode}
                            onValueChange={setSelectedBankCode}
                            className="space-y-2"
                        >
                            {bankCodeOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="flex items-center space-x-2 p-3 border rounded-md hover:bg-blue-50 transition-colors"
                                >
                                    <RadioGroupItem
                                        value={option.value}
                                        id={`bank-${option.value || 'auto'}`}
                                    />
                                    <Label
                                        htmlFor={`bank-${option.value || 'auto'}`}
                                        className="flex-grow cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{option.icon}</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {option.label}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {/* IP Status */}
                        <div className="p-2 bg-gray-50 rounded border">
                            {ipLoading ? (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Wifi className="h-3 w-3 animate-pulse" />
                                    Đang lấy địa chỉ IP để đảm bảo thanh toán an toàn...
                                </div>
                            ) : clientIP ? (
                                <div className="flex items-center gap-2 text-xs text-green-700">
                                    <Wifi className="h-3 w-3" />✅ Địa chỉ IP đã được xác thực:{' '}
                                    {clientIP}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-amber-700">
                                    <Wifi className="h-3 w-3" />
                                    ⚠️ Không thể lấy địa chỉ IP. Hệ thống sẽ tự động xử lý.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={processing || ipLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Thanh toán ngay'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
