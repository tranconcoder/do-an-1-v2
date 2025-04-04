import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './OrderManager.module.scss';
import OrderDetails from './components/OrderDetails';
import axiosClient from '../../configs/axios';
import { useToast } from '../../contexts/ToastContext';

const cx = classNames.bind(styles);

// Sample data for development - will be replaced with API data
const dummyOrders = [
    {
        id: 'ORD-001',
        customer: {
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phone: '0901234567'
        },
        orderDate: '2023-11-05T08:30:00',
        total: 1250000,
        status: 'pending',
        items: [
            { id: 1, name: 'Tai Nghe Không Dây', price: 1250000, quantity: 1, variation: 'Màu đen' }
        ],
        shippingAddress: '123 Nguyễn Văn Linh, Quận 7, TP HCM',
        paymentMethod: 'COD'
    },
    {
        id: 'ORD-002',
        customer: {
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            phone: '0912345678'
        },
        orderDate: '2023-11-05T10:15:00',
        total: 4450000,
        status: 'processing',
        items: [
            { id: 2, name: 'Đồng Hồ Thông Minh', price: 4450000, quantity: 1, variation: 'Bạc' }
        ],
        shippingAddress: '456 Lê Văn Việt, Quận 9, TP HCM',
        paymentMethod: 'Banking'
    },
    {
        id: 'ORD-003',
        customer: {
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            phone: '0987654321'
        },
        orderDate: '2023-11-04T15:45:00',
        total: 2790000,
        status: 'shipped',
        items: [
            { id: 3, name: 'Loa Bluetooth', price: 2790000, quantity: 1, variation: 'Xanh dương' }
        ],
        shippingAddress: '789 Võ Văn Tần, Quận 3, TP HCM',
        paymentMethod: 'Credit Card'
    },
    {
        id: 'ORD-004',
        customer: {
            name: 'Phạm Thị D',
            email: 'phamthid@example.com',
            phone: '0978123456'
        },
        orderDate: '2023-11-03T09:20:00',
        total: 8500000,
        status: 'delivered',
        items: [
            { id: 4, name: 'Laptop', price: 8500000, quantity: 1, variation: '8GB RAM, 256GB SSD' }
        ],
        shippingAddress: '101 Lê Lợi, Quận 1, TP HCM',
        paymentMethod: 'Banking'
    },
    {
        id: 'ORD-005',
        customer: {
            name: 'Hoàng Văn E',
            email: 'hoangvane@example.com',
            phone: '0932123456'
        },
        orderDate: '2023-11-02T16:10:00',
        total: 950000,
        status: 'cancelled',
        items: [
            { id: 5, name: 'Chuột Không Dây', price: 950000, quantity: 1, variation: 'Đen' }
        ],
        shippingAddress: '202 Điện Biên Phủ, Bình Thạnh, TP HCM',
        paymentMethod: 'COD'
    }
];

function OrderManager() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered, cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        // In production, this would fetch from the API
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // For demo, we'll use the dummy data
                // In production: const response = await axiosClient.get('/orders');
                setTimeout(() => {
                    setOrders(dummyOrders);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching orders:', error);
                showToast('Lỗi khi tải danh sách đơn hàng', 'error');
                setLoading(false);
            }
        };

        fetchOrders();
    }, [showToast]);

    // Format date to a more readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Format price to VND currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Get Vietnamese status text
    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Chờ xác nhận',
            processing: 'Đang xử lý',
            shipped: 'Đang giao hàng',
            delivered: 'Đã giao hàng',
            cancelled: 'Đã hủy'
        };
        return statusMap[status] || status;
    };

    // Update order status
    const handleUpdateStatus = async (orderId, newStatus) => {
        // In production this would call the API
        // const response = await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus });
        
        // For demo, we'll update the local state
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        showToast(`Đã cập nhật trạng thái đơn hàng thành ${getStatusText(newStatus)}`, 'success');
    };

    // View order details
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetails(true);
    };

    // Close order details modal
    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedOrder(null);
    };

    // Filter orders based on status and search term
    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.phone.includes(searchTerm);
        
        return matchesFilter && matchesSearch;
    });

    return (
        <div className={cx('order-manager')}>
            <div className={cx('header')}>
                <h1>Quản Lý Đơn Hàng</h1>
            </div>

            <div className={cx('filters')}>
                <div className={cx('status-filters')}>
                    <button
                        className={cx('filter-btn', filter === 'all' && 'active')}
                        onClick={() => setFilter('all')}
                    >
                        Tất Cả Đơn Hàng
                    </button>
                    <button
                        className={cx('filter-btn', filter === 'pending' && 'active')}
                        onClick={() => setFilter('pending')}
                    >
                        Chờ Xác Nhận
                    </button>
                    <button
                        className={cx('filter-btn', filter === 'processing' && 'active')}
                        onClick={() => setFilter('processing')}
                    >
                        Đang Xử Lý
                    </button>
                    <button
                        className={cx('filter-btn', filter === 'shipped' && 'active')}
                        onClick={() => setFilter('shipped')}
                    >
                        Đang Giao Hàng
                    </button>
                    <button
                        className={cx('filter-btn', filter === 'delivered' && 'active')}
                        onClick={() => setFilter('delivered')}
                    >
                        Đã Giao Hàng
                    </button>
                    <button
                        className={cx('filter-btn', filter === 'cancelled' && 'active')}
                        onClick={() => setFilter('cancelled')}
                    >
                        Đã Hủy
                    </button>
                </div>
                <div className={cx('search')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className={cx('loading')}>Đang tải đơn hàng...</div>
            ) : (
                <>
                    {filteredOrders.length === 0 ? (
                        <div className={cx('no-orders')}>
                            Không tìm thấy đơn hàng nào.
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className={cx('reset-btn')}
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={cx('orders-table-wrapper')}>
                            <table className={cx('orders-table')}>
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Khách Hàng</th>
                                        <th>Ngày Đặt</th>
                                        <th>Tổng Tiền</th>
                                        <th>Trạng Thái</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className={cx('order-id')}>{order.id}</td>
                                            <td className={cx('customer-info')}>
                                                <div className={cx('customer-name')}>{order.customer.name}</div>
                                                <div className={cx('customer-contact')}>{order.customer.phone}</div>
                                            </td>
                                            <td>{formatDate(order.orderDate)}</td>
                                            <td className={cx('order-total')}>{formatPrice(order.total)}</td>
                                            <td>
                                                <span className={cx('status', order.status)}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={cx('actions')}>
                                                    <button
                                                        className={cx('view-btn')}
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                    
                                                    {order.status === 'pending' && (
                                                        <>
                                                            <button
                                                                className={cx('process-btn')}
                                                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                                                            >
                                                                Xác nhận
                                                            </button>
                                                            <button
                                                                className={cx('cancel-btn')}
                                                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                            >
                                                                Hủy
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    {order.status === 'processing' && (
                                                        <button
                                                            className={cx('ship-btn')}
                                                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                                        >
                                                            Giao hàng
                                                        </button>
                                                    )}
                                                    
                                                    {order.status === 'shipped' && (
                                                        <button
                                                            className={cx('deliver-btn')}
                                                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                        >
                                                            Đã giao
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {showDetails && selectedOrder && (
                <OrderDetails order={selectedOrder} onClose={handleCloseDetails} onUpdateStatus={handleUpdateStatus} />
            )}
        </div>
    );
}

export default OrderManager;
