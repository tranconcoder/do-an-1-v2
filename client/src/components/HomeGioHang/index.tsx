"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.scss";

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selected: boolean;
  dateAdded: string;
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "IPHONE 16 PRO MAX",
    image: "/iphone.png",
    price: 120000,
    quantity: 2,
    selected: false,
    dateAdded: new Date().toLocaleDateString(),
  },
  {
    id: 2,
    name: "IPHONE 1 PRO MAX",
    image: "/iphone1.png",
    price: 250000,
    quantity: 1,
    selected: false,
    dateAdded: new Date().toLocaleDateString(),
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  // Handlers
  const handleQuantityChange = useCallback(
    (itemId: number, newQuantity: number) => {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, newQuantity) }
            : item
        )
      );
    },
    []
  );

  const handleRemoveItem = useCallback((itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const handleSelectItem = useCallback(
    (itemId: number, isSelected: boolean) => {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, selected: isSelected } : item
        )
      );
    },
    []
  );

  const handleSelectAll = useCallback((isSelected: boolean) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => ({ ...item, selected: isSelected }))
    );
  }, []);

  const handleRemoveSelected = useCallback(() => {
    setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
  }, []);

  // Memoized Values
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        item.selected ? total + item.price * item.quantity : total,
      0
    );
  }, [cartItems]);

  const hasSelectedItems = useMemo(
    () => cartItems.some((item) => item.selected),
    [cartItems]
  );

  const allItemsSelected = useMemo(
    () => cartItems.length > 0 && cartItems.every((item) => item.selected),
    [cartItems]
  );

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Giỏ hàng của bạn</h1>

      {/* Actions: Select All and Remove Selected */}
      <div className={styles.cartActions}>
        <label className={styles.selectAllLabel}>
          <input
            type="checkbox"
            checked={allItemsSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            aria-label="Chọn tất cả" //Accessibility
          />
          Chọn tất cả
        </label>
        {hasSelectedItems && (
          <button
            className={styles.removeSelectedButton}
            onClick={handleRemoveSelected}
            aria-label="Xóa các sản phẩm đã chọn" //Accessibility
          >
            Xóa sản phẩm đã chọn
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link href="/" aria-label="Tiếp tục mua sắm">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className={styles.cartItems}>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                aria-label={`Chọn ${item.name} để thanh toán`} //Accessibility
              />
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className={styles.itemImage}
                onError={(e) => {
                  console.error("Image failed to load", item.image);
                }}
              />
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemPrice}>
                  {item.price.toLocaleString()} VNĐ
                </p>
                <p className={styles.itemDate}>Ngày thêm: {item.dateAdded}</p>
              </div>
              <div className={styles.quantityControls}>
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  aria-label={`Giảm số lượng ${item.name}`} //Accessibility
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                  aria-label={`Tăng số lượng ${item.name}`} //Accessibility
                >
                  +
                </button>
              </div>
              <p className={styles.itemTotal}>
                {(item.price * item.quantity).toLocaleString()} VNĐ
              </p>
              <FontAwesomeIcon
                icon={faTrash}
                onClick={() => handleRemoveItem(item.id)}
                className={styles.deleteIcon}
                aria-label={`Xóa ${item.name} khỏi giỏ hàng`} //Accessibility
              />
            </div>
          ))}
        </div>
      )}

      <div className={styles.cartFooter}>
        <strong>Tổng cộng: {totalPrice.toLocaleString()} VNĐ</strong>
        <button
          className={styles.checkoutButton}
          disabled={!hasSelectedItems}
          aria-label="Thanh toán" //Accessibility
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}
