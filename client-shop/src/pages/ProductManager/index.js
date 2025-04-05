import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductManager.module.scss';
import { FaSearch, FaEdit, FaTrash, FaEye, FaEyeSlash, FaPlusCircle } from 'react-icons/fa';
import axiosClient from '../../configs/axios';
import { API_URL } from '../../configs/env.config';
import { useToast } from '../../contexts/ToastContext';

const cx = classNames.bind(styles);

function ProductManager() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/spu/shop/own');
            if (response.data?.metadata) {
                setProducts(response.data.metadata);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
            showToast('Không thể tải danh sách sản phẩm', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
            try {
                await axiosClient.delete(`/spu/${productId}`);
                setProducts(products.filter((product) => product._id !== productId));
                showToast('Xóa sản phẩm thành công', 'success');
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                showToast('Không thể xóa sản phẩm', 'error');
            }
        }
    };

    const handleStatusChange = async (productId, isDraft) => {
        try {
            await axiosClient.patch(`/spu/${productId}/status`, {
                is_draft: isDraft,
                is_publish: !isDraft
            });
            setProducts(
                products.map((product) =>
                    product._id === productId
                        ? { ...product, is_draft: isDraft, is_publish: !isDraft }
                        : product
                )
            );
            showToast(
                isDraft ? 'Đã chuyển sản phẩm sang bản nháp' : 'Đã đăng bán sản phẩm',
                'success'
            );
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            showToast('Không thể cập nhật trạng thái sản phẩm', 'error');
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'published' && product.is_publish) ||
            (filter === 'draft' && product.is_draft);
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Format price to VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format price range
    const formatPriceRange = (minPrice, maxPrice) => {
        if (minPrice === maxPrice) {
            return formatPrice(minPrice);
        }
        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    };

    return (
        <div className={cx('product-manager')}>
            <div className={cx('header')}>
                <h1>Quản Lý Sản Phẩm</h1>
                <Link to="/products/new" className={cx('add-product-btn')}>
                    <FaPlusCircle /> Thêm Sản Phẩm
                </Link>
            </div>

            <div className={cx('filters-container')}>
                <div className={cx('filters')}>
                    <div className={cx('status-filters')}>
                        <button
                            className={cx('filter-btn', filter === 'all' && 'active')}
                            onClick={() => setFilter('all')}
                        >
                            Tất Cả
                        </button>
                        <button
                            className={cx('filter-btn', filter === 'published' && 'active')}
                            onClick={() => setFilter('published')}
                        >
                            Đã Đăng
                        </button>
                        <button
                            className={cx('filter-btn', filter === 'draft' && 'active')}
                            onClick={() => setFilter('draft')}
                        >
                            Bản Nháp
                        </button>
                    </div>
                    <div className={cx('search')}>
                        <FaSearch className={cx('search-icon')} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={cx('loading-container')}>
                    <div className={cx('loading-spinner')}></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : (
                <>
                    {filteredProducts.length === 0 ? (
                        <div className={cx('empty-state')}>
                            <div className={cx('empty-icon')}>📦</div>
                            <h3>Không tìm thấy sản phẩm nào</h3>
                            <p>
                                {filter === 'all'
                                    ? 'Hãy thêm sản phẩm đầu tiên vào cửa hàng của bạn.'
                                    : 'Không có sản phẩm phù hợp với bộ lọc hiện tại.'}
                            </p>
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className={cx('reset-filter-btn')}
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={cx('products-grid')}>
                            {filteredProducts.map((product) => (
                                <div key={product._id} className={cx('product-card')}>
                                    <div className={cx('product-image')}>
                                        <img
                                            src={`${API_URL}/media/${product.product_thumb}`}
                                            alt={product.product_name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    'https://via.placeholder.com/150x150?text=Ảnh+sản+phẩm';
                                            }}
                                        />
                                        <div
                                            className={cx('product-status-badge', {
                                                'is-published': product.is_publish,
                                                'is-draft': product.is_draft
                                            })}
                                        >
                                            {product.is_publish ? 'Đang bán' : 'Bản nháp'}
                                        </div>
                                    </div>
                                    <div className={cx('product-content')}>
                                        <h3 className={cx('product-name')}>
                                            {product.product_name}
                                        </h3>
                                        <div className={cx('product-meta')}>
                                            <div className={cx('product-price')}>
                                                {formatPriceRange(
                                                    product.minPrice,
                                                    product.maxPrice
                                                )}
                                            </div>
                                            <div className={cx('product-quantity')}>
                                                <span>{product.product_quantity} sp</span>
                                            </div>
                                        </div>
                                        <div className={cx('product-actions')}>
                                            <Link
                                                to={`/products/edit/${product._id}`}
                                                className={cx('edit-btn')}
                                                title="Chỉnh sửa sản phẩm"
                                            >
                                                <FaEdit /> Sửa
                                            </Link>
                                            <button
                                                className={cx('visibility-btn', {
                                                    'is-published': product.is_publish
                                                })}
                                                onClick={() =>
                                                    handleStatusChange(
                                                        product._id,
                                                        !product.is_draft
                                                    )
                                                }
                                                title={
                                                    product.is_publish
                                                        ? 'Chuyển sang bản nháp'
                                                        : 'Đăng sản phẩm'
                                                }
                                            >
                                                {product.is_publish ? <FaEyeSlash /> : <FaEye />}
                                                {product.is_publish ? 'Ẩn' : 'Hiện'}
                                            </button>
                                            <button
                                                className={cx('delete-btn')}
                                                onClick={() => handleDeleteProduct(product._id)}
                                                title="Xóa sản phẩm"
                                            >
                                                <FaTrash /> Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ProductManager;
