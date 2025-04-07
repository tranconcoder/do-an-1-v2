import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import {
    selectCartItems,
    selectCartTotal,
    decreaseCart,
    increaseCart,
    deleteFromCart,
    updateCart
} from '../../redux/slices/cartSlice';
import { FaSpinner, FaStore, FaTimesCircle } from 'react-icons/fa';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatVND, numberToVietnameseWords } from '../../utils/format.util';

const cx = classNames.bind(styles);

function Cart() {
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const [loadingStates, setLoadingStates] = React.useState({});
    const [editingQuantity, setEditingQuantity] = React.useState({});
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        itemToDelete: null,
        productName: ''
    });

    const handleIncrease = async (itemId) => {
        setLoadingStates((prev) => ({ ...prev, [itemId]: true }));
        try {
            await dispatch(increaseCart(itemId)).unwrap();
        } catch (error) {
            console.error('Không thể tăng số lượng:', error);
        }
        setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
    };

    const handleDecrease = async (itemId, currentQuantity, productName) => {
        if (currentQuantity <= 1) {
            setConfirmDialog({
                isOpen: true,
                itemToDelete: itemId,
                productName: productName
            });
            return;
        }

        setLoadingStates((prev) => ({ ...prev, [itemId]: true }));
        try {
            await dispatch(decreaseCart(itemId)).unwrap();
        } catch (error) {
            console.error('Không thể giảm số lượng:', error);
        }
        setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
    };

    const handleQuantityChange = (itemId, value) => {
        setEditingQuantity((prev) => ({
            ...prev,
            [itemId]: value
        }));
    };

    const handleQuantityBlur = async (item) => {
        const newQuantity = parseInt(editingQuantity[item.id]);
        if (isNaN(newQuantity) || newQuantity < 0) {
            setEditingQuantity((prev) => ({ ...prev, [item.id]: item.cart_quantity }));
            return;
        }

        if (newQuantity === 0) {
            setConfirmDialog({
                isOpen: true,
                itemToDelete: item.id,
                productName: item.product_name
            });
            setEditingQuantity((prev) => ({ ...prev, [item.id]: item.cart_quantity }));
            return;
        }

        if (newQuantity === item.cart_quantity) {
            setEditingQuantity((prev) => ({ ...prev, [item.id]: undefined }));
            return;
        }

        setLoadingStates((prev) => ({ ...prev, [item.id]: true }));
        try {
            await dispatch(
                updateCart({
                    shopId: item.shop_id,
                    products: [
                        {
                            id: item.id,
                            quantity: item.cart_quantity,
                            newQuantity: newQuantity,
                            status: 'active',
                            newStatus: 'active',
                            isDelete: false
                        }
                    ]
                })
            ).unwrap();
        } catch (error) {
            console.error('Không thể cập nhật số lượng:', error);
            setEditingQuantity((prev) => ({ ...prev, [item.id]: item.cart_quantity }));
        }
        setLoadingStates((prev) => ({ ...prev, [item.id]: false }));
        setEditingQuantity((prev) => ({ ...prev, [item.id]: undefined }));
    };

    const handleDelete = async (itemId) => {
        setLoadingStates((prev) => ({ ...prev, [itemId]: true }));
        try {
            await dispatch(
                updateCart({
                    shopId: cartItems.find((item) => item.id === itemId).shop_id,
                    products: [
                        {
                            id: itemId,
                            quantity: cartItems.find((item) => item.id === itemId).cart_quantity,
                            newQuantity: 0,
                            status: 'active',
                            newStatus: 'active',
                            isDelete: true
                        }
                    ]
                })
            ).unwrap();
        } catch (error) {
            console.error('Không thể xóa sản phẩm:', error);
        }
        setLoadingStates((prev) => ({ ...prev, [itemId]: false }));
    };

    const handleConfirmDelete = () => {
        handleDelete(confirmDialog.itemToDelete);
        setConfirmDialog({ isOpen: false, itemToDelete: null, productName: '' });
    };

    // Nhóm sản phẩm theo cửa hàng
    const groupByShop = React.useMemo(() => {
        const groups = cartItems.reduce((acc, item) => {
            if (!acc[item.shop_id]) {
                acc[item.shop_id] = {
                    shop_id: item.shop_id,
                    shop_name: item.shop_name,
                    items: []
                };
            }
            acc[item.shop_id].items.push(item);
            return acc;
        }, {});
        return Object.values(groups);
    }, [cartItems]);

    // Tính tổng tiền cho một cửa hàng
    const calculateShopTotal = (items) => {
        return items.reduce((total, item) => total + item.product_price * item.cart_quantity, 0);
    };

    // Tính toán tổng tiền
    const finalTotal = cartTotal;

    if (cartItems.length === 0) {
        return (
            <div className={cx('cart-container')}>
                <h1 className={cx('page-title')}>Giỏ hàng của bạn</h1>
                <div className={cx('empty-cart')}>
                    <div className={cx('empty-cart-icon')}>🛒</div>
                    <h2>Giỏ hàng trống</h2>
                    <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                    <Link to="/products" className={cx('continue-shopping-btn')}>
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('cart-container')}>
            <h1 className={cx('page-title')}>Giỏ hàng của bạn</h1>

            <div className={cx('cart-content')}>
                <div className={cx('cart-items-container')}>
                    {groupByShop.map((shop) => (
                        <div key={shop.shop_id} className={cx('shop-group')}>
                            <div className={cx('shop-header')}>
                                <div className={cx('shop-name')}>
                                    <FaStore className={cx('shop-icon')} />
                                    {shop.shop_name}
                                </div>
                                <div className={cx('shop-badge')}>Shop Mall</div>
                            </div>

                            {shop.items.map((item) => (
                                <div key={item.id} className={cx('cart-item')}>
                                    <div className={cx('product-col')}>
                                        <div className={cx('product-image')}>
                                            <img
                                                src={item.product_thumb}
                                                alt={item.product_name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        'https://via.placeholder.com/150';
                                                }}
                                            />
                                        </div>
                                        <div className={cx('product-info')}>
                                            <div className={cx('product-name')}>
                                                {item.product_name}
                                            </div>
                                            <div className={cx('product-price')}>
                                                {formatVND(item.product_price)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={cx('quantity-col')}>
                                        <div className={cx('quantity-controls')}>
                                            <button
                                                className={cx('quantity-btn')}
                                                onClick={() =>
                                                    handleDecrease(
                                                        item.id,
                                                        item.cart_quantity,
                                                        item.product_name
                                                    )
                                                }
                                                disabled={loadingStates[item.id]}
                                            >
                                                −
                                            </button>
                                            {editingQuantity[item.id] !== undefined ? (
                                                <input
                                                    type="number"
                                                    className={cx('quantity-input')}
                                                    value={editingQuantity[item.id]}
                                                    onChange={(e) =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    onBlur={() => handleQuantityBlur(item)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.target.blur();
                                                        }
                                                    }}
                                                    min="0"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span
                                                    className={cx('quantity-value')}
                                                    onClick={() =>
                                                        setEditingQuantity((prev) => ({
                                                            ...prev,
                                                            [item.id]: item.cart_quantity
                                                        }))
                                                    }
                                                >
                                                    {loadingStates[item.id] ? (
                                                        <FaSpinner className={cx('spinner')} />
                                                    ) : (
                                                        item.cart_quantity
                                                    )}
                                                </span>
                                            )}
                                            <button
                                                className={cx('quantity-btn')}
                                                onClick={() => handleIncrease(item.id)}
                                                disabled={loadingStates[item.id]}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className={cx('subtotal-col')} data-label="Tổng:">
                                        <div className={cx('subtotal-price')}>
                                            {formatVND(item.product_price * item.cart_quantity)}
                                        </div>
                                        <button
                                            className={cx('delete-btn')}
                                            onClick={() =>
                                                setConfirmDialog({
                                                    isOpen: true,
                                                    itemToDelete: item.id,
                                                    productName: item.product_name
                                                })
                                            }
                                            disabled={loadingStates[item.id]}
                                        >
                                            <FaTimesCircle />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className={cx('shop-subtotal')}>
                                <div className={cx('subtotal-info')}>
                                    <span className={cx('subtotal-label')}>
                                        Tổng tiền ({shop.items.length} sản phẩm):
                                    </span>
                                    <span className={cx('subtotal-value')}>
                                        {formatVND(calculateShopTotal(shop.items))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={cx('cart-summary')}>
                    <h2 className={cx('summary-title')}>Tổng giỏ hàng</h2>

                    <div className={cx('summary-row')}>
                        <span>Tạm tính</span>
                        <span>{formatVND(cartTotal)}</span>
                    </div>

                    <div className={cx('summary-row', 'total-row')}>
                        <span>Tổng cộng</span>
                        <span>{formatVND(finalTotal)}</span>
                    </div>

                    <div className={cx('amount-in-words')}>
                        Bằng chữ: <span>{numberToVietnameseWords(finalTotal)}</span>
                    </div>

                    <div className={cx('checkout-section')}>
                        <Link to="/checkout" className={cx('checkout-btn')}>
                            Tiến hành thanh toán
                        </Link>

                        <Link to="/products" className={cx('continue-shopping')}>
                            hoặc Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() =>
                    setConfirmDialog({ isOpen: false, itemToDelete: null, productName: '' })
                }
                onConfirm={handleConfirmDelete}
                title="Xóa sản phẩm"
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${confirmDialog.productName}" khỏi giỏ hàng?`}
            />
        </div>
    );
}

export default Cart;
