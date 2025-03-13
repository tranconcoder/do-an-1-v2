"use client"; // Add this line at the top of the file
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";
import HomeHeader from "@/components/HomeHeader/index";
import HomeFooter from "@/components/HomeFooter/index";
import HomeBoxChat from "@/components/HomeBoxChat/index";
import HomeGioHang from "@/components/HomeGioHang/index";
import { useState, useCallback, useRef } from "react"; // Import useRef

export default function SanPham() {
  return (
    <>
      <HomeHeader />
      <HomeBoxChat />
      <HomeGioHang />
      <HomeFooter />
    </>
  );
}
