import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './RecommendedProducts.module.scss';

const cx = classNames.bind(styles);

// Generate mock data for 60 recommended products
const generateRecommendedProducts = () => {
    const products = [];
    const categories = [
        'Electronics',
        'Home & Kitchen',
        'Fashion',
        'Beauty',
        'Sports',
        'Toys',
        'Books',
        'Health',
        'Automotive',
        'Pet Supplies'
    ];

    for (let i = 1; i <= 60; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = (Math.random() * 200 + 19.99).toFixed(2);

        products.push({
            id: i,
            name: `${category} Item ${i} - Recommended Product`,
            price: parseFloat(price),
            image: 'https://via.placeholder.com/300',
            slug: `recommended-product-${i}`,
            category
        });
    }

    return products;
};

const recommendedProducts = generateRecommendedProducts();

// Number of products to display per page
const PRODUCTS_PER_PAGE = 60;

const RecommendedProducts = () => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate total pages
    const totalPages = Math.ceil(recommendedProducts.length / PRODUCTS_PER_PAGE);

    // Get current products
    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
    const currentProducts = recommendedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Previous page
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Next page
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <section className={cx('recommended-section')}>
            <div className={cx('section-header')}>
                <div className={cx('header-content')}>
                    <div className={cx('title-container')}>
                        <h2 className={cx('section-title')}>Recommended For You</h2>
                        <div className={cx('recommendation-icon')}>💫</div>
                    </div>
                    <p className={cx('section-subtitle')}>
                        Products we think you'll love based on your preferences
                    </p>
                </div>
                <div className={cx('just-for-you')}>
                    <span className={cx('heart-icon')}>❤️</span>
                    <span>Personalized for you</span>
                </div>
            </div>

            <div className={cx('products-grid')}>
                {currentProducts.map((product) => (
                    <div className={cx('product-card')} key={product.id}>
                        <Link
                            to={`/product/${product.slug}`}
                            className={cx('product-image-container')}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className={cx('product-image')}
                            />
                        </Link>
                        <div className={cx('product-info')}>
                            <Link to={`/product/${product.slug}`} className={cx('product-name')}>
                                {product.name}
                            </Link>
                            <div className={cx('product-price')}>${product.price.toFixed(2)}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('pagination')}>
                <button
                    className={cx('page-button', 'prev')}
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                >
                    &lt; Prev
                </button>

                {[...Array(totalPages).keys()].map((number) => (
                    <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={cx('page-button', { active: number + 1 === currentPage })}
                    >
                        {number + 1}
                    </button>
                ))}

                <button
                    className={cx('page-button', 'next')}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next &gt;
                </button>
            </div>

            <div className={cx('view-all-container')}>
                <Link to="/recommended-products" className={cx('view-all-button')}>
                    View All Recommendations
                    <span className={cx('arrow-icon')}>→</span>
                </Link>
            </div>
        </section>
    );
};

export default RecommendedProducts;
