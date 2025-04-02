import React from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';

const cx = classNames.bind(styles);

function SKUManagement({ formData, setFormData }) {
    const addSKU = () => {
        const newSKU = {
            sku_tier_idx: [],
            thumb: null,
            images: []
        };
        setFormData((prev) => ({
            ...prev,
            skus: [...prev.skus, newSKU]
        }));
    };

    const updateSKU = (index, field, value) => {
        const newSKUs = [...formData.skus];
        newSKUs[index][field] = value;
        setFormData((prev) => ({
            ...prev,
            skus: newSKUs
        }));
    };

    const handleSKUThumbChange = (skuIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const newSKUs = [...formData.skus];
            newSKUs[skuIndex].thumb = {
                file,
                preview: reader.result
            };
            setFormData((prev) => ({
                ...prev,
                skus: newSKUs
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
            const newSKUs = [...formData.skus];
            newSKUs[skuIndex].images = [...(newSKUs[skuIndex].images || []), ...newImages];
            setFormData((prev) => ({
                ...prev,
                skus: newSKUs
            }));
        });
    };

    const removeSKUImage = (skuIndex, imageIndex) => {
        const newSKUs = [...formData.skus];
        newSKUs[skuIndex].images.splice(imageIndex, 1);
        setFormData((prev) => ({
            ...prev,
            skus: newSKUs
        }));
    };

    const removeSKU = (skuIndex) => {
        setFormData((prev) => ({
            ...prev,
            skus: prev.skus.filter((_, index) => index !== skuIndex)
        }));
    };

    return (
        <div className={cx('form-section')}>
            <h2>SKU Management</h2>
            <p className={cx('section-description')}>
                Manage your product SKUs by specifying variation indexes and uploading images.
            </p>

            <div className={cx('sku-list')}>
                {formData.skus.map((sku, skuIndex) => (
                    <div key={skuIndex} className={cx('sku-item')}>
                        <div className={cx('sku-header')}>
                            <span className={cx('sku-title')}>SKU #{skuIndex + 1}</span>
                            <button
                                type="button"
                                className={cx('remove-sku')}
                                onClick={() => removeSKU(skuIndex)}
                            >
                                Remove
                            </button>
                        </div>

                        <div className={cx('sku-content')}>
                            <div className={cx('sku-tier-idx')}>
                                <label>Variation Indexes:</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 0,1"
                                    value={sku.sku_tier_idx.join(',')}
                                    onChange={(e) =>
                                        updateSKU(
                                            skuIndex,
                                            'sku_tier_idx',
                                            e.target.value.split(',').map(Number)
                                        )
                                    }
                                />
                                <span className={cx('sku-hint')}>
                                    Enter comma-separated indexes of variations (0-based)
                                </span>
                            </div>

                            <div className={cx('sku-images-content')}>
                                <div className={cx('sku-thumb-section')}>
                                    <h3>Thumbnail Image</h3>
                                    <div className={cx('sku-thumb-upload')}>
                                        {sku.thumb ? (
                                            <div className={cx('sku-thumb-preview')}>
                                                <img src={sku.thumb.preview} alt="SKU thumbnail" />
                                                <button
                                                    type="button"
                                                    className={cx('replace-thumb')}
                                                    onClick={() =>
                                                        updateSKU(skuIndex, 'thumb', null)
                                                    }
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
                                                    >
                                                        <img
                                                            src={image.preview}
                                                            alt={`SKU image ${imageIndex}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={cx('remove-image')}
                                                            onClick={() =>
                                                                removeSKUImage(skuIndex, imageIndex)
                                                            }
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

            <button type="button" onClick={addSKU} className={cx('add-variation-btn')}>
                <span className={cx('add-icon')}>+</span> Add New SKU
            </button>
        </div>
    );
}

export default SKUManagement;
