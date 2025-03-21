import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PopularSearches.module.scss';

const cx = classNames.bind(styles);

// Mock data for popular searched products - replace with actual API data in production
const popularProducts = [
    {
        id: 1,
        name: 'Wireless Noise Cancelling Headphones',
        price: 199.99,
        originalPrice: 299.99,
        image: 'https://via.placeholder.com/300',
        slug: 'wireless-noise-cancelling-headphones',
        soldCount: 1542,
        discountCode: 'AUDIO20'
    },
    {
        id: 2,
        name: '4K Smart LED TV 55-inch',
        price: 549.99,
        originalPrice: 699.99,
        image: 'https://via.placeholder.com/300',
        slug: '4k-smart-led-tv-55-inch',
        soldCount: 1238,
        discountCode: 'TV150'
    },
    {
        id: 3,
        name: 'Professional DSLR Camera with Lens',
        price: 899.99,
        originalPrice: 1199.99,
        image: 'https://via.placeholder.com/300',
        slug: 'professional-dslr-camera-with-lens',
        soldCount: 1075,
        discountCode: 'PHOTO25'
    },
    {
        id: 4,
        name: 'Ultra-thin Laptop 15.6" 16GB RAM',
        price: 1299.99,
        originalPrice: 1499.99,
        image: 'https://via.placeholder.com/300',
        slug: 'ultra-thin-laptop-16gb-ram',
        soldCount: 984,
        discountCode: 'LAPTOP200'
    },
    {
        id: 5,
        name: 'Premium Smartphone with Triple Camera',
        price: 799.99,
        originalPrice: 999.99,
        image: 'https://via.placeholder.com/300',
        slug: 'premium-smartphone-triple-camera',
        soldCount: 892,
        discountCode: 'PHONE100'
    },
    {
        id: 6,
        name: 'Air Purifier with HEPA Filter',
        price: 149.99,
        originalPrice: 199.99,
        image: 'https://via.placeholder.com/300',
        slug: 'air-purifier-hepa-filter',
        soldCount: 725,
        discountCode: 'CLEAN25'
    },
    {
        id: 7,
        name: 'Smart Watch with Heart Rate Monitor',
        price: 179.99,
        originalPrice: 229.99,
        image: 'https://via.placeholder.com/300',
        slug: 'smart-watch-heart-rate-monitor',
        soldCount: 681,
        discountCode: 'WATCH50'
    },
    {
        id: 8,
        name: 'Bluetooth Portable Speaker Waterproof',
        price: 89.99,
        originalPrice: 119.99,
        image: 'https://via.placeholder.com/300',
        slug: 'bluetooth-portable-speaker-waterproof',
        soldCount: 594,
        discountCode: 'SOUND30'
    },
    {
        id: 9,
        name: 'Robot Vacuum Cleaner with Mapping',
        price: 349.99,
        originalPrice: 449.99,
        image: 'https://via.placeholder.com/300',
        slug: 'robot-vacuum-cleaner-with-mapping',
        soldCount: 512,
        discountCode: 'ROBOT100'
    },
    {
        id: 10,
        name: 'Gaming Console Latest Edition',
        price: 499.99,
        originalPrice: 599.99,
        image: 'https://via.placeholder.com/300',
        slug: 'gaming-console-latest-edition',
        soldCount: 478,
        discountCode: 'GAME100'
    }
];

// Format large numbers with commas
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Calculate discount percentage
const calculateDiscount = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

const PopularSearches = () => {
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
                {popularProducts.map((product, index) => (
                    <div className={cx('product-card')} key={product.id}>
                        <span className={cx('rank-badge')}>#{index + 1}</span>
                        <span className={cx('discount-badge')}>
                            -{calculateDiscount(product.originalPrice, product.price)}%
                        </span>
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
                            <Link to={`/product/${product.slug}`} className={cx('product-name')}>
                                {product.name}
                            </Link>
                            <div className={cx('product-price-container')}>
                                <span className={cx('product-price')}>
                                    ${product.price.toFixed(2)}
                                </span>
                                <span className={cx('original-price')}>
                                    ${product.originalPrice.toFixed(2)}
                                </span>
                            </div>
                            <div className={cx('sale-label')}>
                                <span className={cx('sale-icon')}>🔥</span>
                                <span className={cx('sale-text')}>ON SALE</span>
                            </div>
                            <div className={cx('sold-count')}>
                                <span className={cx('sold-icon')}>🛒</span>
                                <span>{formatNumber(product.soldCount)} sold</span>
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
