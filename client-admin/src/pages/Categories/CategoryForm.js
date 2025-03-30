import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import axiosClient from '../../configs/axios';
import './Categories.css';

const CategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        category_name: '',
        category_description: '',
        category_parent: '',
        category_icon: '' // This would typically be a media ID
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all categories for parent dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/category/');

                if (response.metadata && Array.isArray(response.metadata)) {
                    // Filter out the current category if in edit mode to avoid self-reference
                    const filteredCategories = isEditMode
                        ? response.metadata.filter((cat) => cat._id !== id)
                        : response.metadata;

                    setCategories(filteredCategories);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [id, isEditMode]);

    // If in edit mode, fetch the category details
    useEffect(() => {
        if (isEditMode) {
            const fetchCategoryDetails = async () => {
                try {
                    setLoading(true);
                    // In a real app, this would be a separate API endpoint
                    const response = await axiosClient.get('/category/');

                    if (response.metadata && Array.isArray(response.metadata)) {
                        const category = response.metadata.find((cat) => cat._id === id);

                        if (category) {
                            setFormData({
                                category_name: category.category_name || '',
                                category_description: category.category_description || '',
                                category_parent: category.category_parent || '',
                                category_icon: category.category_icon || ''
                            });
                        } else {
                            setError('Category not found');
                        }
                    }
                } catch (err) {
                    console.error('Error fetching category details:', err);
                    setError('Failed to load category details. Please try again later.');
                } finally {
                    setLoading(false);
                }
            };

            fetchCategoryDetails();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError(null);

            // Validation
            if (!formData.category_name.trim()) {
                setError('Category name is required');
                return;
            }

            // Prepare payload - omit empty strings for optional fields
            const payload = {
                category_name: formData.category_name,
                ...(formData.category_description && {
                    category_description: formData.category_description
                }),
                ...(formData.category_parent && {
                    category_parent: formData.category_parent
                }),
                ...(formData.category_icon && {
                    category_icon: formData.category_icon
                })
            };

            // In a real app, these would be actual API calls
            if (isEditMode) {
                // await axiosClient.put(`/category/${id}`, payload);
                console.log('Updated category', id, payload);
            } else {
                // await axiosClient.post('/category', payload);
                console.log('Created category', payload);
            }

            // Redirect back to categories list
            navigate('/categories');
        } catch (err) {
            console.error('Error saving category:', err);
            setError(err.response?.data?.message || 'Failed to save category. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="categories-loading">
                <FaSpinner className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h1>{isEditMode ? 'Edit Category' : 'Add New Category'}</h1>
                <p>
                    {isEditMode ? 'Update the category details' : 'Create a new product category'}
                </p>
            </div>

            {error && <div className="categories-error">{error}</div>}

            <form className="category-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="category_name">Category Name *</label>
                    <input
                        type="text"
                        id="category_name"
                        name="category_name"
                        className="form-control"
                        value={formData.category_name}
                        onChange={handleChange}
                        placeholder="Enter category name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category_description">Description</label>
                    <textarea
                        id="category_description"
                        name="category_description"
                        className="form-control"
                        value={formData.category_description}
                        onChange={handleChange}
                        placeholder="Enter category description"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category_parent">Parent Category</label>
                    <select
                        id="category_parent"
                        name="category_parent"
                        className="form-control"
                        value={formData.category_parent}
                        onChange={handleChange}
                    >
                        <option value="">-- None (Root Category) --</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.category_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="category_icon">Category Icon (Media ID)</label>
                    <input
                        type="text"
                        id="category_icon"
                        name="category_icon"
                        className="form-control"
                        value={formData.category_icon}
                        onChange={handleChange}
                        placeholder="Enter media ID for the icon"
                    />
                    <small className="form-text">
                        Note: This should be a valid Media ID from the media library.
                    </small>
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-button" disabled={submitting}>
                        {submitting ? (
                            <>
                                <FaSpinner className="spinner" />
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <FaSave />
                                {isEditMode ? 'Update Category' : 'Create Category'}
                            </>
                        )}
                    </button>
                    <Link to="/categories" className="cancel-button">
                        <FaTimes /> Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
