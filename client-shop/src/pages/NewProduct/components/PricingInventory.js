import React from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';

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
        : formData.product_quantity;

    // Update product quantity when SKUs change
    React.useEffect(() => {
        if (hasValidVariations) {
            // Update the product_quantity field with the total from SKUs
            handleNumberChange({
                target: {
                    name: 'product_quantity',
                    value: totalSkuQuantity
                }
            });
        }
    }, [formData.sku_list, hasValidVariations]);

    return (
        <div className={cx('form-section')}>
            <h2>Pricing & Inventory</h2>
            <p className={cx('section-description')}>
                {hasValidVariations
                    ? 'When variations are defined, price and stock are managed through SKUs.'
                    : "Set your product's price and stock quantity."}
            </p>

            <div className={cx('form-row')}>
                {!hasValidVariations && (
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
                )}

                <div className={cx('form-group', hasValidVariations ? 'full' : 'half')}>
                    <label htmlFor="product_quantity">
                        Quantity
                        {hasValidVariations && (
                            <span className={cx('quantity-note')}> (Total from SKUs)</span>
                        )}
                    </label>
                    <input
                        type="number"
                        min="0"
                        id="product_quantity"
                        name="product_quantity"
                        value={hasValidVariations ? totalSkuQuantity : formData.product_quantity}
                        onChange={!hasValidVariations ? handleNumberChange : undefined}
                        placeholder="0"
                        disabled={hasValidVariations}
                        className={cx({ 'disabled-input': hasValidVariations })}
                    />
                    {hasValidVariations && (
                        <div className={cx('help-text')}>
                            This value is automatically calculated as the sum of all SKU quantities
                            and cannot be edited directly.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PricingInventory;
