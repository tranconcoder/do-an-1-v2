"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

interface HomeAdSanPhamProps {}

// Define Product Types
interface BaseProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
  description?: string;
}

interface PhoneProduct extends BaseProduct {
  category: "Điện thoại";
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  memoryCard: boolean;
  displayResolution: string;
  maxBrightness: string;
  displayTechnology: string;
  frontCameraResolution: string;
  rearCameraResolution: string;
  rearCameraLed: boolean;
  frontCameraFeatures: string;
  rearCameraFeatures: string;
  batteryCapacity: string;
  batteryType: string;
  batteryTechnology: string;
  specialFeatures: string;
  audioRecording: boolean;
  waterResistance: boolean;
  sim: string;
  gps: boolean;
  bluetooth: string;
  port: string;
  material: string;
  design: string;
  size: string;
  weight: string;
  brand: string;
  color: string;
}

interface ClothingProduct extends BaseProduct {
  category: "Quần áo";
  color: string;
  size: string;
  style: string;
  material: string;
}

interface ShoesProduct extends BaseProduct {
  category: "Giày dép";
  color: string;
  size: string;
  style: string;
  material: string;
}

interface ElectronicsProduct extends BaseProduct {
  category: "Điện tử";
  type: string;
  capacity: string;
  power: string;
  brand: string;
  origin: string;
  launchYear: string;
  utilities: string;
  material: string;
  size: string;
}
interface DienGiaDungProduct extends BaseProduct {
  category: "Điện Gia dụng";
  loai: string;
  dungTichSD: string;
  dungTichTong: string;
  congSuat: string;
  thuongHieu: string;
  noiSX: string;
  namRaMat: string;
  tienIch: string;
  chatLieu: string;
  kichThuoc: string;
}

interface BaloTuiViProduct extends BaseProduct {
  category: "Balo Túi Ví";
  size: string;
  color: string;
  chatLieu: string;
  tienIch: string;
}

interface DongHoThongMinhProduct extends BaseProduct {
  category: "Đồng hồ thông minh";
  manHinh: string;
  congNgheManHinh: string;
  doPhanGiai: string;
  kichThuocMat: string;
  chatLieu: string;
  doRongDay: string;
  khaNangThayDay: boolean;
  hoTroNgheGoi: boolean;
  chongNuoc: boolean;
  khangNuoc: boolean;
  theoDoiSucKhoe: boolean;
  hienThiThongBao: boolean;
  thoiGianSD: string;
  thoiGianSac: string;
  dungLuongPin: string;
  cpu: string;
  boNhoTrong: string;
  heDieuHanh: string;
  ketNoi: string;
  camBien: string;
  dinhVi: string;
  ngonNgu: string;
}

interface NuocHoaProduct extends BaseProduct {
  category: "Nước hoa";
  nhanHieu: string;
  gioiTinh: string;
  nongDo: string;
  nhaPhaChe: string;
  nhomHuong: string;
  phongCach: string;
  doLuuMui: string;
  doToaHuong: string;
}

interface MyPhamProduct extends BaseProduct {
  category: "Mỹ phẩm";
  loai: string; // Son, Chống nắng, Mặt nạ, Sữa rửa mặt
  thuongHieu: string;
  mauSac?: string; // For Son
  xuatXu: string;
  loaiDa?: string; // For Chống nắng, Mặt nạ, Sữa rửa mặt
}

type Product =
  | PhoneProduct
  | ClothingProduct
  | ShoesProduct
  | ElectronicsProduct
  | DienGiaDungProduct
  | BaloTuiViProduct
  | DongHoThongMinhProduct
  | NuocHoaProduct
  | MyPhamProduct;

// Union type for product categories
type ProductCategory =
  | "Điện thoại"
  | "Quần áo"
  | "Giày dép"
  | "Điện tử"
  | "Điện Gia dụng"
  | "Phụ kiện tóc"
  | "Văn phòng phẩm"
  | "Balo Túi Ví"
  | "Đồng hồ thông minh"
  | "Nước hoa"
  | "Mỹ phẩm";

