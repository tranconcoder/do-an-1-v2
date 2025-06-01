import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';
import {
    CheckCircle,
    XCircle,
    Loader2,
    Receipt,
    CreditCard,
    Calendar,
    Building,
    Hash
} from 'lucide-react';
import PaymentReturnActions from './components/PaymentReturnActions';

// VNPay response codes mapping
const VNP_RESPONSE_CODES: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
    '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
    '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
    '12': 'Thẻ/Tài khoản của khách hàng bị khóa',
    '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
    '24': 'Khách hàng hủy giao dịch',
    '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
    '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
    '75': 'Ngân hàng thanh toán đang bảo trì',
    '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định',
    '99': 'Các lỗi khác'
};

// Bank codes mapping
const BANK_CODES: Record<string, string> = {
    NCB: 'Ngân hàng NCB',
    AGRIBANK: 'Ngân hàng Agribank',
    SCB: 'Ngân hàng SCB',
    SACOMBANK: 'Ngân hàng SacomBank',
    EXIMBANK: 'Ngân hàng EximBank',
    MSBANK: 'Ngân hàng MS Bank',
    NAMABANK: 'Ngân hàng NamA Bank',
    VNMART: 'Ví VnMart',
    VIETINBANK: 'Ngân hàng Vietinbank',
    VIETCOMBANK: 'Ngân hàng VCB',
    HDBANK: 'Ngân hàng HDBank',
    DONGABANK: 'Ngân hàng Dong A',
    TPBANK: 'Ngân hàng TPBank',
    OJB: 'Ngân hàng OceanBank',
    BIDV: 'Ngân hàng BIDV',
    TECHCOMBANK: 'Ngân hàng Techcombank',
    VPBANK: 'Ngân hàng VPBank',
    MBBANK: 'Ngân hàng MBBank',
    ACB: 'Ngân hàng ACB',
    OCB: 'Ngân hàng OCB',
    IVB: 'Ngân hàng IVB',
    VISA: 'Thanh toán qua VISA/MASTER'
};

interface VNPayReturnPageProps {
    searchParams: Record<string, string>;
}

function formatAmount(amount: string | number) {
    const numAmount = typeof amount === 'string' ? parseInt(amount) / 100 : amount;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(numAmount);
}

function formatDateTime(dateTimeStr: string) {
    if (!dateTimeStr || dateTimeStr.length !== 14) return dateTimeStr;

    const year = dateTimeStr.substring(0, 4);
    const month = dateTimeStr.substring(4, 6);
    const day = dateTimeStr.substring(6, 8);
    const hour = dateTimeStr.substring(8, 10);
    const minute = dateTimeStr.substring(10, 12);
    const second = dateTimeStr.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

// Loading component
function LoadingState() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-blue-200 animate-pulse"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Đang xử lý kết quả thanh toán...
                    </h2>
                    <p className="text-gray-600 text-center">Vui lòng đợi trong giây lát</p>
                </CardContent>
            </Card>
        </div>
    );
}

// Main server component - Pure server-side rendering
export default function VNPayReturnPage({ searchParams }: VNPayReturnPageProps) {
    // Check if we have the required parameters
    if (!searchParams.vnp_TxnRef || !searchParams.vnp_ResponseCode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-0" data-payment-card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-xl text-red-600">Lỗi xử lý thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">Thiếu thông tin thanh toán từ VNPay</p>
                        <PaymentReturnActions isSuccess={false} vnpayParams={searchParams} />
                    </CardContent>
                </Card>
                <Toaster />
            </div>
        );
    }

    // Read data directly from query parameters
    const vnpayParams = searchParams;
    const isSuccess = vnpayParams.vnp_ResponseCode === '00';
    const responseCode = vnpayParams.vnp_ResponseCode;
    const responseMessage = VNP_RESPONSE_CODES[responseCode] || 'Không xác định';

    // Extract order ID from transaction reference (assuming it's the same)
    const orderId = vnpayParams.vnp_TxnRef;

    return (
        <div
            className={`min-h-screen ${
                isSuccess
                    ? 'bg-gradient-to-br from-green-50 via-white to-emerald-50'
                    : 'bg-gradient-to-br from-red-50 via-white to-pink-50'
            } flex items-center justify-center p-4`}
        >
            <Card className="w-full max-w-2xl shadow-xl border-0" data-payment-card>
                <CardHeader className="text-center pb-6">
                    <div
                        className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                            isSuccess ? 'bg-green-100' : 'bg-red-100'
                        }`}
                    >
                        {isSuccess ? (
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        ) : (
                            <XCircle className="h-10 w-10 text-red-600" />
                        )}
                    </div>
                    <CardTitle
                        className={`text-2xl font-bold ${
                            isSuccess ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                    </CardTitle>
                    <p className="text-gray-600 mt-2">{responseMessage}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Payment Status */}
                    <div className="flex justify-center">
                        <Badge
                            variant={isSuccess ? 'default' : 'destructive'}
                            className={`px-4 py-2 text-sm font-medium ${
                                isSuccess
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                            Mã phản hồi: {responseCode} - {responseMessage}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Payment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order Information */}
                        {vnpayParams.vnp_TxnRef && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Receipt className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-800">
                                        Thông tin đơn hàng
                                    </p>
                                </div>
                                <p className="font-mono font-semibold text-gray-900">
                                    #{vnpayParams.vnp_TxnRef.slice(-12)}
                                </p>
                            </div>
                        )}

                        {/* Amount */}
                        {vnpayParams.vnp_Amount && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="h-4 w-4 text-green-600" />
                                    <p className="text-sm font-medium text-green-800">Số tiền</p>
                                </div>
                                <p className="font-semibold text-lg text-gray-900">
                                    {formatAmount(vnpayParams.vnp_Amount)}
                                </p>
                            </div>
                        )}

                        {/* Transaction Number */}
                        {vnpayParams.vnp_TransactionNo && (
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Hash className="h-4 w-4 text-purple-600" />
                                    <p className="text-sm font-medium text-purple-800">
                                        Mã giao dịch VNPay
                                    </p>
                                </div>
                                <p className="font-mono text-sm text-gray-900">
                                    {vnpayParams.vnp_TransactionNo}
                                </p>
                            </div>
                        )}

                        {/* Bank Information */}
                        {vnpayParams.vnp_BankCode && (
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building className="h-4 w-4 text-orange-600" />
                                    <p className="text-sm font-medium text-orange-800">Ngân hàng</p>
                                </div>
                                <p className="text-sm text-gray-900">
                                    {BANK_CODES[vnpayParams.vnp_BankCode] ||
                                        vnpayParams.vnp_BankCode}
                                </p>
                                {vnpayParams.vnp_BankTranNo && (
                                    <p className="font-mono text-xs text-gray-600 mt-1">
                                        Mã GD: {vnpayParams.vnp_BankTranNo}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Payment Date */}
                        {vnpayParams.vnp_PayDate && (
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4 text-gray-600" />
                                    <p className="text-sm font-medium text-gray-800">
                                        Thời gian thanh toán
                                    </p>
                                </div>
                                <p className="text-sm text-gray-900">
                                    {formatDateTime(vnpayParams.vnp_PayDate)}
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <PaymentReturnActions
                        isSuccess={isSuccess}
                        orderId={isSuccess ? orderId : undefined}
                        vnpayParams={vnpayParams}
                    />
                </CardContent>
            </Card>
            <Toaster />
        </div>
    );
}

// Add loading boundary
export function Loading() {
    return <LoadingState />;
}
