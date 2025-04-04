import React from 'react';
import classNames from 'classnames/bind';
import styles from './OrderDetails.module.scss';

const cx = classNames.bind(styles);

function OrderDetails({ order, onClose, onUpdateStatus }) {
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

    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('order-details-modal')}>
                <div className={cx('modal-header')}>
                    <h2>Chi Tiết Đơn Hàng #{order.id}</h2>
                    <button className={cx('close-btn')} onClick={onClose}>&times;</button>
                </div>
                
                <div className={cx('modal-content')}>
                    <div className={cx('order-status-section')}>
                        <div className={cx('status-header')}>
                            <h3>Trạng Thái Đơn Hàng</h3>
                            <span className={cx('status', order.status)}>
                                {getStatusText(order.status)}
                            </span>
                        </div>
                        
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <div className={cx('status-actions')}>
                                <h4>Cập Nhật Trạng Thái:</h4>
                                <div className={cx('action-buttons')}>
                                    {order.status === 'pending' && (
                                        <>
                                            <button 
                                                className={cx('process-btn')}
                                                onClick={() => onUpdateStatus(order.id, 'processing')}
                                            >
                                                Xác Nhận Đơn Hàng
                                            </button>
                                            <button 
                                                className={cx('cancel-btn')}
                                                onClick={() => onUpdateStatus(order.id, 'cancelled')}
                                            >
                                                Hủy Đơn Hàng
                                            </button>
                                        </>
                                    )}
                                    
                                    {order.status === 'processing' && (
                                        <button 
                                            className={cx('ship-btn')}
                                            onClick={() => onUpdateStatus(order.id, 'shipped')}
                                        >
                                            Giao Hàng
                                        </button>
                                    )}
                                    
                                    {order.status === 'shipped' && (
                                        <button 
                                            className={cx('deliver-btn')}
                                            onClick={() => onUpdateStatus(order.id, 'delivered')}
                                        >
                                            Xác Nhận Đã Giao
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className={cx('order-info-grid')}>
                        <div className={cx('info-section')}>
                            <h3>Thông Tin Khách Hàng</h3>
                            <div className={cx('info-content')}>
                                <div className={cx('info-row')}>
                                    <span className={cx('info-label')}>Tên khách hàng:</span>
                                    <span className={cx('info-value')}>{order.customer.name}</span>
                                </div>
                                <div className={cx('info-row')}>
                                    <span className={cx('info-label')}>Email:</span>
                                    <span className={cx('info-value')}>{order.customer.email}</span>
                                </div>
                                <div className={cx('info-row')}>
                                    <span className={cx('info-label')}>Số điện thoại:</span>
                                    <span className={cx('info-value')}>{order.customer.phone}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={cx('info-section')}>
                            <h3>Thông Tin Đơn Hàng</h3>
                            <div className={cx('info-content')}>
                                <div className={cx('info-row')}>
                                    <span className={cx('info-label')}>Mã đơn hàng:</span>
                                    <span className={cx('info-value')}>{order.id}</span>
                                </div>
                                <div className={cx('info-row')}>
                                    <span className={cx('info-label')}>Ngày đặt hàng:</span>
                                    <span className={cx('info-value')}>{formatDate(order.orderDate)}</span>
                                </div>
                                <div className={cx('info-row')}>
                                    <span className={cx('info-label')}>Phương thức thanh toán:</span>
                                    <span className={cx('info-value')}>{order.paymentMethod}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={cx('info-section', 'address-section')}>
                            <h3>Địa Chỉ Giao Hàng</h3>
                            <div className={cx('info-content')}>
                                <p className={cx('address')}>{order.shippingAddress}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className={cx('order-items')}>
                        <h3>Sản Phẩm Đặt Mua</h3>
                        <div className={cx('items-table-container')}>
                            <table className={cx('items-table')}>
                                <thead>
                                    <tr>
                                        <th>Sản Phẩm</th>
                                        <th>Biến Thể</th>
                                        <th>Đơn Giá</th>
                                        <th>Số Lượng</th>
                                        <th>Thành Tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className={cx('product-name')}>{item.name}</td>
                                            <td>{item.variation}</td>
                                            <td>{formatPrice(item.price)}</td>
                                            <td className={cx('quantity')}>{item.quantity}</td>
                                            <td className={cx('subtotal')}>{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className={cx('order-summary')}>
                        <div className={cx('summary-row')}>
                            <span>Tổng tiền sản phẩm:</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                        <div className={cx('summary-row')}>
                            <span>Phí vận chuyển:</span>
                            <span>{formatPrice(0)}</span>
                        </div>
                        <div className={cx('summary-row', 'total')}>
                            <span>Tổng thanh toán:</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>
                
                <div className={cx('modal-footer')}>
                    <button className={cx('close-button')} onClick={onClose}>Đóng</button>
                    {order.status === 'pending' && (
                        <button 
                            className={cx('process-btn-alt')}
                            onClick={() => {
                                onUpdateStatus(order.id, 'processing');
                                onClose();
                            }}
                        >
                            Xác Nhận Đơn Hàng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;
