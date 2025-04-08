import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './RecommendedProducts.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../../configs/env.config';
import { addToCartThunk } from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { getAllSkuProducts } from '../../services/productApi';
import axios from '../../configs/axios';

const cx = classNames.bind(styles);

const PRODUCTS_PER_PAGE = 12;
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';

const RecommendedProducts = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await getAllSkuProducts();
                setProducts(data);
            } catch (err) {
                setError('Failed to load recommended products');
                toast.error('Không thể tải sản phẩm. Vui lòng thử lại sau!');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Calculate total pages
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

    // Get current products
    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

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

    const handleAddToCart = async (e, skuId) => {
        e.preventDefault();
        e.stopPropagation();
        setLoadingStates((prev) => ({ ...prev, [skuId]: true }));

        try {
            await dispatch(addToCartThunk(skuId)).unwrap();
            toast.success('Thêm vào giỏ hàng thành công!');
        } catch (err) {
            toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
            console.error('Error adding to cart:', err);
        }
    };

    const handleBuyNow = async (e, skuId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            // await addToCartThunk(skuId);
            navigate('/checkout');
        } catch (err) {
            toast.error('Không thể mua ngay. Vui lòng thử lại!');
            console.error('Error buying now:', err);
        }
    };

    if (loading) {
        return (
            <section className={cx('recommended-section')}>
                <div className={cx('section-header')}>
                    <h2 className={cx('section-title')}>Gợi Ý Cho Bạn</h2>
                </div>
                <div className={cx('loading')}>Đang tải sản phẩm...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={cx('recommended-section')}>
                <div className={cx('section-header')}>
                    <h2 className={cx('section-title')}>Gợi Ý Cho Bạn</h2>
                </div>
                <div className={cx('error')}>{error}</div>
            </section>
        );
    }

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
                    <div className={cx('product-card')} key={product._id}>
                        <Link
                            to={`/product/${product.sku._id}`}
                            className={cx('product-image-container')}
                        >
                            <img
                                src={`${API_URL}/media/${product.sku.sku_thumb}`}
                                alt={product.product_name}
                                className={cx('product-image')}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_IMAGE;
                                }}
                            />
                        </Link>
                        <div className={cx('product-info')}>
                            <Link to={`/product/${product.sku._id}`} className={cx('product-name')}>
                                {product.product_name}
                            </Link>

                            <div className={cx('product-price-container')}>
                                <span className={cx('product-price')}>
                                    {product.sku.sku_price.toLocaleString()}đ
                                </span>
                            </div>

                            <div className={cx('product-variations')}>
                                {product.sku.sku_value.map((attr, index) => (
                                    <span key={index} className={cx('variation-value')}>
                                        {attr.value}
                                    </span>
                                ))}
                            </div>

                            <div className={cx('product-stock')}>
                                <span className={cx('stock-info')}>
                                    {product.sku.sku_stock} trong kho
                                </span>
                            </div>

                            <div className={cx('product-actions')}>
                                <button
                                    className={cx('buy-now-btn')}
                                    onClick={(e) => handleBuyNow(e, product.sku._id)}
                                    disabled={product.sku.sku_stock === 0}
                                >
                                    <FontAwesomeIcon icon={faShoppingBag} className={cx('icon')} />
                                    Mua ngay
                                </button>
                                <button
                                    className={cx('add-to-cart-btn')}
                                    onClick={(e) => handleAddToCart(e, product.sku._id)}
                                    disabled={product.sku.sku_stock === 0}
                                    title="Thêm vào giỏ hàng"
                                >
                                    <FontAwesomeIcon icon={faCartPlus} className={cx('icon')} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button
                        className={cx('page-button', 'prev')}
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                    >
                        &lt; Trước
                    </button>

                    {totalPages <= 5 ? (
                        [...Array(totalPages).keys()].map((number) => (
                            <button
                                key={number + 1}
                                onClick={() => paginate(number + 1)}
                                className={cx('page-button', {
                                    active: number + 1 === currentPage
                                })}
                            >
                                {number + 1}
                            </button>
                        ))
                    ) : (
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
                                className={cx('page-button', {
                                    active: totalPages === currentPage
                                })}
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
            )}

            <div className={cx('view-all-container')}>
                <Link to="/products" className={cx('view-all-button')}>
                    Xem Tất Cả Sản Phẩm<span className={cx('arrow-icon')}>→</span>
                </Link>
            </div>
        </section>
    );
};

export default RecommendedProducts;
