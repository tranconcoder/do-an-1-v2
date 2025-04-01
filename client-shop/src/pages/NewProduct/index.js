import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NewProduct.module.scss';
import axios from 'axios';
import { FaTimes, FaUpload } from 'react-icons/fa';

const cx = classNames.bind(styles);

function NewProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState({
        product_name: '',
        product_description: '',
        product_cost: '',
        product_shop: '', // Will be filled with user's shop ID from auth
        product_quantity: 0,
        product_category: '',
        product_attributes: {}, // Will be dynamically filled based on category
        product_variations: [], // For variations (color, size, etc.)
        product_thumb: null, // For main product image
        product_images: [], // For additional product images
        is_draft: true,
        is_publish: false,
        sku_list: [] // For SKU variations
    });

    // Load categories on page load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                // In a real implementation, this would fetch from your API
                const response = await axios.get('/api/categories');
                setCategories(response.data || []);
            } catch (error) {
                console.error('Error loading categories:', error);
                // Fallback sample categories for demonstration
                setCategories([
                    {
                        _id: '1',
                        category_name: 'Điện tử',
                        category_description: 'Các sản phẩm điện tử'
                    },
                    {
                        _id: '2',
                        category_name: 'Thời trang',
                        category_description: 'Quần áo, giày dép'
                    },
                    {
                        _id: '3',
                        category_name: 'Nhà cửa & Đời sống',
                        category_description: 'Đồ gia dụng'
                    },
                    {
                        _id: '4',
                        category_name: 'Sách',
                        category_description: 'Sách và tài liệu học tập'
                    },
                    {
                        _id: '5',
                        category_name: 'Đồ chơi & Trò chơi',
                        category_description: 'Đồ chơi trẻ em'
                    }
                ]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();

        // Also set the shop ID from authenticated user
        const getUserShopId = async () => {
            try {
                // In a real implementation, get from auth context or API
                const shopId = localStorage.getItem('shopId') || '123456789'; // Example ID
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

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;

        // Reset product attributes when category changes
        setFormData((prev) => ({
            ...prev,
            product_category: categoryId,
            product_attributes: {}
        }));

        // In a real implementation, you would fetch category-specific attributes here
        // and update the form accordingly
    };

    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            product_attributes: {
                ...prev.product_attributes,
                [name]: value
            }
        }));
    };

    const handleThumbUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setFormData((prev) => ({
                ...prev,
                product_thumb: {
                    file,
                    preview: reader.result,
                    name: file.name
                }
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newImages = files.map((file) => {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = () => {
                    resolve({
                        file,
                        preview: reader.result,
                        name: file.name
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newImages).then((images) => {
            setFormData((prev) => ({
                ...prev,
                product_images: [...prev.product_images, ...images]
            }));
        });
    };

    const removeThumbImage = () => {
        setFormData((prev) => ({
            ...prev,
            product_thumb: null
        }));
    };

    const removeImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            product_images: prev.product_images.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Add a variation option to the product (e.g., color, size)
    const addVariation = () => {
        const newVariation = {
            name: '',
            options: ['']
        };

        setFormData((prev) => ({
            ...prev,
            product_variations: [...prev.product_variations, newVariation]
        }));
    };

    // Update variation info
    const updateVariation = (index, field, value) => {
        const newVariations = [...formData.product_variations];
        newVariations[index][field] = value;

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    // Add an option to a variation
    const addOptionToVariation = (variationIndex) => {
        const newVariations = [...formData.product_variations];
        newVariations[variationIndex].options.push('');

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    // Update a specific option within a variation
    const updateVariationOption = (variationIndex, optionIndex, value) => {
        const newVariations = [...formData.product_variations];
        newVariations[variationIndex].options[optionIndex] = value;

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    // Remove an option from a variation
    const removeOptionFromVariation = (variationIndex, optionIndex) => {
        const newVariations = [...formData.product_variations];
        newVariations[variationIndex].options.splice(optionIndex, 1);

        setFormData((prev) => ({
            ...prev,
            product_variations: newVariations
        }));
    };

    // Remove an entire variation
    const removeVariation = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            product_variations: prev.product_variations.filter(
                (_, index) => index !== indexToRemove
            )
        }));
    };

    // Generate SKUs based on all possible combinations of variations
    const generateSkuList = () => {
        const variations = formData.product_variations;
        if (!variations.length) return [];

        // Helper function to get all combinations
        const getCombinations = (arrays, current = [], index = 0) => {
            if (index === arrays.length) {
                return [current];
            }

            return arrays[index].reduce((acc, option) => {
                return [...acc, ...getCombinations(arrays, [...current, option], index + 1)];
            }, []);
        };

        const options = variations.map((v) => v.options);
        const combinations = getCombinations(options);

        // Create SKU objects for each combination
        return combinations.map((combination) => {
            // Create a name combining the options (e.g., "Red-Large")
            const sku_name = combination.join('-');

            // Create an object mapping variation names to selected options
            const attributes = {};
            variations.forEach((variation, index) => {
                attributes[variation.name] = combination[index];
            });

            return {
                sku_name,
                sku_price: formData.product_cost,
                sku_stock: Math.floor(formData.product_quantity / combinations.length),
                attributes
            };
        });
    };

    const validateForm = () => {
        if (!formData.product_name.trim()) {
            alert('Vui lòng nhập tên sản phẩm');
            return false;
        }

        if (!formData.product_category) {
            alert('Vui lòng chọn danh mục sản phẩm');
            return false;
        }

        if (Number(formData.product_cost) <= 0) {
            alert('Giá sản phẩm phải lớn hơn 0');
            return false;
        }

        if (Number(formData.product_quantity) <= 0) {
            alert('Số lượng sản phẩm phải lớn hơn 0');
            return false;
        }

        if (!formData.product_thumb) {
            alert('Vui lòng tải lên hình ảnh chính cho sản phẩm');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Generate SKUs if there are variations
            const sku_list =
                formData.product_variations.length > 0
                    ? generateSkuList()
                    : [
                          {
                              sku_name: formData.product_name,
                              sku_price: formData.product_cost,
                              sku_stock: formData.product_quantity,
                              attributes: {}
                          }
                      ];

            // Prepare data for submission
            const productData = {
                ...formData,
                sku_list
            };

            // In a real implementation, we'd handle file uploads here
            // and send the URLs in the request

            console.log('Submitting product data:', productData);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Success message
            alert(
                `Sản phẩm "${formData.product_name}" đã được ${
                    formData.is_publish ? 'đăng thành công!' : 'lưu nháp!'
                }`
            );

            // Redirect to product list
            navigate('/products');
        } catch (error) {
            console.error('Error submitting product:', error);
            alert('Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const saveAsDraft = () => {
        setFormData((prev) => ({
            ...prev,
            is_draft: true,
            is_publish: false
        }));
        handleSubmit();
    };

    const publishProduct = () => {
        setFormData((prev) => ({
            ...prev,
            is_draft: false,
            is_publish: true
        }));
        handleSubmit();
    };

    return (
        <div className={cx('new-product')}>
            <div className={cx('header')}>
                <h1>Tạo Sản Phẩm Mới</h1>
                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('draft-btn')}
                        onClick={saveAsDraft}
                        disabled={loading}
                    >
                        {loading && formData.is_draft ? 'Đang lưu...' : 'Lưu Nháp'}
                    </button>
                    <button
                        type="button"
                        className={cx('submit-btn')}
                        onClick={publishProduct}
                        disabled={loading}
                    >
                        {loading && formData.is_publish ? 'Đang đăng...' : 'Đăng Sản Phẩm'}
                    </button>
                </div>
            </div>

            <form
                className={cx('product-form')}
                onSubmit={(e) => {
                    e.preventDefault();
                    publishProduct();
                }}
            >
                <div className={cx('form-layout')}>
                    <div className={cx('main-form')}>
                        {/* Basic Information */}
                        <div className={cx('form-section')}>
                            <h2>Thông Tin Cơ Bản</h2>

                            <div className={cx('form-group')}>
                                <label htmlFor="product_name">Tên Sản Phẩm *</label>
                                <input
                                    type="text"
                                    id="product_name"
                                    name="product_name"
                                    value={formData.product_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="product_description">Mô Tả Sản Phẩm</label>
                                <textarea
                                    id="product_description"
                                    name="product_description"
                                    value={formData.product_description}
                                    onChange={handleInputChange}
                                    rows={5}
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="product_category">Danh Mục Sản Phẩm *</label>
                                <select
                                    id="product_category"
                                    name="product_category"
                                    value={formData.product_category}
                                    onChange={handleCategoryChange}
                                    required
                                    className={cx('category-select')}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Images */}
                        <div className={cx('form-section')}>
                            <h2>Hình Ảnh Sản Phẩm</h2>

                            {/* Main product image (thumbnail) */}
                            <div className={cx('form-group')}>
                                <label htmlFor="product_thumb">Hình Ảnh Chính *</label>
                                <div className={cx('upload-container')}>
                                    {!formData.product_thumb ? (
                                        <div className={cx('upload-box')}>
                                            <input
                                                type="file"
                                                id="product_thumb"
                                                accept="image/*"
                                                onChange={handleThumbUpload}
                                                className={cx('file-input')}
                                            />
                                            <div className={cx('upload-placeholder')}>
                                                <FaUpload className={cx('upload-icon')} />
                                                <span>Tải lên hình ảnh chính</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={cx('image-preview')}>
                                            <img
                                                src={formData.product_thumb.preview}
                                                alt="Hình ảnh chính"
                                            />
                                            <button
                                                type="button"
                                                className={cx('remove-image')}
                                                onClick={removeThumbImage}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional product images */}
                            <div className={cx('form-group')}>
                                <label htmlFor="product_images">Hình Ảnh Phụ (tối đa 5 hình)</label>
                                <div className={cx('upload-container')}>
                                    <div className={cx('images-grid')}>
                                        {formData.product_images.map((image, index) => (
                                            <div key={index} className={cx('image-preview')}>
                                                <img
                                                    src={image.preview}
                                                    alt={`Hình ảnh ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    className={cx('remove-image')}
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}

                                        {formData.product_images.length < 5 && (
                                            <div className={cx('upload-box')}>
                                                <input
                                                    type="file"
                                                    id="product_images"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImagesUpload}
                                                    className={cx('file-input')}
                                                />
                                                <div className={cx('upload-placeholder')}>
                                                    <FaUpload className={cx('upload-icon')} />
                                                    <span>Thêm hình ảnh</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing and Inventory */}
                        <div className={cx('form-section')}>
                            <h2>Giá & Kho Hàng</h2>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="product_cost">Giá Bán *</label>
                                    <div className={cx('price-input')}>
                                        <span className={cx('currency')}>₫</span>
                                        <input
                                            type="number"
                                            id="product_cost"
                                            name="product_cost"
                                            value={formData.product_cost}
                                            onChange={handleNumberChange}
                                            min="0"
                                            step="1000"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="product_quantity">Số Lượng *</label>
                                    <input
                                        type="number"
                                        id="product_quantity"
                                        name="product_quantity"
                                        value={formData.product_quantity}
                                        onChange={handleNumberChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Variations */}
                        <div className={cx('form-section')}>
                            <h2>Biến Thể Sản Phẩm</h2>
                            <p className={cx('section-description')}>
                                Thêm các biến thể như màu sắc, kích thước để tạo các phiên bản khác
                                nhau của sản phẩm
                            </p>

                            {formData.product_variations.map((variation, variationIndex) => (
                                <div key={variationIndex} className={cx('variation-container')}>
                                    <div className={cx('variation-header')}>
                                        <div className={cx('form-group', 'variation-name')}>
                                            <label>Tên Biến Thể</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Màu sắc, Kích cỡ"
                                                value={variation.name}
                                                onChange={(e) =>
                                                    updateVariation(
                                                        variationIndex,
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className={cx('remove-variation')}
                                            onClick={() => removeVariation(variationIndex)}
                                        >
                                            <FaTimes /> Xóa Biến Thể
                                        </button>
                                    </div>

                                    <div className={cx('options-container')}>
                                        <label>Tùy Chọn</label>
                                        {variation.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className={cx('option-row')}>
                                                <input
                                                    type="text"
                                                    placeholder={`Tùy chọn ${optionIndex + 1}`}
                                                    value={option}
                                                    onChange={(e) =>
                                                        updateVariationOption(
                                                            variationIndex,
                                                            optionIndex,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    className={cx('remove-option')}
                                                    onClick={() =>
                                                        removeOptionFromVariation(
                                                            variationIndex,
                                                            optionIndex
                                                        )
                                                    }
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className={cx('add-option')}
                                            onClick={() => addOptionToVariation(variationIndex)}
                                        >
                                            + Thêm Tùy Chọn
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                className={cx('add-variation')}
                                onClick={addVariation}
                            >
                                + Thêm Biến Thể
                            </button>
                        </div>

                        {/* Product Attributes - Only show when category is selected */}
                        {formData.product_category && (
                            <div className={cx('form-section')}>
                                <h2>Thuộc Tính Sản Phẩm</h2>
                                <p className={cx('section-description')}>
                                    Thêm thông số kỹ thuật và đặc điểm của sản phẩm
                                </p>

                                <div className={cx('attributes-container')}>
                                    {/* Sample attribute fields - in real app, these would be dynamic based on category */}
                                    <div className={cx('form-group')}>
                                        <label htmlFor="brand">Thương Hiệu</label>
                                        <input
                                            type="text"
                                            id="brand"
                                            name="brand"
                                            value={formData.product_attributes.brand || ''}
                                            onChange={handleAttributeChange}
                                        />
                                    </div>

                                    <div className={cx('form-group')}>
                                        <label htmlFor="material">Chất Liệu</label>
                                        <input
                                            type="text"
                                            id="material"
                                            name="material"
                                            value={formData.product_attributes.material || ''}
                                            onChange={handleAttributeChange}
                                        />
                                    </div>

                                    <div className={cx('form-group')}>
                                        <label htmlFor="origin">Xuất Xứ</label>
                                        <input
                                            type="text"
                                            id="origin"
                                            name="origin"
                                            value={formData.product_attributes.origin || ''}
                                            onChange={handleAttributeChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className={cx('sidebar-form')}>
                        <div className={cx('form-section')}>
                            <h2>Trạng Thái Sản Phẩm</h2>
                            <div className={cx('status-options')}>
                                <div className={cx('status-option')}>
                                    <input
                                        type="radio"
                                        id="status-draft"
                                        name="product_status"
                                        checked={formData.is_draft && !formData.is_publish}
                                        onChange={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                is_draft: true,
                                                is_publish: false
                                            }));
                                        }}
                                    />
                                    <label htmlFor="status-draft">Bản Nháp</label>
                                    <p className={cx('status-description')}>
                                        Sản phẩm sẽ được lưu nhưng không hiển thị trong cửa hàng
                                    </p>
                                </div>

                                <div className={cx('status-option')}>
                                    <input
                                        type="radio"
                                        id="status-published"
                                        name="product_status"
                                        checked={!formData.is_draft && formData.is_publish}
                                        onChange={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                is_draft: false,
                                                is_publish: true
                                            }));
                                        }}
                                    />
                                    <label htmlFor="status-published">Xuất Bản</label>
                                    <p className={cx('status-description')}>
                                        Sản phẩm sẽ hiển thị và có thể mua trong cửa hàng
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Tóm Tắt Sản Phẩm</h2>
                            <div className={cx('product-summary')}>
                                <div className={cx('summary-item')}>
                                    <span className={cx('summary-label')}>Tên:</span>
                                    <span className={cx('summary-value')}>
                                        {formData.product_name || '(Chưa có)'}
                                    </span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span className={cx('summary-label')}>Danh mục:</span>
                                    <span className={cx('summary-value')}>
                                        {categories.find((c) => c._id === formData.product_category)
                                            ?.category_name || '(Chưa chọn)'}
                                    </span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span className={cx('summary-label')}>Giá:</span>
                                    <span className={cx('summary-value')}>
                                        {formData.product_cost
                                            ? `${Number(formData.product_cost).toLocaleString(
                                                  'vi-VN'
                                              )} ₫`
                                            : '(Chưa có)'}
                                    </span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span className={cx('summary-label')}>Số lượng:</span>
                                    <span className={cx('summary-value')}>
                                        {formData.product_quantity || '0'}
                                    </span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span className={cx('summary-label')}>Trạng thái:</span>
                                    <span className={cx('summary-value')}>
                                        {formData.is_draft && !formData.is_publish
                                            ? 'Bản nháp'
                                            : 'Xuất bản'}
                                    </span>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span className={cx('summary-label')}>Hình ảnh:</span>
                                    <span className={cx('summary-value')}>
                                        {formData.product_thumb ? '1 chính' : '0 chính'} &{' '}
                                        {formData.product_images.length} phụ
                                    </span>
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
