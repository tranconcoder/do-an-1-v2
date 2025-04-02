import React from 'react';
import classNames from 'classnames/bind';
import styles from './ProductAttributes.module.scss';

const cx = classNames.bind(styles);

function ProductAttributes({ formData, setFormData }) {
    const handleAddAttribute = () => {
        setFormData(prev => ({
            ...prev,
            product_attributes: [
                ...prev.product_attributes,
                { key: '', value: '' }
            ]
        }));
    };

    const handleRemoveAttribute = (index) => {
        setFormData(prev => ({
            ...prev,
            product_attributes: prev.product_attributes.filter((_, i) => i !== index)
        }));
    };

    const handleAttributeChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            product_attributes: prev.product_attributes.map((attr, i) => 
                i === index ? { ...attr, [field]: value } : attr
            )
        }));
    };

    return (
        <div className={cx('product-attributes')}>
            <h2>Product Attributes</h2>
            <p className={cx('description')}>Add custom attributes for your product (e.g. Material: Cotton, Origin: Vietnam)</p>

            {formData.product_attributes.map((attr, index) => (
                <div key={index} className={cx('attribute-row')}>
                    <div className={cx('attribute-inputs')}>
                        <input
                            type="text"
                            placeholder="Attribute name"
                            value={attr.key}
                            onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                            className={cx('attribute-input')}
                        />
                        <input
                            type="text"
                            placeholder="Attribute value"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                            className={cx('attribute-input')}
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

            <button
                type="button"
                onClick={handleAddAttribute}
                className={cx('add-attribute-btn')}
            >
                Add Attribute
            </button>
        </div>
    );
}

export default ProductAttributes;