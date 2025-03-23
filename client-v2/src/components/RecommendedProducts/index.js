import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './RecommendedProducts.module.scss';
import { useProducts } from '../../configs/ProductsData';
import WishlistButton from '../WishlistButton';

const cx = classNames.bind(styles);

// Number of products to display per page
const PRODUCTS_PER_PAGE = 12;

// Add this constant for fallback image - using a real image instead of text placeholder
const DEFAULT_IMAGE =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80';

const RecommendedProducts = () => {
    const { getRecommendedProducts, addToCart } = useProducts();
    const recommendedProducts = getRecommendedProducts();
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

    const handleAddToCart = (productId, event) => {
        event.preventDefault(); // Prevent navigating to product page
        addToCart(productId, 1);
    };

    return (
        <section className={cx('recommended-section')}>
            <div className={cx('section-header')}>
                <div className={cx('header-content')}>
                    <div className={cx('title-container')}>
                        <h2 className={cx('section-title')}>Gợi Ý Cho Bạn</h2>
                        <div className={cx('recommendation-icon')}>💫</div>
                    </div>
                    <p className={cx('section-subtitle')}>
                        Những sản phẩm bạn có thể thích dựa trên sở thích của bạn
                    </p>
                </div>
                <div className={cx('just-for-you')}>
                    <span className={cx('heart-icon')}>❤️</span>
                    <span>Dành riêng cho bạn</span>
                </div>
            </div>

            <div className={cx('products-grid')}>
                {currentProducts.map((product) => (
                    <div className={cx('product-card')} key={product.id}>
                        <Link
                            to={`/product/${product.slug}`}
                            className={cx('product-image-container')}
                        >
                            {product.discount > 0 && (
                                <div className={cx('discount-badge')}>-{product.discount}%</div>
                            )}
                            {product.isNew && <div className={cx('new-badge')}>Mới</div>}
                            <img
                                src={product.thumbnail || product.images?.[0] || DEFAULT_IMAGE}
                                alt={product.name}
                                className={cx('product-image')}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_IMAGE;
                                }}
                            />
                        </Link>
                        <div className={cx('product-info')}>
                            <Link to={`/product/${product.slug}`} className={cx('product-name')}>
                                {product.name}
                            </Link>

                            <div className={cx('product-price-container')}>
                                <span className={cx('product-price')}>
                                    ${product.price.toFixed(2)}
                                </span>
                                {product.originalPrice > product.price && (
                                    <span className={cx('original-price')}>
                                        ${Number(product.originalPrice).toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <div className={cx('product-stock')}>
                                <span className={cx('stock-info')}>{product.stock} trong kho</span>
                                <span className={cx('sold-info')}>{product.sold} đã bán</span>
                            </div>

                            <div className={cx('product-actions')}>
                                <button
                                    className={cx('add-to-cart-btn')}
                                    onClick={(e) => handleAddToCart(product.id, e)}
                                >
                                    Thêm vào giỏ hàng
                                </button>
                                <WishlistButton productId={product.id} />
                            </div>
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
                    &lt; Trước
                </button>

                {totalPages <= 5 ? (
                    // Show all pages if 5 or fewer
                    [...Array(totalPages).keys()].map((number) => (
                        <button
                            key={number + 1}
                            onClick={() => paginate(number + 1)}
                            className={cx('page-button', { active: number + 1 === currentPage })}
                        >
                            {number + 1}
                        </button>
                    ))
                ) : (
                    // Show limited pages with ellipsis if more than 5
                    <>
                        <button
                            onClick={() => paginate(1)}
                            className={cx('page-button', { active: 1 === currentPage })}
                        >
                            1
                        </button>

                        {currentPage > 3 && <span className={cx('page-ellipsis')}>...</span>}

                        {currentPage > 2 && (
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                className={cx('page-button')}
                            >
                                {currentPage - 1}
                            </button>
                        )}

                        {currentPage !== 1 && currentPage !== totalPages && (
                            <button
                                onClick={() => paginate(currentPage)}
                                className={cx('page-button', 'active')}
                            >
                                {currentPage}
                            </button>
                        )}

                        {currentPage < totalPages - 1 && (
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                className={cx('page-button')}
                            >
                                {currentPage + 1}
                            </button>
                        )}

                        {currentPage < totalPages - 2 && (
                            <span className={cx('page-ellipsis')}>...</span>
                        )}

                        <button
                            onClick={() => paginate(totalPages)}
                            className={cx('page-button', { active: totalPages === currentPage })}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    className={cx('page-button', 'next')}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                >
                    Sau &gt;
                </button>
            </div>

            <div className={cx('view-all-container')}>
                <Link to="/recommended-products" className={cx('view-all-button')}>
                    Xem Tất Cả Gợi Ý<span className={cx('arrow-icon')}>→</span>
                </Link>
            </div>
        </section>
    );
};

export default RecommendedProducts;
