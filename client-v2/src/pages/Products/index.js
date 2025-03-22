import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Products.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

function Products() {
    const { getAllProducts, filterProducts, getAllCategories, addToCart } = useProducts();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        categoryId: categoryParam ? parseInt(categoryParam) : null,
        minPrice: null,
        maxPrice: null,
        onSale: false,
        inStock: true
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let filteredProducts = [];

                if (searchParam) {
                    // If there's a search query, filter products by that
                    filteredProducts = getAllProducts().filter(
                        (product) =>
                            product.name.toLowerCase().includes(searchParam.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchParam.toLowerCase()) ||
                            (product.tags &&
                                product.tags.some((tag) =>
                                    tag.toLowerCase().includes(searchParam.toLowerCase())
                                ))
                    );
                } else {
                    // Otherwise apply regular filters
                    filteredProducts = filterProducts(filters);
                }

                setProducts(filteredProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filters, searchParam, getAllProducts, filterProducts]);

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handleAddToCart = (productId, event) => {
        event.preventDefault(); // Prevent navigating to product page
        event.stopPropagation(); // Stop event from bubbling up
        addToCart(productId, 1);
    };

    return (
        <div className={cx('products-container')}>
            <h1 className={cx('page-title')}>
                {searchParam
                    ? `Search Results for "${searchParam}"`
                    : categoryParam
                    ? `Products in ${
                          getAllCategories().find((c) => c.id === parseInt(categoryParam))?.name ||
                          'Category'
                      }`
                    : 'All Products'}
            </h1>

            {/* Filter sidebar could go here */}

            {loading && <div className={cx('loading')}>Loading products...</div>}

            {error && <div className={cx('error')}>{error}</div>}

            {!loading && products.length === 0 && !error && (
                <div className={cx('no-products')}>No products found</div>
            )}

            <div className={cx('products-grid')}>
                {products.map((product) => (
                    <div key={product.id} className={cx('product-card')}>
                        <Link
                            to={`/product/${product.slug}`}
                            className={cx('product-image-container')}
                        >
                            {product.discount > 0 && (
                                <div className={cx('discount-badge')}>-{product.discount}%</div>
                            )}
                            {product.isNew && <div className={cx('new-badge')}>New</div>}
                            <img
                                src={product.thumbnail || product.images?.[0] || DEFAULT_IMAGE}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_IMAGE;
                                }}
                            />
                        </Link>
                        <div className={cx('product-details')}>
                            <Link to={`/product/${product.slug}`} className={cx('product-name')}>
                                {product.name}
                            </Link>

                            <div className={cx('product-price-container')}>
                                <p className={cx('product-price')}>${product.price.toFixed(2)}</p>
                                {product.originalPrice > product.price && (
                                    <p className={cx('original-price')}>
                                        ${Number(product.originalPrice).toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className={cx('product-stock')}>
                                <span className={cx('stock-info')}>{product.stock} in stock</span>
                                <span className={cx('sold-info')}>{product.sold} sold</span>
                            </div>

                            <div className={cx('product-rating')}>
                                <span className={cx('stars')}>
                                    {'★'.repeat(Math.floor(product.rating))}
                                    {'☆'.repeat(5 - Math.floor(product.rating))}
                                </span>
                                <span className={cx('review-count')}>({product.reviewCount})</span>
                            </div>

                            <button
                                className={cx('add-to-cart-btn')}
                                onClick={(e) => handleAddToCart(product.id, e)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Products;
