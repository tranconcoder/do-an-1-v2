import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ImagePreviewModal.module.scss';

const cx = classNames.bind(styles);

function ImagePreviewModal({ image, onClose, onReplace }) {
    const fileInputRef = useRef(null);
    const imageContainerRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showZoomIndicator, setShowZoomIndicator] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        // Add event listener to close modal on ESC key
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        // Prevent body scrolling while modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    // Set up wheel event with { passive: false } to allow preventDefault()
    useEffect(() => {
        const container = imageContainerRef.current;
        if (!container) return;

        // Handle mouse wheel for zooming
        const handleWheel = (e) => {
            e.preventDefault();

            // Determine zoom direction based on wheel delta
            const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2;
            // Allow higher zoom levels for fullscreen experience
            const newZoomLevel = Math.max(0.5, Math.min(5, zoomLevel + zoomDelta));

            // Set full screen mode when zoomed in
            setIsFullscreen(newZoomLevel > 1);
            setZoomLevel(newZoomLevel);

            // Show zoom indicator
            setShowZoomIndicator(true);
            clearTimeout(window.zoomTimeout);
            window.zoomTimeout = setTimeout(() => {
                setShowZoomIndicator(false);
            }, 1000);
        };

        // Add wheel event listener with { passive: false } option to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false });

        // Clean up
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [zoomLevel]);

    // Reset position when zoom level changes to 1
    useEffect(() => {
        if (zoomLevel === 1) {
            setPosition({ x: 0, y: 0 });
            setIsFullscreen(false);
        }
    }, [zoomLevel]);

    const handleReplaceClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log(file);
        if (file) {
            onReplace(file);
            onClose();
        }
    };

    // Reset zoom on double click
    const handleDoubleClick = () => {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
        setIsFullscreen(false);
        setShowZoomIndicator(true);
        clearTimeout(window.zoomTimeout);
        window.zoomTimeout = setTimeout(() => {
            setShowZoomIndicator(false);
        }, 1000);
    };

    // Start dragging
    const handleMouseDown = (e) => {
        // Only enable dragging when zoomed in
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    // Handle dragging
    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            // Calculate new position based on mouse movement
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // For fullscreen zooming, we allow more liberal movement
            // The boundaries are expanded based on zoom level
            const maxOffset = (zoomLevel - 1) * 500;

            const boundedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
            const boundedY = Math.max(-maxOffset, Math.min(maxOffset, newY));

            setPosition({ x: boundedX, y: boundedY });
        }
    };

    // End dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Also handle mouse leave to prevent sticky dragging
    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    // Close if clicking outside the image
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Determine the cursor style based on zoom level and dragging state
    const getCursorStyle = () => {
        if (zoomLevel > 1) {
            return isDragging ? 'grabbing' : 'grab';
        }
        return 'zoom-in';
    };

    return (
        <div className={cx('modalOverlay')} onClick={handleOverlayClick}>
            <div className={cx('modalContent', { fullscreen: isFullscreen })}>
                <button className={cx('closeButton')} onClick={onClose}>
                    ×
                </button>
                <div
                    ref={imageContainerRef}
                    className={cx('imageContainer', { zoomed: zoomLevel > 1 })}
                    onDoubleClick={handleDoubleClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: getCursorStyle() }}
                >
                    <img
                        src={typeof image === 'string' ? image : image.preview}
                        alt="Preview"
                        className={cx('previewImage', { zoomed: zoomLevel > 1 })}
                        style={{
                            transform: `scale(${zoomLevel}) translate(${
                                position.x / zoomLevel
                            }px, ${position.y / zoomLevel}px)`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                        draggable="false"
                    />
                    {showZoomIndicator && (
                        <div className={cx('zoomIndicator')}>{Math.round(zoomLevel * 100)}%</div>
                    )}
                </div>
                <div className={cx('zoomInstructions', { fullscreen: isFullscreen })}>
                    <span>Scroll to zoom • Double-click to reset • Drag to move when zoomed</span>
                </div>
                <div className={cx('actionButtons')}>
                    <button className={cx('replaceButton')} onClick={handleReplaceClick}>
                        Replace Image
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className={cx('fileInput')}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default ImagePreviewModal;
