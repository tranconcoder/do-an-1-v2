import React from 'react';
import classNames from 'classnames/bind';
import styles from './WarehouseSection.module.scss';

const cx = classNames.bind(styles);

const WarehouseSection = ({
    currentWarehouse,
    formData,
    provinces,
    warehouseDistricts,
    warehouseWards,
    handleCurrentWarehouseChange,
    handleCurrentWarehouseAddressChange,
    addWarehouse,
    removeWarehouse
}) => {
    return (
        <div className={cx('form-section')}>
            <h2>Thông Tin Kho Hàng</h2>
            <p className={cx('subtitle')}>Thêm các kho hàng nơi bạn lưu trữ sản phẩm</p>

            {/* Warehouse Form */}
            <div className={cx('warehouse-form')}>
                <h3>Thêm Kho Hàng</h3>
                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-name">Tên Kho Hàng *</label>
                    <input
                        type="text"
                        id="warehouse-name"
                        value={currentWarehouse.name}
                        onChange={(e) => handleCurrentWarehouseChange('name', e.target.value)}
                        placeholder="Kho chính, Kho phụ, v.v."
                    />
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-phone">Số Điện Thoại Kho Hàng *</label>
                    <input
                        type="tel"
                        id="warehouse-phone"
                        value={currentWarehouse.phoneNumber}
                        onChange={(e) =>
                            handleCurrentWarehouseChange('phoneNumber', e.target.value)
                        }
                    />
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-province">Tỉnh/Thành Phố *</label>
                    <select
                        id="warehouse-province"
                        value={currentWarehouse.address.province}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('province', e.target.value)
                        }
                    >
                        <option value="">Chọn Tỉnh/Thành Phố</option>
                        {provinces.map((province) => (
                            <option key={province._id} value={province._id}>
                                {province.province_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-district">Quận/Huyện *</label>
                    <select
                        id="warehouse-district"
                        value={currentWarehouse.address.district}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('district', e.target.value)
                        }
                        disabled={!currentWarehouse.address.province}
                    >
                        <option value="">Chọn Quận/Huyện</option>
                        {warehouseDistricts.map
                            ? warehouseDistricts.map((district) => (
                                  <option key={district._id} value={district._id}>
                                      {district.district_name}
                                  </option>
                              ))
                            : null}
                    </select>
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-ward">Phường/Xã</label>
                    <select
                        id="warehouse-ward"
                        value={currentWarehouse.address.ward}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('ward', e.target.value)
                        }
                        disabled={!currentWarehouse.address.district}
                    >
                        <option value="">Chọn Phường/Xã</option>
                        {warehouseWards.map
                            ? warehouseWards.map((ward) => (
                                  <option key={ward._id} value={ward._id}>
                                      {ward.ward_name}
                                  </option>
                              ))
                            : null}
                    </select>
                </div>
                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-address">Địa Chỉ Chi Tiết *</label>
                    <input
                        type="text"
                        id="warehouse-address"
                        value={currentWarehouse.address.address}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('address', e.target.value)
                        }
                        placeholder="Đường, Số nhà, v.v."
                    />
                </div>
                <button type="button" className={cx('add-warehouse-btn')} onClick={addWarehouse}>
                    + Thêm Kho Hàng
                </button>
            </div>

            {/* Warehouse List */}
            {formData.shop_warehouses.length > 0 && (
                <div className={cx('warehouses-list')}>
                    <h3>Kho Hàng Đã Thêm</h3>
                    {formData.shop_warehouses.map((warehouse, index) => (
                        <div key={index} className={cx('warehouse-item')}>
                            <div className={cx('warehouse-details')}>
                                <h4>{warehouse.name}</h4>
                                <p>
                                    <strong>Điện thoại:</strong> {warehouse.phoneNumber}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong> {warehouse.address.address}
                                </p>
                                <button
                                    type="button"
                                    className={cx('remove-btn')}
                                    onClick={() => removeWarehouse(index)}
                                >
                                    Xóa
                                </button>
                            </div>
                            <hr className={cx('warehouse-divider')} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WarehouseSection;
