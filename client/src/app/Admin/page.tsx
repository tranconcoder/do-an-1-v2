"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faTags,
  faChartLine,
  faUsers,
  faShoppingBag,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faUndo,
  faStar,
  faComment,
  faQuestionCircle,
  faMoneyBill,
  faPercentage,
  faGift,
} from "@fortawesome/free-solid-svg-icons"; //More commerce relevant icons
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface HomeAdminProps {}

const HomeAdmin: React.FC<HomeAdminProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // Use useCallback to memoize the toggleSidebar function
  const toggleSidebar = useCallback(() => {
    setIsSidebarHidden((prevState) => !prevState);
  }, []);

  // Use useCallback to memoize the updateClasses function
  const updateClasses = useCallback(() => {
    const sidebar = sidebarRef.current;
    const mainContent = mainContentRef.current;

    if (sidebar && mainContent) {
      if (isSidebarHidden) {
        sidebar.classList.add(styles.hidden);
        mainContent.classList.add(styles.expanded);
      } else {
        sidebar.classList.remove(styles.hidden);
        mainContent.classList.remove(styles.expanded);
      }
    }
  }, [isSidebarHidden, styles.expanded, styles.hidden]);

  useEffect(() => {
    updateClasses();
  }, [isSidebarHidden, updateClasses]); // Include updateClasses as dependency

  // Dummy Data (Replace with API calls later)
  const [productCount, setProductCount] = useState(50);
  const [categoryCount, setCategoryCount] = useState(15);
  const [totalRevenue, setTotalRevenue] = useState(125000);
  const [customerCount, setCustomerCount] = useState(250);
  const [newOrders, setNewOrders] = useState(10);
  const [pendingOrders, setPendingOrders] = useState(5);
  const [refundRequests, setRefundRequests] = useState(2);
  const [stockAlerts, setStockAlerts] = useState(3);
  const [avgRating, setAvgRating] = useState(4.5);
  const [newReviews, setNewReviews] = useState(8);
  const [activePromotions, setActivePromotions] = useState(3);
  const [giftCardsSold, setGiftCardsSold] = useState(25);

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      customer: "John Doe",
      date: "2024-01-20",
      amount: 150,
      status: "Processing",
    },
    {
      id: 2,
      customer: "Jane Smith",
      date: "2024-01-22",
      amount: 220,
      status: "Shipped",
    },
    {
      id: 3,
      customer: "David Lee",
      date: "2024-01-25",
      amount: 85,
      status: "Completed",
    },
  ]);

  const summaryData = [
    {
      title: "Sản Phẩm",
      value: productCount,
      icon: faBoxOpen,
      color: "#3498db",
    },
    {
      title: "Danh Mục",
      value: categoryCount,
      icon: faTags,
      color: "#2ecc71",
    },
    {
      title: "Tổng Doanh Thu",
      value: `$${totalRevenue}`,
      icon: faChartLine,
      color: "#f39c12",
    },
    {
      title: "Khách Hàng",
      value: customerCount,
      icon: faUsers,
      color: "#9b59b6",
    },
    {
      title: "Đơn Hàng Mới",
      value: newOrders,
      icon: faShoppingBag,
      color: "#f1c40f",
    },
    {
      title: "Đơn Hàng Chờ Xử Lý",
      value: pendingOrders,
      icon: faTruck,
      color: "#e67e22",
    },
    {
      title: "Yêu Cầu Hoàn Tiền",
      value: refundRequests,
      icon: faUndo,
      color: "#e74c3c",
    },
    {
      title: "Cảnh Báo Hết Hàng",
      value: stockAlerts,
      icon: faTimesCircle,
      color: "#c0392b",
    },
    {
      title: "Đánh Giá Trung Bình",
      value: avgRating,
      icon: faStar,
      color: "#f39c12",
    },
    {
      title: "Đánh Giá Mới",
      value: newReviews,
      icon: faComment,
      color: "#3498db",
    },
    {
      title: "Khuyến Mãi",
      value: activePromotions,
      icon: faPercentage,
      color: "#27ae60", // A nice green
    },
    {
      title: "Thẻ Quà Tặng",
      value: giftCardsSold,
      icon: faGift,
      color: "#8e44ad", // A deep purple
    },
  ];

  //Chart Data
  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Doanh Thu Hàng Tháng",
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        backgroundColor: "#9b59b6",
        borderColor: "#9b59b6",
      },
    ],
  };

  const productCategoryData = {
    labels: ["Iphone", "LapTop", "Máy Tính Bản", "Phụ Kiện"],
    datasets: [
      {
        label: "Số lượng sản phẩm",
        data: [35, 20, 18, 27],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const customerLocationData = {
    labels: ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"],
    datasets: [
      {
        label: "Số Lượng Khách Hàng",
        data: [120, 110, 20, 30],
        backgroundColor: ["#3498db", "#9b59b6", "#f39c12", "#e74c3c"],
      },
    ],
  };

  const orderStatusData = {
    labels: ["Đang Xử Lý", "Đã Giao", "Hoàn Thành", "Đã Hủy"],
    datasets: [
      {
        label: "Số Lượng Đơn Hàng",
        data: [10, 45, 30, 5],
        backgroundColor: ["#f39c12", "#2ecc71", "#3498db", "#e74c3c"],
        borderWidth: 0,
      },
    ],
  };

  const revenueByPaymentMethod = {
    labels: ["Thẻ tín dụng", "PayPal", "Ví điện tử", "Tiền mặt"],
    datasets: [
      {
        label: "Doanh thu",
        data: [40000, 30000, 20000, 35000],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const customerReviewData = {
    labels: ["1 Sao", "2 Sao", "3 Sao", "4 Sao", "5 Sao"],
    datasets: [
      {
        label: "Số lượng đánh giá",
        data: [10, 15, 40, 80, 150],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.thanhKeo} onClick={toggleSidebar}>
            ☰
          </button>

          <div className={styles.logo}>
            <Image src="/QR.png" alt="Logo" width={40} height={40} />
          </div>
          <div className={styles.headerTitle}>TRANG CHU ADMIN</div>
        </div>

        <div className={styles.headerIconsRight}>
          <a href="">
            <i className="fas fa-sign-out-alt"></i>
          </a>
        </div>
      </header>

      <div className={styles.container}>
        <aside
          id="sidebar"
          className={`${styles.sidebar} ${
            isSidebarHidden ? styles.hidden : ""
          }`}
          ref={sidebarRef}
        >
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="" className={styles.sidebarLink}>
              Bảng Điều Khiển
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="" className={styles.sidebarLink}>
              Sản Phẩm
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="" className={styles.sidebarLink}>
              Danh Mục Sản Phẩm
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="#" className={styles.sidebarLink}>
              Tổng Danh Thu
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="" className={styles.sidebarLink}>
              Khách Hàng
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="" className={styles.sidebarLink}>
              Nhân Viên
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="#" className={styles.sidebarLink}>
              Đánh Giá
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="#" className={styles.sidebarLink}>
              Đơn Hàng
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="#" className={styles.sidebarLink}>
              Bài Viết
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="#" className={styles.sidebarLink}>
              Khuyến Mãi
            </Link>
          </button>
        </aside>

        {/* Main Content Container (Fixed Position) */}
        <div className={styles.mainContentContainer}>
          <main
            className={`${styles.mainContent} ${styles.root}`}
            ref={mainContentRef}
          >
            {/* Scrollable Content (Everything Below the Title) */}
            <div className={styles.scrollableContent}>
              <div className={styles.dashboardSummary}>
                {summaryData.map((item, index) => (
                  <div className={styles.summaryCard} key={index}>
                    <FontAwesomeIcon
                      icon={item.icon}
                      size="2x"
                      color={item.color}
                      className={styles.summaryIcon}
                    />
                    <h3>{item.title}</h3>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>

              <h2>Đơn hàng gần đây</h2>
              <table className={styles.orderTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Khách Hàng</th>
                    <th>Ngày</th>
                    <th>Số Tiền</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>${order.amount}</td>
                      <td>
                        <span
                          className={`${styles.orderStatus} ${
                            styles[order.status.toLowerCase()]
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.chartsContainer}>
                <div className={styles.chartItem}>
                  <h2>Thống Kê Doanh Thu</h2>
                  <Line data={revenueData} />
                </div>

                <div className={styles.chartItem}>
                  <h2>Phân Bố Khách Hàng Theo Vị Trí</h2>
                  <Pie data={customerLocationData} />
                </div>

                <div className={styles.chartItem}>
                  <h2>Thống Kê Trạng Thái Đơn Hàng</h2>
                  <Doughnut data={orderStatusData} />
                </div>

                <div className={styles.chartItem}>
                  <h2>Thống Kê Loại Sản Phẩm</h2>
                  <Bar data={productCategoryData} />
                </div>

                <div className={styles.chartItem}>
                  <h2>Doanh Thu Theo Phương Thức Thanh Toán</h2>
                  <Bar data={revenueByPaymentMethod} />
                </div>

                <div className={styles.chartItem}>
                  <h2>Thống Kê Đánh Giá Khách Hàng</h2>
                  <Bar data={customerReviewData} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default HomeAdmin;
