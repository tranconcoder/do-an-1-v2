import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './FlashSale.module.scss';
import { useProducts } from '../../configs/ProductsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faBolt,
    faFire,
    faStopwatch,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import WishlistButton from '../WishlistButton';

const cx = classNames.bind(styles);

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

// Add helper function for VND formatting
const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(price * 23000)) + '₫';
};

function FlashSale() {
    const { getFlashSaleProducts, addToCart } = useProducts();
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [timeLeft, setTimeLeft] = useState({
        hours: 5,
        minutes: 59,
        seconds: 59
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState('next');
    const productsPerPage = 5;
    const slideRef = useRef(null);

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

    // Get current products to display based on pagination
    const getCurrentProducts = () => {
        const startIndex = currentPage * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        return flashSaleProducts.slice(startIndex, endIndex);
    };

    // Handle navigation between pages with animation
    const handleNextPage = () => {
        if ((currentPage + 1) * productsPerPage < flashSaleProducts.length && !isAnimating) {
            setAnimationDirection('next');
            setIsAnimating(true);

            setTimeout(() => {
                setCurrentPage(currentPage + 1);
                setTimeout(() => setIsAnimating(false), 50);
            }, 300);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0 && !isAnimating) {
            setAnimationDirection('prev');
            setIsAnimating(true);

            setTimeout(() => {
                setCurrentPage(currentPage - 1);
                setTimeout(() => setIsAnimating(false), 50);
            }, 300);
        }
    };

    // Handle dot navigation
    const handleDotClick = (pageIndex) => {
        if (pageIndex !== currentPage && !isAnimating) {
            setAnimationDirection(pageIndex > currentPage ? 'next' : 'prev');
            setIsAnimating(true);

            setTimeout(() => {
                setCurrentPage(pageIndex);
                setTimeout(() => setIsAnimating(false), 50);
            }, 300);
        }
    };

    // Calculate total pages
    const totalPages = Math.ceil(flashSaleProducts.length / productsPerPage);

    if (flashSaleProducts.length === 0) {
        return null;
    }

    return (
        <section className={cx('flash-sale-section')}>
            <div className={cx('flash-sale-header')}>
                <div className={cx('title-container')}>
                    <FontAwesomeIcon icon={faBolt} className={cx('flash-icon')} />
                    <h2 className={cx('section-title')}>Khuyến Mãi Sốc</h2>
                    <span className={cx('fire-icon')}>
                        <FontAwesomeIcon icon={faFire} />
                    </span>
                </div>
                <div className={cx('countdown-container')}>
                    <FontAwesomeIcon icon={faStopwatch} className={cx('clock-icon')} />
                    <div className={cx('countdown')}>
                        <div className={cx('time-block')}>
                            <span className={cx('time')}>{formatTime(timeLeft.hours)}</span>
                            <span className={cx('label')}>Giờ</span>
                        </div>
                        <span className={cx('separator')}>:</span>
                        <div className={cx('time-block')}>
                            <span className={cx('time')}>{formatTime(timeLeft.minutes)}</span>
                            <span className={cx('label')}>Phút</span>
                        </div>
                        <span className={cx('separator')}>:</span>
                        <div className={cx('time-block')}>
                            <span className={cx('time')}>{formatTime(timeLeft.seconds)}</span>
                            <span className={cx('label')}>Giây</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('flash-sale-container')}>
                {totalPages > 1 && (
                    <button
                        className={cx('nav-button', 'prev', {
                            disabled: currentPage === 0 || isAnimating
                        })}
                        onClick={handlePrevPage}
                        disabled={currentPage === 0 || isAnimating}
                        aria-label="Sản phẩm trước"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                )}

                <div className={cx('flash-sale-products-wrapper')}>
                    <div
                        ref={slideRef}
                        className={cx(
                            'flash-sale-products',
                            { animating: isAnimating },
                            { 'slide-next': animationDirection === 'next' && isAnimating },
                            { 'slide-prev': animationDirection === 'prev' && isAnimating }
                        )}
                    >
                        {getCurrentProducts().map((product) => (
                            <div className={cx('flash-sale-item')} key={product.id}>
                                <Link
                                    to={`/product/${product.slug}`}
                                    className={cx('product-link')}
                                >
                                    <div className={cx('discount-badge')}>-{product.discount}%</div>
                                    <div className={cx('image-container')}>
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
                                    </div>
                                    <div className={cx('product-info')}>
                                        <h3 className={cx('product-name')}>{product.name}</h3>
                                        <div className={cx('price-container')}>
                                            <span className={cx('sale-price')}>
                                                {formatVND(product.price)}
                                            </span>
                                            <span className={cx('original-price')}>
                                                {formatVND(Number(product.originalPrice))}
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
                                            <span className={cx('sold-text')}>
                                                {product.sold} đã bán
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                <div className={cx('product-actions')}>
                                    <button
                                        className={cx('buy-now-btn')}
                                        onClick={(e) => handleAddToCart(product.id, e)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faShoppingCart}
                                            className={cx('cart-icon')}
                                        />
                                        Mua Ngay
                                    </button>
                                    <WishlistButton productId={product.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {totalPages > 1 && (
                    <button
                        className={cx('nav-button', 'next', {
                            disabled:
                                (currentPage + 1) * productsPerPage >= flashSaleProducts.length ||
                                isAnimating
                        })}
                        onClick={handleNextPage}
                        disabled={
                            (currentPage + 1) * productsPerPage >= flashSaleProducts.length ||
                            isAnimating
                        }
                        aria-label="Sản phẩm tiếp theo"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                )}
            </div>

            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            className={cx('page-dot', {
                                active: index === currentPage,
                                animating:
                                    isAnimating &&
                                    ((animationDirection === 'next' &&
                                        (index === currentPage || index === currentPage + 1)) ||
                                        (animationDirection === 'prev' &&
                                            (index === currentPage || index === currentPage - 1)))
                            })}
                            onClick={() => handleDotClick(index)}
                            aria-label={`Đến trang ${index + 1}`}
                            disabled={isAnimating}
                        />
                    ))}
                </div>
            )}

            <div className={cx('view-more-container')}>
                <Link to="/flash-sale" className={cx('view-more-btn')}>
                    Xem Tất Cả
                </Link>
            </div>
        </section>
    );
}

export default FlashSale;
