"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import HomeHeader from "@/components/HomeHeader/index";
import HomeFooter from "@/components/HomeFooter/index";
import HomeBoxChat from "@/components/HomeBoxChat/index";
import { useEffect, useState } from "react";

// Define product type
interface Product {
  id: number;
  name: string;
  brand: string;
  storage: number;
  price: number;
  image: string;
  screenSize: number;
  chip: string;
  battery: number;
}

export default function HangHoa() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "iPhone 13",
      brand: "apple",
      storage: 128,
      price: 18000000,
      image: "/iphone.png",
      screenSize: 6.1,
      chip: "a15",
      battery: 3240,
    },
    {
      id: 2,
      name: "Samsung Galaxy S22",
      brand: "samsung",
      storage: 256,
      price: 26000000,
      image: "/iphone.png",
      screenSize: 6.8,
      chip: "snapdragon8gen1",
      battery: 4500,
    },
    {
      id: 3,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 12000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 4,
      name: "iPhone SE",
      brand: "apple",
      storage: 128,
      price: 9000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 5,
      name: "iPhone SE",
      brand: "samsung",
      storage: 64,
      price: 8000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 6,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 7000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 7,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 6000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 8,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 4000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 9,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 4000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 10,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 4000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 11,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 4000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
    {
      id: 12,
      name: "iPhone SE",
      brand: "apple",
      storage: 64,
      price: 4000000,
      image: "/iphone.png",
      screenSize: 4.7,
      chip: "a15",
      battery: 2018,
    },
  ]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [sortBy, setSortBy] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    filterProducts();
  }, [sortBy, searchTerm]); // Update filteredProducts when sortBy or searchTerm changes

  // Hàm lọc sản phẩm
  const filterProducts = () => {
    //Get value
    let selectedBrand = (document.getElementById("brand") as HTMLSelectElement)
      .value;
    let selectedStorage = (
      document.getElementById("storage") as HTMLSelectElement
    ).value;
    let selectedProcessor = (
      document.getElementById("processor") as HTMLSelectElement
    ).value;
    let selectedNfc = (document.getElementById("nfc") as HTMLSelectElement)
      .value;
    let selectedNeed = (document.getElementById("need") as HTMLSelectElement)
      .value;
    let selectedMemory = (
      document.getElementById("memory") as HTMLSelectElement
    ).value;
    let selectedTypePhone = (
      document.getElementById("typePhone") as HTMLSelectElement
    ).value;
    let selectedStatus = (
      document.getElementById("status") as HTMLSelectElement
    ).value;
    let selectedCamera = (
      document.getElementById("camera") as HTMLSelectElement
    ).value;
    let selectedScreenSize = (
      document.getElementById("screenSize") as HTMLSelectElement
    ).value;
    let selectedFrequence = (
      document.getElementById("frequence") as HTMLSelectElement
    ).value;
    let selectedDesign = (
      document.getElementById("design") as HTMLSelectElement
    ).value;

    let newFilteredProducts = products.filter((product) => {
      if (selectedBrand !== "all" && product.brand !== selectedBrand)
        return false;
      if (
        selectedStorage !== "all" &&
        product.storage !== parseInt(selectedStorage)
      )
        return false;
      if (selectedProcessor !== "all" && product.chip !== selectedProcessor)
        return false;
      if (selectedNfc !== "all") return false;
      if (selectedNeed !== "all") return false;
      if (selectedMemory !== "all") return false;
      if (selectedTypePhone !== "all") return false;
      if (selectedStatus !== "all") return false;
      if (selectedCamera !== "all") return false;
      if (selectedScreenSize !== "all") return false;
      if (selectedFrequence !== "all") return false;
      if (selectedDesign !== "all") return false;

      //Add search term filter
      if (
        searchTerm &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Thêm các điều kiện lọc cho các bộ lọc khác ở đây
      return true; // Nếu tất cả điều kiện đều đúng, giữ sản phẩm
    });

    // Sắp xếp sản phẩm
    newFilteredProducts = sortProducts(newFilteredProducts, sortBy);
    setFilteredProducts(newFilteredProducts);
  };

  // Hàm sắp xếp sản phẩm
  const sortProducts = (productList: Product[], sortBy: string) => {
    switch (sortBy) {
      case "price-desc":
        return [...productList].sort(
          (a: Product, b: Product) => b.price - a.price
        ); // Giá cao đến thấp
      case "price-asc":
        return [...productList].sort(
          (a: Product, b: Product) => a.price - b.price
        ); // Giá thấp đến cao
      //case 'Khuyến Mãi Hot': return productList.sort((a, b) => b.Khuyến mãi - a.Khuyến mãi); //Nếu muốn làm khuyến mãi
      // Ở đây thêm nhiều chức năng khác nếu cần
      default:
        return productList; // Trả về danh sách không sắp xếp nếu không có lựa chọn
    }
  };

  const handleSortButtonClick = (sortType: string) => {
    setSortBy(sortType);
  };

  const handleResetFilters = () => {
    const selectElements = document.querySelectorAll(
      ".filter-group select"
    ) as NodeListOf<HTMLSelectElement>;
    selectElements.forEach((select) => (select.value = "all"));
    setSearchTerm(""); // Clear search term
    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement;
    if (searchInput) searchInput.value = "";
    filterProducts(); // Reset và lọc lại sản phẩm
  };

  const handleApplyFilters = () => {
    filterProducts();
  };

  const handleBuyNowClick = (productId: number) => {
    // Redirect to the SanPham.php page with the product ID as a query parameter
    window.location.href = "" + productId;
  };

  const handleAddToCartClick = (productId: number) => {
    // Xử lý thêm sản phẩm vào giỏ hàng ở đây
    console.log("Thêm sản phẩm " + productId + " vào giỏ hàng");
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <HomeHeader />
      <HomeBoxChat />

      {/* Hang Hoa */}
      <div className={`${styles.container} ${styles.containerLarge}`}>
        <div
          className={`${styles["filter-container"]} ${styles.filterContainerLarge}`}
        >
          <div className={`${styles["filter-row"]} ${styles.filterRowLarge}`}>
            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="brand" onChange={filterProducts}>
                <option value="all">Thương hiệu</option>
                <option value="apple">Apple</option>
                <option value="samsung">Samsung</option>
                {/* Thêm các thương hiệu khác nếu cần */}
              </select>
            </div>

            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="storage" onChange={filterProducts}>
                <option value="all">Dung lượng RAM</option>
                <option value="4">4GB</option>
                <option value="8">8GB</option>
                <option value="12">12GB</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>

            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="processor" onChange={filterProducts}>
                <option value="all">Chip xử lý</option>
                <option value="snapdragon">Snapdragon</option>
                <option value="exynos">Exynos</option>
                <option value="apple_silicon">Apple Silicon</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>
            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="nfc" onChange={filterProducts}>
                <option value="all">Công nghệ NFC</option>
                <option value="snapdragon">Snapdragon</option>
                <option value="exynos">Exynos</option>
                <option value="apple_silicon">Apple Silicon</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>
          </div>

          <div className={`${styles["filter-row"]} ${styles.filterRowLarge}`}>
            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="need" onChange={filterProducts}>
                <option value="all">Nhu cầu sử dụng</option>
                <option value="apple">Apple</option>
                <option value="samsung">Samsung</option>
                {/* Thêm các thương hiệu khác nếu cần */}
              </select>
            </div>

            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="memory" onChange={filterProducts}>
                <option value="all">Bộ nhớ trong</option>
                <option value="4">4GB</option>
                <option value="8">8GB</option>
                <option value="12">12GB</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>

            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="typePhone" onChange={filterProducts}>
                <option value="all">Loại điện thoại</option>
                <option value="snapdragon">Snapdragon</option>
                <option value="exynos">Exynos</option>
                <option value="apple_silicon">Apple Silicon</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>
            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="status" onChange={filterProducts}>
                <option value="all">Tình trạng máy</option>
                <option value="snapdragon">Snapdragon</option>
                <option value="exynos">Exynos</option>
                <option value="apple_silicon">Apple Silicon</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>
          </div>

          <div className={`${styles["filter-row"]} ${styles.filterRowLarge}`}>
            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="camera" onChange={filterProducts}>
                <option value="all">Tính năng camera</option>
                <option value="apple">Apple</option>
                <option value="samsung">Samsung</option>
                {/* Thêm các thương hiệu khác nếu cần */}
              </select>
            </div>

            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="screenSize" onChange={filterProducts}>
                <option value="all">Kích thước màn hình</option>
                <option value="4">4GB</option>
                <option value="8">8GB</option>
                <option value="12">12GB</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>

            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="frequence" onChange={filterProducts}>
                <option value="all">Tần số quét</option>
                <option value="snapdragon">Snapdragon</option>
                <option value="exynos">Exynos</option>
                <option value="apple_silicon">Apple Silicon</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>
            <div
              className={`${styles["filter-group"]} ${styles.filterGroupLarge}`}
            >
              <select id="design" onChange={filterProducts}>
                <option value="all">Kiểu màn hình</option>
                <option value="snapdragon">Snapdragon</option>
                <option value="exynos">Exynos</option>
                <option value="apple_silicon">Apple Silicon</option>
                {/* Thêm các lựa chọn khác */}
              </select>
            </div>
          </div>

          <div className={`${styles["sort-by"]} ${styles.sortByLarge}`}>
            <button
              data-sort="price-desc"
              className={sortBy === "price-desc" ? styles.highlighted : ""}
              onClick={() => handleSortButtonClick("price-desc")}
            >
              Giá Cao - Thấp
            </button>
            <button
              data-sort="price-asc"
              className={sortBy === "price-asc" ? styles.highlighted : ""}
              onClick={() => handleSortButtonClick("price-asc")}
            >
              Giá Thấp - Cao
            </button>
            <button
              data-sort="Khuyến Mãi Hot"
              className={sortBy === "Khuyến Mãi Hot" ? styles.highlighted : ""}
              onClick={() => handleSortButtonClick("Khuyến Mãi Hot")}
            >
              Khuyến Mãi Hot
            </button>
            <button
              data-sort="default"
              className={sortBy === "" ? styles.highlighted : ""}
              onClick={() => handleSortButtonClick("")}
            >
              Xem nhiều
            </button>
          </div>
        </div>

        <div
          className={`${styles["button-container"]} ${styles.buttonContainerLarge}`}
        >
          <input
            type="text"
            id="search-input"
            placeholder="Nhập tên sản phẩm..."
            className={styles["search-input"]}
            onChange={handleSearchChange} // Assuming you have a search change handler
          />
          <button id="apply-filters" onClick={handleApplyFilters}>
            Tìm kiếm
          </button>
          <button id="reset-filters" onClick={handleResetFilters}>
            Đặt lại
          </button>
        </div>
      </div>

      <div
        className={`${styles["product-grid"]} ${styles.productGridLarge}`}
        id="product-list"
      >
        {filteredProducts.length === 0 ? (
          <p>Không có sản phẩm nào phù hợp.</p>
        ) : (
          filteredProducts.map((product) => (
            <div className={styles["product-item"]} key={product.id}>
              <Image
                src={product.image}
                alt={product.name}
                width={200} // Desired width (in pixels)
                height={150} // Desired height (in pixels)
                style={{ objectFit: "contain" }} // Optional: Adjust how the image fits
                className={styles["image"]} //Add to it to
              />
              <h4 className={styles["product-name"]}>{product.name}</h4>
              <p className={styles["price"]}>
                Giá: {product.price.toLocaleString()} VNĐ
              </p>
              <p className={styles["detail"]}>
                Dung lượng: {product.storage}GB
              </p>
              <p className={styles["detail"]}>Thương hiệu: {product.brand}</p>
              <p className={styles["detail"]}>
                Màn hình: {product.screenSize} inches
              </p>
              <p className={styles["detail"]}>Chip: {product.chip}</p>
              <p className={styles["detail"]}>Pin: {product.battery} mAh</p>
              <div className={styles["product-actions"]}>
                <button
                  className={styles["button"]}
                  onClick={() => handleAddToCartClick(product.id)}
                >
                  giỏ hàng
                </button>
                <button
                  className={styles["button"]}
                  onClick={() => handleBuyNowClick(product.id)}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hang Hoa */}
      <HomeFooter />
    </>
  );
}
