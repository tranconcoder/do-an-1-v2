import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Categories.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

// Update fallback image to a more reliable source or consider using a local image
const DEFAULT_CATEGORY_IMAGE = 'https://via.placeholder.com/300x200?text=Category';

const Categories = () => {
    const { getAllCategories } = useProducts();
    const categories = getAllCategories();

    // Add state to track loading images
    const [loadingImages, setLoadingImages] = useState({});

    // Handle image load error
    const handleImageError = (categoryId) => (e) => {
        console.error(`Failed to load image for category: ${categoryId}`);
        e.target.onerror = null;
        e.target.src = DEFAULT_CATEGORY_IMAGE;
    };

    // Handle image load success
    const handleImageLoad = (categoryId) => () => {
        setLoadingImages((prev) => ({ ...prev, [categoryId]: false }));
    };

    return (
        <section className={cx('categories-section')}>
            <div className={cx('section-header')}>
                <h2 className={cx('section-title')}>Danh Mục Sản Phẩm</h2>
                <p className={cx('section-subtitle')}>Khám phá đa dạng sản phẩm theo danh mục</p>
            </div>

            <div className={cx('categories-container')}>
                <div className={cx('categories-grid', 'compact-grid')}>
                    {categories.map((category) => (
                        <Link
                            to={`/products?category=${category.id}`}
                            className={cx('category-card', 'compact-card')}
                            key={category.id}
                        >
                            <div className={cx('category-content')}>
                                <div className={cx('category-icon-wrapper')}>
                                    <span className={cx('category-icon')}>{category.icon}</span>
                                </div>
                                <h3 className={cx('category-name', 'compact-name')}>
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;
