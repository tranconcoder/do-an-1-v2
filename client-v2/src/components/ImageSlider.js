import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ImageSlider.module.scss';

// Import images from assets
import slide1 from '../assets/ecommerce1.jpg';
import slide2 from '../assets/ecommerce2.jpg';
import slide3 from '../assets/ecommerce3.jpg';

const cx = classNames.bind(styles);

function ImageSlider() {
    const images = [slide1, slide2, slide3];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sliding, setSliding] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const nextSlide = () => {
        if (sliding) return;

        setSliding(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

        // Reset sliding state after animation completes
        setTimeout(() => {
            setSliding(false);
        }, 600);
    };

    const prevSlide = () => {
        if (sliding) return;

        setSliding(true);
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));

        // Reset sliding state after animation completes
        setTimeout(() => {
            setSliding(false);
        }, 600);
    };

    const goToSlide = (index) => {
        if (sliding || index === currentIndex) return;

        setSliding(true);
        setCurrentIndex(index);

        // Reset sliding state after animation completes
        setTimeout(() => {
            setSliding(false);
        }, 600);
    };

    return (
        <div className={cx('slider-container')}>
            <div
                className={cx('slides-track')}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((src, index) => (
                    <div key={index} className={cx('slide')}>
                        <img src={src} alt={`E-commerce slide ${index + 1}`} />
                    </div>
                ))}
            </div>

            <button className={cx('arrow', 'prev')} onClick={prevSlide} aria-label="Previous slide">
                &#10094;
            </button>

            <button className={cx('arrow', 'next')} onClick={nextSlide} aria-label="Next slide">
                &#10095;
            </button>

            <div className={cx('indicators')}>
                {images.map((_, index) => (
                    <span
                        key={index}
                        className={cx('indicator', { active: index === currentIndex })}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
}

export default ImageSlider;
