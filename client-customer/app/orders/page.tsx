'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ShoppingBag,
    Eye,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    SortAsc,
    SortDesc,
    RefreshCw
} from 'lucide-react';
import orderService, {
    OrderHistoryItem,
    GetOrderHistoryParams,
    PaginationInfo
} from '@/lib/services/api/orderService';
import paymentService from '@/lib/services/api/paymentService';
import { getMediaUrl } from '@/lib/services/api/mediaService';
import { formatPrice } from '@/lib/utils/cartUtils';
import VNPayPaymentModal from '@/components/common/VNPayPaymentModal';

// Order status mapping to Vietnamese
const ORDER_STATUS_MAP = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    pending_payment: {
        label: 'Chờ thanh toán',
        color: 'bg-orange-100 text-orange-800',
        icon: CreditCard
    },
    delivering: { label: 'Đang giao hàng', color: 'bg-blue-100 text-blue-800', icon: Truck },
    success: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle }
};

// Payment type mapping to Vietnamese
const PAYMENT_TYPE_MAP = {
    cod: 'Thanh toán khi nhận hàng',
    vnpay: 'VNPay'
};

// Sort options
const SORT_OPTIONS = [
    { value: 'created_at', label: 'Ngày tạo' },
    { value: 'updated_at', label: 'Ngày cập nhật' },
    { value: 'price_to_payment', label: 'Tổng tiền' }
];

