import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NewProduct.module.scss';

const cx = classNames.bind(styles);

function NewProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        comparePrice: '',
        sku: '',
        barcode: '',
        quantity: '',
        categories: [],
        images: [],
        variants: [],
        published: false
    });

    // Sample categories for demonstration
    const availableCategories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Clothing' },
        { id: 3, name: 'Home & Kitchen' },
        { id: 4, name: 'Books' },
        { id: 5, name: 'Toys & Games' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const categoryId = Number(value);

        if (checked) {
            setFormData((prev) => ({
                ...prev,
                categories: [...prev.categories, categoryId]
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                categories: prev.categories.filter((id) => id !== categoryId)
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Preview the images
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const removeImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.name || !formData.price) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log('Product data to submit:', formData);

            // On success, redirect to product list
            alert('Product created successfully!');
            navigate('/products');
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveAsDraft = () => {
        setFormData((prev) => ({
            ...prev,
            published: false
        }));
        handleSubmit({ preventDefault: () => {} });
    };

    return (
        <div className={cx('new-product')}>
            <div className={cx('header')}>
                <h1>Create New Product</h1>
                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('draft-btn')}
                        onClick={saveAsDraft}
                        disabled={loading}
                    >
                        Save as Draft
                    </button>
                    <button
                        type="button"
                        className={cx('submit-btn')}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </div>

            <form className={cx('product-form')} onSubmit={handleSubmit}>
                <div className={cx('form-layout')}>
                    <div className={cx('main-form')}>
                        <div className={cx('form-section')}>
                            <h2>Basic Information</h2>

                            <div className={cx('form-group')}>
                                <label htmlFor="name">Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                />
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Media</h2>
                            <div className={cx('image-upload')}>
                                <label htmlFor="images">Add Images</label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />

                                <div className={cx('image-previews')}>
                                    {formData.images.map((image, index) => (
                                        <div key={index} className={cx('image-preview-item')}>
                                            <img src={image.preview} alt={`Preview ${index}`} />
                                            <button
                                                type="button"
                                                className={cx('remove-image')}
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Pricing</h2>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="price">Price *</label>
                                    <div className={cx('price-input')}>
                                        <span className={cx('currency')}>$</span>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="comparePrice">Compare-at Price</label>
                                    <div className={cx('price-input')}>
                                        <span className={cx('currency')}>$</span>
                                        <input
                                            type="number"
                                            id="comparePrice"
                                            name="comparePrice"
                                            value={formData.comparePrice}
                                            onChange={handleInputChange}
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Inventory</h2>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="sku">SKU (Stock Keeping Unit)</label>
                                    <input
                                        type="text"
                                        id="sku"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="barcode">Barcode (ISBN, UPC, GTIN, etc.)</label>
                                    <input
                                        type="text"
                                        id="barcode"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="quantity">Quantity</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={cx('sidebar-form')}>
                        <div className={cx('form-section')}>
                            <h2>Product Status</h2>
                            <div className={cx('form-group')}>
                                <label className={cx('switch')}>
                                    <input
                                        type="checkbox"
                                        name="published"
                                        checked={formData.published}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                published: e.target.checked
                                            }))
                                        }
                                    />
                                    <span className={cx('slider')}></span>
                                    <span className={cx('status-text')}>
                                        {formData.published ? 'Published' : 'Draft'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Organization</h2>
                            <div className={cx('form-group')}>
                                <label className={cx('categories-label')}>Product Categories</label>
                                <div className={cx('categories-list')}>
                                    {availableCategories.map((category) => (
                                        <label
                                            key={category.id}
                                            className={cx('category-checkbox')}
                                        >
                                            <input
                                                type="checkbox"
                                                value={category.id}
                                                checked={formData.categories.includes(category.id)}
                                                onChange={handleCategoryChange}
                                            />
                                            {category.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default NewProduct;
