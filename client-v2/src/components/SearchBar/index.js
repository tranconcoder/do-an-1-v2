import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './SearchBar.module.scss';
import SearchIcon from '../../assets/icons/SearchIcon';

const cx = classNames.bind(styles);

// Sample search suggestions - replace with actual API data in production
const suggestionsByQuery = {
    phone: ['iPhone 13', 'Samsung Galaxy', 'Google Pixel', 'Phone cases'],
    laptop: ['MacBook Pro', 'Dell XPS', 'HP Spectre', 'Laptop accessories'],
    watch: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitness trackers', 'Watch bands'],
    headphone: ['Sony WH-1000XM4', 'AirPods Pro', 'Bose QuietComfort', 'Wireless earbuds'],
    camera: ['Canon EOS', 'Sony Alpha', 'Nikon D850', 'Camera lenses']
};

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load search history from localStorage on component mount
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setSearchHistory(history);
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

    // Update suggestions when search query changes
    useEffect(() => {
        if (searchQuery.length > 1) {
            // Find matching suggestions from our sample data
            const matchingQueries = Object.keys(suggestionsByQuery).filter((key) =>
                key.includes(searchQuery.toLowerCase())
            );

            // Collect all suggestions for matching queries
            let matchingSuggestions = [];
            matchingQueries.forEach((query) => {
                matchingSuggestions = [...matchingSuggestions, ...suggestionsByQuery[query]];
            });

            // Filter out duplicates and limit to 5 suggestions
            setSuggestions([...new Set(matchingSuggestions)].slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Add to search history
            const updatedHistory = [
                searchQuery,
                ...searchHistory.filter((item) => item !== searchQuery)
            ].slice(0, 5);

            setSearchHistory(updatedHistory);
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

            // Navigate to search results
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsExpanded(false);
        }
    };

    const handleSearchItemClick = (query) => {
        setSearchQuery(query);
        setIsExpanded(false);

        // Add to search history
        const updatedHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(
            0,
            5
        );

        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

        // Navigate to search results
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleClearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    // Show search history immediately when clicked, even without text
    const handleSearchFocus = () => {
        setIsExpanded(true);
    };

    // Add explicit click handler to ensure dropdown opens on mobile
    const handleInputClick = () => {
        setIsExpanded(true);
    };

    return (
        <div className={cx('search-container')} ref={searchRef}>
            <form className={cx('search-form')} onSubmit={handleSearchSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onClick={handleInputClick}
                    className={cx('search-input')}
                />
                <button type="submit" className={cx('search-button')} aria-label="Search">
                    <SearchIcon />
                </button>
            </form>

            {isExpanded && (
                <div className={cx('search-dropdown')}>
                    {/* Search history - show when dropdown is expanded but no query */}
                    {searchHistory.length > 0 && !searchQuery && (
                        <div className={cx('search-section')}>
                            <div className={cx('search-section-header')}>
                                <h4>Recent Searches</h4>
                                <button className={cx('clear-button')} onClick={handleClearHistory}>
                                    Clear
                                </button>
                            </div>
                            <ul className={cx('search-list')}>
                                {searchHistory.map((query, index) => (
                                    <li
                                        key={`history-${index}`}
                                        className={cx('search-item')}
                                        onClick={() => handleSearchItemClick(query)}
                                    >
                                        <span className={cx('item-icon', 'history-icon')}>⏱️</span>
                                        {query}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Search suggestions - show only when typing */}
                    {searchQuery.length > 1 && suggestions.length > 0 && (
                        <div className={cx('search-section')}>
                            <div className={cx('search-section-header')}>
                                <h4>Suggestions</h4>
                            </div>
                            <ul className={cx('search-list')}>
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={`suggestion-${index}`}
                                        className={cx('search-item')}
                                        onClick={() => handleSearchItemClick(suggestion)}
                                    >
                                        <span className={cx('item-icon', 'suggestion-icon')}>
                                            🔍
                                        </span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Show message when no results */}
                    {searchQuery.length > 1 && suggestions.length === 0 && (
                        <div className={cx('no-results')}>
                            No suggestions found for "{searchQuery}"
                        </div>
                    )}

                    {/* Show message when dropdown is empty */}
                    {!searchQuery && searchHistory.length === 0 && (
                        <div className={cx('no-results')}>No recent searches</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
