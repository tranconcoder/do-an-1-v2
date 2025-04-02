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
import SKUManagement from './components/SKUManagement';
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
        product_attributes: [],
        product_variations: [],
        product_thumb: null,
        product_images: [],
        is_draft: true,
        is_publish: false,
        sku_list: [
            {
                sku_tier_idx: [],
                selected_options: {},
                thumb: null,
                images: [],
                sku_stock: 0,
                sku_price: ''
            }
        ]
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

    const prepareFormDataForSubmission = (data = formData) => {
        // Create a new FormData instance
        const formDataToSubmit = new FormData();

        // Add basic fields
        formDataToSubmit.append('product_name', data.product_name);
        formDataToSubmit.append('product_description', data.product_description);
        formDataToSubmit.append('product_cost', data.product_cost);
        formDataToSubmit.append('product_quantity', data.product_quantity);
        formDataToSubmit.append('product_category', data.product_category);
        formDataToSubmit.append('is_draft', data.is_draft);
        formDataToSubmit.append('is_publish', data.is_publish);

        // Add thumbnail image
        if (data.product_thumb && data.product_thumb.file) {
            formDataToSubmit.append('product_thumb', data.product_thumb.file);
        }

        // Add product images
        if (data.product_images && data.product_images.length > 0) {
            data.product_images.forEach((image) => {
                if (image.file) {
                    formDataToSubmit.append('product_images', image.file);
                }
            });
        }

        // Add attributes as array
        if (Array.isArray(data.product_attributes)) {
            data.product_attributes.forEach((attr, index) => {
                if (attr && attr.key && attr.value) {
                    formDataToSubmit.append(`product_attributes[${index}][attr_name]`, attr.key);
                    formDataToSubmit.append(`product_attributes[${index}][attr_value]`, attr.value);
                }
            });
        }

        // Add variations as array
        if (Array.isArray(data.product_variations)) {
            data.product_variations.forEach((variation, index) => {
                formDataToSubmit.append(
                    `product_variations[${index}][variation_name]`,
                    variation.name
                );
                variation.options.forEach((option, optIndex) => {
                    formDataToSubmit.append(
                        `product_variations[${index}][variation_values][${optIndex}]`,
                        option
                    );
                });
            });
        }

        // Add SKU information
        if (data.sku_list && data.sku_list.length > 0) {
            // Always initialize sku_images_map as an array with same length as sku_list
            const skuImagesMap = new Array(data.sku_list.length).fill(0);
            let hasSkuImages = false;

            // Add SKU thumbnails and data
            data.sku_list.forEach((sku, index) => {
                if (sku.thumb && sku.thumb.file) {
                    formDataToSubmit.append('sku_thumb', sku.thumb.file);
                }

                // Add SKU images
                if (sku.images && sku.images.length > 0) {
                    skuImagesMap[index] = sku.images.length;
                    hasSkuImages = true;

                    sku.images.forEach((image) => {
                        if (image.file) {
                            formDataToSubmit.append('sku_images', image.file);
                        }
                    });
                }

                // Add SKU data as array items
                formDataToSubmit.append(`sku_list[${index}][sku_tier_idx]`, sku.sku_tier_idx);
                formDataToSubmit.append(`sku_list[${index}][sku_stock]`, sku.sku_stock);
                formDataToSubmit.append(`sku_list[${index}][sku_price]`, sku.sku_price);
            });

            // Handle SKU images map
            if (hasSkuImages) {
                skuImagesMap.forEach((count, index) => {
                    formDataToSubmit.append(`sku_images_map[${index}]`, count);
                });
            } else {
                formDataToSubmit.append(
                    'sku_images',
                    new Blob([], { type: 'application/octet-stream' })
                );
                skuImagesMap.forEach((count, index) => {
                    formDataToSubmit.append(`sku_images_map[${index}]`, count);
                });
            }
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

            // Check if we have any SKUs with filled in data
            const hasFilledSkus = formData.sku_list.some(
                (sku) => sku.sku_price || sku.sku_stock > 0 || sku.thumb || sku.images.length > 0
            );

            let submissionData;

            // If no SKUs have data entered, create a default SKU from product info
            if (!hasFilledSkus) {
                const defaultSku = {
                    sku_tier_idx: [],
                    selected_options: {},
                    thumb: formData.product_thumb,
                    images: [...formData.product_images],
                    sku_stock: parseInt(formData.product_quantity) || 0,
                    sku_price: formData.product_cost || 0
                };

                submissionData = {
                    ...formData,
                    sku_list: [defaultSku]
                };

                console.log('Created default SKU from product info:', defaultSku);
            } else {
                submissionData = formData;
            }

            // Prepare FormData for submission with correct data
            const formDataToSubmit = prepareFormDataForSubmission(submissionData);

            // Submit the form data to the API
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

                        <SKUManagement formData={formData} setFormData={setFormData} />
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
