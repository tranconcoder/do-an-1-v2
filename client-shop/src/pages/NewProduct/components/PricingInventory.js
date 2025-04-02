import React from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';

const cx = classNames.bind(styles);

function PricingInventory({ formData, handleInputChange, handleNumberChange }) {
    // Check if SKUs are defined
    const hasSKUs = formData.skus && formData.skus.length > 0;

    // Calculate total quantity from SKUs if available
    const totalSKUQuantity = hasSKUs
        ? formData.skus.reduce((sum, sku) => sum + (parseInt(sku.stock) || 0), 0)
        : 0;

    return (
        <div className={cx('form-section')}>
            <h2>Pricing & Inventory</h2>
            <p className={cx('section-description')}>
                Set your product's price and manage inventory levels.
            </p>

            <div className={cx('form-row')}>
                <div className={cx('form-group', 'half')}>
                    <label htmlFor="product_cost">Price</label>
                    <div className={cx('price-input')}>
                        <span className={cx('currency')}>$</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            id="product_cost"
                            name="product_cost"
                            value={formData.product_cost}
                            onChange={handleInputChange}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className={cx('form-group', 'half')}>
                    <label htmlFor="product_quantity">
                        Quantity
                        {hasSKUs && (
                            <span className={cx('quantity-note')}> (calculated from SKUs)</span>
                        )}
                    </label>
                    <input
                        type="number"
                        min="0"
                        id="product_quantity"
                        name="product_quantity"
                        value={hasSKUs ? totalSKUQuantity : formData.product_quantity}
                        onChange={handleNumberChange}
                        placeholder="0"
                        disabled={hasSKUs}
                        className={cx({ 'disabled-input': hasSKUs })}
                    />
                    {hasSKUs && (
                        <div className={cx('help-text')}>
                            This value is the sum of all SKU quantities. To change it, update
                            individual SKU stock levels.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PricingInventory;
