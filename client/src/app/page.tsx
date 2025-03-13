"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.scss";
import HomeHeader from "@/components/HomeHeader/index";
import HomeFooter from "@/components/HomeFooter/index";
import HomeBoxChat from "@/components/HomeBoxChat/index";
import HomeFeaturedPhones from "@/components/HomeFeaturedPhones";
import HomeAccessory from "@/components/HomeAccessory";
import HomeCategories from "@/components/HomeCategories/index";
import HomeNewsSection from "@/components/HomeNewsSection/index";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  AiFillStar,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

// Mock data for products (replace with your actual data)
const products = [
  {
    id: 1,
    name: "iPhone 15 Pro 256GB",
    image: "/iphone.png",
    originalPrice: 32990000,
    discountedPrice: 29990000,
    discount: 9,
    installment: 0,
    rating: 4.7,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    image: "/iphone1.png",
    originalPrice: 33990000,
    discountedPrice: 30990000,
    discount: 8,
    installment: 0,
    rating: 4.5,
  },
  {
    id: 3,
    name: "Xiaomi 14 Pro",
    image: "/iphone.png",
    originalPrice: 28990000,
    discountedPrice: 26990000,
    discount: 7,
    installment: 0,
    rating: 4.3,
  },
  {
    id: 4,
    name: "Oppo Find X7 Pro",
    image: "/iphone1.png",
    originalPrice: 29990000,
    discountedPrice: 27990000,
    discount: 6,
    installment: 0,
    rating: 4.0,
  },
  {
    id: 5,
    name: "Google Pixel 8 Pro",
    image: "/iphone.png",
    originalPrice: 31990000,
    discountedPrice: 29990000,
    discount: 5,
    installment: 0,
    rating: 3.9,
  },
  {
    id: 6,
    name: "Vivo X100 Pro",
    image: "/iphone1.png",
    originalPrice: 27990000,
    discountedPrice: 25990000,
    discount: 4,
    installment: 0,
    rating: 3.7,
  },
  {
    id: 7,
    name: "OnePlus 12",
    image: "/iphone.png",
    originalPrice: 26990000,
    discountedPrice: 24990000,
    discount: 3,
    installment: 0,
    rating: 3.5,
  },
  {
    id: 8,
    name: "Honor Magic6 Pro",
    image: "/iphone1.png",
    originalPrice: 25990000,
    discountedPrice: 23990000,
    discount: 2,
    installment: 0,
    rating: 3.3,
  },
];

const bannerImages = ["/qc1.webp", "/qc2.jpg"];

const videoUrls = [
  "https://www.youtube.com/embed/xv9UmH3RsX0?si=KI76NTiTHvb-t5Vc",
  "https://www.youtube.com/embed/mRApZVPSsps?si=eI2jtTt4vGWKPcrf",
];

