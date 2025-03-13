// src/components/FeaturedPhones/index.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react"; // Import useRef
import { AiFillStar, AiOutlineShoppingCart } from "react-icons/ai";
import styles from "./styles.module.scss";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface Phone {
  id: number;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  rating: number;
}

// Sample Data - replace with your actual data source
const phoneData: Phone[] = [
  {
    id: 1,
    name: "Samsung Galaxy S23 Ultra 128GB",
    image: "/iphone.png",
    originalPrice: 32880000,
    discountedPrice: 28990000,
    discountPercent: 12,
    rating: 4.5,
  },
  {
    id: 2,
    name: "iPhone 16 Pro Max 256GB",
    image: "/iphone.png",
    originalPrice: 34780000,
    discountedPrice: 32780000,
    discountPercent: 6,
    rating: 4.8,
  },
  {
    id: 3,
    name: "Xiaomi Redmi Note 14",
    image: "/iphone.png",
    originalPrice: 5880000,
    discountedPrice: 4880000,
    discountPercent: 9,
    rating: 4.0,
  },
  {
    id: 4,
    name: "Samsung Galaxy S24 FE 5G",
    image: "/iphone.png",
    originalPrice: 15880000,
    discountedPrice: 13880000,
    discountPercent: 10,
    rating: 4.2,
  },
  {
    id: 5,
    name: "iPhone 16 Pro 128GB",
    image: "/iphone.png",
    originalPrice: 29480000,
    discountedPrice: 27480000,
    discountPercent: 5,
    rating: 4.6,
  },
  {
    id: 6,
    name: "Samsung Galaxy A15 LTE",
    image: "/iphone.png",
    originalPrice: 4880000,
    discountedPrice: 4280000,
    discountPercent: 14,
    rating: 4.3,
  },
  {
    id: 7,
    name: "OPPO Reno13 F 8GB",
    image: "/iphone.png",
    originalPrice: 9880000,
    discountedPrice: 8880000,
    discountPercent: 9,
    rating: 4.4,
  },
  {
    id: 8,
    name: "Xiaomi 14T 12GB",
    image: "/iphone.png",
    originalPrice: 13880000,
    discountedPrice: 12880000,
    discountPercent: 7,
    rating: 4.1,
  },
  {
    id: 9,
    name: "iPhone 15 128GB",
    image: "/iphone.png",
    originalPrice: 20880000,
    discountedPrice: 18880000,
    discountPercent: 10,
    rating: 4.7,
  },
  {
    id: 10,
    name: "iPhone 14 Pro Max 128GB",
    image: "/iphone.png",
    originalPrice: 28680000,
    discountedPrice: 25680000,
    discountPercent: 12,
    rating: 4.9,
  },
];

const HomeFeaturedPhones = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemWidth = 280; // Adjust as needed
  const totalItems = phoneData.length;

  useEffect(() => {
    const interval = setInterval(() => {
      scrollRight();
    }, 5000); // Auto-scroll every 5 seconds
    return () => clearInterval(interval);
  }, [scrollPosition]);

  const scrollLeft = () => {
    if (containerRef.current) {
      const newPosition = Math.max(scrollPosition - itemWidth, 0);
      setScrollPosition(newPosition);
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const newPosition = Math.min(
        scrollPosition + itemWidth,
        containerRef.current.scrollWidth - containerRef.current.offsetWidth
      );
      setScrollPosition(newPosition);
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current!.offsetLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current!.offsetLeft;
    const walk = (x - startX) * 1.2; //scroll-fast
    containerRef.current!.scrollLeft = scrollPosition - walk;
    // setScrollPosition(scrollPosition - walk);
  };

  return (
    <section className={styles.featuredPhonesSection}>
      <h2 className={styles.sectionTitle}>ĐIỆN THOẠI NỔI BẬT NHẤT</h2>
      <div className={styles.sliderContainer}>
        <button className={styles.scrollButton} onClick={scrollLeft}>
          <BsChevronLeft />
        </button>
        <div
          className={styles.phoneGrid}
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {phoneData.map((phone) => (
            <div key={phone.id} className={styles.phoneItem}>
              <div className={styles.discountLabel}>
                Giảm {phone.discountPercent}%
              </div>
              <div className={styles.installmentLabel}>Trả góp 0%</div>
              <div className={styles.imageContainer}>
                <Image
                  src={phone.image}
                  alt={phone.name}
                  width={200}
                  height={200}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <h3 className={styles.phoneName}>{phone.name}</h3>
              <div className={styles.priceContainer}>
                <span className={styles.discountedPrice}>
                  {phone.discountedPrice.toLocaleString("vi-VN")}₫
                </span>
                <span className={styles.originalPrice}>
                  {phone.originalPrice.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className={styles.description}>
                Sản phẩm giảm thêm đến 300.000đ Không phí chuyển đổi khi trả góp
                0% 
              </div>
              <div className={styles.rating}>
                {[...Array(5)].map((_, index) => (
                  <AiFillStar
                    key={index}
                    className={styles.star}
                    color={index < phone.rating ? "#ffc107" : "#ddd"}
                  />
                ))}
              </div>
              <div className={styles.buttonContainer}>
                <button className={styles.addToCartButton}>Giỏ Hàng</button>
                <button className={styles.buyNowButton}>Mua ngay</button>
              </div>
            </div>
          ))}
        </div>
        <button className={styles.scrollButton} onClick={scrollRight}>
          <BsChevronRight />
        </button>
      </div>
      <div className={styles.viewAll}>
        <Link href="/all-phones">Xem tất cả</Link>
      </div>
    </section>
  );
};

export default HomeFeaturedPhones;
