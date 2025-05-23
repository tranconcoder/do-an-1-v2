import React from 'react';
import classNames from 'classnames/bind';
import styles from './AuthSection.module.scss';

const cx = classNames.bind(styles);

const AuthSection = ({ formData, handleChange, errors, renderErrorMessage, hasError }) => {
    return (
        <div className={cx('form-section')}>
            <h2>Thông Tin Xác Thực</h2>
            <div className={cx('form-group')}>
                <label htmlFor="phoneNumber">Số Điện Thoại *</label>
                <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={hasError('phoneNumber') ? cx('has-error') : ''}
                    placeholder="Nhập số điện thoại của bạn"
                />
                {renderErrorMessage('phoneNumber')}
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="password">Mật Khẩu *</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={hasError('password') ? cx('has-error') : ''}
                    placeholder="Nhập mật khẩu của bạn"
                />
                {renderErrorMessage('password')}
                <small className={cx('form-text')}>Mật khẩu phải có ít nhất 8 ký tự.</small>
            </div>
            <div className={cx('auth-note')}>
                Bạn sẽ sử dụng số điện thoại và mật khẩu này để đăng nhập vào bảng điều khiển cửa
                hàng.
            </div>
        </div>
    );
};

export default AuthSection;
