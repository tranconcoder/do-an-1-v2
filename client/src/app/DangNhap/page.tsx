import styles from "./styles.module.scss";
import Image from "next/image";
import Link from "next/link";
import HomeHeader1 from "@/components/HomeHeader1/index";
import HomeFooter from "@/components/HomeFooter/index";

export default function DangNhap() {
  return (
    <>
      <HomeHeader1 />
      <div className={styles["outside-container"]}>
        <div className={styles["login-container"]}>
          <h1>Đăng Nhập</h1>
          <div className={styles["social-buttons"]}>
            <button className={styles["google-button"]}>
              <Image
                src="/Google.svg"
                alt="Google Login"
                width={32}
                height={32}
              />
              <span>Tiếp tục với Google</span>
            </button>
          </div>
          <div className={styles["separator"]}>
            <span>Hoặc</span>
          </div>
          <form action="#" method="post" className={styles["login-form"]}>
            <div className={styles["form-group"]}>
              <input
                type="text"
                id="username"
                name="username"
                placeholder=" "
              />
              <label htmlFor="username">
                Tài khoản / Số điện thoại / Email
              </label>
            </div>
            <div className={styles["form-group"]}>
              <input
                type="password"
                id="password"
                name="password"
                placeholder=" "
              />
              <label htmlFor="password">Mật khẩu</label>
            </div>
            <div className={styles["remember-me"]}>
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Nhớ đăng nhập</label>
            </div>

            <div className={styles["button-group"]}>
              <button type="submit" className={styles["login-button"]}>
                Đăng nhập
              </button>
              <button type="button" className={styles["register-button"]}>
                Đăng ký
              </button>
            </div>
          </form>
          <div className={styles["forgot-password"]}>
            <a href="#">Quên mật khẩu?</a>
          </div>
        </div>
      </div>
      <HomeFooter />
    </>
  );
}