const HomeSlider = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const goToPreviousImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  }, [bannerImages.length]);

  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [bannerImages.length]);

  useEffect(() => {
    let imageIntervalId: NodeJS.Timeout | null = null;
    if (!isMouseOver) {
      imageIntervalId = setInterval(() => {
        goToNextImage();
      }, 3000);
    }

    return () => {
      if (imageIntervalId) {
        clearInterval(imageIntervalId);
      }
    };
  }, [goToNextImage, isMouseOver]);

  return (
    <div className={styles.homeSliderContainer}>
      <div
        className={styles.carouselContainer}
        onMouseEnter={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
      >
        <Image
          src={bannerImages[currentImageIndex]}
          alt={`Carousel Image ${currentImageIndex + 1}`}
          width={700}
          height={300}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          priority
        />
        <div className={styles.carouselButtons}>
          <button onClick={goToPreviousImage} className={styles.carouselButton}>
            <BsChevronLeft />
          </button>
          <button onClick={goToNextImage} className={styles.carouselButton}>
            <BsChevronRight />
          </button>
        </div>
      </div>

      <div className={styles.videoGrid}>
        {videoUrls.map((url, index) => (
          <div className={styles.videoContainer} key={index}>
            <iframe
              width="100%"
              height="100%"
              src={url}
              title={`YouTube video player ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

// Function for throttling scroll updates
function throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export default function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const [isProductHovered, setIsProductHovered] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const productListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition =
        document.body.scrollTop || document.documentElement.scrollTop;
      setScrollPosition(currentScrollPosition); // Track scroll position
      setShowBackToTop(currentScrollPosition > 20);
      setShowSupport(currentScrollPosition > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSupportOptions = () => {
    setShowSupportOptions((prevState) => !prevState);
  };

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(9, 49, 5, 0);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const goToPreviousProduct = () => {
    if (productListRef.current) {
      const itemWidth = 286;
      productListRef.current.scrollLeft -= itemWidth;
    }
  };

  const goToNextProduct = () => {
    if (productListRef.current) {
      const itemWidth = 286;
      productListRef.current.scrollLeft += itemWidth;
    }
  };

  useEffect(() => {
    let productIntervalId: NodeJS.Timeout | null = null;

    const startAutoScroll = () => {
      productIntervalId = setInterval(() => {
        if (productListRef.current) {
          const itemWidth = 286;
          const scrollWidth = productListRef.current.scrollWidth;
          const clientWidth = productListRef.current.clientWidth;
          let scrollLeft = productListRef.current.scrollLeft; // Get current scrollLeft

          // Check if we're at or past the end
          if (scrollLeft + clientWidth >= scrollWidth - 1) {
            //Subtract 1 to account for rounding errors
            productListRef.current.scrollLeft = 0; // Reset to start
          } else {
            // Throttle the scroll update to improve performance
            const throttledScroll = throttle((newScrollLeft: number) => {
              if (productListRef.current) {
                // Check if productListRef.current exists
                productListRef.current.scrollLeft = newScrollLeft;
              }
            }, 100); // Limit to 1 update every 100ms

            throttledScroll(scrollLeft + itemWidth);
          }
        }
      }, 3000); // Adjust scroll speed as needed
    };

    startAutoScroll();

    return () => {
      if (productIntervalId) {
        clearInterval(productIntervalId);
      }
    };
  }, []);

  const handleAddToCart = (productId: number) => {
    console.log(`Added product with ID ${productId} to cart`);
  };

  const handleBuyNow = (productId: number) => {
    console.log(`Buy now product with ID ${productId}`);
  };

  return (
    <>
      <HomeHeader />
      <HomeBoxChat />
      <HomeSlider />
      {/* Hotsale Cuoi Tuan  */}
      <div className={styles.hotsaleSection}>
        <h2 className={styles.hotsaleTitle}>Hotsale cuối tuần</h2>
        <div className={styles.countdownTimer}>
          Kết thúc sau:{" "}
          <span>
            {String(countdown.days).padStart(2, "0")} :{" "}
            {String(countdown.hours).padStart(2, "0")} :{" "}
            {String(countdown.minutes).padStart(2, "0")} :{" "}
            {String(countdown.seconds).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.productListContainer}>
          <button
            className={styles.productScrollButton}
            onClick={goToPreviousProduct}
          >
            <BsChevronLeft />
          </button>
          <div className={styles.productList} ref={productListRef}>
            {products.map((product) => (
              <div
                key={product.id}
                className={styles.productItem}
                onMouseEnter={() => setIsProductHovered(product.id)}
                onMouseLeave={() => setIsProductHovered(null)}
              >
                <div className={styles.discountLabel}>
                  Giảm {product.discount}%
                </div>
                <div className={styles.installmentLabel}>Trả góp 0%</div>
                <div className={styles.imageContainer}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>

                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceContainer}>
                  <span className={styles.discountedPrice}>
                    {product.discountedPrice.toLocaleString("vi-VN")}₫
                  </span>
                  <span className={styles.originalPrice}>
                    {product.originalPrice.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <p className={styles.description}>
                  Trả góp 0% - Ưu đãi độc quyền
                </p>
                <div className={styles.rating}>
                  {[...Array(5)].map((_, index) => (
                    <AiFillStar
                      key={index}
                      className={styles.star}
                      color={
                        index < Math.floor(product.rating) ? "#ffc107" : "#ddd"
                      }
                    />
                  ))}
                </div>
                <div className={styles.buttonContainer}>
                  <button
                    className={styles.addToCartButton}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    className={styles.buyNowButton}
                    onClick={() => handleBuyNow(product.id)}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className={styles.productScrollButton}
            onClick={goToNextProduct}
          >
            <BsChevronRight />
          </button>
        </div>
      </div>
      {/* Hotsale Cuoi Tuan  */}
      <HomeFeaturedPhones />
      <HomeAccessory />
      <HomeNewsSection />
      <HomeFooter />
    </>
  );
}
