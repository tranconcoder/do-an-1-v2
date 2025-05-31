'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Receipt, Loader2, CheckCircle, XCircle } from 'lucide-react';
import CloseWindowButton from './CloseWindowButton';
import CaptureScreenshot from './CaptureScreenshot';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import paymentService from '@/lib/services/api/paymentService';
import React from 'react';

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

    // Simple payment status update using payment ID
    const updatePaymentStatus = async () => {
        if (!isSuccess || !parsedVnpayParams.vnp_TxnRef) {
            console.log('❌ Skipping payment update - payment not successful or missing txnRef');
            console.log('❌ Debug info:', { isSuccess, vnpTxnRef: parsedVnpayParams.vnp_TxnRef });
            return;
        }

        console.log('🚀 Starting payment status update...');
        console.log('💳 Payment ID (vnp_TxnRef):', parsedVnpayParams.vnp_TxnRef);

        setIpnProcessing(true);
        setIpnError(null);

        try {
            // Use payment ID from vnp_TxnRef to update status
            const result = await paymentService.updatePaymentStatus(parsedVnpayParams.vnp_TxnRef);

            console.log('✅ Payment status update response:', result);

            if (result.success) {
                setIpnCompleted(true);
                toast({
                    title: '✅ Thanh toán đã được xác nhận',
                    description: 'Đơn hàng của bạn đã được cập nhật trạng thái thành công.',
                    variant: 'default'
                });

                console.log('🎉 Payment processing completed successfully!');
                console.log('📦 Order status updated: PENDING_PAYMENT → PENDING');
            } else {
                throw new Error(result.message || 'Payment update failed');
            }
        } catch (error: any) {
            console.error('❌ Payment Status Update Error:', error);
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
                'Không thể cập nhật trạng thái thanh toán';

            setIpnError(errorMessage);
            toast({
                title: '⚠️ Lỗi cập nhật thanh toán',
                description: `Có lỗi xảy ra khi cập nhật trạng thái: ${errorMessage}`,
                variant: 'destructive'
            });
        } finally {
            setIpnProcessing(false);
        }
    };

    // Auto-trigger payment status update for successful payments when component mounts
    useEffect(() => {
        if (isSuccess && parsedVnpayParams.vnp_TxnRef && !ipnCompleted && !ipnProcessing) {
            console.log('🚀 Auto-triggering payment status update...');

            // Delay to show the success page first, then trigger update
            const timer = setTimeout(() => {
                console.log('⏰ Payment status update timer triggered');
                updatePaymentStatus();
            }, 1000); // Reduced delay to 1 second for faster processing

            return () => {
                console.log('🧹 Cleaning up update timer');
                clearTimeout(timer);
            };
        } else {
            console.log('⏭️ Skipping auto payment update:', {
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
                                    onClick={updatePaymentStatus}
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
                {/* Close and Screenshot buttons side by side for successful payments */}
                {isSuccess && (
                    <div className="grid grid-cols-2 gap-3">
                        <CloseWindowButton inline />
                        <CaptureScreenshot orderId={orderId} />
                    </div>
                )}

                {/* Close button only for failed payments */}
                {!isSuccess && <CloseWindowButton inline />}

                {/* Manual IPN trigger for debugging */}
                {process.env.NODE_ENV === 'development' && isSuccess && !ipnCompleted && (
                    <Button
                        onClick={updatePaymentStatus}
                        variant="secondary"
                        className="w-full"
                        disabled={ipnProcessing}
                    >
                        {ipnProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            '🔄 Cập nhật trạng thái thủ công'
                        )}
                    </Button>
                )}

                {/* Manual IPN trigger - Always visible in dev */}
                {process.env.NODE_ENV === 'development' && isSuccess && (
                    <Button
                        onClick={() => {
                            console.log('🔧 Manual IPN trigger clicked');
                            console.log('🔧 Current state:', { ipnCompleted, ipnProcessing });
                            console.log('🔧 VNPay params:', parsedVnpayParams);
                            updatePaymentStatus();
                        }}
                        variant="outline"
                        className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-300"
                        disabled={ipnProcessing}
                    >
                        {ipnProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            '🔧 Debug: Cập nhật trạng thái'
                        )}
                    </Button>
                )}

                {/* Manual IPN trigger - Always visible for successful payments */}
                {isSuccess && (
                    <Button
                        onClick={() => {
                            console.log('🔄 Manual IPN trigger for successful payment');
                            console.log('📋 Payment details:', {
                                paymentId: parsedVnpayParams.vnp_TxnRef,
                                amount: parsedVnpayParams.vnp_Amount,
                                responseCode: parsedVnpayParams.vnp_ResponseCode
                            });
                            updatePaymentStatus();
                        }}
                        variant="default"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={ipnProcessing}
                    >
                        {ipnProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang cập nhật trạng thái...
                            </>
                        ) : ipnCompleted ? (
                            '✅ Đã cập nhật thành công'
                        ) : (
                            '🔄 Cập nhật trạng thái thanh toán'
                        )}
                    </Button>
                )}
            </div>
        </>
    );
}
