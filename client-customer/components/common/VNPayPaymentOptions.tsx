'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Truck, Wifi } from 'lucide-react';

interface VNPayPaymentOptionsProps {
    selectedPayment: 'cod' | 'vnpay';
    onPaymentChange: (value: 'cod' | 'vnpay') => void;
    selectedBankCode: string;
    onBankCodeChange: (value: string) => void;
    showCOD?: boolean;
}

export default function VNPayPaymentOptions({
    selectedPayment,
    onPaymentChange,
    selectedBankCode,
    onBankCodeChange,
    showCOD = true
}: VNPayPaymentOptionsProps) {
    const [clientIP, setClientIP] = useState<string>('');
    const [ipLoading, setIpLoading] = useState(true);

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

        getClientIP();
    }, []);

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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Phương thức thanh toán
                    <div className="ml-auto flex items-center gap-2">
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
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup value={selectedPayment} onValueChange={onPaymentChange}>
                    {showCOD && (
                        <div className="flex items-center space-x-2 p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                            <RadioGroupItem value="cod" id="cod" />
                            <Label htmlFor="cod" className="flex-grow cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Truck className="h-6 w-6 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-base">
                                            Thanh toán khi nhận hàng (COD)
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Thanh toán bằng tiền mặt khi nhận hàng
                                        </p>
                                    </div>
                                </div>
                            </Label>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                            <RadioGroupItem value="vnpay" id="vnpay" />
                            <Label htmlFor="vnpay" className="flex-grow cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <CreditCard className="h-6 w-6 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-base">VNPay</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Thanh toán online an toàn qua VNPay
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                ATM
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                Visa
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                MasterCard
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                QR Code
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Label>
                        </div>

                        {/* VNPay Bank Code Options */}
                        {selectedPayment === 'vnpay' && (
                            <div className="ml-8 space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-800">
                                        Chọn phương thức thanh toán VNPay:
                                    </p>
                                </div>

                                <RadioGroup
                                    value={selectedBankCode}
                                    onValueChange={onBankCodeChange}
                                    className="space-y-2"
                                >
                                    {bankCodeOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex items-center space-x-2 p-3 bg-white rounded-md border hover:bg-blue-50 transition-colors"
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
                                <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                                    {ipLoading ? (
                                        <div className="flex items-center gap-2 text-xs text-blue-700">
                                            <Wifi className="h-3 w-3 animate-pulse" />
                                            Đang lấy địa chỉ IP để đảm bảo thanh toán an toàn...
                                        </div>
                                    ) : clientIP ? (
                                        <div className="flex items-center gap-2 text-xs text-green-700">
                                            <Wifi className="h-3 w-3" />✅ Địa chỉ IP đã được xác
                                            thực: {clientIP}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-amber-700">
                                            <Wifi className="h-3 w-3" />
                                            ⚠️ Không thể lấy địa chỉ IP. Hệ thống sẽ tự động xử lý.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
