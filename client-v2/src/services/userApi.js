import axiosClient from '../configs/axios';

export const fetchUserProfile = async () => {
    try {
        const response = await axiosClient.get('/user/profile');
        return response.data.metadata;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
};
