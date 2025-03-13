"use client"; // Add this line at the top of the file

import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef } from "react"; // Import useState, useEffect, useRef
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faHeart } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

export default function HomeSanPhamTuongTu() {
  const initialProducts = [
    {
      id: 1, // Add a unique ID
      name: "Samsung Galaxy A55 5G 8GB 128GB",
      price: "8.990.000",
      originalPrice: "9.990.000",
      discount: "10%",
      installment: true,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/samsung-a55",
      rating: 4,
    },
    {
      id: 2, // Add a unique ID
      name: "OPPO Reno12 5G 12GB 256GB",
      price: "9.790.000",
      originalPrice: "12.990.000",
      discount: "25%",
      installment: false,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/oppo-reno12",
      rating: 5,
    },
    {
      id: 3, // Add a unique ID
      name: "Nothing Phone 2A Plus 5G 12GB 256GB - Chỉ có tại CellphoneS",
      price: "9.390.000",
      originalPrice: "11.490.000",
      discount: "18%",
      installment: true,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/nothing-phone-2a",
      rating: 3,
    },
    {
      id: 4, // Add a unique ID
      name: "Xiaomi Redmi Note 13 Pro Plus 5G 8GB 256GB",
      price: "8.290.000",
      originalPrice: "10.990.000",
      discount: "25%",
      installment: false,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/xiaomi-redmi-note-13",
      rating: 4,
    },
    {
      id: 5, // Add a unique ID
      name: "Redmi Note 13 Pro 5G 12GB 512GB",
      price: "9.290.000",
      originalPrice: "10.990.000",
      discount: "15%",
      installment: true,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/redmi-note-13-pro",
      rating: 5,
    },
    {
      id: 6, // Add a unique ID
      name: "Samsung Galaxy A55 5G 8GB 128GB",
      price: "8.990.000",
      originalPrice: "9.990.000",
      discount: "10%",
      installment: true,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/samsung-a55",
      rating: 4,
    },
    {
      id: 7, // Add a unique ID
      name: "OPPO Reno12 5G 12GB 256GB",
      price: "9.790.000",
      originalPrice: "12.990.000",
      discount: "25%",
      installment: false,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/oppo-reno12",
      rating: 5,
    },
    {
      id: 8, // Add a unique ID
      name: "Nothing Phone 2A Plus 5G 12GB 256GB - Chỉ có tại CellphoneS",
      price: "9.390.000",
      originalPrice: "11.490.000",
      discount: "18%",
      installment: true,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/nothing-phone-2a",
      rating: 3,
    },
    {
      id: 9, // Add a unique ID
      name: "Xiaomi Redmi Note 13 Pro Plus 5G 8GB 256GB",
      price: "8.290.000",
      originalPrice: "10.990.000",
      discount: "25%",
      installment: false,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/xiaomi-redmi-note-13",
      rating: 4,
    },
    {
      id: 10, // Add a unique ID
      name: "Redmi Note 13 Pro 5G 12GB 512GB",
      price: "9.290.000",
      originalPrice: "10.990.000",
      discount: "15%",
      installment: true,
      imageUrl: "/iphone1.png", // Replace with correct image
      link: "/redmi-note-13-pro",
      rating: 5,
    },
  ];

  const productListRef = useRef<HTMLDivElement>(null);
  const [scrollDirection, setScrollDirection] = useState<
    "forward" | "backward"
  >("forward");
  const [scrollAmount, setScrollAmount] = useState(230);
  useEffect(() => {
    const productCardWidth = 230; // The width of a single product card (including any margin/padding)

    const scrollInterval = setInterval(() => {
      if (productListRef.current) {
        const scrollWidth = productListRef.current.scrollWidth;
        const clientWidth = productListRef.current.clientWidth;
        let currentScrollLeft = productListRef.current.scrollLeft;

        // Determine direction change
        if (
          scrollDirection === "forward" &&
          currentScrollLeft + productCardWidth >= scrollWidth - clientWidth
        ) {
          setScrollDirection("backward");
        } else if (
          scrollDirection === "backward" &&
          currentScrollLeft <= productCardWidth
        ) {
          setScrollDirection("forward");
        }

        // Update scroll position based on direction - scroll amount now equal card size
        let newScrollLeft =
          currentScrollLeft +
          (scrollDirection === "forward"
            ? productCardWidth
            : -productCardWidth);

        productListRef.current.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        });
      }
    }, 3000); // scroll every 3 seconds

    return () => clearInterval(scrollInterval); // clean up on unmount
  }, [scrollDirection]);

  const renderStars = (rating: number) => {
    // Explicitly define the type of rating
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <FontAwesomeIcon key={i} icon={faStar} className={styles.starIcon} />
        );
      } else {
        stars.push(
          <FontAwesomeIcon
            key={i}
            icon={faStarRegular}
            className={styles.starIcon}
          />
        );
      }
    }
    return stars;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sản Phẩm Tương Tự</h2>
      <div className={styles.productList} ref={productListRef}>
        {initialProducts.map((product) => (
          <div className={styles.productCard} key={product.id}>
            <Link href={product.link} className={styles.productLink}>
              {product.discount && (
                <div className={styles.discountBadge}>
                  Giảm {product.discount}
                </div>
              )}
              {product.installment && (
                <div className={styles.installmentBadge}>Trả góp 0%</div>
              )}
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={150}
                height={150}
                className={styles.productImage}
              />
              <h3 className={styles.productName}>{product.name}</h3>
              <div className={styles.priceContainer}>
                <p className={styles.productPrice}>{product.price} ₫</p>
                {product.originalPrice && (
                  <p className={styles.productOriginalPrice}>
                    {product.originalPrice} ₫
                  </p>
                )}
              </div>
              <div className={styles.ratingContainer}>
                {renderStars(product.rating)}
                <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
