import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductManager.module.scss';

const cx = classNames.bind(styles);

// Dummy product data - would be fetched from API
const dummyProducts = [
    {
        id: 1,
        name: 'Wireless Headphones',
        price: 89.99,
        inventory: 45,
        status: 'published',
        thumbnail:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&auto=format&fit=crop&q=80',
        createdAt: '2023-04-15'
    },
    {
        id: 2,
        name: 'Smart Watch',
        price: 199.99,
        inventory: 23,
        status: 'published',
        thumbnail:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&auto=format&fit=crop&q=80',
        createdAt: '2023-05-02'
    },
    {
        id: 3,
        name: 'Bluetooth Speaker',
        price: 129.99,
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
        // Simulate API fetch
        setTimeout(() => {
            setProducts(dummyProducts);
            setLoading(false);
        }, 800);
    }, []);

    const handleStatusChange = (productId, newStatus) => {
        setProducts(
            products.map((product) =>
                product.id === productId ? { ...product, status: newStatus } : product
            )
        );
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter((product) => product.id !== productId));
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesFilter = filter === 'all' || product.status === filter;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className={cx('product-manager')}>
            <div className={cx('header')}>
                <h1>Product Manager</h1>
                <Link to="/shop-manager/products/new" className={cx('add-product-btn')}>
                    + Add New Product
                </Link>
            </div>

            <div className={cx('filters')}>
                <div className={cx('status-filters')}>
                    <button
                        className={cx('filter-btn', filter === 'all' && 'active')}
                        onClick={() => setFilter('all')}
                    >
                        All Products
                    </button>
                    <button
                        className={cx('filter-btn', filter === 'published' && 'active')}
                        onClick={() => setFilter('published')}
                    >
                        Published
                    </button>
                    <button
                        className={cx('filter-btn', filter === 'draft' && 'active')}
                        onClick={() => setFilter('draft')}
                    >
                        Drafts
                    </button>
                </div>

                <div className={cx('search')}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className={cx('loading')}>Loading products...</div>
            ) : (
                <>
                    {filteredProducts.length === 0 ? (
                        <div className={cx('no-products')}>
                            No products found.
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className={cx('reset-btn')}
                                >
                                    Reset filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={cx('products-table-wrapper')}>
                            <table className={cx('products-table')}>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Inventory</th>
                                        <th>Status</th>
                                        <th>Actions</th>
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
                                            <td>${product.price.toFixed(2)}</td>
                                            <td>{product.inventory} units</td>
                                            <td>
                                                <span className={cx('status', product.status)}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={cx('actions')}>
                                                    <button className={cx('edit-btn')}>Edit</button>
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
                                                            Publish
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
                                                            Unpublish
                                                        </button>
                                                    )}
                                                    <button
                                                        className={cx('delete-btn')}
                                                        onClick={() =>
                                                            handleDeleteProduct(product.id)
                                                        }
                                                    >
                                                        Delete
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
