import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './DiscountManager.module.scss';
import axiosClient from '../../configs/axios';
import { API_URL } from '../../configs/env.config';

const cx = classNames.bind(styles);

function DiscountManager() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        discount_name: '',
        discount_description: '',
        discount_code: '',
        discount_type: 'percentage',
        discount_value: '',
        discount_count: '',
        discount_max_value: '',
        discount_user_max_use: '',
        discount_min_order_cost: '',
        discount_start_at: '',
        discount_end_at: '',
        is_publish: true,
        is_apply_all_product: false,
        discount_skus: []
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.discount_name.trim()) {
            newErrors.discount_name = 'Discount name is required';
        }

        if (!formData.discount_code.trim()) {
            newErrors.discount_code = 'Discount code is required';
        } else if (formData.discount_code.length < 6 || formData.discount_code.length > 10) {
            newErrors.discount_code = 'Code must be between 6 and 10 characters';
        }

        if (!formData.discount_value) {
            newErrors.discount_value = 'Discount value is required';
        } else if (formData.discount_type === 'percentage' && (formData.discount_value < 0 || formData.discount_value > 100)) {
            newErrors.discount_value = 'Percentage must be between 0 and 100';
        }

        if (!formData.discount_start_at) {
            newErrors.discount_start_at = 'Start date is required';
        }

        if (!formData.discount_end_at) {
            newErrors.discount_end_at = 'End date is required';
        } else if (new Date(formData.discount_start_at) >= new Date(formData.discount_end_at)) {
            newErrors.discount_end_at = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            // Convert form data to match the server model
            const discountData = {
                ...formData,
                discount_code: formData.discount_code.toUpperCase(),
                discount_value: Number(formData.discount_value),
                discount_count: formData.discount_count ? Number(formData.discount_count) : undefined,
                discount_max_value: formData.discount_max_value ? Number(formData.discount_max_value) : undefined,
                discount_user_max_use: formData.discount_user_max_use ? Number(formData.discount_user_max_use) : undefined,
                discount_min_order_cost: formData.discount_min_order_cost ? Number(formData.discount_min_order_cost) : undefined
            };

            const response = await axiosClient.post(`${API_URL}/discount/create`, discountData);

            if (response.data && response.data.statusCode === 201) {
                alert('Discount created successfully!');
                navigate('/discounts');
            }
        } catch (error) {
            console.error('Error creating discount:', error);
            alert('Failed to create discount. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('discount-manager')}>
            <div className={cx('header')}>
                <h1>Create New Discount</h1>
            </div>

            <form onSubmit={handleSubmit} className={cx('discount-form')}>
                <div className={cx('form-section')}>
                    <h2>Basic Information</h2>
                    
                    <div className={cx('form-group', { invalid: errors.discount_name })}>
                        <label>
                            Discount Name
                            <span className={cx('required')}>*</span>
                        </label>
                        <input
                            type="text"
                            name="discount_name"
                            value={formData.discount_name}
                            onChange={handleInputChange}
                            placeholder="Enter discount name"
                        />
                        {errors.discount_name && (
                            <div className={cx('error-message')}>{errors.discount_name}</div>
                        )}
                    </div>

                    <div className={cx('form-group')}>
                        <label>Description</label>
                        <textarea
                            name="discount_description"
                            value={formData.discount_description}
                            onChange={handleInputChange}
                            placeholder="Enter discount description"
                        />
                    </div>

                    <div className={cx('form-group', { invalid: errors.discount_code })}>
                        <label>
                            Discount Code
                            <span className={cx('required')}>*</span>
                        </label>
                        <input
                            type="text"
                            name="discount_code"
                            value={formData.discount_code}
                            onChange={handleInputChange}
                            placeholder="Enter discount code (6-10 characters)"
                            style={{ textTransform: 'uppercase' }}
                        />
                        {errors.discount_code && (
                            <div className={cx('error-message')}>{errors.discount_code}</div>
                        )}
                    </div>
                </div>

                <div className={cx('form-section')}>
                    <h2>Discount Settings</h2>
                    
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>
                                Discount Type
                                <span className={cx('required')}>*</span>
                            </label>
                            <select
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleInputChange}
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>

                        <div className={cx('form-group', { invalid: errors.discount_value })}>
                            <label>
                                Discount Value
                                <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="number"
                                name="discount_value"
                                value={formData.discount_value}
                                onChange={handleInputChange}
                                placeholder={formData.discount_type === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount'}
                                min="0"
                                max={formData.discount_type === 'percentage' ? "100" : ""}
                            />
                            {errors.discount_value && (
                                <div className={cx('error-message')}>{errors.discount_value}</div>
                            )}
                        </div>
                    </div>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Maximum Discount Amount</label>
                            <input
                                type="number"
                                name="discount_max_value"
                                value={formData.discount_max_value}
                                onChange={handleInputChange}
                                placeholder="Maximum discount amount (optional)"
                                min="0"
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Minimum Order Amount</label>
                            <input
                                type="number"
                                name="discount_min_order_cost"
                                value={formData.discount_min_order_cost}
                                onChange={handleInputChange}
                                placeholder="Minimum order amount (optional)"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('form-section')}>
                    <h2>Usage Limits</h2>
                    
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Total Usage Limit</label>
                            <input
                                type="number"
                                name="discount_count"
                                value={formData.discount_count}
                                onChange={handleInputChange}
                                placeholder="Total number of times this discount can be used"
                                min="0"
                            />
                        </div>

                        <div className={cx('form-group')}>
                            <label>Per User Limit</label>
                            <input
                                type="number"
                                name="discount_user_max_use"
                                value={formData.discount_user_max_use}
                                onChange={handleInputChange}
                                placeholder="Maximum uses per user"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('form-section')}>
                    <h2>Time Range</h2>
                    
                    <div className={cx('form-row')}>
                        <div className={cx('form-group', { invalid: errors.discount_start_at })}>
                            <label>
                                Start Date
                                <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="discount_start_at"
                                value={formData.discount_start_at}
                                onChange={handleInputChange}
                            />
                            {errors.discount_start_at && (
                                <div className={cx('error-message')}>{errors.discount_start_at}</div>
                            )}
                        </div>

                        <div className={cx('form-group', { invalid: errors.discount_end_at })}>
                            <label>
                                End Date
                                <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="discount_end_at"
                                value={formData.discount_end_at}
                                onChange={handleInputChange}
                            />
                            {errors.discount_end_at && (
                                <div className={cx('error-message')}>{errors.discount_end_at}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={cx('form-section')}>
                    <h2>Additional Settings</h2>
                    
                    <div className={cx('checkbox-group')}>
                        <input
                            type="checkbox"
                            id="is_apply_all_product"
                            name="is_apply_all_product"
                            checked={formData.is_apply_all_product}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="is_apply_all_product">
                            Apply to all products
                        </label>
                    </div>

                    <div className={cx('checkbox-group')}>
                        <input
                            type="checkbox"
                            id="is_publish"
                            name="is_publish"
                            checked={formData.is_publish}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="is_publish">
                            Publish discount immediately
                        </label>
                    </div>
                </div>

                <div className={cx('footer-section')}>
                    <div className={cx('actions')}>
                        <button
                            type="button"
                            className={cx('draft-btn')}
                            onClick={() => {
                                setFormData(prev => ({ ...prev, is_publish: false }));
                                document.querySelector('form').requestSubmit();
                            }}
                            disabled={loading}
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            className={cx('submit-btn')}
                            onClick={() => setFormData(prev => ({ ...prev, is_publish: true }))}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Discount'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default DiscountManager;
