'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Truck, MapPin, Store, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { mediaService } from '@/lib/services/api/mediaService';
import orderService, { CreateOrderRequest } from '@/lib/services/api/orderService';
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';

interface CheckoutData {
    _id: string;
    user: string;
    shops_info: Array<{
        shop_id: string;
        shop_name: string;
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
    ship_info: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { addresses } = useSelector((state: RootState) => state.address);

    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'vnpay'>('cod');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Get checkout data from localStorage or URL params
        const storedCheckoutData = localStorage.getItem('checkoutData');
        if (storedCheckoutData) {
            try {
                const data = JSON.parse(storedCheckoutData);
                setCheckoutData(data);
            } catch (error) {
                console.error('Error parsing checkout data:', error);
                router.push('/cart');
            }
        } else {
            // Redirect back to cart if no checkout data
            router.push('/cart');
        }
    }, [router]);

    const handlePayment = async () => {
        if (!checkoutData) return;

        setIsProcessing(true);
        try {
            const orderRequest: CreateOrderRequest = {
                paymentType: selectedPayment
            };

            const orderResult = await orderService.createOrder(orderRequest);

            // Clear checkout data from localStorage
            localStorage.removeItem('checkoutData');

            toast({
                title: 'Thành công!',
                description: 'Đặt hàng thành công! Cảm ơn bạn đã mua sắm.',
                variant: 'success'
            });

            // Redirect to order success page or orders list
            router.push('/profile?tab=orders');
        } catch (error: any) {
            console.error('Order error:', error);
            toast({
                title: 'Lỗi',
                description: error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const getShippingAddress = () => {
        if (!checkoutData?.ship_info || !addresses.length) return null;
        return addresses.find((addr) => addr._id === checkoutData.ship_info);
    };

    if (!checkoutData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Đang tải thông tin đơn hàng...</h2>
                </div>
            </div>
        );
    }

    const shippingAddress = getShippingAddress();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
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

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        {shippingAddress && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-green-600" />
                                        Địa chỉ giao hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-semibold">
                                            {shippingAddress.recipient_name}
                                        </p>
                                        <p className="text-gray-600">
                                            {shippingAddress.recipient_phone}
                                        </p>
                                        <p className="text-gray-600">
                                            {shippingAddress.location.address}
                                        </p>
                                        <p className="text-gray-600">
                                            {shippingAddress.location.ward?.ward_name &&
                                                `${shippingAddress.location.ward.ward_name}, `}
                                            {shippingAddress.location.district.district_name},{' '}
                                            {shippingAddress.location.province.province_name}
                                        </p>
                                        {shippingAddress.is_default && (
                                            <Badge variant="secondary">Địa chỉ mặc định</Badge>
                                        )}
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
                                    {shop.products_info.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={mediaService.getMediaUrl(product.thumb)}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-semibold text-gray-800 text-sm">
                                                    {product.name}
                                                </h4>
                                                <p className="text-blue-600 font-bold text-sm">
                                                    {product.price.toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-600 text-xs">
                                                    Số lượng: {product.quantity}
                                                </p>
                                                <p className="font-bold text-blue-600 text-sm">
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                    Phương thức thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={selectedPayment}
                                    onValueChange={(value: 'cod' | 'vnpay') =>
                                        setSelectedPayment(value)
                                    }
                                >
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Label htmlFor="cod" className="flex-grow cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Truck className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="font-semibold">
                                                        Thanh toán khi nhận hàng (COD)
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Thanh toán bằng tiền mặt khi nhận hàng
                                                    </p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 opacity-75">
                                        <RadioGroupItem value="vnpay" id="vnpay" disabled />
                                        <Label htmlFor="vnpay" className="flex-grow cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="font-semibold">VNPay</p>
                                                    <p className="text-sm text-gray-600">
                                                        Thanh toán online qua VNPay (Sắp ra mắt)
                                                    </p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
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
