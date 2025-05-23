import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import * as Yup from 'yup';
import styles from './Login.module.scss';
import {
    loginUser,
    selectUserError,
    selectUserLoading,
    selectIsAuthenticated,
    clearError
} from '../../store/userSlice';

const cx = classNames.bind(styles);

// Định nghĩa schema xác thực với Yup
const loginSchema = Yup.object().shape({
    phoneNumber: Yup.string()
        .required('Vui lòng nhập số điện thoại')
        .matches(/^\+?[0-9]{10,15}$/, 'Vui lòng nhập số điện thoại hợp lệ (10-15 số)'),
    password: Yup.string()
        .required('Vui lòng nhập mật khẩu')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    // Kiểm tra xem người dùng có bị chuyển hướng do shop bị từ chối không
    const isRejected = new URLSearchParams(location.search).get('rejected') === 'true';

    // Lấy state từ Redux
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectUserLoading);
    const reduxError = useSelector(selectUserError);

    // State form cục bộ
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Chuyển hướng nếu đã xác thực
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setPhoneNumber(value);

        // Xóa lỗi khi người dùng đang nhập
        if (validationErrors.phoneNumber) {
            const newErrors = { ...validationErrors };
            delete newErrors.phoneNumber;
            setValidationErrors(newErrors);
        }

        // Xóa lỗi Redux khi người dùng bắt đầu nhập
        if (reduxError) {
            dispatch(clearError());
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        // Xóa lỗi khi người dùng đang nhập
        if (validationErrors.password) {
            const newErrors = { ...validationErrors };
            delete newErrors.password;
            setValidationErrors(newErrors);
        }

        // Xóa lỗi Redux khi người dùng bắt đầu nhập
        if (reduxError) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Xác thực client-side
            await loginSchema.validate({ phoneNumber, password }, { abortEarly: false });

            // Gửi action đăng nhập
            dispatch(loginUser({ phoneNumber, password }));
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                // Xử lý lỗi xác thực Yup
                const errors = {};
                err.inner.forEach((error) => {
                    errors[error.path] = error.message;
                });
                setValidationErrors(errors);
            }
        }
    };

    // Xác định thông báo lỗi để hiển thị
    const getErrorMessage = () => {
        if (isRejected) {
            return 'Đăng ký cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ hỗ trợ để biết thêm thông tin.';
        }
        if (reduxError) {
            console.log(reduxError);
            return reduxError.message || 'Số điện thoại hoặc mật khẩu không hợp lệ';
        }
        return null;
    };

    // Xác định loại/class của thông báo lỗi
    const getErrorClass = () => {
        return isRejected ? cx('error-message', 'rejected-message') : cx('error-message');
    };

    return (
        <div className={cx('login-container')}>
            <div className={cx('login-card')}>
                <div className={cx('login-header')}>
                    <div className={cx('logo')}>🛒</div>
                    <h1>Quản Lý Cửa Hàng</h1>
                    <p className={cx('subtitle')}>Đăng nhập vào bảng điều khiển cửa hàng của bạn</p>
                </div>

                {getErrorMessage() && <div className={getErrorClass()}>{getErrorMessage()}</div>}

                <form className={cx('login-form')} onSubmit={handleSubmit}>
                    <div className={cx('form-group')}>
                        <label htmlFor="phoneNumber">Số Điện Thoại</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="Nhập số điện thoại của bạn (vd: 0987654321)"
                            className={validationErrors.phoneNumber ? cx('input-error') : ''}
                        />
                        {validationErrors.phoneNumber && (
                            <div className={cx('field-error')}>{validationErrors.phoneNumber}</div>
                        )}
                        <small className={cx('input-hint')}>
                            Định dạng: 10-15 số, có thể thêm tiền tố +
                        </small>
                    </div>

                    <div className={cx('form-group')}>
                        <label htmlFor="password">Mật Khẩu</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Nhập mật khẩu của bạn"
                            className={validationErrors.password ? cx('input-error') : ''}
                        />
                        {validationErrors.password && (
                            <div className={cx('field-error')}>{validationErrors.password}</div>
                        )}
                    </div>

                    <div className={cx('form-options')}>
                        <label className={cx('remember-me')}>
                            <input type="checkbox" /> Ghi nhớ đăng nhập
                        </label>
                        <a href="#forgot-password" className={cx('forgot-password')}>
                            Quên mật khẩu?
                        </a>
                    </div>

                    <button type="submit" className={cx('login-button')} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>
                </form>

                <div className={cx('footer-note')}>
                    <p>Chú ý: Vui lòng nhập số điện thoại đúng định dạng.</p>
                    <p className={cx('register-text')}>
                        Bạn chưa có cửa hàng?{' '}
                        <Link to="/register" className={cx('register-link')}>
                            Tạo cửa hàng tại đây
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
