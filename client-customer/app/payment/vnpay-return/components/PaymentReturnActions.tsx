'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Receipt, Loader2, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import CaptureScreenshot from './CaptureScreenshot';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import paymentService from '@/lib/services/api/paymentService';
import React from 'react';
import Link from 'next/link';

interface PaymentReturnActionsProps {
    isSuccess: boolean;
    orderId?: string;
    vnpayParams: Record<string, string>;
}

export default function PaymentReturnActions({
    isSuccess,
    orderId,
    vnpayParams
}: PaymentReturnActionsProps) {
    const [ipnProcessing, setIpnProcessing] = useState(false);
    const [ipnCompleted, setIpnCompleted] = useState(false);
    const [ipnError, setIpnError] = useState<string | null>(null);
    const { toast } = useToast();

    // Parse vnpayParams if it's a ReactPromise
    const parsedVnpayParams = React.useMemo(() => {
        try {
            if (vnpayParams && typeof vnpayParams === 'object' && 'value' in vnpayParams) {
                // It's a ReactPromise, parse the JSON value
                return JSON.parse(vnpayParams.value);
            }
            // It's already a regular object
            return vnpayParams;
        } catch (error) {
            console.error('Error parsing vnpayParams:', error);
            return {};
        }
    }, [vnpayParams]);

    console.log('🔍 VNPay params debug:', {
        original: vnpayParams,
        parsed: parsedVnpayParams,
        txnRef: parsedVnpayParams.vnp_TxnRef,
        responseCode: parsedVnpayParams.vnp_ResponseCode
    });

    // Process VNPay return with full parameters
    const processVNPayReturn = async () => {
        if (!isSuccess || !parsedVnpayParams.vnp_TxnRef) {
            console.log(
                '❌ Skipping VNPay return processing - payment not successful or missing txnRef'
            );
            console.log('❌ Debug info:', { isSuccess, vnpTxnRef: parsedVnpayParams.vnp_TxnRef });
            return;
        }

        console.log('🚀 Starting VNPay return processing...');
        console.log('📋 Full VNPay parameters:', parsedVnpayParams);

        setIpnProcessing(true);
        setIpnError(null);

        try {
            // Send all VNPay parameters to server for complete processing
            const result = await paymentService.processVNPayReturn(parsedVnpayParams);

            console.log('✅ VNPay return processing response:', result);

            if (result.success) {
                setIpnCompleted(true);
                toast({
                    title: '✅ Thanh toán đã được xác nhận',
                    description: 'Đơn hàng của bạn đã được cập nhật trạng thái thành công.',
                    variant: 'default'
                });

                console.log('🎉 VNPay return processing completed successfully!');
                console.log('📦 Order status updated: PENDING_PAYMENT → PENDING');
            } else {
                throw new Error(result.message || 'VNPay return processing failed');
            }
        } catch (error: any) {
            console.error('❌ VNPay Return Processing Error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });

            // Extract error message from API response
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Không thể xử lý kết quả thanh toán VNPay';

            setIpnError(errorMessage);
            toast({
                title: '⚠️ Lỗi xử lý thanh toán',
                description: `Có lỗi xảy ra khi xử lý kết quả thanh toán: ${errorMessage}`,
                variant: 'destructive'
            });
        } finally {
            setIpnProcessing(false);
        }
    };

    // Auto-trigger VNPay return processing for successful payments when component mounts
    useEffect(() => {
        if (isSuccess && parsedVnpayParams.vnp_TxnRef && !ipnCompleted && !ipnProcessing) {
            console.log('🚀 Auto-triggering VNPay return processing...');

            // Delay to show the success page first, then trigger processing
            const timer = setTimeout(() => {
                console.log('⏰ VNPay return processing timer triggered');
                processVNPayReturn();
            }, 1000); // Reduced delay to 1 second for faster processing

            return () => {
                console.log('🧹 Cleaning up processing timer');
                clearTimeout(timer);
            };
        } else {
            console.log('⏭️ Skipping auto VNPay return processing:', {
                isSuccess,
                hasTxnRef: !!parsedVnpayParams.vnp_TxnRef,
                ipnCompleted,
                ipnProcessing,
                allParams: Object.keys(parsedVnpayParams)
            });
        }
    }, [isSuccess, parsedVnpayParams.vnp_TxnRef]);

    return (
        <>
            {/* IPN Processing Status */}
            {isSuccess && (
                <div className="mb-4 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50">
                    {ipnProcessing && (
                        <div className="flex items-center gap-3 text-blue-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <div>
                                <p className="font-medium">Đang xử lý thanh toán...</p>
                                <p className="text-sm text-gray-600">
                                    Đang cập nhật trạng thái đơn hàng và lưu giao dịch
                                </p>
                            </div>
                        </div>
                    )}

                    {ipnCompleted && (
                        <div className="flex items-center gap-3 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                                <p className="font-medium">✅ Thanh toán đã được xác nhận</p>
                                <p className="text-sm text-gray-600">
                                    Giao dịch đã được lưu thành công. Đơn hàng chuyển sang trạng
                                    thái "Đang xử lý"
                                </p>
                            </div>
                        </div>
                    )}

                    {ipnError && (
                        <div className="flex items-center gap-3 text-red-600">
                            <XCircle className="h-5 w-5" />
                            <div>
                                <p className="font-medium">❌ Lỗi xử lý thanh toán</p>
                                <p className="text-sm text-gray-600 mb-2">{ipnError}</p>
                                <Button
                                    onClick={processVNPayReturn}
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    disabled={ipnProcessing}
                                >
                                    {ipnProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang thử lại...
                                        </>
                                    ) : (
                                        '🔄 Thử lại'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Show processing status even when not started yet */}
                    {!ipnProcessing &&
                        !ipnCompleted &&
                        !ipnError &&
                        isSuccess &&
                        parsedVnpayParams.vnp_TxnRef && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 animate-pulse"></div>
                                <div>
                                    <p className="font-medium">Chuẩn bị xử lý thanh toán...</p>
                                    <p className="text-sm text-gray-500">
                                        Hệ thống sẽ tự động xử lý trong giây lát
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
                {/* Screenshot and Orders buttons for successful payments */}
                {isSuccess && (
                    <div className="grid grid-cols-2 gap-3">
                        <CaptureScreenshot orderId={orderId} />
                        <Link href="/orders" className="w-full">
                            <Button
                                variant="default"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Xem đơn hàng
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
