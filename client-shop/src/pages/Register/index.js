import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import axiosClient from '../../configs/axios';

const cx = classNames.bind(styles);

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        businessType: 'individual',
        acceptTerms: false
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

    const validateForm = () => {
        const newErrors = {};

        // Shop name validation
        if (!formData.shopName.trim()) {
            newErrors.shopName = 'Shop name is required';
        }

        // Owner name validation
        if (!formData.ownerName.trim()) {
            newErrors.ownerName = 'Owner name is required';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Phone validation
        if (formData.phone && !/^[0-9+\s-]{8,15}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number is invalid';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms validation
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // In a real application, this would be an API call
            // const response = await axiosClient.post('/auth/register', {
            //     shopName: formData.shopName,
            //     ownerName: formData.ownerName,
            //     email: formData.email,
            //     phone: formData.phone,
            //     password: formData.password,
            //     businessType: formData.businessType
            // });

            // Simulate API call with timeout
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // For demo purposes, show success message and redirect to login
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
                    <div className={cx('form-section')}>
                        <h2>Shop Information</h2>

                        <div className={cx('form-group')}>
                            <label htmlFor="shopName">Shop Name *</label>
                            <input
                                type="text"
                                id="shopName"
                                name="shopName"
                                value={formData.shopName}
                                onChange={handleChange}
                                placeholder="Enter your shop name"
                                className={errors.shopName ? cx('has-error') : ''}
                            />
                            {errors.shopName && (
                                <div className={cx('error-text')}>{errors.shopName}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="businessType">Business Type</label>
                            <select
                                id="businessType"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleChange}
                            >
                                <option value="individual">Individual / Sole Proprietor</option>
                                <option value="company">Company / Corporation</option>
                                <option value="partnership">Partnership</option>
                            </select>
                        </div>
                    </div>

                    <div className={cx('form-section')}>
                        <h2>Personal Information</h2>

                        <div className={cx('form-group')}>
                            <label htmlFor="ownerName">Owner Name *</label>
                            <input
                                type="text"
                                id="ownerName"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={errors.ownerName ? cx('has-error') : ''}
                            />
                            {errors.ownerName && (
                                <div className={cx('error-text')}>{errors.ownerName}</div>
                            )}
                        </div>

                        <div className={cx('form-row')}>
                            <div className={cx('form-group')}>
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={errors.email ? cx('has-error') : ''}
                                />
                                {errors.email && (
                                    <div className={cx('error-text')}>{errors.email}</div>
                                )}
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    className={errors.phone ? cx('has-error') : ''}
                                />
                                {errors.phone && (
                                    <div className={cx('error-text')}>{errors.phone}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={cx('form-section')}>
                        <h2>Account Security</h2>

                        <div className={cx('form-row')}>
                            <div className={cx('form-group')}>
                                <label htmlFor="password">Password *</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    className={errors.password ? cx('has-error') : ''}
                                />
                                {errors.password && (
                                    <div className={cx('error-text')}>{errors.password}</div>
                                )}
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className={errors.confirmPassword ? cx('has-error') : ''}
                                />
                                {errors.confirmPassword && (
                                    <div className={cx('error-text')}>{errors.confirmPassword}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={cx('terms-container')}>
                        <label className={cx('checkbox-label')}>
                            <input
                                type="checkbox"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleChange}
                            />
                            <span>
                                I agree to the{' '}
                                <a href="#terms" className={cx('terms-link')}>
                                    Terms and Conditions
                                </a>
                            </span>
                        </label>
                        {errors.acceptTerms && (
                            <div className={cx('error-text')}>{errors.acceptTerms}</div>
                        )}
                    </div>

                    <button type="submit" className={cx('register-button')} disabled={loading}>
                        {loading ? 'Creating your shop...' : 'Create Shop Account'}
                    </button>
                </form>

                <div className={cx('footer-note')}>
                    <p>
                        Already have a shop?{' '}
                        <Link to="/login" className={cx('login-link')}>
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
