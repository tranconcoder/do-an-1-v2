import React from 'react';
import { Outlet } from 'react-router-dom';
import classNames from 'classnames/bind';
import Navbar from '../components/Navbar';
import styles from './HomeLayout.module.scss';

const cx = classNames.bind(styles);

function HomeLayout() {
    return (
        <div className={cx('home-layout')}>
            <Navbar />
            <main className={cx('main')}>
                <Outlet />
            </main>
            <footer className={cx('footer')}>
                <div className={cx('footer-content')}>
                    <div className={cx('footer-section')}>
                        <h3>ShopName</h3>
                        <p>Your trusted online shopping destination for quality products.</p>
                    </div>
                    <div className={cx('footer-section')}>
                        <h3>Quick Links</h3>
                        <ul>
                            <li>
                                <a href="/about">About Us</a>
                            </li>
                            <li>
                                <a href="/contact">Contact</a>
                            </li>
                            <li>
                                <a href="/faq">FAQ</a>
                            </li>
                            <li>
                                <a href="/terms">Terms of Service</a>
                            </li>
                        </ul>
                    </div>
                    <div className={cx('footer-section')}>
                        <h3>Contact Us</h3>
                        <p>Email: support@shopname.com</p>
                        <p>Phone: +1 (123) 456-7890</p>
                    </div>
                </div>
                <div className={cx('footer-bottom')}>
                    <p>© {new Date().getFullYear()} ShopName. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default HomeLayout;
