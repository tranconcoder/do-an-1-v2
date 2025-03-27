import classNames from 'classnames/bind';
import styles from '../Register.module.scss';

const cx = classNames.bind(styles);

function OwnerInfoSection({ formData, handleChange, errors, renderErrorMessage, hasError }) {
    return (
        <div className={cx('section')}>
            <h2>Shop Owner Information</h2>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_fullName">Full Name *</label>
                <input
                    type="text"
                    id="shop_owner_fullName"
                    name="shop_owner_fullName"
                    value={formData.shop_owner_fullName}
                    onChange={handleChange}
                    className={cx('form-control', {
                        'is-invalid': hasError('shop_owner_fullName')
                    })}
                    placeholder="Enter owner's full name"
                />
                {renderErrorMessage('shop_owner_fullName')}
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_email">Email *</label>
                <input
                    type="email"
                    id="shop_owner_email"
                    name="shop_owner_email"
                    value={formData.shop_owner_email}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_owner_email') })}
                    placeholder="Enter owner's email"
                />
                {renderErrorMessage('shop_owner_email')}
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_phoneNumber">Phone Number *</label>
                <input
                    type="text"
                    id="shop_owner_phoneNumber"
                    name="shop_owner_phoneNumber"
                    value={formData.shop_owner_phoneNumber}
                    onChange={handleChange}
                    className={cx('form-control', {
                        'is-invalid': hasError('shop_owner_phoneNumber')
                    })}
                    placeholder="Enter owner's phone number"
                />
                {renderErrorMessage('shop_owner_phoneNumber')}
            </div>
            <div className={cx('form-group')}>
                <label htmlFor="shop_owner_cardID">ID Card Number *</label>
                <input
                    type="text"
                    id="shop_owner_cardID"
                    name="shop_owner_cardID"
                    value={formData.shop_owner_cardID}
                    onChange={handleChange}
                    className={cx('form-control', { 'is-invalid': hasError('shop_owner_cardID') })}
                    placeholder="Enter owner's ID card number"
                />
                {renderErrorMessage('shop_owner_cardID')}
            </div>
        </div>
    );
}

export default OwnerInfoSection;
