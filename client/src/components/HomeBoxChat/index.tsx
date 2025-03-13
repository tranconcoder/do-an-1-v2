"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useEffect, useState } from "react";

// Import the icons from the asset
import airplane from "@/app/assets/images/airplane.svg";
import car from "@/app/assets/images/car.svg";
import comment from "@/app/assets/images/comment.svg";
import Facebook from "@/app/assets/images/Facebook.svg";
import Instagram from "@/app/assets/images/instagram.svg";
import jcb from "@/app/assets/images/jcb.svg";
import tiktok from "@/app/assets/images/tiktok.svg";
import visa from "@/app/assets/images/visa.svg";
import youtube from "@/app/assets/images/youtube.svg";
import mobile from "@/app/assets/images/mobile.svg";
import pay from "@/app/assets/images/pay.svg";
import qrcode from "@/app/assets/images/qrcode.svg";
import search from "@/app/assets/images/search.svg";
import ship from "@/app/assets/images/ship.svg";
import shop from "@/app/assets/images/shop.svg";
import mastercard from "@/app/assets/images/mastercard.svg";
import Google from "@/app/assets/images/Google.svg";

export default function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showSupportOptions, setShowSupportOptions] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        document.body.scrollTop || document.documentElement.scrollTop;
      setShowBackToTop(scrollPosition > 20);
      setShowSupport(scrollPosition > 20);
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

  return (
    <div>
      {/* Phần NÚT TRỞ VỀ VÀ HỖ TRỢ */}
      {showBackToTop && (
        <button
          className={styles.backToTopBtn}
          onClick={backToTop}
          title="Go to top"
        >
          <Image src="/MuiTen.webp" alt="Mũi tên lên" width={30} height={30} />
        </button>
      )}

      {showSupport && (
        <button className={styles.supportButton} onClick={toggleSupportOptions}>
          <Image src={comment} alt="Hỗ Trợ" width={30} height={30} /> hỗ trợ?
        </button>
      )}

      {showSupportOptions && (
        <div className={styles.supportOptions}>
          <button
            className={styles.closeSupportOptions}
            onClick={toggleSupportOptions}
          />
          <a href="#">
            <Image src={Facebook} alt="Facebook" width={24} height={24} />
            Facebook
          </a>
          <a href="#">
            <Image src={mobile} alt="Điện thoại" width={24} height={24} />
            Điện thoại
          </a>
          <a href="#">
            <Image src={youtube} alt="YouTube" width={24} height={24} />
            YouTube
          </a>
          <a href="#">
            <Image src={Instagram} alt="Instagram" width={24} height={24} />
            Instagram
          </a>
          <a href="#">
            <Image src={visa} alt="Telegram" width={24} height={24} />
            Telegram
          </a>
          <a href="#">
            <Image src={jcb} alt="Discord" width={24} height={24} />
            Discord
          </a>
        </div>
      )}
      {/* Phần NÚT TRỞ VỀ VÀ HỖ TRỢ */}
    </div>
  );
}