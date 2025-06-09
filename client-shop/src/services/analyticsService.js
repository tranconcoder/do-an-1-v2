import axiosClient from '../configs/axios';

export const analyticsService = {
    async getDashboardStats(timeRange = 'all') {
        try {
            const response = await axiosClient.get('/analytics/dashboard', {
                params: { timeRange }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    async getShopDashboardStats(timeRange = 'all') {
        try {
            const response = await axiosClient.get('/analytics/shop/dashboard', {
                params: { timeRange }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching shop dashboard stats:', error);
            throw error;
        }
    }
};

export default analyticsService;
