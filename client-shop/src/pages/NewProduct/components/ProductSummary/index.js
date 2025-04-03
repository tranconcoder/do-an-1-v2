import React from 'react';
import classNames from 'classnames/bind';
import styles from './ProductSummary.module.scss';

const cx = classNames.bind(styles);

function ProductSummary({ formData }) {
    return (
        <div className={cx('form-section', 'product-summary')}>
            <h2>Product Summary</h2>
            <div className={cx('summary-item')}>
                <span className={cx('summary-label')}>Name:</span>
                <span className={cx('summary-value')}>
                    {formData.product_name || '(Not specified)'}
                </span>
            </div>
            <div className={cx('summary-item')}>
                <span className={cx('summary-label')}>Category:</span>
                <span className={cx('summary-value')}>
                    {formData.product_category || '(Not selected)'}
                </span>
            </div>
            <div className={cx('summary-item')}>
                <span className={cx('summary-label')}>Quantity:</span>
                <span className={cx('summary-value')}>
                    {formData.sku_list.reduce(
                        (sum, sku) => sum + (parseInt(sku.sku_stock) || 0),
                        0
                    )}
                </span>
            </div>
            <div className={cx('summary-item')}>
                <span className={cx('summary-label')}>Attributes:</span>
                <div className={cx('summary-value')}>
                    {formData.product_attributes.length > 0 ? (
                        <ul className={cx('attributes-list')}>
                            {formData.product_attributes.map((attr, index) => (
                                <li key={index}>
                                    {attr.key}: {attr.value}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        '(No attributes added)'
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductSummary;
