"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

interface HomeAdKhuyeMaiProps {}

// Define the ProductPromotion type
interface ProductPromotion {
  id: number;
  name: string;
  price: number;
  discount: number;
  imageUrl: string;
  startDate: string;
  endDate: string;
}

// Discount Code Interface
interface DiscountCode {
  code: string;
  percentage: number;
  quantity: number;
  startDate: string;
  endDate: string;
  minPrice?: number;
  maxPrice?: number;
  mostActiveUserId?: number | null; //  ID of the most active user (can be null if no specific user)
}

interface User {
  id: number;
  name: string;
  orders: number;
}

const HomeAdKhuyeMai: React.FC<HomeAdKhuyeMaiProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // User Data (Example)
  const [mostActiveUsers, setMostActiveUsers] = useState<User[]>([
    { id: 1, name: "John Doe", orders: 15 },
    { id: 2, name: "Jane Smith", orders: 12 },
    { id: 3, name: "Peter Jones", orders: 10 },
  ]);

  // Discount Code Data and State
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [mostActiveUserId, setMostActiveUserId] = useState<number | null>(null); // Add state for the user ID
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([
    {
      code: "SUMMER20",
      percentage: 20,
      quantity: 10,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      minPrice: 50,
      maxPrice: 100,
      mostActiveUserId: null,
    },

    // You can add another hardcoded code here
  ]);

  //Product Promotion Data
  const [productId, setProductId] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productDiscountPercentage, setProductDiscountPercentage] = useState(0);
  const [productDiscountStartDate, setProductDiscountStartDate] = useState("");
  const [productDiscountEndDate, setProductDiscountEndDate] = useState("");

  // Added a state for product promotions list
  const [productPromotions, setProductPromotions] = useState<
    ProductPromotion[]
  >([
    {
      id: 1,
      name: "Product 1",
      price: 99.99,
      discount: 10,
      imageUrl: "/iphone.png",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    {
      id: 2,
      name: "Product 2",
      price: 129.99,
      discount: 15,
      imageUrl: "/iphone.png",
      startDate: "2024-02-15",
      endDate: "2024-12-31",
    },
    {
      id: 3,
      name: "Product 3",
      price: 79.99,
      discount: 5,
      imageUrl: "/iphone.png",
      startDate: "2024-03-01",
      endDate: "2024-12-31",
    },
    {
      id: 4,
      name: "Product 4",
      price: 149.99,
      discount: 20,
      imageUrl: "/iphone.png",
      startDate: "2024-04-10",
      endDate: "2024-12-31",
    },
    {
      id: 5,
      name: "Product 5",
      price: 89.99,
      discount: 12,
      imageUrl: "/iphone.png",
      startDate: "2024-05-01",
      endDate: "2024-12-31",
    },
    {
      id: 6,
      name: "Product 6",
      price: 119.99,
      discount: 8,
      imageUrl: "/iphone.png",
      startDate: "2024-06-05",
      endDate: "2024-12-31",
    },
  ]);

  // State for managing the currently selected product (for edit/delete)
  const [selectedProduct, setSelectedProduct] =
    useState<ProductPromotion | null>(null);

  // State for managing the form values when editing
  const [editFormValues, setEditFormValues] = useState<ProductPromotion>({
    id: 0,
    name: "",
    price: 0,
    discount: 0,
    imageUrl: "",
    startDate: "",
    endDate: "",
  });

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

  const handleCreateDiscount = async () => {
    try {
      const newDiscountCode: DiscountCode = {
        code: discountCode,
        percentage: discountPercentage,
        quantity: quantity,
        startDate: startDate,
        endDate: endDate,
        minPrice: minPrice,
        maxPrice: maxPrice,
        mostActiveUserId: mostActiveUserId, // Include the user ID in the discount code
      };

      const response = await fetch("/api/discountCodes", {
        // Call Node.js backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDiscountCode),
      });

      if (response.ok) {
        // Refresh the discount code list (e.g., re-fetch or update state)
        const newDiscount = await response.json();
        setDiscountCodes([...discountCodes, newDiscount]); // Update local state
        // Clear input fields after create
        setDiscountCode("");
        setDiscountPercentage(0);
        setQuantity(1);
        setStartDate("");
        setEndDate("");
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setMostActiveUserId(null); // Clear the user ID
        console.log("Discount code created successfully");
      } else {
        console.error("Error creating discount code:", response.status);
      }
    } catch (error) {
      console.error("Error creating discount code:", error);
    }
  };

  const handleCancelDiscount = async (code: string) => {
    try {
      const response = await fetch(`/api/discountCodes/${code}`, {
        // Delete endpoint in Node.js
        method: "DELETE",
      });

      if (response.ok) {
        setDiscountCodes(discountCodes.filter((dc) => dc.code !== code)); // Update state after delete
        console.log("Discount code canceled successfully");
      } else {
        console.error("Error canceling discount code:", response.status);
      }
    } catch (error) {
      console.error("Error canceling discount code:", error);
    }
  };
  const handleCreateProductPromotion = async () => {
    // Placeholder API call (replace with your actual API call)
    try {
      const response = await fetch("/api/productPromotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          productImageUrl: productImageUrl,
          productName: productName,
          productPrice: productPrice,
          productQuantity: productQuantity,
          productDiscountPercentage: productDiscountPercentage,
          productDiscountStartDate: productDiscountStartDate,
          productDiscountEndDate: productDiscountEndDate,
        }),
      });
      if (response.ok) {
        // Handle success, clear input fields, etc.
        console.log("Product promotion created successfully!");
        setProductId("");
        setProductImageUrl("");
        setProductName("");
        setProductPrice(0);
        setProductQuantity(1);
        setProductDiscountPercentage(0);
        setProductDiscountStartDate("");
        setProductDiscountEndDate("");
      } else {
        console.error("Error creating product promotion:", response.status);
      }
    } catch (error) {
      console.error("Error creating product promotion:", error);
    }
  };

  // Function to handle product deletion (temporary, in-memory)
  const handleDeleteProduct = async (productId: number) => {
    // Simulate DELETE request to backend
    try {
      const response = await fetch(`/api/productPromotions/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update the frontend state
        const updatedPromotions = productPromotions.filter(
          (product) => product.id !== productId
        );
        setProductPromotions(updatedPromotions);
        setSelectedProduct(null);
        console.log("Product deleted successfully");
      } else {
        console.error("Error deleting product:", response.status);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Function to handle selecting a product for editing
  const handleSelectProduct = (product: ProductPromotion) => {
    setSelectedProduct(product);
    // Load the product data into the edit form
    setEditFormValues({ ...product });
    setProductId(product.id.toString());
    setProductImageUrl(product.imageUrl);
    setProductName(product.name);
    setProductPrice(product.price);
    setProductQuantity(1); // Assuming you always want to start with 1
    setProductDiscountPercentage(product.discount);
    setProductDiscountStartDate(product.startDate);
    setProductDiscountEndDate(product.endDate);
  };

  // Function to handle updating the selected product (temporary, in-memory)
  const handleUpdateProduct = async (updatedProduct: ProductPromotion) => {
    try {
      // Simulate PUT request to backend
      const response = await fetch(
        `/api/productPromotions/${updatedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (response.ok) {
        // Update the frontend state
        const updatedPromotions = productPromotions.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        );
        setProductPromotions(updatedPromotions);
        setSelectedProduct(null); // Clear the selected product after updating
        setEditFormValues({
          id: 0,
          name: "",
          price: 0,
          discount: 0,
          imageUrl: "",
          startDate: "",
          endDate: "",
        }); // Clear the form

        console.log("Product updated successfully");
      } else {
        console.error("Error updating product:", response.status);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleEditFormChange = (e: any) => {
    const { name, value } = e.target;
    setEditFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
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
            <Link href="" className={styles.sidebarLink}>
              Khuyến Mãi
            </Link>
          </button>
        </aside>

        <main
          id="main-content"
          className={styles.mainContent}
          ref={mainContentRef}
        >
          {/* Most Active Users Section */}
          <section className={styles.activeUsersSection}>
            <h2 className={styles.sectionTitle}>Most Active Users</h2>
            <table className={styles.activeUsersTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {mostActiveUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Discount Code Creation Section */}
          <section className={styles.discountCodeSection}>
            <h2 className={styles.sectionTitle}>Tạo Mã Giảm Giá</h2>
            <div className={styles.formGroup}>
              <label htmlFor="discountCode">Mã Giảm Giá:</label>
              <input
                type="text"
                id="discountCode"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="discountPercentage">Phần Trăm Giảm Giá:</label>
              <input
                type="number"
                id="discountPercentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Số Lượng Mã:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Ngày Bắt Đầu:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="endDate">Ngày Kết Thúc:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {/* New Input Fields for Price Range */}
            <div className={styles.formGroup}>
              <label htmlFor="minPrice">Giá Tối Thiểu Cho Sản Phẩm:</label>
              <input
                type="number"
                id="minPrice"
                value={minPrice !== undefined ? minPrice : ""}
                onChange={(e) =>
                  setMinPrice(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="maxPrice">Giá Tối Đa:</label>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice !== undefined ? maxPrice : ""}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </div>

            {/* Combo Box for Most Active User */}
            <div className={styles.formGroup}>
              <label htmlFor="mostActiveUser">Dành cho người dùng:</label>
              <select
                id="mostActiveUser"
                value={mostActiveUserId !== null ? mostActiveUserId : ""}
                onChange={(e) =>
                  setMostActiveUserId(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              >
                <option value="">Tất cả</option> {/*  "All Users" option */}
                {mostActiveUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={handleCreateDiscount}>Tạo</button>
            </div>
          </section>

          {/* Existing Discount Codes (Table Format) */}
          <section className={styles.existingDiscountsSection}>
            <h2 className={styles.sectionTitle}>Danh Sách Mã Giảm Giá</h2>
            <table className={styles.discountCodesTable}>
              <thead>
                <tr>
                  <th>Mã Giảm Giá</th>
                  <th>Phần Trăm</th>
                  <th>Số Lượng</th>
                  <th>Ngày Bắt Đầu</th>
                  <th>Ngày Kết Thúc</th>
                  <th>Giá Tối Thiểu</th>
                  <th>Giá Tối Đa</th>
                  <th>Người Dùng Cụ Thể</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((discount) => (
                  <tr key={discount.code}>
                    <td>{discount.code}</td>
                    <td>{discount.percentage}%</td>
                    <td>{discount.quantity}</td>
                    <td>{discount.startDate}</td>
                    <td>{discount.endDate}</td>
                    <td>
                      {discount.minPrice !== undefined
                        ? discount.minPrice
                        : "Không"}
                    </td>
                    <td>
                      {discount.maxPrice !== undefined
                        ? discount.maxPrice
                        : "Không"}
                    </td>
                    <td>
                      {discount.mostActiveUserId !== null &&
                      discount.mostActiveUserId !== undefined
                        ? mostActiveUsers.find(
                            (user) => user.id === discount.mostActiveUserId
                          )?.name || "Unknown"
                        : "Tất cả"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleCancelDiscount(discount.code)}
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Product Promotion Section */}
          <section className={styles.productPromotionSection}>
            <h2 className={styles.sectionTitle}>Quản Lý Sản Phẩm Khuyến Mãi</h2>
            <div className={styles.formGroup}>
              <label htmlFor="productId">ID Sản Phẩm:</label>
              <input
                type="text"
                id="productId"
                name="id"
                value={productId}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productImageUrl">URL Ảnh Sản Phẩm:</label>
              <input
                type="text"
                id="productImageUrl"
                name="imageUrl"
                value={productImageUrl}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productName">Tên Sản Phẩm:</label>
              <input
                type="text"
                id="productName"
                name="name"
                value={productName}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productPrice">Giá Sản Phẩm:</label>
              <input
                type="number"
                id="productPrice"
                name="price"
                value={productPrice}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productQuantity">Số Lượng Sản Phẩm:</label>
              <input
                type="number"
                id="productQuantity"
                name="quantity"
                value={productQuantity}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productDiscountPercentage">
                Phần Trăm Giảm Giá Sản Phẩm:
              </label>
              <input
                type="number"
                id="productDiscountPercentage"
                name="discount"
                value={productDiscountPercentage}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productDiscountStartDate">
                Ngày Bắt Đầu Giảm Giá Sản Phẩm:
              </label>
              <input
                type="date"
                id="productDiscountStartDate"
                name="startDate"
                value={productDiscountStartDate}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="productDiscountEndDate">
                Ngày Kết Thúc Giảm Giá Sản Phẩm:
              </label>
              <input
                type="date"
                id="productDiscountEndDate"
                name="endDate"
                value={productDiscountEndDate}
                onChange={handleEditFormChange}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button onClick={handleCreateProductPromotion}>Tạo</button>
            </div>

            <section className={styles.productPromotionsListSection}>
              <h2 className={styles.sectionTitle}>
                Danh Sách Sản Phẩm Khuyến Mãi
              </h2>

              <div className={styles.productPromotionsList}>
                {/* Display promoted products */}
                {productPromotions.map((product) => (
                  <div key={product.id} className={styles.productPromotionItem}>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={150}
                      height={150}
                    />
                    <h3>{product.name}</h3>
                    <p>Price: ${product.price}</p>
                    <p>Discount: {product.discount}% off</p>
                    <p>
                      From: {product.startDate} to {product.endDate}
                    </p>

                    <div className={styles.productActions}>
                      <button onClick={() => handleSelectProduct(product)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Edit Product Form */}
            {selectedProduct && (
              <section className={styles.editProductSection}>
                <h2 className={styles.sectionTitle}>Edit Product</h2>

                {/* Edit form fields */}
                <div className={styles.formGroup}>
                  <label htmlFor="editName">Name:</label>
                  <input
                    type="text"
                    id="editName"
                    name="name"
                    value={editFormValues.name}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="editPrice">Price:</label>
                  <input
                    type="number"
                    id="editPrice"
                    name="price"
                    value={editFormValues.price}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="editDiscount">Discount:</label>
                  <input
                    type="number"
                    id="editDiscount"
                    name="discount"
                    value={editFormValues.discount}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="editImageUrl">Image URL:</label>
                  <input
                    type="text"
                    id="editImageUrl"
                    name="imageUrl"
                    value={editFormValues.imageUrl}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="editStartDate">Start Date:</label>
                  <input
                    type="date"
                    id="editStartDate"
                    name="startDate"
                    value={editFormValues.startDate}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="editEndDate">End Date:</label>
                  <input
                    type="date"
                    id="editEndDate"
                    name="endDate"
                    value={editFormValues.endDate}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button onClick={() => handleUpdateProduct(editFormValues)}>
                    Save
                  </button>
                  <button onClick={() => setSelectedProduct(null)}>
                    Cancel
                  </button>
                </div>
              </section>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default HomeAdKhuyeMai;
