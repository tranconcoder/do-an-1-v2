import styles from "./styles.module.scss";
import Image from "next/image";
import Link from "next/link";
import HomeHeader1 from "@/components/HomeHeader1/index";
import HomeFooter from "@/components/HomeFooter/index";

export default function QuenMatKhau() {
  return (
    <>
      <HomeHeader1 />
      <div className={styles["outside-container"]}>
        <div className={styles["login-container"]}>
          <h1>Quên Mật Khẩu</h1>
          <div className={styles["social-buttons"]}>
            <button className={styles["google-button"]}>
              <Image
                src="/Google.svg"
                alt="Google Login"
                width={32}
                height={32}
              />
              <span>Đăng nhập với Google</span>
            </button>
          </div>

          <div className={styles["separator"]}>
            <span>Hoặc</span>
          </div>

          <form action="#" method="post" className={styles["login-form"]}>
            <div className={styles["form-group"]}>
              <input type="text" id="phone" name="phone" placeholder=" " />
              <label htmlFor="phone">Số Điện Thoại</label>
            </div>

            <div className={styles["form-group"]}>
              <input type="email" id="email" name="email" placeholder=" " />
              <label htmlFor="email">Gmail</label>
            </div>

            <div className={styles["button-group"]}>
              <button type="submit" className={styles["register-button"]}>
                Quên Mật Khẩu
              </button>
            </div>
          </form>

          <div className={styles["auth-links"]}>
            <Link href="/DangKy" className={styles["register-button"]}>
              Đăng Ký
            </Link>
            <Link href="/DangNhap" className={styles["login-button"]}>
              Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
      <HomeFooter />
    </>
  );
}
