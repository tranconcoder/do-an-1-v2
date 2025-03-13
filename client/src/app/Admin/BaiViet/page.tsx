"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

interface HomeAdBaiVietProps {}

// Define the Article interface
interface Article {
  id: string;
  title: string;
  imageUrl: string; // Changed to store the local URL or path
  content: string;
  date: string;
}

const HomeAdBaiViet: React.FC<HomeAdBaiVietProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // State to hold the articles
  const [articles, setArticles] = useState<Article[]>([]);

  // State to control form visibility
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State variables for the form input
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleImage, setNewArticleImage] = useState<File | null>(null); // Store the File object
  const [newArticleContent, setNewArticleContent] = useState("");
  const [newArticleImageUrl, setNewArticleImageUrl] = useState(""); // local URL

  //State for Edit
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editArticleTitle, setEditArticleTitle] = useState("");
  const [editArticleImageUrl, setEditArticleImageUrl] = useState("");
  const [editArticleContent, setEditArticleContent] = useState("");
  const [editArticleImage, setEditArticleImage] = useState<File | null>(null);
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

  // Function to fetch articles (replace with your actual API call)
  const fetchArticles = async () => {
    // Simulate fetching data from an API
    const mockArticles: Article[] = [
      {
        id: "1",
        title: "Bài viết 1: Tin tức nóng hổi",
        imageUrl: "/news1.jpg",
        content:
          "Đây là nội dung của bài viết 1.  Rất nhiều thông tin thú vị ở đây...",
        date: "2024-01-20",
      },
      {
        id: "2",
        title: "Bài viết 2: Khuyến mãi đặc biệt",
        imageUrl: "/news2.jpg",
        content: "Chi tiết về chương trình khuyến mãi hấp dẫn...",
        date: "2024-01-25",
      },
      {
        id: "3",
        title: "Bài viết 3: Khuyến mãi đặc biệt",
        imageUrl: "/news3.jpg",
        content: "Chi tiết về chương trình khuyến mãi hấp dẫn...",
        date: "2024-01-25",
      },
      {
        id: "4",
        title: "Bài viết 1: Tin tức nóng hổi",
        imageUrl: "/news1.jpg",
        content:
          "Đây là nội dung của bài viết 1.  Rất nhiều thông tin thú vị ở đây...",
        date: "2024-01-20",
      },
      {
        id: "5",
        title: "Bài viết 2: Khuyến mãi đặc biệt",
        imageUrl: "/news2.jpg",
        content: "Chi tiết về chương trình khuyến mãi hấp dẫn...",
        date: "2024-01-25",
      },
      {
        id: "6",
        title: "Bài viết 3: Khuyến mãi đặc biệt",
        imageUrl: "/news3.jpg",
        content: "Chi tiết về chương trình khuyến mãi hấp dẫn...",
        date: "2024-01-25",
      },
    ];
    setArticles(mockArticles);

    // Example using fetch API:
    // try {
    //   const response = await fetch('/api/articles'); // Replace with your API endpoint
    //   const data = await response.json();
    //   setArticles(data);
    // } catch (error) {
    //   console.error("Error fetching articles:", error);
    // }
  };

  // Function to delete an article
  const deleteArticle = async (id: string) => {
    // Implement your delete API call here
    // Example:
    // await fetch(`/api/articles/${id}`, { method: 'DELETE' });

    // Update the articles state after successful deletion
    setArticles((prevArticles) =>
      prevArticles.filter((article) => article.id !== id)
    );
  };

  // Function to handle the create article click, show the form
  const handleCreateArticleClick = () => {
    setShowCreateForm(true);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      setNewArticleImage(imageFile);

      // Create a local URL for preview
      setNewArticleImageUrl(URL.createObjectURL(imageFile));
    }
  };

  //Handle the Edit
  const handleEditArticleClick = (article: Article) => {
    setEditingArticle(article);
    setEditArticleTitle(article.title);
    setEditArticleImageUrl(article.imageUrl);
    setEditArticleContent(article.content);
    setShowEditForm(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      setEditArticleImage(imageFile);
      setEditArticleImageUrl(URL.createObjectURL(imageFile));
    }
  };

  const handleCancelEditArticle = () => {
    setShowEditForm(false);
    setEditingArticle(null);
    setEditArticleTitle("");
    setEditArticleImageUrl("");
    setEditArticleContent("");
    setEditArticleImage(null);
  };

  const handleEditArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingArticle) {
      return;
    }
    let updatedImageUrl = editArticleImageUrl;

    if (editArticleImage) {
      try {
        const formData = new FormData();
        formData.append("image", editArticleImage);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        updatedImageUrl = data.filePath; // URL from the server
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
        return;
      }
    }

    // Create an updated article object
    const updatedArticle: Article = {
      ...editingArticle,
      title: editArticleTitle,
      imageUrl: updatedImageUrl,
      content: editArticleContent,
    };

    // Update the articles state
    setArticles(
      articles.map((article) =>
        article.id === editingArticle.id ? updatedArticle : article
      )
    );

    // Clear the form
    setShowEditForm(false);
    setEditingArticle(null);
    setEditArticleTitle("");
    setEditArticleImageUrl("");
    setEditArticleContent("");
    setEditArticleImage(null);
  };
  // Function to handle the form submission
  const handleCreateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newArticleImage) {
      alert("Please select an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", newArticleImage);

      const response = await fetch("/api/upload", {
        // Replace with your API endpoint
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      // Create a new article object
      const newArticle: Article = {
        id: Date.now().toString(), // Generate a unique ID
        title: newArticleTitle,
        imageUrl: data.filePath, // Store the URL from the server
        content: newArticleContent,
        date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
      };

      // Update the articles state
      setArticles([...articles, newArticle]);

      // Clear the form
      setNewArticleTitle("");
      setNewArticleImage(null);
      setNewArticleImageUrl("");
      setNewArticleContent("");

      // Hide the form
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");
    }
  };

  // Function to handle the cancel button click
  const handleCancelCreateArticle = () => {
    setShowCreateForm(false);
    setNewArticleTitle("");
    setNewArticleImage(null);
    setNewArticleImageUrl("");
    setNewArticleContent("");
  };

  useEffect(() => {
    fetchArticles();
  }, []); // Fetch articles on component mount

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
          <h1>Quản Lý Bài Viết</h1>
          <p>
            Chào mừng đến trang quản lý bài viết. Tại đây bạn có thể tạo, chỉnh
            sửa và xóa các bài viết.
          </p>

          <div className={styles.articleActions}>
            <button
              className={styles.createArticleButton}
              onClick={handleCreateArticleClick}
            >
              Tạo Bài Viết Mới
            </button>
          </div>

          {/* Create Article Form */}
          {showCreateForm && (
            <form
              className={styles.createArticleForm}
              onSubmit={handleCreateArticleSubmit}
            >
              <label htmlFor="title">Tiêu đề:</label>
              <input
                type="text"
                id="title"
                value={newArticleTitle}
                onChange={(e) => setNewArticleTitle(e.target.value)}
                required
              />

              <label htmlFor="image">Chọn Hình ảnh:</label>
              <input
                type="file"
                id="image"
                accept="image/*" // Only allow image files
                onChange={handleImageChange}
                required
              />
              {newArticleImageUrl && (
                <Image
                  src={newArticleImageUrl}
                  alt="Preview"
                  width={100}
                  height={100}
                />
              )}

              <label htmlFor="content">Nội dung:</label>
              <textarea
                id="content"
                value={newArticleContent}
                onChange={(e) => setNewArticleContent(e.target.value)}
                required
              />

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Lưu
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelCreateArticle}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Edit Article Form */}
          {showEditForm && editingArticle && (
            <form
              className={styles.createArticleForm}
              onSubmit={handleEditArticleSubmit}
            >
              <label htmlFor="editTitle">Tiêu đề:</label>
              <input
                type="text"
                id="editTitle"
                value={editArticleTitle}
                onChange={(e) => setEditArticleTitle(e.target.value)}
                required
              />

              <label htmlFor="editImage">Chọn Hình ảnh:</label>
              <input
                type="file"
                id="editImage"
                accept="image/*"
                onChange={handleEditImageChange}
              />
              {editArticleImageUrl && (
                <Image
                  src={editArticleImageUrl}
                  alt="Preview"
                  width={100}
                  height={100}
                />
              )}

              <label htmlFor="editContent">Nội dung:</label>
              <textarea
                id="editContent"
                value={editArticleContent}
                onChange={(e) => setEditArticleContent(e.target.value)}
                required
              />

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Lưu
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelEditArticle}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Article List */}
          <div className={styles.articleList}>
            {articles.map((article) => (
              <div className={styles.articleItem} key={article.id}>
                <h3>{article.title}</h3>
                <div className={styles.articleImageContainer}>
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    width={200}
                    height={150}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <p>{article.content.substring(0, 100)}...</p>
                <p className={styles.articleDate}>Ngày đăng: {article.date}</p>
                <div className={styles.articleActions}>
                  <button
                    className={styles.editArticleButton}
                    onClick={() => handleEditArticleClick(article)}
                  >
                    Chỉnh Sửa
                  </button>
                  <button
                    className={styles.deleteArticleButton}
                    onClick={() => deleteArticle(article.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeAdBaiViet;
