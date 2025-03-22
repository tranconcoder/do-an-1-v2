import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Wishlist.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

function Wishlist() {
    const { getWishlistItems, removeFromWishlist, addToCart } = useProducts();
    const wishlistItems = getWishlistItems();

    const handleRemoveFromWishlist = (productId) => {
        removeFromWishlist(productId);
    };

    const handleAddToCart = (productId) => {
        addToCart(productId, 1);
    };

    return (
        <div className={cx('wishlist-container')}>
            <h1 className={cx('page-title')}>My Wishlist</h1>

            {wishlistItems.length === 0 ? (
                <div className={cx('empty-wishlist')}>
                    <div className={cx('empty-wishlist-icon')}>❤️</div>
                    <h2>Your wishlist is empty</h2>
                    <p>
                        Save items you like to your wishlist. Review them anytime and easily move
                        them to the cart.
                    </p>
                    <Link to="/products" className={cx('continue-shopping-btn')}>
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className={cx('wishlist-items-container')}>
                    {wishlistItems.map((item) => (
                        <div key={item.id} className={cx('wishlist-item')}>
                            <div className={cx('item-image-container')}>
                                <Link to={`/product/${item.slug}`}>
                                    <img
                                        src={item.thumbnail || item.images?.[0] || DEFAULT_IMAGE}
                                        alt={item.name}
                                        className={cx('item-image')}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_IMAGE;
                                        }}
                                    />
                                </Link>
                            </div>

                            <div className={cx('item-details')}>
                                <Link to={`/product/${item.slug}`} className={cx('item-name')}>
                                    {item.name}
                                </Link>

                                <div className={cx('item-price-container')}>
                                    <span className={cx('current-price')}>
                                        ${item.price.toFixed(2)}
                                    </span>
                                    {item.originalPrice && item.originalPrice > item.price && (
                                        <span className={cx('original-price')}>
                                            ${Number(item.originalPrice).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {item.stock > 0 ? (
                                    <span className={cx('in-stock')}>In Stock</span>
                                ) : (
                                    <span className={cx('out-of-stock')}>Out of Stock</span>
                                )}

                                <div className={cx('item-actions')}>
                                    <button
                                        onClick={() => handleAddToCart(item.id)}
                                        className={cx('add-to-cart-btn')}
                                        disabled={!item.stock || item.stock === 0}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className={cx('remove-btn')}
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Wishlist;
