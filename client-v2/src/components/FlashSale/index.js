import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './FlashSale.module.scss';
import { useProducts } from '../../configs/ProductsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBolt, faFire, faStopwatch } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

function FlashSale() {
    const { getFlashSaleProducts, addToCart } = useProducts();
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [timeLeft, setTimeLeft] = useState({
        hours: 5,
        minutes: 59,
        seconds: 59
    });

    // Get flash sale products
    useEffect(() => {
        setFlashSaleProducts(getFlashSaleProducts());
    }, [getFlashSaleProducts]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newSeconds = prev.seconds - 1;
                if (newSeconds >= 0) {
                    return { ...prev, seconds: newSeconds };
                }

                const newMinutes = prev.minutes - 1;
                if (newMinutes >= 0) {
                    return { ...prev, minutes: newMinutes, seconds: 59 };
                }

                const newHours = prev.hours - 1;
                if (newHours >= 0) {
                    return { hours: newHours, minutes: 59, seconds: 59 };
                }

                // Reset timer when it reaches 0
                return { hours: 5, minutes: 59, seconds: 59 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleAddToCart = (productId, event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(productId, 1);
    };

    // Format time with leading zeros
    const formatTime = (time) => {
        return time < 10 ? `0${time}` : time;
    };

    if (flashSaleProducts.length === 0) {
        return null;
    }

    return (
        <section className={cx('flash-sale-section')}>
            <div className={cx('flash-sale-header')}>
                <div className={cx('title-container')}>
                    <FontAwesomeIcon icon={faBolt} className={cx('flash-icon')} />
                    <h2 className={cx('section-title')}>Flash Sale</h2>
                    <span className={cx('fire-icon')}>
                        <FontAwesomeIcon icon={faFire} />
                    </span>
                </div>
                <div className={cx('countdown-container')}>
                    <FontAwesomeIcon icon={faStopwatch} className={cx('clock-icon')} />
                    <div className={cx('countdown')}>
                        <div className={cx('time-block')}>
                            <span className={cx('time')}>{formatTime(timeLeft.hours)}</span>
                            <span className={cx('label')}>Hours</span>
                        </div>
                        <span className={cx('separator')}>:</span>
                        <div className={cx('time-block')}>
                            <span className={cx('time')}>{formatTime(timeLeft.minutes)}</span>
                            <span className={cx('label')}>Mins</span>
                        </div>
                        <span className={cx('separator')}>:</span>
                        <div className={cx('time-block')}>
                            <span className={cx('time')}>{formatTime(timeLeft.seconds)}</span>
                            <span className={cx('label')}>Secs</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('flash-sale-products')}>
                {flashSaleProducts.slice(0, 5).map((product) => (
                    <div className={cx('flash-sale-item')} key={product.id}>
                        <Link to={`/product/${product.slug}`} className={cx('product-link')}>
                            <div className={cx('discount-badge')}>-{product.discount}%</div>
                            <div className={cx('image-container')}>
                                <img
                                    src={product.thumbnail || product.images?.[0] || DEFAULT_IMAGE}
                                    alt={product.name}
                                    className={cx('product-image')}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_IMAGE;
                                    }}
                                />
                            </div>
                            <div className={cx('product-info')}>
                                <h3 className={cx('product-name')}>{product.name}</h3>
                                <div className={cx('price-container')}>
                                    <span className={cx('sale-price')}>
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <span className={cx('original-price')}>
                                        ${Number(product.originalPrice).toFixed(2)}
                                    </span>
                                </div>
                                <div className={cx('progress-container')}>
                                    <div className={cx('progress-bar')}>
                                        <div
                                            className={cx('progress')}
                                            style={{
                                                width: `${Math.floor(
                                                    (product.sold /
                                                        (product.sold + product.stock)) *
                                                        100
                                                )}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className={cx('sold-text')}>{product.sold} sold</span>
                                </div>
                            </div>
                        </Link>
                        {/* New Buy Button */}
                        <button
                            className={cx('buy-now-btn')}
                            onClick={(e) => handleAddToCart(product.id, e)}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} className={cx('cart-icon')} />
                            Buy Now
                        </button>
                    </div>
                ))}
            </div>

            <div className={cx('view-more-container')}>
                <Link to="/flash-sale" className={cx('view-more-btn')}>
                    View All Flash Deals
                </Link>
            </div>
        </section>
    );
}

export default FlashSale;
