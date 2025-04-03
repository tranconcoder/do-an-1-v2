import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './SKUManagement.module.scss';
import ImagePreviewModal from '../../../../components/ImagePreviewModal';

const cx = classNames.bind(styles);

function SKUManagement({ formData, setFormData }) {
    const [duplicateError, setDuplicateError] = useState(null);
    const [currentSkuIndex, setCurrentSkuIndex] = useState(null);

    // Add state for modal control
    const [previewImage, setPreviewImage] = useState(null);
    const [previewType, setPreviewType] = useState(null); // 'thumb' or 'additional'
    const [selectedSkuIndex, setSelectedSkuIndex] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    // Check if there are valid variations
    const hasValidVariations = formData.product_variations?.some(
        (v) =>
            v.name &&
            v.options &&
            v.options.length > 0 &&
            v.options.some((opt) => opt.trim() !== '')
    );

    // Check if there is any valid SKU
    const hasValidSku = formData.sku_list.some(
        (sku) => sku.sku_price && sku.sku_stock >= 0 && sku.thumb
    );

    // Handle opening the preview modal
    const handleOpenPreview = (image, type, skuIndex, imageIndex = null) => {
        setPreviewImage(image);
        setPreviewType(type);
        setSelectedSkuIndex(skuIndex);
        setSelectedImageIndex(imageIndex);
    };

    // Handle closing the preview modal
    const handleClosePreview = () => {
        setPreviewImage(null);
        setPreviewType(null);
        setSelectedSkuIndex(null);
        setSelectedImageIndex(null);
    };

    // Handle replacing an image from the modal
    const handleReplaceImage = (file) => {
        if (!file || selectedSkuIndex === null) return;

        const reader = new FileReader();

        if (previewType === 'thumb') {
            reader.onload = () => {
                const newThumb = {
                    file,
                    preview: reader.result
                };

                const newSKUs = [...formData.sku_list];
                newSKUs[selectedSkuIndex].thumb = newThumb;

                setFormData((prev) => ({
                    ...prev,
                    sku_list: newSKUs
                }));
            };
        } else if (previewType === 'additional' && selectedImageIndex !== null) {
            reader.onload = () => {
                const newImage = {
                    file,
                    preview: reader.result
                };

                const newSKUs = [...formData.sku_list];
                newSKUs[selectedSkuIndex].images[selectedImageIndex] = newImage;

                setFormData((prev) => ({
                    ...prev,
                    sku_list: newSKUs
                }));
            };
        }

        reader.readAsDataURL(file);
    };

    // Clear duplicate error when component re-renders with new formData
    useEffect(() => {
        setDuplicateError(null);
    }, [formData.product_variations]);

    // Update total product quantity whenever SKU quantities change
    useEffect(() => {
        if (formData.sku_list && formData.sku_list.length > 0) {
            const totalQuantity = formData.sku_list.reduce((sum, sku) => {
                return sum + (parseInt(sku.sku_stock) || 0);
            }, 0);

            setFormData((prev) => ({
                ...prev,
                product_quantity: totalQuantity
            }));
        }
    }, [formData.sku_list, setFormData]);

    // Clear SKUs when no valid variations
    useEffect(() => {
        if (!hasValidVariations && formData.sku_list.length > 0) {
            setFormData((prev) => ({
                ...prev,
                sku_list: []
            }));
        }
    }, [hasValidVariations]);

    // Check if a variation combination already exists
    const checkDuplicateVariation = (skuIndex, selectedOptions) => {
        const optionsKey = JSON.stringify(
            Object.entries(selectedOptions)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => `${key}:${value}`)
        );

        // Check if this combination exists in another SKU
        const duplicateIndex = formData.sku_list.findIndex((sku, index) => {
            if (index === skuIndex) return false; // Skip current SKU

            const skuOptionsKey = JSON.stringify(
                Object.entries(sku.selected_options || {})
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, value]) => `${key}:${value}`)
            );

            return skuOptionsKey === optionsKey;
        });

        return duplicateIndex;
    };

    const addSKU = () => {
        const newSKU = {
            sku_tier_idx: [],
            selected_options: {}, // Store selected options for UI display
            thumb: null,
            images: [],
            sku_stock: 0,
            sku_price: ''
        };
        setFormData((prev) => ({
            ...prev,
            sku_list: [...prev.sku_list, newSKU]
        }));
        setDuplicateError(null);
        setCurrentSkuIndex(formData.sku_list.length);
    };

    const updateSKU = (index, field, value) => {
        const newSKUs = [...formData.sku_list];
        newSKUs[index][field] = value;
        setFormData((prev) => ({
            ...prev,
            sku_list: newSKUs
        }));
    };

    const handleOptionSelect = (skuIndex, variationIndex, optionIndex) => {
        setCurrentSkuIndex(skuIndex);
        const newSKUs = [...formData.sku_list];

        // Update the selected options object for UI
        const newSelectedOptions = {
            ...newSKUs[skuIndex].selected_options,
            [variationIndex]: optionIndex
        };

        // Check for duplicates before updating
        const duplicateIndex = checkDuplicateVariation(skuIndex, newSelectedOptions);

        if (duplicateIndex !== -1) {
            setDuplicateError({
                message: `This variation combination already exists in SKU #${duplicateIndex + 1}`,
                skuIndex: duplicateIndex
            });
        } else {
            setDuplicateError(null);
            newSKUs[skuIndex].selected_options = newSelectedOptions;

            // Convert selected options to sku_tier_idx format
            const tierIdxArray = Object.entries(newSelectedOptions)
                .map(([varIdx, optIdx]) => ({
                    variationIndex: parseInt(varIdx),
                    optionIndex: parseInt(optIdx)
                }))
                .sort((a, b) => a.variationIndex - b.variationIndex)
                .map((item) => item.optionIndex);

            newSKUs[skuIndex].sku_tier_idx = tierIdxArray;

            setFormData((prev) => ({
                ...prev,
                sku_list: newSKUs
            }));
        }
    };

    const handleSKUThumbChange = (skuIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const newSKUs = [...formData.sku_list];
            newSKUs[skuIndex].thumb = {
                file,
                preview: reader.result
            };
            setFormData((prev) => ({
                ...prev,
                sku_list: newSKUs
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSKUImagesChange = (skuIndex, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const filePromises = files.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        file,
                        preview: reader.result
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises).then((newImages) => {
            const newSKUs = [...formData.sku_list];
            newSKUs[skuIndex].images = [...(newSKUs[skuIndex].images || []), ...newImages];
            setFormData((prev) => ({
                ...prev,
                sku_list: newSKUs
            }));
        });
    };

    const removeSKUImage = (skuIndex, imageIndex) => {
        const newSKUs = [...formData.sku_list];
        newSKUs[skuIndex].images.splice(imageIndex, 1);
        setFormData((prev) => ({
            ...prev,
            sku_list: newSKUs
        }));
    };

    const removeSKU = (skuIndex) => {
        setFormData((prev) => ({
            ...prev,
            sku_list: prev.sku_list.filter((_, index) => index !== skuIndex)
        }));
    };

    // Handle stock and price changes
    const handleSkuNumberChange = (skuIndex, field, value) => {
        const numValue = value === '' ? (field === 'sku_stock' ? 0 : '') : Number(value);

        const newSKUs = [...formData.sku_list];
        newSKUs[skuIndex][field] = numValue;

        setFormData((prev) => ({
            ...prev,
            sku_list: newSKUs
        }));
    };

    // Check if there are any variations defined
    const hasVariations =
        formData.product_variations &&
        formData.product_variations.length > 0 &&
        formData.product_variations.some((v) => v.options && v.options.length > 0);

    return (
        <div className={cx('form-section')}>
            <h2>SKU Management</h2>
            <p className={cx('section-description')}>
                Configure SKUs for your product variations and upload specific images for each
                combination.
            </p>

            {!hasValidVariations && (
                <div className={cx('sku-notice', 'error')}>
                    <p>
                        ⚠️ You must define at least one variation with options before adding SKUs.
                    </p>
                </div>
            )}

            {!hasValidSku && hasValidVariations && (
                <div className={cx('sku-warning')}>
                    <p>
                        ⚠️ At least one SKU with price, stock quantity, and thumbnail image is
                        required to create a product.
                    </p>
                </div>
            )}

            <div className={cx('sku-list')}>
                {formData.sku_list.map((sku, skuIndex) => (
                    <div key={skuIndex} className={cx('sku-item')}>
                        <div className={cx('sku-header')}>
                            <span className={cx('sku-title')}>SKU #{skuIndex + 1}</span>
                            <button
                                type="button"
                                className={cx('remove-sku')}
                                onClick={() => {
                                    removeSKU(skuIndex);
                                    setDuplicateError(null);
                                }}
                            >
                                <span className={cx('remove-icon')}>×</span>
                                Remove
                            </button>
                        </div>

                        <div className={cx('sku-content')}>
                            {hasVariations && (
                                <div className={cx('sku-variations-selection')}>
                                    <h3>Variation Options</h3>
                                    <div className={cx('variations-options-grid')}>
                                        {formData.product_variations.map(
                                            (variation, variationIndex) => (
                                                <div
                                                    key={variationIndex}
                                                    className={cx('variation-selector')}
                                                >
                                                    <label>{variation.name}</label>
                                                    <select
                                                        value={
                                                            sku.selected_options?.[
                                                                variationIndex
                                                            ] || ''
                                                        }
                                                        onChange={(e) =>
                                                            handleOptionSelect(
                                                                skuIndex,
                                                                variationIndex,
                                                                e.target.value
                                                            )
                                                        }
                                                        className={cx('variation-option-select', {
                                                            'error-border':
                                                                duplicateError &&
                                                                currentSkuIndex === skuIndex
                                                        })}
                                                    >
                                                        <option value="">
                                                            -- Select {variation.name} --
                                                        </option>
                                                        {variation.options.map(
                                                            (option, optionIndex) => (
                                                                <option
                                                                    key={optionIndex}
                                                                    value={optionIndex}
                                                                >
                                                                    {option}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {duplicateError && currentSkuIndex === skuIndex && (
                                        <div className={cx('duplicate-error')}>
                                            <span className={cx('error-icon')}>⚠️</span>
                                            {duplicateError.message}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Add inventory and pricing fields */}
                            <div className={cx('sku-inventory-pricing')}>
                                <h3>Inventory & Pricing</h3>
                                <div className={cx('inventory-pricing-grid')}>
                                    <div className={cx('sku-field')}>
                                        <label>Stock Quantity</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={sku.sku_stock}
                                            onChange={(e) =>
                                                handleSkuNumberChange(
                                                    skuIndex,
                                                    'sku_stock',
                                                    e.target.value
                                                )
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
                                                    handleSkuNumberChange(
                                                        skuIndex,
                                                        'sku_price',
                                                        e.target.value
                                                    )
                                                }
                                                className={cx('sku-input')}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={cx('sku-summary')}>
                                <h3>Selected Combination</h3>
                                {hasVariations ? (
                                    <div className={cx('selected-options-tags')}>
                                        {Object.entries(sku.selected_options || {}).length > 0 ? (
                                            Object.entries(sku.selected_options || {}).map(
                                                ([varIdx, optIdx]) => {
                                                    const variation =
                                                        formData.product_variations[varIdx];
                                                    return variation ? (
                                                        <span
                                                            key={varIdx}
                                                            className={cx('option-tag')}
                                                        >
                                                            {variation.name}:{' '}
                                                            {variation.options[optIdx]}
                                                        </span>
                                                    ) : null;
                                                }
                                            )
                                        ) : (
                                            <span className={cx('no-options-selected')}>
                                                No options selected
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className={cx('no-variations-defined')}>
                                        No variations defined
                                    </span>
                                )}
                            </div>

                            <div className={cx('sku-images-content')}>
                                <div className={cx('sku-thumb-section')}>
                                    <h3>Thumbnail Image</h3>
                                    <div className={cx('sku-thumb-upload')}>
                                        {sku.thumb ? (
                                            <div
                                                className={cx('sku-thumb-preview')}
                                                onClick={() =>
                                                    handleOpenPreview(sku.thumb, 'thumb', skuIndex)
                                                }
                                            >
                                                <img src={sku.thumb.preview} alt="SKU thumbnail" />
                                                <button
                                                    type="button"
                                                    className={cx('replace-thumb')}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent opening preview
                                                        updateSKU(skuIndex, 'thumb', null);
                                                    }}
                                                >
                                                    Replace
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={cx('upload-placeholder')}>
                                                <div className={cx('upload-icon')}>📷</div>
                                                <span>Click to upload thumbnail</span>
                                                <input
                                                    type="file"
                                                    className={cx('file-input')}
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        handleSKUThumbChange(skuIndex, e)
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={cx('sku-images-section')}>
                                    <h3>Additional Images</h3>
                                    <div className={cx('sku-images-upload')}>
                                        <div className={cx('sku-images-grid')}>
                                            {sku.images &&
                                                sku.images.map((image, imageIndex) => (
                                                    <div
                                                        key={imageIndex}
                                                        className={cx('sku-image-item')}
                                                        onClick={() =>
                                                            handleOpenPreview(
                                                                image,
                                                                'additional',
                                                                skuIndex,
                                                                imageIndex
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            src={image.preview}
                                                            alt={`SKU image ${imageIndex}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={cx('remove-image')}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent opening preview
                                                                removeSKUImage(
                                                                    skuIndex,
                                                                    imageIndex
                                                                );
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            <div className={cx('add-sku-image')}>
                                                <span>+</span>
                                                <input
                                                    type="file"
                                                    className={cx('file-input')}
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) =>
                                                        handleSKUImagesChange(skuIndex, e)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addSKU}
                className={cx('add-variation-btn')}
                disabled={!hasValidVariations}
            >
                <span className={cx('add-icon')}>+</span> Add New SKU
                {!hasValidVariations && (
                    <span className={cx('btn-tooltip')}>Define variations first</span>
                )}
            </button>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreviewModal
                    image={previewImage}
                    onClose={handleClosePreview}
                    onReplace={handleReplaceImage}
                />
            )}
        </div>
    );
}

export default SKUManagement;
