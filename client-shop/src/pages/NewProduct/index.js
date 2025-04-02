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

const cx = classNames.bind(styles);

function NewProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        product_name: '',
        product_description: '',
        product_cost: '',
        product_shop: '',
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

        // Set shop ID from authenticated user
        const getUserShopId = async () => {
            try {
                // In a real implementation, get from auth context or API
                const shopId = localStorage.getItem('shopId') || '123456789';
                setFormData((prev) => ({
                    ...prev,
                    product_shop: shopId
                }));
            } catch (error) {
                console.error('Error getting user shop ID:', error);
            }
        };

        getUserShopId();
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
        } else {
            // Handle other form field changes
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const formatFormDataForSubmission = () => {
        // Convert the product_attributes array format to match the API schema
        const formattedAttributes = formData.product_attributes.map((attr) => ({
            attr_name: attr.key,
            attr_value: attr.value
        }));

        // Format variations to match the schema
        const formattedVariations = formData.product_variations.map((variation) => ({
            variation_name: variation.name,
            variation_values: variation.options,
            variation_images: [] // You would add image handling here
        }));

        return {
            ...formData,
            product_attributes: formattedAttributes,
            product_variations: formattedVariations
        };
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

            // Format data for API submission
            const formattedData = formatFormDataForSubmission();

            // Submit the form data to the API
            const response = await axios.post(`${API_URL}/product`, formattedData);

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
