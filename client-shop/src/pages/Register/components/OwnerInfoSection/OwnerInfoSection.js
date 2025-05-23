import React from 'react';
import classNames from 'classnames/bind';
import styles from './OwnerInfoSection.module.scss';

const cx = classNames.bind(styles);

const OwnerInfoSection = ({ formData, handleChange, errors }) => {
    return (
        <div className={cx('form-section')}>
            <h2>Thông Tin Chủ Cửa Hàng</h2>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_fullName">Họ Tên Chủ Cửa Hàng *</label>
                <input
                    type="text"
                    id="shop_owner_fullName"
                    name="shop_owner_fullName"
                    value={formData.shop_owner_fullName}
                    onChange={handleChange}
                    className={errors.shop_owner_fullName ? cx('has-error') : ''}
                />
                {errors.shop_owner_fullName && (
                    <div className={cx('error-text')}>{errors.shop_owner_fullName}</div>
                )}
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_email">Email Chủ Cửa Hàng *</label>
                <input
                    type="email"
                    id="shop_owner_email"
                    name="shop_owner_email"
                    value={formData.shop_owner_email}
                    onChange={handleChange}
                    className={errors.shop_owner_email ? cx('has-error') : ''}
                />
                {errors.shop_owner_email && (
                    <div className={cx('error-text')}>{errors.shop_owner_email}</div>
                )}
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_phoneNumber">Số Điện Thoại Chủ Cửa Hàng *</label>
                <input
                    type="tel"
                    id="shop_owner_phoneNumber"
                    name="shop_owner_phoneNumber"
                    value={formData.shop_owner_phoneNumber}
                    onChange={handleChange}
                    className={errors.shop_owner_phoneNumber ? cx('has-error') : ''}
                />
                {errors.shop_owner_phoneNumber && (
                    <div className={cx('error-text')}>{errors.shop_owner_phoneNumber}</div>
                )}
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_cardID">Số CMND/CCCD Chủ Cửa Hàng *</label>
                <input
                    type="text"
                    id="shop_owner_cardID"
                    name="shop_owner_cardID"
                    value={formData.shop_owner_cardID}
                    onChange={handleChange}
                    className={errors.shop_owner_cardID ? cx('has-error') : ''}
                />
                {errors.shop_owner_cardID && (
                    <div className={cx('error-text')}>{errors.shop_owner_cardID}</div>
                )}
            </div>
        </div>
    );
};

export default OwnerInfoSection;
