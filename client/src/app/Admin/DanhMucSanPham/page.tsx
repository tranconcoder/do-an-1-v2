"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string;
  imageUrl: string;
}

interface HomeDanhMucSanPhamProps {}

const HomeDanhMucSanPham: React.FC<HomeDanhMucSanPhamProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Điện thoại",
      slug: "dien-thoai",
      parentId: null,
      description: "Các loại điện thoại thông minh",
      imageUrl: "",
    },
    {
      id: 2,
      name: "Laptop",
      slug: "laptop",
      parentId: null,
      description: "Các loại máy tính xách tay",
      imageUrl: "",
    },
    {
      id: 3,
      name: "Áo thun",
      slug: "ao-thun",
      parentId: 4,
      description: "Các loại áo thun",
      imageUrl: "",
    },
    {
      id: 4,
      name: "Áo",
      slug: "ao",
      parentId: null,
      description: "Các loại áo",
      imageUrl: "",
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState<number | null>(
    null
  );
  const [newCategoryImage, setNewCategoryImage] = useState<string>(""); // URL or base64 string
  const [searchTerm, setSearchTerm] = useState("");

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedCategorySlug, setEditedCategorySlug] = useState("");
  const [editedCategoryParentId, setEditedCategoryParentId] = useState<
    number | null
  >(null);
  const [editedCategoryDescription, setEditedCategoryDescription] =
    useState("");
  const [editedCategoryImage, setEditedCategoryImage] = useState<string>(""); // URL or base64 string

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

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleAddCategory = () => {
    setIsAdding(true);
  };

  const handleSaveCategory = () => {
    if (newCategoryName.trim() !== "") {
      const newId =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1;
      const newSlug = generateSlug(newCategoryName);
      setCategories([
        ...categories,
        {
          id: newId,
          name: newCategoryName,
          slug: newSlug,
          parentId: newCategoryParentId,
          description: newCategoryDescription,
          imageUrl: newCategoryImage,
        },
      ]);
      setNewCategoryName("");
      setNewCategoryDescription("");
      setNewCategoryParentId(null);
      setNewCategoryImage("");
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryParentId(null);
    setNewCategoryImage("");
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditedCategoryName(category.name);
    setEditedCategorySlug(category.slug);
    setEditedCategoryParentId(category.parentId);
    setEditedCategoryDescription(category.description);
    setEditedCategoryImage(category.imageUrl);
  };

  const handleUpdateCategory = () => {
    setCategories(
      categories.map((category) =>
        category.id === editingCategoryId
          ? {
              ...category,
              name: editedCategoryName,
              slug: editedCategorySlug,
              parentId: editedCategoryParentId,
              description: editedCategoryDescription,
              imageUrl: editedCategoryImage,
            }
          : category
      )
    );
    setEditingCategoryId(null);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (
    e: any,
    setImageState: (value: string) => void
  ) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageState(reader.result as string); // base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  // Corrected mainContentClasses -  no longer using template literals
  const mainContentClasses = styles.mainContent; // Class is always there
  const mainContentClassesExpanded = isSidebarHidden ? styles.expanded : ""; // Conditionally add class
  const fullMainContentClasses = `${mainContentClasses} ${mainContentClassesExpanded}`;

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
        <main className={fullMainContentClasses} ref={mainContentRef}>
          <h2 className={styles.categoryHeading}>Quản lý danh mục sản phẩm</h2>

          {/* Thanh tìm kiếm */}
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Bảng danh sách danh mục */}
          <table className={styles.categoryTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên danh mục</th>
                <th>Đường dẫn</th>
                <th>Chuyên mục hiện tại</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, setEditedCategoryImage)
                          }
                        />
                        {editedCategoryImage && (
                          <img
                            src={editedCategoryImage}
                            alt="Category Preview"
                            className={styles.imagePreview}
                          />
                        )}
                      </>
                    ) : (
                      category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className={styles.imagePreview}
                        />
                      )
                    )}
                  </td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <input
                        type="text"
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        className={styles.categoryInput}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <input
                        type="text"
                        value={editedCategorySlug}
                        onChange={(e) => setEditedCategorySlug(e.target.value)}
                        className={styles.categoryInput}
                      />
                    ) : (
                      category.slug
                    )}
                  </td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <select
                        value={editedCategoryParentId || ""}
                        onChange={(e) =>
                          setEditedCategoryParentId(
                            e.target.value === ""
                              ? null
                              : parseInt(e.target.value)
                          )
                        }
                        className={styles.categorySelect}
                      >
                        <option value="">Không có</option>
                        {categories.map(
                          (cat) =>
                            cat.id !== category.id && (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            )
                        )}
                      </select>
                    ) : (
                      categories.find((cat) => cat.id === category.parentId)
                        ?.name || "Không có"
                    )}
                  </td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <textarea
                        value={editedCategoryDescription}
                        onChange={(e) =>
                          setEditedCategoryDescription(e.target.value)
                        }
                        className={styles.categoryTextarea}
                      />
                    ) : (
                      category.description
                    )}
                  </td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <>
                        <button
                          className={styles.actionButton}
                          onClick={handleUpdateCategory}
                        >
                          Lưu
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={handleCancelEdit}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEditCategory(category)}
                        >
                          Sửa
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleDeleteCategory(category.id)}
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

          {/* Nút thêm danh mục */}
          <button
            className={styles.categoryButton}
            onClick={handleAddCategory}
            disabled={isAdding}
          >
            Thêm danh mục
          </button>

          {/* Input và nút lưu/hủy khi thêm */}
          {isAdding && (
            <div className={styles.addCategoryContainer}>
              <input
                type="text"
                placeholder="Tên danh mục mới"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={styles.categoryInput}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setNewCategoryImage)}
              />
              {newCategoryImage && (
                <img
                  src={newCategoryImage}
                  alt="Category Preview"
                  className={styles.imagePreview}
                />
              )}
              <textarea
                placeholder="Mô tả danh mục"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className={styles.categoryTextarea}
              />
              <select
                value={newCategoryParentId || ""}
                onChange={(e) =>
                  setNewCategoryParentId(
                    e.target.value === "" ? null : parseInt(e.target.value)
                  )
                }
                className={styles.categorySelect}
              >
                <option value="">Không có danh mục cha</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                className={styles.categoryButton}
                onClick={handleSaveCategory}
              >
                Lưu
              </button>
              <button
                className={styles.categoryButton}
                onClick={handleCancelAdd}
              >
                Hủy
              </button>
            </div>
          )}
        </main>
        {/* Phần Code Nôi dung Trong đây */}
      </div>
    </>
  );
};

export default HomeDanhMucSanPham;
