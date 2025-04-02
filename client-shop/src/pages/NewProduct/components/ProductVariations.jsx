import React from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';

const cx = classNames.bind(styles);

function ProductVariations({ formData, setFormData }) {
    const addVariation = () => {
        const newVariation = {
            name: '',
            options: ['']
        };

        setFormData((prev) => ({
            ...prev,
            product_variations: [...prev.product_variations, newVariation]
        }));
    };

    const updateVariation = (index, field, value) => {
        const newVariations = [...formData.product_variations];
        newVariations[index][field] = value;

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    const addOptionToVariation = (variationIndex) => {
        const newVariations = [...formData.product_variations];
        newVariations[variationIndex].options.push('');

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    const updateVariationOption = (variationIndex, optionIndex, value) => {
        const newVariations = [...formData.product_variations];
        newVariations[variationIndex].options[optionIndex] = value;

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    const removeOptionFromVariation = (variationIndex, optionIndex) => {
        const newVariations = [...formData.product_variations];
        newVariations[variationIndex].options.splice(optionIndex, 1);

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    const removeVariation = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            product_variations: prev.product_variations.filter(
                (_, index) => index !== indexToRemove
            )
        }));
    };

    return (
        <div className={cx('form-section')}>
            <h2>Product Variations</h2>
            {formData.product_variations.map((variation, variationIndex) => (
                <div key={variationIndex} className={cx('variation-container')}>
                    <div className={cx('variation-header')}>
                        <input
                            type="text"
                            placeholder="Variation Name"
                            value={variation.name}
                            onChange={(e) =>
                                updateVariation(variationIndex, 'name', e.target.value)
                            }
                            className={cx('variation-name')}
                        />
                        <button
                            type="button"
                            className={cx('remove-variation')}
                            onClick={() => removeVariation(variationIndex)}
                        >
                            Remove Variation
                        </button>
                    </div>
                    {variation.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={cx('option-row')}>
                            <input
                                type="text"
                                placeholder="Option"
                                value={option}
                                onChange={(e) =>
                                    updateVariationOption(
                                        variationIndex,
                                        optionIndex,
                                        e.target.value
                                    )
                                }
                            />
                            <button
                                type="button"
                                className={cx('remove-option')}
                                onClick={() =>
                                    removeOptionFromVariation(variationIndex, optionIndex)
                                }
                            >
                                Remove Option
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className={cx('add-option')}
                        onClick={() => addOptionToVariation(variationIndex)}
                    >
                        Add Option
                    </button>
                </div>
            ))}
            <button type="button" className={cx('add-variation')} onClick={addVariation}>
                Add Variation
            </button>
        </div>
    );
}

export default ProductVariations;
