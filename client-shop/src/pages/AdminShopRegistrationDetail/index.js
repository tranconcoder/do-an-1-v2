import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AdminShopRegistrationDetail.module.scss';
import classNames from 'classnames/bind';
import { FaArrowLeft } from 'react-icons/fa';
import axios from '../../configs/axios';

const cx = classNames.bind(styles);

const AdminShopRegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [actionResult, setActionResult] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/shops/registrations/${id}`);
                setShop(response.data.metadata);
            } catch (err) {
                console.error('Error fetching shop details:', err);
                setError('Failed to load shop registration details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchShopDetails();
    }, [id]);

    const handleApproveRequest = async () => {
        try {
            setSubmitting(true);
            await axios.put(`/shops/registrations/${id}/approve`);
            setActionResult({
                type: 'success',
                message: 'Shop registration has been approved successfully!'
            });
            // Update shop status in current view
            setShop({ ...shop, status: 'APPROVED' });
            setOpenApproveDialog(false);
        } catch (err) {
            console.error('Error approving shop:', err);
            setActionResult({
                type: 'error',
                message: 'Failed to approve shop. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectRequest = async () => {
        try {
            setSubmitting(true);
            await axios.put(`/shops/registrations/${id}/reject`, { reason: rejectionReason });
            setActionResult({
                type: 'success',
                message: 'Shop registration has been rejected.'
            });
            // Update shop status in current view
            setShop({ ...shop, status: 'REJECTED', rejectionReason });
            setOpenRejectDialog(false);
        } catch (err) {
            console.error('Error rejecting shop:', err);
            setActionResult({
                type: 'error',
                message: 'Failed to reject shop. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <div className={cx('spinner')}></div>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className={cx('error-container')}>
                <p className={cx('error-message')}>{error || 'Shop not found'}</p>
                <button className={cx('back-button')} onClick={handleBack}>
                    <FaArrowLeft /> Back to Registrations
                </button>
            </div>
        );
    }

    return (
        <div className={cx('detail-container')}>
            <div className={cx('header')}>
                <button className={cx('back-button')} onClick={handleBack}>
                    <FaArrowLeft /> Back
                </button>
                <h2>Shop Registration Details</h2>
            </div>

            {actionResult.message && (
                <div className={cx('alert', actionResult.type)}>{actionResult.message}</div>
            )}

            <div className={cx('status-panel')}>
                <h3>Shop Status</h3>
                <div
                    className={cx('status-badge', {
                        approved: shop.status === 'APPROVED',
                        rejected: shop.status === 'REJECTED',
                        pending: !shop.status || shop.status === 'PENDING'
                    })}
                >
                    {shop.status || 'PENDING'}
                </div>

                {shop.status === 'REJECTED' && shop.rejectionReason && (
                    <div className={cx('rejection-reason')}>
                        <h4>Rejection Reason:</h4>
                        <p>{shop.rejectionReason}</p>
                    </div>
                )}

                {shop.status !== 'APPROVED' && shop.status !== 'REJECTED' && (
                    <div className={cx('action-buttons')}>
                        <button
                            className={cx('approve-button')}
                            onClick={() => setOpenApproveDialog(true)}
                            disabled={submitting}
                        >
                            Approve Registration
                        </button>
                        <button
                            className={cx('reject-button')}
                            onClick={() => setOpenRejectDialog(true)}
                            disabled={submitting}
                        >
                            Reject Registration
                        </button>
                    </div>
                )}
            </div>

            <div className={cx('shop-details')}>
                <div className={cx('info-panel')}>
                    <h3>Shop Information</h3>
                    <div className={cx('shop-card')}>
                        <div className={cx('shop-logo')}>
                            <img
                                src={shop.shop_logo || 'https://via.placeholder.com/300'}
                                alt={`${shop.shop_name} Logo`}
                            />
                        </div>
                        <div className={cx('shop-info')}>
                            <h3>{shop.shop_name}</h3>
                            <p>{shop.shop_type}</p>
                        </div>
                    </div>

                    <div className={cx('info-grid')}>
                        <div className={cx('info-item')}>
                            <h4>Certificate Number:</h4>
                            <p>{shop.shop_certificate}</p>
                        </div>
                        <div className={cx('info-item')}>
                            <h4>Phone Number:</h4>
                            <p>{shop.shop_phoneNumber}</p>
                        </div>
                        <div className={cx('info-item')}>
                            <h4>Email:</h4>
                            <p>{shop.shop_email}</p>
                        </div>
                        <div className={cx('info-item')}>
                            <h4>Description:</h4>
                            <p>{shop.shop_description || 'No description provided'}</p>
                        </div>
                    </div>
                </div>

                <div className={cx('info-panel')}>
                    <h3>Owner Information</h3>
                    <div className={cx('info-grid')}>
                        <div className={cx('info-item')}>
                            <h4>Full Name:</h4>
                            <p>{shop.shop_owner_fullName}</p>
                        </div>
                        <div className={cx('info-item')}>
                            <h4>Email:</h4>
                            <p>{shop.shop_owner_email}</p>
                        </div>
                        <div className={cx('info-item')}>
                            <h4>Phone Number:</h4>
                            <p>{shop.shop_owner_phoneNumber}</p>
                        </div>
                        <div className={cx('info-item')}>
                            <h4>ID Card Number:</h4>
                            <p>{shop.shop_owner_cardID}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approve Dialog */}
            {openApproveDialog && (
                <div className={cx('dialog-overlay')}>
                    <div className={cx('dialog')}>
                        <h3>Approve Shop Registration</h3>
                        <p>
                            Are you sure you want to approve this shop registration? The shop owner
                            will be notified and will be able to access the seller platform.
                        </p>
                        <div className={cx('dialog-actions')}>
                            <button
                                className={cx('cancel-button')}
                                onClick={() => setOpenApproveDialog(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className={cx('approve-button')}
                                onClick={handleApproveRequest}
                                disabled={submitting}
                            >
                                {submitting ? 'Processing...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog */}
            {openRejectDialog && (
                <div className={cx('dialog-overlay')}>
                    <div className={cx('dialog')}>
                        <h3>Reject Shop Registration</h3>
                        <p>
                            Please provide a reason for rejecting this shop registration. This
                            information will be sent to the shop owner.
                        </p>
                        <textarea
                            className={cx('rejection-input')}
                            placeholder="Enter rejection reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            required
                        />
                        <div className={cx('dialog-actions')}>
                            <button
                                className={cx('cancel-button')}
                                onClick={() => setOpenRejectDialog(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className={cx('reject-button')}
                                onClick={handleRejectRequest}
                                disabled={submitting || !rejectionReason.trim()}
                            >
                                {submitting ? 'Processing...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopRegistrationDetail;
