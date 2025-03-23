import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AuthLayout.module.scss';
import ImageSlider from '../../components/ImageSlider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function AuthLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

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
                    <div className={cx('nav-buttons')}>
                        <button className={cx('back-button')} onClick={handleGoBack}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Back</span>
                        </button>
                        <Link to="/" className={cx('home-button')}>
                            <FontAwesomeIcon icon={faHome} />
                            <span>Home</span>
                        </Link>
                    </div>
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
