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
            <h2>Warehouse Information</h2>
            <p className={cx('subtitle')}>Add warehouses where you store your products</p>

            {/* Warehouse Form */}
            <div className={cx('warehouse-form')}>
                <h3>Add a Warehouse</h3>
                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-name">Warehouse Name *</label>
                    <input
                        type="text"
                        id="warehouse-name"
                        value={currentWarehouse.name}
                        onChange={(e) => handleCurrentWarehouseChange('name', e.target.value)}
                        placeholder="Main Warehouse, Secondary Storage, etc."
                    />
                </div>

                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-phone">Warehouse Phone Number *</label>
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
                    <label htmlFor="warehouse-province">Province/City *</label>
                    <select
                        id="warehouse-province"
                        value={currentWarehouse.address.province}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('province', e.target.value)
                        }
                    >
                        <option value="">Select Province/City</option>
                        {provinces.map((province) => (
                            <option key={province._id} value={province._id}>
                                {province.province_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('form-group')}>
                    <label htmlFor="warehouse-district">District *</label>
                    <select
                        id="warehouse-district"
                        value={currentWarehouse.address.district}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('district', e.target.value)
                        }
                        disabled={!currentWarehouse.address.province}
                    >
                        <option value="">Select District</option>
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
                    <label htmlFor="warehouse-ward">Ward</label>
                    <select
                        id="warehouse-ward"
                        value={currentWarehouse.address.ward}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('ward', e.target.value)
                        }
                        disabled={!currentWarehouse.address.district}
                    >
                        <option value="">Select Ward</option>
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
                    <label htmlFor="warehouse-address">Detailed Address *</label>
                    <input
                        type="text"
                        id="warehouse-address"
                        value={currentWarehouse.address.address}
                        onChange={(e) =>
                            handleCurrentWarehouseAddressChange('address', e.target.value)
                        }
                        placeholder="Street, House number, etc."
                    />
                </div>

                <button type="button" className={cx('add-warehouse-btn')} onClick={addWarehouse}>
                    + Add Warehouse
                </button>
            </div>

            {/* Warehouse List */}
            {formData.shop_warehouses.length > 0 && (
                <div className={cx('warehouses-list')}>
                    <h3>Added Warehouses</h3>
                    {formData.shop_warehouses.map((warehouse, index) => (
                        <div key={index} className={cx('warehouse-item')}>
                            <div className={cx('warehouse-details')}>
                                <h4>{warehouse.name}</h4>
                                <p>
                                    <strong>Phone:</strong> {warehouse.phoneNumber}
                                </p>
                                <p>
                                    <strong>Address:</strong> {warehouse.address.address}
                                </p>
                                <button
                                    type="button"
                                    className={cx('remove-btn')}
                                    onClick={() => removeWarehouse(index)}
                                >
                                    Remove
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
