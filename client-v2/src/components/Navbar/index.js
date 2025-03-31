import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectUserInfo } from '../../redux/slices/userSlice';
import classNames from 'classnames/bind';
import styles from './Navbar.module.scss';
import axiosClient from '../../configs/axios';

// Import icons from assets
import UserIcon from '../../assets/icons/UserIcon';
import MenuIcon from '../../assets/icons/MenuIcon';
import CloseIcon from '../../assets/icons/CloseIcon';

// Import components
import CartDropdown from '../CartDropdown';
import SearchBar from '../SearchBar'; // Import the new SearchBar component
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../configs/token.config';

const cx = classNames.bind(styles);

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const user = useSelector(selectUserInfo);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userMenuRef = useRef(null);
    const wishlistItems = useSelector((state) => state.wishlist.items);

    // Handle logout
    const handleLogout = async () => {
        const res = await axiosClient.post('/auth/logout');

        if (res.status === 200) {
            dispatch(logout());
            setIsUserMenuOpen(false);
            navigate('/auth/login');

            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        return () => setIsMenuOpen(false);
    }, [navigate]);

    // Close user menu when route changes
    useEffect(() => {
        return () => {
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
        };
    }, [navigate]);

    // Add a debugging effect to check authentication status
    useEffect(() => {
        console.log('Auth status:', user.isAuthenticated);
        console.log('User info:', user);
    }, [user]);

    return (
        <header className={cx('navbar')}>
            <div className={cx('navbar-container')}>
                {/* Logo Section */}
                <div className={cx('logo-container')}>
                    <Link to="/" className={cx('logo')}>
                        Aliconcon
                    </Link>
                    <button
                        className={cx('mobile-menu-button')}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>

                {/* Navigation Links and Search - visible on desktop, toggleable on mobile */}
                <div className={cx('nav-content', { 'mobile-open': isMenuOpen })}>
                    {/* Other nav links */}
                    <nav className={cx('nav-links')}>
                        <Link to="/" className={cx('nav-link')}>
                            Home
                        </Link>
                        <Link to="/products" className={cx('nav-link')}>
                            Products
                        </Link>
                        <Link to="/deals" className={cx('nav-link')}>
                            Deals
                        </Link>
                        <Link to="/wishlist" className={cx('nav-link')}>
                            <i className="bi bi-heart"></i> Wishlist{' '}
                            {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                        </Link>
                    </nav>

                    {/* Use the new SearchBar component instead of the search form */}
                    <SearchBar />
                </div>

                {/* User actions section */}
                <div className={cx('user-actions')}>
                    {/* Replace the Cart button with CartDropdown component */}
                    <CartDropdown />

                    {/* User menu - check for authentication status properly */}
                    {user && user.phoneNumber ? (
                        <div className={cx('user-menu-container')} ref={userMenuRef}>
                            <button
                                className={cx('user-button')}
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                aria-label="User menu"
                            >
                                <UserIcon />
                            </button>

                            {isUserMenuOpen && (
                                <div className={cx('user-dropdown', 'animate-zoom')}>
                                    <div className={cx('user-info')}>
                                        <span className={cx('user-name')}>
                                            {user.user_fullName || 'User'}
                                        </span>
                                        <span className={cx('user-email')}>
                                            {user.user_email || ''}
                                        </span>
                                    </div>
                                    <div className={cx('dropdown-divider')}></div>
                                    <Link
                                        to="/profile"
                                        className={cx('dropdown-item')}
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <span className={cx('item-icon')}>👤</span> My Profile
                                    </Link>
                                    <Link
                                        to="/cart"
                                        className={cx('dropdown-item')}
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <span className={cx('item-icon')}>🛒</span> My Cart
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className={cx('dropdown-item')}
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <span className={cx('item-icon')}>📦</span> My Orders
                                    </Link>
                                    <Link
                                        to="/wishlist"
                                        className={cx('dropdown-item')}
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <span className={cx('item-icon')}>❤️</span> Wishlist
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className={cx('dropdown-item')}
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <span className={cx('item-icon')}>⚙️</span> Settings
                                    </Link>
                                    <div className={cx('dropdown-divider')}></div>
                                    <button
                                        onClick={handleLogout}
                                        className={cx('dropdown-item', 'logout-button')}
                                    >
                                        <span className={cx('item-icon')}>🚪</span> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth/login" className={cx('login-button')}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
