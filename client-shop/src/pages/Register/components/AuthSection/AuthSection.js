import React from 'react';
import classNames from 'classnames/bind';
import styles from './AuthSection.module.scss';

const cx = classNames.bind(styles);

const AuthSection = ({ formData, handleChange, errors, renderErrorMessage, hasError }) => {
    return (
        <div className={cx('form-section')}>
            <h2>Authentication</h2>
            <div className={cx('form-group')}>
                <label htmlFor="shop_email">Email *</label>
                <input
                    type="email"
                    id="shop_email"
                    name="shop_email"
                    value={formData.shop_email}
                    onChange={handleChange}
                    className={hasError('shop_email') ? cx('has-error') : ''}
                />
                {renderErrorMessage('shop_email')}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="shop_password">Password *</label>
                <input
                    type="password"
                    id="shop_password"
                    name="shop_password"
                    value={formData.shop_password}
                    onChange={handleChange}
                    className={hasError('shop_password') ? cx('has-error') : ''}
                />
                {renderErrorMessage('shop_password')}
            </div>
        </div>
    );
};

export default AuthSection;
