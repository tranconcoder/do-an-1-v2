// HomeAdmin.tsx (React Component - No Server Needed)

"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ChangeEvent,
} from "react";
import Head from "next/head";

// Enum for order statuses (keep this)
enum OrderStatus {
  DRAFT = "draft",
  PENDING = "pending",
  SHIPPING = "shipping",
  RETURNING = "returning",
  RESCHEDULE = "reschedule",
  COMPLETED = "completed",
}

interface HomeAdminProps {}

interface Order {
  id: string;
  status: OrderStatus | string;
  recipient: string;
  phone: string;
  address: string;
  deliveryFee: number;
  codFee: number;
  paymentOption: string;
  actions: {
    edit: string;
    tracking: string;
    forward: string;
    invoice: string;
  };
  selected: boolean;
  createdAt: string;
}

// Initial data for orders (moved here - NO SERVER)
const initialOrders: Order[] = [
  {
    id: "5FHLA4UL",
    status: OrderStatus.PENDING,
    recipient: "Lâm vinh kỷ",
    phone: "0523515133",
    address: "Bình Dương",
    deliveryFee: 111100,
    codFee: 329000,
    paymentOption: "cod",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-25T10:00:00.000Z",
  },
  {
    id: "5F6NYF71",
    status: OrderStatus.SHIPPING,
    recipient: "Lâm Hiển Phúc",
    phone: "0348295546",
    address: "Đồng Nai",
    deliveryFee: 63500,
    codFee: 329000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-25T11:30:00.000Z",
  },
];

const draftOrdersData: Order[] = [
  {
    id: "5FHLA4U1",
    status: OrderStatus.DRAFT,
    recipient: "Le Van B",
    phone: "0523515134",
    address: "Vũng Tàu",
    deliveryFee: 111000,
    codFee: 328000,
    paymentOption: "cod",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-26T10:00:00.000Z",
  },
  {
    id: "5F6NYF72",
    status: OrderStatus.DRAFT,
    recipient: "Tran Thi C",
    phone: "0348295547",
    address: "Cần Thơ",
    deliveryFee: 63600,
    codFee: 328000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-26T11:30:00.000Z",
  },
];

const pendingOrdersData: Order[] = [
  {
    id: "5F6NYF73",
    status: OrderStatus.PENDING,
    recipient: "Nguyen Van D",
    phone: "0348295548",
    address: "Hà Nội",
    deliveryFee: 63700,
    codFee: 327000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-27T11:30:00.000Z",
  },
  {
    id: "5F6NYF74",
    status: OrderStatus.PENDING,
    recipient: "Vo Thi E",
    phone: "0348295549",
    address: "Hồ Chí Minh",
    deliveryFee: 63800,
    codFee: 326000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-27T11:30:00.000Z",
  },
];

const shippingOrdersData: Order[] = [
  {
    id: "5F6NYF75",
    status: OrderStatus.SHIPPING,
    recipient: "Tran Van F",
    phone: "0348295550",
    address: "Bình Định",
    deliveryFee: 63900,
    codFee: 325000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-28T11:30:00.000Z",
  },
  {
    id: "5F6NYF76",
    status: OrderStatus.SHIPPING,
    recipient: "Le Thi G",
    phone: "0348295551",
    address: "Quảng Nam",
    deliveryFee: 64000,
    codFee: 324000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-28T11:30:00.000Z",
  },
];

const returningOrdersData: Order[] = [
  {
    id: "5F6NYF77",
    status: OrderStatus.RETURNING,
    recipient: "Pham Van H",
    phone: "0348295552",
    address: "Nghệ An",
    deliveryFee: 64100,
    codFee: 323000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-29T11:30:00.000Z",
  },
  {
    id: "5F6NYF78",
    status: OrderStatus.RETURNING,
    recipient: "Ho Thi I",
    phone: "0348295553",
    address: "Thanh Hóa",
    deliveryFee: 64200,
    codFee: 322000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-29T11:30:00.000Z",
  },
];

