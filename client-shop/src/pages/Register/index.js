import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { shopRegisterSchema } from '../../validations/shop.validation';
import styles from './Register.module.scss';
import axiosClient from '../../configs/axios';
import { AuthSection, OwnerInfoSection, ShopInfoSection, WarehouseSection } from './components';

// Import components

const cx = classNames.bind(styles);

function Register() {
    const navigate = useNavigate();

    // Add state for location data
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // For warehouse districts and wards
    const [warehouseDistricts, setWarehouseDistricts] = useState({});
    const [warehouseWards, setWarehouseWards] = useState({});

    const [formData, setFormData] = useState({
        // Authentication
        shop_email: '',
        shop_password: '',

        // Shop Information
        shop_name: '',
        shop_type: 'INDIVIDUAL',
        shop_logo: '',
        shop_certificate: '',
        shop_phoneNumber: '',
        shop_description: '',

        // Shop Location
        shop_location: {
            province: '',
            district: '',
            ward: '',
            address: ''
        },

        // Shop Owner Information
        shop_owner_fullName: '',
        shop_owner_email: '',
        shop_owner_phoneNumber: '',
        shop_owner_cardID: '',

        // Optional Warehouse Info
        shop_warehouses: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    // Add state for current warehouse form
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

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axiosClient.get('/location/province');
                setProvinces(response.metadata || []);
            } catch (err) {
                console.error('Error fetching provinces:', err);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
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
                setDistricts(response.metadata || []);
            } catch (err) {
                console.error('Error fetching districts:', err);
            }
        };
        fetchDistricts();
    }, [formData.shop_location.province]);

    // Fetch wards when district changes
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
                setWards(response.metadata || []);
            } catch (err) {
                console.error('Error fetching wards:', err);
            }
        };
        fetchWards();
    }, [formData.shop_location.district]);

    // Fetch districts for warehouse when province changes
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
                setWarehouseDistricts(response.metadata || []);
            } catch (err) {
                console.error('Error fetching warehouse districts:', err);
            }
        };
        fetchWarehouseDistricts();
    }, [currentWarehouse.address.province]);

    // Fetch wards for warehouse when district changes
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
                setWarehouseWards(response.metadata || []);
            } catch (err) {
                console.error('Error fetching warehouse wards:', err);
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

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Add handler for location fields
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            shop_location: {
                ...prev.shop_location,
                [name]: value
            }
        }));

        // Reset dependent fields when parent changes
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

        // Clear error
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
            // Here you would normally upload the file to your server
            // For now, we'll just store the file object
            setFormData((prev) => ({
                ...prev,
                [name]: files[0]
            }));

            // Clear error when file is selected
            if (errors[name]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: ''
                }));
            }
        }
    };

    // Handle current warehouse field changes
    const handleCurrentWarehouseChange = (field, value) => {
        setCurrentWarehouse((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle current warehouse address changes
    const handleCurrentWarehouseAddressChange = (field, value) => {
        // Reset dependent fields when parent changes
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

    // Add warehouse to list
    const addWarehouse = () => {
        // Validate warehouse data before adding
        if (
            !currentWarehouse.name ||
            !currentWarehouse.phoneNumber ||
            !currentWarehouse.address.province ||
            !currentWarehouse.address.district ||
            !currentWarehouse.address.address
        ) {
            alert('Please fill in all required warehouse fields');
            return;
        }

        // Add current warehouse to the list
        setFormData((prev) => ({
            ...prev,
            shop_warehouses: [...prev.shop_warehouses, { ...currentWarehouse }]
        }));

        // Reset current warehouse form
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

    // Remove warehouse
    const removeWarehouse = (index) => {
        setFormData((prev) => ({
            ...prev,
            shop_warehouses: prev.shop_warehouses.filter((_, i) => i !== index)
        }));
    };

    const validateForm = async () => {
        try {
            await shopRegisterSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            const newErrors = {};
            if (err.inner && err.inner.length > 0) {
                err.inner.forEach((error) => {
                    newErrors[error.path] = error.message;
                });
            } else {
                // Handle case where error doesn't have inner array
                setGeneralError(err.message || 'Validation failed. Please check your inputs.');
            }
            setErrors(newErrors);

            // Scroll to the first error
            if (err.inner && err.inner.length > 0) {
                const firstErrorField = document.querySelector(`[name="${err.inner[0].path}"]`);
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

        try {
            const isValid = await validateForm();
            if (!isValid) return;

            setLoading(true);

            const formDataToSend = new FormData();

            // Append non-file fields
            Object.keys(formData).forEach((key) => {
                if (key === 'shop_logo') {
                    return;
                } else if (key === 'shop_location') {
                    // Handle nested location object
                    Object.keys(formData[key]).forEach((locationKey) => {
                        formDataToSend.append(
                            `shop_location[${locationKey}]`,
                            formData[key][locationKey]
                        );
                    });
                } else if (key === 'shop_warehouses') {
                    // Handle warehouses array
                    formDataToSend.append(
                        'shop_warehouses',
                        JSON.stringify(formData.shop_warehouses)
                    );
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append files
            if (formData.shop_logo) {
                formDataToSend.append('shop_logo', formData.shop_logo);
            }

            const response = await axiosClient.post('/shops/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Use response to show success message or handle the response
            if (response?.status === 201 || response?.status === 200) {
                alert('Registration successful! Please log in with your new account.');
                navigate('/login');
            }
        } catch (err) {
            console.error('Registration error:', err);

            // Handle server validation errors if they exist
            if (err.response?.data?.errors) {
                const serverErrors = err.response.data.errors;
                const newErrors = { ...errors };

                Object.keys(serverErrors).forEach((field) => {
                    newErrors[field] = serverErrors[field];
                });

                setErrors(newErrors);
            } else {
                setGeneralError(
                    err.response?.data?.message || 'Registration failed. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper function to determine if a field has an error
    const hasError = (fieldName) => {
        return errors[fieldName] ? true : false;
    };

    // Helper function to render error message
    const renderErrorMessage = (fieldName) => {
        return errors[fieldName] ? (
            <div className={cx('error-text')}>{errors[fieldName]}</div>
        ) : null;
    };

    return (
        <div className={cx('register-container')}>
            <div className={cx('register-card')}>
                <div className={cx('register-header')}>
                    <div className={cx('logo')}>🛒</div>
                    <h1>Create Your Shop</h1>
                    <p className={cx('subtitle')}>Start selling your products online</p>
                </div>

                {generalError && <div className={cx('error-message')}>{generalError}</div>}

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
                        {loading ? 'Creating Shop...' : 'Create Shop'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
