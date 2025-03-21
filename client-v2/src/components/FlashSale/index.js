import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import classNames from 'classnames/bind';
import styles from './FlashSale.module.scss';

// Import swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const cx = classNames.bind(styles);

// Sample flash sale products - replace with your actual data
const flashSaleProducts = [
    {
        id: 1,
        name: 'Wireless Bluetooth Earbuds',
        originalPrice: 99.99,
        salePrice: 49.99,
        image: 'https://via.placeholder.com/300',
        slug: 'wireless-bluetooth-earbuds',
        stock: 50,
        sold: 30
    },
    {
        id: 2,
        name: 'Smart Watch Series 5',
        originalPrice: 199.99,
        salePrice: 129.99,
        image: 'https://via.placeholder.com/300',
        slug: 'smart-watch-series-5',
        stock: 100,
        sold: 85
    },
    {
        id: 3,
        name: 'Portable Bluetooth Speaker',
        originalPrice: 79.99,
        salePrice: 39.99,
        image: 'https://via.placeholder.com/300',
        slug: 'portable-bluetooth-speaker',
        stock: 75,
        sold: 45
    },
    {
        id: 4,
        name: 'Noise Cancelling Headphones',
        originalPrice: 149.99,
        salePrice: 89.99,
        image: 'https://via.placeholder.com/300',
        slug: 'noise-cancelling-headphones',
        stock: 60,
        sold: 42
    },
    {
        id: 5,
        name: 'Ultra HD 4K Action Camera',
        originalPrice: 249.99,
        salePrice: 149.99,
        image: 'https://via.placeholder.com/300',
        slug: 'ultra-hd-4k-action-camera',
        stock: 40,
        sold: 15
    }
    // Removed the last item to make room for view all
];

const FlashSale = () => {
    // Set end time for the flash sale (24 hours from now)
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59
    });

    // Update the countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prevTime) => {
                const newSeconds = prevTime.seconds - 1;

                if (newSeconds < 0) {
                    const newMinutes = prevTime.minutes - 1;

                    if (newMinutes < 0) {
                        const newHours = prevTime.hours - 1;

                        if (newHours < 0) {
                            // Flash sale ended - you could handle this by refreshing data or showing a message
                            clearInterval(interval);
                            return { hours: 0, minutes: 0, seconds: 0 };
                        }

                        return { hours: newHours, minutes: 59, seconds: 59 };
                    }

                    return { ...prevTime, minutes: newMinutes, seconds: 59 };
                }

                return { ...prevTime, seconds: newSeconds };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Calculate discount percentage
    const calculateDiscount = (original, sale) => {
        return Math.round(((original - sale) / original) * 100);
    };

    return (
        <section className={cx('flash-sale-section')}>
            <div className={cx('section-header')}>
                <div className={cx('header-content')}>
                    <div className={cx('title-container')}>
                        <h2 className={cx('section-title')}>Flash Sale</h2>
                        <div className={cx('flash-icon')}>⚡</div>
                    </div>
                    <p className={cx('section-subtitle')}>Incredible deals, limited time only!</p>
                </div>

                <div className={cx('countdown-container')}>
                    <p className={cx('ends-in')}>Ends in:</p>
                    <div className={cx('countdown')}>
                        <div className={cx('time-block')}>
                            <span className={cx('time-value')}>
                                {timeLeft.hours.toString().padStart(2, '0')}
                            </span>
                            <span className={cx('time-label')}>Hours</span>
                        </div>
                        <span className={cx('time-separator')}>:</span>
                        <div className={cx('time-block')}>
                            <span className={cx('time-value')}>
                                {timeLeft.minutes.toString().padStart(2, '0')}
                            </span>
                            <span className={cx('time-label')}>Mins</span>
                        </div>
                        <span className={cx('time-separator')}>:</span>
                        <div className={cx('time-block')}>
                            <span className={cx('time-value')}>
                                {timeLeft.seconds.toString().padStart(2, '0')}
                            </span>
                            <span className={cx('time-label')}>Secs</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('products-slider')}>
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    className={cx('swiper-container')}
                    breakpoints={{
                        // When window width is >= 640px
                        640: {
                            slidesPerView: 2
                        },
                        // When window width is >= 768px
                        768: {
                            slidesPerView: 3
                        },
                        // When window width is >= 1024px
                        1024: {
                            slidesPerView: 4
                        }
                    }}
                >
                    {flashSaleProducts.map((product) => (
                        <SwiperSlide key={product.id}>
                            <div className={cx('product-card')}>
                                <div className={cx('discount-badge')}>
                                    -{calculateDiscount(product.originalPrice, product.salePrice)}%
                                </div>
                                <Link
                                    to={`/product/${product.slug}`}
                                    className={cx('product-image-container')}
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={cx('product-image')}
                                    />
                                </Link>
                                <div className={cx('product-info')}>
                                    <Link
                                        to={`/product/${product.slug}`}
                                        className={cx('product-name')}
                                    >
                                        {product.name}
                                    </Link>
                                    <div className={cx('product-price')}>
                                        <span className={cx('sale-price')}>
                                            ${product.salePrice.toFixed(2)}
                                        </span>
                                        <span className={cx('original-price')}>
                                            ${product.originalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={cx('stock-progress')}>
                                        <div className={cx('progress-bar')}>
                                            <div
                                                className={cx('progress-fill')}
                                                style={{
                                                    width: `${
                                                        (product.sold / product.stock) * 100
                                                    }%`
                                                }}
                                            ></div>
                                        </div>
                                        <div className={cx('stock-text')}>
                                            <span>{product.sold} sold</span>
                                            <span>{product.stock - product.sold} left</span>
                                        </div>
                                    </div>
                                    <button className={cx('add-to-cart-btn')}>Add to Cart</button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

                    {/* View All Deals slide */}
                    <SwiperSlide>
                        <Link to="/flash-sale" className={cx('product-card', 'view-all-card')}>
                            <div className={cx('view-all-content')}>
                                <div className={cx('view-all-icon')}>
                                    <span>⚡</span>
                                </div>
                                <h3 className={cx('view-all-text')}>View All Deals</h3>
                                <p className={cx('view-all-subtext')}>See more amazing offers</p>
                            </div>
                        </Link>
                    </SwiperSlide>
                </Swiper>
            </div>

            {/* Removed the separate view more container since it's now in the slider */}
        </section>
    );
};

export default FlashSale;
