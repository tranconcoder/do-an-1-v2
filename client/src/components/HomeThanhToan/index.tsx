"use client";

import { useState, useCallback, ChangeEvent } from "react";
import styles from "./styles.module.scss";
import Image from "next/image";
import Link from "next/link";

// Types & Interfaces - Move these to a separate file (e.g., `types.ts`)
interface ProductType {
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  quantity: number;
}

interface CustomerInfoType {
  name: string;
  email: string;
  phone: string;
  subscribe: boolean;
}

interface ShippingAddressType {
  name: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  address: string;
}

interface ShippingOptionType {
  id: string;
  label: string;
}

interface InformationStepProps {
  product: ProductType;
  customerInfo: CustomerInfoType;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfoType>>;
  shippingOption: string;
  setShippingOption: React.Dispatch<React.SetStateAction<string>>;
  shippingAddress: ShippingAddressType;
  setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddressType>>;
  shippingOptions: ShippingOptionType[];
}

interface DeliveryAddressFormProps {
  shippingAddress: ShippingAddressType;
  setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddressType>>;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  cities: string[];
  districts: string[];
  wards: string[];
}

interface PaymentStepProps {
  totalPrice: number;
  quantity: number; // Receive quantity from the parent component
  selectedPaymentMethod: PaymentMethod | null; // Receive the selectedPaymentMethod from the parent
  voucherState: { code: string; discount: number };
  voucherError: string | null;
  onVoucherChange: (newState: { code: string; discount: number }) => void; // Function to set voucher state in parent
  onPaymentMethodSelect: (method: PaymentMethod | null) => void; // Function to set payment method in parent
  handleApplyVoucher: () => Promise<void>; // Function to apply voucher
  onResetQrCode: () => void; // Function to reset showQrCode in parent
}

// Placeholder data - Consider using a context or API calls
const product: ProductType = {
  name: "Tecno Pova 6 (8GB/256GB) - Xám",
  price: 5690000,
  originalPrice: 6490000,
  imageUrl: "/iphone.png",
  quantity: 2,
};

const initialCustomerInfo: CustomerInfoType = {
  name: "Huy Hoàng",
  email: "hoanghuy171031@gmail.com",
  phone: "0939206174",
  subscribe: false,
};

const shippingOptions: ShippingOptionType[] = [
  { id: "pickup", label: "Nhận tại cửa hàng" },
  { id: "delivery", label: "Giao hàng nơi khác" },
];

const initialShippingAddress: ShippingAddressType = {
  name: "Huy Hoàng",
  phone: "0939206174",
  city: "",
  district: "",
  ward: "",
  address: "",
};

// Hardcoded location data (replace with API or dynamic loading)
const CITIES = ["Hồ Chí Minh", "Hà Nội"];
const DISTRICTS = ["Quận 1", "Quận 2", "Quận 3"];
const WARDS = ["Phường A", "Phường B", "Phường C"];

// Placeholder store data
const STORES = [
  { id: "store1", name: "CellphoneS Quận 1" },
  { id: "store2", name: "CellphoneS Quận 3" },
  { id: "store3", name: "CellphoneS Thủ Đức" },
];

// Placeholder payment methods data
interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string; // Optional description or discount info
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "store", name: "Thanh toán tại cửa hàng", icon: "store-icon" },
  { id: "qr", name: "Chuyển khoản ngân hàng qua mã QR", icon: "qr-icon" },
  { id: "vnpay", name: "VNPay", icon: "vnpay-icon" },
  {
    id: "onepay",
    name: "Qua thẻ Visa/Master/JCB/Napas",
    icon: "onepay-icon",
    description: "Giảm thêm tới 500.000đ",
  },
  {
    id: "momo",
    name: "Ví MoMo",
    icon: "momo-icon",
    description: "Nhập ưu đãi tại cộng, thêm 2% tối đa 200.000đ",
  },
];

