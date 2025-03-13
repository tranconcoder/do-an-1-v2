"use client";

import styles from "./styles.module.scss";
import Image from "next/image";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader/index";
import HomeFooter from "@/components/HomeFooter/index";
import HomeBoxChat from "@/components/HomeBoxChat/index";
import HomeThanhToan from "@/components/HomeThanhToan/index";
import { useEffect, useRef, useState } from "react";

export default function ThanhToan() {
  return (
    <>
      <HomeHeader />
      <HomeBoxChat />
      <HomeThanhToan />
      <HomeFooter />
    </>
  );
}
