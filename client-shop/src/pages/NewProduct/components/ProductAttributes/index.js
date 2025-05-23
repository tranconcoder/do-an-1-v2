import React from 'react';
import classNames from 'classnames/bind';
import styles from './ProductAttributes.module.scss';

const cx = classNames.bind(styles);

function ProductAttributes({ formData, handleAttributeChange }) {
    const handleAddAttribute = () => {
        const currentAttributes = formData.product_attributes || [];
        handleAttributeChange({
            target: {
                name: 'product_attributes',
                value: [...currentAttributes, { key: '', value: '' }]
            }
        });
    };

    const handleRemoveAttribute = (index) => {
        const newAttributes = formData.product_attributes.filter((_, i) => i !== index);
        handleAttributeChange({
            target: {
                name: 'product_attributes',
                value: newAttributes
            }
        });
    };

    const handleAttributeFieldChange = (index, field, value) => {
        const updatedAttributes = formData.product_attributes.map((attr, i) =>
            i === index ? { ...attr, [field]: value } : attr
        );
        handleAttributeChange({
            target: {
                name: 'product_attributes',
                value: updatedAttributes
            }
        });
    };

    return (
        <div className={cx('product-attributes', 'form-section')}>
            <h2>Product Attributes</h2>
            <p className={cx('section-description')}>
                Add custom attributes for your product (e.g. Material: Cotton, Origin: Vietnam)
            </p>

            {formData.product_attributes.map((attr, index) => (
                <div key={index} className={cx('attributes-row')}>
                    <div className={cx('attributes-inputs')}>
                        <input
                            type="text"
                            placeholder="Attribute name"
                            value={attr.key}
                            onChange={(e) =>
                                handleAttributeFieldChange(index, 'key', e.target.value)
                            }
                            className={cx('attributes-input')}
                        />
                        <input
                            type="text"
                            placeholder="Attribute value"
                            value={attr.value}
                            onChange={(e) =>
                                handleAttributeFieldChange(index, 'value', e.target.value)
                            }
                            className={cx('attributes-input')}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRemoveAttribute(index)}
                        className={cx('remove-btn')}
                    >
                        Remove
                    </button>
                </div>
            ))}

            <button type="button" onClick={handleAddAttribute} className={cx('add-attribute-btn')}>
                Add Attribute
            </button>
        </div>
    );
}

export default ProductAttributes;
