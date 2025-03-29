import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import axiosClient from '../../configs/axios';
import { useDispatch } from 'react-redux';

// Import SVG icons
import UserIcon from '../../assets/icons/UserIcon';
import PhoneIcon from '../../assets/icons/PhoneIcon';
import LockIcon from '../../assets/icons/LockIcon';
import SpinnerIcon from '../../assets/icons/SpinnerIcon';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import EmailIcon from '../../assets/icons/EmailIcon'; // You may need to create this icon
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../configs/token.config';
import { loginSuccess } from '../../redux/slices/userSlice';

const cx = classNames.bind(styles);

function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [errorKey, setErrorKey] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Define validation schema with Yup
    const validationSchema = Yup.object({
        name: Yup.string()
            .min(4, 'Name must be at least 4 characters')
            .required('Name is required'),
        phoneNumber: Yup.string()
            .matches(/^\d+$/, 'Phone number can only contain digits')
            .min(10, 'Phone number must be at least 10 digits')
            .required('Phone number is required'),
        email: Yup.string().email('Enter a valid email address').required('Email is required'),
        password: Yup.string()
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Please password with at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'
            )
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Please confirm your password'),
        agreeTerms: Yup.boolean()
            .oneOf([true], 'You must accept the terms and conditions')
            .required('You must accept the terms and conditions')
    });

    // Initialize formik
    const formik = useFormik({
        initialValues: {
            name: '',
            phoneNumber: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setRegisterError('');
            try {
                const result = await axiosClient.post('/auth/sign-up', {
                    phoneNumber: values.phoneNumber,
                    password: values.password,
                    user_fullName: values.name,
                    user_email: values.email
                });

                if (result.data.metadata.token) {
                    const user = result.data.metadata.user;
                    const { accessToken, refreshToken } = result.data.metadata.token;

                    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
                    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

                    dispatch(loginSuccess({ id: user.id, ...user }));

                    navigate('/');
                } else {
                    // Registration successful but no auto-login
                    navigate('/auth/login');
                }
            } catch (error) {
                console.error('Registration failed:', error);
                setErrorKey((prev) => prev + 1);
                if (error.response && error.response.data && error.response.data.message) {
                    setRegisterError(error.response.data.message);
                } else {
                    setRegisterError('Registration failed. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        }
    });

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Toggle confirm password visibility
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className={cx('register-page')}>
            <div className={cx('register-scroll-container')}>
                <div className={cx('register-content')}>
                    <div className={cx('register-header')}>
                        <div className={cx('register-icon')}>
                            <UserIcon />
                        </div>
                    </div>

                    <form
                        onSubmit={formik.handleSubmit}
                        className={cx('register-form', { 'has-error': registerError })}
                    >
                        {/* Display register error message with key for animation reset */}
                        {registerError && (
                            <div key={errorKey} className={cx('register-error')}>
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {registerError}
                            </div>
                        )}

                        <div className={cx('form-group')}>
                            <label htmlFor="name">Full Name</label>
                            <div className={cx('input-container')}>
                                <div className={cx('input-icon')}>
                                    <UserIcon />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter your full name"
                                    className={
                                        formik.touched.name && formik.errors.name ? cx('error') : ''
                                    }
                                />
                            </div>
                            {formik.touched.name && formik.errors.name && (
                                <div className={cx('error-message')}>{formik.errors.name}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <div className={cx('input-container')}>
                                <div className={cx('input-icon')}>
                                    <PhoneIcon />
                                </div>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formik.values.phoneNumber}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter your phone number"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    className={
                                        formik.touched.phoneNumber && formik.errors.phoneNumber
                                            ? cx('error')
                                            : ''
                                    }
                                />
                            </div>
                            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                                <div className={cx('error-message')}>
                                    {formik.errors.phoneNumber}
                                </div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="email">Email Address</label>
                            <div className={cx('input-container')}>
                                <div className={cx('input-icon')}>
                                    <EmailIcon />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter your email address"
                                    className={
                                        formik.touched.email && formik.errors.email
                                            ? cx('error')
                                            : ''
                                    }
                                />
                            </div>
                            {formik.touched.email && formik.errors.email && (
                                <div className={cx('error-message')}>{formik.errors.email}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="password">Password</label>
                            <div className={cx('input-container')}>
                                <div className={cx('input-icon')}>
                                    <LockIcon />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Create a password"
                                    className={
                                        formik.touched.password && formik.errors.password
                                            ? cx('error')
                                            : ''
                                    }
                                />
                                <button
                                    type="button"
                                    className={cx('password-toggle')}
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <div className={cx('error-message')}>{formik.errors.password}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className={cx('input-container')}>
                                <div className={cx('input-icon')}>
                                    <LockIcon />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Confirm your password"
                                    className={
                                        formik.touched.confirmPassword &&
                                        formik.errors.confirmPassword
                                            ? cx('error')
                                            : ''
                                    }
                                />
                                <button
                                    type="button"
                                    className={cx('password-toggle')}
                                    onClick={toggleConfirmPasswordVisibility}
                                    aria-label={
                                        showConfirmPassword ? 'Hide password' : 'Show password'
                                    }
                                >
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <div className={cx('error-message')}>
                                    {formik.errors.confirmPassword}
                                </div>
                            )}
                        </div>

                        <div className={cx('form-group', 'terms-group')}>
                            <div className={cx('agree-terms')}>
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    name="agreeTerms"
                                    checked={formik.values.agreeTerms}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <label htmlFor="agreeTerms">
                                    I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                                    <Link to="/privacy">Privacy Policy</Link>
                                </label>
                            </div>
                            {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                                <div className={cx('error-message')}>
                                    {formik.errors.agreeTerms}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={cx('register-button')}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className={cx('loading-spinner')}>
                                    <SpinnerIcon />
                                    Creating Account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <div className={cx('login-link')}>
                        Already have an account? <Link to="/auth/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
