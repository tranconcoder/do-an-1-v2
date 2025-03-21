import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectUserInfo } from '../redux/slices/userSlice';
import classNames from 'classnames/bind';
import styles from './Navbar.module.scss';

// Import icons from assets
import SearchIcon from '../assets/icons/SearchIcon';
import CartIcon from '../assets/icons/CartIcon';
import UserIcon from '../assets/icons/UserIcon';
import MenuIcon from '../assets/icons/MenuIcon';
import CloseIcon from '../assets/icons/CloseIcon';

const cx = classNames.bind(styles);

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const user = useSelector(selectUserInfo);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userMenuRef = useRef(null);
    const categoriesMenuRef = useRef(null);

    // Sample categories for e-commerce - replace with your actual categories
    const categories = [
        { id: 1, name: 'Electronics', url: '/category/electronics' },
        { id: 2, name: 'Clothing', url: '/category/clothing' },
        { id: 3, name: 'Home & Kitchen', url: '/category/home-kitchen' },
        { id: 4, name: 'Books', url: '/category/books' },
        { id: 5, name: 'Beauty & Personal Care', url: '/category/beauty' }
    ];

    // Handle search submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    // Handle logout
    const handleLogout = () => {
        dispatch(logout());
        setIsUserMenuOpen(false);
        navigate('/auth/login');
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
                setIsCategoriesOpen(false);
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
                    {/* Categories dropdown */}
                    <div className={cx('categories-dropdown')} ref={categoriesMenuRef}>
                        <button
                            className={cx('categories-button')}
                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                        >
                            Categories
                            <span className={cx('dropdown-arrow', { open: isCategoriesOpen })}>
                                ▼
                            </span>
                        </button>
                        {isCategoriesOpen && (
                            <div className={cx('categories-menu')}>
                                {categories.map((category) => (
                                    <Link
                                        to={category.url}
                                        key={category.id}
                                        onClick={() => setIsCategoriesOpen(false)}
                                        className={cx('category-item')}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

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
                        <Link to="/about" className={cx('nav-link')}>
                            About Us
                        </Link>
                        <Link to="/contact" className={cx('nav-link')}>
                            Contact
                        </Link>
                    </nav>

                    {/* Search form */}
                    <form className={cx('search-form')} onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cx('search-input')}
                        />
                        <button type="submit" className={cx('search-button')} aria-label="Search">
                            <SearchIcon />
                        </button>
                    </form>
                </div>

                {/* User actions section */}
                <div className={cx('user-actions')}>
                    {/* Cart button with item count */}
                    <Link to="/cart" className={cx('cart-button')}>
                        <CartIcon />
                        <span className={cx('cart-count')}>0</span>
                    </Link>

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
                                            {user.fullName || user.name || 'User'}
                                        </span>
                                        <span className={cx('user-email')}>
                                            {user.email || user.phoneNumber || ''}
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
