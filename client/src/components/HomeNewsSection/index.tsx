import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss"; // Assuming a separate CSS module

const newsData = [
  {
    src: "/news1.jpg",
    alt: "Ưu đãi cực khủng dành cho S-Student và S-Teacher",
    title: "Ưu đãi 'cực khủng' dành cho S-Student và S-Teacher, khám phá...",
    link: "#",
  },
  {
    src: "/news2.jpg",
    alt: "MediaTek ra mắt Dimensity 6400",
    title:
      "MediaTek ra mắt Dimensity 6400: Chip mới hay 'bình cũ rượu mới' t...",
    link: "#",
  },
  {
    src: "/news3.jpg",
    alt: "Xiaomi 15 Ultra lộ ảnh render",
    title:
      "Xiaomi 15 Ultra lộ ảnh render cho thấy thiết kế hai tông màu ấn tượng",
    link: "#",
  },
  {
    src: "/news4.jpg",
    alt: "Drop Test Galaxy S25 Ultra vs iPhone 16 Pro Max",
    title: "Drop Test Galaxy S25 Ultra vs iPhone 16 Pro Max: Samsung",
    link: "#",
  },
];

export default function HomeNewsSection() {
  return (
    <div className={styles.newsSection}>
      <div className={styles.newsHeader}>
        <h2>TIN CÔNG NGHỆ</h2>
        <Link href="#" className={styles.viewAllButton}>
          Xem tất cả
        </Link>
      </div>
      <div className={styles.newsGrid}>
        {newsData.map((newsItem, index) => (
          <div className={styles.newsItem} key={index}>
            <Link href={newsItem.link}>
              <div className={styles.newsImageContainer}>
                <Image
                  src={newsItem.src}
                  alt={newsItem.alt}
                  width={300} // Adjust as needed
                  height={200} // Adjust as needed
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className={styles.newsTitle}>{newsItem.title}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}