import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CartDropdown.module.scss';
import CartIcon from '../../assets/icons/CartIcon';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&auto=format&fit=crop&q=80';

function CartDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { getCartItems, getCartItemCount, getCartSubtotal } = useProducts();

    const cartItems = getCartItems();
    const cartCount = getCartItemCount();
    const cartTotal = getCartSubtotal();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={cx('cart-dropdown')} ref={dropdownRef}>
            <button className={cx('cart-button')} onClick={toggleDropdown}>
                <CartIcon />
                {cartCount > 0 && <span className={cx('cart-count')}>{cartCount}</span>}
            </button>

            {isOpen && (
                <div className={cx('dropdown-menu')}>
                    <div className={cx('cart-header')}>
                        <h3>Shopping Cart ({cartCount})</h3>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className={cx('empty-cart')}>
                            <p>Your cart is empty</p>
                            <Link to="/products" className={cx('continue-shopping')}>
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className={cx('cart-items')}>
                                {cartItems.slice(0, 4).map((item) => (
                                    <div key={item.id} className={cx('cart-item')}>
                                        <img
                                            src={
                                                item.thumbnail || item.images?.[0] || DEFAULT_IMAGE
                                            }
                                            alt={item.name}
                                            className={cx('item-image')}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = DEFAULT_IMAGE;
                                            }}
                                        />
                                        <div className={cx('item-details')}>
                                            <h4 className={cx('item-name')}>{item.name}</h4>
                                            <p className={cx('item-price')}>
                                                ${item.price.toFixed(2)}
                                            </p>
                                            <div className={cx('item-quantity')}>
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {cartItems.length > 4 && (
                                    <div className={cx('more-items')}>
                                        +{cartItems.length - 4} more items
                                    </div>
                                )}
                            </div>

                            <div className={cx('cart-footer')}>
                                <div className={cx('cart-total')}>
                                    <span>Total:</span>
                                    <span className={cx('total-price')}>
                                        ${cartTotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className={cx('cart-actions')}>
                                    <Link to="/cart" className={cx('view-cart-btn')}>
                                        View Cart
                                    </Link>
                                    <Link to="/checkout" className={cx('checkout-btn')}>
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CartDropdown;
