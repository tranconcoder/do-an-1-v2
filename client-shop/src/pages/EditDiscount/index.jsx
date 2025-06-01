import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './EditDiscount.module.scss';
import axiosClient from '../../configs/axios';
import { API_URL } from '../../configs/env.config';
import ProductSelection from '../DiscountManager/components/ProductSelection';
import { useToast } from '../../contexts/ToastContext';
import { convertDatetimeLocalToISO, convertISOToDatetimeLocal } from '../../utils/datetime';

const cx = classNames.bind(styles);

function EditDiscount() {
    const navigate = useNavigate();
    const { discountId } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const { showToast } = useToast();
    const [originalData, setOriginalData] = useState(null);
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
        discount_skus: [],
        is_publish: true,
        is_apply_all_product: true,
        is_available: true
    });

    useEffect(() => {
        fetchDiscountDetails();
    }, [discountId]);

    const fetchDiscountDetails = async () => {
        try {
            setFetchLoading(true);
            const response = await axiosClient.get(`${API_URL}/discount/${discountId}`);

            if (response.data && response.data.statusCode === 200) {
                const discount = response.data.metadata;

                const discountData = {
                    discount_name: discount.discount_name || '',
                    discount_description: discount.discount_description || '',
                    discount_code: discount.discount_code || '',
                    discount_type: discount.discount_type || 'percentage',
                    discount_value: discount.discount_value || '',
                    discount_count: discount.discount_count || '',
                    discount_max_value: discount.discount_max_value || '',
                    discount_user_max_use: discount.discount_user_max_use || '',
                    discount_min_order_cost: discount.discount_min_order_cost || '',
                    discount_start_at: convertISOToDatetimeLocal(discount.discount_start_at),
                    discount_end_at: convertISOToDatetimeLocal(discount.discount_end_at),
                    discount_skus: discount.discount_skus || [],
                    is_publish: discount.is_publish !== undefined ? discount.is_publish : true,
                    is_apply_all_product:
                        discount.is_apply_all_product !== undefined
                            ? discount.is_apply_all_product
                            : true,
                    is_available: discount.is_available !== undefined ? discount.is_available : true
                };

                setFormData(discountData);
                setOriginalData(discountData);
            }
        } catch (error) {
            console.error('Error fetching discount details:', error);
            const errorMessage =
                error.response?.data?.message || 'Không thể tải thông tin mã giảm giá';
            showToast(errorMessage, 'error');
            navigate('/discounts');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Nếu chọn áp dụng tất cả sản phẩm, reset danh sách SKUs đã chọn
            ...(name === 'is_apply_all_product' && checked ? { discount_skus: [] } : {})
        }));
    };

    const handleSelectedSkusChange = (selectedSkus, applyAll) => {
        setFormData((prev) => ({
            ...prev,
            discount_skus: selectedSkus,
            // Nếu đang chọn sản phẩm cụ thể, tắt option áp dụng tất cả
            is_apply_all_product: applyAll
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.discount_name.trim()) {
            newErrors.discount_name = 'Vui lòng nhập tên mã giảm giá';
        }

        if (!formData.discount_code.trim()) {
            newErrors.discount_code = 'Vui lòng nhập mã giảm giá';
        } else if (formData.discount_code.length < 6 || formData.discount_code.length > 10) {
            newErrors.discount_code = 'Mã giảm giá phải từ 6 đến 10 ký tự';
        }

        if (!formData.discount_value) {
            newErrors.discount_value = 'Vui lòng nhập giá trị giảm';
        } else if (
            formData.discount_type === 'percentage' &&
            (formData.discount_value < 0 || formData.discount_value > 100)
        ) {
            newErrors.discount_value = 'Phần trăm giảm giá phải từ 0 đến 100';
        }

        if (formData.discount_count && isNaN(Number(formData.discount_count))) {
            newErrors.discount_count = 'Tổng số lượng mã phải là số';
        }

        if (!formData.discount_min_order_cost) {
            newErrors.discount_min_order_cost = 'Vui lòng nhập giá trị đơn hàng tối thiểu';
        } else if (
            isNaN(Number(formData.discount_min_order_cost)) ||
            Number(formData.discount_min_order_cost) < 0
        ) {
            newErrors.discount_min_order_cost = 'Giá trị đơn hàng tối thiểu phải là số không âm';
        }

        if (!formData.discount_start_at) {
            newErrors.discount_start_at = 'Vui lòng chọn thời gian bắt đầu';
        }

        if (!formData.discount_end_at) {
            newErrors.discount_end_at = 'Vui lòng chọn thời gian kết thúc';
        } else if (new Date(formData.discount_start_at) >= new Date(formData.discount_end_at)) {
            newErrors.discount_end_at = 'Thời gian kết thúc phải sau thời gian bắt đầu';
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
            const data = {
                _id: discountId,
                ...formData,
                discount_count: Number(formData.discount_count),
                discount_max_value: formData.discount_max_value
                    ? Number(formData.discount_max_value)
                    : null,
                discount_min_order_cost: Number(formData.discount_min_order_cost) || 0,
                discount_user_max_use: Number(formData.discount_user_max_use) || 1,
                discount_value: Number(formData.discount_value),
                // Convert datetime-local to ISO string using utility function
                discount_start_at: convertDatetimeLocalToISO(formData.discount_start_at),
                discount_end_at: convertDatetimeLocalToISO(formData.discount_end_at)
            };

            if (!data.discount_description) delete data.discount_description;
            if (!data.discount_count) delete data.discount_count;
            if (!data.discount_max_value) delete data.discount_max_value;
            if (data.is_apply_all_product) delete data.discount_skus;

            const response = await axiosClient.put(`${API_URL}/discount`, data);

            if (response.data && response.data.statusCode === 200) {
                showToast('Mã giảm giá được cập nhật thành công!', 'success');
                navigate('/discounts');
            }
        } catch (error) {
            console.error('Error updating discount:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Không thể cập nhật mã giảm giá. Vui lòng thử lại.';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/discounts');
    };

    if (fetchLoading) {
        return (
            <div className={cx('discount-manager')}>
                <div className={cx('loading-state')}>
                    <div className={cx('loader')}></div>
                    <p>Đang tải thông tin mã giảm giá...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('discount-manager')}>
            <div className={cx('header')}>
                <h1>Chỉnh Sửa Mã Giảm Giá</h1>
                <p className={cx('subtitle')}>Mã: {formData.discount_code}</p>
            </div>

            <form onSubmit={handleSubmit} className={cx('discount-form')}>
                <div className={cx('form-section')}>
                    <h2>Thông tin cơ bản</h2>

                    <div className={cx('form-group', { invalid: errors.discount_name })}>
                        <label>
                            Tên mã giảm giá
                            <span className={cx('required')}>*</span>
                        </label>
                        <input
                            type="text"
                            name="discount_name"
                            value={formData.discount_name}
                            onChange={handleInputChange}
                            placeholder="Nhập tên mã giảm giá"
                        />
                        {errors.discount_name && (
                            <div className={cx('error-message')}>{errors.discount_name}</div>
                        )}
                    </div>

                    <div className={cx('form-group')}>
                        <label>Mô tả</label>
                        <textarea
                            name="discount_description"
                            value={formData.discount_description}
                            onChange={handleInputChange}
                            placeholder="Nhập mô tả mã giảm giá"
                        />
                    </div>

                    <div className={cx('form-group', { invalid: errors.discount_code })}>
                        <label>
                            Mã giảm giá
                            <span className={cx('required')}>*</span>
                        </label>
                        <input
                            type="text"
                            name="discount_code"
                            value={formData.discount_code}
                            onChange={handleInputChange}
                            placeholder="Nhập mã giảm giá (6-10 ký tự)"
                            style={{ textTransform: 'uppercase' }}
                        />
                        {errors.discount_code && (
                            <div className={cx('error-message')}>{errors.discount_code}</div>
                        )}
                    </div>
                </div>

                <div className={cx('form-section')}>
                    <h2>Thiết lập giảm giá</h2>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>
                                Loại giảm giá
                                <span className={cx('required')}>*</span>
                            </label>
                            <select
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleInputChange}
                            >
                                <option value="percentage">Theo phần trăm</option>
                                <option value="fixed">Số tiền cố định</option>
                            </select>
                        </div>

                        <div className={cx('form-group', { invalid: errors.discount_value })}>
                            <label>
                                Giá trị giảm
                                <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="number"
                                name="discount_value"
                                value={formData.discount_value}
                                onChange={handleInputChange}
                                placeholder={
                                    formData.discount_type === 'percentage'
                                        ? 'Nhập phần trăm (0-100)'
                                        : 'Nhập số tiền'
                                }
                                min="0"
                                max={formData.discount_type === 'percentage' ? '100' : ''}
                            />
                            {errors.discount_value && (
                                <div className={cx('error-message')}>{errors.discount_value}</div>
                            )}
                        </div>
                    </div>

                    <div className={cx('form-row')}>
                        <div
                            className={cx('form-group', {
                                invalid: errors.discount_min_order_cost
                            })}
                        >
                            <label>
                                Giá trị đơn hàng tối thiểu
                                <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="number"
                                name="discount_min_order_cost"
                                value={formData.discount_min_order_cost}
                                onChange={handleInputChange}
                                placeholder="Giá trị đơn hàng tối thiểu để áp dụng mã"
                                min="0"
                            />
                            {errors.discount_min_order_cost && (
                                <div className={cx('error-message')}>
                                    {errors.discount_min_order_cost}
                                </div>
                            )}
                        </div>

                        {formData.discount_type === 'percentage' && (
                            <div className={cx('form-group')}>
                                <label>Giá trị giảm tối đa</label>
                                <input
                                    type="number"
                                    name="discount_max_value"
                                    value={formData.discount_max_value}
                                    onChange={handleInputChange}
                                    placeholder="Số tiền giảm tối đa (chỉ áp dụng cho % giảm)"
                                    min="0"
                                />
                            </div>
                        )}
                    </div>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group', { invalid: errors.discount_count })}>
                            <label>Tổng số lượng mã</label>
                            <input
                                type="number"
                                name="discount_count"
                                value={formData.discount_count}
                                onChange={handleInputChange}
                                placeholder="Tổng số lần mã có thể sử dụng"
                                min="0"
                            />
                            {errors.discount_count && (
                                <div className={cx('error-message')}>{errors.discount_count}</div>
                            )}
                        </div>

                        <div className={cx('form-group')}>
                            <label>Giới hạn mỗi người dùng</label>
                            <input
                                type="number"
                                name="discount_user_max_use"
                                value={formData.discount_user_max_use}
                                onChange={handleInputChange}
                                placeholder="Số lần sử dụng tối đa cho mỗi người"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('form-section')}>
                    <h2>Thời gian áp dụng</h2>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group', { invalid: errors.discount_start_at })}>
                            <label>
                                Thời gian bắt đầu
                                <span className={cx('required')}>*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="discount_start_at"
                                value={formData.discount_start_at}
                                onChange={handleInputChange}
                            />
                            {errors.discount_start_at && (
                                <div className={cx('error-message')}>
                                    {errors.discount_start_at}
                                </div>
                            )}
                        </div>

                        <div className={cx('form-group', { invalid: errors.discount_end_at })}>
                            <label>
                                Thời gian kết thúc
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
                    <h2>Chọn sản phẩm áp dụng</h2>
                    <ProductSelection
                        selectedSkus={formData.discount_skus}
                        onChange={handleSelectedSkusChange}
                    />
                </div>

                <div className={cx('form-section')}>
                    <h2>Cài đặt thêm</h2>

                    <div className={cx('checkbox-group')}>
                        <input
                            type="checkbox"
                            id="is_apply_all_product"
                            name="is_apply_all_product"
                            checked={formData.is_apply_all_product}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="is_apply_all_product">Áp dụng cho tất cả sản phẩm</label>
                    </div>

                    <div className={cx('checkbox-group')}>
                        <input
                            type="checkbox"
                            id="is_publish"
                            name="is_publish"
                            checked={formData.is_publish}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="is_publish">Xuất bản</label>
                    </div>

                    <div className={cx('checkbox-group')}>
                        <input
                            type="checkbox"
                            id="is_available"
                            name="is_available"
                            checked={formData.is_available}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="is_available">Có sẵn để sử dụng</label>
                    </div>
                </div>

                <div className={cx('footer-section')}>
                    <div className={cx('actions')}>
                        <button
                            type="button"
                            className={cx('cancel-btn')}
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button type="submit" className={cx('submit-btn')} disabled={loading}>
                            {loading ? 'Đang cập nhật...' : 'Cập nhật mã giảm giá'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditDiscount;