// Extend the Partial type to make the category field required during the creation process
type NewProduct<T extends ProductCategory> = Omit<
  Partial<
    T extends "Điện thoại"
      ? PhoneProduct
      : T extends "Quần áo"
      ? ClothingProduct
      : T extends "Giày dép"
      ? ShoesProduct
      : T extends "Điện tử"
      ? ElectronicsProduct
      : T extends "Điện Gia dụng"
      ? DienGiaDungProduct
      : T extends "Balo Túi Ví"
      ? BaloTuiViProduct
      : T extends "Đồng hồ thông minh"
      ? DongHoThongMinhProduct
      : T extends "Nước hoa"
      ? NuocHoaProduct
      : T extends "Mỹ phẩm"
      ? MyPhamProduct
      : BaseProduct
  >,
  "id"
> & { category: T };

const HomeAdSanPham: React.FC<HomeAdSanPhamProps> = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  // Sample Product Data (Replace with your actual data fetching logic)
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "iPhone 15",
      price: 1200,
      quantity: 10,
      imageUrl: "/iphone1.png",
      category: "Điện thoại",
      os: "iOS 17",
      cpu: "A17 Bionic",
      gpu: "Apple GPU",
      ram: "8GB",
      storage: "256GB",
      memoryCard: false,
      displayResolution: "2796 x 1290",
      maxBrightness: "2000 nits",
      displayTechnology: "Super Retina XDR",
      frontCameraResolution: "12MP",
      rearCameraResolution: "48MP",
      rearCameraLed: true,
      frontCameraFeatures: "Auto HDR",
      rearCameraFeatures: "Night mode",
      batteryCapacity: "4912 mAh",
      batteryType: "Li-Ion",
      batteryTechnology: "Fast charging",
      specialFeatures: "Face ID",
      audioRecording: true,
      waterResistance: true,
      sim: "Dual SIM",
      gps: true,
      bluetooth: "5.3",
      port: "Lightning",
      material: "Glass and aluminum",
      design: "Sleek",
      size: "147.6 x 71.6 x 7.8 mm",
      weight: "203 g",
      brand: "Apple",
      color: "Space Black",
      description: "The latest iPhone with cutting-edge features.", // Sample Description
    },
    {
      id: "2",
      name: "T-Shirt",
      price: 25,
      quantity: 50,
      imageUrl: "/iphone1.png",
      category: "Quần áo",
      color: "Blue",
      size: "M",
      style: "Casual",
      material: "Cotton",
      description: "Comfortable cotton T-shirt for everyday wear.", // Sample Description
    },
  ]);

  // State for showing/hiding the Add Product form
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const [newProduct, setNewProduct] = useState<NewProduct<ProductCategory>>({
    name: "",
    price: 0,
    quantity: 0,
    imageUrl: "",
    category: "Điện thoại",
    description: "", // Add description here too
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

  // Function to handle adding a new product
  const handleAddProduct = () => {
    setShowAddProductForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setNewProduct((prevProduct) => {
      let newValue: any = value; // Default to the string value

      if (type === "checkbox") {
        newValue = (e.target as HTMLInputElement).checked; // Correctly cast and access
      }

      return {
        ...prevProduct,
        [name]: newValue,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a unique ID (in a real app, this would be handled by the backend)
    const newProductId = Math.random().toString(36).substring(2, 15);
    const finalNewProduct: Product = {
      id: newProductId,
      ...newProduct,
    } as Product;

    setProducts([...products, finalNewProduct]);
    setShowAddProductForm(false); // Hide the form
    setNewProduct({
      name: "",
      price: 0,
      quantity: 0,
      imageUrl: "",
      category: "Điện thoại",
      description: "", // Add description here too
    });
  };

  const handleCancelAddProduct = () => {
    setShowAddProductForm(false);
    setNewProduct({
      name: "",
      price: 0,
      quantity: 0,
      imageUrl: "",
      category: "Điện thoại",
      description: "", // Add description here too
    });
  };

  const renderCategorySpecificFields = () => {
    switch (selectedCategory) {
      // Use selectedCategory instead of newProduct.category
      case "Điện thoại":
        return (
          <>
            {/* Phone Product Fields */}
            <label htmlFor="os">OS:</label>
            <input
              type="text"
              id="os"
              name="os"
              value={(newProduct as NewProduct<"Điện thoại">).os || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="cpu">CPU:</label>
            <input
              type="text"
              id="cpu"
              name="cpu"
              value={(newProduct as NewProduct<"Điện thoại">).cpu || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="gpu">GPU:</label>
            <input
              type="text"
              id="gpu"
              name="gpu"
              value={(newProduct as NewProduct<"Điện thoại">).gpu || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="ram">RAM:</label>
            <input
              type="text"
              id="ram"
              name="ram"
              value={(newProduct as NewProduct<"Điện thoại">).ram || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="storage">Storage:</label>
            <input
              type="text"
              id="storage"
              name="storage"
              value={(newProduct as NewProduct<"Điện thoại">).storage || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="memoryCard">Memory Card:</label>
            <input
              type="checkbox"
              id="memoryCard"
              name="memoryCard"
              checked={
                (newProduct as NewProduct<"Điện thoại">).memoryCard || false
              }
              onChange={handleInputChange}
            />

            <label htmlFor="displayResolution">Display Resolution:</label>
            <input
              type="text"
              id="displayResolution"
              name="displayResolution"
              value={
                (newProduct as NewProduct<"Điện thoại">).displayResolution || ""
              }
              onChange={handleInputChange}
            />

            <label htmlFor="maxBrightness">Max Brightness:</label>
            <input
              type="text"
              id="maxBrightness"
              name="maxBrightness"
              value={
                (newProduct as NewProduct<"Điện thoại">).maxBrightness || ""
              }
              onChange={handleInputChange}
            />

            <label htmlFor="displayTechnology">Display Technology:</label>
            <input
              type="text"
              id="displayTechnology"
              name="displayTechnology"
              value={
                (newProduct as NewProduct<"Điện thoại">).displayTechnology || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="frontCameraResolution">
              Front Camera Resolution:
            </label>
            <input
              type="text"
              id="frontCameraResolution"
              name="frontCameraResolution"
              value={
                (newProduct as NewProduct<"Điện thoại">)
                  .frontCameraResolution || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="rearCameraResolution">
              Rear Camera Resolution:
            </label>
            <input
              type="text"
              id="rearCameraResolution"
              name="rearCameraResolution"
              value={
                (newProduct as NewProduct<"Điện thoại">).rearCameraResolution ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="rearCameraLed">Rear Camera Led:</label>
            <input
              type="checkbox"
              id="rearCameraLed"
              name="rearCameraLed"
              checked={
                (newProduct as NewProduct<"Điện thoại">).rearCameraLed || false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="frontCameraFeatures">Front Camera Features:</label>
            <input
              type="text"
              id="frontCameraFeatures"
              name="frontCameraFeatures"
              value={
                (newProduct as NewProduct<"Điện thoại">).frontCameraFeatures ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="rearCameraFeatures">Rear Camera Features:</label>
            <input
              type="text"
              id="rearCameraFeatures"
              name="rearCameraFeatures"
              value={
                (newProduct as NewProduct<"Điện thoại">).rearCameraFeatures ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="batteryCapacity">Battery Capacity:</label>
            <input
              type="text"
              id="batteryCapacity"
              name="batteryCapacity"
              value={
                (newProduct as NewProduct<"Điện thoại">).batteryCapacity || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="batteryType">Battery Type:</label>
            <input
              type="text"
              id="batteryType"
              name="batteryType"
              value={(newProduct as NewProduct<"Điện thoại">).batteryType || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="batteryTechnology">Battery Technology:</label>
            <input
              type="text"
              id="batteryTechnology"
              name="batteryTechnology"
              value={
                (newProduct as NewProduct<"Điện thoại">).batteryTechnology || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="specialFeatures">Special Features:</label>
            <input
              type="text"
              id="specialFeatures"
              name="specialFeatures"
              value={
                (newProduct as NewProduct<"Điện thoại">).specialFeatures || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="audioRecording">Audio Recording:</label>
            <input
              type="checkbox"
              id="audioRecording"
              name="audioRecording"
              checked={
                (newProduct as NewProduct<"Điện thoại">).audioRecording || false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="waterResistance">Water Resistance:</label>
            <input
              type="checkbox"
              id="waterResistance"
              name="waterResistance"
              checked={
                (newProduct as NewProduct<"Điện thoại">).waterResistance ||
                false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="sim">SIM:</label>
            <input
              type="text"
              id="sim"
              name="sim"
              value={(newProduct as NewProduct<"Điện thoại">).sim || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="gps">GPS:</label>
            <input
              type="checkbox"
              id="gps"
              name="gps"
              checked={(newProduct as NewProduct<"Điện thoại">).gps || false}
              onChange={handleInputChange}
            />
            <label htmlFor="bluetooth">Bluetooth:</label>
            <input
              type="text"
              id="bluetooth"
              name="bluetooth"
              value={(newProduct as NewProduct<"Điện thoại">).bluetooth || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="port">Port:</label>
            <input
              type="text"
              id="port"
              name="port"
              value={(newProduct as NewProduct<"Điện thoại">).port || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="material">Material:</label>
            <input
              type="text"
              id="material"
              name="material"
              value={(newProduct as NewProduct<"Điện thoại">).material || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="design">Design:</label>
            <input
              type="text"
              id="design"
              name="design"
              value={(newProduct as NewProduct<"Điện thoại">).design || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="size">Size:</label>
            <input
              type="text"
              id="size"
              name="size"
              value={(newProduct as NewProduct<"Điện thoại">).size || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="weight">Weight:</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={(newProduct as NewProduct<"Điện thoại">).weight || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="brand">Brand:</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={(newProduct as NewProduct<"Điện thoại">).brand || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={(newProduct as NewProduct<"Điện thoại">).color || ""}
              onChange={handleInputChange}
            />
          </>
        );

      // Clothing
      case "Quần áo":
        return (
          <>
            {/* Clothing Product Fields */}
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={(newProduct as NewProduct<"Quần áo">).color || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="size">Size:</label>
            <input
              type="text"
              id="size"
              name="size"
              value={(newProduct as NewProduct<"Quần áo">).size || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="style">Style:</label>
            <input
              type="text"
              id="style"
              name="style"
              value={(newProduct as NewProduct<"Quần áo">).style || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="material">Material:</label>
            <input
              type="text"
              id="material"
              name="material"
              value={(newProduct as NewProduct<"Quần áo">).material || ""}
              onChange={handleInputChange}
            />
          </>
        );
      // Dien tu
      case "Điện tử":
        return (
          <>
            {/* Electronics Product Fields */}
            <label htmlFor="type">Type:</label>
            <input
              type="text"
              id="type"
              name="type"
              value={(newProduct as NewProduct<"Điện tử">).type || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="capacity">Capacity:</label>
            <input
              type="text"
              id="capacity"
              name="capacity"
              value={(newProduct as NewProduct<"Điện tử">).capacity || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="power">Power:</label>
            <input
              type="text"
              id="power"
              name="power"
              value={(newProduct as NewProduct<"Điện tử">).power || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="brand">Brand:</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={(newProduct as NewProduct<"Điện tử">).brand || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="origin">Origin:</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={(newProduct as NewProduct<"Điện tử">).origin || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="launchYear">Launch Year:</label>
            <input
              type="text"
              id="launchYear"
              name="launchYear"
              value={(newProduct as NewProduct<"Điện tử">).launchYear || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="utilities">Utilities:</label>
            <input
              type="text"
              id="utilities"
              name="utilities"
              value={(newProduct as NewProduct<"Điện tử">).utilities || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="material">Material:</label>
            <input
              type="text"
              id="material"
              name="material"
              value={(newProduct as NewProduct<"Điện tử">).material || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="size">Size:</label>
            <input
              type="text"
              id="size"
              name="size"
              value={(newProduct as NewProduct<"Điện tử">).size || ""}
              onChange={handleInputChange}
            />
          </>
        );

      // BALO TUI VI
      case "Balo Túi Ví":
        return (
          <>
            {/* Balo Túi Ví Fields */}
            <label htmlFor="size">Size:</label>
            <input
              type="text"
              id="size"
              name="size"
              value={(newProduct as NewProduct<"Balo Túi Ví">).size || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={(newProduct as NewProduct<"Balo Túi Ví">).color || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="chatLieu">Chất liệu:</label>
            <input
              type="text"
              id="chatLieu"
              name="chatLieu"
              value={(newProduct as NewProduct<"Balo Túi Ví">).chatLieu || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="tienIch">Tiện ích:</label>
            <input
              type="text"
              id="tienIch"
              name="tienIch"
              value={(newProduct as NewProduct<"Balo Túi Ví">).tienIch || ""}
              onChange={handleInputChange}
            />
          </>
        );

      // NƯỚC HOA
      case "Nước hoa":
        return (
          <>
            {/* Nước hoa Fields */}
            <label htmlFor="nhanHieu">Nhãn hiệu:</label>
            <input
              type="text"
              id="nhanHieu"
              name="nhanHieu"
              value={(newProduct as NewProduct<"Nước hoa">).nhanHieu || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="gioiTinh">Giới tính:</label>
            <input
              type="text"
              id="gioiTinh"
              name="gioiTinh"
              value={(newProduct as NewProduct<"Nước hoa">).gioiTinh || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="nongDo">Nồng độ:</label>
            <input
              type="text"
              id="nongDo"
              name="nongDo"
              value={(newProduct as NewProduct<"Nước hoa">).nongDo || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="nhaPhaChe">Nhà pha chế:</label>
            <input
              type="text"
              id="nhaPhaChe"
              name="nhaPhaChe"
              value={(newProduct as NewProduct<"Nước hoa">).nhaPhaChe || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="nhomHuong">Nhóm hương:</label>
            <input
              type="text"
              id="nhomHuong"
              name="nhomHuong"
              value={(newProduct as NewProduct<"Nước hoa">).nhomHuong || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="phongCach">Phong cách:</label>
            <input
              type="text"
              id="phongCach"
              name="phongCach"
              value={(newProduct as NewProduct<"Nước hoa">).phongCach || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="doLuuMui">Độ lưu mùi:</label>
            <input
              type="text"
              id="doLuuMui"
              name="doLuuMui"
              value={(newProduct as NewProduct<"Nước hoa">).doLuuMui || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="doToaHuong">Độ tỏa hương:</label>
            <input
              type="text"
              id="doToaHuong"
              name="doToaHuong"
              value={(newProduct as NewProduct<"Nước hoa">).doToaHuong || ""}
              onChange={handleInputChange}
            />
          </>
        );

      // MỸ PHẨM
      case "Mỹ phẩm":
        return (
          <>
            {/* Mỹ phẩm Fields */}
            <label htmlFor="loai">Loại (Son, Chống nắng, ...):</label>
            <input
              type="text"
              id="loai"
              name="loai"
              value={(newProduct as NewProduct<"Mỹ phẩm">).loai || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="thuongHieu">Thương hiệu:</label>
            <input
              type="text"
              id="thuongHieu"
              name="thuongHieu"
              value={(newProduct as NewProduct<"Mỹ phẩm">).thuongHieu || ""}
              onChange={handleInputChange}
            />

            {/*Conditionally render mauSac for Son */}
            {(newProduct as NewProduct<"Mỹ phẩm">).loai === "Son" && (
              <>
                <label htmlFor="mauSac">Màu sắc:</label>
                <input
                  type="text"
                  id="mauSac"
                  name="mauSac"
                  value={(newProduct as NewProduct<"Mỹ phẩm">).mauSac || ""}
                  onChange={handleInputChange}
                />
              </>
            )}

            <label htmlFor="xuatXu">Xuất xứ:</label>
            <input
              type="text"
              id="xuatXu"
              name="xuatXu"
              value={(newProduct as NewProduct<"Mỹ phẩm">).xuatXu || ""}
              onChange={handleInputChange}
            />
            {/*Conditionally render loaiDa for Chống nắng, Mặt nạ, Sữa rửa mặt */}
            {(newProduct as NewProduct<"Mỹ phẩm">).loai === "Chống nắng" ||
            (newProduct as NewProduct<"Mỹ phẩm">).loai === "Mặt nạ" ||
            (newProduct as NewProduct<"Mỹ phẩm">).loai === "Sữa rửa mặt" ? (
              <>
                <label htmlFor="loaiDa">Loại da:</label>
                <input
                  type="text"
                  id="loaiDa"
                  name="loaiDa"
                  value={(newProduct as NewProduct<"Mỹ phẩm">).loaiDa || ""}
                  onChange={handleInputChange}
                />
              </>
            ) : null}
          </>
        );

      case "Giày dép":
        return (
          <>
            {/* Giày dép Fields */}
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={(newProduct as NewProduct<"Giày dép">).color || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="size">Size:</label>
            <input
              type="text"
              id="size"
              name="size"
              value={(newProduct as NewProduct<"Giày dép">).size || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="style">Style:</label>
            <input
              type="text"
              id="style"
              name="style"
              value={(newProduct as NewProduct<"Giày dép">).style || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="material">Material:</label>
            <input
              type="text"
              id="material"
              name="material"
              value={(newProduct as NewProduct<"Giày dép">).material || ""}
              onChange={handleInputChange}
            />
          </>
        );

      case "Điện Gia dụng":
        return (
          <>
            {/* Điện Gia dụng Fields */}
            <label htmlFor="loai">Loại:</label>
            <input
              type="text"
              id="loai"
              name="loai"
              value={(newProduct as NewProduct<"Điện Gia dụng">).loai || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="dungTichSD">Dung tích SD:</label>
            <input
              type="text"
              id="dungTichSD"
              name="dungTichSD"
              value={
                (newProduct as NewProduct<"Điện Gia dụng">).dungTichSD || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="dungTichTong">Dung tích Tổng:</label>
            <input
              type="text"
              id="dungTichTong"
              name="dungTichTong"
              value={
                (newProduct as NewProduct<"Điện Gia dụng">).dungTichTong || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="congSuat">Công suất:</label>
            <input
              type="text"
              id="congSuat"
              name="congSuat"
              value={(newProduct as NewProduct<"Điện Gia dụng">).congSuat || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="thuongHieu">Thương Hiệu:</label>
            <input
              type="text"
              id="thuongHieu"
              name="thuongHieu"
              value={
                (newProduct as NewProduct<"Điện Gia dụng">).thuongHieu || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="noiSX">Nơi SX:</label>
            <input
              type="text"
              id="noiSX"
              name="noiSX"
              value={(newProduct as NewProduct<"Điện Gia dụng">).noiSX || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="namRaMat">Năm Ra Mắt:</label>
            <input
              type="text"
              id="namRaMat"
              name="namRaMat"
              value={(newProduct as NewProduct<"Điện Gia dụng">).namRaMat || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="tienIch">Tiện Ích:</label>
            <input
              type="text"
              id="tienIch"
              name="tienIch"
              value={(newProduct as NewProduct<"Điện Gia dụng">).tienIch || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="chatLieu">Chất Liệu:</label>
            <input
              type="text"
              id="chatLieu"
              name="chatLieu"
              value={(newProduct as NewProduct<"Điện Gia dụng">).chatLieu || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="kichThuoc">Kích Thước:</label>
            <input
              type="text"
              id="kichThuoc"
              name="kichThuoc"
              value={
                (newProduct as NewProduct<"Điện Gia dụng">).kichThuoc || ""
              }
              onChange={handleInputChange}
            />
          </>
        );

      case "Đồng hồ thông minh":
        return (
          <>
            {/* Đồng hồ thông minh Fields */}
            <label htmlFor="manHinh">Màn hình:</label>
            <input
              type="text"
              id="manHinh"
              name="manHinh"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).manHinh || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="congNgheManHinh">Công nghệ màn hình:</label>
            <input
              type="text"
              id="congNgheManHinh"
              name="congNgheManHinh"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">)
                  .congNgheManHinh || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="doPhanGiai">Độ phân giải:</label>
            <input
              type="text"
              id="doPhanGiai"
              name="doPhanGiai"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).doPhanGiai ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="kichThuocMat">Kích thước mặt:</label>
            <input
              type="text"
              id="kichThuocMat"
              name="kichThuocMat"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).kichThuocMat ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="chatLieu">Chất liệu:</label>
            <input
              type="text"
              id="chatLieu"
              name="chatLieu"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).chatLieu || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="doRongDay">Độ rộng dây:</label>
            <input
              type="text"
              id="doRongDay"
              name="doRongDay"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).doRongDay || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="khaNangThayDay">Khả năng thay dây:</label>
            <input
              type="checkbox"
              id="khaNangThayDay"
              name="khaNangThayDay"
              checked={
                (newProduct as NewProduct<"Đồng hồ thông minh">)
                  .khaNangThayDay || false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="hoTroNgheGoi">Hỗ trợ nghe gọi:</label>
            <input
              type="checkbox"
              id="hoTroNgheGoi"
              name="hoTroNgheGoi"
              checked={
                (newProduct as NewProduct<"Đồng hồ thông minh">).hoTroNgheGoi ||
                false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="chongNuoc">Chống nước:</label>
            <input
              type="checkbox"
              id="chongNuoc"
              name="chongNuoc"
              checked={
                (newProduct as NewProduct<"Đồng hồ thông minh">).chongNuoc ||
                false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="khangNuoc">Kháng nước:</label>
            <input
              type="checkbox"
              id="khangNuoc"
              name="khangNuoc"
              checked={
                (newProduct as NewProduct<"Đồng hồ thông minh">).khangNuoc ||
                false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="theoDoiSucKhoe">Theo dõi sức khỏe:</label>
            <input
              type="checkbox"
              id="theoDoiSucKhoe"
              name="theoDoiSucKhoe"
              checked={
                (newProduct as NewProduct<"Đồng hồ thông minh">)
                  .theoDoiSucKhoe || false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="hienThiThongBao">Hiển thị thông báo:</label>
            <input
              type="checkbox"
              id="hienThiThongBao"
              name="hienThiThongBao"
              checked={
                (newProduct as NewProduct<"Đồng hồ thông minh">)
                  .hienThiThongBao || false
              }
              onChange={handleInputChange}
            />
            <label htmlFor="thoiGianSD">Thời gian SD:</label>
            <input
              type="text"
              id="thoiGianSD"
              name="thoiGianSD"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).thoiGianSD ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="thoiGianSac">Thời gian sạc:</label>
            <input
              type="text"
              id="thoiGianSac"
              name="thoiGianSac"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).thoiGianSac ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="dungLuongPin">Dung lượng pin:</label>
            <input
              type="text"
              id="dungLuongPin"
              name="dungLuongPin"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).dungLuongPin ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="cpu">CPU:</label>
            <input
              type="text"
              id="cpu"
              name="cpu"
              value={(newProduct as NewProduct<"Đồng hồ thông minh">).cpu || ""}
              onChange={handleInputChange}
            />
            <label htmlFor="boNhoTrong">Bộ nhớ trong:</label>
            <input
              type="text"
              id="boNhoTrong"
              name="boNhoTrong"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).boNhoTrong ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="heDieuHanh">Hệ điều hành:</label>
            <input
              type="text"
              id="heDieuHanh"
              name="heDieuHanh"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).heDieuHanh ||
                ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="ketNoi">Kết nối:</label>
            <input
              type="text"
              id="ketNoi"
              name="ketNoi"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).ketNoi || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="camBien">Cảm biến:</label>
            <input
              type="text"
              id="camBien"
              name="camBien"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).camBien || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="dinhVi">Định vị:</label>
            <input
              type="text"
              id="dinhVi"
              name="dinhVi"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).dinhVi || ""
              }
              onChange={handleInputChange}
            />
            <label htmlFor="ngonNgu">Ngôn ngữ:</label>
            <input
              type="text"
              id="ngonNgu"
              name="ngonNgu"
              value={
                (newProduct as NewProduct<"Đồng hồ thông minh">).ngonNgu || ""
              }
              onChange={handleInputChange}
            />
          </>
        );

      default:
        return null;
    }
  };

  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("Điện thoại");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as ProductCategory;
    setSelectedCategory(newCategory);

    // Reset newProduct state, keeping only base properties and setting the new category
    setNewProduct({
      name: "",
      price: 0,
      quantity: 0,
      imageUrl: "",
      category: newCategory,
      description: "",
    });
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    const productToEdit = products.find((product) => product.id === productId);

    if (productToEdit) {
      setNewProduct({
        name: productToEdit.name,
        price: productToEdit.price,
        quantity: productToEdit.quantity,
        imageUrl: productToEdit.imageUrl,
        category: productToEdit.category as ProductCategory,
        description: productToEdit.description || "",
        ...(productToEdit as any), // copy category-specific properties
      });
      setSelectedCategory(productToEdit.category as ProductCategory); // set selected category
      setShowAddProductForm(true);
    }
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProductId) {
      // Update existing product
      const updatedProducts = products.map((product) =>
        product.id === editingProductId
          ? ({ id: editingProductId, ...newProduct } as Product)
          : product
      );

      setProducts(updatedProducts);
    } else {
      // Add new product
      // Generate a unique ID (in a real app, this would be handled by the backend)
      const newProductId = Math.random().toString(36).substring(2, 15);
      const finalNewProduct: Product = {
        id: newProductId,
        ...newProduct,
      } as Product;

      setProducts([...products, finalNewProduct]);
    }

    setShowAddProductForm(false); // Hide the form
    setNewProduct({
      name: "",
      price: 0,
      quantity: 0,
      imageUrl: "",
      category: "Điện thoại",
      description: "", // Add description here too
    });

    setEditingProductId(null);
  };
  const handleDeleteProduct = (productId: string) => {
    // Filter out the product to be deleted
    const updatedProducts = products.filter(
      (product) => product.id !== productId
    );
    setProducts(updatedProducts);
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
        <main
          id="main-content"
          className={styles.mainContent}
          ref={mainContentRef}
        >
          <section className={styles.productSection}>
            <h2>Quản Lý Sản Phẩm</h2>
            <div className={styles.productTableContainer}>
              <table className={styles.productTable}>
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Giá</th>
                    <th>Số Lượng</th>
                    <th>Thông tin chi tiết</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => (
                    <tr key={product.id}>
                      <td>
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={50}
                          height={50}
                          style={{ objectFit: "cover" }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.price.toLocaleString()} VNĐ</td>
                      <td>{product.quantity}</td>
                      <td>{product.description}</td>
                      <td>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditProduct(product.id)}
                        >
                          Sửa
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Product Form */}
            {!showAddProductForm ? (
              <button
                className={styles.addProductButton}
                onClick={handleAddProduct}
              >
                Thêm Sản Phẩm
              </button>
            ) : (
              <form
                className={styles.addProductForm}
                onSubmit={handleUpdateProduct}
              >
                <label htmlFor="name">Tên Sản Phẩm:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  required
                />

                <label htmlFor="price">Giá:</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  required
                />

                <label htmlFor="quantity">Số Lượng:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  required
                />

                <label htmlFor="imageUrl">URL Hình Ảnh:</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={newProduct.imageUrl}
                  onChange={handleInputChange}
                  required
                />

                {/* Add Description Input */}
                <label htmlFor="description">Mô tả:</label>
                <textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                ></textarea>
                <label htmlFor="category">Danh mục:</label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Quần áo">Quần áo</option>
                  <option value="Giày dép">Giày dép</option>
                  <option value="Điện tử">Điện tử</option>
                  <option value="Điện Gia dụng">Điện Gia dụng</option>
                  <option value="Balo Túi Ví">Balo Túi Ví</option>
                  <option value="Đồng hồ thông minh">Đồng hồ thông minh</option>
                  <option value="Nước hoa">Nước hoa</option>
                  <option value="Mỹ phẩm">Mỹ phẩm</option>
                </select>
                {renderCategorySpecificFields()}
                <div className={styles.formButtons}>
                  <button type="submit" className={styles.saveButton}>
                    {editingProductId ? "Cập nhật" : "Lưu"}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelAddProduct}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>
        {/* Phần Code Nôi dung Trong đây */}
      </div>
    </>
  );
};

export default HomeAdSanPham;
