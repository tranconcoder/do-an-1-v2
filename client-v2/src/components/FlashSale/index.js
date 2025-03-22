import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import classNames from 'classnames/bind';
import styles from './FlashSale.module.scss';
import { useProducts } from '../../configs/ProductsData';

// Import swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const cx = classNames.bind(styles);

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

const FlashSale = () => {
    const { getFlashSaleProducts, addToCart } = useProducts();
    const flashSaleProducts = getFlashSaleProducts();

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

    const handleAddToCart = (productId) => {
        addToCart(productId, 1);
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
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 }
                    }}
                >
                    {flashSaleProducts.map((product) => (
                        <SwiperSlide key={product.id}>
                            <div className={cx('product-card')}>
                                <div className={cx('discount-badge')}>-{product.discount}%</div>
                                <Link
                                    to={`/product/${product.slug}`}
                                    className={cx('product-image-container')}
                                >
                                    <img
                                        src={
                                            product.thumbnail ||
                                            product.images?.[0] ||
                                            DEFAULT_IMAGE
                                        }
                                        alt={product.name}
                                        className={cx('product-image')}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_IMAGE;
                                        }}
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
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <span className={cx('original-price')}>
                                            ${Number(product.originalPrice).toFixed(2)}
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
                                    <button
                                        className={cx('add-to-cart-btn')}
                                        onClick={() => handleAddToCart(product.id)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

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
        </section>
    );
};

export default FlashSale;
