// Styles
import styles from "./styles.module.scss";
import HomeCategories from "@/components/HomeCategories/index";

// Components
import Image from "next/image";
import Link from "next/link";

export default function HomeHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>iPhone Store</div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        </div>
        <ul className={styles.menu}>
          <li>
            <Link href="#">Trang Chủ</Link>
          </li>
          <li>
            <Link href="#">Tin Tức</Link>
          </li>
          <li>
            <Link href="#">Giới Thiệu</Link>
          </li>
          <li>
            <Link href="#">Liên Hệ</Link>
          </li>
          <li>
            <Link href="#contact">Người Dùng</Link>
            <ul className={styles.dropdown}>
              <li>
                <Link href="#">Đăng Nhập</Link>
              </li>
              <li>
                <Link href="#">Đăng Ký</Link>
              </li>
              <li>
                <Link href="#">Quên Mật Khẩu</Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
}
