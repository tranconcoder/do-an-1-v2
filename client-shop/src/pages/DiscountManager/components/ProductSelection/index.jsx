import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductSelection.module.scss';
import axiosClient from '../../../../configs/axios';
import { API_URL } from '../../../../configs/env.config';
import { useSelector } from 'react-redux';

const cx = classNames.bind(styles);

const ProductSelection = ({ selectedSkus, onChange }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const shop = useSelector((state) => state.user.shopInfo);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`${API_URL}/sku/shop/${""}`);
            if (response.data && response.data.metadata) {
                setProducts(response.data.metadata);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        
        if (checked) {
            // Select all SKUs
            const allSkuIds = products.map(product => product.sku._id);
            onChange(allSkuIds);
        } else {
            // Deselect all
            onChange([]);
        }
    };

    const handleSelectProduct = (skuId) => {
        let newSelectedSkus;
        if (selectedSkus.includes(skuId)) {
            // Remove if already selected
            newSelectedSkus = selectedSkus.filter(id => id !== skuId);
            setSelectAll(false);
        } else {
            // Add if not selected
            newSelectedSkus = [...selectedSkus, skuId];
            // Check if all products are now selected
            setSelectAll(newSelectedSkus.length === products.length);
        }
        onChange(newSelectedSkus);
    };

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.sku_value.some(attr => 
            attr.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return <div>Đang tải danh sách sản phẩm...</div>;
    }

    return (
        <div className={cx('product-selection')}>
            <div className={cx('search-box')}>
                <span className={cx('search-icon')}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 14L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={cx('select-all')}>
                <input
                    type="checkbox"
                    id="select-all"
                    checked={selectAll}
                    onChange={handleSelectAll}
                />
                <label htmlFor="select-all">Chọn tất cả sản phẩm</label>
            </div>

            <div className={cx('product-list')}>
                {filteredProducts.map((product) => (
                    <div key={product.sku._id} className={cx('product-item')}>
                        <div className={cx('checkbox-wrapper')}>
                            <input
                                type="checkbox"
                                checked={selectedSkus.includes(product.sku._id)}
                                onChange={() => handleSelectProduct(product.sku._id)}
                            />
                        </div>
                        <div className={cx('product-info')}>
                            <div className={cx('product-name')}>{product.product_name}</div>
                            <div className={cx('product-variant')}>
                                {product.sku.sku_value.map((attr, index) => (
                                    <span key={index}>{attr.key}: {attr.value}</span>
                                ))}
                            </div>
                            <div className={cx('product-price')}>
                                Giá: {formatPrice(product.sku.sku_price)}
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredProducts.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                        Không tìm thấy sản phẩm nào
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSelection;
