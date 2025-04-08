import axiosClient from '../configs/axios';
import { API_URL } from '../configs/env.config';

export const addToCart = async (skuId, quantity = 1) => {
    try {
        const response = await axiosClient.post(`${API_URL}/cart`, {
            skuId,
            quantity
        });
        if (response.data && response.data.statusCode === 200) {
            return response.data.metadata;
        }
        return null;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};