import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetail.module.scss';
import axios from 'axios';
import { API_URL } from '../../configs/env.config';
import { getMediaUrl } from '../../utils/media.util';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariation, setSelectedVariation] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/sku/${id}`);
                if (response.data.statusCode === 200) {
                    const skuData = response.data.metadata[0];
                    setProduct(skuData);
                    // Set initial selected image
                    setSelectedImage(skuData.sku_thumb);
                } else {
                    setError('Failed to fetch product details');
                }
            } catch (err) {
                setError('An error occurred while fetching product details');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= product?.sku_stock) {
            setQuantity(newQuantity);
        }
    };

    const handleVariationChange = (variationName, value) => {
        setSelectedVariation((prev) => ({
            ...prev,
            [variationName]: value
        }));
    };
    const images = [
        ...product.spu.product_images,
        product.sku_thumb,
        product.sku_thumb,
        ...product.sku_images
    ];

    if (loading) {
        return <div className={cx('loading')}>Loading...</div>;
    }

    if (error || !product) {
        return <div className={cx('error')}>{error || 'Product not found'}</div>;
    }

    const { spu, category } = product;

    return (
        <div className={cx('product-detail')}>
            <div className={cx('breadcrumb')}>
                <Link to="/">Home</Link> /<Link to="/products">Products</Link> /
                <Link to={`/category/${category[0]?._id}`}>{category[0]?.category_name}</Link>
            </div>

            <div className={cx('product-container')}>
                <div className={cx('product-gallery')}>
                    <div className={cx('main-image')}>
                        <img src={selectedImage} alt={spu.product_name} />
                    </div>
                    <div className={cx('thumbnails')}>
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={cx('thumbnail', { active: selectedImage === image })}
                                onClick={() => setSelectedImage(getMediaUrl(image))}
                            >
                                <img
                                    src={getMediaUrl(image)}
                                    alt={`${spu.product_name} view ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cx('product-info')}>
                    <h1 className={cx('product-name')}>{spu.product_name}</h1>

                    <div className={cx('product-meta')}>
                        <div className={cx('rating')}>
                            Rating: {spu.product_rating_avg || 0} / 5
                        </div>
                        <div className={cx('shop-info')}>
                            Sold by:{' '}
                            <Link to={`/shop/${spu.product_shop}`}>Shop {spu.product_shop}</Link>
                        </div>
                    </div>

                    <div className={cx('price-section')}>
                        <div className={cx('price')}>${product.sku_price.toLocaleString()}</div>
                        <div className={cx('stock')}>
                            Stock: {product.sku_stock} units available
                        </div>
                    </div>

                    {spu.product_variations?.length > 0 && (
                        <div className={cx('variations')}>
                            {spu.product_variations.map((variation, idx) => (
                                <div key={idx} className={cx('variation')}>
                                    <h3>{variation.variation_name}</h3>
                                    <div className={cx('variation-options')}>
                                        {variation.variation_values.map((value, valueIdx) => (
                                            <button
                                                key={valueIdx}
                                                className={cx('variation-option', {
                                                    active:
                                                        selectedVariation[
                                                            variation.variation_name
                                                        ] === value
                                                })}
                                                onClick={() =>
                                                    handleVariationChange(
                                                        variation.variation_name,
                                                        value
                                                    )
                                                }
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={cx('quantity-selector')}>
                        <label>Quantity:</label>
                        <div className={cx('quantity-controls')}>
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                                min="1"
                                max={product.sku_stock}
                            />
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= product.sku_stock}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className={cx('action-buttons')}>
                        <button className={cx('add-to-cart')}>Add to Cart</button>
                        <button className={cx('buy-now')}>Buy Now</button>
                    </div>
                </div>
            </div>

            <div className={cx('product-details')}>
                <div className={cx('tabs')}>
                    <button
                        className={cx('tab', { active: activeTab === 'description' })}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={cx('tab', { active: activeTab === 'specifications' })}
                        onClick={() => setActiveTab('specifications')}
                    >
                        Specifications
                    </button>
                </div>

                <div className={cx('tab-content')}>
                    {activeTab === 'description' && (
                        <div className={cx('description')}>{spu.product_description}</div>
                    )}
                    {activeTab === 'specifications' && (
                        <div className={cx('specifications')}>
                            {spu.product_attributes?.map((attr, index) => (
                                <div key={index} className={cx('spec-item')}>
                                    <span className={cx('spec-label')}>{attr.attr_name}:</span>
                                    <span className={cx('spec-value')}>{attr.attr_value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
