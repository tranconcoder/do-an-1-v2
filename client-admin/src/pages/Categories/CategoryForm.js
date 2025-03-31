import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaSpinner, FaUpload, FaImage, FaCrop, FaCheck, FaTags, FaLayerGroup, FaList } from 'react-icons/fa';
import Cropper from 'react-easy-crop';
import axiosClient from '../../configs/axios';
import { API_URL } from '../../configs/env.config';
import './Categories.css';

const CategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        category_name: '',
        category_description: '',
        category_parent: '',
        category_icon: '' // Using category_icon consistently
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [categoriesHierarchy, setCategoriesHierarchy] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    // Crop related states
    const [showCropModal, setShowCropModal] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSrc, setImageSrc] = useState('');

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

                    // Build the hierarchy for the dropdown
                    const hierarchy = buildCategoryHierarchy(filteredCategories);
                    setCategoriesHierarchy(hierarchy);
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

    // Recursively render category options with proper indentation
    const renderCategoryOptions = (categories, level = 0) => {
        return categories.map((category) => (
            <React.Fragment key={category._id}>
                <option value={category._id}>
                    {/* Add indentation based on level */}
                    {'\u00A0'.repeat(level * 4)}
                    {level > 0 ? '└─ ' : ''}
                    {category.category_name}
                </option>
                {category.children &&
                    category.children.length > 0 &&
                    renderCategoryOptions(category.children, level + 1)}
            </React.Fragment>
        ));
    };

    // If in edit mode, fetch the category details
    useEffect(() => {
        if (isEditMode) {
            const fetchCategoryDetails = async () => {
                try {
                    setLoading(true);
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

                            // If category has an icon, set the preview
                            if (category.category_icon) {
                                // Get the image URL from the server using API_URL from config
                                const imageUrl = `${API_URL}/media/${category.category_icon}`;
                                setImagePreview(imageUrl);
                            }
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if the file is an image
        if (!file.type.match('image.*')) {
            setError('Please select an image file (JPEG, PNG, etc.)');
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setImageFile(file);

        // Create a preview URL for the selected image
        const reader = new FileReader();
        reader.onloadend = () => {
            // Instead of setting preview directly, we open the crop modal
            setImageSrc(reader.result);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };

    const handleImageClick = () => {
        // Trigger the hidden file input when the image area is clicked
        fileInputRef.current.click();
    };

    // Cropper event handlers
    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const createCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        // Create a canvas element to draw the cropped image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Load the image to get its dimensions
        const image = new Image();
        image.src = imageSrc;

        return new Promise((resolve) => {
            image.onload = () => {
                // Set canvas dimensions to the cropped size (1:1 aspect ratio)
                canvas.width = croppedAreaPixels.width;
                canvas.height = croppedAreaPixels.height;

                // Draw the cropped image on the canvas
                ctx.drawImage(
                    image,
                    croppedAreaPixels.x,
                    croppedAreaPixels.y,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height,
                    0,
                    0,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height
                );

                // Convert the canvas to a Blob
                canvas.toBlob(
                    (blob) => {
                        // Create a File object from the Blob
                        const croppedFile = new File([blob], imageFile.name, {
                            type: 'image/jpeg',
                            lastModified: new Date().getTime()
                        });

                        // Set the cropped file and preview
                        setImageFile(croppedFile);
                        setImagePreview(URL.createObjectURL(blob));

                        // Close the crop modal
                        setShowCropModal(false);
                        resolve();
                    },
                    'image/jpeg',
                    0.95
                ); // JPEG format with 95% quality
            };
        });
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            setUploadProgress(0);

            const response = await axiosClient.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            });

            // Return the media ID from the response
            return response.metadata?._id || null;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            // Validation
            if (!formData.category_name.trim()) {
                setError('Category name is required');
                setSubmitting(false);
                return;
            }

            // Upload the image if a new file was selected
            let mediaId = formData.category_icon;
            if (imageFile) {
                mediaId = await uploadImage();
                if (!mediaId) {
                    setError('Failed to upload image. Please try again.');
                    setSubmitting(false);
                    return;
                }
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
                ...(mediaId && {
                    category_icon: mediaId
                })
            };

            // Make API calls
            if (isEditMode) {
                await axiosClient.put(`/category/${id}`, payload);
            } else {
                await axiosClient.post('/category/create', payload);
            }

            // Redirect back to categories list
            navigate('/categories');
        } catch (err) {
            console.error('Error saving category:', err);
            setError(err.response?.data?.message || 'Failed to save category. Please try again.');
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
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
            <div className="background-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-dot dot-1"></div>
                <div className="decoration-dot dot-2"></div>
                <div className="decoration-dot dot-3"></div>
                <div className="decoration-line line-1"></div>
                <div className="decoration-line line-2"></div>
            </div>
            
            <div className="categories-header">
                <h1>{isEditMode ? 'Edit Category' : 'Add New Category'}</h1>
                <p>
                    {isEditMode 
                        ? 'Update your category details to improve product organization and navigation' 
                        : 'Create a new product category to better organize your inventory and enhance customer navigation'}
                </p>
                <div className="category-icon-header">
                    <FaTags className="header-icon" />
                </div>
            </div>

            {error && (
                <div className="categories-error">
                    <div className="error-icon">⚠️</div>
                    {error}
                </div>
            )}

            <form className="category-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="category_name">
                        <FaList className="input-icon" /> Category Name *
                    </label>
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
                    <label htmlFor="category_description">
                        <FaList className="input-icon" /> Description
                    </label>
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
                    <label htmlFor="category_parent">
                        <FaLayerGroup className="input-icon" /> Parent Category
                    </label>
                    <select
                        id="category_parent"
                        name="category_parent"
                        className="form-control"
                        value={formData.category_parent}
                        onChange={handleChange}
                    >
                        <option value="">-- None (Root Category) --</option>
                        {renderCategoryOptions(categoriesHierarchy)}
                    </select>
                    <small className="form-text">
                        Select a parent category if this is a subcategory
                    </small>
                </div>

                <div className="form-group">
                    <label>
                        <FaImage className="input-icon" /> Category Icon (1:1 Ratio)
                    </label>
                    <div className="image-upload-container" onClick={handleImageClick}>
                        {imagePreview ? (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Category icon preview" />
                            </div>
                        ) : (
                            <div className="image-placeholder">
                                <FaImage />
                                <p>Click to upload an icon</p>
                                <span className="upload-hint">Drag and drop or click to browse</span>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="upload-progress">
                            <div
                                className="progress-bar"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                            <span>{uploadProgress}%</span>
                        </div>
                    )}

                    <small className="form-text">
                        The image will be cropped to a square (1:1 ratio) and should be less than
                        5MB.
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

            {/* Image Cropper Modal */}
            {showCropModal && (
                <div className="crop-modal">
                    <div className="crop-container">
                        <div className="crop-header">
                            <h3>Crop Image</h3>
                            <p>Adjust the crop to create a square icon</p>
                        </div>

                        <div className="cropper-container">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // 1:1 aspect ratio
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="crop-controls">
                            <div className="zoom-control">
                                <label>Zoom</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                />
                            </div>

                            <div className="crop-actions">
                                <button
                                    className="crop-cancel-button"
                                    onClick={() => {
                                        setShowCropModal(false);
                                        setImageFile(null);
                                        setImageSrc('');
                                    }}
                                >
                                    <FaTimes /> Cancel
                                </button>
                                <button className="crop-apply-button" onClick={createCroppedImage}>
                                    <FaCheck /> Apply Crop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryForm;
