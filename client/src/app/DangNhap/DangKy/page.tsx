"use client"; // Add this line to the top of the file

import styles from "./styles.module.scss";
import Image from "next/image";
import Link from "next/link";
import HomeHeader1 from "@/components/HomeHeader1/index";
import HomeFooter from "@/components/HomeFooter/index";
import { useState, useEffect } from "react"; //Import useEffect

const provinces = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];

const districtsByProvince: { [key: string]: string[] } = {
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Đống Đa"],
  "Hồ Chí Minh": ["Quận 1", "Quận 2", "Quận 3"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê"],
  "Hải Phòng": ["Hồng Bàng", "Lê Chân"],
  "Cần Thơ": ["Ninh Kiều", "Cái Răng"],
};

const wardsByDistrict: { [key: string]: string[] } = {
  "Ba Đình": ["Điện Biên", "Quán Thánh"],
  "Hoàn Kiếm": ["Hàng Bạc", "Hàng Gai"],
  "Đống Đa": ["Văn Miếu", "Quốc Tử Giám"],
  "Quận 1": ["Bến Nghé", "Bến Thành"],
  "Quận 2": ["Thảo Điền", "An Phú"],
  "Quận 3": ["Võ Thị Sáu", "Trương Quyền"],
  "Hải Châu": ["Hải Châu 1", "Hải Châu 2"],
  "Thanh Khê": ["Thanh Khê Đông", "Thanh Khê Tây"],
  "Hồng Bàng": ["Minh Khai", "Phan Bội Châu"],
  "Lê Chân": ["Cát Dài", "An Biên"],
  "Ninh Kiều": ["An Hội", "Tân An"],
  "Cái Răng": ["Lê Bình", "Ba Láng"],
};

export default function DangKy() {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false); // New state for overall form validity

  const districts = districtsByProvince[selectedProvince] || [];
  const wards = wardsByDistrict[selectedDistrict] || [];

  // Update individual state variables on input change
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleStreetAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStreetAddress(e.target.value);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
    setSelectedWard("");
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const pattern = /^[0-9]{10,11}$/; // Updated pattern with ^ and $
    return pattern.test(phoneNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError(
        "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số."
      );
      return;
    } else {
      setPhoneNumberError(null); // Clear any previous error
    }

    // If validation passes, you can proceed with form submission here
    console.log("Form submitted:", {
      fullName,
      email,
      phoneNumber,
      username,
      password,
      selectedProvince,
      selectedDistrict,
      selectedWard,
      streetAddress,
    });

    // Reset the form after submission (optional)
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setUsername("");
    setPassword("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setStreetAddress("");

    alert("Đăng ký thành công!");
  };

  // useEffect to check form validity
  useEffect(() => {
    const isValid =
      fullName.trim() !== "" &&
      email.trim() !== "" &&
      validatePhoneNumber(phoneNumber) &&
      username.trim() !== "" &&
      password.trim() !== "" &&
      selectedProvince !== "" &&
      selectedDistrict !== "" &&
      selectedWard !== "" &&
      streetAddress.trim() !== "";

    setIsFormValid(isValid);
  }, [
    fullName,
    email,
    phoneNumber,
    username,
    password,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    streetAddress,
  ]);

  return (
    <>
      <HomeHeader1 />
      <div className={styles["outside-container"]}>
        <div className={styles["login-container"]}>
          <h1>Đăng Ký</h1>

          <form onSubmit={handleSubmit} className={styles["login-form"]}>
            <div className={styles["form-group"]}>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder=" "
                value={fullName}
                onChange={handleFullNameChange}
              />
              <label htmlFor="fullName">Họ Tên</label>
            </div>
            <div className={styles["form-group"]}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder=" "
                value={email}
                onChange={handleEmailChange}
              />
              <label htmlFor="email">Gmail</label>
            </div>
            {/* Phone Number Field */}
            <div
              className={`${styles["form-group"]} ${
                phoneNumberError ? styles["form-group--error"] : ""
              }`}
            >
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder=" "
                className={styles["phone-input"]}
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
              <label htmlFor="phoneNumber">Số Điện Thoại</label>
              {phoneNumberError && (
                <div className={styles["error-message"]}>
                  {phoneNumberError}
                </div>
              )}
            </div>
            <div className={styles["form-group"]}>
              <input
                type="text"
                id="username"
                name="username"
                placeholder=" "
                value={username}
                onChange={handleUsernameChange}
              />
              <label htmlFor="username">Tài khoản</label>
            </div>
            <div className={styles["form-group"]}>
              <input
                type="password"
                id="password"
                name="password"
                placeholder=" "
                value={password}
                onChange={handlePasswordChange}
              />
              <label htmlFor="password">Mật khẩu</label>
            </div>

            {/* Address Fields */}
            <div className={styles["form-group"]}>
              <select
                id="province"
                name="province"
                value={selectedProvince}
                onChange={handleProvinceChange}
                className={styles["select-input"]} // Added class for styling
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["form-group"]}>
              <select
                id="district"
                name="district"
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
                className={styles["select-input"]} // Added class for styling
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["form-group"]}>
              <select
                id="ward"
                name="ward"
                value={selectedWard}
                onChange={handleWardChange}
                disabled={!selectedDistrict}
                className={styles["select-input"]} // Added class for styling
              >
                <option value="">Chọn Xã/Phường</option>
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["form-group"]}>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                placeholder=" "
                value={streetAddress}
                onChange={handleStreetAddressChange}
              />
              <label htmlFor="streetAddress">Số nhà, tên đường</label>
            </div>

            <div className={styles["button-group"]}>
              <button
                type="submit"
                className={styles["register-button"]}
                disabled={!isFormValid}
              >
                Đăng ký
              </button>
              <button type="submit" className={styles["login-button"]}>
                Đăng nhập
              </button>
            </div>
          </form>
          <div className={styles["forgot-password"]}>
            <a href="#">Quên mật khẩu?</a>
          </div>
        </div>
      </div>
      <HomeFooter />
    </>
  );
}
