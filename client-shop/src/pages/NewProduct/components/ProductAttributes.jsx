import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';
import axios from 'axios';
import { API_URL } from '../../../configs/env.config';

const cx = classNames.bind(styles);

function ProductAttributes({ formData, handleAttributeChange }) {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Only fetch attributes if a category is selected
        if (!formData.product_category) {
            setAttributes([]);
            return;
        }

        const fetchAttributes = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch attributes based on the selected category
                const response = await axios.get(
                    `${API_URL}/attribute/category/${formData.product_category}`
                );

                if (response.data && response.data.metadata) {
                    setAttributes(response.data.metadata);
                }
            } catch (error) {
                console.error('Error fetching attributes:', error);
                setError('Failed to load attributes. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttributes();
    }, [formData.product_category]);

    if (loading) {
        return (
            <div className={cx('form-section')}>
                <h2>Product Attributes</h2>
                <div className={cx('loading-message')}>Loading attributes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('form-section')}>
                <h2>Product Attributes</h2>
                <div className={cx('error-message')}>{error}</div>
            </div>
        );
    }

    if (!formData.product_category) {
        return (
            <div className={cx('form-section')}>
                <h2>Product Attributes</h2>
                <div className={cx('info-message')}>
                    Please select a category to view applicable attributes.
                </div>
            </div>
        );
    }

    if (attributes.length === 0 && !loading) {
        return (
            <div className={cx('form-section')}>
                <h2>Product Attributes</h2>
                <div className={cx('info-message')}>No attributes found for this category.</div>
            </div>
        );
    }

    return (
        <div className={cx('form-section')}>
            <h2>Product Attributes</h2>
            <div className={cx('section-description')}>
                Add specific details about your product based on its category
            </div>

            <div className={cx('attributes-container')}>
                {attributes.map((attribute) => (
                    <div key={attribute._id} className={cx('form-group')}>
                        <label>
                            {attribute.attribute_name}
                            {attribute.is_required && (
                                <span className={cx('required-mark')}>*</span>
                            )}
                        </label>
                        <input
                            type="text"
                            name={attribute._id}
                            value={formData.product_attributes[attribute._id] || ''}
                            onChange={handleAttributeChange}
                            required={attribute.is_required}
                            placeholder={`Enter ${attribute.attribute_name.toLowerCase()}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductAttributes;
