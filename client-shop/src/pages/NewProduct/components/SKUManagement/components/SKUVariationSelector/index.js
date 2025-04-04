import React from 'react';
import classNames from 'classnames/bind';
import styles from './SKUVariationSelector.module.scss';

const cx = classNames.bind(styles);

function SKUVariationSelector({
    sku,
    skuIndex,
    variations,
    duplicateError,
    currentSkuIndex,
    onOptionSelect
}) {
    return (
        <div className={cx('sku-variations-selection')}>
            <h3>Variation Options</h3>
            <div className={cx('variations-options-grid')}>
                {variations.map((variation, variationIndex) => (
                    <div key={variationIndex} className={cx('variation-selector')}>
                        <label>{variation.name}</label>
                        <select
                            value={sku.selected_options?.[variationIndex] || ''}
                            onChange={(e) =>
                                onOptionSelect(skuIndex, variationIndex, e.target.value)
                            }
                            className={cx('variation-option-select', {
                                'error-border': duplicateError && currentSkuIndex === skuIndex
                            })}
                        >
                            <option value="">-- Select {variation.name} --</option>
                            {variation.options.map((option, optionIndex) => (
                                <option key={optionIndex} value={optionIndex}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {duplicateError && currentSkuIndex === skuIndex && (
                <div className={cx('duplicate-error')}>
                    <span className={cx('error-icon')}>⚠️</span>
                    {duplicateError.message}
                </div>
            )}
        </div>
    );
}

export default SKUVariationSelector;
