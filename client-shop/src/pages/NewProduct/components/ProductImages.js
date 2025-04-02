import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../NewProduct.module.scss';
import { FaUpload, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const cx = classNames.bind(styles);

function ProductImages({ formData, setFormData }) {
    const [errors, setErrors] = useState({
        thumbnail: '',
        additionalImages: ''
    });

    const validateThumbnail = (thumb) => {
        if (!thumb) {
            setErrors((prev) => ({ ...prev, thumbnail: 'Thumbnail image is required' }));
            return false;
        }
        setErrors((prev) => ({ ...prev, thumbnail: '' }));
        return true;
    };

    const validateAdditionalImages = (images) => {
        if (!images || images.length < 3) {
            setErrors((prev) => ({
                ...prev,
                additionalImages: 'At least 3 additional images are required'
            }));
            return false;
        }
        setErrors((prev) => ({ ...prev, additionalImages: '' }));
        return true;
    };

    const handleThumbUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const newThumb = {
                file,
                preview: reader.result,
                name: file.name
            };
            setFormData((prev) => ({
                ...prev,
                product_thumb: newThumb
            }));
            validateThumbnail(newThumb);
        };
        reader.readAsDataURL(file);
    };

    const handleImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newImages = files.map((file) => {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = () => {
                    resolve({
                        file,
                        preview: reader.result,
                        name: file.name
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newImages).then((images) => {
            const updatedImages = [...formData.product_images, ...images];
            setFormData((prev) => ({
                ...prev,
                product_images: updatedImages
            }));
            validateAdditionalImages(updatedImages);
        });
    };

    const removeImage = (indexToRemove) => {
        const updatedImages = formData.product_images.filter((_, index) => index !== indexToRemove);
        setFormData((prev) => ({
            ...prev,
            product_images: updatedImages
        }));
        validateAdditionalImages(updatedImages);
    };

    const removeThumbnail = () => {
        setFormData((prev) => ({ ...prev, product_thumb: null }));
        validateThumbnail(null);
    };

    return (
        <div className={cx('form-section')}>
            <h2>Product Images</h2>

            {/* Thumbnail Section */}
            <div className={cx('form-group')}>
                <label>
                    Thumbnail <span className={cx('required-mark')}>*</span>
                </label>
                <div className={cx('upload-box', { 'error-border': errors.thumbnail })}>
                    <input
                        type="file"
                        className={cx('file-input')}
                        onChange={handleThumbUpload}
                        accept="image/*"
                        required
                    />
                    <div className={cx('upload-placeholder')}>
                        <FaUpload className={cx('upload-icon')} />
                        <span>Upload Thumbnail</span>
                    </div>
                </div>

                {errors.thumbnail && (
                    <div className={cx('error-message')}>
                        <FaExclamationTriangle /> {errors.thumbnail}
                    </div>
                )}

                {formData.product_thumb && (
                    <div className={cx('image-preview', 'thumbnail-preview')}>
                        <img src={formData.product_thumb.preview} alt="Thumbnail Preview" />
                        <button
                            type="button"
                            className={cx('remove-image')}
                            onClick={removeThumbnail}
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}
            </div>

            {/* Additional Images Section */}
            <div className={cx('form-group')}>
                <label>
                    Additional Images <span className={cx('required-mark')}>*</span>
                    <small> (At least 3 images)</small>
                </label>
                <div className={cx('upload-box', { 'error-border': errors.additionalImages })}>
                    <input
                        type="file"
                        className={cx('file-input')}
                        multiple
                        onChange={handleImagesUpload}
                        accept="image/*"
                    />
                    <div className={cx('upload-placeholder')}>
                        <FaUpload className={cx('upload-icon')} />
                        <span>Upload Additional Images</span>
                    </div>
                </div>

                {errors.additionalImages && (
                    <div className={cx('error-message')}>
                        <FaExclamationTriangle /> {errors.additionalImages}
                    </div>
                )}

                <div className={cx('additional-images-counter')}>
                    {formData.product_images.length} of 3 required images
                </div>

                <div className={cx('additional-images-container')}>
                    <div className={cx('additional-images-grid')}>
                        {formData.product_images.map((image, index) => (
                            <div key={index} className={cx('additional-image-preview')}>
                                <img src={image.preview} alt={`Image ${index + 1}`} />
                                <button
                                    type="button"
                                    className={cx('remove-image')}
                                    onClick={() => removeImage(index)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductImages;
