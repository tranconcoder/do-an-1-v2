import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PendingApprovalScreen.module.scss';

const cx = classNames.bind(styles);

const PendingApprovalScreen = ({ shop }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className={cx('pending-container')}>
            <div className={cx('pending-card')}>
                <div className={cx('pending-icon')}>🕒</div>
                <h1 className={cx('pending-title')}>Cửa Hàng Đang Chờ Phê Duyệt</h1>

                <div className={cx('shop-details')}>
                    <h2>{shop?.shop_name || 'Cửa Hàng Của Bạn'}</h2>
                    <div className={cx('status-badge')}>Đang Chờ Duyệt</div>
                </div>

                <div className={cx('pending-message')}>
                    <p>
                        Đăng ký cửa hàng của bạn hiện đang được đội ngũ quản trị viên xem xét. Bạn
                        sẽ có thể truy cập vào bảng điều khiển sau khi cửa hàng được phê duyệt.
                    </p>
                    <p>Quá trình này thường mất 1-2 ngày làm việc.</p>
                </div>

                <div className={cx('pending-info')}>
                    <div className={cx('info-item')}>
                        <span className={cx('info-label')}>Email Liên Hệ:</span>
                        <span>{shop?.shop_email || 'N/A'}</span>
                    </div>
                    <div className={cx('info-item')}>
                        <span className={cx('info-label')}>Ngày Đăng Ký:</span>
                        <span>
                            {shop?.createdAt
                                ? new Date(shop.createdAt).toLocaleDateString()
                                : 'Gần đây'}
                        </span>
                    </div>
                </div>

                <div className={cx('pending-instructions')}>
                    <h3>Điều gì sẽ xảy ra tiếp theo?</h3>
                    <ul>
                        <li>
                            Đội ngũ của chúng tôi sẽ xem xét đơn đăng ký và xác minh thông tin kinh
                            doanh của bạn
                        </li>
                        <li>Bạn sẽ nhận được thông báo qua email khi cửa hàng được phê duyệt</li>
                        <li>Sau đó bạn có thể đăng nhập và bắt đầu thiết lập cửa hàng của mình</li>
                    </ul>
                </div>

                <div className={cx('pending-actions')}>
                    <button className={cx('logout-btn')} onClick={handleLogout}>
                        Đăng Xuất
                    </button>
                </div>

                <div className={cx('pending-contact')}>
                    <p>
                        Cần trợ giúp? Liên hệ với đội hỗ trợ của chúng tôi tại{' '}
                        <a href="mailto:support@example.com">support@example.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovalScreen;
