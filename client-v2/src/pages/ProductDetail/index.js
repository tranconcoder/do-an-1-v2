import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';
import axios from 'axios';
import { API_URL } from '../../configs/env.config';
import { getMediaUrl } from '../../utils/media.util';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import {
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaMapMarkerAlt,
    FaCrown,
    FaStore,
    FaHeart
} from 'react-icons/fa';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariation, setSelectedVariation] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState(null);
    const thumbnailsRef = useRef(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [images, setImages] = useState([]);
    const [shopInfo, setShopInfo] = useState(null);

    const filterUniqueImages = (skuData) => {
        if (!skuData) return [];
        const allImages = [];
        
        // 1. Product thumb
        if (skuData.spu_select.product_thumb) {
            allImages.push(getMediaUrl(skuData.spu_select.product_thumb));
        }
        
        // 2. Product images
        if (skuData.spu_select.product_images) {
            allImages.push(...skuData.spu_select.product_images.map(img => getMediaUrl(img)));
        }
        
        // 3. Current SKU thumb
        if (skuData.sku_thumb) {
            allImages.push(getMediaUrl(skuData.sku_thumb));
        }
        
        // 4. Current SKU images
        if (skuData.sku_images) {
            allImages.push(...skuData.sku_images.map(img => getMediaUrl(img)));
        }

        // 5. Other SKUs thumbs and images in sequence
        if (skuData.sku_others) {
            skuData.sku_others.forEach(sku => {
                // Add thumb first
                if (sku.sku_thumb) {
                    allImages.push(getMediaUrl(sku.sku_thumb));
                }
                // Then add all images for this SKU
                if (sku.sku_images) {
                    allImages.push(...sku.sku_images.map(img => getMediaUrl(img)));
                }
            });
        }

        // Remove duplicates while preserving order
        return [...new Set(allImages.filter(img => img))];
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${API_URL}/sku/${id}`);
                if (response.data.statusCode === 200) {
                    const skuData = response.data.metadata[0];
                    setProduct(skuData);

                    // Fetch shop info
                    try {
                        const shopResponse = await axios.get(
                            `${API_URL}/user/shop/${skuData.spu_select.product_shop}`
                        );
                        if (shopResponse.data.statusCode === 200) {
                            setShopInfo(shopResponse.data.metadata.shop);
                        }
                    } catch (shopErr) {
                        console.error('Error fetching shop info:', shopErr);
                    }

                    // Process images
                    const processedImages = filterUniqueImages(skuData);
                    setImages(processedImages);

                    // Set initial selected image
                    if (processedImages.length > 0) {
                        setSelectedImage(processedImages[0]);
                    }

                    // Set initial variation selection based on sku_tier_idx
                    const initialVariations = {};
                    if (skuData.spu_select.product_variations) {
                        skuData.sku_tier_idx.forEach((idx, i) => {
                            const variation = skuData.spu_select.product_variations[i];
                            if (variation) {
                                initialVariations[variation.variation_name] =
                                    variation.variation_values[idx];
                            }
                        });
                    }
                    setSelectedVariation(initialVariations);
                } else {
                    setError('Failed to fetch product details');
                }
            } catch (err) {
                setError('An error occurred while fetching product details');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= product?.sku_stock) {
            setQuantity(newQuantity);
        }
    };

    const handleVariationChange = (variationName, value) => {
        setSelectedVariation((prev) => ({
            ...prev,
            [variationName]: value
        }));
    };

    const handleScrollThumbnails = (direction) => {
        if (thumbnailsRef.current) {
            const scrollAmount = 100;
            const newScrollLeft =
                thumbnailsRef.current.scrollLeft +
                (direction === 'left' ? -scrollAmount : scrollAmount);
            thumbnailsRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const handlePrevImage = () => {
        const currentIndex = images.indexOf(selectedImage);
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setSelectedImage(images[newIndex]);
    };

    const handleNextImage = () => {
        const currentIndex = images.indexOf(selectedImage);
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setSelectedImage(images[newIndex]);
    };

    // Add keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (isZoomed) {
                if (e.key === 'ArrowLeft') {
                    handlePrevImage();
                } else if (e.key === 'ArrowRight') {
                    handleNextImage();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isZoomed, selectedImage, images]);

    if (loading) return <div className={cx('loading')}>Loading...</div>;
    if (error || !product) return <div className={cx('error')}>{error || 'Product not found'}</div>;

    const { spu_select: spu, category } = product;

    return (
        <div className={cx('product-detail-container')}>
            <div className={cx('breadcrumb')}>
                <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{' '}
                <Link to={`/category/${category[0]?._id}`}>{category[0]?.category_name}</Link>
            </div>

            <div className={cx('product-main')}>
                <div className={cx('product-gallery')}>
                    <div className={cx('main-image-container')}>
                        <div className={cx('zoom-hint')}>
                            <FaSearch /> Click to zoom
                        </div>
                        <Zoom
                            openText="Open full image"
                            closeText="Close full image"
                            zoomMargin={40}
                            onZoomChange={(shouldZoom) => setIsZoomed(shouldZoom)}
                        >
                            <img
                                src={selectedImage || images[0]}
                                alt={spu.product_name}
                                className={cx('main-image')}
                            />
                        </Zoom>
                        {isZoomed && (
                            <>
                                <button
                                    className={cx('zoom-nav-button', 'prev')}
                                    onClick={handlePrevImage}
                                    aria-label="Previous image"
                                >
                                    <FaChevronLeft />
                                </button>
                                <button
                                    className={cx('zoom-nav-button', 'next')}
                                    onClick={handleNextImage}
                                    aria-label="Next image"
                                >
                                    <FaChevronRight />
                                </button>
                            </>
                        )}
                        {product.sku_discount > 0 && (
                            <div className={cx('discount-badge')}>-{product.sku_discount}%</div>
                        )}
                    </div>
                    <div className={cx('thumbnails-container')}>
                        <button
                            className={cx('scroll-button', 'left')}
                            onClick={() => handleScrollThumbnails('left')}
                            aria-label="Scroll left"
                        >
                            ‹
                        </button>
                        <div className={cx('thumbnails')} ref={thumbnailsRef}>
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={cx('thumbnail', {
                                        active: selectedImage === image
                                    })}
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image}
                                        alt={`${spu.product_name} view ${index + 1}`}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            className={cx('scroll-button', 'right')}
                            onClick={() => handleScrollThumbnails('right')}
                            aria-label="Scroll right"
                        >
                            ›
                        </button>
                    </div>
                </div>

                <div className={cx('product-info')}>
                    <div className={cx('product-header')}>
                        <h1 className={cx('product-name')}>{spu.product_name}</h1>
                        <div className={cx('product-meta')}>
                            <div className={cx('product-ratings')}>
                                <span className={cx('stars')}>★★★★★</span>
                                <span>{spu.product_rating_avg || 0}/5</span>
                            </div>
                        </div>

                        <div className={cx('product-shop-section')}>
                            <Link to={`/shop/${spu.product_shop}`} className={cx('shop-link')}>
                                {shopInfo?.shop_logo && (
                                    <img
                                        src={getMediaUrl(shopInfo.shop_logo)}
                                        alt={shopInfo.shop_name}
                                        className={cx('shop-logo')}
                                    />
                                )}
                                <div className={cx('shop-info')}>
                                    <h3 className={cx('shop-name')}>{shopInfo?.shop_name}</h3>
                                    <div className={cx('shop-details')}>
                                        <div className={cx('location')}>
                                            <FaMapMarkerAlt />
                                            <span>
                                                {shopInfo?.shop_location?.province?.province_name},
                                                {shopInfo?.shop_location?.district?.district_name}
                                            </span>
                                        </div>
                                        {shopInfo?.is_brand && (
                                            <span className={cx('brand-badge')}>
                                                <FaCrown /> Thương hiệu
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>

                            <div className={cx('shop-stats')}>
                                <div className={cx('stat-item')}>
                                    <span className={cx('stat-value')}>95%</span>
                                    <span className={cx('stat-label')}>Phản hồi</span>
                                </div>
                                <div className={cx('stat-item')}>
                                    <span className={cx('stat-value')}>~2h</span>
                                    <span className={cx('stat-label')}>Thời gian phản hồi</span>
                                </div>
                                <div className={cx('stat-item')}>
                                    <span className={cx('stat-value')}>4.9/5</span>
                                    <span className={cx('stat-label')}>Đánh giá Shop</span>
                                </div>
                            </div>

                            <div className={cx('shop-actions')}>
                                <Link
                                    to={`/shop/${spu.product_shop}`}
                                    className={cx('action-btn', 'view-shop')}
                                >
                                    <FaStore /> Xem Shop
                                </Link>
                                <button className={cx('action-btn', 'follow-shop')}>
                                    <FaHeart /> Theo dõi
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={cx('product-price-container')}>
                        <span className={cx('current-price')}>
                            ${product.sku_price.toLocaleString()}
                        </span>
                        {product.sku_discount > 0 && (
                            <span className={cx('original-price')}>
                                $
                                {(
                                    product.sku_price /
                                    (1 - product.sku_discount / 100)
                                ).toLocaleString()}
                            </span>
                        )}
                    </div>

                    {spu.product_variations?.length > 0 && (
                        <div className={cx('product-options')}>
                            {spu.product_variations.map((variation, idx) => (
                                <div key={idx} className={cx('option-group')}>
                                    <label className={cx('option-label')}>
                                        {variation.variation_name}:
                                    </label>
                                    <div className={cx('color-options')}>
                                        {variation.variation_values.map((value, valueIdx) => (
                                            <button
                                                key={valueIdx}
                                                className={cx('color-option', {
                                                    selected:
                                                        selectedVariation[
                                                            variation.variation_name
                                                        ] === value
                                                })}
                                                onClick={() =>
                                                    handleVariationChange(
                                                        variation.variation_name,
                                                        value
                                                    )
                                                }
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={cx('product-actions')}>
                        <div className={cx('quantity-selector')}>
                            <button
                                className={cx('quantity-btn')}
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className={cx('quantity-value')}>{quantity}</span>
                            <button
                                className={cx('quantity-btn')}
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= product.sku_stock}
                            >
                                +
                            </button>
                        </div>
                        <div className={cx('stock-info')}>
                            {product.sku_stock > 0 ? (
                                <span className={cx('in-stock')}>{product.sku_stock} in stock</span>
                            ) : (
                                <span className={cx('out-of-stock')}>Out of stock</span>
                            )}
                        </div>
                    </div>

                    <div className={cx('action-buttons')}>
                        <button
                            className={cx('add-to-cart-btn')}
                            disabled={product.sku_stock === 0}
                        >
                            Add to Cart
                        </button>
                        <button className={cx('buy-now-btn')} disabled={product.sku_stock === 0}>
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            <div className={cx('product-details')}>
                <div className={cx('tabs-header')}>
                    <button
                        className={cx('tab-btn', { active: activeTab === 'description' })}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={cx('tab-btn', { active: activeTab === 'specifications' })}
                        onClick={() => setActiveTab('specifications')}
                    >
                        Specifications
                    </button>
                </div>

                <div className={cx('tabs-content')}>
                    {activeTab === 'description' && (
                        <div className={cx('description-tab')}>
                            <p>{spu.product_description}</p>
                        </div>
                    )}
                    {activeTab === 'specifications' && (
                        <div className={cx('specifications-tab')}>
                            {spu.product_attributes?.length > 0 ? (
                                <table className={cx('specs-table')}>
                                    <tbody>
                                        {spu.product_attributes.map((attr, index) => (
                                            <tr key={index}>
                                                <td className={cx('spec-name')}>
                                                    {attr.attr_name}
                                                </td>
                                                <td className={cx('spec-value')}>
                                                    {attr.attr_value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No specifications available</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
