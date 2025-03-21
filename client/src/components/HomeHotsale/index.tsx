'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { AiFillStar } from 'react-icons/ai';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import styles from './styles.module.scss';
import { throttle } from '@/utils/throttle';

// Constants
const SCROLL_INTERVAL = 3000;
const ITEM_WIDTH = 286;
const THROTTLE_LIMIT = 100;

// Move products data outside the component
const products = [
    {
        id: 1,
        name: 'iPhone 15 Pro 256GB',
        image: '/iphone.png',
        originalPrice: 32990000,
        discountedPrice: 29990000,
        discount: 9,
        installment: 0,
        rating: 4.7
    },
    {
        id: 2,
        name: 'Samsung Galaxy S24 Ultra',
        image: '/iphone1.png',
        originalPrice: 33990000,
        discountedPrice: 30990000,
        discount: 8,
        installment: 0,
        rating: 4.5
    },
    {
        id: 3,
        name: 'Xiaomi 14 Pro',
        image: '/iphone.png',
        originalPrice: 28990000,
        discountedPrice: 26990000,
        discount: 7,
        installment: 0,
        rating: 4.3
    },
    {
        id: 4,
        name: 'Oppo Find X7 Pro',
        image: '/iphone1.png',
        originalPrice: 29990000,
        discountedPrice: 27990000,
        discount: 6,
        installment: 0,
        rating: 4.0
    },
    {
        id: 5,
        name: 'Google Pixel 8 Pro',
        image: '/iphone.png',
        originalPrice: 31990000,
        discountedPrice: 29990000,
        discount: 5,
        installment: 0,
        rating: 3.9
    },
    {
        id: 6,
        name: 'Vivo X100 Pro',
        image: '/iphone1.png',
        originalPrice: 27990000,
        discountedPrice: 25990000,
        discount: 4,
        installment: 0,
        rating: 3.7
    },
    {
        id: 7,
        name: 'OnePlus 12',
        image: '/iphone.png',
        originalPrice: 26990000,
        discountedPrice: 24990000,
        discount: 3,
        installment: 0,
        rating: 3.5
    },
    {
        id: 8,
        name: 'Honor Magic6 Pro',
        image: '/iphone1.png',
        originalPrice: 25990000,
        discountedPrice: 23990000,
        discount: 2,
        installment: 0,
        rating: 3.3
    }
];

// Memoized Product Item component
const ProductItem = memo(
    ({
        product,
        onAddToCart,
        onBuyNow
    }: {
        product: (typeof products)[0];
        onAddToCart: (id: number) => void;
        onBuyNow: (id: number) => void;
    }) => (
        <div className={styles.productItem}>
            <div className={styles.discountLabel}>Giảm {product.discount}%</div>
            <div className={styles.installmentLabel}>Trả góp 0%</div>
            <div className={styles.imageContainer}>
                <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%'
                    }}
                />
            </div>

            <h3 className={styles.productName}>{product.name}</h3>
            <div className={styles.priceContainer}>
                <span className={styles.discountedPrice}>
                    {product.discountedPrice.toLocaleString('vi-VN')}₫
                </span>
                <span className={styles.originalPrice}>
                    {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
            </div>
            <p className={styles.description}>Trả góp 0% - Ưu đãi độc quyền</p>
            <div className={styles.rating}>
                {[...Array(5)].map((_, index) => (
                    <AiFillStar
                        key={index}
                        className={styles.star}
                        color={index < Math.floor(product.rating) ? '#ffc107' : '#ddd'}
                    />
                ))}
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.addToCartButton} onClick={() => onAddToCart(product.id)}>
                    Thêm vào giỏ hàng
                </button>
                <button className={styles.buyNowButton} onClick={() => onBuyNow(product.id)}>
                    Mua ngay
                </button>
            </div>
        </div>
    )
);

ProductItem.displayName = 'ProductItem';

// Countdown Timer component
const CountdownTimer = memo(
    ({
        countdown
    }: {
        countdown: { days: number; hours: number; minutes: number; seconds: number };
    }) => (
        <div className={styles.countdownTimer}>
            Kết thúc sau:{' '}
            <span>
                {String(countdown.days).padStart(2, '0')} :{' '}
                {String(countdown.hours).padStart(2, '0')} :{' '}
                {String(countdown.minutes).padStart(2, '0')} :{' '}
                {String(countdown.seconds).padStart(2, '0')}
            </span>
        </div>
    )
);

CountdownTimer.displayName = 'CountdownTimer';

const HomeHotsale = () => {
    const productListRef = useRef<HTMLDivElement>(null);
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Calculate the target date once instead of on every render
    const getTargetDate = useCallback(() => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(9, 49, 5, 0);
        return targetDate;
    }, []);

    useEffect(() => {
        const targetDate = getTargetDate();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return false;
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setCountdown({ days, hours, minutes, seconds });
                return true;
            }
        };

        // Update immediately and then set interval
        if (!updateCountdown()) return;
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [getTargetDate]);

    const goToPreviousProduct = useCallback(() => {
        if (!productListRef.current) return;
        productListRef.current.scrollLeft -= ITEM_WIDTH;
    }, []);

    const goToNextProduct = useCallback(() => {
        if (!productListRef.current) return;
        productListRef.current.scrollLeft += ITEM_WIDTH;
    }, []);

    // Create throttled scroll function once
    const throttledScroll = useCallback(
        throttle((newScrollLeft: number) => {
            if (productListRef.current) {
                productListRef.current.scrollLeft = newScrollLeft;
            }
        }, THROTTLE_LIMIT),
        []
    );

    useEffect(() => {
        const autoScroll = () => {
            if (!productListRef.current) return;

            const { scrollWidth, clientWidth, scrollLeft } = productListRef.current;

            if (scrollLeft + clientWidth >= scrollWidth - 1) {
                productListRef.current.scrollLeft = 0;
            } else {
                throttledScroll(scrollLeft + ITEM_WIDTH);
            }
        };

        const intervalId = setInterval(autoScroll, SCROLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [throttledScroll]);

    const handleAddToCart = useCallback((productId: number) => {
        console.log(`Added product with ID ${productId} to cart`);
    }, []);

    const handleBuyNow = useCallback((productId: number) => {
        console.log(`Buy now product with ID ${productId}`);
    }, []);

    return (
        <div className={styles.hotsaleSection}>
            <h2 className={styles.hotsaleTitle}>Hotsale cuối tuần</h2>
            <CountdownTimer countdown={countdown} />

            <div className={styles.productListContainer}>
                <button className={styles.productScrollButton} onClick={goToPreviousProduct}>
                    <BsChevronLeft />
                </button>
                <div className={styles.productList} ref={productListRef}>
                    {products.map((product) => (
                        <ProductItem
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                        />
                    ))}
                </div>
                <button className={styles.productScrollButton} onClick={goToNextProduct}>
                    <BsChevronRight />
                </button>
            </div>
        </div>
    );
};

export default memo(HomeHotsale);