const rescheduleOrdersData: Order[] = [
  {
    id: "5F6NYF79",
    status: OrderStatus.RESCHEDULE,
    recipient: "Dinh Van K",
    phone: "0348295554",
    address: "Hải Phòng",
    deliveryFee: 64300,
    codFee: 321000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-30T11:30:00.000Z",
  },
  {
    id: "5F6NYF80",
    status: OrderStatus.RESCHEDULE,
    recipient: "Ly Thi L",
    phone: "0348295555",
    address: "Huế",
    deliveryFee: 64400,
    codFee: 320000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-30T11:30:00.000Z",
  },
];

const completedOrdersData: Order[] = [
  {
    id: "5F6NYF81",
    status: OrderStatus.COMPLETED,
    recipient: "Vu Van M",
    phone: "0348295556",
    address: "Đà Nẵng",
    deliveryFee: 64500,
    codFee: 319000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-31T11:30:00.000Z",
  },
  {
    id: "5F6NYF82",
    status: OrderStatus.COMPLETED,
    recipient: "Bach Thi N",
    phone: "0348295557",
    address: "Hà Nam",
    deliveryFee: 64600,
    codFee: 318000,
    paymentOption: "online",
    actions: {
      edit: "Chỉnh sửa",
      tracking: "Tra cứu",
      forward: "Chuyển tiếp",
      invoice: "In vận đơn",
    },
    selected: false,
    createdAt: "2024-01-31T11:30:00.000Z",
  },
];

