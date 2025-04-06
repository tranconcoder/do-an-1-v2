import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ShopDetail.module.scss';
import axiosClient, { axiosNotAuthClient } from '../../configs/axios';

const cx = classNames.bind(styles);

// Default image fallback
const DEFAULT_LOGO = 'https://via.placeholder.com/100';
const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/250x200';

// API URL for media
const API_URL = 'https://localhost:4000';

function ShopDetail() {
    const { id } = useParams();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to get media URL
    const getMediaUrl = (mediaId) => {
        if (!mediaId) return null;
        return `${API_URL}/media/${mediaId}`;
    };

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);
                
                // Fetch shop information
                const shopResponse = await axiosNotAuthClient.get(`/user/shop/${id}`);
                
                if (shopResponse.data && shopResponse.data.metadata) {
                    setShop(shopResponse.data.metadata.shop);
                }
                
                // Fetch shop products
                const productsResponse = await axiosNotAuthClient.get(`/sku/shop/${id}`);
                
                if (productsResponse.data && productsResponse.data.metadata) {
                    setProducts(productsResponse.data.metadata);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching shop data:', err);
                setError('Failed to load shop information. Please try again later.');
                setLoading(false);
            }
        };

        if (id) {
            fetchShopData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className={cx('shop-detail-container')}>
                <div className={cx('loading')}>Loading shop information...</div>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className={cx('shop-detail-container')}>
                <div className={cx('error')}>{error || 'Shop not found'}</div>
                <Link to="/" className={cx('back-to-home')}>
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className={cx('shop-detail-container')}>
            <div className={cx('breadcrumb')}>
                <Link to="/">Home</Link> / <span>{shop.shop_name}</span>
            </div>

            <div className={cx('shop-header')}>
                <img
                    src={getMediaUrl(shop.shop_logo) || DEFAULT_LOGO}
                    alt={`${shop.shop_name} Logo`}
                    className={cx('shop-logo')}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_LOGO;
                    }}
                />
                <div className={cx('shop-info')}>
                    <h1 className={cx('shop-name')}>{shop.shop_name}</h1>
                    <div className={cx('shop-meta')}>
                        <div className={cx('shop-type')}>{shop.shop_type.toLowerCase()}</div>
                        <div className={cx('shop-status', shop.shop_status.toLowerCase())}>
                            {shop.shop_status}
                        </div>
                        {shop.is_brand && <div className={cx('shop-brand')}>Official Brand</div>}
                    </div>
                    <div className={cx('shop-contact')}>
                        <div className={cx('contact-item')}>
                            <span className={cx('icon')}>✉️</span>
                            <span>{shop.shop_email}</span>
                        </div>
                        <div className={cx('contact-item')}>
                            <span className={cx('icon')}>📞</span>
                            <span>{shop.shop_phoneNumber}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('shop-products')}>
                <h2 className={cx('section-title')}>Products from {shop.shop_name}</h2>

                {products.length > 0 ? (
                    <div className={cx('products-grid')}>
                        {products.map((product) => (
                            <Link
                                to={`/product/${product.sku._id}`}
                                key={product.sku._id}
                                className={cx('product-card')}
                            >
                                <img
                                    src={
                                        getMediaUrl(product.sku.sku_thumb) || DEFAULT_PRODUCT_IMAGE
                                    }
                                    alt={product.product_name}
                                    className={cx('product-image')}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_PRODUCT_IMAGE;
                                    }}
                                />
                                <div className={cx('product-content')}>
                                    <h3 className={cx('product-name')}>{product.product_name}</h3>
                                    <div className={cx('product-price')}>
                                        ${product.sku.sku_price.toLocaleString()}
                                    </div>
                                    <div className={cx('product-meta')}>
                                        <div className={cx('sku-info')}>
                                            {product.sku.sku_value.map((attr, index) => (
                                                <span key={index}>{attr.value}</span>
                                            ))}
                                        </div>
                                        <div className={cx('product-stock')}>
                                            {product.sku.sku_stock} in stock
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={cx('no-products')}>
                        This shop doesn't have any products yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShopDetail;