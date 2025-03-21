import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import axiosClient from '../../configs/axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Import SVG icons
import UserIcon from '../../assets/icons/UserIcon';
import PhoneIcon from '../../assets/icons/PhoneIcon';
import LockIcon from '../../assets/icons/LockIcon';
import SpinnerIcon from '../../assets/icons/SpinnerIcon';
import EyeIcon from '../../assets/icons/EyeIcon';
import EyeOffIcon from '../../assets/icons/EyeOffIcon';
import { loginSuccess, selectUserInfo } from '../../redux/slices/userSlice';

const cx = classNames.bind(styles);

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [errorKey, setErrorKey] = useState(0); // Add a key to force animation remount
    const user = useSelector(selectUserInfo);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Define validation schema with Yup
    const validationSchema = Yup.object({
        phoneNumber: Yup.string()
            .matches(/^\d+$/, 'Phone number can only contain digits')
            .min(10, 'Phone number must be at least 10 digits')
            .required('Phone number is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required')
    });

    // Initialize formik
    const formik = useFormik({
        initialValues: {
            phoneNumber: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setLoginError(''); // Clear previous errors

            try {
                const result = await axiosClient.login({
                    phoneNumber: values.phoneNumber,
                    password: values.password
                });

                if (result.data.metadata.token) {
                    const userInfo = result.data.metadata.user;

                    // Dispatch user info to Redux store
                    dispatch(
                        loginSuccess({
                            phoneNumber: userInfo.phoneNumber,
                            fullName: userInfo.fullName,
                            email: userInfo.email,
                            role: userInfo.role
                        })
                    );

                    navigate('/');
                }
            } catch (error) {
                console.error('Login failed:', error);
                setErrorKey((prev) => prev + 1);
                // Always show generic error message regardless of actual error
                const errorMessage = 'Phone number or password is not correct';
                setLoginError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    });

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        if (user.phoneNumber) navigate('/');
    }, [user.phoneNumber]); // eslint-disable-line

    return (
        <div className={cx('login-page')}>
            <div className={cx('login-scroll-container')}>
                <div className={cx('login-content')}>
                    <div className={cx('login-header')}>
                        <div className={cx('login-icon')}>
                            <UserIcon />
                        </div>
                    </div>

                    <form
                        onSubmit={formik.handleSubmit}
                        className={cx('login-form', { 'has-error': loginError })}
                    >
                        {/* Display login error message with key for animation reset */}
                        {loginError && (
                            <div key={errorKey} className={cx('login-error')}>
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
                                {loginError}
                            </div>
                        )}

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
                                    placeholder="Enter your password"
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

                        <div className={cx('action-row')}>
                            <div className={cx('remember-me')}>
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <div className={cx('forgot-password')}>
                                <Link to="/auth/forgot-password">Forgot password?</Link>
                            </div>
                        </div>

                        <button type="submit" className={cx('login-button')} disabled={isLoading}>
                            {isLoading ? (
                                <span className={cx('loading-spinner')}>
                                    <SpinnerIcon />
                                    Signing In...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className={cx('register-link')}>
                        Don't have an account? <Link to="/auth/register">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
