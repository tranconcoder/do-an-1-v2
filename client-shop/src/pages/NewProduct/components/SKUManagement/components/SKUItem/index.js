import React, { useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './SKUItem.module.scss';
import SKUVariationSelector from '../SKUVariationSelector';
import SKUInventoryPricing from '../SKUInventoryPricing';
import SKUSummary from '../SKUSummary';
import SKUThumbUpload from '../SKUThumbUpload';
import SKUImagesUpload from '../SKUImagesUpload';

const cx = classNames.bind(styles);

function SKUItem({
    sku,
    skuIndex,
    formData,
    warehouses,
    warehousesLoading,
    duplicateError,
    currentSkuIndex,
    processingFileIndex,
    tempThumbPreviews,
    tempImagePreviews,
    warehouseErrors,
    MAX_IMAGES_PER_SKU,
    hasVariations,
    onRemoveSKU,
    onOptionSelect,
    onProcessThumb,
    onProcessImages,
    onRemoveImage,
    onWarehouseChange,
    onSkuNumberChange,
    onUpdateSKU,
    onOpenPreview,
    setProcessingFileIndex
}) {
    // Refs for file inputs
    const thumbInputRef = useRef(null);
    const imagesInputRef = useRef(null);

    // States for dragging
    const [draggingThumbIndex, setDraggingThumbIndex] = React.useState(null);
    const [draggingImagesIndex, setDraggingImagesIndex] = React.useState(null);

    // Handle thumbnail file selection
    const handleSKUThumbChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessingFileIndex(skuIndex);
        onProcessThumb(skuIndex, file);
    };

    // Handle additional images file selection
    const handleSKUImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setProcessingFileIndex(skuIndex);
        onProcessImages(skuIndex, files);
    };

    // Handle thumbnail box click
    const handleThumbBoxClick = () => {
        if (processingFileIndex !== null) return;

        if (thumbInputRef.current) {
            thumbInputRef.current.value = ''; // Clear previous selection
            thumbInputRef.current.click();
        }
    };

    // Handle images box click
    const handleImagesBoxClick = () => {
        if (processingFileIndex !== null) return;

        if (imagesInputRef.current) {
            imagesInputRef.current.value = ''; // Clear previous selection
            imagesInputRef.current.click();
        }
    };

    // Drag and drop handlers for thumbnail
    const handleThumbDragEnter = (e) => {
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

    const handleThumbDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingThumbIndex(null);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onProcessThumb(skuIndex, files[0]);
        }
    };

    // Drag and drop handlers for images
    const handleImagesDragEnter = (e) => {
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

    const handleImagesDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingImagesIndex(null);

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            onProcessImages(skuIndex, files);
        }
    };

    return (
        <div className={cx('sku-item')}>
            <div className={cx('sku-header')}>
                <span className={cx('sku-title')}>SKU #{skuIndex + 1}</span>
                <button
                    type="button"
                    className={cx('remove-sku')}
                    onClick={() => onRemoveSKU(skuIndex)}
                >
                    <span className={cx('remove-icon')}>×</span>
                    Remove
                </button>
            </div>

            <div className={cx('sku-content')}>
                {hasVariations && (
                    <SKUVariationSelector
                        sku={sku}
                        skuIndex={skuIndex}
                        variations={formData.product_variations}
                        duplicateError={duplicateError}
                        currentSkuIndex={currentSkuIndex}
                        onOptionSelect={onOptionSelect}
                    />
                )}

                <SKUInventoryPricing
                    sku={sku}
                    skuIndex={skuIndex}
                    warehouses={warehouses}
                    warehousesLoading={warehousesLoading}
                    warehouseErrors={warehouseErrors}
                    onWarehouseChange={onWarehouseChange}
                    onSkuNumberChange={onSkuNumberChange}
                />

                <SKUSummary
                    sku={sku}
                    hasVariations={hasVariations}
                    variations={formData.product_variations}
                />

                <div className={cx('sku-images-content')}>
                    <SKUThumbUpload
                        sku={sku}
                        skuIndex={skuIndex}
                        thumbInputRef={thumbInputRef}
                        draggingThumbIndex={draggingThumbIndex}
                        processingFileIndex={processingFileIndex}
                        tempThumbPreviews={tempThumbPreviews}
                        onUpdateSKU={onUpdateSKU}
                        onOpenPreview={onOpenPreview}
                        handleSKUThumbChange={handleSKUThumbChange}
                        handleThumbBoxClick={handleThumbBoxClick}
                        handleThumbDragEnter={handleThumbDragEnter}
                        handleThumbDragLeave={handleThumbDragLeave}
                        handleThumbDragOver={handleThumbDragOver}
                        handleThumbDrop={handleThumbDrop}
                    />

                    <SKUImagesUpload
                        sku={sku}
                        skuIndex={skuIndex}
                        MAX_IMAGES_PER_SKU={MAX_IMAGES_PER_SKU}
                        imagesInputRef={imagesInputRef}
                        draggingImagesIndex={draggingImagesIndex}
                        processingFileIndex={processingFileIndex}
                        tempImagePreviews={tempImagePreviews}
                        onOpenPreview={onOpenPreview}
                        onRemoveImage={onRemoveImage}
                        handleSKUImagesChange={handleSKUImagesChange}
                        handleImagesBoxClick={handleImagesBoxClick}
                        handleImagesDragEnter={handleImagesDragEnter}
                        handleImagesDragLeave={handleImagesDragLeave}
                        handleImagesDragOver={handleImagesDragOver}
                        handleImagesDrop={handleImagesDrop}
                    />
                </div>
            </div>
        </div>
    );
}

export default SKUItem;
