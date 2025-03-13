"use client"; // Add this line at the top of the file

import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import HomeHeader from "@/components/HomeHeader/index";
import HomeFooter from "@/components/HomeFooter/index";
import HomeBoxChat from "@/components/HomeBoxChat/index";
import { useState, useCallback, useRef } from "react"; // Import useRef

export default function HomeSanPhamTuongTu() {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState("/iphone.png"); // Initial main image
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef(null); // Use useRef

  const [selectedGuarantee, setSelectedGuarantee] = useState<string | null>(
    null
  );

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Color Options Array
  const colorOptions = [
    { name: "blue", colorCode: "blue" },
    { name: "white", colorCode: "white" },
    { name: "black", colorCode: "black" },
    { name: "red", colorCode: "red" },
    { name: "beige", colorCode: "beige" },
  ];

  // Storage Options Array
  const storageOptions = ["12-256GB", "16-256GB", "16-512GB"];

  // Guarantee Options
  const guaranteeOptions = [{ name: "BHV Thương 12 Tháng", price: 350000 }];

  // Thumbnail Images Array
  const thumbnailImages = [
    "/iphone.png",
    "/iphone1.png",
    "/iphone.png",
    "/iphone1.png",
    "/iphone.png",
    "/iphone1.png",
  ];

  // Function to handle thumbnail click
  const handleThumbnailClick = useCallback(
    (imageSrc: string) => {
      setMainImage(imageSrc);
      setZoom(1); // Reset zoom when a new image is selected
    },
    [setMainImage]
  );

  // Function to handle guarantee click
  const handleGuaranteeClick = (guaranteeName: string) => {
    setSelectedGuarantee((prevGuarantee) =>
      prevGuarantee === guaranteeName ? null : guaranteeName
    );
  };

  // Function to zoom when you hover
  const handleMouseEnter = () => {
    setZoom(2);
  };

  const handleMouseLeave = () => {
    setZoom(1);
  };

  return (
    <>
      {/* Sản Phẩm */}
      <div className={styles.container}>
        <div className={styles["product-details"]}>
          <div className={styles["product-image"]}>
            <img
              src={mainImage}
              alt="Main Product Image"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <div className={styles["thumbnail-images"]}>
              {thumbnailImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => handleThumbnailClick(image)}
                />
              ))}
            </div>
          </div>

          <div className={styles["product-info"]}>
            <h2>Điện thoại IPHONE 17 PRO MAX</h2>

            <div className={styles.price}>
              7.050.000₫{" "}
              <span className={styles["original-price"]}>8.050.000₫</span>{" "}
              <span className={styles.vat}>(Đã bao gồm VAT)</span>
            </div>

            {/* Quantity */}
            <div className={styles.quantity}>
              <label>Số Lượng:</label>
              <div className={styles["quantity-controls"]}>
                <button onClick={handleDecrement}>-</button>
                <span>{quantity}</span>
                <button onClick={handleIncrement}>+</button>
              </div>
            </div>

            <div className={styles.options}>
              <div className={styles["color-options"]}>
                <label>Màu sắc:</label>
                <div className={styles.colors}>
                  {colorOptions.map((color, index) => (
                    <div
                      key={index}
                      className={`${styles.color} ${
                        selectedColor === color.name ? styles.selected : ""
                      }`}
                      style={{ backgroundColor: color.colorCode }} // Set background color dynamically
                      onClick={() => setSelectedColor(color.name)}
                    ></div>
                  ))}
                </div>
              </div>

              <div className={styles["storage-options"]}>
                <label>Bộ nhớ:</label>
                <div>
                  {storageOptions.map((storage, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedStorage(storage)}
                      className={
                        selectedStorage === storage ? styles.selected : ""
                      }
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Guarantee Options */}
            <div className={styles.guarantee}>
              <label>Gói bảo hành:</label>
              <div>
                {guaranteeOptions.map((guarantee, index) => (
                  <span key={index}>
                    <button
                      onClick={() => handleGuaranteeClick(guarantee.name)}
                      className={`${styles.guaranteeButton} ${
                        selectedGuarantee === guarantee.name
                          ? styles.selected
                          : ""
                      }`}
                    >
                      {guarantee.name} (+{guarantee.price.toLocaleString()}₫)
                    </button>
                    <a
                      href="/guarantee-details"
                      className={styles.guaranteeLink}
                    >
                      (Hướng dẫn)
                    </a>
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles["add-to-cart"]}>
                THÊM VÀO GIỎ HÀNG
              </button>
              <button className={styles["buy-now"]}>MUA NGAY</button>
            </div>
          </div>
        </div>

        <div className={styles.promotions}>
          <h4>Khuyến mãi</h4>
          <div className={styles["promotions-columns"]}>
            <ul className={styles["promotions-left"]}>
              <li>
                (Quý khách <b>Đăng nhập</b> để kiểm tra đơn hàng)
              </li>
              <li>
                - Đà Nẵng: <a>096.123.9797 - Đường đi</a>
              </li>
              <li>
                - Chat online: <a> Chat Facebook</a>
              </li>
              <li>
                - Hà Nội: <a>097.120.6688 - Đường đi</a>
              </li>
              <li>
                - TP HCM: <a>0965.123.123 - Đường đi</a>
              </li>
            </ul>
            <ul className={styles["promotions-right"]}>
              <li>
                Tặng <b>miễn phí BHV</b> lần thứ 5, khi đã mua BHV lần thứ 4.
              </li>
              <li>
                <b>Ưu đãi đặc biệt</b>: Giảm thêm 5% cho khách hàng thân thiết.
              </li>
              <li>
                <b>Miễn phí giao hàng</b> cho đơn hàng từ 2 triệu đồng trở lên.
              </li>
              <li>
                <b>Trả góp 0%</b> qua thẻ tín dụng của các ngân hàng liên kết.
              </li>
              <li>
                Liên hệ để biết thêm chi tiết: <a>info@example.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
