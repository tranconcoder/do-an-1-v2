import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PopularSearches.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

// Format large numbers with commas
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

const PopularSearches = () => {
    const { getPopularProducts } = useProducts();
    const popularProducts = getPopularProducts();

    return (
        <section className={cx('popular-searches-section')}>
            <div className={cx('section-header')}>
                <div className={cx('header-content')}>
                    <div className={cx('title-container')}>
                        <h2 className={cx('section-title')}>Most Popular Products</h2>
                        <div className={cx('search-icon')}>🔍</div>
                    </div>
                    <p className={cx('section-subtitle')}>
                        Discover our best-selling products loved by customers
                    </p>
                </div>
                <div className={cx('trending-tag')}>
                    <span className={cx('trending-icon')}>📈</span>
                    <span>Top sellers</span>
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
                                <span className={cx('sale-text')}>ON SALE</span>
                            </div>
                            <div className={cx('sold-count')}>
                                <span className={cx('sold-icon')}>🛒</span>
                                <span>{formatNumber(product.sold)} sold</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('view-all-container')}>
                <Link to="/popular-products" className={cx('view-all-button')}>
                    View All Popular Products
                    <span className={cx('arrow-icon')}>→</span>
                </Link>
            </div>
        </section>
    );
};

export default PopularSearches;
