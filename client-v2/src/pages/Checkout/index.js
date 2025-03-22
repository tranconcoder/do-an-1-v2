import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Checkout.module.scss';
import axiosClient from '../../configs/axios';

const cx = classNames.bind(styles);

function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState(null);
    const [applyingDiscount, setApplyingDiscount] = useState(false);
    // Remove selected items state

    // Shop-specific discounts state
    const [shopDiscounts, setShopDiscounts] = useState({});
    const [shopDiscountCodes, setShopDiscountCodes] = useState({});
    const [shopDiscountErrors, setShopDiscountErrors] = useState({});
    const [applyingShopDiscount, setApplyingShopDiscount] = useState({});

    // Sample cart items with shop information
    const sampleCartItems = [
        {
            id: 1,
            name: 'Wireless Bluetooth Headphones',
            price: 89.99,
            image: 'https://via.placeholder.com/150',
            quantity: 1,
            shopId: 1,
            shopName: 'Tech Universe'
        },
        {
            id: 2,
            name: 'Premium Smartphone Case',
            price: 24.99,
            image: 'https://via.placeholder.com/150',
            quantity: 2,
            shopId: 1,
            shopName: 'Tech Universe'
        },
        {
            id: 3,
            name: 'Ultra HD Smart TV 55"',
            price: 549.99,
            image: 'https://via.placeholder.com/150',
            quantity: 1,
            shopId: 2,
            shopName: 'Home Electronics'
        },
        {
            id: 4,
            name: 'Wireless Charging Pad',
            price: 29.99,
            image: 'https://via.placeholder.com/150',
            quantity: 1,
            shopId: 2,
            shopName: 'Home Electronics'
        }
    ];

    // Sample addresses
    const sampleAddresses = [
        {
            id: 1,
            name: 'John Doe',
            phone: '(555) 123-4567',
            street: '123 Main Street',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            isDefault: true
        },
        {
            id: 2,
            name: 'John Doe',
            phone: '(555) 987-6543',
            street: '456 Oak Avenue',
            city: 'Somewhere',
            state: 'NY',
            zipCode: '67890',
            isDefault: false
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // In production, use real API calls
                // const cartResponse = await axiosClient.get('/cart');
                // const addressResponse = await axiosClient.get('/user/addresses');
                // setCartItems(cartResponse.data.metadata.items || []);
                // setAddresses(addressResponse.data.metadata.addresses || []);

                // Using sample data
                setTimeout(() => {
                    setCartItems(sampleCartItems);
                    // Remove initialization of selected items

                    setAddresses(sampleAddresses);

                    // Set default address if available
                    const defaultAddress = sampleAddresses.find((addr) => addr.isDefault);
                    if (defaultAddress) {
                        setSelectedAddress(defaultAddress.id);
                    } else if (sampleAddresses.length > 0) {
                        setSelectedAddress(sampleAddresses[0].id);
                    }

                    setLoading(false);
                }, 700);
            } catch (err) {
                console.error('Error fetching checkout data:', err);
                setError('Failed to load checkout data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Remove item selection toggle functions

    // Group items by shop
    const getItemsByShop = () => {
        const shopMap = {};

        cartItems.forEach((item) => {
            if (!shopMap[item.shopId]) {
                shopMap[item.shopId] = {
                    shopId: item.shopId,
                    shopName: item.shopName,
                    items: []
                };
            }
            shopMap[item.shopId].items.push(item);
        });

        return Object.values(shopMap);
    };

    // Calculate subtotal for a specific shop - restore original
    const calculateShopSubtotal = (items) => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const shopGroups = getItemsByShop();
    const subtotal = calculateSubtotal();
    const shippingFee = subtotal > 100 ? 0 : 10.99;
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + shippingFee + tax;

    // Remove hasSelectedItems check

    // Sample discount codes for demo
    const availableDiscounts = [
        { code: 'WELCOME10', value: 10, type: 'percentage', isAdmin: true },
        { code: 'FREESHIP', value: shippingFee, type: 'fixed', isAdmin: true },
        { code: 'SAVE20', value: 20, type: 'fixed', isAdmin: true }
    ];

    // Sample shop-specific discount codes
    const shopDiscountsList = [
        { code: 'TECH15', value: 15, type: 'percentage', shopId: 1 },
        { code: 'TECHDEAL', value: 10, type: 'fixed', shopId: 1 },
        { code: 'HOME10', value: 10, type: 'percentage', shopId: 2 },
        { code: 'ELECTRONICS', value: 5, type: 'fixed', shopId: 2 }
    ];

    // Handle applying admin discount code
    const handleApplyDiscount = () => {
        if (!discountCode.trim()) return;

        setApplyingDiscount(true);
        setDiscountError(null);

        // Simulate API call with timeout
        setTimeout(() => {
            const foundDiscount = availableDiscounts.find(
                (discount) => discount.code === discountCode.toUpperCase() && discount.isAdmin
            );

            if (foundDiscount) {
                setAppliedDiscount(foundDiscount);
                setDiscountCode('');
            } else {
                setDiscountError('Invalid or expired discount code');
            }
            setApplyingDiscount(false);
        }, 800);
    };

    // Handle removing admin discount
    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
    };

    // Handle applying shop-specific discount
    const handleApplyShopDiscount = (shopId) => {
        const code = shopDiscountCodes[shopId]?.trim();
        if (!code) return;

        setApplyingShopDiscount((prev) => ({ ...prev, [shopId]: true }));
        setShopDiscountErrors((prev) => ({ ...prev, [shopId]: null }));

        // Simulate API call with timeout
        setTimeout(() => {
            const foundDiscount = shopDiscountsList.find(
                (discount) => discount.code === code.toUpperCase() && discount.shopId === shopId
            );

            if (foundDiscount) {
                setShopDiscounts((prev) => ({ ...prev, [shopId]: foundDiscount }));
                setShopDiscountCodes((prev) => ({ ...prev, [shopId]: '' }));
            } else {
                setShopDiscountErrors((prev) => ({
                    ...prev,
                    [shopId]: 'Invalid or expired shop discount code'
                }));
            }
            setApplyingShopDiscount((prev) => ({ ...prev, [shopId]: false }));
        }, 800);
    };

    // Handle removing shop discount
    const handleRemoveShopDiscount = (shopId) => {
        setShopDiscounts((prev) => {
            const newDiscounts = { ...prev };
            delete newDiscounts[shopId];
            return newDiscounts;
        });
    };

    // Calculate admin discount amount
    const calculateDiscountAmount = () => {
        if (!appliedDiscount) return 0;

        if (appliedDiscount.type === 'percentage') {
            return (subtotal * appliedDiscount.value) / 100;
        } else {
            return appliedDiscount.value;
        }
    };

    // Calculate shop-specific discount amount for a shop
    const calculateShopDiscountAmount = (shopId, shopSubtotal) => {
        const discount = shopDiscounts[shopId];
        if (!discount) return 0;

        if (discount.type === 'percentage') {
            return (shopSubtotal * discount.value) / 100;
        } else {
            return discount.value;
        }
    };

    // Calculate total shop discounts - restore original
    const calculateTotalShopDiscounts = () => {
        return Object.entries(shopDiscounts).reduce((total, [shopId, discount]) => {
            const shopItems = cartItems.filter((item) => item.shopId === parseInt(shopId));
            const shopSubtotal = shopItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            return total + calculateShopDiscountAmount(parseInt(shopId), shopSubtotal);
        }, 0);
    };

    const adminDiscountAmount = calculateDiscountAmount();
    const totalShopDiscounts = calculateTotalShopDiscounts();
    const totalDiscounts = adminDiscountAmount + totalShopDiscounts;

    // Final total after all discounts
    const finalTotal = total - totalDiscounts;

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a shipping address');
            return;
        }

        // Remove hasSelectedItems check

        try {
            setIsProcessing(true);

            // In production, send order to server - restore original
            // const response = await axiosClient.post('/orders', {
            //     addressId: selectedAddress,
            //     paymentMethod,
            //     items: cartItems.map(item => ({ id: item.id, quantity: item.quantity }))
            // });

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Redirect to order confirmation
            navigate('/order-confirmation/12345');
        } catch (err) {
            console.error('Error placing order:', err);
            alert('There was a problem placing your order. Please try again.');
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className={cx('checkout-container')}>
                <h1 className={cx('page-title')}>Checkout</h1>
                <div className={cx('loading')}>Loading checkout information...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('checkout-container')}>
                <h1 className={cx('page-title')}>Checkout</h1>
                <div className={cx('error')}>{error}</div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className={cx('checkout-container')}>
                <h1 className={cx('page-title')}>Checkout</h1>
                <div className={cx('empty-checkout')}>
                    <div className={cx('empty-checkout-icon')}>🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>You need to add items to your cart before checkout.</p>
                    <Link to="/products" className={cx('continue-shopping-btn')}>
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('checkout-container')}>
            <h1 className={cx('page-title')}>Checkout</h1>

            <div className={cx('checkout-section')}>
                <div className={cx('checkout-options')}>
                    {/* Shipping Address */}
                    <div className={cx('shipping-option')}>
                        <h2 className={cx('option-title')}>Shipping Address</h2>

                        {addresses.length === 0 ? (
                            <div className={cx('no-addresses')}>
                                <p>You don't have any saved addresses.</p>
                                <Link to="/profile" className={cx('add-address-btn')}>
                                    Add New Address
                                </Link>
                            </div>
                        ) : (
                            <div className={cx('address-selector-container')}>
                                <select
                                    className={cx('address-selector')}
                                    value={selectedAddress}
                                    onChange={(e) => setSelectedAddress(e.target.value)}
                                >
                                    <option value="">Select an address</option>
                                    {addresses.map((address) => (
                                        <option key={address.id} value={address.id}>
                                            {address.name} - {address.street}, {address.city},{' '}
                                            {address.state} {address.zipCode}
                                        </option>
                                    ))}
                                </select>

                                {selectedAddress && (
                                    <div className={cx('selected-address')}>
                                        {(() => {
                                            const address = addresses.find(
                                                (a) => a.id === parseInt(selectedAddress)
                                            );
                                            return address ? (
                                                <>
                                                    <p className={cx('address-name')}>
                                                        {address.name}
                                                    </p>
                                                    <p className={cx('address-phone')}>
                                                        {address.phone}
                                                    </p>
                                                    <p className={cx('address-lines')}>
                                                        {address.street}
                                                        <br />
                                                        {address.city}, {address.state}{' '}
                                                        {address.zipCode}
                                                    </p>
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                )}

                                <div className={cx('address-actions')}>
                                    <Link to="/profile" className={cx('manage-addresses-btn')}>
                                        Manage Addresses
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className={cx('payment-option')}>
                        <h2 className={cx('option-title')}>Payment Method</h2>

                        <div className={cx('payment-methods')}>
                            <div
                                className={cx('payment-method', {
                                    selected: paymentMethod === 'credit_card'
                                })}
                                onClick={() => setPaymentMethod('credit_card')}
                            >
                                <input
                                    type="radio"
                                    id="credit_card"
                                    name="payment"
                                    value="credit_card"
                                    checked={paymentMethod === 'credit_card'}
                                    onChange={() => setPaymentMethod('credit_card')}
                                />
                                <span className={cx('method-icon')}>💳</span>
                                <div className={cx('method-details')}>
                                    <div className={cx('method-name')}>Credit/Debit Card</div>
                                    <div className={cx('method-description')}>
                                        Pay with Visa, Mastercard, or other cards
                                    </div>
                                </div>
                            </div>

                            <div
                                className={cx('payment-method', {
                                    selected: paymentMethod === 'paypal'
                                })}
                                onClick={() => setPaymentMethod('paypal')}
                            >
                                <input
                                    type="radio"
                                    id="paypal"
                                    name="payment"
                                    value="paypal"
                                    checked={paymentMethod === 'paypal'}
                                    onChange={() => setPaymentMethod('paypal')}
                                />
                                <span className={cx('method-icon')}>🅿️</span>
                                <div className={cx('method-details')}>
                                    <div className={cx('method-name')}>PayPal</div>
                                    <div className={cx('method-description')}>
                                        Pay with your PayPal account
                                    </div>
                                </div>
                            </div>

                            <div
                                className={cx('payment-method', {
                                    selected: paymentMethod === 'cash'
                                })}
                                onClick={() => setPaymentMethod('cash')}
                            >
                                <input
                                    type="radio"
                                    id="cash"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={() => setPaymentMethod('cash')}
                                />
                                <span className={cx('method-icon')}>💵</span>
                                <div className={cx('method-details')}>
                                    <div className={cx('method-name')}>Cash on Delivery</div>
                                    <div className={cx('method-description')}>
                                        Pay when you receive your order
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className={cx('order-items-section')}>
                        <h2 className={cx('option-title')}>Order Items</h2>

                        {shopGroups.map((shopGroup) => {
                            const shopSubtotal = calculateShopSubtotal(shopGroup.items);
                            const shopDiscountAmount = calculateShopDiscountAmount(
                                shopGroup.shopId,
                                shopSubtotal
                            );
                            const shopDiscount = shopDiscounts[shopGroup.shopId];

                            return (
                                <div key={shopGroup.shopId} className={cx('shop-order-group')}>
                                    <div className={cx('shop-order-header')}>
                                        <div className={cx('shop-name-container')}>
                                            {/* Remove shop checkbox */}
                                            <span className={cx('shop-icon')}>🏪</span>
                                            {shopGroup.shopName}
                                        </div>
                                        <span className={cx('shop-verification')}>
                                            Official Store
                                        </span>
                                    </div>

                                    <div className={cx('shop-order-items')}>
                                        {shopGroup.items.map((item) => (
                                            <div key={item.id} className={cx('order-item')}>
                                                {/* Remove item checkbox */}
                                                <div className={cx('order-item-image')}>
                                                    <img src={item.image} alt={item.name} />
                                                </div>
                                                <div className={cx('order-item-details')}>
                                                    <div className={cx('order-item-name')}>
                                                        {item.name}
                                                    </div>
                                                    <div className={cx('order-item-quantity')}>
                                                        Quantity: {item.quantity}
                                                    </div>
                                                    <div className={cx('order-item-price')}>
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Shop-specific discount section */}
                                    <div className={cx('shop-discount-section')}>
                                        {!shopDiscount ? (
                                            <>
                                                <div className={cx('discount-input-container')}>
                                                    <input
                                                        type="text"
                                                        className={cx('discount-input')}
                                                        placeholder={`${shopGroup.shopName} discount code`}
                                                        value={
                                                            shopDiscountCodes[shopGroup.shopId] ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setShopDiscountCodes((prev) => ({
                                                                ...prev,
                                                                [shopGroup.shopId]: e.target.value
                                                            }))
                                                        }
                                                        disabled={
                                                            applyingShopDiscount[shopGroup.shopId]
                                                        }
                                                    />
                                                    <button
                                                        className={cx('apply-discount-btn')}
                                                        onClick={() =>
                                                            handleApplyShopDiscount(
                                                                shopGroup.shopId
                                                            )
                                                        }
                                                        disabled={
                                                            !shopDiscountCodes[
                                                                shopGroup.shopId
                                                            ]?.trim() ||
                                                            applyingShopDiscount[shopGroup.shopId]
                                                        }
                                                    >
                                                        {applyingShopDiscount[shopGroup.shopId]
                                                            ? 'Applying...'
                                                            : 'Apply'}
                                                    </button>
                                                </div>
                                                {shopDiscountErrors[shopGroup.shopId] && (
                                                    <div className={cx('discount-error')}>
                                                        {shopDiscountErrors[shopGroup.shopId]}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div
                                                className={cx(
                                                    'applied-discount',
                                                    'shop-applied-discount'
                                                )}
                                            >
                                                <div className={cx('discount-info')}>
                                                    <span className={cx('discount-code')}>
                                                        {shopDiscount.code}
                                                    </span>
                                                    <span className={cx('discount-value')}>
                                                        {shopDiscount.type === 'percentage'
                                                            ? `-${shopDiscount.value}%`
                                                            : `-$${shopDiscount.value.toFixed(2)}`}
                                                    </span>
                                                </div>
                                                <button
                                                    className={cx('remove-discount-btn')}
                                                    onClick={() =>
                                                        handleRemoveShopDiscount(shopGroup.shopId)
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className={cx('shop-order-subtotal')}>
                                        <div className={cx('subtotal-info')}>
                                            <span className={cx('subtotal-label')}>
                                                Shop Subtotal:
                                            </span>
                                            <span className={cx('subtotal-value')}>
                                                ${shopSubtotal.toFixed(2)}
                                            </span>
                                        </div>

                                        {shopDiscountAmount > 0 && (
                                            <div className={cx('shop-discount-amount')}>
                                                <span className={cx('discount-label')}>
                                                    Shop Discount:
                                                </span>
                                                <span className={cx('discount-value')}>
                                                    -${shopDiscountAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={cx('order-summary')}>
                    <h2 className={cx('summary-title')}>Order Summary</h2>

                    {/* Remove selected items count row */}

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

                    {/* Admin-wide discount code section */}
                    <div className={cx('discount-section')}>
                        <h3 className={cx('discount-title')}>Order Discount</h3>
                        {!appliedDiscount ? (
                            <>
                                <div className={cx('discount-input-container')}>
                                    <input
                                        type="text"
                                        className={cx('discount-input')}
                                        placeholder="Enter discount code"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        disabled={applyingDiscount}
                                    />
                                    <button
                                        className={cx('apply-discount-btn')}
                                        onClick={handleApplyDiscount}
                                        disabled={!discountCode.trim() || applyingDiscount}
                                    >
                                        {applyingDiscount ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                                {discountError && (
                                    <div className={cx('discount-error')}>{discountError}</div>
                                )}
                            </>
                        ) : (
                            <div className={cx('applied-discount')}>
                                <div className={cx('discount-info')}>
                                    <span className={cx('discount-code', 'admin-discount-code')}>
                                        {appliedDiscount.code}
                                    </span>
                                    <span className={cx('discount-value')}>
                                        {appliedDiscount.type === 'percentage'
                                            ? `-${appliedDiscount.value}%`
                                            : `-$${appliedDiscount.value.toFixed(2)}`}
                                    </span>
                                </div>
                                <button
                                    className={cx('remove-discount-btn')}
                                    onClick={handleRemoveDiscount}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Show discounts in the summary */}
                    {adminDiscountAmount > 0 && (
                        <div className={cx('summary-row', 'discount-row')}>
                            <span>Order Discount</span>
                            <span className={cx('discount-amount')}>
                                -${adminDiscountAmount.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {totalShopDiscounts > 0 && (
                        <div className={cx('summary-row', 'discount-row')}>
                            <span>Shop Discounts</span>
                            <span className={cx('discount-amount')}>
                                -${totalShopDiscounts.toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div className={cx('summary-divider')}></div>

                    <div className={cx('summary-row', 'total-row')}>
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                    </div>

                    <button
                        className={cx('place-order-btn')}
                        onClick={handlePlaceOrder}
                        disabled={isProcessing || !selectedAddress}
                    >
                        {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>

                    <Link to="/cart" className={cx('back-to-cart')}>
                        Back to Cart
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
