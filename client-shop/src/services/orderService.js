import axiosClient from '../configs/axios';

/**
 * Get orders for the current shop
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by order status
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @param {string} params.paymentType - Filter by payment type
 * @param {string} params.dateFrom - Filter from date
 * @param {string} params.dateTo - Filter to date
 * @returns {Promise<Object>} Response with orders data
 */
async function getShopOrders(params = {}) {
    try {
        const response = await axiosClient.get('/order/shop', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching shop orders:', error);
        throw error;
    }
}

/**
 * Approve a pending order
 * @param {string} orderId - The order ID to approve
 * @returns {Promise<Object>} Response with updated order data
 */
async function approveOrder(orderId) {
    try {
        const response = await axiosClient.patch(`/order/${orderId}/approve`);
        return response.data;
    } catch (error) {
        console.error('Error approving order:', error);
        throw error;
    }
}

/**
 * Reject a pending order
 * @param {string} orderId - The order ID to reject
 * @param {string} reason - Optional reason for rejection
 * @returns {Promise<Object>} Response with updated order data
 */
async function rejectOrder(orderId, reason = '') {
    try {
        const response = await axiosClient.patch(`/order/${orderId}/reject`, {
            reason: reason || undefined
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting order:', error);
        throw error;
    }
}

/**
 * Update order status (general purpose)
 * @param {string} orderId - The order ID to update
 * @param {string} status - New status
 * @returns {Promise<Object>} Response with updated order data
 */
async function updateOrderStatus(orderId, status) {
    try {
        if (status === 'delivering') {
            return await approveOrder(orderId);
        } else if (status === 'cancelled') {
            return await rejectOrder(orderId);
        } else {
            const response = await axiosClient.patch(`/order/${orderId}/status`, { status });
            return response.data;
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

/**
 * Complete a delivering order (mark as delivered)
 * @param {string} orderId - The order ID to complete
 * @returns {Promise<Object>} Response with updated order data
 */
async function completeOrder(orderId) {
    try {
        const response = await axiosClient.patch(`/order/${orderId}/complete`);
        return response.data;
    } catch (error) {
        console.error('Error completing order:', error);
        throw error;
    }
}

/**
 * Get order details by ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object>} Response with order details
 */
async function getOrderDetails(orderId) {
    try {
        const response = await axiosClient.get(`/order/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}

export default {
    getShopOrders,
    approveOrder,
    rejectOrder,
    completeOrder,
    updateOrderStatus,
    getOrderDetails
};
