'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft,
    Package,
    MapPin,
    Truck,
    Calendar,
    CreditCard,
    Store,
    Phone,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { mediaService } from '@/lib/services/api/mediaService';
import orderService, { OrderHistoryItem } from '@/lib/services/api/orderService';

interface OrderDetailPageProps {}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'delivering':
            return 'bg-blue-100 text-blue-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        case 'rejected':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'Chờ xác nhận';
        case 'delivering':
            return 'Đang giao hàng';
        case 'delivered':
            return 'Đã giao hàng';
        case 'cancelled':
            return 'Đã hủy';
        case 'rejected':
            return 'Đã từ chối';
        default:
            return status;
    }
};

const getPaymentTypeText = (type: string) => {
    switch (type.toLowerCase()) {
        case 'cod':
            return 'Thanh toán khi nhận hàng';
        case 'vnpay':
            return 'VNPay';
        default:
            return type;
    }
};

export default function OrderDetailPage({}: OrderDetailPageProps) {
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<OrderHistoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!orderId) return;

            try {
                setIsLoading(true);
                const response = await orderService.getOrderById(orderId);
                setOrder(response.metadata);
            } catch (error: any) {
                console.error('Error fetching order detail:', error);
                toast.error('Không thể tải thông tin đơn hàng');
                router.push('/orders');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId, router]);

    const handleCancelOrder = async () => {
        if (!order || order.order_status !== 'pending') return;

        try {
            setIsCancelling(true);
            await orderService.cancelOrder(order._id);
            toast.success('Đơn hàng đã được hủy thành công');

            // Refresh order data
            const response = await orderService.getOrderById(orderId);
            setOrder(response.metadata);
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            toast.error('Không thể hủy đơn hàng');
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-gray-400 mb-4 animate-pulse" />
                    <h2 className="text-xl font-semibold mb-2">Đang tải thông tin đơn hàng...</h2>
                    <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng</h2>
                    <p className="text-gray-500 mb-4">Đơn hàng không tồn tại hoặc đã bị xóa</p>
                    <Button onClick={() => router.push('/orders')}>
                        Quay lại danh sách đơn hàng
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
                        <p className="text-gray-500">Mã đơn hàng: {order._id}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status & Actions */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-600" />
                                        Trạng thái đơn hàng
                                    </CardTitle>
                                    <Badge className={getStatusColor(order.order_status)}>
                                        {getStatusText(order.order_status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600">
                                            <Calendar className="inline h-4 w-4 mr-1" />
                                            Đặt hàng:{' '}
                                            {new Date(order.created_at).toLocaleString('vi-VN')}
                                        </p>
                                        {order.updated_at !== order.created_at && (
                                            <p className="text-sm text-gray-600">
                                                Cập nhật:{' '}
                                                {new Date(order.updated_at).toLocaleString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                    {order.order_status === 'pending' && (
                                        <Button
                                            variant="outline"
                                            onClick={handleCancelOrder}
                                            disabled={isCancelling}
                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                            {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shop Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5 text-green-600" />
                                    Thông tin cửa hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    {order.shop_logo && (
                                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                            <Image
                                                src={mediaService.getMediaUrl(order.shop_logo)}
                                                alt={order.shop_name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-lg">{order.shop_name}</h3>
                                        <p className="text-gray-600">ID: {order.shop_id}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Warehouse Information */}
                        {order.warehouses_info && order.warehouses_info.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-purple-600" />
                                        Kho hàng giao đến bạn
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {order.warehouses_info.map((warehouse) => (
                                            <div
                                                key={warehouse.warehouse_id}
                                                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-purple-800">
                                                        {warehouse.warehouse_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {warehouse.warehouse_address}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                                                        {warehouse.distance_km} km
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sản phẩm đã đặt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.products_info.map((product, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                            <Image
                                                src={mediaService.getMediaUrl(product.thumb)}
                                                alt={product.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-medium text-gray-900">
                                                {product.product_name}
                                            </h4>
                                            {product.sku_variations &&
                                                product.sku_variations.length > 0 && (
                                                    <div className="flex gap-2 mt-1">
                                                        {product.sku_variations.map(
                                                            (variation, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs bg-white px-2 py-1 rounded border"
                                                                >
                                                                    {variation.key}:{' '}
                                                                    {variation.value}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                                SL: {product.quantity}
                                            </p>
                                            <p className="font-semibold text-blue-600">
                                                {product.price.toLocaleString('vi-VN')}₫
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Delivery Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-red-600" />
                                    Địa chỉ giao hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="font-semibold">{order.customer_full_name}</p>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {order.customer_phone}
                                    </p>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {order.customer_email}
                                    </p>
                                    <p className="text-gray-600">{order.customer_address}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tóm tắt đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Tạm tính</span>
                                    <span>{order.price_total_raw.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Phí vận chuyển</span>
                                    <span>{order.fee_ship.toLocaleString('vi-VN')}₫</span>
                                </div>
                                {order.total_discount_price > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Giảm giá</span>
                                        <span>
                                            -{order.total_discount_price.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng</span>
                                    <span className="text-blue-600">
                                        {order.price_to_payment.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                    Thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="font-medium">
                                        {getPaymentTypeText(order.payment_type)}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Trạng thái:</span>
                                        <Badge
                                            className={
                                                order.payment_paid
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }
                                        >
                                            {order.payment_paid
                                                ? 'Đã thanh toán'
                                                : 'Chưa thanh toán'}
                                        </Badge>
                                    </div>
                                    {order.payment_date && (
                                        <p className="text-sm text-gray-600">
                                            Thanh toán lúc:{' '}
                                            {new Date(order.payment_date).toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Discounts */}
                        {(order.discount || order.shop_discount) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Khuyến mãi áp dụng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {order.shop_discount && (
                                        <div className="p-3 bg-blue-50 rounded border">
                                            <p className="font-medium text-blue-800">
                                                {order.shop_discount.discount_name}
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                Mã: {order.shop_discount.discount_code}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.shop_discount.discount_type === 'percentage'
                                                    ? `Giảm ${order.shop_discount.discount_value}%`
                                                    : `Giảm ${order.shop_discount.discount_value.toLocaleString(
                                                          'vi-VN'
                                                      )}₫`}
                                            </p>
                                        </div>
                                    )}
                                    {order.discount && (
                                        <div className="p-3 bg-green-50 rounded border">
                                            <p className="font-medium text-green-800">
                                                {order.discount.discount_name}
                                            </p>
                                            <p className="text-sm text-green-600">
                                                Mã: {order.discount.discount_code}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.discount.discount_type === 'percentage'
                                                    ? `Giảm ${order.discount.discount_value}%`
                                                    : `Giảm ${order.discount.discount_value.toLocaleString(
                                                          'vi-VN'
                                                      )}₫`}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Additional Info */}
                        {(order.cancellation_reason ||
                            order.rejection_reason ||
                            order.refund_info) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin bổ sung</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {order.cancellation_reason && (
                                        <div>
                                            <p className="font-medium text-red-600">
                                                Lý do hủy đơn:
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.cancellation_reason}
                                            </p>
                                            {order.cancelled_at && (
                                                <p className="text-xs text-gray-500">
                                                    Hủy lúc:{' '}
                                                    {new Date(order.cancelled_at).toLocaleString(
                                                        'vi-VN'
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {order.rejection_reason && (
                                        <div>
                                            <p className="font-medium text-red-600">
                                                Lý do từ chối:
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.rejection_reason}
                                            </p>
                                            {order.rejected_at && (
                                                <p className="text-xs text-gray-500">
                                                    Từ chối lúc:{' '}
                                                    {new Date(order.rejected_at).toLocaleString(
                                                        'vi-VN'
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {order.refund_info && (
                                        <div>
                                            <p className="font-medium text-blue-600">
                                                Thông tin hoàn tiền:
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Mã hoàn tiền: {order.refund_info.refund_id}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Số tiền:{' '}
                                                {order.refund_info.refund_amount.toLocaleString(
                                                    'vi-VN'
                                                )}
                                                ₫
                                            </p>
                                            <Badge
                                                className={
                                                    order.refund_info.refund_status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.refund_info.refund_status ===
                                                          'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }
                                            >
                                                {order.refund_info.refund_status === 'completed'
                                                    ? 'Hoàn tiền thành công'
                                                    : order.refund_info.refund_status === 'failed'
                                                    ? 'Hoàn tiền thất bại'
                                                    : 'Đang xử lý hoàn tiền'}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
