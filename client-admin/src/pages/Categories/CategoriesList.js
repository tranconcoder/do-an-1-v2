import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaArrowUp,
    FaSpinner,
    FaChevronRight,
    FaChevronDown,
    FaImage,
    FaToggleOn,
    FaToggleOff,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import axiosClient from '../../configs/axios';
import './Categories.css';
import { API_URL } from '../../configs/env.config';

const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parentCategories, setParentCategories] = useState({});
    const [categoriesHierarchy, setCategoriesHierarchy] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [actionStatus, setActionStatus] = useState({ message: '', type: '' });

    // Fetch categories from the API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/category/');

                if (response.metadata && Array.isArray(response.metadata)) {
                    setCategories(response.metadata);

                    // Create a lookup object for parent categories
                    const parentLookup = {};
                    response.metadata.forEach((cat) => {
                        parentLookup[cat._id] = cat.category_name;
                    });
                    setParentCategories(parentLookup);

                    // Build hierarchical view of categories
                    const hierarchy = buildCategoryHierarchy(response.metadata);
                    setCategoriesHierarchy(hierarchy);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Build a hierarchical structure of categories
    const buildCategoryHierarchy = (categoriesList) => {
        // First, identify root categories (those without a parent or parent is null/empty)
        const rootCategories = categoriesList.filter((cat) => !cat.category_parent);

        // Then build the tree recursively
        return rootCategories.map((rootCat) => {
            return {
                ...rootCat,
                children: getChildCategories(categoriesList, rootCat._id)
            };
        });
    };

    // Get all child categories for a given parent ID
    const getChildCategories = (categoriesList, parentId) => {
        const children = categoriesList.filter(
            (cat) => cat.category_parent && cat.category_parent === parentId
        );

        return children.map((child) => ({
            ...child,
            children: getChildCategories(categoriesList, child._id)
        }));
    };

    const handleDeleteCategory = async (id) => {
        // This would be a real API call in production
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axiosClient.delete(`/category/${id}`);

                // Update state after successful deletion
                setCategories(categories.filter((category) => category._id !== id));

                // Rebuild hierarchy
                const updatedCategories = categories.filter((category) => category._id !== id);
                const hierarchy = buildCategoryHierarchy(updatedCategories);
                setCategoriesHierarchy(hierarchy);

                // Show success message
                setActionStatus({
                    message: 'Category deleted successfully',
                    type: 'success'
                });

                // Clear message after 3 seconds
                setTimeout(() => {
                    setActionStatus({ message: '', type: '' });
                }, 3000);
            } catch (err) {
                console.error('Error deleting category:', err);
                setError('Failed to delete category. Please try again.');
            }
        }
    };

    // Handle toggling category active status
    const handleToggleActive = async (category) => {
        try {
            const newActiveStatus = !category.is_active;

            // Make API call to update only the is_active status
            await axiosClient.patch(`/category/${category._id}`, {
                is_active: newActiveStatus
            });

            // Update the local state
            const updatedCategories = categories.map((cat) =>
                cat._id === category._id ? { ...cat, is_active: newActiveStatus } : cat
            );
            setCategories(updatedCategories);

            // Rebuild hierarchy
            const hierarchy = buildCategoryHierarchy(updatedCategories);
            setCategoriesHierarchy(hierarchy);

            // Show success message
            setActionStatus({
                message: `Category ${newActiveStatus ? 'activated' : 'deactivated'} successfully`,
                type: 'success'
            });

            // Clear message after 3 seconds
            setTimeout(() => {
                setActionStatus({ message: '', type: '' });
            }, 3000);
        } catch (err) {
            console.error('Error updating category status:', err);
            setActionStatus({
                message: 'Failed to update category status',
                type: 'error'
            });

            // Clear message after 3 seconds
            setTimeout(() => {
                setActionStatus({ message: '', type: '' });
            }, 3000);
        }
    };

    const toggleCategory = (categoryId, event) => {
        // Prevent the click from bubbling up to parent elements
        event.stopPropagation();

        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Get image URL for a category
    const getCategoryImageUrl = (category) => {
        if (!category.category_icon) return null;
        return `${API_URL}/media/${category.category_icon}`;
    };

    // Recursively render category rows with improved animation
    const renderCategoryRows = (categories, level = 0) => {
        return categories.map((category) => (
            <React.Fragment key={category._id}>
                <tr className={level > 0 ? 'child-category' : ''}>
                    <td className="category-name">
                        <div
                            style={{ paddingLeft: `${level * 20}px` }}
                            className="category-name-container"
                        >
                            {category.children && category.children.length > 0 && (
                                <button
                                    className="toggle-button"
                                    onClick={(e) => toggleCategory(category._id, e)}
                                    aria-label={
                                        expandedCategories[category._id] ? 'Collapse' : 'Expand'
                                    }
                                >
                                    {expandedCategories[category._id] ? (
                                        <FaChevronDown style={{ transform: 'rotate(0deg)' }} />
                                    ) : (
                                        <FaChevronRight style={{ transform: 'rotate(0deg)' }} />
                                    )}
                                </button>
                            )}
                            {/* Add extra padding for child categories without children */}
                            {level > 0 &&
                                (!category.children || category.children.length === 0) && (
                                    <div style={{ width: '24px', marginRight: '8px' }}></div>
                                )}

                            <div className="category-image-name">
                                {category.category_icon ? (
                                    <div className="category-image">
                                        <img
                                            src={getCategoryImageUrl(category)}
                                            alt={category.category_name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '';
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="image-fallback" style={{ display: 'none' }}>
                                            <FaImage />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="category-image no-image">
                                        <FaImage />
                                    </div>
                                )}
                                <span>{category.category_name}</span>
                            </div>
                        </div>
                    </td>
                    <td className="category-description">{category.category_description || '-'}</td>
                    <td className="category-parent">
                        {category.category_parent
                            ? parentCategories[category.category_parent] || '-'
                            : 'Root Category'}
                    </td>
                    <td className="category-count">{category.category_product_count || 0}</td>
                    <td className="category-status">
                        <span
                            className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}
                        >
                            {category.is_active ? (
                                <>
                                    <FaCheck className="status-icon" />
                                    Active
                                </>
                            ) : (
                                <>
                                    <FaTimes className="status-icon" />
                                    Inactive
                                </>
                            )}
                        </span>
                    </td>
                    <td className="category-actions">
                        <button
                            className={`toggle-active-button ${
                                category.is_active ? 'active' : 'inactive'
                            }`}
                            onClick={() => handleToggleActive(category)}
                            title={category.is_active ? 'Deactivate Category' : 'Activate Category'}
                        >
                            {category.is_active ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <Link to={`/categories/edit/${category._id}`} className="edit-button">
                            <FaEdit />
                        </Link>
                        <button
                            className="delete-button"
                            onClick={() => handleDeleteCategory(category._id)}
                        >
                            <FaTrash />
                        </button>
                        {category.category_level > 0 && (
                            <button className="move-up-button">
                                <FaArrowUp />
                            </button>
                        )}
                    </td>
                </tr>
                {/* Render children with animation container */}
                {category.children && category.children.length > 0 && (
                    <tr className="category-children-row">
                        <td colSpan="6" className="p-0">
                            <div
                                className={`category-children-container ${
                                    expandedCategories[category._id] ? 'expanded' : 'collapsed'
                                }`}
                            >
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        {renderCategoryRows(category.children, level + 1)}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        ));
    };

    if (loading) {
        return (
            <div className="categories-loading">
                <FaSpinner className="spinner" />
                <p>Loading categories...</p>
            </div>
        );
    }

    if (error) {
        return <div className="categories-error">{error}</div>;
    }

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h1>Categories Management</h1>
                <p>Manage product categories for your e-commerce platform</p>

                <Link to="/categories/new" className="add-category-button">
                    <FaPlus /> Add New Category
                </Link>
            </div>

            {actionStatus.message && (
                <div className={`action-status ${actionStatus.type}`}>{actionStatus.message}</div>
            )}

            <div className="categories-list">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Parent</th>
                            <th>Products</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-categories">
                                    No categories found. Create your first category.
                                </td>
                            </tr>
                        ) : (
                            renderCategoryRows(categoriesHierarchy)
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesList;
