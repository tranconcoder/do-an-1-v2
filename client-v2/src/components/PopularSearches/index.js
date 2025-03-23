import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PopularSearches.module.scss';
import { useProducts } from '../../configs/ProductsData';
import WishlistButton from '../WishlistButton';

const cx = classNames.bind(styles);

// Format large numbers with commas
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

const PopularSearches = () => {
    const { getPopularProducts, addToCart } = useProducts();
    const popularProducts = getPopularProducts();

    const handleAddToCart = (productId, event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(productId, 1);
    };

    return (
        <section className={cx('popular-searches-section')}>
            <div className={cx('section-header')}>
                <div className={cx('header-content')}>
                    <div className={cx('title-container')}>
                        <h2 className={cx('section-title')}>Sản Phẩm Nổi Bật</h2>
                        <div className={cx('search-icon')}>🔍</div>
                    </div>
                    <p className={cx('section-subtitle')}>
                        Khám phá những sản phẩm bán chạy nhất được yêu thích
                    </p>
                </div>
                <div className={cx('trending-tag')}>
                    <span className={cx('trending-icon')}>📈</span>
                    <span>Bán chạy</span>
                </div>
            </div>

            <div className={cx('products-grid')}>
                {popularProducts.slice(0, 5).map((product, index) => (
                    <div className={cx('product-card')} key={product.id}>
                        <span className={cx('rank-badge')}>#{index + 1}</span>
                        <span className={cx('discount-badge')}>-{product.discount}%</span>
                        <Link
                            to={`/product/${product.slug}`}
                            className={cx('product-image-container')}
                        >
                            <img
                                src={product.thumbnail || product.images?.[0] || DEFAULT_IMAGE}
                                alt={product.name}
                                className={cx('product-image')}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_IMAGE;
                                }}
                            />
                        </Link>
                        <div className={cx('product-info')}>
                            <Link to={`/product/${product.slug}`} className={cx('product-name')}>
                                {product.name}
                            </Link>
                            <div className={cx('product-price-container')}>
                                <span className={cx('product-price')}>
                                    ${product.price.toFixed(2)}
                                </span>
                                <span className={cx('original-price')}>
                                    ${Number(product.originalPrice).toFixed(2)}
                                </span>
                            </div>
                            <div className={cx('sale-label')}>
                                <span className={cx('sale-icon')}>🔥</span>
                                <span className={cx('sale-text')}>GIẢM GIÁ</span>
                            </div>
                            <div className={cx('sold-count')}>
                                <span className={cx('sold-icon')}>🛒</span>
                                <span>{formatNumber(product.sold)} đã bán</span>
                            </div>
                            <div className={cx('product-actions')}>
                                <button
                                    className={cx('add-to-cart-btn')}
                                    onClick={(e) => handleAddToCart(product.id, e)}
                                >
                                    Thêm vào giỏ hàng
                                </button>
                                <WishlistButton productId={product.id} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('view-all-container')}>
                <Link to="/popular-products" className={cx('view-all-button')}>
                    Xem Tất Cả Sản Phẩm Nổi Bật
                    <span className={cx('arrow-icon')}>→</span>
                </Link>
            </div>
        </section>
    );
};

export default PopularSearches;
