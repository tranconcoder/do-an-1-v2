import React from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';

const cx = classNames.bind(styles);

function PricingInventory({ formData, handleInputChange, handleNumberChange }) {
    return (
        <div className={cx('form-section')}>
            <h2>Pricing & Inventory</h2>
            <div className={cx('form-group')}>
                <label>
                    Price <span className={cx('required-mark')}>*</span>
                </label>
                <div className={cx('price-input')}>
                    <span className={cx('currency')}>₫</span>
                    <input
                        type="number"
                        name="product_cost"
                        value={formData.product_cost}
                        onChange={handleNumberChange}
                        min="0"
                        step="1000"
                        required
                        placeholder="Enter product price"
                    />
                </div>
            </div>
            <div className={cx('form-group')}>
                <label>
                    Quantity <span className={cx('required-mark')}>*</span>
                </label>
                <input
                    type="number"
                    name="product_quantity"
                    value={formData.product_quantity}
                    onChange={handleNumberChange}
                    min="1"
                    required
                    placeholder="Enter product quantity"
                />
            </div>
        </div>
    );
}

export default PricingInventory;
