import React from 'react';
import classNames from 'classnames/bind';
import styles from './SKUThumbUpload.module.scss';

const cx = classNames.bind(styles);

function SKUThumbUpload({
    sku,
    skuIndex,
    thumbInputRef,
    draggingThumbIndex,
    processingFileIndex,
    tempThumbPreviews,
    onUpdateSKU,
    onOpenPreview,
    handleSKUThumbChange,
    handleThumbBoxClick,
    handleThumbDragEnter,
    handleThumbDragLeave,
    handleThumbDragOver,
    handleThumbDrop
}) {
    return (
        <div className={cx('sku-thumb-section')}>
            <h3>Thumbnail Image</h3>
            <div className={cx('sku-thumb-upload')}>
                {sku.thumb ? (
                    <div
                        className={cx('sku-thumb-preview')}
                        onClick={() => onOpenPreview(sku.thumb, 'thumb', skuIndex)}
                    >
                        <img src={sku.thumb.preview} alt="SKU thumbnail" />
                        <button
                            type="button"
                            className={cx('replace-thumb')}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent opening preview
                                onUpdateSKU(skuIndex, 'thumb', null);
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
                        onDragEnter={handleThumbDragEnter}
                        onDragLeave={handleThumbDragLeave}
                        onDragOver={handleThumbDragOver}
                        onDrop={handleThumbDrop}
                        onClick={handleThumbBoxClick}
                    >
                        {tempThumbPreviews[skuIndex] ? (
                            <div className={cx('temp-preview-container')}>
                                <img
                                    src={tempThumbPreviews[skuIndex]}
                                    alt="Thumbnail preview"
                                    className={cx('temp-preview-image')}
                                />
                                <div className={cx('processing-overlay')}>
                                    <span>Processing...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={cx('upload-icon')}>📷</div>
                                <span>
                                    {processingFileIndex === skuIndex
                                        ? 'Processing...'
                                        : 'Click or drag to upload thumbnail'}
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            className={cx('file-input')}
                            accept="image/*"
                            onChange={handleSKUThumbChange}
                            ref={thumbInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default SKUThumbUpload;
