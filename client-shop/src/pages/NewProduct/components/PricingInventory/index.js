import React from 'react';
import classNames from 'classnames/bind';
import styles from './PricingInventory.module.scss';

const cx = classNames.bind(styles);

function PricingInventory({ formData, handleInputChange, handleNumberChange }) {
    // Check if there are valid variations with options defined
    const hasValidVariations = formData.product_variations?.some(
        (v) =>
            v.name &&
            v.options &&
            v.options.length > 0 &&
            v.options.some((opt) => opt.trim() !== '')
    );

    // Calculate total quantity from SKUs if available
    const totalSkuQuantity = hasValidVariations
        ? formData.sku_list.reduce((sum, sku) => sum + (parseInt(sku.sku_stock) || 0), 0)
        : 0;

    return (
        <div className={cx('form-section')}>
            <h2>Inventory</h2>
            <p className={cx('section-description')}>
                {hasValidVariations
                    ? 'When variations are defined, stock is managed through SKUs.'
                    : 'Stock quantity will be managed through SKUs.'}
            </p>
            <div className={cx('form-row')}>
                <div className={cx('form-group', 'full')}>
                    <label htmlFor="product_quantity">
                        Total Quantity
                        <span className={cx('quantity-note')}> (Calculated from SKUs)</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        id="product_quantity"
                        name="product_quantity"
                        value={totalSkuQuantity}
                        disabled={true}
                        className={cx('disabled-input')}
                    />
                    <div className={cx('help-text')}>
                        This value is automatically calculated as the sum of all SKU quantities.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PricingInventory;
