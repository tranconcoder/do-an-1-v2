import React, { useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Toast.module.scss';

const cx = classNames.bind(styles);

function Toast({ message, duration, handleClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, handleClose]); // Added handleClose as a dependency

    return <div className={cx('toast')}>{message}</div>;
}

export default Toast;
