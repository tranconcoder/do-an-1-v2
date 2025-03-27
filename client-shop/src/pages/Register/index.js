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

            // Append all text fields
            Object.keys(formData).forEach((key) => {
                if (key !== 'shop_logo' && key !== 'confirmPassword') {
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

            alert('Registration successful! Please log in with your new account.');
            navigate('/login');
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
                                className={hasError('shop_email') ? cx('has-error') : ''}
                            />
                            {renderErrorMessage('shop_email')}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="shop_password">Password *</label>
                            <input
                                type="password"
                                id="shop_password"
                                name="shop_password"
                                value={formData.shop_password}
                                onChange={handleChange}
                                className={hasError('shop_password') ? cx('has-error') : ''}
                            />
                            {renderErrorMessage('shop_password')}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={hasError('confirmPassword') ? cx('has-error') : ''}
                            />
                            {renderErrorMessage('confirmPassword')}
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
                            <label htmlFor="shop_certificate">Business Certificate Number *</label>
                            <input
                                type="text"
                                id="shop_certificate"
                                name="shop_certificate"
                                value={formData.shop_certificate}
                                onChange={handleChange}
                                className={hasError('shop_certificate') ? cx('has-error') : ''}
                                placeholder="Enter certificate number"
                            />
                            {renderErrorMessage('shop_certificate')}
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
