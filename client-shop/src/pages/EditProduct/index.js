import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectShopInfo } from '../../store/slices/shopSlice';
import { fetchWarehouses } from '../../store/slices/warehouseSlice';
import classNames from 'classnames/bind';
import styles from './EditProduct.module.scss';
import axios from 'axios';
import { API_URL } from '../../configs/env.config';
import BasicInformation from '../NewProduct/components/BasicInformation/index';
import ProductImages from '../NewProduct/components/ProductImages/index';
import PricingInventory from '../NewProduct/components/PricingInventory/index';
import ProductVariations from '../NewProduct/components/ProductVariations/index';
import ProductAttributes from '../NewProduct/components/ProductAttributes/index';
import ProductSummary from '../NewProduct/components/ProductSummary/index';
import SKUManagement from '../NewProduct/components/SKUManagement/index';
import axiosClient from '../../configs/axios';

const cx = classNames.bind(styles);

function EditProduct() {
    const navigate = useNavigate();
    const { spuId } = useParams();
    const dispatch = useDispatch();
    const shopInfo = useSelector(selectShopInfo);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        product_name: '',
        product_description: '',
        product_category: '',
        product_attributes: [],
        product_variations: [],
        product_thumb: null,
        product_images: [],
        is_draft: true,
        is_publish: false,
        sku_list: []
    });

    // Fetch warehouses when component mounts
    useEffect(() => {
        if (shopInfo?.shop_id) {
            dispatch(fetchWarehouses(shopInfo.shop_id));
        }
    }, [dispatch, shopInfo]);

    // Helper function to reconstruct selected_options from sku_tier_idx
    const reconstructSelectedOptions = (sku_tier_idx, variations) => {
        const selected_options = {};
        if (sku_tier_idx && variations) {
            sku_tier_idx.forEach((optionIndex, variationIndex) => {
                if (variationIndex < variations.length) {
                    selected_options[variationIndex] = optionIndex;
                }
            });
        }
        return selected_options;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialLoading(true);

                // Fetch categories and product data in parallel
                const [categoriesResponse, productResponse] = await Promise.all([
                    axios.get(`${API_URL}/category`),
                    axiosClient.get(`${API_URL}/spu/${spuId}`)
                ]);

                if (categoriesResponse.data && categoriesResponse.data.metadata) {
                    setCategories(categoriesResponse.data.metadata);
                }

                if (productResponse.data && productResponse.data.metadata) {
                    const productData = productResponse.data.metadata;
                    console.log('Loaded product data:', productData);

                    // Transform the product data to match the form structure
                    const transformedData = {
                        product_name: productData.product_name || '',
                        product_description: productData.product_description || '',
                        product_category: productData.product_category || '',
                        product_attributes:
                            productData.product_attributes?.map((attr) => ({
                                key: attr.attr_name,
                                value: attr.attr_value
                            })) || [],
                        product_variations:
                            productData.product_variations?.map((variation) => ({
                                name: variation.variation_name,
                                options: variation.variation_values || [],
                                images: variation.variation_images || []
                            })) || [],
                        product_thumb: productData.product_thumb
                            ? {
                                  id: productData.product_thumb,
                                  preview: `${API_URL}/media/${productData.product_thumb}`,
                                  file: null
                              }
                            : null,
                        product_images:
                            productData.product_images?.map((imageId) => ({
                                id: imageId,
                                preview: `${API_URL}/media/${imageId}`,
                                file: null
                            })) || [],
                        is_draft: productData.is_draft,
                        is_publish: productData.is_publish,
                        sku_list: []
                    };

                    // Transform SKU list with proper selected_options reconstruction
                    if (productData.sku_list && productData.sku_list.length > 0) {
                        transformedData.sku_list = productData.sku_list.map((sku) => {
                            const selected_options = reconstructSelectedOptions(
                                sku.sku_tier_idx,
                                transformedData.product_variations
                            );

                            return {
                                id: sku._id,
                                sku_tier_idx: sku.sku_tier_idx || [],
                                selected_options: selected_options,
                                thumb: sku.sku_thumb
                                    ? {
                                          id: sku.sku_thumb,
                                          preview: `${API_URL}/media/${sku.sku_thumb}`,
                                          file: null
                                      }
                                    : null,
                                images:
                                    sku.sku_images?.map((imageId) => ({
                                        id: imageId,
                                        preview: `${API_URL}/media/${imageId}`,
                                        file: null
                                    })) || [],
                                sku_stock: sku.sku_stock || 0,
                                sku_price: sku.sku_price?.toString() || '',
                                warehouse: sku.warehouse || ''
                            };
                        });
                    }

                    console.log('Transformed data for form:', transformedData);
                    setFormData(transformedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to load product data. Please try again.');
                navigate('/products');
            } finally {
                setInitialLoading(false);
            }
        };

        if (spuId) {
            fetchData();
        }
    }, [spuId, navigate]);

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
        if (name === 'product_attributes') {
            setFormData((prev) => ({
                ...prev,
                product_attributes: value
            }));
        } else if (name.startsWith('attr_')) {
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
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const prepareFormDataForSubmission = (data = formData) => {
        const formDataToSubmit = new FormData();

        // Add basic fields
        formDataToSubmit.append('product_name', data.product_name);
        formDataToSubmit.append('product_description', data.product_description);
        formDataToSubmit.append('product_category', data.product_category);
        formDataToSubmit.append('is_draft', data.is_draft);
        formDataToSubmit.append('is_publish', data.is_publish);

        // Add thumbnail image (only if it's a new file)
        if (data.product_thumb && data.product_thumb.file) {
            formDataToSubmit.append('product_thumb', data.product_thumb.file);
        }

        // Add product images (only new files)
        if (data.product_images && data.product_images.length > 0) {
            const newImages = data.product_images.filter((image) => image.file);
            newImages.forEach((image) => {
                formDataToSubmit.append('product_images', image.file);
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
            const isDefaultSku =
                data.sku_list.length === 1 &&
                data.sku_list[0].sku_tier_idx.length === 0 &&
                Object.keys(data.sku_list[0].selected_options).length === 0;

            if (!isDefaultSku) {
                const skuImagesMap = new Array(data.sku_list.length).fill(0);
                let hasSkuImages = false;

                // Add SKU thumbnails and images (only new files)
                data.sku_list.forEach((sku, index) => {
                    if (sku.thumb && sku.thumb.file) {
                        formDataToSubmit.append('sku_thumb', sku.thumb.file);
                    }

                    if (sku.images && sku.images.length > 0) {
                        const newImages = sku.images.filter((img) => img.file);
                        skuImagesMap[index] = newImages.length;
                        if (newImages.length > 0) {
                            hasSkuImages = true;
                        }
                    }
                });

                data.sku_list
                    .flatMap((sku) => sku.images.filter((img) => img.file))
                    .forEach((image) => {
                        formDataToSubmit.append('sku_images', image.file);
                    });

                if (hasSkuImages) {
                    skuImagesMap.forEach((count, index) => {
                        formDataToSubmit.append(`sku_images_map[${index}]`, count);
                    });
                }
            }

            // Add SKU data
            data.sku_list.forEach((sku, index) => {
                // Include SKU ID if it exists (for updating existing SKUs)
                if (sku.id) {
                    formDataToSubmit.append(`sku_list[${index}][id]`, sku.id);
                }
                sku.sku_tier_idx.forEach((tierIdx, i) => {
                    formDataToSubmit.append(`sku_list[${index}][sku_tier_idx][${i}]`, tierIdx);
                });
                formDataToSubmit.append(`sku_list[${index}][sku_stock]`, sku.sku_stock);
                formDataToSubmit.append(`sku_list[${index}][sku_price]`, sku.sku_price);
                formDataToSubmit.append(`sku_list[${index}][warehouse]`, sku.warehouse);
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

            // Check if we have at least one valid SKU
            const hasValidSku = formData.sku_list.some(
                (sku) => sku.sku_price && sku.sku_stock >= 0 && sku.thumb
            );

            if (!hasValidSku) {
                alert(
                    'Please add at least one SKU with price, stock quantity, and thumbnail image'
                );
                setLoading(false);
                return;
            }

            // Prepare FormData for submission
            const formDataToSubmit = prepareFormDataForSubmission(formData);

            // Submit the form data to the API
            const response = await axiosClient.put(`${API_URL}/spu/${spuId}`, formDataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.statusCode === 200) {
                alert('Product updated successfully!');
                navigate('/products');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className={cx('loading-container')}>
                <div className={cx('loading-spinner')}>Loading product data...</div>
            </div>
        );
    }

    return (
        <div className={cx('edit-product')}>
            <div className={cx('header')}>
                <h1>Edit Product</h1>
                <button
                    type="button"
                    className={cx('back-btn')}
                    onClick={() => navigate('/products')}
                >
                    ← Back to Products
                </button>
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
                </div>

                <div className={cx('footer-section')}>
                    <div className={cx('product-summary-container')}>
                        <ProductSummary formData={formData} />
                    </div>

                    <div className={cx('actions')}>
                        <button
                            type="button"
                            className={cx('draft-btn')}
                            onClick={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    is_draft: true,
                                    is_publish: false
                                }));
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
                                setFormData((prev) => ({
                                    ...prev,
                                    is_draft: false,
                                    is_publish: true
                                }));
                                document.querySelector('form').requestSubmit();
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditProduct;
