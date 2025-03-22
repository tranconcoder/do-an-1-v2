import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&auto=format&fit=crop&q=80';

function ProductDetail() {
    const { slug } = useParams();
    const {
        getProductBySlug,
        addToCart,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        addToRecentlyViewed
    } = useProducts();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const productData = getProductBySlug(slug);

                if (productData) {
                    setProduct(productData);
                    setMainImage(productData.images?.[0] || DEFAULT_IMAGE);
                    // Add to recently viewed products
                    addToRecentlyViewed(productData.id);
                } else {
                    setError('Product not found');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching product details:', err);
                setError('Failed to load product details. Please try again later.');
                setLoading(false);
            }
        };

        fetchProductDetails();
        // Only depend on slug changes, not the functions from context
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        if (product && newQuantity > product.stock) return;
        setQuantity(newQuantity);
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product.id, quantity);
            // Show success message
            alert(`Added ${quantity} item(s) to cart`);
        }
    };

    const handleImageChange = (image) => {
        setMainImage(image);
    };

    const handleWishlistToggle = () => {
        if (!product) return;

        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    if (loading) {
        return (
            <div className={cx('product-detail-container')}>
                <div className={cx('loading')}>Loading product details...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={cx('product-detail-container')}>
                <div className={cx('error')}>{error || 'Product not found'}</div>
                <Link to="/products" className={cx('back-to-products')}>
                    Back to Products
                </Link>
            </div>
        );
    }

    const productInWishlist = isInWishlist(product.id);

    return (
        <div className={cx('product-detail-container')}>
            <div className={cx('breadcrumb')}>
                <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{' '}
                <span>{product.name}</span>
            </div>

            <div className={cx('product-main')}>
                <div className={cx('product-gallery')}>
                    <div className={cx('main-image-container')}>
                        <img
                            src={mainImage}
                            alt={product.name}
                            className={cx('main-image')}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_IMAGE;
                            }}
                        />
                        {product.discount > 0 && (
                            <div className={cx('discount-badge')}>-{product.discount}%</div>
                        )}
                    </div>
                    <div className={cx('thumbnail-list')}>
                        {product.images.map((image, index) => (
                            <div
                                key={index}
                                className={cx('thumbnail-item', { active: image === mainImage })}
                                onClick={() => handleImageChange(image)}
                            >
                                <img
                                    src={image}
                                    alt={`${product.name} - view ${index + 1}`}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_IMAGE;
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cx('product-info')}>
                    <div className={cx('product-header')}>
                        <h1 className={cx('product-name')}>{product.name}</h1>
                        <div className={cx('product-meta')}>
                            <div className={cx('product-ratings')}>
                                <span className={cx('stars')}>
                                    {'★'.repeat(Math.floor(product.rating))}
                                    {'☆'.repeat(5 - Math.floor(product.rating))}
                                </span>
                                <span className={cx('rating-count')}>
                                    ({product.reviewCount} reviews)
                                </span>
                            </div>
                            <div className={cx('product-shop')}>
                                Sold by{' '}
                                <Link to={`/shop/${product.shopId}`}>{product.shopName}</Link>
                            </div>
                        </div>
                    </div>

                    <div className={cx('product-price-container')}>
                        <div className={cx('current-price')}>${product.price.toFixed(2)}</div>
                        {product.originalPrice > product.price && (
                            <div className={cx('original-price')}>
                                ${Number(product.originalPrice).toFixed(2)}
                            </div>
                        )}
                    </div>

                    <div className={cx('product-options')}>
                        {product.specifications.color && (
                            <div className={cx('option-group')}>
                                <div className={cx('option-label')}>Color:</div>
                                <div className={cx('color-options')}>
                                    {product.specifications.color.map((color, index) => (
                                        <div key={index} className={cx('color-option')}>
                                            {color}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

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
                                disabled={quantity >= product.stock}
                            >
                                +
                            </button>
                        </div>

                        <div className={cx('stock-info')}>
                            {product.stock > 0 ? (
                                <span className={cx('in-stock')}>{product.stock} in stock</span>
                            ) : (
                                <span className={cx('out-of-stock')}>Out of stock</span>
                            )}
                        </div>
                    </div>

                    <div className={cx('action-buttons')}>
                        <button
                            className={cx('add-to-cart-btn')}
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            Add to Cart
                        </button>
                        <button className={cx('buy-now-btn')} disabled={product.stock === 0}>
                            Buy Now
                        </button>
                        <button
                            className={cx('wishlist-btn', { 'in-wishlist': productInWishlist })}
                            onClick={handleWishlistToggle}
                        >
                            <span className={cx('wishlist-icon')}>
                                {productInWishlist ? '❤️' : '♡'}
                            </span>
                        </button>
                    </div>

                    <div className={cx('product-delivery')}>
                        <div className={cx('delivery-item')}>
                            <span className={cx('delivery-icon')}>🚚</span> Free shipping on orders
                            over $100
                        </div>
                        <div className={cx('delivery-item')}>
                            <span className={cx('delivery-icon')}>↩️</span> 30-day easy returns
                        </div>
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
                    <button
                        className={cx('tab-btn', { active: activeTab === 'reviews' })}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({product.reviewCount})
                    </button>
                </div>

                <div className={cx('tabs-content')}>
                    {activeTab === 'description' && (
                        <div className={cx('description-tab')}>
                            <p>{product.description}</p>

                            {product.tags && (
                                <div className={cx('product-tags')}>
                                    <h3>Tags:</h3>
                                    <div className={cx('tags-container')}>
                                        {product.tags.map((tag, index) => (
                                            <span key={index} className={cx('tag')}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className={cx('specifications-tab')}>
                            <table className={cx('specs-table')}>
                                <tbody>
                                    {Object.entries(product.specifications).map(
                                        ([key, value], index) => (
                                            <tr key={index}>
                                                <td className={cx('spec-name')}>{key}</td>
                                                <td className={cx('spec-value')}>
                                                    {Array.isArray(value)
                                                        ? value.join(', ')
                                                        : value}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className={cx('reviews-tab')}>
                            <p>Customer reviews will be displayed here.</p>
                            <div className={cx('write-review')}>
                                <button className={cx('write-review-btn')}>Write a Review</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
