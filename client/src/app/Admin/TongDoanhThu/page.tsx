"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  id: number;
  customerName: string;
  productName: string;
  price: number;
  purchaseDate: string;
}

interface HomeAdTongDoanhThuProps {}

const HomeAdTongDoanhThu: React.FC<HomeAdTongDoanhThuProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);
  const [isClient, setIsClient] = useState(false); // For client-side rendering

  // Calendar State
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // Store the selected day
  const [dailyRevenue, setDailyRevenue] = useState<number>(0);

  // Mock Data (Replace with your actual data fetching)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      customerName: "Alice Smith",
      productName: "Product A",
      price: 100,
      purchaseDate: "2024-01-15",
    },
    {
      id: 2,
      customerName: "Bob Johnson",
      productName: "Product B",
      price: 150,
      purchaseDate: "2024-01-20",
    },
    {
      id: 3,
      customerName: "Charlie Brown",
      productName: "Product A",
      price: 100,
      purchaseDate: "2024-02-01",
    },
    {
      id: 4,
      customerName: "David Lee",
      productName: "Product C",
      price: 200,
      purchaseDate: "2024-02-10",
    },
    // Add transactions for December 31, 2024
    {
      id: 5,
      customerName: "Eve Williams",
      productName: "Product D",
      price: 50,
      purchaseDate: "2024-12-31",
    },
    {
      id: 6,
      customerName: "Frank Miller",
      productName: "Product E",
      price: 75,
      purchaseDate: "2024-12-31",
    },
    {
      id: 7,
      customerName: "Grace Taylor",
      productName: "Product F",
      price: 120,
      purchaseDate: "2024-12-31",
    },
  ]);

  // Filter transactions based on selected year, month and day
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.purchaseDate);
    return (
      transactionDate.getFullYear() === selectedYear &&
      transactionDate.getMonth() === selectedMonth &&
      (selectedDay === null || transactionDate.getDate() === selectedDay)
    );
  });

  // Function to generate days in a month
  const getDaysInMonth = (year: number, month: number): number[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  // Use useCallback to memoize the toggleSidebar function
  const toggleSidebar = useCallback(() => {
    setIsSidebarHidden((prevState) => !prevState);
  }, []);

  // Use useCallback to memoize the updateClasses function
  const updateClasses = () => {
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
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to handle day click
  const handleDayClick = (day: number) => {
    setSelectedDay(day);

    //Calculate the dailyRevenue based on the selected date, using filteredTransactions
    const selectedDateStr = `${selectedYear}-${String(
      selectedMonth + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dailyRevenueValue = filteredTransactions // Filter transactions based on filteredTransactions
      .filter((transaction) => transaction.purchaseDate === selectedDateStr)
      .reduce((sum, transaction) => sum + transaction.price, 0);
    setDailyRevenue(dailyRevenueValue);
  };

  // Render nothing during SSR, then render the table on the client
  if (!isClient) {
    return null; // Or a loading indicator
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          <div className={styles.headerTitle}>SHOP</div>
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

        <main
          id="mainContent"
          className={`${styles.mainContent} ${
            isSidebarHidden ? styles.expanded : ""
          }`}
          ref={mainContentRef}
        >
          <h1>Tổng Doanh Thu</h1>

          {/* Calendar */}
          <div className={styles.calendarContainer}>
            {/* Selectors */}
            <div className={styles.calendarSelectors}>
              <div>
                <label htmlFor="year">Year:</label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from(
                    { length: 10 },
                    (_, i) => selectedYear - 5 + i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="month">Month:</label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                    <option key={month} value={month}>
                      {new Date(0, month).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Day Names */}
            <div className={styles.dayNames}>
              {dayNames.map((dayName) => (
                <span key={dayName} className={styles.dayName}>
                  {dayName}
                </span>
              ))}
            </div>

            <div className={styles.daysContainer}>
              {daysInMonth.map((day) => (
                <span
                  key={day}
                  className={`${styles.day} ${
                    selectedDay === day ? styles.selected : ""
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Display Daily Revenue */}
            {selectedDay && (
              <div className={styles.dailyRevenue}>
                Doanh thu ngày {selectedDay}: {dailyRevenue}
              </div>
            )}
          </div>

          {/* Transaction Table - Moved Above Chart */}
          <div className={styles.tableContainer}>
            <h2>Recent Transactions</h2>
            <table className={styles.revenueTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.customerName}</td>
                    <td>{transaction.productName}</td>
                    <td>{transaction.price}</td>
                    <td>{transaction.purchaseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeAdTongDoanhThu;
