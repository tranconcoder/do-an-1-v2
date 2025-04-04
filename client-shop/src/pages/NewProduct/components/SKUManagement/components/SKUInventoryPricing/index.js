import React from 'react';
import classNames from 'classnames/bind';
import styles from './SKUInventoryPricing.module.scss';

const cx = classNames.bind(styles);

function SKUInventoryPricing({
    sku,
    skuIndex,
    warehouses,
    warehousesLoading,
    warehouseErrors,
    onWarehouseChange,
    onSkuNumberChange
}) {
    return (
        <div className={cx('sku-inventory-pricing')}>
            <h3>Kho và Giá</h3>
            <div className={cx('sku-fields')}>
                <div className={cx('sku-field')}>
                    <label>Warehouse</label>
                    <select
                        value={sku.warehouse || ''}
                        onChange={(e) => onWarehouseChange(skuIndex, e.target.value)}
                        className={cx('sku-input', {
                            'error-border': warehouseErrors[skuIndex]
                        })}
                        disabled={warehousesLoading}
                    >
                        <option value="">-- Select Warehouse --</option>
                        {warehouses.map((warehouse) => (
                            <option key={warehouse._id} value={warehouse._id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                    {warehouseErrors[skuIndex] && (
                        <div className={cx('error-message')}>
                            {warehouseErrors[skuIndex]}
                        </div>
                    )}
                </div>
                <div className={cx('sku-field')}>
                    <label>Stock</label>
                    <input
                        type="number"
                        min="0"
                        value={sku.sku_stock}
                        onChange={(e) =>
                            onSkuNumberChange(skuIndex, 'sku_stock', e.target.value)
                        }
                        className={cx('sku-input')}
                    />
                </div>
                <div className={cx('sku-field')}>
                    <label>Price</label>
                    <div className={cx('price-input')}>
                        <span className={cx('currency')}>$</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={sku.sku_price}
                            onChange={(e) =>
                                onSkuNumberChange(skuIndex, 'sku_price', e.target.value)
                            }
                            className={cx('sku-input')}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SKUInventoryPricing;
