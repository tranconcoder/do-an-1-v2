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
    SortDesc
} from 'lucide-react';
import orderService, {
    OrderHistoryItem,
    GetOrderHistoryParams,
    PaginationInfo
} from '@/lib/services/api/orderService';
import { getMediaUrl } from '@/lib/services/api/mediaService';
import { formatPrice } from '@/lib/utils/cartUtils';

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
    vnpay: 'VNPay',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng'
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
    const [activeTab, setActiveTab] = useState('all');
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleViewOrderDetail = (orderId: string) => {
        router.push(`/orders/${orderId}`);
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            setCancellingOrderId(orderId);
            await orderService.cancelOrder(orderId);

            toast({
                title: 'Thành công',
                description: 'Đơn hàng đã được hủy thành công.',
                variant: 'default'
            });

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

    const handleSortToggle = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const clearFilters = () => {
        setSearchTerm('');
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
                                    Đơn hàng #{order._id.slice(-8)}
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
                                {order.customer_full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium">{order.customer_full_name}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {order.customer_phone}
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
                            <p className="text-gray-600">{order.customer_address}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                        <p className="font-medium flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Sản phẩm đã đặt:
                        </p>
                        {order.order_checkout.shops_info.map((shop, shopIndex) => (
                            <div key={shopIndex} className="border rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {shop.shop_name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium text-sm">{shop.shop_name}</p>
                                </div>

                                <div className="space-y-2">
                                    {shop.products_info.slice(0, 2).map((product, productIndex) => (
                                        <div
                                            key={productIndex}
                                            className="flex items-center space-x-3"
                                        >
                                            <img
                                                src={getMediaUrl(product.thumb)}
                                                alt={product.name}
                                                className="h-12 w-12 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Số lượng: {product.quantity} ×{' '}
                                                    {formatPrice(product.price)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium">
                                                {formatPrice(product.price * product.quantity)}
                                            </p>
                                        </div>
                                    ))}

                                    {shop.products_info.length > 2 && (
                                        <p className="text-sm text-gray-500 text-center py-2">
                                            ... và {shop.products_info.length - 2} sản phẩm khác
                                        </p>
                                    )}
                                </div>

                                {shop.discount && (
                                    <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                        <p className="text-green-700">
                                            Giảm giá: {shop.discount.discount_name} (-
                                            {formatPrice(shop.discount.discount_value)})
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Payment Info */}
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                            <p className="font-medium">
                                {
                                    PAYMENT_TYPE_MAP[
                                        order.payment_type as keyof typeof PAYMENT_TYPE_MAP
                                    ]
                                }
                            </p>
                            <p className="text-sm text-gray-600">
                                Trạng thái:{' '}
                                {order.payment_paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Tổng tiền:</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatPrice(order.price_to_payment)}
                            </p>
                            {order.order_checkout.discount && (
                                <p className="text-sm text-green-600">
                                    Đã giảm:{' '}
                                    {formatPrice(order.price_total_raw - order.price_to_payment)}
                                </p>
                            )}
                        </div>
                    </div>

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
                            <Button size="sm">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Thanh toán
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelOrder(order._id)}
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

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc và tìm kiếm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Tìm kiếm theo tên, số điện thoại, email, địa chỉ hoặc mã đơn hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Payment Type Filter */}
                            <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Phương thức thanh toán" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="cod">COD</SelectItem>
                                    <SelectItem value="vnpay">VNPay</SelectItem>
                                    <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                                    <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Date From */}
                            <Input
                                type="date"
                                placeholder="Từ ngày"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />

                            {/* Date To */}
                            <Input
                                type="date"
                                placeholder="Đến ngày"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />

                            {/* Sort */}
                            <div className="flex gap-2">
                                <Select
                                    value={sortBy}
                                    onValueChange={(value: any) => setSortBy(value)}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Sắp xếp theo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORT_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={handleSortToggle}>
                                    {sortOrder === 'asc' ? (
                                        <SortAsc className="h-4 w-4" />
                                    ) : (
                                        <SortDesc className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Hiển thị:</span>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(value) => setItemsPerPage(parseInt(value))}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-gray-600">đơn hàng</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-7 mb-6">
                        <TabsTrigger value="all" className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span>Tất cả</span>
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Chờ xử lý</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending_payment"
                            className="flex items-center space-x-2"
                        >
                            <CreditCard className="h-4 w-4" />
                            <span>Chờ thanh toán</span>
                        </TabsTrigger>
                        <TabsTrigger value="delivering" className="flex items-center space-x-2">
                            <Truck className="h-4 w-4" />
                            <span>Đang giao</span>
                        </TabsTrigger>
                        <TabsTrigger value="success" className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Đã thanh toán</span>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Hoàn thành</span>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4" />
                            <span>Đã hủy</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Contents */}
                    {[
                        'all',
                        'pending',
                        'pending_payment',
                        'delivering',
                        'success',
                        'completed',
                        'cancelled'
                    ].map((status) => (
                        <TabsContent key={status} value={status} className="mt-6">
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
                                        {status === 'all'
                                            ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
                                            : `Không có đơn hàng nào ở trạng thái "${
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
        </div>
    );
}
