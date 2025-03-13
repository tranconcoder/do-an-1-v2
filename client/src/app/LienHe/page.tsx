"use client";
import styles from "./styles.module.scss";
import HomeHeader from "@/components/HomeHeader/index";
import HomeFooter from "@/components/HomeFooter/index";
import HomeBoxChat from "@/components/HomeBoxChat/index";
import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  file: File | null;
}

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LienHe() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    file: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        file: e.target.files![0],
      }));
    } else {
      setFormData((prevFormData) => ({ ...prevFormData, file: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Simulate form submission (replace with your API call)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      console.log("Form Data:", formData);
      alert("Yêu cầu của bạn đã được gửi thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi form:", error);
      alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        file: null,
      });
    }
  };

  const contactInfoRef = useRef(null);
  const contactFormRef = useRef(null);

  const isContactInfoVisible = useInView(contactInfoRef, {
    once: true,
    amount: 0.2,
  });
  const isContactFormVisible = useInView(contactFormRef, {
    once: true,
    amount: 0.2,
  });

  return (
    <>
      <HomeHeader />
      <div className={styles.pageWrapper}>
        <motion.div
          className={styles.contactPage}
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          transition={{
            duration: 0.7,
            delayChildren: 0.2,
            staggerChildren: 0.1,
          }}
        >
          <motion.div
            className={styles.contactInfo}
            ref={contactInfoRef}
            variants={fadeInVariants}
            animate={isContactInfoVisible ? "visible" : "hidden"}
            transition={{ duration: 0.6 }}
          >
            <h2>Thông Tin Liên Hệ</h2>
            <p>
              Địa chỉ: Số 89 Đường Tam Trinh, Phường Mai Động, Quận Hoàng Mai,
              Hà Nội, Việt Nam.
            </p>
            <p>Điện thoại: 0939206174</p>
            <p>Email: 22004016@st.vlute.edu.vn</p>
            <p>
              Facebook: <a href="#">Liên hệ qua Facebook</a>
            </p>
            <p>Zalo: Nhắn tin Zalo</p>
            <p>Giờ làm việc: 8:30 - 21:30 (Tất cả các ngày trong tuần)</p>
            <p>
              Thời gian phản hồi trung bình: Chúng tôi thường phản hồi trong
              vòng 24 giờ.
            </p>
            <p>Hướng dẫn đường đi: [Thêm hướng dẫn nếu cần]</p>
          </motion.div>

          <motion.div
            className={styles.contactForm}
            ref={contactFormRef}
            variants={fadeInVariants}
            animate={isContactFormVisible ? "visible" : "hidden"}
            transition={{ duration: 0.6 }}
          >
            <h2>Gửi Yêu Cầu Hỗ Trợ</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Tên của bạn:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email của bạn:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="phone">Số điện thoại:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required // It makes sense to require phone number
              />

              <label htmlFor="message">Nội dung tin nhắn:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
              />

              <div className={styles["file-wrapper"]}>
                <span className={styles["choose-file-button"]}>Chọn Tệp</span>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                />
                <span className={styles["file-message"]}>
                  {formData.file
                    ? formData.file.name
                    : "Không tệp nào được chọn"}
                </span>
              </div>

              <button type="submit">Gửi yêu cầu hỗ trợ</button>
            </form>
          </motion.div>
        </motion.div>
      </div>
      <HomeBoxChat />
      <HomeFooter />
    </>
  );
}
