import axiosClient from '../../configs/axios';

export const toggleDiscountPublish = async (discountId, isPublish) => {
    const response = await axiosClient.patch(`/discount/${discountId}/publish`, {
        is_publish: isPublish
    });
    return response.data;
};

export const toggleDiscountAvailable = async (discountId, isAvailable) => {
    const response = await axiosClient.patch(`/discount/${discountId}/available`, {
        is_available: isAvailable
    });
    return response.data;
};