export default function HomeThanhToan() {
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState(initialCustomerInfo);
  const [shippingOption, setShippingOption] = useState(shippingOptions[0].id);
  const [shippingAddress, setShippingAddress] = useState(
    initialShippingAddress
  );
  const [voucherState, setVoucherState] = useState({
    code: "",
    discount: 0,
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  const totalPrice = product.price * product.quantity;

  const handleNext = useCallback(() => setStep((prev) => prev + 1), []);
  const handleBack = useCallback(() => setStep((prev) => prev - 1), []);

  const handleApplyVoucher = async () => {
    // GỌI API để xác thực voucher
    try {
      const response = await fetch("/api/validateVoucher", {
        // Thay đổi endpoint API của bạn
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherCode: voucherState.code }),
      });

      // Debug: Log raw response
      const text = await response.text();
      console.log("Raw API Response:", text);

      if (!response.ok) {
        // Handle non-200 responses (errors)
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          // Try to parse JSON error message
          const errorJson = JSON.parse(text);
          errorMessage = errorJson.message || errorMessage;
        } catch (parseError) {
          console.warn("Failed to parse JSON error:", parseError);
          // Use the raw text if JSON parsing fails
          errorMessage = text;
        }
        setVoucherError(errorMessage);
        setVoucherState({ ...voucherState, discount: 0 });
        return; // Exit the function
      }

      // Successful response - attempt to parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        setVoucherError("Lỗi phân tích cú pháp JSON từ API");
        setVoucherState({ ...voucherState, discount: 0 });
        return;
      }

      // Update state with the API data
      setVoucherState({ ...voucherState, discount: data.discount });
      setVoucherError(null);
    } catch (error: any) {
      console.error("Lỗi khi xác thực voucher:", error);
      setVoucherError("Lỗi kết nối đến máy chủ"); // Thông báo lỗi chung
      setVoucherState({ ...voucherState, discount: 0 });
    }
  };

  const handlePayment = () => {
    // Xử lý logic thanh toán ở đây
    // Sau khi thanh toán thành công, có thể hiển thị thông báo thành công
    console.log("Payment button clicked");
    console.log("selectedPaymentMethod:", selectedPaymentMethod);
    console.log("showQrCode before:", showQrCode);

    if (selectedPaymentMethod && selectedPaymentMethod.id === "qr") {
      setShowQrCode(true);
      console.log("showQrCode after setting to true:", showQrCode);
    } else {
      // Handle other payment methods here
      // For example, navigate to a confirmation page
      console.log("Thanh toán thành công!");
    }
  };

  const handleResetQrCode = () => {
    setShowQrCode(false);
  };

  const renderStepContent = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <InformationStep
            product={product}
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            shippingOption={shippingOption}
            setShippingOption={setShippingOption}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            shippingOptions={shippingOptions}
          />
        );
      case 2:
        return (
          <PaymentStep
            totalPrice={totalPrice}
            quantity={product.quantity}
            selectedPaymentMethod={selectedPaymentMethod}
            voucherState={voucherState}
            voucherError={voucherError}
            onVoucherChange={setVoucherState}
            onPaymentMethodSelect={setSelectedPaymentMethod}
            handleApplyVoucher={handleApplyVoucher}
            onResetQrCode={handleResetQrCode} // Pass the reset function
          />
        );
      default:
        return null;
    }
  }, [
    customerInfo,
    product,
    shippingAddress,
    shippingOption,
    shippingOptions,
    step,
    totalPrice,
    setCustomerInfo,
    setShippingAddress,
    setShippingOption,
    selectedPaymentMethod,
    voucherError,
    voucherState,
    handleApplyVoucher,
    handleResetQrCode,
  ]);

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.header}>
        <Link href="/">
          <button>←</button>
        </Link>
      </div>
      <div className={styles.steps}>
        <div className={`${styles.step} ${step === 1 ? styles.active : ""}`}>
          1. Thông Tin
        </div>
        <div className={`${styles.step} ${step === 2 ? styles.active : ""}`}>
          2. Thanh Toán
        </div>
      </div>

      {renderStepContent()}

      <div className={styles.footer}>
        {step > 1 && (
          <button className={styles.backButton} onClick={handleBack}>
            Quay Lại
          </button>
        )}
        {step < 2 && (
          <button className={styles.continueButton} onClick={handleNext}>
            Tiếp Tục
          </button>
        )}
        {step === 2 && (
          <button className={styles.payButton} onClick={handlePayment}>
            Thanh Toán
          </button>
        )}
      </div>

      {showQrCode && (
        <div className={styles.qrCodeSection}>
          <h3>Quét mã QR để thanh toán</h3>
          {/* Replace with your QR code component or image */}
          <Image
            src="/QR.png" // Replace with your actual QR code image URL
            alt="QR Code"
            width={200}
            height={200}
          />
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Information Step Component
const InformationStep = ({
  product,
  customerInfo,
  setCustomerInfo,
  shippingOption,
  setShippingOption,
  shippingAddress,
  setShippingAddress,
  shippingOptions,
}: InformationStepProps) => {
  const handleCustomerInfoChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;

      setCustomerInfo((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [setCustomerInfo]
  );

  const handleShippingOptionChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setShippingOption(e.target.value);
    },
    [setShippingOption]
  );

  // Generic address change handler
  const handleAddressChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
    },
    [setShippingAddress]
  );

  return (
    <div className={styles.informationStep}>
      {/* Product Details */}
      <div className={styles.productDetails}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={80}
          height={80}
        />
        <div>
          <div className={styles.productName}>{product.name}</div>
          <div className={styles.productPrice}>
            {product.price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
            {product.originalPrice && (
              <span className={styles.originalPrice}>
                {product.originalPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            )}
          </div>
        </div>
        <div className={styles.quantity}>Số lượng: {product.quantity}</div>
      </div>

      {/* Customer Information */}
      <div className={styles.customerInfo}>
        <h3>Thông tin khách hàng</h3>
        <FormGroup label="Tên:" id="name">
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleCustomerInfoChange}
            className={styles.formControl} // Add a generic form control class
          />
        </FormGroup>
        <FormGroup label="Email:" id="email">
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleCustomerInfoChange}
            className={styles.formControl}
          />
        </FormGroup>
        <FormGroup label="Số điện thoại:" id="phone">
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handleCustomerInfoChange}
            className={styles.formControl}
          />
        </FormGroup>
        <div className={styles.formGroup}>
          <label htmlFor="subscribe" className={styles.checkboxLabel}>
            <input
              type="checkbox"
              id="subscribe"
              name="subscribe"
              checked={customerInfo.subscribe}
              onChange={handleCustomerInfoChange}
            />
            Nhận email thông báo và ưu đãi từ CellphoneS
          </label>
        </div>
      </div>

      {/* Shipping Information */}
      <div className={styles.shippingInfo}>
        <h3>Thông tin nhận hàng</h3>
        <div className={styles.shippingOptions}>
          {shippingOptions.map((option) => (
            <label key={option.id} className={styles.shippingOption}>
              <input
                type="radio"
                name="shippingOption"
                value={option.id}
                checked={shippingOption === option.id}
                onChange={handleShippingOptionChange}
              />
              {option.label}
            </label>
          ))}
        </div>

        {shippingOption === "delivery" ? (
          <DeliveryAddressForm
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            onChange={handleAddressChange}
            cities={CITIES}
            districts={DISTRICTS}
            wards={WARDS}
          />
        ) : (
          <PickupLocationForm stores={STORES} />
        )}
      </div>
    </div>
  );
};

