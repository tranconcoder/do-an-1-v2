import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './WarehouseManager.module.scss';
import { selectShopInfo } from '../../store/userSlice';

const cx = classNames.bind(styles);

function WarehouseManager() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const shopInfo = useSelector(selectShopInfo);

    useEffect(() => {
        // TODO: Replace with actual API call
        const fetchWarehouses = async () => {
            try {
                setLoading(true);
                // Simulated data for now
                const mockWarehouses = shopInfo?.shop_warehouses || [];
                setWarehouses(mockWarehouses);
                setLoading(false);
            } catch (err) {
                setError('Failed to load warehouses');
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, [shopInfo]);

    if (loading) {
        return <div className={cx('loading')}>Đang tải thông tin kho...</div>;
    }

    if (error) {
        return <div className={cx('error')}>{error}</div>;
    }

    return (
        <div className={cx('warehouse-manager')}>
            <div className={cx('header')}>
                <h1>Quản Lý Kho</h1>
                <button className={cx('add-warehouse-btn')}>+ Thêm Kho Mới</button>
            </div>

            {warehouses.length === 0 ? (
                <div className={cx('empty-state')}>
                    <div className={cx('empty-icon')}>🏭</div>
                    <p>Chưa có kho nào được thêm</p>
                    <p className={cx('empty-message')}>
                        Thêm kho để quản lý hàng hóa của bạn một cách hiệu quả
                    </p>
                </div>
            ) : (
                <div className={cx('warehouses-grid')}>
                    {warehouses.map((warehouse, index) => (
                        <div key={index} className={cx('warehouse-card')}>
                            <div className={cx('warehouse-header')}>
                                <h3>{warehouse.name}</h3>
                                <span className={cx('warehouse-status', warehouse.status)}>
                                    {warehouse.status}
                                </span>
                            </div>
                            <div className={cx('warehouse-info')}>
                                <div className={cx('info-item')}>
                                    <span className={cx('label')}>Địa chỉ:</span>
                                    <span>{warehouse.address}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <span className={cx('label')}>Điện thoại:</span>
                                    <span>{warehouse.phone}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <span className={cx('label')}>Sản phẩm:</span>
                                    <span>{warehouse.productCount || 0}</span>
                                </div>
                            </div>
                            <div className={cx('warehouse-actions')}>
                                <button className={cx('edit-btn')}>Chỉnh Sửa</button>
                                <button className={cx('manage-btn')}>Quản Lý Kho</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WarehouseManager;
