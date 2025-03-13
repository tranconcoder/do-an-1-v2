import styles from "./styles.module.scss";
import Link from "next/link";
import Image from "next/image"; // Import the Image component

import visa from "@/app/assets/icon_footer/icons8-visa.svg";
import mastercard from "@/app/assets/icon_footer/icons8-mastercard-48.svg";
import jcb from "@/app/assets/icon_footer/jcb-svgrepo-com.svg";
import pay from "@/app/assets/icon_footer/payment-method.png";
import qrcode from "@/app/assets/icon_footer/icons8-qr-code-48.png";
import comment from "@/app/assets/icon_footer/icons8-apple-pay.svg";

import ship from "@/app/assets/icon_footer/delivery-bike.png";
import car from "@/app/assets/icon_footer/truck.png";
import cargo from "@/app/assets/icon_footer/cargo-ship.png";

import Facebook from "@/app/assets/images/Facebook.svg";
import tiktok from "@/app/assets/icon_footer/tiktok.png";
import youtube from "@/app/assets/icon_footer/youtube.png";
import Instagram from "@/app/assets/icon_footer/instagram.png";
import shop from "@/app/assets/icon_footer/store.png";
import zalo from "@/app/assets/icon_footer/icons8-zalo.svg";

import airplane from "@/app/assets/images/airplane.svg";
import mobile from "@/app/assets/images/mobile.svg";
import search from "@/app/assets/images/search.svg";
import Google from "@/app/assets/images/Google.svg";

export default function HomeFooter() {
  const supportAndServiceLink = [
    { href: "#", content: "Chính sách mua hàng trả góp" },
    { href: "#", content: "Hướng dẫn mua hàng & vận chuyển" },
    { href: "#", content: "Tra cứu đơn hàng" },
    { href: "#", content: "Chính sách đổi mới & bảo hành" },
    { href: "#", content: "Dịch vụ bảo hành mở rộng" },
    { href: "#", content: "Chính sách bảo mật" },
    { href: "#", content: "Giải quyết khiếu nại" },
    { href: "#", content: "Quy chế hoạt động" },
  ];

  const contactInfoLinks = [
    { href: "#", content: "Thông tin các trang TMĐT" },
    { href: "#", content: "Chăm sóc khách hàng" },
    { href: "#", content: "Dịch vụ sửa chữa Hoàng Hà Care" },
    { href: "#", content: "Khách hàng doanh nghiệp (B2B)" },
    { href: "#", content: "Tuyển dụng" },
    { href: "#", content: "Tra cứu bảo hành" },
  ];

  return (
    <footer className={styles.mainFooter}>
      <div className={styles.container}>
        <div className={styles.footerColumns}>
          <div className={styles.footerSection}>
            <h3>Hỗ trợ - Dịch vụ</h3>
            <ul>
              {supportAndServiceLink.map((item, index) => (
                <li key={index}>
                  <Link href={item.href}>{item.content}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Thông tin liên hệ</h3>
            <ul>
              {contactInfoLinks.map((item, index) => (
                <li key={index}>
                  <Link href={item.href}>{item.content}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Thanh toán miễn phí</h3>
            <div className={styles.paymentMethods}>
              <Image src={visa} alt="Visa" width={24} height={24} />
              <Image src={mastercard} alt="Mastercard" width={24} height={24} />
              <Image src={jcb} alt="JCB" width={24} height={24} />
              <Image src={pay} alt="Apple Pay" width={24} height={24} />
              <Image src={qrcode} alt="VNPay" width={24} height={24} />
              <Image src={comment} alt="ZaloPay" width={24} height={24} />
            </div>
            <h3>Hình thức vận chuyển</h3>
            <div className={styles.shippingMethods}>
              <Image src={ship} alt="Nhat Tin" width={24} height={24} />
              <Image src={car} alt="Vietnam Post" width={24} height={24} />
              <Image src={cargo} alt="cargo Ship" width={24} height={24} />
            </div>
          </div>

          <div className={styles.footerSection}>
            <h3>Tổng đài hỗ trợ</h3>
            <p className={styles.hotline}>1900.2091</p>
            <h3>Kết nối với chúng tôi</h3>
            <div className={styles.socialIcons}>
              <a href="#">
                <Image src={Facebook} alt="Facebook" width={24} height={24} />
              </a>
              <a href="#">
                <Image src={tiktok} alt="Tiktok" width={24} height={24} />
              </a>
              <a href="#">
                <Image src={youtube} alt="Youtube" width={24} height={24} />
              </a>
              <a href="#">
                <Image src={Instagram} alt="Instagram" width={24} height={24} />
              </a>
              <a href="#">
                <Image src={shop} alt="Shopee" width={24} height={24} />
              </a>
              <a href="#">
                <Image src={zalo} alt="Zalo" width={24} height={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>
          © 2024. CÔNG TY CỔ PHẦN XÂY DỰNG VÀ ĐẦU TƯ THƯƠNG MẠI HOÀNG HÀ. MST:
          0106713191.
        </p>
        <p>GP số 426/GP-TTĐT do sở TTTT Hà Nội cấp ngày 22/01/2021</p>
        <p>
          Địa chỉ: Số 89 Đường Tam Trinh, Phường Mai Động, Quận Hoàng Mai, Hà
          Nội, Việt Nam.
        </p>
      </div>
    </footer>
  );
}