export default function OrderHistoryPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending_payment');
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<OrderHistoryItem | null>(null);
    const [cancelCountdown, setCancelCountdown] = useState(5);
    const [canCancel, setCanCancel] = useState(false);

    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orderToPayFor, setOrderToPayFor] = useState<OrderHistoryItem | null>(null);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'price_to_payment'>(
        'created_at'
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Debounced search
    const [searchDebounce, setSearchDebounce] = useState('');

    // Tab sliding indicator position
    const [indicatorStyle, setIndicatorStyle] = useState({ left: '0%', width: '16.666%' });

    // Tab colors for sliding effect
    const tabColors = {
        pending_payment: 'from-orange-500 to-red-500',
        pending: 'from-yellow-500 to-orange-500',
        delivering: 'from-blue-500 to-cyan-500',
        success: 'from-green-500 to-emerald-500',
        completed: 'from-emerald-600 to-teal-600',
        cancelled: 'from-red-500 to-pink-500'
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Update indicator position when active tab changes
    useEffect(() => {
        const tabOrder = [
            'pending_payment',
            'pending',
            'delivering',
            'success',
            'completed',
            'cancelled'
        ];
        const activeIndex = tabOrder.indexOf(activeTab);
        const leftPosition = (activeIndex * 100) / 6; // 6 tabs total
        setIndicatorStyle({
            left: `${leftPosition}%`,
            width: '16.666%' // 100% / 6 tabs
        });
    }, [activeTab]);

    // Fetch orders based on filters
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params: GetOrderHistoryParams = {
                status: activeTab,
                page: currentPage,
                limit: itemsPerPage,
                search: searchDebounce || undefined,
                sortBy,
                sortOrder,
                paymentType: paymentTypeFilter !== 'all' ? paymentTypeFilter : undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined
            };

            const response = await orderService.getOrderHistory(params);
            setOrders(response.metadata.orders);
            setPagination(response.metadata.pagination);
        } catch (error: any) {
            console.error('Failed to fetch orders:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [
        activeTab,
        currentPage,
        itemsPerPage,
        searchDebounce,
        sortBy,
        sortOrder,
        paymentTypeFilter,
        dateFrom,
        dateTo,
        toast
    ]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchDebounce, paymentTypeFilter, dateFrom, dateTo]);

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

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleViewOrderDetail = (orderId: string) => {
        router.push(`/orders/${orderId}`);
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            setCancellingOrderId(orderId);
            const response = await orderService.cancelOrder(orderId);

            // Check if refund information is available
            const refundInfo = response.metadata.refund_info;

            toast({
                title: 'Thành công',
                description: refundInfo
                    ? `Đơn hàng đã được hủy thành công. Hoàn tiền ${formatPrice(
                          refundInfo.refund_amount
                      )} đang được xử lý.`
                    : 'Đơn hàng đã được hủy thành công.',
                variant: 'default'
            });

            // Close dialog and reset state
            setShowCancelDialog(false);
            setOrderToCancel(null);
            setCancelCountdown(5);
            setCanCancel(false);

            // Refresh the orders list
            await fetchOrders();
        } catch (error: any) {
            console.error('Failed to cancel order:', error);
            toast({
                title: 'Lỗi',
                description:
                    error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.',
                variant: 'destructive'
            });
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handlePayment = (order: OrderHistoryItem) => {
        setOrderToPayFor(order);
        setShowPaymentModal(true);
    };

    const handleSortToggle = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setShowSearchInput(false);
        setPaymentTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        setSortBy('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) {
            return 'Không có thông tin';
        }

        try {
            // Handle different date formats
            let date: Date;

            // If it's already a valid ISO string or timestamp
            if (typeof dateString === 'string' && dateString.includes('T')) {
                date = new Date(dateString);
            } else if (typeof dateString === 'string' && !isNaN(Number(dateString))) {
                // If it's a timestamp string
                date = new Date(Number(dateString));
            } else {
                // Try parsing as is
                date = new Date(dateString);
            }

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return 'Ngày không hợp lệ';
            }

            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error, 'dateString:', dateString);
            return 'Lỗi định dạng ngày';
        }
    };

    const getOrderStatusInfo = (status: string) => {
        return (
            ORDER_STATUS_MAP[status as keyof typeof ORDER_STATUS_MAP] || {
                label: status,
                color: 'bg-gray-100 text-gray-800',
                icon: Package
            }
        );
    };

    const renderOrderCard = (order: OrderHistoryItem) => {
        const statusInfo = getOrderStatusInfo(order.order_status);
        const StatusIcon = statusInfo.icon;
        const canCancel =
            order.order_status === 'pending_payment' || order.order_status === 'pending';
        const isCancelling = cancellingOrderId === order._id;

        return (
            <Card key={order._id} className="mb-4 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    Đơn hàng #{(order._id || '').slice(-8) || 'N/A'}
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Đặt hàng:{' '}
                                    {formatDate(order.created_at || order.updated_at || '')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={statusInfo.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                            </Badge>
                            {order.payment_paid && (
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Đã thanh toán
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={
                                    order.customer_avatar
                                        ? getMediaUrl(order.customer_avatar)
                                        : undefined
                                }
                            />
                            <AvatarFallback>
                                {order.customer_full_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium">
                                {order.customer_full_name || 'Unknown Customer'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {order.customer_phone || 'N/A'}
                                </div>
                                {order.customer_email && (
                                    <div className="flex items-center">
                                        <Mail className="h-3 w-3 mr-1" />
                                        {order.customer_email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium">Địa chỉ giao hàng:</p>
                            <p className="text-gray-600">
                                {order.customer_address || 'Không có thông tin'}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                        <p className="font-medium flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Sản phẩm đã đặt:
                        </p>
                        <div className="border rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={
                                            order.shop_logo
                                                ? getMediaUrl(order.shop_logo)
                                                : undefined
                                        }
                                    />
                                    <AvatarFallback>
                                        {order.shop_name?.charAt(0).toUpperCase() || 'S'}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="font-medium text-sm">
                                    {order.shop_name || 'Unknown Shop'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                {order.products_info?.slice(0, 2).map((product, productIndex) => (
                                    <div key={productIndex} className="flex items-center space-x-3">
                                        <img
                                            src={getMediaUrl(product.thumb)}
                                            alt={product.product_name || 'Product'}
                                            className="h-12 w-12 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {product.product_name || 'Unknown Product'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Số lượng: {product.quantity || 0} ×{' '}
                                                {formatPrice(product.price || 0)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {formatPrice(
                                                (product.price || 0) * (product.quantity || 0)
                                            )}
                                        </p>
                                    </div>
                                )) || []}

                                {(order.products_info?.length || 0) > 2 && (
                                    <p className="text-sm text-gray-500 text-center py-2">
                                        ... và {(order.products_info?.length || 0) - 2} sản phẩm
                                        khác
                                    </p>
                                )}
                            </div>

                            {/* Shop Discount */}
                            {order.shop_discount && (
                                <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                    <p className="text-green-700">
                                        Giảm giá shop:{' '}
                                        {order.shop_discount.discount_name || 'Discount'} (-
                                        {formatPrice(order.shop_discount.discount_value || 0)})
                                    </p>
                                </div>
                            )}

                            {/* Admin Discount */}
                            {order.discount && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                    <p className="text-blue-700">
                                        Giảm giá hệ thống:{' '}
                                        {order.discount.discount_name || 'Discount'} (-
                                        {formatPrice(order.discount.discount_value || 0)})
                                    </p>
                                </div>
                            )}

                            {/* Shipping Fee */}
                            <div className="mt-2 pt-2 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                    <span className="font-medium">
                                        {formatPrice(order.fee_ship || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                            <p className="font-medium">
                                {order.payment_type
                                    ? PAYMENT_TYPE_MAP[
                                          order.payment_type as keyof typeof PAYMENT_TYPE_MAP
                                      ] || order.payment_type
                                    : 'Không xác định'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-600">Trạng thái:</p>
                                {order.payment_paid ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Đã thanh toán
                                    </Badge>
                                ) : (
                                    <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Chưa thanh toán
                                    </Badge>
                                )}
                            </div>
                            {order.payment_paid && order.payment_date && (
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Thanh toán lúc: {formatDate(order.payment_date)}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Tổng tiền:</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatPrice(order.price_to_payment || 0)}
                            </p>
                            {(order.total_discount_price || 0) > 0 && (
                                <p className="text-sm text-green-600">
                                    Đã giảm: {formatPrice(order.total_discount_price || 0)}
                                </p>
                            )}
                            {order.payment_paid && (
                                <div className="flex items-center justify-end mt-1">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-300"
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Đã thanh toán
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Refund Information */}
                    {order.order_status === 'cancelled' && order.refund_info && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-800 flex items-center">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Thông tin hoàn tiền
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">
                                            Mã hoàn tiền:{' '}
                                            <span className="font-mono text-xs">
                                                {order.refund_info.refund_id}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Số tiền hoàn:{' '}
                                            <span className="font-medium text-yellow-700">
                                                {formatPrice(order.refund_info.refund_amount)}
                                            </span>
                                        </p>
                                        {order.cancellation_reason && (
                                            <p className="text-sm text-gray-600">
                                                Lý do hủy:{' '}
                                                <span className="italic">
                                                    {order.cancellation_reason}
                                                </span>
                                            </p>
                                        )}
                                        {order.rejection_reason && order.rejected_by_shop && (
                                            <p className="text-sm text-gray-600">
                                                Lý do từ chối:{' '}
                                                <span className="italic">
                                                    {order.rejection_reason}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge
                                        className={
                                            order.refund_info.refund_status === 'completed'
                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                : order.refund_info.refund_status === 'failed'
                                                ? 'bg-red-100 text-red-800 border-red-300'
                                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                        }
                                    >
                                        {order.refund_info.refund_status === 'completed' && (
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {order.refund_info.refund_status === 'failed' && (
                                            <XCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {order.refund_info.refund_status === 'pending' && (
                                            <Clock className="h-3 w-3 mr-1" />
                                        )}
                                        {order.refund_info.refund_status === 'completed'
                                            ? 'Đã hoàn tiền'
                                            : order.refund_info.refund_status === 'failed'
                                            ? 'Hoàn tiền thất bại'
                                            : 'Đang xử lý hoàn tiền'}
                                    </Badge>
                                    {order.refund_info.refund_status === 'completed' && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Tiền sẽ được hoàn về tài khoản trong 1-3 ngày làm việc
                                        </p>
                                    )}
                                    {order.refund_info.refund_status === 'pending' && (
                                        <p className="text-xs text-yellow-600 mt-1">
                                            Đang xử lý, vui lòng chờ
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancellation Info for orders without refund */}
                    {order.order_status === 'cancelled' && !order.refund_info && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 flex items-center">
                                <XCircle className="h-4 w-4 mr-2" />
                                Đơn hàng đã bị hủy
                            </p>
                            <div className="mt-2 space-y-1">
                                {order.cancellation_reason && (
                                    <p className="text-sm text-gray-600">
                                        Lý do hủy:{' '}
                                        <span className="italic">{order.cancellation_reason}</span>
                                    </p>
                                )}
                                {order.rejection_reason && order.rejected_by_shop && (
                                    <p className="text-sm text-gray-600">
                                        Lý do từ chối:{' '}
                                        <span className="italic">{order.rejection_reason}</span>
                                    </p>
                                )}
                                {order.cancelled_at && (
                                    <p className="text-sm text-gray-600">
                                        Thời gian hủy: {formatDate(order.cancelled_at)}
                                    </p>
                                )}
                                {order.rejected_at && (
                                    <p className="text-sm text-gray-600">
                                        Thời gian từ chối: {formatDate(order.rejected_at)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrderDetail(order._id)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                        </Button>
                        {order.order_status === 'pending_payment' && (
                            <Button size="sm" onClick={() => handlePayment(order)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Thanh toán
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setShowCancelDialog(true);
                                    setOrderToCancel(order);
                                    setCancelCountdown(5);
                                    setCanCancel(false);
                                }}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                {isCancelling ? 'Đang hủy...' : 'Hủy đơn'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử đơn hàng</h1>
                    <p className="text-gray-600">Theo dõi và quản lý các đơn hàng của bạn</p>
                </div>

                {/* Compact Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border">
                    {/* Search Toggle Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSearchInput(!showSearchInput)}
                        className="flex items-center gap-2"
                    >
                        <Search className="h-4 w-4" />
                        Tìm kiếm
                    </Button>

                    {/* Payment Type Filter */}
                    <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Phương thức thanh toán" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả phương thức</SelectItem>
                            <SelectItem value="cod">COD</SelectItem>
                            <SelectItem value="vnpay">VNPay</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Date From */}
                    <Input
                        type="date"
                        placeholder="Từ ngày"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-40"
                    />

                    {/* Date To */}
                    <Input
                        type="date"
                        placeholder="Đến ngày"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-40"
                    />

                    {/* Sort */}
                    <div className="flex gap-1">
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleSortToggle}>
                            {sortOrder === 'asc' ? (
                                <SortAsc className="h-4 w-4" />
                            ) : (
                                <SortDesc className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Clear Filters */}
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Xóa bộ lọc
                    </Button>

                    {/* Items per page */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-gray-600">Hiển thị:</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => setItemsPerPage(parseInt(value))}
                        >
                            <SelectTrigger className="w-16">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Collapsible Search */}
                {showSearchInput && (
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Tìm kiếm theo tên, số điện thoại, email, địa chỉ hoặc mã đơn hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <div className="relative">
                        <TabsList className="grid w-full grid-cols-6 mb-6 h-16 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-2 relative overflow-hidden">
                            {/* Sliding Background Indicator */}
                            <div
                                className={`absolute top-2 bottom-2 bg-gradient-to-r ${
                                    tabColors[activeTab as keyof typeof tabColors]
                                } rounded-lg transition-all duration-500 ease-in-out shadow-lg z-0`}
                                style={{
                                    left: indicatorStyle.left,
                                    width: indicatorStyle.width,
                                    transform: 'translateX(0)'
                                }}
                            />

                            <TabsTrigger
                                value="pending_payment"
                                className="flex items-center space-x-2 h-12 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg relative z-10 data-[state=active]:bg-transparent"
                            >
                                <CreditCard className="h-5 w-5" />
                                <span>Chờ thanh toán</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="pending"
                                className="flex items-center space-x-2 h-12 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg relative z-10 data-[state=active]:bg-transparent"
                            >
                                <Clock className="h-5 w-5" />
                                <span>Chờ xử lý</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="delivering"
                                className="flex items-center space-x-2 h-12 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg relative z-10 data-[state=active]:bg-transparent"
                            >
                                <Truck className="h-5 w-5" />
                                <span>Đang giao</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="success"
                                className="flex items-center space-x-2 h-12 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg relative z-10 data-[state=active]:bg-transparent"
                            >
                                <CheckCircle className="h-5 w-5" />
                                <span>Đã thanh toán</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="flex items-center space-x-2 h-12 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg relative z-10 data-[state=active]:bg-transparent"
                            >
                                <CheckCircle className="h-5 w-5" />
                                <span>Hoàn thành</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="cancelled"
                                className="flex items-center space-x-2 h-12 text-base font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg relative z-10 data-[state=active]:bg-transparent"
                            >
                                <XCircle className="h-5 w-5" />
                                <span>Đã hủy</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab Contents */}
                    {[
                        'pending_payment',
                        'pending',
                        'delivering',
                        'success',
                        'completed',
                        'cancelled'
                    ].map((status) => (
                        <TabsContent
                            key={status}
                            value={status}
                            className="mt-6 transition-all duration-500 ease-in-out transform"
                        >
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <span className="ml-2 text-gray-600">Đang tải đơn hàng...</span>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Không có đơn hàng nào
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {`Không có đơn hàng nào ở trạng thái "${
                                            getOrderStatusInfo(status).label
                                        }"`}
                                    </p>
                                    <Button onClick={() => router.push('/products')}>
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Bắt đầu mua sắm
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">{orders.map(renderOrderCard)}</div>

                                    {/* Pagination */}
                                    {pagination && pagination.totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-8">
                                            <div className="text-sm text-gray-600">
                                                Hiển thị{' '}
                                                {(pagination.currentPage - 1) * pagination.limit +
                                                    1}{' '}
                                                -{' '}
                                                {Math.min(
                                                    pagination.currentPage * pagination.limit,
                                                    pagination.totalCount
                                                )}{' '}
                                                trong tổng số {pagination.totalCount} đơn hàng
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(pagination.currentPage - 1)
                                                    }
                                                    disabled={!pagination.hasPrevPage}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Trước
                                                </Button>

                                                {/* Page Numbers */}
                                                {Array.from(
                                                    { length: Math.min(5, pagination.totalPages) },
                                                    (_, i) => {
                                                        const pageNum = Math.max(
                                                            1,
                                                            Math.min(
                                                                pagination.currentPage - 2 + i,
                                                                pagination.totalPages - 4 + i
                                                            )
                                                        );
                                                        if (pageNum <= pagination.totalPages) {
                                                            return (
                                                                <Button
                                                                    key={pageNum}
                                                                    variant={
                                                                        pageNum ===
                                                                        pagination.currentPage
                                                                            ? 'default'
                                                                            : 'outline'
                                                                    }
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handlePageChange(pageNum)
                                                                    }
                                                                >
                                                                    {pageNum}
                                                                </Button>
                                                            );
                                                        }
                                                        return null;
                                                    }
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(pagination.currentPage + 1)
                                                    }
                                                    disabled={!pagination.hasNextPage}
                                                >
                                                    Sau
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {/* Cancel Dialog */}
            {showCancelDialog && orderToCancel && (
                <AlertDialog
                    open={showCancelDialog}
                    onOpenChange={(open) => {
                        if (!open) {
                            setShowCancelDialog(false);
                            setOrderToCancel(null);
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
                                        Mã đơn hàng: #{(orderToCancel._id || '').slice(-8) || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Shop: {orderToCancel.shop_name || 'Unknown Shop'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Tổng tiền:{' '}
                                        {formatPrice(orderToCancel.price_to_payment || 0)}
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
                                    setOrderToCancel(null);
                                    setCancelCountdown(5);
                                    setCanCancel(false);
                                }}
                                disabled={cancellingOrderId === orderToCancel._id}
                            >
                                Không, giữ đơn hàng
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleCancelOrder(orderToCancel._id)}
                                disabled={cancellingOrderId === orderToCancel._id || !canCancel}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                            >
                                {cancellingOrderId === orderToCancel._id ? (
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

            {/* Payment Modal */}
            {showPaymentModal && orderToPayFor && (
                <VNPayPaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setOrderToPayFor(null);
                    }}
                    order={orderToPayFor}
                    onPaymentSuccess={() => {
                        fetchOrders(); // Refresh orders after successful payment
                    }}
                />
            )}
        </div>
    );
}
