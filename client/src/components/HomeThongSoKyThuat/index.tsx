// components/HomeThongSoKyThuat/index.tsx
import Link from "next/link";
import styles from "./styles.module.scss";
import React from "react";

const specificationData = {
  title: "Thông Số Kỹ Thuật iPhone 17 Pro Max",
  details: [
    {
      label: "Màn hình",
      value:
        "Super Retina XDR OLED, 120Hz ProMotion\n6.9 inches, 2796 x 1290 pixels\nCeramic Shield front cover",
    },
    { label: "Chip", value: "Apple A20 Bionic\nNeural Engine" },
    { label: "RAM", value: "12GB LPDDR6" },
    { label: "Bộ nhớ trong", value: "256GB / 512GB / 1TB NVMe" },
    {
      label: "Camera sau",
      value:
        "48MP (chính, f/1.5) + 12MP (siêu rộng, f/1.8) + 12MP (telephoto, f/2.8)\n8K video recording, ProRAW",
    },
    { label: "Camera trước", value: "12MP, AutoFocus, Cinematic mode" },
    { label: "Pin", value: "4800 mAh\nMagSafe wireless charging" },
    { label: "Hệ điều hành", value: "iOS 18 with custom features" },
    { label: "Kết nối", value: "5G, Wi-Fi 7, Bluetooth 5.4, NFC" },
    {
      label: "Khác",
      value:
        "Face ID, chống nước IP68\nUWB, Emergency SOS via satellite\nUSB-C (Thunderbolt)",
    },
  ],
  buttonText: "Xem thêm cấu hình chi tiết",
  buttonLink: "/iphone-17-pro-max-specs",
  videoTitle: "Video Đánh Giá & Review",
  videoUrls: [
    "https://www.youtube.com/embed/xv9UmH3RsX0?si=KI76NTiTHvb-t5Vc",
    "https://www.youtube.com/embed/mRApZVPSsps?si=eI2jtTt4vGWKPcrf",
    "https://www.youtube.com/embed/enh6Mvce__s?si=PBOtBvoSYy6BoTTg",
    "https://www.youtube.com/embed/enh6Mvce__s?si=PBOtBvoSYy6BoTTg",
  ],
};

export default function HomeThongSoKyThuat() {
  return (
    <div className={styles.container}>
      <div className={styles.specifications}>
        <h3 className={styles.title}>{specificationData.title}</h3>
        <table className={styles.specificationTable}>
          <tbody>
            {specificationData.details.map((detail, index) => (
              <tr key={index} className={styles.tableRow}>
                <th>{detail.label}</th>
                <td>
                  {detail.value.split("\n").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < detail.value.split("\n").length - 1 && (
                        <br />
                      )}
                    </React.Fragment>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.buttonContainer}>
          <Link
            href={specificationData.buttonLink}
            className={styles.specButton}
          >
            {specificationData.buttonText}
          </Link>
        </div>
      </div>
      <div className={styles.videoSection}>
        <h4 className={styles.videoTitle}>{specificationData.videoTitle}</h4>
        <div className={styles.videoList}>
          {specificationData.videoUrls.map((url, index) => (
            <div key={index} className={styles.videoItem}>
              <iframe
                width="100%"
                height="200"
                src={url}
                title={`Video ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}