import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Order.module.scss';

const cx = classNames.bind(styles);

// Status constants
const ORDER_STATUSES = {
    PENDING_CONFIRMATION: 'pending_confirmation',
    PENDING_PAYMENT: 'pending_payment',
    PENDING_PICKUP: 'pending_pickup',
    IN_TRANSIT: 'in_transit',
    DELIVERING: 'delivering',
    DELIVERED: 'delivered'
};

function Order() {
    const [activeTab, setActiveTab] = useState(ORDER_STATUSES.PENDING_CONFIRMATION);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sample orders data
    const sampleOrders = [
        {
            id: 'ORD123456',
            status: ORDER_STATUSES.PENDING_CONFIRMATION,
            date: '2023-06-15',
            total: 159.99,
            items: [
                {
                    id: 1,
                    slug: 'wireless-bluetooth-headphones',
                    name: 'Wireless Bluetooth Headphones',
                    quantity: 1,
                    price: 89.99,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D&w=150&q=80'
                },
                {
                    id: 2,
                    slug: 'smartphone-case',
                    name: 'Smartphone Case',
                    quantity: 1,
                    price: 19.99,
                    image: 'https://images.unsplash.com/photo-1601784551766-bcb8d596cb0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGhvbmUlMjBjYXNlfGVufDB8fDB8fHww&w=150&q=80'
                },
                {
                    id: 3,
                    slug: 'usb-c-cable',
                    name: 'USB-C Cable',
                    quantity: 2,
                    price: 25.0,
                    image: 'https://images.unsplash.com/photo-1625948514504-491be1f3c508?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dXNiJTIwY2FibGV8ZW58MHx8MHx8fDA%3D&w=150&q=80'
                }
            ],
            shippingAddress: '123 Main St, Anytown, AN 12345'
        },
        {
            id: 'ORD123457',
            status: ORDER_STATUSES.PENDING_PAYMENT,
            date: '2023-06-16',
            total: 299.99,
            items: [
                {
                    id: 4,
                    slug: 'smartwatch',
                    name: 'Smartwatch',
                    quantity: 1,
                    price: 299.99,
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D&w=150&q=80'
                }
            ],
            shippingAddress: '456 Elm St, Othertown, OT 67890'
        },
        {
            id: 'ORD123458',
            status: ORDER_STATUSES.PENDING_PICKUP,
            date: '2023-06-14',
            total: 79.98,
            items: [
                {
                    id: 5,
                    slug: 'wireless-charger',
                    name: 'Wireless Charger',
                    quantity: 1,
                    price: 49.99,
                    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lyZWxlc3MlMjBjaGFyZ2VyfGVufDB8fDB8fHww&w=150&q=80'
                },
                {
                    id: 6,
                    slug: 'phone-stand',
                    name: 'Phone Stand',
                    quantity: 2,
                    price: 14.99,
                    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGhvbmUlMjBzdGFuZHxlbnwwfHwwfHx8MA%3D%3D&w=150&q=80'
                }
            ],
            shippingAddress: '789 Oak St, Somewhere, SW 54321'
        },
        {
            id: 'ORD123459',
            status: ORDER_STATUSES.IN_TRANSIT,
            date: '2023-06-13',
            total: 129.95,
            items: [
                {
                    id: 7,
                    slug: 'bluetooth-speaker',
                    name: 'Bluetooth Speaker',
                    quantity: 1,
                    price: 129.95,
                    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D&w=150&q=80'
                }
            ],
            shippingAddress: '101 Pine St, Elsewhere, EL 13579'
        },
        {
            id: 'ORD123460',
            status: ORDER_STATUSES.DELIVERING,
            date: '2023-06-12',
            total: 149.99,
            items: [
                {
                    id: 8,
                    slug: 'wireless-keyboard',
                    name: 'Wireless Keyboard',
                    quantity: 1,
                    price: 89.99,
                    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D&w=150&q=80'
                },
                {
                    id: 9,
                    slug: 'wireless-mouse',
                    name: 'Wireless Mouse',
                    quantity: 1,
                    price: 60.0,
                    image: 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lyZWxlc3MlMjBtb3VzZXxlbnwwfHwwfHx8MA%3D%3D&w=150&q=80'
                }
            ],
            shippingAddress: '202 Cedar St, Nowhere, NW 24680'
        },
        {
            id: 'ORD123461',
            status: ORDER_STATUSES.DELIVERED,
            date: '2023-06-10',
            total: 399.99,
            items: [
                {
                    id: 10,
                    slug: 'tablet',
                    name: 'Tablet',
                    quantity: 1,
                    price: 399.99,
                    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGFibGV0fGVufDB8fDB8fHww&w=150&q=80'
                }
            ],
            shippingAddress: '303 Birch St, Anywhere, AW 97531'
        }
    ];

    // Simulate fetching orders from an API
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // In production, use real API call
                // const response = await axiosClient.get('/orders');
                // const ordersData = response.data.metadata;

                // Using sample data for now
                setTimeout(() => {
                    setOrders(sampleOrders);
                    setLoading(false);
                }, 700);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter orders based on active tab
    const filteredOrders = orders.filter((order) => order.status === activeTab);

    // Format order status for display
    const formatOrderStatus = (status) => {
        switch (status) {
            case ORDER_STATUSES.PENDING_CONFIRMATION:
                return 'Chờ xác nhận';
            case ORDER_STATUSES.PENDING_PAYMENT:
                return 'Chờ thanh toán';
            case ORDER_STATUSES.PENDING_PICKUP:
                return 'Chờ lấy hàng';
            case ORDER_STATUSES.IN_TRANSIT:
                return 'Đang vận chuyển';
            case ORDER_STATUSES.DELIVERING:
                return 'Đang giao hàng';
            case ORDER_STATUSES.DELIVERED:
                return 'Đã giao hàng';
            default:
                return 'Unknown';
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={cx('order-container')}>
            <h1 className={cx('page-title')}>Đơn hàng của tôi</h1>

            <div className={cx('tabs-header')}>
                <button
                    className={cx('tab-btn', {
                        active: activeTab === ORDER_STATUSES.PENDING_CONFIRMATION
                    })}
                    onClick={() => handleTabChange(ORDER_STATUSES.PENDING_CONFIRMATION)}
                >
                    Chờ xác nhận
                </button>
                <button
                    className={cx('tab-btn', {
                        active: activeTab === ORDER_STATUSES.PENDING_PAYMENT
                    })}
                    onClick={() => handleTabChange(ORDER_STATUSES.PENDING_PAYMENT)}
                >
                    Chờ thanh toán
                </button>
                <button
                    className={cx('tab-btn', {
                        active: activeTab === ORDER_STATUSES.PENDING_PICKUP
                    })}
                    onClick={() => handleTabChange(ORDER_STATUSES.PENDING_PICKUP)}
                >
                    Chờ lấy hàng
                </button>
                <button
                    className={cx('tab-btn', { active: activeTab === ORDER_STATUSES.IN_TRANSIT })}
                    onClick={() => handleTabChange(ORDER_STATUSES.IN_TRANSIT)}
                >
                    Đang vận chuyển
                </button>
                <button
                    className={cx('tab-btn', { active: activeTab === ORDER_STATUSES.DELIVERING })}
                    onClick={() => handleTabChange(ORDER_STATUSES.DELIVERING)}
                >
                    Đang giao hàng
                </button>
                <button
                    className={cx('tab-btn', { active: activeTab === ORDER_STATUSES.DELIVERED })}
                    onClick={() => handleTabChange(ORDER_STATUSES.DELIVERED)}
                >
                    Đã giao hàng
                </button>
            </div>

            <div className={cx('orders-content')}>
                {loading ? (
                    <div className={cx('loading')}>Đang tải đơn hàng...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className={cx('no-orders')}>
                        <p>Không có đơn hàng nào trong trạng thái này.</p>
                    </div>
                ) : (
                    <div className={cx('orders-list')}>
                        {filteredOrders.map((order) => (
                            <div key={order.id} className={cx('order-card')}>
                                <div className={cx('order-header')}>
                                    <div className={cx('order-id')}>Mã đơn hàng: {order.id}</div>
                                    <div className={cx('order-date')}>Ngày đặt: {order.date}</div>
                                    <div className={cx('order-status')}>
                                        {formatOrderStatus(order.status)}
                                    </div>
                                </div>

                                <div className={cx('order-items')}>
                                    {order.items.map((item) => (
                                        <div key={item.id} className={cx('item-row')}>
                                            <Link
                                                to={`/product/${item.slug}`}
                                                className={cx('product-link')}
                                            >
                                                <div className={cx('item-image')}>
                                                    <img src={item.image} alt={item.name} />
                                                </div>
                                            </Link>
                                            <div className={cx('item-info')}>
                                                <Link
                                                    to={`/product/${item.slug}`}
                                                    className={cx('item-name-link')}
                                                >
                                                    <div className={cx('item-name')}>
                                                        {item.name}
                                                    </div>
                                                </Link>
                                                <div className={cx('item-quantity')}>
                                                    x{item.quantity}
                                                </div>
                                                <div className={cx('item-price')}>
                                                    ${item.price.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={cx('order-footer')}>
                                    <div className={cx('shipping-address')}>
                                        <strong>Địa chỉ giao hàng:</strong> {order.shippingAddress}
                                    </div>
                                    <div className={cx('order-total')}>
                                        <strong>Tổng cộng:</strong> ${order.total.toFixed(2)}
                                    </div>
                                    <div className={cx('order-actions')}>
                                        <Link
                                            to={`/order-detail/${order.id}`}
                                            className={cx('view-details-btn')}
                                        >
                                            Xem chi tiết
                                        </Link>
                                        {order.status === ORDER_STATUSES.DELIVERED && (
                                            <button className={cx('review-btn')}>Đánh giá</button>
                                        )}
                                        {order.status === ORDER_STATUSES.PENDING_CONFIRMATION && (
                                            <button className={cx('cancel-btn')}>
                                                Hủy đơn hàng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Order;
