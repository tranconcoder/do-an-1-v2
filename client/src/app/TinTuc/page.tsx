"use client";

import styles from "./styles.module.scss";
import Image from "next/image";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader/index";
import HomeFooter from "@/components/HomeFooter/index";
import HomeBoxChat from "@/components/HomeBoxChat/index";
import { useEffect, useRef, useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  content: string;
  link: string;
  date: string;
}

const newsData: NewsItem[] = [
  {
    id: 1,
    title: "Công nghệ AI đột phá trong y học",
    image: "/news1.jpg",
    content:
      "Các nhà khoa học vừa công bố một bước tiến lớn trong việc ứng dụng trí tuệ nhân tạo vào chẩn đoán bệnh trong việc ứng dụng trí tuệ nhân tạo vào chẩn đoán bệnh.",
    link: "/tin-tuc/cong-nghe-ai-dot-pha-trong-y-hoc",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Ảnh hưởng khí hậu Đến Việt Nam",
    image: "/news1.jpg",
    content:
      "Biến đổi khí hậu đang gây ra những tác động tiêu cực đến. Cần có những giải pháp để thích ứng và giảm thiểu thiệt hại.Biến đổi khí hậu đang gây ra những tác động tiêu cực đến",
    link: "/tin-tuc/anh-huong-cua-bien-doi-khi-hau-den-nong-nghiep-viet-nam",
    date: "2024-02-20",
  },
  {
    id: 3,
    title: "Sự phát triển công nghiệp ô tô điện",
    image: "/news1.jpg",
    content:
      " với nhiều mẫu xe mới được ra mắt và hạ tầng trạm sạc ngày càng được mở rộng. Đây là xu hướng tất yếu của tương lai. Biến đổi khí hậu đang gây ra những tác động tiêu cực đến",
    link: "/tin-tuc/su-phat-trien-cua-nganh-cong-nghiep-o-to-dien",
    date: "2024-02-28",
  },
  {
    id: 4,
    title: "Du lịch bền vững: Xu hướng mới của ngành du lịch",
    image: "/news1.jpg",
    content:
      "Du lịch bền vững đang trở thành một xu hướng quan trọng, với sự chú trọng vào việc bảo vệ môi trường, văn hóa địa phương và mang lại lợi ích cho cộng đồng. Khám phá các điểm đến du lịch xanh và có trách nhiệm. Du lịch bền vững đang trở thành một xu hướng quan trọng, với sự chú trọng vào việc bảo vệ môi trường, văn hóa địa phương và mang lại lợi ích cho cộng đồng. Khám phá các điểm đến du lịch xanh và có trách nhiệm.",
    link: "/tin-tuc/du-lich-ben-vung",
    date: "2024-03-10",
  },
  {
    id: 5,
    title: "title 5",
    image: "/news1.jpg",
    content:
      "content 5 Du lịch bền vững đang trở thành một xu hướng quan trọng, với sự chú trọng vào việc bảo vệ môi trường, văn hóa địa phương và mang lại lợi ích cho cộng đồng. Khám phá các điểm đến du lịch xanh và có trách nhiệm. Du lịch bền vững đang trở thành một xu hướng quan trọng, với sự chú trọng vào việc bảo vệ môi trường, văn hóa địa phương và mang lại lợi ích cho cộng đồng. Khám phá các điểm đến du lịch xanh và có trách nhiệm.",
    link: "/tin-tuc/du-lich-ben-vung",
    date: "2024-03-15",
  },
  {
    id: 6,
    title: "title 6",
    image: "/news1.jpg",
    content:
      "content 6 Du lịch bền vững đang trở thành một xu hướng quan trọng, với sự chú trọng vào việc bảo vệ môi trường, văn hóa địa phương và mang lại lợi ích cho cộng đồng. Khám phá các điểm đến du lịch xanh và có trách nhiệm. Du lịch bền vững đang trở thành một xu hướng quan trọng, với sự chú trọng vào việc bảo vệ môi trường, văn hóa địa phương và mang lại lợi ích cho cộng đồng. Khám phá các điểm đến du lịch xanh và có trách nhiệm.",
    link: "/tin-tuc/du-lich-ben-vung",
    date: "2024-04-20",
  },
];

// Function to format date to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function TinTuc() {
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.show);
          } else {
            entry.target.classList.remove(styles.show);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (newsContainerRef.current) {
      const newsItems: NodeListOf<Element> =
        newsContainerRef.current.querySelectorAll(`.${styles.newsItem}`);

      newsItems.forEach((item: Element) => observer.observe(item));

      return () => {
        newsItems.forEach((item: Element) => observer.unobserve(item));
      };
    }

    return () => {};
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      const year = selectedDateObj.getFullYear();
      const month = selectedDateObj.getMonth(); // Month is 0-indexed
      const day = selectedDateObj.getDate();

      const filtered = newsData.filter((news) => {
        const newsDateObj = new Date(news.date);
        const newsYear = newsDateObj.getFullYear();
        const newsMonth = newsDateObj.getMonth();
        const newsDay = newsDateObj.getDate();
        // Compare year, month, and day if available
        return newsYear === year && newsMonth === month && newsDay === day;
      });
      setFilteredNews(filtered);
    } else {
      setFilteredNews(newsData);
    }
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleShowAll = () => {
    setFilteredNews(newsData);
    setSelectedDate(""); // Clear the selected date
  };

  return (
    <>
      <HomeHeader />
      <HomeBoxChat />
      <section className={styles.newsSection}>
        <h2 className={styles.sectionTitle}>Tin Tức Nổi Bật</h2>

        <div className={styles.dateFilter}>
          <label htmlFor="newsDate">Chọn ngày:</label>
          <input
            type="date"
            id="newsDate"
            onChange={handleDateChange}
            value={selectedDate}
          />
          <button onClick={handleShowAll}>Xem tất cả</button>
        </div>

        <div className={styles.newsContainer} ref={newsContainerRef}>
          {(filteredNews.length > 0 ? filteredNews : newsData).map((news) => (
            <div
              key={news.id}
              className={`${styles.newsItem} ${styles.slideIn}`}
            >
              <div className={styles.newsImage}>
                <Image
                  src={news.image}
                  alt={news.title}
                  width={500}
                  height={300}
                  layout="responsive"
                  objectFit="cover"
                />
              </div>
              <div className={styles.newsContent}>
                <h3>{news.title}</h3>
                <p>{news.content}</p>
                <Link href={news.link} className={styles.readMore}>
                  Đọc thêm
                </Link>
                <p className={styles.newsDate}>Ngày: {formatDate(news.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HomeFooter />
    </>
  );
}
