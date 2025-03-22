import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&auto=format&fit=crop&q=80';

function Cart() {
    const { cart, getCartItems, updateCartQuantity, removeFromCart, getCartSubtotal, getAllShops } =
        useProducts();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const shops = getAllShops();

    // Fetch cart items from ProductsContext hook
    const cartItems = getCartItems();

    // Fix: Use cart (the raw cart array) as dependency instead of cartItems
    useEffect(() => {
        // Simulate loading
        const loadData = async () => {
            try {
                setLoading(true);
                // Initialize all items as selected
                const initialSelections = {};
                cartItems.forEach((item) => {
                    initialSelections[item.id] = true;
                });
                setSelectedItems(initialSelections);
                setLoading(false);
            } catch (err) {
                console.error('Error loading cart items:', err);
                setError('Failed to load cart items. Please try again later.');
                setLoading(false);
            }
        };

        loadData();
    }, [cart]); // Changed dependency from cartItems to cart

    // Handle individual item selection
    const handleItemSelection = (itemId) => {
        setSelectedItems((prev) => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Handle shop group selection (all items in a shop)
    const handleShopSelection = (shopId, items) => {
        const shopItemIds = items.map((item) => item.id);
        const areAllSelected = shopItemIds.every((id) => selectedItems[id]);

        const newSelections = { ...selectedItems };
        shopItemIds.forEach((id) => {
            newSelections[id] = !areAllSelected;
        });

        setSelectedItems(newSelections);
    };

    // Handle select all items
    const handleSelectAll = () => {
        const allIds = cartItems.map((item) => item.id);
        const areAllSelected = allIds.every((id) => selectedItems[id]);

        const newSelections = {};
        allIds.forEach((id) => {
            newSelections[id] = !areAllSelected;
        });

        setSelectedItems(newSelections);
    };

    // Check if all items in a shop are selected
    const isShopSelected = (items) => {
        return items.every((item) => selectedItems[item.id]);
    };

    // Check if all items in the cart are selected
    const isAllSelected = () => {
        return cartItems.length > 0 && cartItems.every((item) => selectedItems[item.id]);
    };

    // Get only the selected items
    const getSelectedItems = () => {
        return cartItems.filter((item) => selectedItems[item.id]);
    };

    // Handle quantity change
    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        updateCartQuantity(itemId, newQuantity);
    };

    // Handle item removal
    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId);
    };

    // Group items by shop
    const getItemsByShop = () => {
        const shopMap = {};

        cartItems.forEach((item) => {
            if (!shopMap[item.shopId]) {
                const shopInfo = shops.find((shop) => shop.id === item.shopId) || {
                    name: item.shopName
                };
                shopMap[item.shopId] = {
                    shopId: item.shopId,
                    shopName: shopInfo.name,
                    items: []
                };
            }
            shopMap[item.shopId].items.push(item);
        });

        return Object.values(shopMap);
    };

    // Calculate subtotal for selected items in a specific shop
    const calculateShopSubtotal = (items) => {
        return items
            .filter((item) => selectedItems[item.id])
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const shopGroups = getItemsByShop();
    const subtotal = getSelectedItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal > 100 ? 0 : 10.99;
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + shippingFee + tax;
    const selectedCount = getSelectedItems().length;

    if (loading) {
        return (
            <div className={cx('cart-container')}>
                <h1 className={cx('page-title')}>Your Shopping Cart</h1>
                <div className={cx('loading')}>Loading cart items...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('cart-container')}>
                <h1 className={cx('page-title')}>Your Shopping Cart</h1>
                <div className={cx('error')}>{error}</div>
            </div>
        );
    }

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

            <div className={cx('select-all-container')}>
                <label className={cx('select-all-label')}>
                    <input
                        type="checkbox"
                        checked={isAllSelected()}
                        onChange={handleSelectAll}
                        className={cx('select-all-checkbox')}
                    />
                    <span>
                        Select All Items ({selectedCount}/{cartItems.length})
                    </span>
                </label>
            </div>

            <div className={cx('cart-content')}>
                <div className={cx('cart-items-container')}>
                    {shopGroups.map((shopGroup) => (
                        <div key={shopGroup.shopId} className={cx('shop-group')}>
                            <div className={cx('shop-header')}>
                                <div className={cx('shop-name')}>
                                    <label className={cx('shop-select-label')}>
                                        <input
                                            type="checkbox"
                                            checked={isShopSelected(shopGroup.items)}
                                            onChange={() =>
                                                handleShopSelection(
                                                    shopGroup.shopId,
                                                    shopGroup.items
                                                )
                                            }
                                            className={cx('shop-checkbox')}
                                        />
                                        <span className={cx('shop-icon')}>🏪</span>
                                        {shopGroup.shopName}
                                    </label>
                                </div>
                                <div className={cx('shop-badge')}>Official Store</div>
                            </div>

                            <div className={cx('cart-items')}>
                                {shopGroup.items.map((item) => (
                                    <div key={item.id} className={cx('cart-item')}>
                                        <div className={cx('select-col')}>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems[item.id] || false}
                                                onChange={() => handleItemSelection(item.id)}
                                                className={cx('item-checkbox')}
                                            />
                                        </div>
                                        <div className={cx('product-col')}>
                                            <div className={cx('product-image')}>
                                                <img
                                                    src={
                                                        item.thumbnail ||
                                                        item.images?.[0] ||
                                                        DEFAULT_IMAGE
                                                    }
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = DEFAULT_IMAGE;
                                                    }}
                                                />
                                            </div>
                                            <div className={cx('product-name')}>{item.name}</div>
                                        </div>

                                        <div className={cx('price-col')} data-label="Price:">
                                            ${item.price.toFixed(2)}
                                        </div>

                                        <div className={cx('quantity-col')}>
                                            <div className={cx('quantity-controls')}>
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <span className={cx('quantity-value')}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {item.quantity >= item.stock && (
                                                <div className={cx('stock-warning')}>
                                                    Max stock reached
                                                </div>
                                            )}
                                        </div>

                                        <div className={cx('subtotal-col')} data-label="Subtotal:">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>

                                        <div className={cx('actions-col')}>
                                            <button
                                                className={cx('remove-btn')}
                                                onClick={() => handleRemoveItem(item.id)}
                                                aria-label="Remove item"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={cx('shop-subtotal')}>
                                <span className={cx('subtotal-label')}>Shop Subtotal:</span>
                                <span className={cx('subtotal-value')}>
                                    ${calculateShopSubtotal(shopGroup.items).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={cx('cart-summary')}>
                    <h2 className={cx('summary-title')}>Order Summary</h2>
                    <div className={cx('summary-selection-info')}>
                        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                    </div>

                    <div className={cx('summary-row')}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
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
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div className={cx('checkout-section')}>
                        <Link
                            to={selectedCount > 0 ? '/checkout' : '#'}
                            className={cx('checkout-btn', { disabled: selectedCount === 0 })}
                            onClick={(e) => {
                                if (selectedCount === 0) {
                                    e.preventDefault();
                                    alert('Please select at least one item to checkout');
                                }
                            }}
                        >
                            Proceed to Checkout ({selectedCount})
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