interface PickupLocationFormProps {
  stores: { id: string; name: string }[];
}

const PickupLocationForm = ({ stores }: PickupLocationFormProps) => {
  const [selectedStore, setSelectedStore] = useState("");

  const handleStoreChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStore(e.target.value);
  };

  return (
    <div className={styles.pickupLocationForm}>
      <FormGroup label="Chọn cửa hàng:" id="store">
        <select
          id="store"
          name="store"
          value={selectedStore}
          onChange={handleStoreChange}
          className={styles.formControl}
        >
          <option value="">Chọn cửa hàng</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </FormGroup>
    </div>
  );
};

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({
  shippingAddress,
  setShippingAddress,
  onChange,
  cities,
  districts,
  wards,
}) => {
  return (
    <div className={styles.deliveryAddressForm}>
      <FormGroup label="Tên người nhận:" id="delivery-name">
        <input
          type="text"
          id="delivery-name"
          name="name"
          value={shippingAddress.name}
          onChange={onChange}
          placeholder="Tên người nhận"
          className={styles.formControl}
        />
      </FormGroup>

      <FormGroup label="SĐT người nhận:" id="delivery-phone">
        <input
          type="tel"
          id="delivery-phone"
          name="phone"
          value={shippingAddress.phone}
          onChange={onChange}
          placeholder="Số điện thoại"
          className={styles.formControl}
        />
      </FormGroup>

      <FormGroup label="Tỉnh/Thành phố:" id="city">
        <select
          id="city"
          name="city"
          value={shippingAddress.city}
          onChange={onChange}
          className={styles.formControl}
        >
          <option value="">Chọn tỉnh/thành phố</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Quận/Huyện:" id="district">
        <select
          id="district"
          name="district"
          value={shippingAddress.district}
          onChange={onChange}
          className={styles.formControl}
        >
          <option value="">Chọn quận/huyện</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Phường/Xã:" id="ward">
        <select
          id="ward"
          name="ward"
          value={shippingAddress.ward}
          onChange={onChange}
          className={styles.formControl}
        >
          <option value="">Chọn phường/xã</option>
          {wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Số nhà, tên đường:" id="address">
        <input
          type="text"
          id="address"
          name="address"
          value={shippingAddress.address}
          onChange={onChange}
          placeholder="Số nhà, tên đường"
          className={styles.formControl}
        />
      </FormGroup>
    </div>
  );
};

const PaymentStep: React.FC<PaymentStepProps> = ({
  totalPrice,
  quantity,
  selectedPaymentMethod,
  voucherState,
  voucherError,
  onVoucherChange,
  onPaymentMethodSelect,
  handleApplyVoucher,
  onResetQrCode,
}) => {
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const handleVoucherChange = (e: ChangeEvent<HTMLInputElement>) => {
    onVoucherChange({ ...voucherState, code: e.target.value, discount: 0 });
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    console.log("Selected payment method:", method);
    onPaymentMethodSelect(method);
    onResetQrCode(); // Reset the QR code visibility in the parent
    setShowPaymentMethods(false);
  };

  const shippingFee = 0;
  const subtotal = product.price * quantity;

  let discountAmount = 0;
  if (typeof voucherState.discount === "number") {
    if (voucherState.discount >= 1) {
      // Assume fixed amount if >= 1
      discountAmount = voucherState.discount;
    } else {
      // Assume percentage if < 1
      discountAmount = subtotal * voucherState.discount;
    }
  }

  const discountedTotal = subtotal - discountAmount;
  const finalTotal = discountedTotal + shippingFee;

  return (
    <div className={styles.paymentStep}>
      <div className={styles.voucherSection}>
        <label htmlFor="voucherCode">Mã giảm giá:</label>
        <div className={styles.voucherInputContainer}>
          <input
            type="text"
            id="voucherCode"
            value={voucherState.code}
            onChange={handleVoucherChange}
            placeholder="Nhập mã giảm giá"
            className={styles.formControl}
          />
          <button className={styles.applyButton} onClick={handleApplyVoucher}>
            Áp dụng
          </button>
        </div>
        {voucherError && (
          <div className={styles.voucherError}>{voucherError}</div>
        )}
      </div>

      <div className={styles.orderSummary}>
        <h3>Tóm tắt đơn hàng</h3>
        <div className={styles.summaryItem}>
          <span>Số lượng sản phẩm:</span>
          <span>{quantity}</span>
        </div>
        <div className={styles.summaryItem}>
          <span>Tiền hàng (tạm tính):</span>
          <span>
            {subtotal.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span>Giảm giá:</span>
          <span>
            {discountAmount.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span>Phí vận chuyển:</span>
          <span>Miễn phí</span>
        </div>
        <div className={styles.summaryItem}>
          <span>Tổng tiền (đã gồm VAT):</span>
          <span>
            {finalTotal.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
      </div>

      <div
        className={styles.paymentMethodSelection}
        onClick={() => setShowPaymentMethods(true)}
      >
        <span>Chọn phương thức thanh toán</span>
        {selectedPaymentMethod ? (
          <span>{selectedPaymentMethod.name}</span>
        ) : (
          <span>Chọn phương thức thanh toán</span>
        )}
        <span className={styles.arrow}>-</span>
      </div>

      {showPaymentMethods && (
        <div className={styles.paymentMethodModal}>
          <div className={styles.paymentMethodModalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowPaymentMethods(false)}
            >
              X
            </button>
            <h3>Chọn phương thức thanh toán</h3>
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={styles.paymentMethodItem}
                onClick={() => handlePaymentMethodSelect(method)}
              >
                <span>{method.name}</span>
                {method.description && (
                  <span className={styles.paymentMethodDescription}>
                    {method.description}
                  </span>
                )}
              </div>
            ))}
            <button
              className={styles.confirmButton}
              onClick={() => setShowPaymentMethods(false)}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
          />
          Đồng ý với các điều khoản
        </label>
      </div>
    </div>
  );
};

interface FormGroupProps {
  label: string;
  id: string;
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, id, children }) => (
  <div className={styles.formGroup}>
    <label htmlFor={id}>{label}:</label>
    {children}
  </div>
);
