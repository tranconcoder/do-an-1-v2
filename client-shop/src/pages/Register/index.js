import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { shopRegisterSchema } from '../../validations/shop.validation';
import styles from './Register.module.scss';
import axiosClient from '../../configs/axios';

const cx = classNames.bind(styles);

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Authentication
        shop_email: '',
        shop_password: '',
        confirmPassword: '',

        // Shop Information
        shop_name: '',
        shop_type: 'INDIVIDUAL',
        shop_logo: '',
        shop_certificate: '',
        shop_address: '',
        shop_phoneNumber: '',
        shop_description: '',

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

    const validateForm = async () => {
        try {
            await shopRegisterSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            const newErrors = {};
            err.inner.forEach((error) => {
                newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        const isValid = await validateForm();
        if (!isValid) return;

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Append all text fields
            Object.keys(formData).forEach((key) => {
                if (
                    key !== 'shop_logo' &&
                    key !== 'shop_certificate' &&
                    key !== 'confirmPassword'
                ) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append files
            formDataToSend.append('shop_logo', formData.shop_logo);
            formDataToSend.append('shop_certificate', formData.shop_certificate);

            const response = await axiosClient.post('/shops/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Registration successful! Please log in with your new account.');
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            setGeneralError(
                err.response?.data?.message || 'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
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

                <form className={cx('register-form')} onSubmit={handleSubmit}>
                    {/* Authentication Section */}
                    <div className={cx('form-section')}>
                        <h2>Authentication</h2>
                        <div className={cx('form-group')}>
                            <label htmlFor="shop_email">Shop Email *</label>
                            <input
                                type="email"
                                id="shop_email"
                                name="shop_email"
                                value={formData.shop_email}
                                onChange={handleChange}
                                className={errors.shop_email ? cx('has-error') : ''}
                            />
                            {errors.shop_email && (
                                <div className={cx('error-text')}>{errors.shop_email}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_password">Password *</label>
                            <input
                                type="password"
                                id="shop_password"
                                name="shop_password"
                                value={formData.shop_password}
                                onChange={handleChange}
                                className={errors.shop_password ? cx('has-error') : ''}
                            />
                            {errors.shop_password && (
                                <div className={cx('error-text')}>{errors.shop_password}</div>
                            )}
                        </div>
                    </div>

                    {/* Shop Information Section */}
                    <div className={cx('form-section')}>
                        <h2>Shop Information</h2>
                        <div className={cx('form-group')}>
                            <label htmlFor="shop_name">Shop Name *</label>
                            <input
                                type="text"
                                id="shop_name"
                                name="shop_name"
                                value={formData.shop_name}
                                onChange={handleChange}
                                className={errors.shop_name ? cx('has-error') : ''}
                            />
                            {errors.shop_name && (
                                <div className={cx('error-text')}>{errors.shop_name}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_type">Shop Type *</label>
                            <select
                                id="shop_type"
                                name="shop_type"
                                value={formData.shop_type}
                                onChange={handleChange}
                                className={errors.shop_type ? cx('has-error') : ''}
                            >
                                <option value="INDIVIDUAL">Individual Business</option>
                                <option value="COMPANY">Company/Corporation</option>
                                <option value="PARTNERSHIP">Partnership</option>
                            </select>
                            {errors.shop_type && (
                                <div className={cx('error-text')}>{errors.shop_type}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_logo">Shop Logo *</label>
                            <input
                                type="file"
                                id="shop_logo"
                                name="shop_logo"
                                onChange={handleFileChange}
                                className={errors.shop_logo ? cx('has-error') : ''}
                                accept="image/*"
                            />
                            {errors.shop_logo && (
                                <div className={cx('error-text')}>{errors.shop_logo}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_certificate">Business Certificate *</label>
                            <input
                                type="file"
                                id="shop_certificate"
                                name="shop_certificate"
                                onChange={handleFileChange}
                                className={errors.shop_certificate ? cx('has-error') : ''}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {errors.shop_certificate && (
                                <div className={cx('error-text')}>{errors.shop_certificate}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_phoneNumber">Shop Phone Number *</label>
                            <input
                                type="tel"
                                id="shop_phoneNumber"
                                name="shop_phoneNumber"
                                value={formData.shop_phoneNumber}
                                onChange={handleChange}
                                className={errors.shop_phoneNumber ? cx('has-error') : ''}
                            />
                            {errors.shop_phoneNumber && (
                                <div className={cx('error-text')}>{errors.shop_phoneNumber}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_description">Shop Description</label>
                            <textarea
                                id="shop_description"
                                name="shop_description"
                                value={formData.shop_description}
                                onChange={handleChange}
                                rows="4"
                            />
                        </div>
                    </div>

                    {/* Shop Owner Information Section */}
                    <div className={cx('form-section')}>
                        <h2>Owner Information</h2>
                        <div className={cx('form-group')}>
                            <label htmlFor="shop_owner_fullName">Owner Full Name *</label>
                            <input
                                type="text"
                                id="shop_owner_fullName"
                                name="shop_owner_fullName"
                                value={formData.shop_owner_fullName}
                                onChange={handleChange}
                                className={errors.shop_owner_fullName ? cx('has-error') : ''}
                            />
                            {errors.shop_owner_fullName && (
                                <div className={cx('error-text')}>{errors.shop_owner_fullName}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_owner_email">Owner Email *</label>
                            <input
                                type="email"
                                id="shop_owner_email"
                                name="shop_owner_email"
                                value={formData.shop_owner_email}
                                onChange={handleChange}
                                className={errors.shop_owner_email ? cx('has-error') : ''}
                            />
                            {errors.shop_owner_email && (
                                <div className={cx('error-text')}>{errors.shop_owner_email}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_owner_phoneNumber">Owner Phone Number *</label>
                            <input
                                type="tel"
                                id="shop_owner_phoneNumber"
                                name="shop_owner_phoneNumber"
                                value={formData.shop_owner_phoneNumber}
                                onChange={handleChange}
                                className={errors.shop_owner_phoneNumber ? cx('has-error') : ''}
                            />
                            {errors.shop_owner_phoneNumber && (
                                <div className={cx('error-text')}>
                                    {errors.shop_owner_phoneNumber}
                                </div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_owner_cardID">Owner ID Card Number *</label>
                            <input
                                type="text"
                                id="shop_owner_cardID"
                                name="shop_owner_cardID"
                                value={formData.shop_owner_cardID}
                                onChange={handleChange}
                                className={errors.shop_owner_cardID ? cx('has-error') : ''}
                            />
                            {errors.shop_owner_cardID && (
                                <div className={cx('error-text')}>{errors.shop_owner_cardID}</div>
                            )}
                        </div>
                    </div>
                    <button type="submit" className={cx('submit-btn')} disabled={loading}>
                        {loading ? 'Creating Shop...' : 'Create Shop'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
