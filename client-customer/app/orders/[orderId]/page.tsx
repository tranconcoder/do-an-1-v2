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
    Mail,
    XCircle,
    Clock,
    Loader2,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { mediaService } from '@/lib/services/api/mediaService';
import orderService, { OrderHistoryItem } from '@/lib/services/api/orderService';
import reviewService, { Review } from '@/lib/services/api/reviewService';
import ReviewForm from '@/components/review/ReviewForm';
import ReviewDisplay from '@/components/review/ReviewDisplay';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';

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

const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
};

export default function OrderDetailPage({}: OrderDetailPageProps) {
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<OrderHistoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    // Cancel dialog states
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelCountdown, setCancelCountdown] = useState(5);
    const [canCancel, setCanCancel] = useState(false);

    // Review states
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedSkuForReview, setSelectedSkuForReview] = useState<any>(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!orderId) return;

            try {
                setIsLoading(true);
                const response = await orderService.getOrderById(orderId);
                setOrder(response.metadata);

                // Fetch reviews for this order if it's completed
                if (response.metadata.order_status === 'completed') {
                    await fetchOrderReviews(orderId);
                }
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

    // Function to fetch reviews for the order
    const fetchOrderReviews = async (orderId: string) => {
        try {
            setLoadingReviews(true);
            const response = await reviewService.getReviewsByOrderId(orderId);
            setReviews(response.metadata);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            // Don't show error toast for reviews as it's not critical
        } finally {
            setLoadingReviews(false);
        }
    };

    // Handle countdown for cancel dialog
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showCancelDialog && cancelCountdown > 0) {
            interval = setInterval(() => {
                setCancelCountdown((prev) => {
                    if (prev <= 1) {
                        setCanCancel(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [showCancelDialog, cancelCountdown]);

    const handleCancelOrder = async () => {
        if (!order) return;

        try {
            setIsCancelling(true);
            const response = await orderService.cancelOrder(order._id);

            // Check if refund information is available
            const refundInfo = response.metadata.refund_info;

            toast.success(
                refundInfo
                    ? `Đơn hàng đã được hủy thành công. Hoàn tiền ${formatPrice(
                          refundInfo.refund_amount
                      )} đang được xử lý.`
                    : 'Đơn hàng đã được hủy thành công.'
            );

            // Close dialog and reset state
            setShowCancelDialog(false);
            setCancelCountdown(5);
            setCanCancel(false);

            // Refresh order data
            const updatedResponse = await orderService.getOrderById(orderId);
            setOrder(updatedResponse.metadata);
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            toast.error('Không thể hủy đơn hàng');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCancelClick = () => {
        setShowCancelDialog(true);
        setCancelCountdown(5);
        setCanCancel(false);
    };

    // Review handling functions
    const handleWriteReview = (sku: any) => {
        setSelectedSkuForReview(sku);
        setShowReviewForm(true);
    };

    const handleReviewSubmitted = async () => {
        setShowReviewForm(false);
        setSelectedSkuForReview(null);
        // Refresh reviews
        if (orderId) {
            await fetchOrderReviews(orderId);
        }
    };

    const handleCancelReview = () => {
        setShowReviewForm(false);
        setSelectedSkuForReview(null);
    };

    // Check if a SKU has been reviewed
    const isSkuReviewed = (skuId: string) => {
        return reviews.some((review) => review.sku_id === skuId);
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
                                            onClick={handleCancelClick}
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
                                        Thông tin kho hàng giao đến bạn
                                    </CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Đơn hàng sẽ được giao từ {order.warehouses_info.length} kho
                                        hàng
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.warehouses_info.map((warehouse, index) => (
                                            <div
                                                key={warehouse.warehouse_id}
                                                className="relative p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                                <Package className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-purple-800">
                                                                    {warehouse.warehouse_name}
                                                                </p>
                                                                <p className="text-xs text-purple-600">
                                                                    Mã kho: {warehouse.warehouse_id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="ml-10">
                                                            <p className="text-sm text-gray-700 mb-2">
                                                                📍 {warehouse.warehouse_address}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    🚚 Khoảng cách:{' '}
                                                                    {warehouse.distance_km} km
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-purple-600 border-purple-300 bg-white"
                                                        >
                                                            {warehouse.distance_km} km
                                                        </Badge>
                                                        {index === 0 && (
                                                            <p className="text-xs text-purple-600 mt-1 font-medium">
                                                                Kho chính
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-700 flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                <span className="font-medium">Lưu ý:</span>
                                                Sản phẩm sẽ được đóng gói và giao từ kho gần nhất để
                                                đảm bảo thời gian giao hàng nhanh nhất.
                                            </p>
                                        </div>
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
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    SL: {product.quantity}
                                                </p>
                                                <p className="font-semibold text-blue-600">
                                                    {product.price.toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>
                                            {/* Review button for completed orders */}
                                            {order.order_status === 'completed' && (
                                                <div>
                                                    {isSkuReviewed(product.sku_id) ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-green-600 border-green-600"
                                                        >
                                                            Đã đánh giá
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleWriteReview(product)
                                                            }
                                                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                        >
                                                            Viết đánh giá
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
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

                        {/* Reviews Section */}
                        {order.order_status === 'completed' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        Đánh giá sản phẩm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingReviews ? (
                                        <div className="text-center py-4">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Đang tải đánh giá...
                                            </p>
                                        </div>
                                    ) : reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((review) => {
                                                const product = order.products_info.find(
                                                    (p) => p.sku_id === review.sku_id
                                                );
                                                return (
                                                    <ReviewDisplay
                                                        key={review._id}
                                                        review={review}
                                                        showProductInfo={true}
                                                        productName={product?.product_name}
                                                        productThumb={product?.thumb}
                                                        productVariations={product?.sku_variations}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                Chưa có đánh giá nào cho đơn hàng này
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Hãy chia sẻ trải nghiệm của bạn về các sản phẩm đã
                                                mua
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
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

            {/* Cancel Dialog */}
            {showCancelDialog && order && (
                <AlertDialog
                    open={showCancelDialog}
                    onOpenChange={(open) => {
                        if (!open) {
                            setShowCancelDialog(false);
                            setCancelCountdown(5);
                            setCanCancel(false);
                        }
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                Xác nhận hủy đơn hàng
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                                <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
                                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                                    <p className="font-medium">
                                        Mã đơn hàng: #{(order._id || '').slice(-8) || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Shop: {order.shop_name || 'Unknown Shop'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Tổng tiền: {formatPrice(order.price_to_payment || 0)}
                                    </p>
                                </div>
                                <p className="text-sm text-red-600">
                                    ⚠️ Hành động này không thể hoàn tác.
                                </p>
                                {!canCancel && (
                                    <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                        🕐 Vui lòng đợi {cancelCountdown} giây để xác nhận hủy đơn
                                        hàng.
                                    </p>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => {
                                    setShowCancelDialog(false);
                                    setCancelCountdown(5);
                                    setCanCancel(false);
                                }}
                                disabled={isCancelling}
                            >
                                Không, giữ đơn hàng
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleCancelOrder}
                                disabled={isCancelling || !canCancel}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang hủy...
                                    </>
                                ) : !canCancel ? (
                                    <>
                                        <Clock className="h-4 w-4 mr-2" />
                                        Chờ {cancelCountdown}s
                                    </>
                                ) : (
                                    'Có, hủy đơn hàng'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Review Form Modal */}
            {showReviewForm && selectedSkuForReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <ReviewForm
                            orderId={order._id}
                            sku={selectedSkuForReview}
                            onReviewSubmitted={handleReviewSubmitted}
                            onCancel={handleCancelReview}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
