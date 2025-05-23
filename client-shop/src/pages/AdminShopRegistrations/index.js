import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AdminShopRegistrations.module.scss';
import { FaSearch, FaFilter } from 'react-icons/fa';
import axios from '../../configs/axios';

const cx = classNames.bind(styles);

const AdminShopRegistrations = () => {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Fetch registrations on component mount
    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/shops/registrations');
                setRegistrations(response.data.metadata || []);
            } catch (err) {
                console.error('Error fetching shop registrations:', err);
                setError('Failed to load shop registrations. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    // Filter registrations based on search term and status filter
    const filteredRegistrations = registrations.filter((shop) => {
        const matchesSearch =
            searchTerm === '' ||
            shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shop_owner_fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shop_email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || shop.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle view details
    const handleViewDetails = (shopId) => {
        navigate(`/admin/shops/registrations/${shopId}`);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Render loading state
    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <div className={cx('spinner')}></div>
                <p>Loading shop registrations...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className={cx('error-container')}>
                <p className={cx('error-message')}>{error}</p>
                <button className={cx('retry-button')} onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }

    // Get status badge class based on status
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'approved';
            case 'REJECTED':
                return 'rejected';
            default:
                return 'pending';
        }
    };

    return (
        <div className={cx('registrations-container')}>
            <h2 className={cx('page-title')}>Shop Registration Requests</h2>

            <div className={cx('controls')}>
                <div className={cx('search-container')}>
                    <FaSearch className={cx('search-icon')} />
                    <input
                        type="text"
                        className={cx('search-input')}
                        placeholder="Search by name, owner, or email"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className={cx('filter-container')}>
                    <FaFilter className={cx('filter-icon')} />
                    <select
                        className={cx('status-filter')}
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className={cx('registrations-table-container')}>
                <table className={cx('registrations-table')}>
                    <thead>
                        <tr>
                            <th>Shop Name</th>
                            <th>Owner</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={cx('no-data')}>
                                    No shop registration requests found
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((shop) => (
                                <tr key={shop._id}>
                                    <td>{shop.shop_name}</td>
                                    <td>{shop.shop_owner_fullName}</td>
                                    <td>{shop.shop_email}</td>
                                    <td>{shop.shop_phoneNumber}</td>
                                    <td>{shop.shop_type}</td>
                                    <td>
                                        <span
                                            className={cx(
                                                'status-badge',
                                                getStatusBadgeClass(shop.status)
                                            )}
                                        >
                                            {shop.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={cx('review-button')}
                                            onClick={() => handleViewDetails(shop._id)}
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button
                        className={cx('pagination-button')}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                            key={pageNumber}
                            className={cx('pagination-button', {
                                active: pageNumber === currentPage
                            })}
                            onClick={() => handlePageChange(pageNumber)}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <button
                        className={cx('pagination-button')}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminShopRegistrations;
