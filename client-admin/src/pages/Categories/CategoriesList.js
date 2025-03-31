import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaSpinner, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import axiosClient from '../../configs/axios';
import './Categories.css';

const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parentCategories, setParentCategories] = useState({});
    const [categoriesHierarchy, setCategoriesHierarchy] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});

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
        const rootCategories = categoriesList.filter(cat => !cat.category_parent);
        
        // Then build the tree recursively
        return rootCategories.map(rootCat => {
            return {
                ...rootCat,
                children: getChildCategories(categoriesList, rootCat._id)
            };
        });
    };

    // Get all child categories for a given parent ID
    const getChildCategories = (categoriesList, parentId) => {
        const children = categoriesList.filter(cat => 
            cat.category_parent && cat.category_parent === parentId
        );
        
        return children.map(child => ({
            ...child,
            children: getChildCategories(categoriesList, child._id)
        }));
    };

    const handleDeleteCategory = async (id) => {
        // This would be a real API call in production
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                // In a real app, this would be an API call
                // await axiosClient.delete(`/category/${id}`);

                // For now, we'll just remove it from state
                setCategories(categories.filter((category) => category._id !== id));
            } catch (err) {
                console.error('Error deleting category:', err);
                setError('Failed to delete category. Please try again.');
            }
        }
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Recursively render category rows
    const renderCategoryRows = (categories, level = 0) => {
        return categories.map((category) => (
            <React.Fragment key={category._id}>
                <tr className={level > 0 ? 'child-category' : ''}>
                    <td className="category-name">
                        <div style={{ paddingLeft: `${level * 20}px` }} className="category-name-container">
                            {category.children && category.children.length > 0 && (
                                <button 
                                    className="toggle-button"
                                    onClick={() => toggleCategory(category._id)}
                                >
                                    {expandedCategories[category._id] ? 
                                        <FaChevronDown /> : <FaChevronRight />}
                                </button>
                            )}
                            {category.category_name}
                        </div>
                    </td>
                    <td className="category-description">
                        {category.category_description || '-'}
                    </td>
                    <td className="category-parent">
                        {category.category_parent
                            ? parentCategories[category.category_parent] || '-'
                            : 'Root Category'}
                    </td>
                    <td className="category-count">
                        {category.category_product_count || 0}
                    </td>
                    <td className="category-actions">
                        <Link
                            to={`/categories/edit/${category._id}`}
                            className="edit-button"
                        >
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
                {expandedCategories[category._id] && category.children && category.children.length > 0 && 
                    renderCategoryRows(category.children, level + 1)
                }
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

            <div className="categories-list">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Parent</th>
                            <th>Products</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-categories">
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
