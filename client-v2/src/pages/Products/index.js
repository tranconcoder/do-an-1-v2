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
    faEye,
    faFilter,
    faTimes,
    faCheckSquare,
    faSquare,
    faSort,
    faChevronDown,
    faSortAmountUp,
    faSortAmountDown,
    faFire,
    faClock,
    faPercent,
    faArrowDown19,
    faArrowUp91,
    faTh, // Add icon for categories
    faHome,
    faShirt,
    faCarSide,
    faGamepad,
    faLaptop,
    faBook,
    faDumbbell,
    faSpa,
    faPaw,
    faArrowLeft,
    faArrowRight,
    faAngleLeft,
    faAngleRight
} from '@fortawesome/free-solid-svg-icons';
// Import the debounce hook
import useDebounce from '../../hooks/useDebounce';

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
    const [searchInputValue, setSearchInputValue] = useState(''); // Immediate UI state for search input
    const [sortOption, setSortOption] = useState('relevance');
    const [filterOptions, setFilterOptions] = useState({
        categoryId: categoryParam ? parseInt(categoryParam) : null,
        shopId: null,
        minPrice: 0,
        maxPrice: 100,
        priceRange: [0, 100], // Add this new state for the slider
        onSale: false,
        inStock: true,
        rating: 0,
        tags: []
    });

    // UI state for price range slider
    const [uiPriceRange, setUiPriceRange] = useState([0, 100]);

    // Debounce the search term and price range for better performance
    const searchTerm = useDebounce(searchInputValue, 500); // 500ms debounce for search
    const debouncedPriceRange = useDebounce(uiPriceRange, 1000); // 300ms debounce for price range

    const [showFilters, setShowFilters] = useState(false);
    const [isFilterPanelAnimating, setIsFilterPanelAnimating] = useState(false);
    const [activeFilters, setActiveFilters] = useState(0);

    // Dropdown states
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    const categories = getAllCategories();

    // Refs for dropdowns
    const dropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);
    const filterPanelRef = useRef(null);

    // Sort dropdown state
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    // Add state for category dropdown
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

    // Category options with icons
    const categoryOptions = [
        { id: null, name: 'All Categories', icon: faTh },
        ...categories.map((category) => {
            // Map category icons based on ID or slug
            let icon = faTh; // Default icon
            switch (category.id) {
                case 1:
                    icon = faLaptop;
                    break; // Electronics
                case 2:
                    icon = faHome;
                    break; // Home & Kitchen
                case 3:
                    icon = faShirt;
                    break; // Fashion
                case 4:
                    icon = faSpa;
                    break; // Beauty
                case 5:
                    icon = faDumbbell;
                    break; // Sports
                case 6:
                    icon = faGamepad;
                    break; // Toys
                case 7:
                    icon = faBook;
                    break; // Books
                case 8:
                    icon = faSpa;
                    break; // Health
                case 9:
                    icon = faCarSide;
                    break; // Automotive
                case 10:
                    icon = faPaw;
                    break; // Pet Supplies
                default:
                    icon = faTh;
            }

            return {
                ...category,
                icon
            };
        })
    ];

    // Handle click outside for category dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target)
            ) {
                setCategoryDropdownOpen(false);
            }
        }

        if (categoryDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [categoryDropdownOpen]);

    // Get current selected category
    const getCurrentCategory = () => {
        if (filterOptions.categoryId === null) {
            return categoryOptions[0]; // "All Categories" option
        }
        return (
            categoryOptions.find((cat) => cat.id === filterOptions.categoryId) || categoryOptions[0]
        );
    };

    // Handle click outside for sort dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setSortDropdownOpen(false);
            }
        }

        if (sortDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sortDropdownOpen]);

    // Sort options with icons
    const sortOptions = [
        { value: 'relevance', label: 'Relevance', icon: faSort },
        { value: 'popularity', label: 'Popularity', icon: faFire },
        { value: 'rating', label: 'Rating', icon: faStar },
        { value: 'price-asc', label: 'Price: Low to High', icon: faSortAmountUp },
        { value: 'price-desc', label: 'Price: High to Low', icon: faSortAmountDown },
        { value: 'newest', label: 'Newest First', icon: faClock },
        { value: 'discount', label: 'Biggest Discount', icon: faPercent }
    ];

    // Get current selected sort option
    const getCurrentSortOption = () => {
        return sortOptions.find((option) => option.value === sortOption);
    };

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
                    // Get all products instead of using filters initially
                    initialProducts = getAllProducts();
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
    }, [searchParam, getAllProducts]);

    // Apply debounced price range to filter options
    useEffect(() => {
        setFilterOptions((prev) => ({
            ...prev,
            minPrice: debouncedPriceRange[0],
            maxPrice: debouncedPriceRange[1],
            priceRange: debouncedPriceRange
        }));
    }, [debouncedPriceRange]);

    // Apply search, sort, and filter with debugging
    useEffect(() => {
        if (products.length === 0) return;

        console.log('Filtering products. Total before filtering:', products.length);
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
            console.log('After search filter:', results.length);
        }

        // Apply category filter only if explicitly selected
        if (filterOptions.categoryId) {
            results = results.filter((product) => product.categoryId === filterOptions.categoryId);
            console.log('After category filter:', results.length);
        }

        // Apply price filter with safety checks
        if (typeof filterOptions.minPrice === 'number' && filterOptions.minPrice > 0) {
            results = results.filter((product) => product.price >= filterOptions.minPrice);
            console.log('After min price filter:', results.length);
        }

        if (typeof filterOptions.maxPrice === 'number' && filterOptions.maxPrice < 100) {
            results = results.filter((product) => product.price <= filterOptions.maxPrice);
            console.log('After max price filter:', results.length);
        }

        // Apply sale filter
        if (filterOptions.onSale) {
            results = results.filter((product) => product.discount > 0);
        }

        // Apply in stock filter
        if (filterOptions.inStock) {
            results = results.filter((product) => product.stock > 0);
        }

        // Apply shop filter
        if (filterOptions.shopId) {
            results = results.filter((product) => product.shopId === filterOptions.shopId);
        }

        // Apply tag filter
        if (filterOptions.tags && filterOptions.tags.length > 0) {
            results = results.filter(
                (product) =>
                    product.tags && filterOptions.tags.some((tag) => product.tags.includes(tag))
            );
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
                results.sort((a, b) => (b.sold || 0) - (a.sold || 0));
                break;
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            case 'discount':
                results.sort((a, b) => (b.discount || 0) - (a.discount || 0));
                break;
            default:
                // Default 'relevance' sort - keep original order
                break;
        }

        console.log('Final filtered products:', results.length);
        setFilteredProducts(results);

        // Count active filters for display
        let activeCount = 0;
        if (filterOptions.categoryId) activeCount++;
        if (filterOptions.minPrice > 0) activeCount++;
        if (filterOptions.maxPrice < 100) activeCount++;
        if (filterOptions.onSale) activeCount++;
        if (filterOptions.inStock) activeCount++;
        if (filterOptions.rating > 0) activeCount++;
        if (filterOptions.tags && filterOptions.tags.length > 0)
            activeCount += filterOptions.tags.length;
        setActiveFilters(activeCount);
    }, [products, searchTerm, sortOption, filterOptions]);

    const resetFilters = () => {
        setSearchInputValue('');
        setUiPriceRange([0, 100]);
        setFilterOptions({
            categoryId: categoryParam ? parseInt(categoryParam) : null,
            shopId: null,
            minPrice: 0,
            maxPrice: 100,
            priceRange: [0, 100],
            onSale: false,
            inStock: true,
            rating: 0,
            tags: []
        });
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

    // Extract common tags from products for filters
    const getAvailableTags = () => {
        const allTags = new Set();
        products.forEach((product) => {
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach((tag) => allTags.add(tag));
            }
        });
        return Array.from(allTags);
    };

    // Toggle a tag in filter options
    const toggleTag = (tag) => {
        setFilterOptions((prev) => {
            const currentTags = prev.tags || [];
            const tagExists = currentTags.includes(tag);

            return {
                ...prev,
                tags: tagExists ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]
            };
        });
    };

    // Updated to handle UI price range changes
    const handlePriceRangeChange = (newRange) => {
        setUiPriceRange(newRange);
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page
    const [totalPages, setTotalPages] = useState(1);

    // Calculate total pages when filtered products change
    useEffect(() => {
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
        // Reset to page 1 when filters change
        if (
            currentPage > Math.ceil(filteredProducts.length / itemsPerPage) &&
            filteredProducts.length > 0
        ) {
            setCurrentPage(1);
        }
    }, [filteredProducts, itemsPerPage, currentPage]);

    // Calculate the current items to display based on pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(
        indexOfFirstItem,
        Math.min(indexOfLastItem, filteredProducts.length)
    );

    // Pagination control functions
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    // Generate page numbers for pagination
    const pageNumbers = [];
    const maxPageButtons = 5; // Maximum number of page buttons to show

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

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

            {/* Debug info - helpful for developers */}
            {!loading && (
                <div style={{ marginBottom: '10px', color: '#888', fontSize: '0.9rem' }}>
                    Total Products: {products.length}, Filtered: {filteredProducts.length}, Current
                    Page: {currentPage}/{totalPages}, Showing: {currentItems.length} items
                </div>
            )}

            {loading && (
                <div className={cx('loading')}>
                    <div className={cx('loading-spinner')}></div>
                    <p>Loading products...</p>
                </div>
            )}

            {error && <div className={cx('error')}>{error}</div>}

            {!loading && (
                <div className={cx('products-controls')}>
                    <div className={cx('search-bar')}>
                        <FontAwesomeIcon icon={faSearch} className={cx('search-icon')} />
                        <input
                            type="text"
                            placeholder="Search within results..."
                            value={searchInputValue}
                            onChange={(e) => setSearchInputValue(e.target.value)}
                            className={cx('search-input')}
                        />
                        {searchInputValue && (
                            <button
                                className={cx('clear-search')}
                                onClick={() => setSearchInputValue('')}
                                aria-label="Clear search"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}
                    </div>

                    <div className={cx('filter-sort-controls')}>
                        <button
                            className={cx('filter-toggle', { active: showFilters })}
                            onClick={toggleFilters}
                            aria-expanded={showFilters}
                            aria-controls="filter-panel"
                        >
                            <FontAwesomeIcon icon={faFilter} />
                            Filters
                            {activeFilters > 0 && (
                                <span className={cx('filter-badge')}>{activeFilters}</span>
                            )}
                        </button>

                        <div className={cx('sort-container')} ref={sortDropdownRef}>
                            <label htmlFor="sort-dropdown">Sort by:</label>
                            <div className={cx('custom-dropdown')}>
                                <button
                                    id="sort-dropdown"
                                    className={cx('dropdown-toggle', { active: sortDropdownOpen })}
                                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                    aria-haspopup="listbox"
                                    aria-expanded={sortDropdownOpen}
                                >
                                    <FontAwesomeIcon
                                        icon={getCurrentSortOption().icon}
                                        className={cx('option-icon')}
                                    />
                                    <span>{getCurrentSortOption().label}</span>
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className={cx('dropdown-arrow', { open: sortDropdownOpen })}
                                    />
                                </button>

                                <div
                                    className={cx('dropdown-menu', { open: sortDropdownOpen })}
                                    role="listbox"
                                    aria-labelledby="sort-dropdown"
                                >
                                    {sortOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={cx('dropdown-item', {
                                                selected: sortOption === option.value
                                            })}
                                            onClick={() => {
                                                setSortOption(option.value);
                                                setSortDropdownOpen(false);
                                            }}
                                            role="option"
                                            aria-selected={sortOption === option.value}
                                        >
                                            <FontAwesomeIcon
                                                icon={option.icon}
                                                className={cx('option-icon')}
                                            />
                                            <span>{option.label}</span>
                                            {sortOption === option.value && (
                                                <FontAwesomeIcon
                                                    icon={faCheckSquare}
                                                    className={cx('check-icon')}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {(showFilters || isFilterPanelAnimating) && (
                        <div
                            id="filter-panel"
                            ref={filterPanelRef}
                            className={cx('filter-panel', {
                                show: showFilters,
                                animating: isFilterPanelAnimating
                            })}
                        >
                            <div className={cx('filter-section')}>
                                <h3>Categories</h3>
                                <div className={cx('custom-dropdown')} ref={categoryDropdownRef}>
                                    <button
                                        id="category-dropdown"
                                        className={cx('dropdown-toggle', {
                                            active: categoryDropdownOpen
                                        })}
                                        onClick={() =>
                                            setCategoryDropdownOpen(!categoryDropdownOpen)
                                        }
                                        aria-haspopup="listbox"
                                        aria-expanded={categoryDropdownOpen}
                                    >
                                        <FontAwesomeIcon
                                            icon={getCurrentCategory().icon}
                                            className={cx('option-icon')}
                                        />
                                        <span>{getCurrentCategory().name}</span>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={cx('dropdown-arrow', {
                                                open: categoryDropdownOpen
                                            })}
                                        />
                                    </button>

                                    <div
                                        className={cx('dropdown-menu', {
                                            open: categoryDropdownOpen
                                        })}
                                        role="listbox"
                                        aria-labelledby="category-dropdown"
                                    >
                                        {categoryOptions.map((category) => (
                                            <div
                                                key={`category-${category.id || 'all'}`}
                                                className={cx('dropdown-item', {
                                                    selected:
                                                        filterOptions.categoryId === category.id
                                                })}
                                                onClick={() => {
                                                    setFilterOptions({
                                                        ...filterOptions,
                                                        categoryId: category.id
                                                    });
                                                    setCategoryDropdownOpen(false);
                                                }}
                                                role="option"
                                                aria-selected={
                                                    filterOptions.categoryId === category.id
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={category.icon}
                                                    className={cx('option-icon')}
                                                />
                                                <span>{category.name}</span>
                                                {filterOptions.categoryId === category.id && (
                                                    <FontAwesomeIcon
                                                        icon={faCheckSquare}
                                                        className={cx('check-icon')}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={cx('filter-section')}>
                                <h3>Price Range (Million)</h3>
                                <div className={cx('price-slider-container')}>
                                    <div className={cx('price-slider')}>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={uiPriceRange[0]}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value <= uiPriceRange[1]) {
                                                    handlePriceRangeChange([
                                                        value,
                                                        uiPriceRange[1]
                                                    ]);
                                                }
                                            }}
                                            className={cx('slider', 'slider-min')}
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={uiPriceRange[1]}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value >= uiPriceRange[0]) {
                                                    handlePriceRangeChange([
                                                        uiPriceRange[0],
                                                        value
                                                    ]);
                                                }
                                            }}
                                            className={cx('slider', 'slider-max')}
                                        />
                                        <div className={cx('slider-track')}>
                                            <div
                                                className={cx('slider-range')}
                                                style={{
                                                    left: `${(uiPriceRange[0] / 100) * 100}%`,
                                                    width: `${
                                                        ((uiPriceRange[1] - uiPriceRange[0]) /
                                                            100) *
                                                        100
                                                    }%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className={cx('price-values')}>
                                        <span>${uiPriceRange[0]}M</span>
                                        <span>${uiPriceRange[1]}M</span>
                                    </div>
                                </div>
                            </div>

                            <div className={cx('filter-section')}>
                                <h3>Rating</h3>
                                <div className={cx('rating-filter')}>
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <label key={star} className={cx('rating-option')}>
                                            <input
                                                type="radio"
                                                name="rating"
                                                checked={filterOptions.rating === star}
                                                onChange={() =>
                                                    setFilterOptions({
                                                        ...filterOptions,
                                                        rating: star
                                                    })
                                                }
                                            />
                                            <div className={cx('rating-stars')}>
                                                {renderStarRating(star)} & up
                                            </div>
                                        </label>
                                    ))}
                                    <label className={cx('rating-option')}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={filterOptions.rating === 0}
                                            onChange={() =>
                                                setFilterOptions({
                                                    ...filterOptions,
                                                    rating: 0
                                                })
                                            }
                                        />
                                        <div>Any rating</div>
                                    </label>
                                </div>
                            </div>

                            <div className={cx('filter-section')}>
                                <h3>Popular Tags</h3>
                                <div className={cx('tags-container')}>
                                    {getAvailableTags()
                                        .slice(0, 10)
                                        .map((tag) => (
                                            <div
                                                key={tag}
                                                className={cx('tag', {
                                                    active: filterOptions.tags?.includes(tag)
                                                })}
                                                onClick={() => toggleTag(tag)}
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        filterOptions.tags?.includes(tag)
                                                            ? faCheckSquare
                                                            : faSquare
                                                    }
                                                    className={cx('tag-icon')}
                                                />
                                                {tag}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className={cx('filter-section')}>
                                <h3>Availability</h3>
                                <div className={cx('checkbox-options')}>
                                    <label className={cx('checkbox-label')}>
                                        <input
                                            type="checkbox"
                                            checked={filterOptions.inStock}
                                            onChange={(e) =>
                                                setFilterOptions({
                                                    ...filterOptions,
                                                    inStock: e.target.checked
                                                })
                                            }
                                        />
                                        In Stock Only
                                    </label>
                                    <label className={cx('checkbox-label')}>
                                        <input
                                            type="checkbox"
                                            checked={filterOptions.onSale}
                                            onChange={(e) =>
                                                setFilterOptions({
                                                    ...filterOptions,
                                                    onSale: e.target.checked
                                                })
                                            }
                                        />
                                        On Sale
                                    </label>
                                </div>
                            </div>

                            <div className={cx('filter-actions')}>
                                <button className={cx('reset-filters')} onClick={resetFilters}>
                                    Reset All
                                </button>
                                <button
                                    className={cx('apply-filters')}
                                    onClick={() => setShowFilters(false)}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

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

            {!loading && filteredProducts.length > 0 && !error && (
                <div className={cx('results-info')}>
                    <span className={cx('results-count')}>
                        Showing {indexOfFirstItem + 1}-
                        {Math.min(indexOfLastItem, filteredProducts.length)} of{' '}
                        {filteredProducts.length}{' '}
                        {filteredProducts.length === 1 ? 'product' : 'products'}
                    </span>
                </div>
            )}

            <div className={cx('products-grid')}>
                {currentItems.map((product) => (
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

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={cx('pagination-button', { disabled: currentPage === 1 })}
                        aria-label="Previous page"
                    >
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>

                    {startPage > 1 && (
                        <>
                            <button onClick={() => paginate(1)} className={cx('pagination-button')}>
                                1
                            </button>
                            {startPage > 2 && <span className={cx('pagination-dots')}>...</span>}
                        </>
                    )}

                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={cx('pagination-button', { active: currentPage === number })}
                        >
                            {number}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <span className={cx('pagination-dots')}>...</span>
                            )}
                            <button
                                onClick={() => paginate(totalPages)}
                                className={cx('pagination-button')}
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={cx('pagination-button', {
                            disabled: currentPage === totalPages
                        })}
                        aria-label="Next page"
                    >
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                </div>
            )}

            {/* Items per page selector */}
            {filteredProducts.length > 5 && (
                <div className={cx('items-per-page')}>
                    <span>Show:</span>
                    {[10, 20, 30, 50].map((number) => (
                        <button
                            key={number}
                            onClick={() => setItemsPerPage(number)}
                            className={cx('items-per-page-button', {
                                active: itemsPerPage === number
                            })}
                        >
                            {number}
                        </button>
                    ))}
                    <span>per page</span>
                </div>
            )}
        </div>
    );
}

export default Products;
