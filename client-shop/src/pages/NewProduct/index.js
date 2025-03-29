import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NewProduct.module.scss';

const cx = classNames.bind(styles);

function NewProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        comparePrice: '',
        sku: '',
        barcode: '',
        quantity: '',
        categories: [],
        images: [],
        variants: [],
        published: false
    });

    // Danh mục mẫu cho mục đích minh họa
    const availableCategories = [
        { id: 1, name: 'Điện tử' },
        { id: 2, name: 'Thời trang' },
        { id: 3, name: 'Nhà cửa & Đời sống' },
        { id: 4, name: 'Sách' },
        { id: 5, name: 'Đồ chơi & Trò chơi' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const categoryId = Number(value);

        if (checked) {
            setFormData((prev) => ({
                ...prev,
                categories: [...prev.categories, categoryId]
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                categories: prev.categories.filter((id) => id !== categoryId)
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Xem trước hình ảnh
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const removeImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Xác thực form
        if (!formData.name || !formData.price) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        setLoading(true);

        try {
            // Giả lập gọi API
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log('Dữ liệu sản phẩm để gửi:', formData);

            // Nếu thành công, chuyển hướng đến danh sách sản phẩm
            alert('Sản phẩm đã được tạo thành công!');
            navigate('/products');
        } catch (error) {
            console.error('Lỗi khi tạo sản phẩm:', error);
            alert('Không thể tạo sản phẩm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const saveAsDraft = () => {
        setFormData((prev) => ({
            ...prev,
            published: false
        }));
        handleSubmit({ preventDefault: () => {} });
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
                        Lưu Nháp
                    </button>
                    <button
                        type="button"
                        className={cx('submit-btn')}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Đang tạo...' : 'Tạo Sản Phẩm'}
                    </button>
                </div>
            </div>

            <form className={cx('product-form')} onSubmit={handleSubmit}>
                <div className={cx('form-layout')}>
                    <div className={cx('main-form')}>
                        <div className={cx('form-section')}>
                            <h2>Thông Tin Cơ Bản</h2>

                            <div className={cx('form-group')}>
                                <label htmlFor="name">Tên Sản Phẩm *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="description">Mô Tả</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                />
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Hình Ảnh</h2>
                            <div className={cx('image-upload')}>
                                <label htmlFor="images">Thêm Hình Ảnh</label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />

                                <div className={cx('image-previews')}>
                                    {formData.images.map((image, index) => (
                                        <div key={index} className={cx('image-preview-item')}>
                                            <img src={image.preview} alt={`Xem trước ${index}`} />
                                            <button
                                                type="button"
                                                className={cx('remove-image')}
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Giá Bán</h2>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="price">Giá Bán *</label>
                                    <div className={cx('price-input')}>
                                        <span className={cx('currency')}>₫</span>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            step="1000"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="comparePrice">Giá So Sánh</label>
                                    <div className={cx('price-input')}>
                                        <span className={cx('currency')}>₫</span>
                                        <input
                                            type="number"
                                            id="comparePrice"
                                            name="comparePrice"
                                            value={formData.comparePrice}
                                            onChange={handleInputChange}
                                            step="1000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Kho Hàng</h2>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="sku">Mã SKU (Đơn Vị Lưu Kho)</label>
                                    <input
                                        type="text"
                                        id="sku"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className={cx('form-group', 'half')}>
                                    <label htmlFor="barcode">Mã Vạch (ISBN, UPC, GTIN, v.v.)</label>
                                    <input
                                        type="text"
                                        id="barcode"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="quantity">Số Lượng</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={cx('sidebar-form')}>
                        <div className={cx('form-section')}>
                            <h2>Trạng Thái Sản Phẩm</h2>
                            <div className={cx('form-group')}>
                                <label className={cx('switch')}>
                                    <input
                                        type="checkbox"
                                        name="published"
                                        checked={formData.published}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                published: e.target.checked
                                            }))
                                        }
                                    />
                                    <span className={cx('slider')}></span>
                                    <span className={cx('status-text')}>
                                        {formData.published ? 'Đã Đăng' : 'Bản Nháp'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className={cx('form-section')}>
                            <h2>Phân Loại</h2>
                            <div className={cx('form-group')}>
                                <label className={cx('categories-label')}>Danh Mục Sản Phẩm</label>
                                <div className={cx('categories-list')}>
                                    {availableCategories.map((category) => (
                                        <label
                                            key={category.id}
                                            className={cx('category-checkbox')}
                                        >
                                            <input
                                                type="checkbox"
                                                value={category.id}
                                                checked={formData.categories.includes(category.id)}
                                                onChange={handleCategoryChange}
                                            />
                                            {category.name}
                                        </label>
                                    ))}
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
