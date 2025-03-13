// components/HomeCategories/index.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss";

import mobile from "@/app/assets/images/iconHomeCategories/mobile.png";
import tablet from "@/app/assets/images/iconHomeCategories/table.png";
import laptop from "@/app/assets/images/iconHomeCategories/laptop.png";
import tv from "@/app/assets/images/iconHomeCategories/tv.png";
import accessories from "@/app/assets/images/iconHomeCategories/game.png";
import smartwatch from "@/app/assets/images/iconHomeCategories/smartwatch.png";
import headphone from "@/app/assets/images/iconHomeCategories/headphone.png";
import repair from "@/app/assets/images/iconHomeCategories/repair.png";

const HomeCategories = () => {
  const categories = [
    {
      name: "Điện thoại",
      image: mobile,
      subcategories: ["iPhone", "Samsung", "Xiaomi", "Other"],
    },
    {
      name: "Máy tính bảng",
      image: tablet,
      subcategories: ["iPad", "Samsung Tab", "Lenovo Tab", "Other"],
    },
    {
      name: "Laptop",
      image: laptop,
      subcategories: ["MacBook", "Dell", "HP", "Lenovo"],
    },
    {
      name: "Phụ Kiện",
      image: accessories,
      subcategories: ["Sạc Dự Phòng", "Sò Lạnh", "Bluetooth Speakers", "Other"],
    },
  ];

  return (
    <div className={styles.categoriesContainer}>
      {categories.map((category) => (
        <div key={category.name} className={styles.categoryItem}>
          <Link href="#" className={styles.categoryLink}>
            <Image
              src={category.image}
              alt={category.name}
              width={50}
              height={50}
            />
            <span>{category.name}</span>
          </Link>
          <ul className={styles.subcategoryList}>
            {category.subcategories.map((subcategory) => (
              <li key={subcategory} className={styles.subCategoryListItem}>
                <Link href="#">{subcategory}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default HomeCategories;
