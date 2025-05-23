import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../configs/axios';
import { API_URL } from '../../configs/env.config';
import './ShopApprovals.css';

const ShopApprovals = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShop, setSelectedShop] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const navigate = useNavigate();

    // Items per page for client-side pagination
    const ITEMS_PER_PAGE = 10;

    // Function to get image URL from media ID
    const getImageUrl = (mediaId) => {
        if (!mediaId) return null;
        return `${API_URL}/media/${mediaId}`;
    };

    // Fetch pending shops from API
    const fetchPendingShops = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/shop/pending');

            console.log('API Response:', response); // For debugging

            // Handle the API response format - a flat array in metadata
            if (response.statusCode === 200 && Array.isArray(response.metadata)) {
                setShops(response.metadata || []);

                // Calculate total pages based on the array length
                const total = Math.ceil(response.metadata.length / ITEMS_PER_PAGE);
                setTotalPages(total || 1);
            } else {
                console.error('Unexpected API response format:', response);
                setError('Received unexpected data format from server');
                setShops([]);
            }
        } catch (err) {
            console.error('Error fetching pending shops:', err);
            setError('Failed to load pending shops. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingShops();
    }, []);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Filter shops based on search term
    const filteredShops = shops.filter((shop) => {
        return (
            searchTerm === '' ||
            shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shop_owner_fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shop_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shop_phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Get current page items with client-side pagination
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredShops.slice(startIndex, endIndex);
    };

    // Handle shop approval
    const handleApproveShop = async (shopId) => {
        try {
            setLoading(true);
            await axios.patch(`/shop/approve/${shopId}`);
            // Refresh the list after approval
            fetchPendingShops();
            alert('Shop has been approved successfully!');
        } catch (err) {
            console.error('Error approving shop:', err);
            alert('Failed to approve shop. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Open reject dialog
    const openRejectDialog = (shop) => {
        setSelectedShop(shop);
        setShowRejectDialog(true);
    };

    // Handle shop rejection
    const handleRejectShop = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        try {
            setLoading(true);
            await axios.patch(`/shop/reject/${selectedShop._id}`);
            // Close dialog and refresh list
            setShowRejectDialog(false);
            setRejectReason('');
            setSelectedShop(null);
            fetchPendingShops();
            alert('Shop has been rejected.');
        } catch (err) {
            console.error('Error rejecting shop:', err);
            alert('Failed to reject shop. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // View shop details
    const viewShopDetails = (shopId) => {
        navigate(`/shop-details/${shopId}`);
    };

    if (loading && shops.length === 0) {
        return (
            <div className="shop-approvals-container">
                <div className="loading-spinner"></div>
                <p>Loading shop approvals...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shop-approvals-container">
                <div className="error-message">{error}</div>
                <button onClick={fetchPendingShops} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    // Get shops for current page
    const currentShops = getCurrentPageItems();

    return (
        <div className="shop-approvals-container">
            <h1 className="page-title">Shop Registration Approvals</h1>
            <div className="controls">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name, owner, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredShops.length === 0 ? (
                <div className="no-results">No pending shop registrations found.</div>
            ) : (
                <>
                    <div className="shops-table-container">
                        <table className="shops-table">
                            <thead>
                                <tr>
                                    <th>Logo</th>
                                    <th>Shop Name</th>
                                    <th>Owner</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentShops.map((shop) => (
                                    <tr key={shop._id}>
                                        <td className="shop-logo-cell">
                                            {shop.shop_logo ? (
                                                <img
                                                    src={getImageUrl(shop.shop_logo)}
                                                    alt={`${shop.shop_name} logo`}
                                                    className="shop-logo"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            'https://via.placeholder.com/50?text=No+Logo';
                                                    }}
                                                />
                                            ) : (
                                                <div className="shop-logo-placeholder">
                                                    {shop.shop_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td>{shop.shop_name}</td>
                                        <td>{shop.shop_owner_fullName}</td>
                                        <td>{shop.shop_email}</td>
                                        <td>{shop.shop_phoneNumber}</td>
                                        <td>{shop.shop_type}</td>
                                        <td className="action-buttons">
                                            <button
                                                className="view-button"
                                                onClick={() => viewShopDetails(shop._id)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="approve-button"
                                                onClick={() => handleApproveShop(shop._id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="reject-button"
                                                onClick={() => openRejectDialog(shop)}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`pagination-button ${
                                        page === currentPage ? 'active' : ''
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-button"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h3>Reject Shop Registration</h3>
                        <p>
                            You are about to reject the shop:{' '}
                            <strong>{selectedShop.shop_name}</strong>
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
                                    setSelectedShop(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-reject-button"
                                onClick={handleRejectShop}
                                disabled={!rejectReason.trim()}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopApprovals;
