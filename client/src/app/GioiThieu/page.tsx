"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader";
import HomeFooter from "@/components/HomeFooter";
import HomeBoxChat from "@/components/HomeBoxChat";
import styles from "./styles.module.scss";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const aboutUsData = [
  {
    id: 1,
    title: "Chào Mừng Đến Với Trang Web Của Chúng Tôi!",
    description:
      "Chúng tôi là một đội ngũ trẻ trung, năng động và đầy đam mê, chuyên cung cấp các giải pháp công nghệ tiên tiến và sáng tạo. Chúng tôi tin rằng công nghệ có thể thay đổi thế giới và luôn nỗ lực để mang những giải pháp tốt nhất đến cho khách hàng.",
    image: "/imgGT/imgGT-1.webp",
  },
  {
    id: 2,
    title: "Sứ Mệnh Của Chúng Tôi",
    description:
      "Sứ mệnh của chúng tôi là giúp mọi người tiếp cận công nghệ dễ dàng hơn và hiệu quả hơn. Chúng tôi muốn tạo ra một cộng đồng yêu thích công nghệ để cùng nhau xây dựng một tương lai tốt đẹp hơn.",
    image: "/imgGT/imgGT-2.webp",
  },
  {
    id: 3,
    title: "Giá Trị Cốt Lõi",
    description:
      "Chúng tôi tin rằng sự sáng tạo, minh bạch và tận tâm là chìa khóa thành công. Chúng tôi cam kết xây dựng một môi trường làm việc chuyên nghiệp, năng động và thân thiện.",
    image: "/imgGT/imgGT-3.webp",
  },
  {
    id: 4,
    title: "Lịch Sử Phát Triển",
    description:
      "Chúng tôi bắt đầu từ một nhóm nhỏ đam mê công nghệ. Sau nhiều năm phát triển, chúng tôi đã trở thành một công ty công nghệ hàng đầu trong lĩnh vực [Lĩnh vực của bạn].",
    image: "/imgGT/imgGT-4.webp",
  },
];

const customerCareData = [
  {
    id: 5,
    title: "Chăm Sóc Khách Hàng",
    description:
      "Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 qua email, điện thoại hoặc chat trực tuyến.",
    image: "/imgGT/imgGT-5.webp",
  },
  {
    id: 6,
    title: "Chính Sách Bảo Hành",
    description: (
      <>
        Tất cả sản phẩm của chúng tôi đều được bảo hành trong vòng 12 tháng. Xem
        chi tiết chính sách bảo hành{" "}
        <Link href="/warranty" className={styles.link}>
          tại đây
        </Link>
        .
      </>
    ),
    image: "/imgGT/imgGT-6.webp",
  },
  {
    id: 7,
    title: "Chính Sách Hoàn Trả",
    description: (
      <>
        Chúng tôi chấp nhận hoàn trả sản phẩm trong vòng 30 ngày nếu bạn không
        hài lòng. Xem chi tiết{" "}
        <Link href="/return-policy" className={styles.link}>
          tại đây
        </Link>
        .
      </>
    ),
    image: "/imgGT/imgGT-7.webp",
  },
  {
    id: 8,
    title: "Cách Nhận Hàng",
    description:
      "Chúng tôi giao hàng trên toàn quốc qua các đối tác vận chuyển uy tín. Thời gian giao hàng dự kiến là 2-5 ngày làm việc.",
    image: "/imgGT/imgGT-8.webp",
  },
  {
    id: 9,
    title: "Hướng Dẫn Sử Dụng",
    description:
      "Bạn có thể tải hướng dẫn sử dụng trực tuyến hoặc liên hệ với chúng tôi để được hỗ trợ.",
    image: "/imgGT/imgGT-9.webp",
  },
];

export default function GioiThieu() {
  return (
    <>
      <HomeHeader />
      <HomeBoxChat />

      <div className={styles.container}>
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          className={styles.section} // ĐÃ XÓA viewport={{ once: true }}
        >
          {aboutUsData.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={`${styles.gridContainer} ${styles.grid}`}>
                <div className={styles.text}>
                  <h2 className={styles.title}>{item.title}</h2>
                  <p className={styles.description}>{item.description}</p>
                </div>
                <div className={styles.imageContainer}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={1200}
                    height={300}
                    layout="intrinsic"
                    objectFit="cover"
                    className={styles.image}
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          className={styles.section} // ĐÃ XÓA viewport={{ once: true }}
        >
          {customerCareData.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={`${styles.gridContainer} ${styles.grid}`}>
                <div className={styles.text}>
                  <h2 className={styles.title}>{item.title}</h2>
                  <p className={styles.description}>{item.description}</p>
                </div>
                <div className={styles.imageContainer}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={1200}
                    height={300}
                    layout="intrinsic"
                    objectFit="cover"
                    className={styles.image}
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.section>
      </div>

      <HomeFooter />
    </>
  );
}
