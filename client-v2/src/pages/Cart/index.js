import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import {
    selectCartItems,
    selectCartTotal,
    decreaseCart,
    increaseCart
} from '../../redux/slices/cartSlice';
import { FaSpinner } from 'react-icons/fa';

const cx = classNames.bind(styles);

function Cart() {
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const [loadingStates, setLoadingStates] = React.useState({});

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

    // Calculate totals
    const shippingFee = cartTotal > 100 ? 0 : 10.99;
    const tax = cartTotal * 0.07; // 7% tax
    const finalTotal = cartTotal + shippingFee + tax;

    if (cartItems.length === 0) {
        return (
            <div className={cx('cart-container')}>
                <h1 className={cx('page-title')}>Your Shopping Cart</h1>
                <div className={cx('empty-cart')}>
                    <div className={cx('empty-cart-icon')}>🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <Link to="/products" className={cx('continue-shopping-btn')}>
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('cart-container')}>
            <h1 className={cx('page-title')}>Your Shopping Cart</h1>

            <div className={cx('cart-content')}>
                <div className={cx('cart-items-container')}>
                    {cartItems.map((item) => (
                        <div key={item.id} className={cx('cart-item')}>
                            <div className={cx('product-col')}>
                                <div className={cx('product-image')}>
                                    <img
                                        src={item.product_thumb}
                                        alt={item.product_name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150';
                                        }}
                                    />
                                </div>
                                <div className={cx('product-info')}>
                                    <div className={cx('product-name')}>{item.product_name}</div>
                                    <div className={cx('product-price')}>
                                        ${item.product_price.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className={cx('quantity-col')}>
                                <div className={cx('quantity-controls')}>
                                    <button
                                        className={cx('quantity-btn')}
                                        onClick={() => handleDecrease(item.id)}
                                        disabled={item.cart_quantity <= 1 || loadingStates[item.id]}
                                    >
                                        −
                                    </button>
                                    <span className={cx('quantity-value')}>
                                        {loadingStates[item.id] ? (
                                            <FaSpinner className={cx('spinner')} />
                                        ) : (
                                            item.cart_quantity
                                        )}
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

                            <div className={cx('subtotal-col')} data-label="Subtotal:">
                                ${(item.product_price * item.cart_quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={cx('cart-summary')}>
                    <h2 className={cx('summary-title')}>Order Summary</h2>

                    <div className={cx('summary-row')}>
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>

                    <div className={cx('summary-row')}>
                        <span>Shipping</span>
                        <span>
                            {shippingFee === 0 ? (
                                <span className={cx('free-shipping')}>Free</span>
                            ) : (
                                `$${shippingFee.toFixed(2)}`
                            )}
                        </span>
                    </div>

                    <div className={cx('summary-row')}>
                        <span>Tax (7%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>

                    <div className={cx('summary-row', 'total-row')}>
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                    </div>

                    <div className={cx('checkout-section')}>
                        <Link to="/checkout" className={cx('checkout-btn')}>
                            Proceed to Checkout
                        </Link>

                        <Link to="/products" className={cx('continue-shopping')}>
                            or Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