const HomeAdmin: React.FC<HomeAdminProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // Added default values for initial data
  const [todayOrders, setTodayOrders] = useState(3);
  const [todayRevenue, setTodayRevenue] = useState(250000);
  const [newCustomers, setNewCustomers] = useState(1);

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectAll, setSelectAll] = useState(false);

  const [pendingPayments, setPendingPayments] = useState(0);
  const [unshippedOrders, setUnshippedOrders] = useState(0);
  const [incompleteOrders, setIncompleteOrders] = useState(0);
  const [refundedOrders, setRefundedOrders] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentOption, setSelectedPaymentOption] =
    useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // State for the top buttons
  const [draftOrders, setDraftOrders] = useState<Order[]>(draftOrdersData);
  const [pendingOrders, setPendingOrders] =
    useState<Order[]>(pendingOrdersData);
  const [shippingOrders, setShippingOrders] =
    useState<Order[]>(shippingOrdersData);
  const [returningOrders, setReturningOrders] =
    useState<Order[]>(returningOrdersData);
  const [rescheduleOrders, setRescheduleOrders] =
    useState<Order[]>(rescheduleOrdersData);
  const [completedOrders, setCompletedOrders] =
    useState<Order[]>(completedOrdersData);

  const [currentOrders, setCurrentOrders] = useState<Order[]>(initialOrders);

  const toggleSidebar = useCallback(() => {
    setIsSidebarHidden((prevState) => !prevState);
  }, []);

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
  }, [isSidebarHidden, updateClasses]);

  const handleCheckboxChange = (orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, selected: !order.selected } : order
      )
    );
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    setOrders((prevOrders) =>
      prevOrders.map((order) => ({ ...order, selected: !selectAll }))
    );
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handlePaymentOptionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPaymentOption(e.target.value);
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (orders && orders.length > 0) {
      setTodayOrders(orders.length);
      setTodayRevenue(orders.reduce((total, order) => total + order.codFee, 0));
      setPendingPayments(orders.filter((o) => o.status === "pending").length);
      setUnshippedOrders(orders.filter((o) => o.status === "unshipped").length);
      setIncompleteOrders(
        orders.filter((o) => o.status === "incomplete").length
      );
      setRefundedOrders(orders.filter((o) => o.status === "refunded").length);
      setCancelledOrders(orders.filter((o) => o.status === "cancelled").length);
    }
  }, [orders]);

  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus !== "all" && order.status !== selectedStatus) {
        return false;
      }

      if (
        selectedPaymentOption !== "all" &&
        order.paymentOption !== selectedPaymentOption
      ) {
        return false;
      }

      if (startDate && order.createdAt < startDate) {
        return false;
      }

      if (endDate && order.createdAt > endDate) {
        return false;
      }
      // Add search filter condition
      const searchFields = [
        order.id,
        order.recipient,
        order.phone,
        order.address,
      ];
      const searchTermLower = searchTerm.toLowerCase();
      if (
        searchTerm &&
        !searchFields.some((field) =>
          field.toLowerCase().includes(searchTermLower)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [
    orders,
    selectedStatus,
    selectedPaymentOption,
    startDate,
    endDate,
    searchTerm,
  ]);

  const showDraftOrders = () => {
    setOrders(draftOrders); // Now just updates state directly
  };

  const showPendingOrders = () => {
    setOrders(pendingOrders);
  };

  const showShippingOrders = () => {
    setOrders(shippingOrders);
  };

  const showReturningOrders = () => {
    setOrders(returningOrders);
  };

  const showRescheduleOrders = () => {
    setOrders(rescheduleOrders);
  };

  const showCompletedOrders = () => {
    setOrders(completedOrders);
  };

  const totalOrders = orders.length;

  // Function to format date string
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
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
          <div className={styles.headerTitle}>SHOP</div>
        </div>

        <div className={styles.headerIconsRight}>
          <Link href="/logout">
            <i className="fas fa-sign-out-alt"></i>
          </Link>
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
            <Link href="/admin" className={styles.sidebarLink}>
              Bảng Điều Khiển
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/products" className={styles.sidebarLink}>
              Sản Phẩm
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/categories" className={styles.sidebarLink}>
              Danh Mục Sản Phẩm
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/revenue" className={styles.sidebarLink}>
              Tổng Danh Thu
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/customers" className={styles.sidebarLink}>
              Khách Hàng
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/employees" className={styles.sidebarLink}>
              Nhân Viên
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/reviews" className={styles.sidebarLink}>
              Đánh Giá
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/orders" className={styles.sidebarLink}>
              Đơn Hàng
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/posts" className={styles.sidebarLink}>
              Bài Viết
            </Link>
          </button>
          <button className={styles.sidebarButton}>
            <i className=""></i>
            <Link href="/admin/promotions" className={styles.sidebarLink}>
              Khuyến Mãi
            </Link>
          </button>
        </aside>

        <div className={styles.mainContentContainer}>
          <main
            id="main-content"
            className={`${styles.mainContent} ${
              isSidebarHidden ? styles.expanded : ""
            }`}
            ref={mainContentRef}
            aria-label="Main Content"
          >
            <h2 className={styles.functionTitle}>Overview</h2>
            <div className={styles.dashboardSummary}>
              <div className={styles.topCards}>
                <div className={styles.card}>
                  <i className="fas fa-file-invoice-dollar"></i>
                  <div>
                    <p>Đơn hàng hôm nay</p>
                    <p className={styles.cardValue}>{todayOrders}</p>
                  </div>
                </div>
                <div className={styles.card}>
                  <i className="fas fa-money-bill-wave"></i>
                  <div>
                    <p>Doanh thu hôm nay</p>
                    <p className={styles.cardValue}>{todayRevenue}₫</p>
                  </div>
                </div>
                <div className={styles.card}>
                  <i className="fas fa-user-plus"></i>
                  <div>
                    <p>Khách mới trong ngày</p>
                    <p className={styles.cardValue}>{newCustomers}</p>
                  </div>
                </div>
              </div>

              <div className={styles.orderList}>
                <Link
                  href="/admin/orders?status=pending"
                  className={styles.orderItem}
                >
                  <i className="fas fa-file-invoice"></i>
                  <p>{pendingPayments} Đơn hàng chưa thanh toán</p>
                  <i className="fas fa-chevron-right"></i>
                </Link>
                <Link
                  href="/admin/orders?status=unshipped"
                  className={styles.orderItem}
                >
                  <i className="fas fa-shipping-fast"></i>
                  <p>{unshippedOrders} Đơn hàng chưa giao</p>
                  <i className="fas fa-chevron-right"></i>
                </Link>
                <Link
                  href="/admin/orders?status=incomplete"
                  className={styles.orderItem}
                >
                  <i className="fas fa-shopping-bag"></i>
                  <p>{incompleteOrders} Đơn hàng chưa hoàn tất</p>
                  <i className="fas fa-chevron-right"></i>
                </Link>
                <Link
                  href="/admin/orders?status=refunded"
                  className={styles.orderItem}
                >
                  <i className="fas fa-undo"></i>
                  <p>{refundedOrders} Đơn hàng bị hoàn trả toàn bộ</p>
                  <i className="fas fa-chevron-right"></i>
                </Link>
                <Link
                  href="/admin/orders?status=cancelled"
                  className={styles.orderItem}
                >
                  <i className="fas fa-trash-alt"></i>
                  <p>{cancelledOrders} Đơn hàng hủy</p>
                  <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
            </div>
            {/* Order Table */}
            <div className={styles.orderManagementContainer}>
              {/* Top Buttons */}
              <div className={styles.topButtons}>
                <button onClick={showDraftOrders}>Đơn Nhập Vào</button>
                <button className={styles.active} onClick={showPendingOrders}>
                  Chờ Giao Hàng
                </button>
                <button onClick={showShippingOrders}>Đang Giao</button>
                <button onClick={showReturningOrders}>Hàng Trả Lại</button>
                <button onClick={showRescheduleOrders}>
                  Chờ Xác Nhận Giao Lại
                </button>
                <button onClick={showCompletedOrders}>Hoàn Tất</button>
              </div>
              {/* Search filter */}

              <div className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
              </div>
              {/* Filter Section */}
              <div className={styles.filterSection}>
                <div className={styles.filterColumn}>
                  <label htmlFor="statusFilter">Trạng thái</label>
                  <select
                    id="statusFilter"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="unshipped">Chưa giao</option>
                    <option value="shipping">Đang giao</option>
                    <option value="returning">Đang hoàn hàng</option>
                    <option value="reschedule">Chờ giao lại</option>
                    <option value="completed">Hoàn tất</option>
                    <option value="refunded">Đã hoàn trả</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div className={styles.filterColumn}>
                  <label htmlFor="paymentOptionFilter">
                    Tùy chọn thanh toán
                  </label>
                  <select
                    id="paymentOptionFilter"
                    value={selectedPaymentOption}
                    onChange={handlePaymentOptionChange}
                  >
                    <option value="all">Tất cả</option>
                    <option value="cod">COD</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className={styles.filterColumn}>
                  <label>Thời gian</label>
                  <div className={styles.dateInputs}>
                    <div className={styles.datePickerContainer}>
                      <input
                        type="text"
                        placeholder="mm/dd/yyyy"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className={styles.dateInput}
                      />
                      <i
                        className={`fa fa-calendar ${styles.datePickerIcon}`}
                        aria-hidden="true"
                      ></i>
                    </div>
                  </div>
                </div>
                <div className={styles.filterColumn}>
                  <span className={styles.count}>
                    Hiển thị {filteredOrders.length}/{totalOrders} đơn hàng
                  </span>
                </div>
              </div>
              <div className={styles.test1}>{}</div>

              {/* Table */}
              <table className={styles.orderTableNew}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      />
                      STT
                    </th>
                    <th>Mã đơn</th>
                    <th>Bên nhận</th>
                    <th>Tổng phí dịch vụ</th>
                    <th>Thu hộ/COD (nếu có)</th>
                    <th>Tùy chọn thanh toán</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={order.selected}
                          onChange={() => handleCheckboxChange(order.id)}
                        />
                        {index + 1}
                      </td>
                      <td>
                        {order.id}
                        <div>{order.status}</div>
                        <div>Created At: {formatDate(order.createdAt)}</div>
                      </td>
                      <td>
                        <div>{order.recipient}</div>
                        <div>
                          {order.phone} - {order.address}
                        </div>
                      </td>
                      <td>{order.deliveryFee}</td>
                      <td>{order.codFee}</td>
                      <td>{order.paymentOption}</td>
                      <td>
                        <div>
                          <button>{order.actions.edit}</button>
                          <button>{order.actions.tracking}</button>
                        </div>
                      </td>
                      <td>
                        <div>
                          <button>{order.actions.forward}</button>
                          <button>{order.actions.invoice}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default HomeAdmin;
