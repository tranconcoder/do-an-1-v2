import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductManager.module.scss';

const cx = classNames.bind(styles);

// Dữ liệu sản phẩm mẫu - trong thực tế sẽ được lấy từ API
const dummyProducts = [
    {
        id: 1,
        name: 'Tai Nghe Không Dây',
        price: 1899000,
        inventory: 45,
        status: 'published',
        thumbnail:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&auto=format&fit=crop&q=80',
        createdAt: '2023-04-15'
    },
    {
        id: 2,
        name: 'Đồng Hồ Thông Minh',
        price: 4450000,
        inventory: 23,
        status: 'published',
        thumbnail:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&auto=format&fit=crop&q=80',
        createdAt: '2023-05-02'
    },
    {
        id: 3,
        name: 'Loa Bluetooth',
        price: 2790000,
        inventory: 12,
        status: 'draft',
        thumbnail:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=150&h=150&auto=format&fit=crop&q=80',
        createdAt: '2023-06-10'
    }
];

function ProductManager() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, published, draft
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Giả lập việc gọi API
        setTimeout(() => {
            setProducts(dummyProducts);
            setLoading(false);
        }, 800);
    }, []);

    // Chuyển đổi trạng thái sản phẩm sang tiếng Việt
    const getVietnameseStatus = (status) => {
        return status === 'published' ? 'Đã Đăng' : status === 'draft' ? 'Bản Nháp' : status;
    };

    const handleStatusChange = (productId, newStatus) => {
        setProducts(
            products.map((product) =>
                product.id === productId ? { ...product, status: newStatus } : product
            )
        );
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
            setProducts(products.filter((product) => product.id !== productId));
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesFilter = filter === 'all' || product.status === filter;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Định dạng giá tiền theo VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className={cx('product-manager')}>
            <div className={cx('header')}>
                <h1>Quản Lý Sản Phẩm</h1>
                <Link to="/products/new" className={cx('add-product-btn')}>
                    + Thêm Sản Phẩm Mới
                </Link>
            </div>

            <div className={cx('filters')}>
                <div className={cx('status-filters')}>
                    <button
                        className={cx('filter-btn', filter === 'all' && 'active')}
                        onClick={() => setFilter('all')}
                    >
                        Tất Cả Sản Phẩm
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
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className={cx('loading')}>Đang tải sản phẩm...</div>
            ) : (
                <>
                    {filteredProducts.length === 0 ? (
                        <div className={cx('no-products')}>
                            Không tìm thấy sản phẩm nào.
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className={cx('reset-btn')}
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={cx('products-table-wrapper')}>
                            <table className={cx('products-table')}>
                                <thead>
                                    <tr>
                                        <th>Hình Ảnh</th>
                                        <th>Tên Sản Phẩm</th>
                                        <th>Giá</th>
                                        <th>Tồn Kho</th>
                                        <th>Trạng Thái</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className={cx('product-image')}>
                                                    <img
                                                        src={product.thumbnail}
                                                        alt={product.name}
                                                    />
                                                </div>
                                            </td>
                                            <td className={cx('product-name')}>{product.name}</td>
                                            <td>{formatPrice(product.price)}</td>
                                            <td>{product.inventory} sản phẩm</td>
                                            <td>
                                                <span className={cx('status', product.status)}>
                                                    {getVietnameseStatus(product.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={cx('actions')}>
                                                    <button className={cx('edit-btn')}>Sửa</button>
                                                    {product.status === 'draft' ? (
                                                        <button
                                                            className={cx('publish-btn')}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    product.id,
                                                                    'published'
                                                                )
                                                            }
                                                        >
                                                            Đăng
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className={cx('unpublish-btn')}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    product.id,
                                                                    'draft'
                                                                )
                                                            }
                                                        >
                                                            Hủy Đăng
                                                        </button>
                                                    )}
                                                    <button
                                                        className={cx('delete-btn')}
                                                        onClick={() =>
                                                            handleDeleteProduct(product.id)
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ProductManager;
