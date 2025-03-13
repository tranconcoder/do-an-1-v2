import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss";

// Define the data for your accessories
const accessoriesData = [
  {
    src: "/tainghe.png",
    alt: "Tai nghe AirPods 2",
    name: "Tai nghe AirPods 2",
    price: "139.000 đ",
  },
  {
    src: "/tainghe.png",
    alt: "Tai nghe AirPods Pro",
    name: "Tai nghe AirPods Pro",
    price: "149.000 đ",
  },
  {
    src: "/tainghe.png",
    alt: "Tai nghe AirPods 3",
    name: "Tai nghe AirPods 3",
    price: "149.000 đ",
  },
  {
    src: "/bosacdt.png",
    alt: "Củ cáp sạc Xiaomi 45W",
    name: "Củ cáp sạc Xiaomi 45W",
    price: "40.000 đ",
  },
  {
    src: "/bosacdt.png",
    alt: "Củ cáp sạc Xiaomi 120W",
    name: "Củ cáp sạc Xiaomi 120W",
    price: "70.000 đ",
  },
  {
    src: "/bosacdt.png",
    alt: "Củ cáp sạc Xiaomi 67W",
    name: "Củ cáp sạc Xiaomi 67W",
    price: "180.000 đ",
  },
  {
    src: "/sacduphong.png",
    alt: "Sạc dự phòng Pisen Quick QP3",
    name: "Sạc dự phòng Pisen Quick QP3",
    price: "299.000 đ",
  },
  {
    src: "/sacduphong.png",
    alt: "Sạc dự phòng Pisen Quick QP3",
    name: "Sạc dự phòng Pisen Quick QP3",
    price: "299.000 đ",
  },
  {
    src: "/solanh.png",
    alt: "Quạt tản nhiệt MEMO CX02",
    name: "Quạt tản nhiệt MEMO CX02",
    price: "187.000 đ",
  },
  {
    src: "/solanh.png",
    alt: "Quạt tản nhiệt điện thoại MEMO CXA3",
    name: "Quạt tản nhiệt điện thoại MEMO CXA3",
    price: "189.000 đ",
  },
];

const imgAnhPhuKien = { src: "/phukien.webp" };

export default function HomeAccessory() {
  return (
    <div className={styles.container}>
      {/* Code Phần Phụ Kiện */}
      <div className={styles.accessoriesImage}>
        <Image
          src={imgAnhPhuKien.src}
          alt="Phụ kiện"
          width={1200}
          height={300}
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className={styles.accessoriesSection}>
        <div className={styles.accessoriesHeader}>
          <p>
            <Link href="#">Phụ kiện</Link>
          </p>
          <p>
            <Link href="#">Tai nghe</Link>
          </p>
          <p>
            <Link href="#">Pin Điên Thoại</Link>
          </p>
          <p>
            <Link href="#">Ốp Lưng</Link>
          </p>

          <p>
            <Link href="#">Đồ chơi công nghệ</Link>
          </p>
          <p>
            <Link href="#">Củ Sạc</Link>
          </p>
          <p>
            <Link href="#">Cáp Sạc</Link>
          </p>
          <p>
            <Link href="#">Pin sạc dự phòng</Link>
          </p>
        </div>

        <div className={styles.accessoriesGrid}>
          {accessoriesData.map((accessory, index) => (
            <div className={styles.accessoryItem} key={index}>
              <div className={styles.accessoryImageContainer}>
                <Image
                  src={accessory.src}
                  alt={accessory.alt}
                  width={150} // Increased size
                  height={150} // Increased size
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className={styles.accessoryName}>{accessory.name}</p>
              <p className={styles.accessoryPrice}>
                {accessory.price} <Link href="#">MUA</Link>
              </p>
            </div>
          ))}
        </div>

        <button className={styles.viewMoreButton}>Xem thêm Phụ kiện</button>
      </div>
      {/* Code Phần Phụ Kiện */}
    </div>
  );
}
