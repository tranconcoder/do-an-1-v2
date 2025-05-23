import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    loginUser,
    selectIsAuthenticated,
    selectUserError,
    selectUserLoading
} from '../../store/userSlice';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectUserLoading);
    const error = useSelector(selectUserError);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            console.log('trang login nhận hấy đã đăng nhập thành công, chuyển hướng đến dashboard');
           
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const validateForm = () => {
        const errors = {};
        if (!phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else if (!/^\d+$/.test(phoneNumber)) {
            errors.phoneNumber = 'Phone number must contain only digits';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            dispatch(loginUser({ phoneNumber, password }));
        }
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-panel">
                <div className="login-form-container">
                    <div className="login-logo">
                        <div className="logo-circle">
                            <FaUser />
                        </div>
                    </div>

                    <div className="login-header">
                        <h1>Admin Control Panel</h1>
                        <p>Enter your credentials to access the dashboard</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <i className="error-icon">!</i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <div className="input-with-icon">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Enter your phone number"
                                    className={formErrors.phoneNumber ? 'input-error' : ''}
                                />
                            </div>
                            {formErrors.phoneNumber && (
                                <div className="error-message">{formErrors.phoneNumber}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className={formErrors.password ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formErrors.password && (
                                <div className="error-message">{formErrors.password}</div>
                            )}
                        </div>

                        <div className="remember-forgot">
                            <div className="remember-me">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <a href="#" className="forgot-password">
                                Forgot password?
                            </a>
                        </div>

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <FaSpinner className="spinner-icon" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>© {new Date().getFullYear()} Admin Panel. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
