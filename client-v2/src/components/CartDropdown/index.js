import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './CartDropdown.module.scss';
import CartIcon from '../../assets/icons/CartIcon';
import {
    selectCartItems,
    selectCartItemCount,
    selectCartTotal,
    decreaseCart,
    increaseCart
} from '../../redux/slices/cartSlice';

const cx = classNames.bind(styles);

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&auto=format&fit=crop&q=80';

function CartDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();

    const cartItems = useSelector(selectCartItems);
    const cartCount = useSelector(selectCartItemCount);
    const cartTotal = useSelector(selectCartTotal);
    const [loadingStates, setLoadingStates] = useState({});

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

    const handleIncrease = async (itemId) => {
        setLoadingStates((prev) => ({ ...prev, [itemId]: true }));
        try {
            await dispatch(increaseCart(itemId)).unwrap();
        } catch (error) {
            console.error('Failed to increase quantity:', error);
        }
        setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
    };

    const handleDecrease = async (itemId) => {
        setLoadingStates((prev) => ({ ...prev, [itemId]: true }));
        try {
            await dispatch(decreaseCart(itemId)).unwrap();
        } catch (error) {
            console.error('Failed to decrease quantity:', error);
        }
        setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
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
                                            src={item.product_thumb || DEFAULT_IMAGE}
                                            alt={item.product_name}
                                            className={cx('item-image')}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = DEFAULT_IMAGE;
                                            }}
                                        />
                                        <div className={cx('item-details')}>
                                            <h4 className={cx('item-name')}>{item.product_name}</h4>
                                            <p className={cx('item-price')}>
                                                ${item.product_price.toFixed(2)}
                                            </p>
                                            <div className={cx('quantity-controls')}>
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() => handleDecrease(item.id)}
                                                    disabled={
                                                        item.cart_quantity <= 1 ||
                                                        loadingStates[item.id]
                                                    }
                                                >
                                                    −
                                                </button>
                                                <span className={cx('quantity-value')}>
                                                    {item.cart_quantity}
                                                </span>
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() => handleIncrease(item.id)}
                                                    disabled={loadingStates[item.id]}
                                                >
                                                    +
                                                </button>
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
