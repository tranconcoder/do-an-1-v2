import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';

const cx = classNames.bind(styles);

function ProductVariations({ formData, setFormData }) {
    const [dragOver, setDragOver] = useState(null);

    const addVariation = () => {
        const newVariation = {
            name: '',
            options: [''],
            thumb: null,
            images: []
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

    const handleVariationThumbChange = (variationIndex, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const newVariations = [...formData.product_variations];
            newVariations[variationIndex].thumb = {
                file,
                preview: reader.result
            };

            setFormData((prev) => ({
                ...prev,
                product_variations: newVariations
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleVariationImagesChange = (variationIndex, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Validate file types
        const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
        if (invalidFiles.length > 0) {
            alert('Please select only image files');
            return;
        }

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
            const newVariations = [...formData.product_variations];
            newVariations[variationIndex].images = [
                ...(newVariations[variationIndex].images || []),
                ...newImages
            ];

            setFormData((prev) => ({
                ...prev,
                product_variations: newVariations
            }));
        });
    };

    const removeVariationImage = (variationIndex, imageIndex) => {
        const newVariations = [...formData.product_variations];
        newVariations[variationIndex].images.splice(imageIndex, 1);

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    const handleDragOver = (e, variationIndex) => {
        e.preventDefault();
        setDragOver(variationIndex);
    };

    const handleDragLeave = () => {
        setDragOver(null);
    };

    const handleDrop = (e, variationIndex, isThumb) => {
        e.preventDefault();
        setDragOver(null);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        // Check if all files are images
        const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
        if (invalidFiles.length > 0) {
            alert('Please drop only image files');
            return;
        }

        if (isThumb) {
            // Only use the first file for thumbnail
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const newVariations = [...formData.product_variations];
                newVariations[variationIndex].thumb = {
                    file,
                    preview: reader.result
                };

                setFormData((prev) => ({
                    ...prev,
                    product_variations: newVariations
                }));
            };
            reader.readAsDataURL(file);
        } else {
            // Process all files for additional images
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
                const newVariations = [...formData.product_variations];
                newVariations[variationIndex].images = [
                    ...(newVariations[variationIndex].images || []),
                    ...newImages
                ];

                setFormData((prev) => ({
                    ...prev,
                    product_variations: newVariations
                }));
            });
        }
    };

    return (
        <div className={cx('form-section')}>
            <h2>Product Variations</h2>
            <p className={cx('section-description')}>
                Add variations like Size, Color, etc. Each variation requires a thumbnail image.
            </p>

            {formData.product_variations.map((variation, variationIndex) => (
                <div key={variationIndex} className={cx('variation-container')}>
                    <div className={cx('variation-header')}>
                        <input
                            type="text"
                            placeholder="Variation Name (e.g. Size, Color)"
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
                            <span className={cx('remove-icon')}>×</span>
                            Remove
                        </button>
                    </div>

                    <div className={cx('variation-content')}>
                        <div className={cx('variation-options')}>
                            <h3 className={cx('variation-section-title')}>Options</h3>
                            {variation.options.map((option, optionIndex) => (
                                <div key={optionIndex} className={cx('option-row')}>
                                    <input
                                        type="text"
                                        placeholder="Option value (e.g. S, M, L or Red, Blue)"
                                        value={option}
                                        onChange={(e) =>
                                            updateVariationOption(
                                                variationIndex,
                                                optionIndex,
                                                e.target.value
                                            )
                                        }
                                    />
                                    {variation.options.length > 1 && (
                                        <button
                                            type="button"
                                            className={cx('remove-option')}
                                            onClick={() =>
                                                removeOptionFromVariation(
                                                    variationIndex,
                                                    optionIndex
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    )}
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

                        <div className={cx('variation-images-container')}>
                            <div className={cx('variation-thumb-section')}>
                                <h3 className={cx('variation-section-title')}>
                                    Thumbnail Image <span className={cx('required-mark')}>*</span>
                                </h3>

                                <div
                                    className={cx('variation-thumb-upload', {
                                        'drag-over': dragOver === `thumb-${variationIndex}`
                                    })}
                                    onDragOver={(e) => handleDragOver(e, `thumb-${variationIndex}`)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, variationIndex, true)}
                                >
                                    {variation.thumb ? (
                                        <div className={cx('variation-thumb-preview')}>
                                            <img
                                                src={variation.thumb.preview}
                                                alt="Variation thumbnail"
                                            />
                                            <button
                                                type="button"
                                                className={cx('replace-image')}
                                                onClick={() =>
                                                    updateVariation(variationIndex, 'thumb', null)
                                                }
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={cx('upload-icon')}>+</div>
                                            <p>Drag & drop or click to upload thumbnail</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    handleVariationThumbChange(variationIndex, e)
                                                }
                                                className={cx('file-input')}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={cx('variation-images-section')}>
                                <h3 className={cx('variation-section-title')}>Additional Images</h3>

                                <div
                                    className={cx('variation-images-upload', {
                                        'drag-over': dragOver === `images-${variationIndex}`
                                    })}
                                    onDragOver={(e) =>
                                        handleDragOver(e, `images-${variationIndex}`)
                                    }
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, variationIndex, false)}
                                >
                                    <div className={cx('variation-images-grid')}>
                                        {variation.images &&
                                            variation.images.map((image, imageIndex) => (
                                                <div
                                                    key={imageIndex}
                                                    className={cx('variation-image-item')}
                                                >
                                                    <img
                                                        src={image.preview}
                                                        alt={`Variation ${variationIndex} image ${imageIndex}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={cx('remove-image')}
                                                        onClick={() =>
                                                            removeVariationImage(
                                                                variationIndex,
                                                                imageIndex
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}

                                        <div className={cx('add-variation-image')}>
                                            <span>+</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) =>
                                                    handleVariationImagesChange(variationIndex, e)
                                                }
                                                className={cx('file-input')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button type="button" className={cx('add-variation-btn')} onClick={addVariation}>
                <span className={cx('add-icon')}>+</span>
                Add New Variation
            </button>
        </div>
    );
}

export default ProductVariations;
