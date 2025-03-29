import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectShopInfo } from '../store/userSlice';
import PendingApprovalScreen from './PendingApprovalScreen';

/**
 * ShopStatusGuard component kiểm tra xem cửa hàng đã được phê duyệt chưa
 * trước khi cho phép truy cập vào các trang đã được bảo vệ
 * Nếu cửa hàng đang chờ duyệt, nó sẽ hiển thị màn hình chờ
 * Nếu cửa hàng bị từ chối, nó sẽ chuyển hướng đến trang đăng nhập với thông báo
 */
const ShopStatusGuard = ({ children }) => {
    const shopInfo = useSelector(selectShopInfo);

    // Nếu shopInfo đang tải hoặc không có dữ liệu, trả về null hoặc hiển thị đang tải
    if (!shopInfo) {
        return null; // Hoặc một component hiển thị trạng thái đang tải
    }

    // Lấy trạng thái cửa hàng từ cấu trúc lồng nhau
    const shop = shopInfo?.shop || {};
    const status = shop.shop_status;

    // Nếu trạng thái cửa hàng là đang chờ, hiển thị màn hình chờ phê duyệt
    if (status === 'pending') {
        return <PendingApprovalScreen shop={shop} />;
    }

    // Nếu trạng thái cửa hàng là bị từ chối, chuyển hướng đến đăng nhập với thông báo
    if (status === 'rejected') {
        return <Navigate to="/login?rejected=true" replace />;
    }

    // Cửa hàng đã được phê duyệt, cho phép truy cập đến trang được bảo vệ
    return children;
};

export default ShopStatusGuard;
