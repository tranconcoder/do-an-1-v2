'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Receipt } from 'lucide-react';
import CloseWindowButton from './CloseWindowButton';
import CaptureScreenshot from './CaptureScreenshot';

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
    const handleTestWithSampleData = () => {
        if (typeof window !== 'undefined') {
            const sampleUrl =
                '/payment/vnpay-return?vnp_Amount=3002887400&vnp_BankCode=NCB&vnp_BankTranNo=VNP14991046&vnp_CardType=ATM&vnp_OrderInfo=Chuyen+khoan+qua+VNPAY&vnp_PayDate=20250531101602&vnp_ResponseCode=00&vnp_TmnCode=FNAX6Q4P&vnp_TransactionNo=14991046&vnp_TransactionStatus=00&vnp_TxnRef=683a7405af7f30a1f93332bb&vnp_SecureHash=9bd390049d4adad7494f8c15baac5131747b3d0041643d5f226c803c692daa3bc9a934fbf053345ced0a249df10e057cc35d1776e5f7c756b4f2a0e3bdf91268';
            window.location.href = sampleUrl;
        }
    };

    return (
        <>
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

                {/* Test Button (only in development) */}
                {process.env.NODE_ENV === 'development' && !Object.keys(vnpayParams).length && (
                    <Button
                        onClick={handleTestWithSampleData}
                        variant="secondary"
                        className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 border border-purple-300"
                    >
                        🧪 Test với dữ liệu mẫu VNPay
                    </Button>
                )}
            </div>
        </>
    );
}
