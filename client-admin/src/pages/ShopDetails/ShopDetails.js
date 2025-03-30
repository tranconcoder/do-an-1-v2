import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../configs/axios';
import './ShopDetails.css';

const ShopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/shop/${id}`);
                setShop(response.metadata);
            } catch (err) {
                console.error('Error fetching shop details:', err);
                setError('Failed to load shop details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchShopDetails();
    }, [id]);

    const handleApproveShop = async () => {
        try {
            setSubmitting(true);
            await axios.put(`/shop/${id}/approve`);
            setActionMessage({
                type: 'success',
                text: 'Shop has been approved successfully!'
            });
            // Update local shop state to reflect the change
            setShop({ ...shop, shop_status: 'active' });
        } catch (err) {
            console.error('Error approving shop:', err);
            setActionMessage({
                type: 'error',
                text: 'Failed to approve shop. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openRejectDialog = () => {
        setShowRejectDialog(true);
    };

    const handleRejectShop = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        try {
            setSubmitting(true);
            await axios.put(`/shop/${id}/reject`, { reason: rejectReason });
            setShowRejectDialog(false);
            setActionMessage({
                type: 'success',
                text: 'Shop has been rejected successfully.'
            });
            // Update local shop state to reflect the change
            setShop({ ...shop, shop_status: 'banned', rejection_reason: rejectReason });
        } catch (err) {
            console.error('Error rejecting shop:', err);
            setActionMessage({
                type: 'error',
                text: 'Failed to reject shop. Please try again.'
            });
        } finally {
            setSubmitting(false);
            setRejectReason('');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="shop-details-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading shop details...</p>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="shop-details-container">
                <div className="error-message">{error || 'Shop not found'}</div>
                <button onClick={handleBack} className="back-button">
                    Back to Shop List
                </button>
            </div>
        );
    }

    return (
        <div className="shop-details-container">
            <div className="header-actions">
                <button onClick={handleBack} className="back-button">
                    &larr; Back to Shop List
                </button>

                {actionMessage.text && (
                    <div className={`action-message ${actionMessage.type}`}>
                        {actionMessage.text}
                    </div>
                )}
            </div>

            <div className="shop-details-card">
                <div className="shop-header">
                    <div className="shop-logo">
                        <img
                            src={shop.shop_logo || 'https://via.placeholder.com/150'}
                            alt={`${shop.shop_name} Logo`}
                        />
                    </div>
                    <div className="shop-title">
                        <h1>{shop.shop_name}</h1>
                        <span className={`status-badge ${shop.shop_status}`}>
                            {shop.shop_status?.toUpperCase() || 'PENDING'}
                        </span>
                    </div>
                </div>

                {shop.rejection_reason && (
                    <div className="rejection-info">
                        <h3>Rejection Reason:</h3>
                        <p>{shop.rejection_reason}</p>
                    </div>
                )}

                <div className="details-section">
                    <h2>Shop Information</h2>
                    <div className="details-grid">
                        <div className="details-item">
                            <span className="label">Shop Type:</span>
                            <span className="value">{shop.shop_type}</span>
                        </div>
                        <div className="details-item">
                            <span className="label">Email:</span>
                            <span className="value">{shop.shop_email}</span>
                        </div>
                        <div className="details-item">
                            <span className="label">Phone Number:</span>
                            <span className="value">{shop.shop_phoneNumber}</span>
                        </div>
                        <div className="details-item">
                            <span className="label">Certificate Number:</span>
                            <span className="value">{shop.shop_certificate}</span>
                        </div>
                        <div className="details-item">
                            <span className="label">Location:</span>
                            <span className="value">{shop.shop_location || 'Not specified'}</span>
                        </div>
                        <div className="details-item">
                            <span className="label">Is Brand:</span>
                            <span className="value">{shop.is_brand ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>

                <div className="details-section">
                    <h2>Owner Information</h2>
                    <div className="details-grid">
                        <div className="details-item">
                            <span className="label">Full Name:</span>
                            <span className="value">{shop.shop_owner_fullName}</span>
                        </div>
                        <div className="details-item">
                            <span className="label">Email:</span>
                            <span className="value">{shop.shop_owner_email}</span>
                        </div>
                        <div className="details-item">
                            <span className="label">Card ID:</span>
                            <span className="value">{shop.shop_owner_cardID}</span>
                        </div>
                    </div>
                </div>

                {shop.shop_status === 'pending' && (
                    <div className="action-section">
                        <button
                            onClick={handleApproveShop}
                            className="approve-button-large"
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : 'Approve Shop'}
                        </button>
                        <button
                            onClick={openRejectDialog}
                            className="reject-button-large"
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : 'Reject Shop'}
                        </button>
                    </div>
                )}
            </div>

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h3>Reject Shop Registration</h3>
                        <p>
                            You are about to reject the shop: <strong>{shop.shop_name}</strong>
                        </p>
                        <div className="form-group">
                            <label>Reason for Rejection:</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="dialog-buttons">
                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setShowRejectDialog(false);
                                    setRejectReason('');
                                }}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-reject-button"
                                onClick={handleRejectShop}
                                disabled={submitting || !rejectReason.trim()}
                            >
                                {submitting ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopDetails;
