"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

interface Customer {
  id: number;
  image: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password?: string; // Optional as we might not always display it
  province: string;
  district: string;
  ward: string;
  street: string;
  houseNumber: string;
}

interface HomeAdKhachHangProps {}

const HomeAdKhachHang: React.FC<HomeAdKhachHangProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // Mock customer data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      image: "/iphone1.png", // Replace with actual image paths
      fullName: "John Doe",
      email: "john.doe@example.com",
      phoneNumber: "123-456-7890",
      username: "johndoe",
      province: "California",
      district: "Los Angeles",
      ward: "Downtown",
      street: "Main Street",
      houseNumber: "123",
    },
    {
      id: 2,
      image: "/iphone.png", // Replace with actual image paths
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      phoneNumber: "987-654-3210",
      username: "janesmith",
      province: "New York",
      district: "Manhattan",
      ward: "Midtown",
      street: "Broadway",
      houseNumber: "456",
    },
    // Add more mock customers here
  ]);

  // State for search input
  const [searchTerm, setSearchTerm] = useState("");

  // State to store filtered customers
  const [filteredCustomers, setFilteredCustomers] =
    useState<Customer[]>(customers);

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

  // Function to handle search term input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter((customer) =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleDeleteCustomer = (id: number) => {
    // Implement your delete logic here.  For example:
    setCustomers(customers.filter((customer) => customer.id !== id));
    // You would typically make an API call to delete the customer from the database.
    console.log(`Deleting customer with ID: ${id}`);
  };

  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(
    null
  );
  const [editedCustomerData, setEditedCustomerData] = useState<
    Partial<Customer>
  >({});

  const handleEditCustomer = (id: number) => {
    setEditingCustomerId(id);
    // Initialize editedCustomerData with the current customer's data
    const customerToEdit = customers.find((customer) => customer.id === id);
    if (customerToEdit) {
      setEditedCustomerData(customerToEdit);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveCustomer = () => {
    if (editingCustomerId) {
      // Implement your save logic here.  For example:
      const updatedCustomers = customers.map((customer) =>
        customer.id === editingCustomerId
          ? { ...customer, ...editedCustomerData }
          : customer
      );
      setCustomers(updatedCustomers);
      // You would typically make an API call to update the customer in the database.
      console.log(
        `Saving customer with ID: ${editingCustomerId}`,
        editedCustomerData
      );
      setEditingCustomerId(null); // Exit edit mode
      setEditedCustomerData({}); // Clear the edited data
    }
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditedCustomerData({});
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

        {/* Phần Code Nôi dung Trong đây */}
        <main ref={mainContentRef} className={styles.mainContent}>
          <h1>Thông tin Khách Hàng</h1>
          {/* Search input field */}
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchTerm}
            onChange={handleSearchInputChange}
            className={styles.searchInput}
          />
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Họ và Tên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Tên Tài Khoản</th>
                <th>Địa Chỉ</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>
                    <Image
                      src={customer.image}
                      alt={customer.fullName}
                      width={50}
                      height={50}
                      style={{ borderRadius: "50%" }}
                    />
                  </td>
                  <td>
                    {editingCustomerId === customer.id ? (
                      <input
                        type="text"
                        name="fullName"
                        value={editedCustomerData.fullName || ""}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      customer.fullName
                    )}
                  </td>
                  <td>
                    {editingCustomerId === customer.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editedCustomerData.email || ""}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      customer.email
                    )}
                  </td>
                  <td>
                    {editingCustomerId === customer.id ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editedCustomerData.phoneNumber || ""}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      customer.phoneNumber
                    )}
                  </td>
                  <td>
                    {editingCustomerId === customer.id ? (
                      <input
                        type="text"
                        name="username"
                        value={editedCustomerData.username || ""}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      customer.username
                    )}
                  </td>
                  <td>
                    {editingCustomerId === customer.id ? (
                      <>
                        <input
                          type="text"
                          name="houseNumber"
                          value={editedCustomerData.houseNumber || ""}
                          onChange={handleInputChange}
                          placeholder="Số nhà"
                          className={styles.input}
                        />
                        <input
                          type="text"
                          name="street"
                          value={editedCustomerData.street || ""}
                          onChange={handleInputChange}
                          placeholder="Đường"
                          className={styles.input}
                        />
                        <input
                          type="text"
                          name="ward"
                          value={editedCustomerData.ward || ""}
                          onChange={handleInputChange}
                          placeholder="Phường/Xã"
                          className={styles.input}
                        />
                        <input
                          type="text"
                          name="district"
                          value={editedCustomerData.district || ""}
                          onChange={handleInputChange}
                          placeholder="Quận/Huyện"
                          className={styles.input}
                        />
                        <input
                          type="text"
                          name="province"
                          value={editedCustomerData.province || ""}
                          onChange={handleInputChange}
                          placeholder="Tỉnh/Thành phố"
                          className={styles.input}
                        />
                      </>
                    ) : (
                      `${customer.houseNumber}, ${customer.street}, ${customer.ward}, ${customer.district}, ${customer.province}`
                    )}
                  </td>
                  <td>
                    {editingCustomerId === customer.id ? (
                      <>
                        <button
                          onClick={handleSaveCustomer}
                          className={styles.saveButton}
                        >
                          Lưu
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className={styles.cancelButton}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditCustomer(customer.id)}
                          className={styles.editButton}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className={styles.deleteButton}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
        {/* Phần Code Nôi dung Trong đây */}
      </div>
    </>
  );
};

export default HomeAdKhachHang;
