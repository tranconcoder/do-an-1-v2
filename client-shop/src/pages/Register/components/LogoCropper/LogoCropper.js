import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import classNames from 'classnames/bind';
import styles from './LogoCropper.module.scss';

const cx = classNames.bind(styles);

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    // For tall images, focus on the top portion instead of the center
    const isTall = mediaHeight > mediaWidth * 1.5;

    const initialCrop = makeAspectCrop(
        {
            unit: '%',
            width: isTall ? 90 : 70 // Use larger width for tall images
        },
        aspect,
        mediaWidth,
        mediaHeight
    );

    // For very tall images, start crop near the top
    if (isTall) {
        initialCrop.y = 5; // Start 5% from the top
        return initialCrop;
    }

    // Otherwise, center the crop
    return centerCrop(initialCrop, mediaWidth, mediaHeight);
}

const LogoCropper = ({ imageUrl, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState();
    const imgRef = useRef(null);
    const cropAreaRef = useRef(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imgLoaded, setImgLoaded] = useState(false);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1 / 1)); // 1:1 aspect ratio for square
        setImgLoaded(true);
    }

    // Ensure crop area scrolls to show the crop region
    useEffect(() => {
        if (imgLoaded && cropAreaRef.current && crop) {
            const cropArea = cropAreaRef.current;
            // Give the browser a moment to render before scrolling
            setTimeout(() => {
                const scrollY = (crop.y / 100) * imgRef.current.height;
                cropArea.scrollTop = scrollY - 100; // Scroll to position the crop in view
            }, 100);
        }
    }, [imgLoaded, crop]);

    const handleCropComplete = () => {
        if (!completedCrop || !imgRef.current) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');

        // Set desired output resolution to a high-quality square
        const outputSize = 600; // Higher resolution for better quality
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Fill with white background to prevent transparency issues
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            outputSize,
            outputSize
        );

        // Convert to base64 string with high quality
        const base64Image = canvas.toDataURL('image/jpeg', 1.0);

        // Convert base64 to blob for file upload
        fetch(base64Image)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], 'cropped-logo.jpg', { type: 'image/jpeg' });
                onCropComplete(file, base64Image);
            });
    };

    return (
        <div className={cx('cropper-modal')}>
            <div className={cx('cropper-container')}>
                <h3>Crop Your Logo</h3>
                <p className={cx('instructions')}>
                    Create a square crop for your logo. This will help your shop logo look its best.
                </p>

                <div className={cx('crop-area')} ref={cropAreaRef}>
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop={false}
                    >
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imageUrl}
                            onLoad={onImageLoad}
                            className={cx('image-to-crop')}
                        />
                    </ReactCrop>
                </div>

                <div className={cx('buttons')}>
                    <button type="button" className={cx('cancel-btn')} onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className={cx('apply-btn')} onClick={handleCropComplete}>
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoCropper;
