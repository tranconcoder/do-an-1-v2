import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AuthLayout.module.scss';
import ImageSlider from '../components/ImageSlider';

const cx = classNames.bind(styles);

function AuthLayout() {
    const location = useLocation();

    // Set title based on the current route
    let title = 'Welcome';
    if (location.pathname.includes('/login')) {
        title = 'Welcome Back';
    } else if (location.pathname.includes('/register')) {
        title = 'Create Your Account';
    }

    return (
        <div className={cx('auth-layout')}>
            <div className={cx('auth-wrapper')}>
                <div className={cx('auth-container')}>
                    <div className={cx('auth-header')}>
                        <h1>{title}</h1>
                        <p>Please enter your details</p>
                    </div>
                    <div className={cx('auth-content')}>
                        <Outlet />
                    </div>
                </div>
                <div className={cx('auth-image')}>
                    <ImageSlider />
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
