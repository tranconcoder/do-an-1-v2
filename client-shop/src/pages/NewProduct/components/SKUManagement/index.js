import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectShopInfo } from '../../../../store/userSlice';
import classNames from 'classnames/bind';
import styles from './SKUManagement.module.scss';
import ImagePreviewModal from '../../../../components/ImagePreviewModal';

const cx = classNames.bind(styles);

function SKUManagement({ formData, setFormData }) {
    const [duplicateError, setDuplicateError] = useState(null);
    const [currentSkuIndex, setCurrentSkuIndex] = useState(null);
    const shopInfo = useSelector(selectShopInfo);
    const shopWarehouses = shopInfo?.shop_warehouses || [];

    // Add state for modal control
    const [previewImage, setPreviewImage] = useState(null);
    const [previewType, setPreviewType] = useState(null); // 'thumb' or 'additional'
    const [selectedSkuIndex, setSelectedSkuIndex] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    // State theo dõi trạng thái đang xử lý file
    const [processingFileIndex, setProcessingFileIndex] = useState(null);

    // States for drag and drop
    const [draggingThumbIndex, setDraggingThumbIndex] = useState(null);
    const [draggingImagesIndex, setDraggingImagesIndex] = useState(null);

    // Refs for file inputs
    const thumbInputRefs = useRef([]);
    const imagesInputRefs = useRef([]);

    // Maximum number of images per SKU
    const MAX_IMAGES_PER_SKU = 5;

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

    // Initialize refs when sku_list changes
    useEffect(() => {
        thumbInputRefs.current = thumbInputRefs.current.slice(0, formData.sku_list.length);
        imagesInputRefs.current = imagesInputRefs.current.slice(0, formData.sku_list.length);
    }, [formData.sku_list.length]);

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
            sku_price: '',
            warehouse: '' // Using warehouse instead of sku_warehouse
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

    // Process SKU thumbnail file
    const processSkuThumbFile = (skuIndex, file) => {
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

            // Xóa trạng thái đang xử lý sau khi hoàn tất
            setTimeout(() => {
                setProcessingFileIndex(null);
            }, 300);
        };
        reader.readAsDataURL(file);
    };

    // Process SKU image files
    const processSkuImageFiles = (skuIndex, files) => {
        if (files.length === 0) return;

        // Check if adding the new files would exceed the maximum
        const currentImageCount = formData.sku_list[skuIndex].images?.length || 0;
        const remainingSlots = MAX_IMAGES_PER_SKU - currentImageCount;

        if (remainingSlots <= 0) return;

        // Only add up to the remaining slots
        const filesToAdd = files.slice(0, remainingSlots);

        const filePromises = filesToAdd.map((file) => {
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

            // Xóa trạng thái đang xử lý sau khi hoàn tất
            setTimeout(() => {
                setProcessingFileIndex(null);
            }, 300);
        });
    };

    const handleSKUThumbChange = (skuIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Đặt trạng thái đang xử lý
        setProcessingFileIndex(skuIndex);

        processSkuThumbFile(skuIndex, file);
    };

    const handleSKUImagesChange = (skuIndex, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Đặt trạng thái đang xử lý
        setProcessingFileIndex(skuIndex);

        processSkuImageFiles(skuIndex, files);
    };

    // Hàm xử lý click để mở hộp thoại chọn thumbnail
    const handleThumbBoxClick = (skuIndex) => {
        // Nếu đang xử lý file, không cho phép click
        if (processingFileIndex !== null) return;

        if (thumbInputRefs.current[skuIndex]) {
            thumbInputRefs.current[skuIndex].value = ''; // Clear previous selection
            thumbInputRefs.current[skuIndex].click();
        }
    };

    // Hàm xử lý click để mở hộp thoại chọn ảnh bổ sung
    const handleImagesBoxClick = (skuIndex) => {
        // Nếu đang xử lý file, không cho phép click
        if (processingFileIndex !== null) return;

        if (imagesInputRefs.current[skuIndex]) {
            imagesInputRefs.current[skuIndex].value = ''; // Clear previous selection
            imagesInputRefs.current[skuIndex].click();
        }
    };

    const handleThumbDragEnter = (skuIndex, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingThumbIndex(skuIndex);
    };

    const handleThumbDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingThumbIndex(null);
    };

    const handleThumbDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleThumbDrop = (skuIndex, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingThumbIndex(null);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processSkuThumbFile(skuIndex, files[0]);
        }
    };

    // Drag and drop handlers for SKU images
    const handleImagesDragEnter = (skuIndex, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingImagesIndex(skuIndex);
    };

    const handleImagesDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingImagesIndex(null);
    };

    const handleImagesDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleImagesDrop = (skuIndex, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingImagesIndex(null);

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            processSkuImageFiles(skuIndex, files);
        }
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

    // Add handler for warehouse selection
    const handleWarehouseChange = (skuIndex, warehouseId) => {
        const newSKUs = [...formData.sku_list];
        newSKUs[skuIndex].warehouse = warehouseId; // Using warehouse instead of sku_warehouse
        setFormData((prev) => ({
            ...prev,
            sku_list: newSKUs
        }));

        // Clear error when warehouse is selected
        if (warehouseId) {
            setWarehouseErrors((prev) => ({
                ...prev,
                [skuIndex]: null
            }));
        }
    };

    // Add validation state for warehouse errors
    const [warehouseErrors, setWarehouseErrors] = useState({});

    // Validate SKU warehouse before submitting
    useEffect(() => {
        let isValid = true;
        const newErrors = {};

        formData.sku_list.forEach((sku, index) => {
            if (!sku.warehouse) {
                newErrors[index] = 'Vui lòng chọn kho hàng';
                isValid = false;
            }
        });

        setWarehouseErrors(newErrors);
    }, [formData.sku_list]);

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
                                <h3>Kho và Giá</h3>
                                <div className={cx('inventory-pricing-grid')}>
                                    <div className={cx('sku-field')}>
                                        <label>Kho hàng *</label>
                                        <select
                                            value={sku.warehouse}
                                            onChange={(e) =>
                                                handleWarehouseChange(skuIndex, e.target.value)
                                            }
                                            className={cx('warehouse-select', {
                                                'error-border': warehouseErrors[skuIndex]
                                            })}
                                            required
                                        >
                                            <option value="">-- Chọn kho hàng --</option>
                                            {shopWarehouses.map((warehouse) => (
                                                <option key={warehouse._id} value={warehouse._id}>
                                                    {warehouse.name}
                                                </option>
                                            ))}
                                        </select>
                                        {warehouseErrors[skuIndex] && (
                                            <div className={cx('field-error')}>
                                                {warehouseErrors[skuIndex]}
                                            </div>
                                        )}
                                    </div>
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
                                            <div
                                                className={cx('upload-placeholder', {
                                                    dragging: draggingThumbIndex === skuIndex,
                                                    processing: processingFileIndex === skuIndex
                                                })}
                                                onDragEnter={(e) =>
                                                    handleThumbDragEnter(skuIndex, e)
                                                }
                                                onDragLeave={handleThumbDragLeave}
                                                onDragOver={handleThumbDragOver}
                                                onDrop={(e) => handleThumbDrop(skuIndex, e)}
                                                onClick={() => handleThumbBoxClick(skuIndex)}
                                            >
                                                <div className={cx('upload-icon')}>📷</div>
                                                <span>
                                                    {processingFileIndex === skuIndex
                                                        ? 'Processing...'
                                                        : 'Click or drag to upload thumbnail'}
                                                </span>
                                                <input
                                                    type="file"
                                                    className={cx('file-input')}
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        handleSKUThumbChange(skuIndex, e)
                                                    }
                                                    ref={(el) =>
                                                        (thumbInputRefs.current[skuIndex] = el)
                                                    }
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={cx('sku-images-section')}>
                                    <h3>
                                        Additional Images{' '}
                                        <span className={cx('image-limit-text')}>
                                            (Max: {MAX_IMAGES_PER_SKU})
                                        </span>
                                    </h3>
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
                                            {(sku.images?.length || 0) < MAX_IMAGES_PER_SKU && (
                                                <div
                                                    className={cx('add-sku-image', {
                                                        dragging: draggingImagesIndex === skuIndex,
                                                        processing: processingFileIndex === skuIndex
                                                    })}
                                                    onDragEnter={(e) =>
                                                        handleImagesDragEnter(skuIndex, e)
                                                    }
                                                    onDragLeave={handleImagesDragLeave}
                                                    onDragOver={handleImagesDragOver}
                                                    onDrop={(e) => handleImagesDrop(skuIndex, e)}
                                                    onClick={() => handleImagesBoxClick(skuIndex)}
                                                >
                                                    <span>+</span>
                                                    <div className={cx('drag-text')}>
                                                        {processingFileIndex === skuIndex
                                                            ? 'Processing...'
                                                            : 'Click or drag images here'}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className={cx('file-input')}
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) =>
                                                            handleSKUImagesChange(skuIndex, e)
                                                        }
                                                        ref={(el) =>
                                                            (imagesInputRefs.current[skuIndex] = el)
                                                        }
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {(sku.images?.length || 0) >= MAX_IMAGES_PER_SKU && (
                                            <div className={cx('images-limit-reached')}>
                                                Maximum number of images reached (
                                                {MAX_IMAGES_PER_SKU})
                                            </div>
                                        )}
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
