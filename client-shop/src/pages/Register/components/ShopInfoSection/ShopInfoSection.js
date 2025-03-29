import React from 'react';
import classNames from 'classnames/bind';
import styles from './ShopInfoSection.module.scss';

const cx = classNames.bind(styles);

const ShopInfoSection = ({
    formData,
    handleChange,
    handleLocationChange,
    handleFileChange,
    provinces,
    districts,
    wards,
    errors,
    renderErrorMessage,
    hasError,
    logoPreview
}) => {
    return (
        <div className={cx('form-section')}>
            <h2>Thông Tin Cửa Hàng</h2>
            <div className={cx('form-group')}>
                <label htmlFor="shop_name">Tên Cửa Hàng *</label>
                <input
                    type="text"
                    id="shop_name"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleChange}
                    className={errors.shop_name ? cx('has-error') : ''}
                />
                {errors.shop_name && <div className={cx('error-text')}>{errors.shop_name}</div>}
            </div>

            {/* Add location dropdowns */}
            <div className={cx('form-group')}>
                <label htmlFor="province">Tỉnh/Thành Phố *</label>
                <select
                    id="province"
                    name="province"
                    value={formData.shop_location.province}
                    onChange={handleLocationChange}
                    className={errors['shop_location.province'] ? cx('has-error') : ''}
                >
                    <option value="">Chọn Tỉnh/Thành Phố</option>
                    {provinces.map((province) => (
                        <option key={province._id} value={province._id}>
                            {province.province_name}
                        </option>
                    ))}
                </select>
                {errors['shop_location.province'] && (
                    <div className={cx('error-text')}>{errors['shop_location.province']}</div>
                )}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="district">Quận/Huyện *</label>
                <select
                    id="district"
                    name="district"
                    value={formData.shop_location.district}
                    onChange={handleLocationChange}
                    disabled={!formData.shop_location.province}
                    className={errors['shop_location.district'] ? cx('has-error') : ''}
                >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                        <option key={district._id} value={district._id}>
                            {district.district_name}
                        </option>
                    ))}
                </select>
                {errors['shop_location.district'] && (
                    <div className={cx('error-text')}>{errors['shop_location.district']}</div>
                )}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="ward">Phường/Xã *</label>
                <select
                    id="ward"
                    name="ward"
                    value={formData.shop_location.ward}
                    onChange={handleLocationChange}
                    disabled={!formData.shop_location.district}
                    className={errors['shop_location.ward'] ? cx('has-error') : ''}
                >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                        <option key={ward._id} value={ward._id}>
                            {ward.ward_name}
                        </option>
                    ))}
                </select>
                {errors['shop_location.ward'] && (
                    <div className={cx('error-text')}>{errors['shop_location.ward']}</div>
                )}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="address">Địa Chỉ Chi Tiết *</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.shop_location.address}
                    onChange={handleLocationChange}
                    className={errors['shop_location.address'] ? cx('has-error') : ''}
                    placeholder="Đường, Số nhà, v.v."
                />
                {errors['shop_location.address'] && (
                    <div className={cx('error-text')}>{errors['shop_location.address']}</div>
                )}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="shop_email">Email Cửa Hàng *</label>
                <input
                    type="email"
                    id="shop_email"
                    name="shop_email"
                    value={formData.shop_email}
                    onChange={handleChange}
                    className={hasError('shop_email') ? cx('has-error') : ''}
                    placeholder="Email liên hệ của cửa hàng"
                />
                {renderErrorMessage('shop_email')}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="shop_type">Loại Cửa Hàng *</label>
                <select
                    id="shop_type"
                    name="shop_type"
                    value={formData.shop_type}
                    onChange={handleChange}
                    className={errors.shop_type ? cx('has-error') : ''}
                >
                    <option value="INDIVIDUAL">Doanh Nghiệp Cá Nhân</option>
                    <option value="COMPANY">Công Ty/Doanh Nghiệp</option>
                    <option value="PARTNERSHIP">Hợp Tác Xã</option>
                </select>
                {errors.shop_type && <div className={cx('error-text')}>{errors.shop_type}</div>}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="shop_logo">Logo Cửa Hàng *</label>
                <div className={cx('logo-input-container')}>
                    <div style={{ width: '100%' }}>
                        <input
                            type="file"
                            id="shop_logo"
                            name="shop_logo"
                            onChange={handleFileChange}
                            className={errors.shop_logo ? cx('has-error') : ''}
                            accept="image/*"
                        />
                        <small>Kích thước khuyến nghị: Hình vuông (tỷ lệ 1:1)</small>
                    </div>
                    {logoPreview && (
                        <div className={cx('logo-preview-container')}>
                            <img
                                src={logoPreview}
                                alt="Xem trước logo"
                                className={cx('logo-preview')}
                            />
                        </div>
                    )}
                </div>
                {errors.shop_logo && <div className={cx('error-text')}>{errors.shop_logo}</div>}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="shop_certificate">Mã Số Giấy Phép Kinh Doanh *</label>
                <input
                    type="text"
                    id="shop_certificate"
                    name="shop_certificate"
                    value={formData.shop_certificate}
                    onChange={handleChange}
                    className={hasError('shop_certificate') ? cx('has-error') : ''}
                    placeholder="Nhập mã số giấy phép kinh doanh"
                />
                {renderErrorMessage('shop_certificate')}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="shop_phoneNumber">Số Điện Thoại Cửa Hàng *</label>
                <input
                    type="tel"
                    id="shop_phoneNumber"
                    name="shop_phoneNumber"
                    value={formData.shop_phoneNumber}
                    onChange={handleChange}
                    className={errors.shop_phoneNumber ? cx('has-error') : ''}
                />
                {errors.shop_phoneNumber && (
                    <div className={cx('error-text')}>{errors.shop_phoneNumber}</div>
                )}
            </div>

            <div className={cx('form-group')}>
                <label htmlFor="shop_description">Mô Tả Cửa Hàng</label>
                <textarea
                    id="shop_description"
                    name="shop_description"
                    value={formData.shop_description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Mô tả ngắn gọn về cửa hàng của bạn"
                />
            </div>
        </div>
    );
};

export default ShopInfoSection;
