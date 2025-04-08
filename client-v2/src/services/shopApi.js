import axios from '../configs/axios';

/**
 * Fetch shop details by shop ID.
 * @param {string} shopId - The ID of the shop to fetch details for.
 * @returns {Promise<Object>} The shop details.
 */
export const getShopDetails = async (shopId) => {
    try {
        const response = await axios.get(`/user/shop/${shopId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching shop details:', error);
        throw error;
    }
};