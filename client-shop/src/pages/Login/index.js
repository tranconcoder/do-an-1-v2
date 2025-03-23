import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import axiosClient from '../../configs/axios';

const cx = classNames.bind(styles);

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);

            // In a real app, this would be an API call
            // const response = await axiosClient.post('/auth/login', { email, password });

            // For demo purposes, simulate login with a timeout
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Simulate a successful login
            localStorage.setItem('token', 'demo-token');
            localStorage.setItem('user', JSON.stringify({ name: 'Shop Owner', email }));

            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('login-container')}>
            <div className={cx('login-card')}>
                <div className={cx('login-header')}>
                    <div className={cx('logo')}>🛒</div>
                    <h1>Shop Manager</h1>
                    <p className={cx('subtitle')}>Login to your shop dashboard</p>
                </div>

                {error && <div className={cx('error-message')}>{error}</div>}

                <form className={cx('login-form')} onSubmit={handleSubmit}>
                    <div className={cx('form-group')}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className={cx('form-group')}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
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
                    <p>For demo purposes, any email and password will work.</p>
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
