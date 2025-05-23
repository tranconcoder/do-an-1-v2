import classNames from 'classnames/bind';
import styles from '../Register.module.scss';

const cx = classNames.bind(styles);

function ShopInfoSection({
    formData,
    handleChange,
    handleLocationChange,
    handleFileChange,
    provinces,
    districts,
    wards,
    errors,
    renderErrorMessage,
    hasError
}) {
    return (
        <div className={cx('section')}>
            <h2>Shop Information</h2>

            {/* Shop Name */}
            <div className={cx('form-group')}>
                <label htmlFor="shop_name">Shop Name *</label>
                <input
                    type="text"
                    id="shop_name"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_name') })}
                    placeholder="Enter shop name"
                />
                {renderErrorMessage('shop_name')}
            </div>

            {/* Shop Email */}
            <div className={cx('form-group')}>
                <label htmlFor="shop_email">Shop Email *</label>
                <input
                    type="email"
                    id="shop_email"
                    name="shop_email"
                    value={formData.shop_email}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_email') })}
                    placeholder="Enter shop email"
                />
                {renderErrorMessage('shop_email')}
            </div>

            {/* Shop Type */}
            <div className={cx('form-group')}>
                <label htmlFor="shop_type">Shop Type *</label>
                <select
                    id="shop_type"
                    name="shop_type"
                    value={formData.shop_type}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_type') })}
                >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="ENTERPRISE">Enterprise</option>
                </select>
                {renderErrorMessage('shop_type')}
            </div>

            {/* Shop Logo */}
            <div className={cx('form-group')}>
                <label htmlFor="shop_logo">Shop Logo *</label>
                <input
                    type="file"
                    id="shop_logo"
                    name="shop_logo"
                    onChange={handleFileChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_logo') })}
                    accept="image/*"
                />
                {renderErrorMessage('shop_logo')}
            </div>

            {/* Business Certificate */}
            <div className={cx('form-group')}>
                <label htmlFor="shop_certificate">Business Certificate *</label>
                <input
                    type="text"
                    id="shop_certificate"
                    name="shop_certificate"
                    value={formData.shop_certificate}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_certificate') })}
                    placeholder="Enter business certificate number"
                />
                {renderErrorMessage('shop_certificate')}
            </div>

            {/* Shop Phone Number */}
            <div className={cx('form-group')}>
                <label htmlFor="shop_phoneNumber">Shop Phone Number *</label>
                <input
                    type="text"
                    id="shop_phoneNumber"
                    name="shop_phoneNumber"
                    value={formData.shop_phoneNumber}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_phoneNumber') })}
                    placeholder="Enter shop phone number"
                />
                {renderErrorMessage('shop_phoneNumber')}
            </div>

            {/* Shop Description */}
            <div className={cx('form-group')}>
                <label htmlFor="shop_description">Shop Description</label>
                <textarea
                    id="shop_description"
                    name="shop_description"
                    value={formData.shop_description}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_description') })}
                    placeholder="Enter shop description"
                    rows="3"
                />
                {renderErrorMessage('shop_description')}
            </div>

            {/* Shop Location */}
            <div className={cx('location-section')}>
                <h3>Shop Location</h3>

                {/* Province */}
                <div className={cx('form-group')}>
                    <label htmlFor="province">Province *</label>
                    <select
                        id="province"
                        name="province"
                        value={formData.shop_location.province}
                        onChange={handleLocationChange}
                        className={cx('form-control', {
                            'is-invalid': hasError('shop_location.province') || hasError('province')
                        })}
                    >
                        <option value="">Select Province</option>
                        {provinces.map((province) => (
                            <option key={province._id} value={province._id}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                    {renderErrorMessage('shop_location.province') || renderErrorMessage('province')}
                </div>

                {/* District */}
                <div className={cx('form-group')}>
                    <label htmlFor="district">District *</label>
                    <select
                        id="district"
                        name="district"
                        value={formData.shop_location.district}
                        onChange={handleLocationChange}
                        className={cx('form-control', {
                            'is-invalid': hasError('shop_location.district') || hasError('district')
                        })}
                        disabled={!formData.shop_location.province}
                    >
                        <option value="">Select District</option>
                        {districts.map((district) => (
                            <option key={district._id} value={district._id}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                    {renderErrorMessage('shop_location.district') || renderErrorMessage('district')}
                </div>

                {/* Ward */}
                <div className={cx('form-group')}>
                    <label htmlFor="ward">Ward *</label>
                    <select
                        id="ward"
                        name="ward"
                        value={formData.shop_location.ward}
                        onChange={handleLocationChange}
                        className={cx('form-control', {
                            'is-invalid': hasError('shop_location.ward') || hasError('ward')
                        })}
                        disabled={!formData.shop_location.district}
                    >
                        <option value="">Select Ward</option>
                        {wards.map((ward) => (
                            <option key={ward._id} value={ward._id}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                    {renderErrorMessage('shop_location.ward') || renderErrorMessage('ward')}
                </div>

                {/* Address */}
                <div className={cx('form-group')}>
                    <label htmlFor="address">Street Address *</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.shop_location.address}
                        onChange={handleLocationChange}
                        className={cx('form-control', {
                            'is-invalid': hasError('shop_location.address') || hasError('address')
                        })}
                        placeholder="Enter street address"
                    />
                    {renderErrorMessage('shop_location.address') || renderErrorMessage('address')}
                </div>
            </div>
        </div>
    );
}

export default ShopInfoSection;
