import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './DiscountList.module.scss';
import axiosClient from '../../configs/axios';
import { useToast } from '../../contexts/ToastContext';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaFilter,
    FaAngleLeft,
    FaAngleRight,
    FaCalendarAlt
} from 'react-icons/fa';

const cx = classNames.bind(styles);

// Define the sortable fields according to server validation
const SORTABLE_FIELDS = [
    'created_at',
    'updated_at',
    'discount_name',
    'discount_type',
    'discount_start_at',
    'discount_end_at'
];

// Define the DiscountList component as a function expression
const DiscountList = function() {
    const { showToast } = useToast();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Filter state
    const [statusFilter, setStatusFilter] = useState('all');

    // Effect for pagination, sorting and filtering
    useEffect(() => {
        fetchDiscounts();
    }, [currentPage, itemsPerPage, sortField, sortOrder, statusFilter]);

    // Debounced search effect
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeoutId = setTimeout(() => {
            setCurrentPage(1); // Reset to first page when searching
            fetchDiscounts();
        }, 500);

        setSearchTimeout(timeoutId);

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTerm]);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosClient.get('/discount/shop/own', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    sortBy: sortField,
                    sortType: sortOrder,
                    keyword: searchTerm || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined
                }
            });

            if (response.data && response.data.metadata) {
                setDiscounts(response.data.metadata);

                // Handle pagination info from API response
                if (response.data.pagination) {
                    setTotalItems(response.data.pagination.totalItems || 0);
                    setTotalPages(response.data.pagination.totalPages || 1);
                } else {
                    // Fallback if server doesn't return pagination info
                    setTotalPages(Math.ceil(response.data.metadata.length / itemsPerPage) || 1);
                    setTotalItems(response.data.metadata.length || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
            setError('Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.');
            showToast('error', 'Lỗi khi tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const getDiscountStatus = (discount) => {
        const now = new Date();
        const startDate = new Date(discount.discount_start_at);
        const endDate = new Date(discount.discount_end_at);

        if (now < startDate) return 'upcoming';
        if (now > endDate) return 'expired';
        return 'active';
    };

    const handleDeleteDiscount = async (discountId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không?')) {
            return;
        }

        try {
            await axiosClient.delete(`/discount/${discountId}`);
            showToast('success', 'Đã xóa mã giảm giá thành công');
            fetchDiscounts(); // Refresh the list
        } catch (error) {
            console.error('Error deleting discount:', error);
            showToast('error', 'Không thể xóa mã giảm giá. Vui lòng thử lại.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSort = (field) => {
        // Only allow sorting by valid fields
        if (!SORTABLE_FIELDS.includes(field)) {
            return;
        }

        if (sortField === field) {
            // Toggle order if clicking the same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Default to ascending order when changing fields
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field) => {
        // Only show sort icons for valid sortable fields
        if (!SORTABLE_FIELDS.includes(field)) {
            return null;
        }

        if (sortField !== field) return <FaSort />;
        return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const isSortable = (field) => {
        return SORTABLE_FIELDS.includes(field);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getStatusDisplayText = (status) => {
        switch (status) {
            case 'active':
                return 'Đang hoạt động';
            case 'upcoming':
                return 'Sắp diễn ra';
            case 'expired':
                return 'Hết hạn';
            default:
                return status;
        }
    };

    return (
        <div className={cx('discount-list-container')}>
            {/* Header section */}
            <div className={cx('header')}>
                <h1>Quản Lý Mã Giảm Giá</h1>
                <Link to="/discounts/new" className={cx('add-button')}>
                    <FaPlus className={cx('icon')} />
                    <span>Thêm Mã Giảm Giá</span>
                </Link>
            </div>

            {/* Tools and filters section */}
            <div className={cx('tools-container')}>
                <div className={cx('search-filter-row')}>
                    {/* Search box */}
                    <div className={cx('search-box')}>
                        <FaSearch className={cx('search-icon')} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên mã giảm giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cx('search-input')}
                        />
                    </div>

                    {/* Status filter */}
                    <div className={cx('filter-select')}>
                        <label htmlFor="status-filter" className={cx('filter-label')}>
                            <FaFilter className={cx('filter-icon')} />
                            <span>Trạng thái:</span>
                        </label>
                        <select
                            id="status-filter"
                            className={cx('status-selector')}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1); // Reset to first page when filtering
                            }}
                        >
                            <option value="all">Tất cả</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="upcoming">Sắp diễn ra</option>
                            <option value="expired">Hết hạn</option>
                        </select>
                    </div>
                </div>

                {/* Pagination options */}
                <div className={cx('pagination-options')}>
                    <label htmlFor="items-per-page" className={cx('items-per-page-label')}>
                        Hiển thị:
                    </label>
                    <select
                        id="items-per-page"
                        className={cx('items-per-page')}
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className={cx('items-per-page-text')}>mục mỗi trang</span>

                    <div className={cx('items-count')}>
                        Hiển thị <span>{discounts.length}</span> trên tổng số{' '}
                        <span>{totalItems}</span> mã giảm giá
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className={cx('content-container')}>
                {loading ? (
                    <div className={cx('loading-state')}>
                        <div className={cx('loader')}></div>
                        <p>Đang tải mã giảm giá...</p>
                    </div>
                ) : error ? (
                    <div className={cx('error-state')}>
                        <p>{error}</p>
                        <button className={cx('retry-button')} onClick={() => fetchDiscounts()}>
                            Thử lại
                        </button>
                    </div>
                ) : discounts.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <div className={cx('empty-icon')}>🏷️</div>
                        <p>Chưa có mã giảm giá nào. Hãy tạo mã giảm giá đầu tiên!</p>
                        <Link to="/discounts/new" className={cx('create-first-btn')}>
                            Tạo mã giảm giá
                        </Link>
                    </div>
                ) : (
                    <div className={cx('table-container')}>
                        <table className={cx('discount-table')}>
                            <thead>
                                <tr>
                                    <th
                                        onClick={() => handleSort('discount_name')}
                                        className={cx('sortable-header')}
                                    >
                                        <div className={cx('th-content')}>
                                            <span>Tên</span>
                                            <span className={cx('sort-icon')}>
                                                {getSortIcon('discount_name')}
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={cx('th-content')}>
                                            <span>Mã</span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('discount_type')}
                                        className={cx('sortable-header')}
                                    >
                                        <div className={cx('th-content')}>
                                            <span>Giá trị</span>
                                            <span className={cx('sort-icon')}>
                                                {getSortIcon('discount_type')}
                                            </span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('discount_start_at')}
                                        className={cx('sortable-header', {
                                            'not-sortable': !isSortable('discount_start_at')
                                        })}
                                    >
                                        <div className={cx('th-content')}>
                                            <span>Thời gian hiệu lực</span>
                                            <span className={cx('sort-icon')}>
                                                {getSortIcon('discount_start_at')}
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>
                                        <div className={cx('th-content')}>
                                            <span>Lượt sử dụng</span>
                                        </div>
                                    </th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>
                                        <div className={cx('th-content')}>
                                            <span>Trạng thái</span>
                                        </div>
                                    </th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>
                                        <div className={cx('th-content')}>
                                            <span>Thao tác</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.map((discount) => {
                                    const status = getDiscountStatus(discount);
                                    return (
                                        <tr key={discount._id}>
                                            <td className={cx('discount-name')}>
                                                {discount.discount_name}
                                            </td>
                                            <td className={cx('discount-code')}>
                                                {discount.discount_code}
                                            </td>
                                            <td className={cx('discount-value')}>
                                                {discount.discount_type === 'percentage'
                                                    ? `${discount.discount_value}%`
                                                    : `${discount.discount_value.toLocaleString()} ₫`}
                                            </td>
                                            <td className={cx('discount-period')}>
                                                <div>
                                                    <FaCalendarAlt className={cx('date-icon')} />
                                                    {formatDate(discount.discount_start_at)}
                                                </div>
                                                <div className={cx('date-separator')}>đến</div>
                                                <div>
                                                    <FaCalendarAlt className={cx('date-icon')} />
                                                    {formatDate(discount.discount_end_at)}
                                                </div>
                                            </td>
                                            <td className={cx('discount-usage')}>
                                                {discount.discount_used_count || 0} lượt
                                            </td>
                                            <td>
                                                <span className={cx('status-badge', status)}>
                                                    {getStatusDisplayText(status)}
                                                </span>
                                            </td>
                                            <td className={cx('actions')}>
                                                <Link
                                                    to={`/discounts/${discount._id}/edit`}
                                                    className={cx('edit-btn')}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    className={cx('delete-btn')}
                                                    onClick={() =>
                                                        handleDeleteDiscount(discount._id)
                                                    }
                                                    title="Xóa"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination section */}
            {!loading && !error && discounts.length > 0 && (
                <div className={cx('pagination-container')}>
                    <button
                        className={cx('page-btn', 'prev-btn', { disabled: currentPage === 1 })}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FaAngleLeft />
                        <span>Trước</span>
                    </button>

                    <div className={cx('page-numbers')}>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show pages around current page
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    className={cx('page-number', {
                                        active: pageNum === currentPage
                                    })}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        className={cx('page-btn', 'next-btn', {
                            disabled: currentPage === totalPages
                        })}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <span>Tiếp</span>
                        <FaAngleRight />
                    </button>
                </div>
            )}
        </div>
    );
};

// Make sure to explicitly export the component
export default DiscountList;
