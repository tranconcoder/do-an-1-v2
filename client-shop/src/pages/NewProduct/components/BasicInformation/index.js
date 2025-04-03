import React from 'react';
import classNames from 'classnames/bind';
import styles from './BasicInformation.module.scss';

const cx = classNames.bind(styles);

function BasicInformation({ formData, categories, handleInputChange }) {
    // Recursively render nested categories
    const renderCategoryOptions = (categoriesLevel, level = 0) => {
        if (!Array.isArray(categoriesLevel)) return null;

        return categoriesLevel.map((category) => {
            const hasChildren =
                Array.isArray(categoriesLevel) &&
                categories.some((c) => c.category_parent === category._id);
            return (
                <React.Fragment key={category._id}>
                    <option value={category._id}>
                        {'\u00A0'.repeat(level * 4)}
                        {level > 0 ? '└─ ' : ''}
                        {category.category_name}
                    </option>
                    {hasChildren &&
                        renderCategoryOptions(
                            categories.filter((c) => c.category_parent === category._id),
                            level + 1
                        )}
                </React.Fragment>
            );
        });
    };

    // Get root categories (those without a parent)
    const rootCategories = Array.isArray(categories)
        ? categories.filter((category) => !category.category_parent)
        : [];

    return (
        <div className={cx('form-section')}>
            <h2>Basic Information</h2>
            <div className={cx('form-group')}>
                <label>
                    Product Name <span className={cx('required-mark')}>*</span>
                </label>
                <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className={cx('form-group')}>
                <label>
                    Category <span className={cx('required-mark')}>*</span>
                </label>
                <select
                    name="product_category"
                    value={formData.product_category}
                    onChange={handleInputChange}
                    required
                    className={cx('category-select')}
                >
                    <option value="">Select a category</option>
                    {renderCategoryOptions(rootCategories)}
                </select>
            </div>

            <div className={cx('form-group')}>
                <label>
                    Description <span className={cx('required-mark')}>*</span>
                </label>
                <textarea
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                ></textarea>
            </div>
        </div>
    );
}

export default BasicInformation;
