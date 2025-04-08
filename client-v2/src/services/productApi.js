import axios from 'axios';
import { API_URL } from '../configs/env.config';

export const getAllSkuProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/sku`);
        if (response.data && response.data.statusCode === 200) {
            return response.data.metadata;
        }
        return [];
    } catch (error) {
        console.error('Error fetching SKU products:', error);
        throw error;
    }
};