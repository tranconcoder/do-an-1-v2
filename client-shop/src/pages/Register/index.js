import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { registerShopSchema } from '../../validations/shop.validation';
import styles from './Register.module.scss';
import axiosClient from '../../configs/axios';
import { AuthSection, OwnerInfoSection, ShopInfoSection, WarehouseSection } from './components';
import LogoCropper from './components/LogoCropper';
import { useToast } from '../../contexts/ToastContext';
import { registerShop } from '../../store/userSlice';

// Import components
const cx = classNames.bind(styles);

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showToast } = useToast();

    // Thêm state cho dữ liệu địa điểm
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Cho các quận/huyện và phường/xã của kho hàng
    const [warehouseDistricts, setWarehouseDistricts] = useState({});
    const [warehouseWards, setWarehouseWards] = useState({});

    const [formData, setFormData] = useState({
        // Xác thực
        phoneNumber: '', // Thay đổi từ shop_email sang phoneNumber để phù hợp với backend
        password: '', // Thay đổi từ shop_password sang password để phù hợp với backend

        // Thông tin cửa hàng
        shop_name: '',
        shop_type: 'INDIVIDUAL',
        shop_logo: '',
        shop_certificate: '',
        shop_phoneNumber: '',
        shop_description: '',

        // Địa điểm cửa hàng
        shop_location: {
            province: '',
            district: '',
            ward: '',
            address: ''
        },

        // Thông tin chủ cửa hàng
        shop_owner_fullName: '',
        shop_owner_email: '',
        shop_owner_phoneNumber: '',
        shop_owner_cardID: '',

        // Thông tin kho hàng (tùy chọn)
        shop_warehouses: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Thêm state cho form kho hàng hiện tại
    const [currentWarehouse, setCurrentWarehouse] = useState({
        name: '',
        address: {
            province: '',
            district: '',
            ward: '',
            address: ''
        },
        phoneNumber: ''
    });

    // Thêm state cho xem trước logo và cắt ảnh
    const [logoPreview, setLogoPreview] = useState('');
    const [showCropper, setShowCropper] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);

    // Lấy danh sách tỉnh/thành phố khi component được mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axiosClient.get('/location/province');
                console.log('Provinces response:', response);
                // Check if data is in response.data.metadata instead of response.metadata
                if (response.data && response.data.metadata) {
                    setProvinces(response.data.metadata || []);
                } else {
                    setProvinces(response.metadata || []);
                }
            } catch (err) {
                console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', err);
            }
        };
        fetchProvinces();
    }, []);

    // Lấy danh sách quận/huyện khi tỉnh/thành phố thay đổi
    useEffect(() => {
        if (!formData.shop_location.province) {
            setDistricts([]);
            return;
        }
        const fetchDistricts = async () => {
            try {
                const response = await axiosClient.get(
                    `/location/district/province/${formData.shop_location.province}`
                );
                console.log('Districts response:', response);
                // Check if data is in response.data.metadata instead of response.metadata
                if (response.data && response.data.metadata) {
                    setDistricts(response.data.metadata || []);
                } else {
                    setDistricts(response.metadata || []);
                }
            } catch (err) {
                console.error('Lỗi khi lấy danh sách quận/huyện:', err);
            }
        };
        fetchDistricts();
    }, [formData.shop_location.province]);

    // Lấy danh sách phường/xã khi quận/huyện thay đổi
    useEffect(() => {
        if (!formData.shop_location.district) {
            setWards([]);
            return;
        }
        const fetchWards = async () => {
            try {
                const response = await axiosClient.get(
                    `/location/ward/district/${formData.shop_location.district}`
                );
                console.log('Wards response:', response);
                // Check if data is in response.data.metadata instead of response.metadata
                if (response.data && response.data.metadata) {
                    setWards(response.data.metadata || []);
                } else {
                    setWards(response.metadata || []);
                }
            } catch (err) {
                console.error('Lỗi khi lấy danh sách phường/xã:', err);
            }
        };
        fetchWards();
    }, [formData.shop_location.district]);

    // Lấy danh sách quận/huyện cho kho hàng khi tỉnh/thành phố thay đổi
    useEffect(() => {
        if (!currentWarehouse.address.province) {
            setWarehouseDistricts({});
            return;
        }
        const fetchWarehouseDistricts = async () => {
            try {
                const response = await axiosClient.get(
                    `/location/district/province/${currentWarehouse.address.province}`
                );
                console.log('Warehouse districts response:', response);
                // Check if data is in response.data.metadata instead of response.metadata
                if (response.data && response.data.metadata) {
                    setWarehouseDistricts(response.data.metadata || []);
                } else {
                    setWarehouseDistricts(response.metadata || []);
                }
            } catch (err) {
                console.error('Lỗi khi lấy danh sách quận/huyện cho kho hàng:', err);
            }
        };
        fetchWarehouseDistricts();
    }, [currentWarehouse.address.province]);

    // Lấy danh sách phường/xã cho kho hàng khi quận/huyện thay đổi
    useEffect(() => {
        if (!currentWarehouse.address.district) {
            setWarehouseWards({});
            return;
        }
        const fetchWarehouseWards = async () => {
            try {
                const response = await axiosClient.get(
                    `/location/ward/district/${currentWarehouse.address.district}`
                );
                console.log('Warehouse wards response:', response);
                // Check if data is in response.data.metadata instead of response.metadata
                if (response.data && response.data.metadata) {
                    setWarehouseWards(response.data.metadata || []);
                } else {
                    setWarehouseWards(response.metadata || []);
                }
            } catch (err) {
                console.error('Lỗi khi lấy danh sách phường/xã cho kho hàng:', err);
            }
        };
        fetchWarehouseWards();
    }, [currentWarehouse.address.district]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Xóa lỗi khi người dùng bắt đầu nhập
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Xử lý thay đổi trường địa điểm
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            shop_location: {
                ...prev.shop_location,
                [name]: value
            }
        }));
        // Đặt lại các trường phụ thuộc khi trường cha thay đổi
        if (name === 'province') {
            setFormData((prev) => ({
                ...prev,
                shop_location: {
                    ...prev.shop_location,
                    district: '',
                    ward: '',
                    province: value
                }
            }));
        } else if (name === 'district') {
            setFormData((prev) => ({
                ...prev,
                shop_location: {
                    ...prev.shop_location,
                    ward: '',
                    district: value
                }
            }));
        }
        // Xóa lỗi
        if (errors[`shop_location.${name}`]) {
            setErrors((prev) => ({
                ...prev,
                [`shop_location.${name}`]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            // Xử lý đặc biệt cho logo cửa hàng - hiển thị trình cắt ảnh
            if (name === 'shop_logo') {
                const reader = new FileReader();
                reader.onload = () => {
                    setOriginalImage(reader.result);
                    setShowCropper(true);
                };
                reader.readAsDataURL(files[0]);
            } else {
                // Đối với các file khác, chỉ lưu trữ chúng
                setFormData((prev) => ({
                    ...prev,
                    [name]: files[0]
                }));
            }
            // Xóa lỗi khi file được chọn
            if (errors[name]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: ''
                }));
            }
        }
    };

    // Xử lý khi hoàn thành cắt ảnh
    const handleCropComplete = (croppedFile, croppedImageUrl) => {
        setLogoPreview(croppedImageUrl);
        setFormData((prev) => ({
            ...prev,
            shop_logo: croppedFile
        }));
        setShowCropper(false);
    };

    // Xử lý khi hủy cắt ảnh
    const handleCropCancel = () => {
        setShowCropper(false);
        setOriginalImage(null);
    };

    // Xử lý thay đổi trường kho hàng hiện tại
    const handleCurrentWarehouseChange = (field, value) => {
        setCurrentWarehouse((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // Xử lý thay đổi địa chỉ kho hàng hiện tại
    const handleCurrentWarehouseAddressChange = (field, value) => {
        // Đặt lại các trường phụ thuộc khi trường cha thay đổi
        if (field === 'province') {
            setCurrentWarehouse((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    province: value,
                    district: '',
                    ward: ''
                }
            }));
        } else if (field === 'district') {
            setCurrentWarehouse((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    district: value,
                    ward: ''
                }
            }));
        } else {
            setCurrentWarehouse((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [field]: value
                }
            }));
        }
    };

    // Thêm kho hàng vào danh sách
    const addWarehouse = () => {
        // Xác thực dữ liệu kho hàng trước khi thêm
        if (
            !currentWarehouse.name ||
            !currentWarehouse.phoneNumber ||
            !currentWarehouse.address.province ||
            !currentWarehouse.address.district ||
            !currentWarehouse.address.address
        ) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc của kho hàng');
            return;
        }
        // Thêm kho hàng hiện tại vào danh sách
        setFormData((prev) => ({
            ...prev,
            shop_warehouses: [...prev.shop_warehouses, { ...currentWarehouse }]
        }));
        // Đặt lại form kho hàng hiện tại
        setCurrentWarehouse({
            name: '',
            address: {
                province: '',
                district: '',
                ward: '',
                address: ''
            },
            phoneNumber: ''
        });
    };

    // Xóa kho hàng
    const removeWarehouse = (index) => {
        setFormData((prev) => ({
            ...prev,
            shop_warehouses: prev.shop_warehouses.filter((_, i) => i !== index)
        }));
    };

    const validateForm = async () => {
        try {
            await registerShopSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            const newErrors = {};
            if (err.inner && err.inner.length > 0) {
                err.inner.forEach((error) => {
                    // Xử lý đường dẫn cho các đối tượng lồng nhau như shop_location
                    if (error.path.includes('.')) {
                        // Cho các đường dẫn lồng nhau như 'shop_location.province'
                        newErrors[error.path] = error.message;
                    } else {
                        newErrors[error.path] = error.message;
                    }
                });
            } else {
                // Xử lý trường hợp lỗi không có mảng inner
                setGeneralError(
                    err.message || 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin.'
                );
            }
            setErrors(newErrors);
            console.log('Lỗi xác thực:', newErrors);
            // Cuộn đến lỗi đầu tiên
            if (err.inner && err.inner.length > 0) {
                const firstErrorPath = err.inner[0].path;
                // Xử lý các đường dẫn lồng nhau khác nhau cho querySelector
                const selector = firstErrorPath.includes('.')
                    ? `[name="${firstErrorPath.split('.')[1]}"]`
                    : `[name="${firstErrorPath}"]`;
                const firstErrorField = document.querySelector(selector);
                if (firstErrorField) {
                    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstErrorField.focus();
                }
            }
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setErrors({});
        setSuccess(false);
        setSuccessMessage('');
        try {
            const isValid = await validateForm();
            if (!isValid) {
                console.log('Xác thực form không thành công');
                return;
            }

            setLoading(true);
            const formDataToSend = new FormData();

            // Thêm các trường không phải file
            Object.keys(formData).forEach((key) => {
                if (key === 'shop_logo') {
                    return;
                } else if (key === 'shop_location') {
                    // Xử lý đối tượng địa điểm lồng nhau
                    Object.keys(formData[key]).forEach((locationKey) => {
                        formDataToSend.append(
                            `shop_location[${locationKey}]`,
                            formData[key][locationKey]
                        );
                    });
                } else if (key === 'shop_warehouses') {
                    // Xử lý mảng kho hàng
                    formData[key].forEach((warehouse, index) => {
                        Object.keys(warehouse).forEach((warehouseKey) => {
                            if (warehouseKey === 'address') {
                                Object.keys(formData.shop_warehouses[index][warehouseKey]).forEach(
                                    (warehouseField) => {
                                        formDataToSend.append(
                                            `shop_warehouses[${index}][${warehouseKey}][${warehouseField}]`,
                                            formData.shop_warehouses[index][warehouseKey][
                                                warehouseField
                                            ]
                                        );
                                    }
                                );
                            } else {
                                formDataToSend.append(
                                    `shop_warehouses[${index}][${warehouseKey}]`,
                                    formData.shop_warehouses[index][warehouseKey]
                                );
                            }
                        });
                    });
                } else if (key === 'shop_description') {
                    formDataToSend.append(key, formData[key] || undefined);
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Thêm các file
            if (formData.shop_logo) {
                formDataToSend.append('shop_logo', formData.shop_logo);
            }

            // Gửi action đăng ký cửa hàng thay vì gọi API trực tiếp
            const result = await dispatch(registerShop(formDataToSend)).unwrap();

            // Hiển thị thông báo thành công
            const shopName = result?.shop?.shop_name || formData.shop_name || 'cửa hàng của bạn';
            const successMsg = `Đăng ký thành công! ${shopName} đã được tạo.`;
            setSuccess(true);
            setSuccessMessage(successMsg);

            // Hiển thị thông báo toast
            showToast(successMsg, 'success', 5000);

            // Chuyển hướng đến trang tổng quan vì người dùng đã đăng nhập
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Lỗi đăng ký:', err);
            // Xử lý lỗi xác thực từ server nếu có
            if (err.response?.data?.errors) {
                const serverErrors = err.response.data.errors;
                const newErrors = { ...errors };
                Object.keys(serverErrors).forEach((field) => {
                    newErrors[field] = serverErrors[field];
                });
                setErrors(newErrors);
            } else if (err.response?.data?.metadata?.conflictFields) {
                const conflictFields = err.response.data.metadata.conflictFields;
                const newErrors = { ...errors };
                conflictFields.forEach((field) => {
                    newErrors[field] = `${field.replace('shop_', '')} này đã được đăng ký`;
                });
                setErrors(newErrors);
            } else {
                const errorMsg =
                    err.message ||
                    err.response?.data?.message ||
                    'Đăng ký không thành công. Vui lòng thử lại.';
                setGeneralError(errorMsg);
                // Hiển thị thông báo lỗi
                showToast(errorMsg, 'error', 5000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Hàm trợ giúp xác định xem một trường có lỗi không
    const hasError = (fieldName) => {
        // Kiểm tra lỗi trực tiếp
        if (errors[fieldName]) return true;
        // Kiểm tra lỗi lồng nhau (ví dụ: shop_location.province)
        if (fieldName.includes('.')) return !!errors[fieldName];
        // Cho các trường như 'province' trong shop_location, kiểm tra 'shop_location.province'
        const nestedPaths = Object.keys(errors).filter((key) => key.includes('.'));
        for (const path of nestedPaths) {
            const parts = path.split('.');
            if (parts[1] === fieldName) return true;
        }
        return false;
    };

    // Hàm trợ giúp hiển thị thông báo lỗi
    const renderErrorMessage = (fieldName) => {
        // Lỗi trực tiếp
        if (errors[fieldName]) {
            return <div className={cx('error-text')}>{errors[fieldName]}</div>;
        }
        // Kiểm tra lỗi lồng nhau (ví dụ: shop_location.province)
        if (fieldName.includes('.') && errors[fieldName]) {
            return <div className={cx('error-text')}>{errors[fieldName]}</div>;
        }
        // Cho các trường như 'province' trong shop_location, tìm 'shop_location.province'
        const nestedPaths = Object.keys(errors).filter((key) => key.includes('.'));
        for (const path of nestedPaths) {
            const parts = path.split('.');
            if (parts[1] === fieldName) {
                return <div className={cx('error-text')}>{errors[path]}</div>;
            }
        }
        return null;
    };

    return (
        <div className={cx('register-container')}>
            {showCropper && (
                <LogoCropper
                    imageUrl={originalImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
            <div className={cx('register-card')}>
                <div className={cx('register-header')}>
                    <div className={cx('logo')}>🛒</div>
                    <h1>Tạo Cửa Hàng Của Bạn</h1>
                    <p className={cx('subtitle')}>Bắt đầu bán sản phẩm của bạn trực tuyến</p>
                </div>
                {generalError && <div className={cx('error-message')}>{generalError}</div>}
                {success && <div className={cx('success-message')}>{successMessage}</div>}
                <form className={cx('register-form')} onSubmit={handleSubmit} noValidate>
                    <AuthSection
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        renderErrorMessage={renderErrorMessage}
                        hasError={hasError}
                    />
                    <ShopInfoSection
                        formData={formData}
                        handleChange={handleChange}
                        handleLocationChange={handleLocationChange}
                        handleFileChange={handleFileChange}
                        provinces={provinces}
                        districts={districts}
                        wards={wards}
                        errors={errors}
                        renderErrorMessage={renderErrorMessage}
                        hasError={hasError}
                        logoPreview={logoPreview}
                    />
                    <OwnerInfoSection
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                    />
                    <WarehouseSection
                        currentWarehouse={currentWarehouse}
                        formData={formData}
                        provinces={provinces}
                        warehouseDistricts={warehouseDistricts}
                        warehouseWards={warehouseWards}
                        handleCurrentWarehouseChange={handleCurrentWarehouseChange}
                        handleCurrentWarehouseAddressChange={handleCurrentWarehouseAddressChange}
                        addWarehouse={addWarehouse}
                        removeWarehouse={removeWarehouse}
                    />
                    <button type="submit" className={cx('submit-btn')} disabled={loading}>
                        {loading ? 'Đang Tạo Cửa Hàng...' : 'Tạo Cửa Hàng'}
                    </button>
                    <div className={cx('login-link-container')}>
                        <p>Đã có tài khoản?</p>
                        <button
                            type="button"
                            className={cx('login-btn')}
                            onClick={() => navigate('/login')}
                        >
                            Quay Lại Đăng Nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
