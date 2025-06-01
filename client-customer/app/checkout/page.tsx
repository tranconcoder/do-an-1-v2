'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Truck, MapPin, Store, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { mediaService } from '@/lib/services/api/mediaService';
import checkoutService from '@/lib/services/api/checkoutService';
import orderService, { CreateOrderRequest } from '@/lib/services/api/orderService';
import paymentService from '@/lib/services/api/paymentService';
import addressService from '@/lib/services/api/addressService';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { useAppDispatch } from '@/lib/store/hooks';
import { fetchUserAddresses } from '@/lib/store/slices/addressSlice';
import VNPayPaymentOptions from '@/components/common/VNPayPaymentOptions';

interface CheckoutData {
    _id: string;
    user: string;
    shops_info: Array<{
        shop_id: string;
        shop_name: string;
        warehouses_info?: Array<{
            warehouse_id: string;
            warehouse_name: string;
            warehouse_address: string;
            distance_km: number;
        }>;
        products_info: Array<{
            id: string;
            name: string;
            quantity: number;
            thumb: string;
            price: number;
            price_raw: number;
        }>;
        fee_ship: number;
        total_price_raw: number;
        total_discount_price: number;
    }>;
    total_checkout: number;
    total_discount_admin_price: number;
    total_discount_price: number;
    total_discount_shop_price: number;
    total_fee_ship: number;
    total_price_raw: number;
    ship_info?: string;
    createdAt: string;
    updatedAt: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addresses } = useSelector((state: RootState) => state.address);
    const dispatch = useAppDispatch();

    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'vnpay'>('cod');
    const [selectedBankCode, setSelectedBankCode] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCheckoutData = async () => {
            setIsLoading(true);
            try {
                // Get checkout data from server only
                console.log('Fetching checkout data from server...');
                const serverCheckoutData = await checkoutService.getCheckout();
                console.log('Server checkout data:', serverCheckoutData);

                if (serverCheckoutData?.metadata) {
                    setCheckoutData(serverCheckoutData.metadata);
                    return;
                }
            } catch (error: any) {
                console.log('Failed to fetch checkout data from server:', error.message);

                // If no checkout found or any error, redirect to cart
                if (error.response?.status === 404) {
                    toast.error(
                        'Không tìm thấy thông tin đơn hàng. Vui lòng tạo đơn hàng từ giỏ hàng.'
                    );
                } else {
                    toast.error('Lỗi khi tải thông tin đơn hàng. Vui lòng thử lại.');
                }

                router.push('/cart');
                return;
            }

            // If no data found, redirect to cart
            console.log('No checkout data found, redirecting to cart...');
            toast.error('Không tìm thấy thông tin đơn hàng. Vui lòng thử lại từ giỏ hàng.');
            router.push('/cart');
        };

        fetchCheckoutData().finally(() => setIsLoading(false));
    }, [router]);

    useEffect(() => {
        // Ensure addresses are loaded
        dispatch(fetchUserAddresses());
    }, [dispatch]);

    const handlePayment = async () => {
        if (!checkoutData) return;

        setIsProcessing(true);
        try {
            if (selectedPayment === 'vnpay') {
                // Handle VNPay payment - Create orders and get payment URL
                console.log('🚀 Creating VNPay order with bank code:', selectedBankCode);

                const result = await orderService.createOrderWithVNPayPayment({
                    bankCode: selectedBankCode || undefined
                });

                console.log('✅ VNPay order created:', result);

                const { orders, paymentUrl, totalAmount } = result.metadata;

                // Show success message
                if (orders.length === 1) {
                    toast.success('Đơn hàng đã được tạo! Đang chuyển đến trang thanh toán...');
                } else {
                    toast.success(
                        `${orders.length} đơn hàng đã được tạo! Đang chuyển đến trang thanh toán...`
                    );
                }

                // Redirect to VNPay payment page
                console.log('🔄 Redirecting to VNPay payment URL:', paymentUrl);
                window.location.href = paymentUrl;
            } else {
                // Handle COD payment (existing logic)
                const orderRequest: CreateOrderRequest = {
                    paymentType: selectedPayment
                };

                const orderResult = await orderService.createOrder(orderRequest);

                // Handle multiple orders response
                const orders = orderResult.metadata;
                const orderCount = orders.length;

                if (orderCount === 1) {
                    toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
                } else {
                    toast.success(`Đặt ${orderCount} đơn hàng thành công! Cảm ơn bạn đã mua sắm.`);
                }

                // Redirect to orders page
                router.push('/orders');
            }
        } catch (error: any) {
            console.error('Order error:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
        } finally {
            setIsProcessing(false);
        }
    };

    const getShippingAddress = () => {
        if (!checkoutData?.ship_info || !addresses.length) {
            console.log('Debug: No ship_info or addresses', {
                ship_info: checkoutData?.ship_info,
                addresses_length: addresses.length
            });
            return null;
        }
        const foundAddress = addresses.find((addr) => addr._id === checkoutData.ship_info);
        console.log('Debug: Address lookup', {
            ship_info: checkoutData.ship_info,
            foundAddress: foundAddress ? 'found' : 'not found',
            available_addresses: addresses.map((a) => a._id)
        });
        return foundAddress;
    };

    if (isLoading || !checkoutData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-gray-400 mb-4 animate-pulse" />
                    <h2 className="text-xl font-semibold mb-2">Đang tải thông tin đơn hàng...</h2>
                    <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    const shippingAddress = getShippingAddress();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="w-full px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 max-w-7xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-blue-800">Thanh toán đơn hàng</h1>
                </div>

                <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {/* Order Details */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Shipping Address */}
                        {shippingAddress ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-green-600" />
                                        Địa chỉ giao hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {/* Address Information */}
                                        <div className="space-y-3">
                                            <p className="font-semibold text-lg">
                                                {shippingAddress.recipient_name}
                                            </p>
                                            <p className="text-gray-600 text-base">
                                                {shippingAddress.recipient_phone}
                                            </p>
                                            <p className="text-gray-600 text-base">
                                                {shippingAddress.location.address}
                                            </p>
                                            <p className="text-gray-600 text-base">
                                                {shippingAddress.location.ward?.ward_name &&
                                                    `${shippingAddress.location.ward.ward_name}, `}
                                                {shippingAddress.location.district.district_name},{' '}
                                                {shippingAddress.location.province.province_name}
                                            </p>
                                            {shippingAddress.is_default && (
                                                <Badge variant="secondary">Địa chỉ mặc định</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-green-600" />
                                        Địa chỉ giao hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Fallback Address Information */}
                                        <div className="space-y-2">
                                            <p className="text-gray-600">
                                                Đang tải thông tin địa chỉ giao hàng...
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                ID: {checkoutData?.ship_info}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Products by Shop */}
                        {checkoutData.shops_info.map((shop) => (
                            <Card key={shop.shop_id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Store className="h-5 w-5 text-blue-600" />
                                        {shop.shop_name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Warehouse Information */}
                                    {shop.warehouses_info && shop.warehouses_info.length > 0 && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Kho hàng giao đến bạn
                                            </h4>
                                            <div className="space-y-2">
                                                {shop.warehouses_info.map((warehouse) => (
                                                    <div
                                                        key={warehouse.warehouse_id}
                                                        className="flex items-center justify-between bg-white p-3 rounded border"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-800">
                                                                {warehouse.warehouse_name}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {warehouse.warehouse_address}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-blue-600"
                                                            >
                                                                {warehouse.distance_km} km
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {shop.products_info.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg"
                                        >
                                            <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={mediaService.getMediaUrl(product.thumb)}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-semibold text-gray-800 text-base mb-1">
                                                    {product.name}
                                                </h4>
                                                <p className="text-blue-600 font-bold text-base">
                                                    {product.price.toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-600 text-sm mb-1">
                                                    Số lượng: {product.quantity}
                                                </p>
                                                <p className="font-bold text-blue-600 text-base">
                                                    {product.price_raw.toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Truck className="h-4 w-4" />
                                            Phí vận chuyển
                                        </span>
                                        <span className="font-semibold text-sm">
                                            {shop.fee_ship.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Payment Method */}
                        <VNPayPaymentOptions
                            selectedPayment={selectedPayment}
                            onPaymentChange={setSelectedPayment}
                            selectedBankCode={selectedBankCode}
                            onBankCodeChange={setSelectedBankCode}
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-xl text-blue-700">
                                    Tóm tắt đơn hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">
                                        {checkoutData.total_price_raw.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium">
                                        {checkoutData.total_fee_ship.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                                {checkoutData.total_discount_price > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Giảm giá</span>
                                        <span className="font-medium">
                                            -
                                            {checkoutData.total_discount_price.toLocaleString(
                                                'vi-VN'
                                            )}
                                            ₫
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold text-blue-800">
                                    <span>Tổng cộng</span>
                                    <span>
                                        {checkoutData.total_checkout.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                                <Button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-base py-4 mt-4"
                                >
                                    {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng
                                    tôi
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
