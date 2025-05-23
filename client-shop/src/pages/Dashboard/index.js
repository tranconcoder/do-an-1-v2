import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';
import { selectCurrentUser } from '../../store/userSlice';
import { selectShopInfo } from '../../store/slices/shopSlice';
import { getMediaUrl, getTextPlaceholder } from '../../utils/media';

const cx = classNames.bind(styles);

function Dashboard() {
    const user = useSelector(selectCurrentUser);
    const shop = useSelector(selectShopInfo);
    console.log({ shopInfo: shop, currentUser: user });

    // Get logo URL using the media utility
    const logoUrl = getMediaUrl(shop?.shop_logo);

    // Get text-based placeholder if no logo is available
    const placeholder = getTextPlaceholder(shop?.shop_name, 80);

    // Hàm chuyển đổi trạng thái shop sang tiếng Việt
    const getVietnameseStatus = (status) => {
        const statusMap = {
            active: 'HOẠT ĐỘNG',
            pending: 'CHỜ DUYỆT',
            rejected: 'BỊ TỪ CHỐI',
            suspended: 'TẠM NGƯNG'
        };
        return statusMap[status] || status.toUpperCase();
    };

    // Default stats if no data is available
    const stats = [
        {
            label: 'Trạng Thái Cửa Hàng',
            value: shop?.shop_status ? getVietnameseStatus(shop.shop_status) : 'N/A',
            icon: '🏪',
            color:
                shop?.shop_status === 'active'
                    ? '#2ecc71'
                    : shop?.shop_status === 'pending'
                    ? '#f39c12'
                    : shop?.shop_status === 'rejected'
                    ? '#e74c3c'
                    : '#3498db'
        },
        { label: 'Tổng Sản Phẩm', value: 0, icon: '📦', color: '#3498db' },
        { label: 'Tổng Đơn Hàng', value: 0, icon: '📋', color: '#2ecc71' },
        { label: 'Doanh Thu', value: '0₫', icon: '💰', color: '#9b59b6' }
    ];

    // Sample data for demonstration - would be replaced with API data in production
    const recentOrders = [];

    return (
        <div className={cx('dashboard')}>
            <h1>Xin chào, {user?.user_fullName || 'Chủ Cửa Hàng'}</h1>

            {shop?.shop_status === 'pending' && (
                <div className={cx('shop-status-alert', 'pending')}>
                    Cửa hàng của bạn đang được xem xét. Bạn sẽ có thể bán sản phẩm sau khi được phê
                    duyệt.
                </div>
            )}

            {shop?.shop_status === 'rejected' && (
                <div className={cx('shop-status-alert', 'rejected')}>
                    Đăng ký cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ bộ phận hỗ trợ để biết
                    thêm thông tin.
                </div>
            )}

            <div className={cx('shop-profile-card')}>
                <div className={cx('shop-profile-header')}>
                    <div className={cx('shop-logo')}>
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={shop.shop_name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    // Use text placeholder instead of external image
                                    const parent = e.target.parentNode;
                                    const div = document.createElement('div');
                                    div.className = cx('shop-logo-placeholder');
                                    div.style.backgroundColor = placeholder.backgroundColor;
                                    div.style.color = placeholder.color;
                                    div.textContent = placeholder.text;
                                    parent.replaceChild(div, e.target);
                                }}
                            />
                        ) : (
                            <div
                                className={cx('shop-logo-placeholder')}
                                style={{
                                    backgroundColor: placeholder.backgroundColor,
                                    color: placeholder.color
                                }}
                            >
                                {placeholder.text}
                            </div>
                        )}
                    </div>
                    <div className={cx('shop-info')}>
                        <h2>{shop?.shop_name || 'Cửa Hàng Của Tôi'}</h2>
                        <div className={cx('shop-details')}>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Email:</span>
                                <span>{shop?.shop_email || 'N/A'}</span>
                            </div>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Điện thoại:</span>
                                <span>{shop?.shop_phoneNumber || 'N/A'}</span>
                            </div>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Loại:</span>
                                <span>
                                    {shop?.shop_type === 'INDIVIDUAL'
                                        ? 'Cá nhân'
                                        : shop?.shop_type === 'ENTERPRISE'
                                        ? 'Doanh nghiệp'
                                        : shop?.shop_type || 'N/A'}
                                </span>
                            </div>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Ngày tạo:</span>
                                <span>
                                    {shop?.created_at
                                        ? new Date(shop.created_at).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {shop?.shop_description && (
                    <div className={cx('shop-description')}>
                        <h3>Thông Tin Cửa Hàng</h3>
                        <p>{shop.shop_description}</p>
                    </div>
                )}
            </div>

            <div className={cx('stats-grid')}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={cx('stat-card')}
                        style={{ borderColor: stat.color }}
                    >
                        <div className={cx('stat-icon')} style={{ backgroundColor: stat.color }}>
                            <span>{stat.icon}</span>
                        </div>
                        <div className={cx('stat-details')}>
                            <div className={cx('stat-value')}>{stat.value}</div>
                            <div className={cx('stat-label')}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('dashboard-row')}>
                <div className={cx('dashboard-column')}>
                    <div className={cx('dashboard-card')}>
                        <h2>Đơn Hàng Gần Đây</h2>
                        {recentOrders.length > 0 ? (
                            <>
                                <table className={cx('orders-table')}>
                                    <thead>
                                        <tr>
                                            <th>Mã Đơn</th>
                                            <th>Khách Hàng</th>
                                            <th>Ngày</th>
                                            <th>Trạng Thái</th>
                                            <th>Tổng Tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{order.customer}</td>
                                                <td>{order.date}</td>
                                                <td>
                                                    <span
                                                        className={cx(
                                                            'status',
                                                            order.status.toLowerCase()
                                                        )}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{order.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={cx('view-all')}>
                                    <Link to="/orders">Xem Tất Cả Đơn Hàng</Link>
                                </div>
                            </>
                        ) : (
                            <div className={cx('empty-state')}>
                                <div className={cx('empty-icon')}>📋</div>
                                <p>Chưa có đơn hàng nào</p>
                                {shop?.shop_status === 'active' && (
                                    <p className={cx('empty-message')}>
                                        Đơn hàng sẽ xuất hiện tại đây khi khách hàng đặt hàng
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className={cx('dashboard-column')}>
                    <div className={cx('dashboard-card')}>
                        <h2>Thao Tác Nhanh</h2>
                        <div className={cx('action-buttons')}>
                            <Link
                                to="/products/new"
                                className={cx('action-btn', 'create-product', {
                                    disabled: shop?.shop_status !== 'active'
                                })}
                            >
                                Thêm Sản Phẩm Mới
                            </Link>
                            <Link
                                to="/discount"
                                className={cx('action-btn', 'create-discount', {
                                    disabled: shop?.shop_status !== 'active'
                                })}
                            >
                                Tạo Khuyến Mãi
                            </Link>
                            <Link to="/settings" className={cx('action-btn', 'settings')}>
                                Cài Đặt Cửa Hàng
                            </Link>
                        </div>
                    </div>
                    {shop?.shop_warehouses && shop.shop_warehouses.length > 0 && (
                        <div className={cx('dashboard-card')}>
                            <h2>Kho Hàng</h2>
                            <div className={cx('warehouse-list')}>
                                {shop.shop_warehouses.map((warehouse, index) => (
                                    <div key={index} className={cx('warehouse-item')}>
                                        <div className={cx('warehouse-name')}>
                                            <span className={cx('warehouse-icon')}>🏭</span>
                                            {warehouse.name}
                                        </div>
                                        <div className={cx('warehouse-contact')}>
                                            Điện thoại: {warehouse.phoneNumber}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
