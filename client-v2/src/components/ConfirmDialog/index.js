import React from 'react';
import classNames from 'classnames/bind';
import styles from './ConfirmDialog.module.scss';
import { FaTimes } from 'react-icons/fa';

const cx = classNames.bind(styles);

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className={cx('confirm-dialog-overlay')}>
            <div className={cx('confirm-dialog')}>
                <button className={cx('close-button')} onClick={onClose}>
                    <FaTimes />
                </button>
                <h3 className={cx('title')}>{title}</h3>
                <p className={cx('message')}>{message}</p>
                <div className={cx('actions')}>
                    <button className={cx('cancel-btn')} onClick={onClose}>
                        Hủy
                    </button>
                    <button className={cx('confirm-btn')} onClick={onConfirm}>
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;