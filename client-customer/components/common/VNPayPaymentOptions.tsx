'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Truck, Wifi, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // Auto-select default bank code when VNPay is selected
    useEffect(() => {
        if (selectedPayment === 'vnpay' && !selectedBankCode) {
            onBankCodeChange(''); // Empty string means auto-select
        }
    }, [selectedPayment, selectedBankCode, onBankCodeChange]);

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
                {/* COD Payment Option */}
                {showCOD && (
                    <div
                        onClick={() => onPaymentChange('cod')}
                        className={cn(
                            'relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md',
                            selectedPayment === 'cod'
                                ? 'border-green-500 bg-green-50 shadow-sm'
                                : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-6 h-6">
                                <div
                                    className={cn(
                                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                        selectedPayment === 'cod'
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-gray-300'
                                    )}
                                >
                                    {selectedPayment === 'cod' && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </div>
                            </div>
                            <Truck className="h-8 w-8 text-green-600" />
                            <div className="flex-grow">
                                <p className="font-semibold text-lg text-gray-900">
                                    Thanh toán khi nhận hàng (COD)
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Thanh toán bằng tiền mặt khi nhận hàng
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                        variant="outline"
                                        className="text-xs bg-green-100 text-green-700 border-green-300"
                                    >
                                        💰 Tiền mặt
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="text-xs bg-green-100 text-green-700 border-green-300"
                                    >
                                        🚚 Giao hàng
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VNPay Payment Option */}
                <div
                    onClick={() => onPaymentChange('vnpay')}
                    className={cn(
                        'relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md',
                        selectedPayment === 'vnpay'
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-6 h-6">
                            <div
                                className={cn(
                                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                    selectedPayment === 'vnpay'
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                )}
                            >
                                {selectedPayment === 'vnpay' && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </div>
                        </div>
                        <CreditCard className="h-8 w-8 text-blue-600" />
                        <div className="flex-grow">
                            <p className="font-semibold text-lg text-gray-900">VNPay</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Thanh toán online an toàn qua VNPay
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100 text-blue-700 border-blue-300"
                                >
                                    🏧 ATM
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100 text-blue-700 border-blue-300"
                                >
                                    💳 Visa
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100 text-blue-700 border-blue-300"
                                >
                                    💳 MasterCard
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100 text-blue-700 border-blue-300"
                                >
                                    📱 QR Code
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
