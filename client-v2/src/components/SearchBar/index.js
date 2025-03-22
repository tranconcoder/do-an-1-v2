import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faTimes,
    faHistory,
    faArrowTrendUp, // Changed from faTrendingUp to faArrowTrendUp
    faRandom
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './SearchBar.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

const SearchBar = () => {
    const { getAllProducts } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [popularSearches] = useState([
        'wireless headphones',
        'smartphone',
        'fitness tracker',
        'bluetooth speaker',
        'laptop'
    ]);
    const [matchedProducts, setMatchedProducts] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load search history from localStorage on component mount
    useEffect(() => {
        try {
            const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            setSearchHistory(history);
        } catch (error) {
            console.error('Error loading search history:', error);
            setSearchHistory([]);
        }
    }, []);

    // Handle clicks outside search component to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Find product matches as user types
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const allProducts = getAllProducts();

            // Find matching products
            const productMatches = allProducts
                .filter(
                    (product) =>
                        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (product.tags &&
                            product.tags.some((tag) =>
                                tag.toLowerCase().includes(searchQuery.toLowerCase())
                            ))
                )
                .slice(0, 3); // Limit to 3 products

            setMatchedProducts(productMatches);

            // Generate search suggestions based on popular terms or product categories
            const allTags = new Set();
            allProducts.forEach((product) => {
                if (product.tags) {
                    product.tags.forEach((tag) => {
                        if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
                            allTags.add(tag);
                        }
                    });
                }
            });

            // Get category suggestions too
            const categoryMatches = popularSearches.filter((term) =>
                term.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setSuggestions(
                [...Array.from(allTags).slice(0, 3), ...categoryMatches.slice(0, 2)].slice(0, 5)
            ); // Ensure we have max 5 suggestions
        } else {
            setSuggestions([]);
            setMatchedProducts([]);
        }
    }, [searchQuery, getAllProducts, popularSearches]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        submitSearch(searchQuery);
    };

    const submitSearch = (query) => {
        if (!query.trim()) return;

        // Add to search history
        const updatedHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(
            0,
            5
        );

        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

        // Navigate to search results
        navigate(`/products?search=${encodeURIComponent(query)}`);
        setIsExpanded(false);
    };

    const handleSearchItemClick = (query) => {
        setSearchQuery(query);
        submitSearch(query);
    };

    const handleProductClick = (slug) => {
        navigate(`/product/${slug}`);
        setIsExpanded(false);
    };

    const handleClearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    const handleSearchFocus = () => {
        setIsExpanded(true);
    };

    // Add explicit click handler to ensure dropdown opens on mobile
    const handleInputClick = () => {
        setIsExpanded(true);
    };

    const clearSearch = () => {
        setSearchQuery('');
        inputRef.current.focus();
    };

    return (
        <div className={cx('search-container')} ref={searchRef}>
            <form className={cx('search-form')} onSubmit={handleSearchSubmit}>
                <div className={cx('search-input-container')}>
                    <FontAwesomeIcon icon={faSearch} className={cx('search-icon')} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for products, brands, and more..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleSearchFocus}
                        onClick={handleInputClick}
                        className={cx('search-input')}
                    />
                    {searchQuery && (
                        <button type="button" className={cx('clear-search')} onClick={clearSearch}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>
                <button type="submit" className={cx('search-button')}>
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </form>

            {isExpanded && (
                <div className={cx('search-dropdown')}>
                    {/* Product matches - show when typing */}
                    {searchQuery.length >= 2 && matchedProducts.length > 0 && (
                        <div className={cx('search-section')}>
                            <div className={cx('section-header')}>
                                <h4>Products</h4>
                            </div>
                            <ul className={cx('product-list')}>
                                {matchedProducts.map((product) => (
                                    <li
                                        key={`product-${product.id}`}
                                        className={cx('product-item')}
                                        onClick={() => handleProductClick(product.slug)}
                                    >
                                        <div className={cx('product-image')}>
                                            <img
                                                src={product.thumbnail || product.images?.[0]}
                                                alt={product.name}
                                            />
                                        </div>
                                        <div className={cx('product-info')}>
                                            <span className={cx('product-name')}>
                                                {product.name}
                                            </span>
                                            <span className={cx('product-price')}>
                                                ${product.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Search suggestions - show when typing */}
                    {searchQuery.length >= 2 && suggestions.length > 0 && (
                        <div className={cx('search-section')}>
                            <div className={cx('section-header')}>
                                <h4>Suggestions</h4>
                            </div>
                            <ul className={cx('suggestion-list')}>
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={`suggestion-${index}`}
                                        className={cx('suggestion-item')}
                                        onClick={() => handleSearchItemClick(suggestion)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faSearch}
                                            className={cx('suggestion-icon')}
                                        />
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Search history - show when dropdown is opened without query */}
                    {searchQuery.length < 2 && searchHistory.length > 0 && (
                        <div className={cx('search-section')}>
                            <div className={cx('section-header')}>
                                <h4>Recent Searches</h4>
                                <button className={cx('clear-button')} onClick={handleClearHistory}>
                                    Clear
                                </button>
                            </div>
                            <ul className={cx('history-list')}>
                                {searchHistory.map((query, index) => (
                                    <li
                                        key={`history-${index}`}
                                        className={cx('history-item')}
                                        onClick={() => handleSearchItemClick(query)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faHistory}
                                            className={cx('history-icon')}
                                        />
                                        <span>{query}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Popular searches - show when dropdown is opened without query */}
                    {searchQuery.length < 2 && (
                        <div className={cx('search-section')}>
                            <div className={cx('section-header')}>
                                <h4>Popular Searches</h4>
                            </div>
                            <ul className={cx('popular-list')}>
                                {popularSearches.map((query, index) => (
                                    <li
                                        key={`popular-${index}`}
                                        className={cx('popular-item')}
                                        onClick={() => handleSearchItemClick(query)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faArrowTrendUp}
                                            className={cx('popular-icon')}
                                        />
                                        <span>{query}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Show message when no results */}
                    {searchQuery.length >= 2 &&
                        suggestions.length === 0 &&
                        matchedProducts.length === 0 && (
                            <div className={cx('no-results')}>
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className={cx('no-results-icon')}
                                />
                                <p>No suggestions found for "{searchQuery}"</p>
                            </div>
                        )}

                    {/* Show message when dropdown is empty */}
                    {searchQuery.length < 2 && searchHistory.length === 0 && (
                        <div className={cx('no-history')}>
                            <FontAwesomeIcon icon={faRandom} className={cx('no-history-icon')} />
                            <p>Try searching for products, brands, or categories</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
