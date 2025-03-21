'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import styles from './styles.module.scss';

// Move constants outside component to avoid recreating on each render
const BANNER_IMAGES = ['/qc1.webp', '/qc2.jpg'];
const VIDEO_URLS = [
    'https://www.youtube.com/embed/xv9UmH3RsX0?si=KI76NTiTHvb-t5Vc',
    'https://www.youtube.com/embed/mRApZVPSsps?si=eI2jtTt4vGWKPcrf'
];
const CAROUSEL_INTERVAL = 3000;

// Memoized video component to prevent unnecessary re-renders
const VideoPlayer = memo(({ url, index }: { url: string; index: number }) => (
    <div className={styles.videoContainer} key={index}>
        <iframe
            width="100%"
            height="100%"
            src={url}
            title={`YouTube video player ${index + 1}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        ></iframe>
    </div>
));

VideoPlayer.displayName = 'VideoPlayer';

const HomeSlider = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMouseOver, setIsMouseOver] = useState(false);

    const goToPreviousImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? BANNER_IMAGES.length - 1 : prevIndex - 1
        );
    }, []);

    const goToNextImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === BANNER_IMAGES.length - 1 ? 0 : prevIndex + 1
        );
    }, []);

    useEffect(() => {
        if (isMouseOver) return;
        
        const imageIntervalId = setInterval(goToNextImage, CAROUSEL_INTERVAL);
        return () => clearInterval(imageIntervalId);
    }, [goToNextImage, isMouseOver]);

    return (
        <div className={styles.homeSliderContainer}>
            <div
                className={styles.carouselContainer}
                onMouseEnter={() => setIsMouseOver(true)}
                onMouseLeave={() => setIsMouseOver(false)}
            >
                <Image
                    src={BANNER_IMAGES[currentImageIndex]}
                    alt={`Carousel Image ${currentImageIndex + 1}`}
                    width={700}
                    height={300}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    priority
                />
                <div className={styles.carouselButtons}>
                    <button onClick={goToPreviousImage} className={styles.carouselButton}>
                        <BsChevronLeft />
                    </button>
                    <button onClick={goToNextImage} className={styles.carouselButton}>
                        <BsChevronRight />
                    </button>
                </div>
            </div>

            <div className={styles.videoGrid}>
                {VIDEO_URLS.map((url, index) => (
                    <VideoPlayer url={url} index={index} key={index} />
                ))}
            </div>
        </div>
    );
};

export default memo(HomeSlider);
