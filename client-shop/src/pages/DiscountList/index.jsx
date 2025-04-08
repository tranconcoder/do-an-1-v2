import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './DiscountList.module.scss';
import axiosClient from '../../configs/axios';
import { API_URL } from '../../configs/env.config';

const cx = classNames.bind(styles);

function DiscountList() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`${API_URL}/discount`);
            if (response.data && response.data.metadata) {
                setDiscounts(response.data.metadata);
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDiscountStatus = (discount) => {
        const now = new Date();
        const startDate = new Date(discount.discount_start_at);
        const endDate = new Date(discount.discount_end_at);

        if (!discount.is_publish) return 'draft';
        if (now < startDate) return 'upcoming';
        if (now > endDate) return 'expired';
        return 'active';
    };

    const handleDeleteDiscount = async (discountId) => {
        if (!window.confirm('Are you sure you want to delete this discount?')) {
            return;
        }

        try {
            await axiosClient.delete(`${API_URL}/discount/${discountId}`);
            fetchDiscounts(); // Refresh the list
        } catch (error) {
            console.error('Error deleting discount:', error);
            alert('Failed to delete discount. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={cx('discount-list')}>
            <div className={cx('header')}>
                <h1>Discount Management</h1>
                <Link to="/discounts/new" className={cx('add-button')}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add New Discount
                </Link>
            </div>

            {loading ? (
                <div className={cx('empty-state')}>
                    <p>Loading discounts...</p>
                </div>
            ) : discounts.length === 0 ? (
                <div className={cx('empty-state')}>
                    <p>No discounts found. Create your first discount!</p>
                </div>
            ) : (
                <table className={cx('discount-table')}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Value</th>
                            <th>Period</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discounts.map((discount) => {
                            const status = getDiscountStatus(discount);
                            return (
                                <tr key={discount._id}>
                                    <td>{discount.discount_name}</td>
                                    <td>{discount.discount_code}</td>
                                    <td>
                                        {discount.discount_type === 'percentage'
                                            ? `${discount.discount_value}%`
                                            : `$${discount.discount_value}`}
                                    </td>
                                    <td>
                                        {formatDate(discount.discount_start_at)} - <br />
                                        {formatDate(discount.discount_end_at)}
                                    </td>
                                    <td>
                                        <span className={cx('status-badge', status)}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </td>
                                    <td className={cx('actions')}>
                                        <Link 
                                            to={`/discounts/${discount._id}/edit`}
                                            className={cx('edit-btn')}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15 3L17 5L7 15H5V13L15 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </Link>
                                        <button
                                            className={cx('delete-btn')}
                                            onClick={() => handleDeleteDiscount(discount._id)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6H17M7 6V4C7 3.46957 7.21071 2.96086 7.58579 2.58579C7.96086 2.21071 8.46957 2 9 2H11C11.5304 2 12.0391 2.21071 12.4142 2.58579C12.7893 2.96086 13 3.46957 13 4V6M8 6V16M12 6V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default DiscountList;
