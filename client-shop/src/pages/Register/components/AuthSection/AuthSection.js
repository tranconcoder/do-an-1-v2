import React from 'react';
import classNames from 'classnames/bind';
import styles from './AuthSection.module.scss';

const cx = classNames.bind(styles);

const AuthSection = ({ formData, handleChange, errors, renderErrorMessage, hasError }) => {
    return (
        <div className={cx('form-section')}>
            <h2>Authentication</h2>
            <div className={cx('form-group')}>
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={hasError('phoneNumber') ? cx('has-error') : ''}
                    placeholder="Enter your phone number"
                />
                {renderErrorMessage('phoneNumber')}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="password">Password *</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={hasError('password') ? cx('has-error') : ''}
                    placeholder="Enter your password"
                />
                {renderErrorMessage('password')}
                <small className={cx('form-text')}>
                    Password must be at least 8 characters long.
                </small>
            </div>

            <div className={cx('auth-note')}>
                You will use your phone number and password to log in to your shop dashboard.
            </div>
        </div>
    );
};

export default AuthSection;
