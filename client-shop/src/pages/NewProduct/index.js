import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NewProduct.module.scss';
import axios from 'axios';
import { API_URL } from '../../configs/env.config';
import BasicInformation from './components/BasicInformation';
import ProductImages from './components/ProductImages';
import PricingInventory from './components/PricingInventory';
import ProductVariations from './components/ProductVariations';
import ProductAttributes from './components/ProductAttributes';
import ProductSummary from './components/ProductSummary';
import axiosClient from '../../configs/axios';

const cx = classNames.bind(styles);

function NewProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        product_name: '',
        product_description: '',
        product_cost: '',
        product_quantity: 0,
        product_category: '',
        product_attributes: [], // Initialize as empty array
        product_variations: [],
        product_thumb: null,
        product_images: [],
        is_draft: true,
        is_publish: false,
        sku_list: []
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/category`);
                if (response.data && response.data.metadata) {
                    setCategories(response.data.metadata);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : Number(value);
        setFormData((prev) => ({
            ...prev,
            [name]: numValue
        }));
    };

    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        // Check if the change is for product_attributes
        if (name === 'product_attributes') {
            setFormData((prev) => ({
                ...prev,
                product_attributes: value
            }));
        } else if (name.startsWith('attr_')) {
            // Handle attribute updates coming from the ProductAttributes component
            // This assumes attributes are being added with a name like attr_key or attr_value
            const [prefix, index, field] = name.split('_');

            setFormData((prev) => {
                const updatedAttributes = [...(prev.product_attributes || [])];
                if (!updatedAttributes[index]) {
                    updatedAttributes[index] = { key: '', value: '' };
                }
                updatedAttributes[index][field] = value;
                return {
                    ...prev,
                    product_attributes: updatedAttributes
                };
            });
        } else {
            // Handle other form field changes
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const prepareFormDataForSubmission = () => {
        // Create a new FormData instance
        const formDataToSubmit = new FormData();

        // Add basic fields
        formDataToSubmit.append('product_name', formData.product_name);
        formDataToSubmit.append('product_description', formData.product_description);
        formDataToSubmit.append('product_cost', formData.product_cost);
        formDataToSubmit.append('product_quantity', formData.product_quantity);
        formDataToSubmit.append('product_category', formData.product_category);
        formDataToSubmit.append('is_draft', formData.is_draft);
        formDataToSubmit.append('is_publish', formData.is_publish);

        // Add thumbnail image
        if (formData.product_thumb && formData.product_thumb.file) {
            formDataToSubmit.append('product_thumb', formData.product_thumb.file);
        }

        // Add product images
        if (formData.product_images && formData.product_images.length > 0) {
            formData.product_images.forEach((image, index) => {
                if (image.file) {
                    formDataToSubmit.append(`product_images`, image.file);
                }
            });
        }

        // Add attributes as JSON string
        const formattedAttributes = Array.isArray(formData.product_attributes)
            ? formData.product_attributes
                  .filter((attr) => attr && attr.key && attr.value)
                  .map((attr) => ({
                      attr_name: attr.key,
                      attr_value: attr.value
                  }))
            : [];

        formDataToSubmit.append('product_attributes', JSON.stringify(formattedAttributes));

        // Add variations as JSON string
        const formattedVariations = Array.isArray(formData.product_variations)
            ? formData.product_variations.map((variation) => {
                  const formattedVariation = {
                      variation_name: variation.name,
                      variation_values: variation.options
                  };
                  return formattedVariation;
              })
            : [];

        formDataToSubmit.append('product_variations', JSON.stringify(formattedVariations));

        // Add variation images separately
        if (Array.isArray(formData.product_variations)) {
            formData.product_variations.forEach((variation, variationIndex) => {
                // Add variation thumbnail
                if (variation.thumb && variation.thumb.file) {
                    formDataToSubmit.append(`sku_thumb`, variation.thumb.file);
                }

                // Add variation images
                if (variation.images && variation.images.length > 0) {
                    variation.images.forEach((image) => {
                        formDataToSubmit.append(`sku_images`, image.file);
                    });
                }
            });
        }

        return formDataToSubmit;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Validate required fields
            if (
                !formData.product_name ||
                !formData.product_category ||
                !formData.product_description
            ) {
                alert('Please fill in all required fields');
                setLoading(false);
                return;
            }

            if (!formData.product_thumb) {
                alert('Thumbnail image is required');
                setLoading(false);
                return;
            }

            if (formData.product_images.length < 3) {
                alert('At least 3 additional product images are required');
                setLoading(false);
                return;
            }

            // Prepare FormData for submission
            const formDataToSubmit = prepareFormDataForSubmission();

            // Submit the form data to the API using FormData
            const response = await axiosClient.post(`${API_URL}/spu/create`, formDataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.statusCode === 201) {
                alert('Product created successfully!');
                navigate('/products');
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('new-product')}>
            <div className={cx('header')}>
                <h1>Create New Product</h1>
                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('draft-btn')}
                        onClick={() => {
                            setFormData((prev) => ({ ...prev, is_draft: true, is_publish: false }));
                            document.querySelector('form').requestSubmit();
                        }}
                        disabled={loading}
                    >
                        Save as Draft
                    </button>
                    <button
                        type="button"
                        className={cx('submit-btn')}
                        onClick={() => {
                            setFormData((prev) => ({ ...prev, is_draft: false, is_publish: true }));
                            document.querySelector('form').requestSubmit();
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Publishing...' : 'Publish Product'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={cx('product-form')}>
                <div className={cx('form-layout')}>
                    <div className={cx('main-form')}>
                        <BasicInformation
                            formData={formData}
                            categories={categories}
                            handleInputChange={handleInputChange}
                        />

                        <ProductImages formData={formData} setFormData={setFormData} />

                        <PricingInventory
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleNumberChange={handleNumberChange}
                        />

                        <ProductVariations formData={formData} setFormData={setFormData} />

                        <ProductAttributes
                            formData={formData}
                            handleAttributeChange={handleInputChange}
                        />
                    </div>

                    <div className={cx('sidebar-form')}>
                        <ProductSummary formData={formData} />
                    </div>
                </div>
            </form>
        </div>
    );
}

export default NewProduct;
