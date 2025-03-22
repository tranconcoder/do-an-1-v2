import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Products.module.scss';
import { useProducts } from '../../configs/ProductsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faStar,
    faStarHalf,
    faTag,
    faBoxOpen,
    faShoppingCart,
    faEye
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

function Products() {
    const { getAllProducts, filterProducts, getAllCategories, addToCart } = useProducts();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search, sort, and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('relevance');
    const [filterOptions, setFilterOptions] = useState({
        categoryId: categoryParam ? parseInt(categoryParam) : null,
        minPrice: '',
        maxPrice: '',
        onSale: false,
        inStock: true,
        rating: 0
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isFilterPanelAnimating, setIsFilterPanelAnimating] = useState(false);

    // Dropdown states
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    const categories = getAllCategories();

    // Refs for dropdowns
    const dropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);

    // Handle click outside for sort dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.classList.add('dropdown-open');
        } else {
            document.body.classList.remove('dropdown-open');
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.classList.remove('dropdown-open');
        };
    }, [isDropdownOpen]);

    // Handle click outside for category dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target)
            ) {
                setIsCategoryDropdownOpen(false);
            }
        }

        if (isCategoryDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCategoryDropdownOpen]);

    // Fetch initial products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let initialProducts = [];

                if (searchParam) {
                    initialProducts = getAllProducts().filter(
                        (product) =>
                            product.name.toLowerCase().includes(searchParam.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchParam.toLowerCase()) ||
                            (product.tags &&
                                product.tags.some((tag) =>
                                    tag.toLowerCase().includes(searchParam.toLowerCase())
                                ))
                    );
                } else {
                    initialProducts = filterProducts({
                        categoryId: filterOptions.categoryId,
                        inStock: filterOptions.inStock
                    });
                }

                setProducts(initialProducts);
                setFilteredProducts(initialProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [
        searchParam,
        filterOptions.categoryId,
        filterOptions.inStock,
        getAllProducts,
        filterProducts
    ]);

    // Apply search, sort, and filter
    useEffect(() => {
        if (products.length === 0) return;

        let results = [...products];

        // Apply search filter
        if (searchTerm.trim()) {
            results = results.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (product.description &&
                        product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (product.tags &&
                        product.tags.some((tag) =>
                            tag.toLowerCase().includes(searchTerm.toLowerCase())
                        ))
            );
        }

        // Apply price filter
        if (filterOptions.minPrice !== '') {
            results = results.filter((product) => product.price >= Number(filterOptions.minPrice));
        }

        if (filterOptions.maxPrice !== '') {
            results = results.filter((product) => product.price <= Number(filterOptions.maxPrice));
        }

        // Apply sale filter
        if (filterOptions.onSale) {
            results = results.filter((product) => product.discount > 0);
        }

        // Apply rating filter
        if (filterOptions.rating > 0) {
            results = results.filter(
                (product) => Math.round(product.rating) >= filterOptions.rating
            );
        }

        // Apply sorting
        switch (sortOption) {
            case 'price-asc':
                results.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                results.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                results.sort((a, b) => b.id - a.id); // Assuming higher id means newer product
                break;
            case 'popularity':
                results.sort((a, b) => b.sold - a.sold);
                break;
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Default 'relevance' sort - keep original order
                break;
        }

        setFilteredProducts(results);
    }, [products, searchTerm, sortOption, filterOptions]);

    const resetFilters = () => {
        setFilterOptions({
            categoryId: categoryParam ? parseInt(categoryParam) : null,
            minPrice: '',
            maxPrice: '',
            onSale: false,
            inStock: true,
            rating: 0
        });
        setSearchTerm('');
        setSortOption('relevance');
    };

    const handleAddToCart = (productId, event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(productId, 1);
    };

    const toggleFilters = () => {
        setIsFilterPanelAnimating(true);
        setShowFilters(!showFilters);
        setTimeout(() => setIsFilterPanelAnimating(false), 300);
    };

    // Generate star rating display
    const renderStarRating = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} />);
        }

        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key="half" icon={faStarHalf} />);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FontAwesomeIcon key={`empty-${i}`} icon={faStar} className={cx('empty-star')} />
            );
        }

        return stars;
    };

    // Add this method to calculate dropdown position
    const calculateDropdownPosition = (dropdownRef) => {
        if (!dropdownRef.current) return {};

        const rect = dropdownRef.current.getBoundingClientRect();
        const toggleButton = dropdownRef.current.querySelector(`.${cx('dropdown-toggle')}`);
        const toggleRect = toggleButton ? toggleButton.getBoundingClientRect() : rect;

        return {
            top: toggleRect.bottom + 5 + 'px',
            left: toggleRect.left + 'px',
            width: toggleRect.width + 'px'
        };
    };

    return (
        <div className={cx('products-container')}>
            <h1 className={cx('page-title')}>
                {searchParam ? (
                    <>
                        <FontAwesomeIcon icon={faSearch} className={cx('title-icon')} /> Search
                        Results for "{searchParam}"
                    </>
                ) : categoryParam ? (
                    <>
                        <FontAwesomeIcon icon={faTag} className={cx('title-icon')} />{' '}
                        {categories.find((c) => c.id === parseInt(categoryParam))?.name ||
                            'Category'}
                    </>
                ) : (
                    <>All Products</>
                )}
            </h1>

            {loading && (
                <div className={cx('loading')}>
                    <div className={cx('loading-spinner')}></div>
                    <p>Loading products...</p>
                </div>
            )}

            {error && <div className={cx('error')}>{error}</div>}

            {!loading && filteredProducts.length === 0 && !error && (
                <div className={cx('no-products')}>
                    <div className={cx('empty-state-icon')}>
                        <FontAwesomeIcon icon={faSearch} size="3x" />
                    </div>
                    <p>No products found matching your criteria.</p>
                    <button className={cx('reset-search')} onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
            )}

            <div className={cx('products-grid')}>
                {filteredProducts.map((product) => (
                    <div key={product.id} className={cx('product-card')}>
                        <Link
                            to={`/product/${product.slug}`}
                            className={cx('product-image-container')}
                        >
                            {product.discount > 0 && (
                                <div className={cx('discount-badge')}>
                                    <FontAwesomeIcon icon={faTag} /> {product.discount}%
                                </div>
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
                            <div className={cx('quick-view')}>
                                <span>
                                    <FontAwesomeIcon icon={faEye} /> Quick View
                                </span>
                            </div>
                        </Link>
                        <div className={cx('product-details')}>
                            <div className={cx('product-info')}>
                                <Link
                                    to={`/product/${product.slug}`}
                                    className={cx('product-name')}
                                >
                                    {product.name}
                                </Link>

                                <div className={cx('product-price-container')}>
                                    <p className={cx('product-price')}>
                                        ${product.price.toFixed(2)}
                                    </p>
                                    {product.originalPrice > product.price && (
                                        <p className={cx('original-price')}>
                                            ${Number(product.originalPrice).toFixed(2)}
                                        </p>
                                    )}
                                </div>

                                <div className={cx('product-stock')}>
                                    <span className={cx('stock-info')}>
                                        <FontAwesomeIcon
                                            icon={faBoxOpen}
                                            className={cx('stock-icon')}
                                        />
                                        {product.stock} in stock
                                    </span>
                                    <span className={cx('sold-info')}>{product.sold} sold</span>
                                </div>

                                <div className={cx('product-rating')}>
                                    <span className={cx('stars')}>
                                        {renderStarRating(product.rating)}
                                    </span>
                                    <span className={cx('review-count')}>
                                        ({product.reviewCount})
                                    </span>
                                </div>
                            </div>

                            <button
                                className={cx('add-to-cart-btn')}
                                onClick={(e) => handleAddToCart(product.id, e)}
                            >
                                <FontAwesomeIcon
                                    icon={faShoppingCart}
                                    className={cx('cart-icon')}
                                />
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
