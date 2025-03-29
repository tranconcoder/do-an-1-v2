import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import * as Yup from 'yup';
import styles from './Login.module.scss';
import {
    loginUser,
    selectUserError,
    selectUserLoading,
    selectIsAuthenticated,
    clearError
} from '../../store/userSlice';

const cx = classNames.bind(styles);

// Define validation schema with Yup
const loginSchema = Yup.object().shape({
    phoneNumber: Yup.string()
        .required('Phone number is required')
        .matches(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits)'),
    password: Yup.string()
        .required('Password is required')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
        )
});

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get state from Redux
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectUserLoading);
    const reduxError = useSelector(selectUserError);

    // Local form state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setPhoneNumber(value);

        // Clear error when user is typing
        if (validationErrors.phoneNumber) {
            const newErrors = { ...validationErrors };
            delete newErrors.phoneNumber;
            setValidationErrors(newErrors);
        }

        // Clear any Redux errors when user starts typing
        if (reduxError) {
            dispatch(clearError());
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        // Clear error when user is typing
        if (validationErrors.password) {
            const newErrors = { ...validationErrors };
            delete newErrors.password;
            setValidationErrors(newErrors);
        }

        // Clear any Redux errors when user starts typing
        if (reduxError) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Client-side validation
            await loginSchema.validate({ phoneNumber, password }, { abortEarly: false });

            // Dispatch login action
            dispatch(loginUser({ phoneNumber, password }));
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                // Handle Yup validation errors
                const errors = {};
                err.inner.forEach((error) => {
                    errors[error.path] = error.message;
                });
                setValidationErrors(errors);
            }
        }
    };

    // Determine error message to display
    const getErrorMessage = () => {
        if (reduxError) {
            return reduxError.message || 'Invalid phone number or password';
        }
        return null;
    };

    return (
        <div className={cx('login-container')}>
            <div className={cx('login-card')}>
                <div className={cx('login-header')}>
                    <div className={cx('logo')}>🛒</div>
                    <h1>Shop Manager</h1>
                    <p className={cx('subtitle')}>Login to your shop dashboard</p>
                </div>

                {getErrorMessage() && (
                    <div className={cx('error-message')}>{getErrorMessage()}</div>
                )}

                <form className={cx('login-form')} onSubmit={handleSubmit}>
                    <div className={cx('form-group')}>
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="Enter your phone number (e.g., +1234567890)"
                            className={validationErrors.phoneNumber ? cx('input-error') : ''}
                        />
                        {validationErrors.phoneNumber && (
                            <div className={cx('field-error')}>{validationErrors.phoneNumber}</div>
                        )}
                        <small className={cx('input-hint')}>
                            Format: 10-15 digits, optional + prefix
                        </small>
                    </div>

                    <div className={cx('form-group')}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Enter your password"
                            className={validationErrors.password ? cx('input-error') : ''}
                        />
                        {validationErrors.password && (
                            <div className={cx('field-error')}>{validationErrors.password}</div>
                        )}
                    </div>

                    <div className={cx('form-options')}>
                        <label className={cx('remember-me')}>
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#forgot-password" className={cx('forgot-password')}>
                            Forgot Password?
                        </a>
                    </div>

                    <button type="submit" className={cx('login-button')} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={cx('footer-note')}>
                    <p>For demo purposes, enter a valid phone number format.</p>
                    <p className={cx('register-text')}>
                        Don't have a shop yet?{' '}
                        <Link to="/register" className={cx('register-link')}>
                            Create one here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
