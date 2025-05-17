import apiClient from '../axiosInstance'; // Assuming a configured axios instance

export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  // Add any other relevant fields for a wishlist item
  createdAt: string; 
}

const WISHLIST_API_URL = '/wishlist'; // Base URL for wishlist endpoints

const getWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const response = await apiClient.get<WishlistItem[]>(WISHLIST_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    // It might be better to throw a custom error or return a specific error object
    throw error; 
  }
};

const addToWishlist = async (productId: string): Promise<WishlistItem> => {
  try {
    const response = await apiClient.post<WishlistItem>(`${WISHLIST_API_URL}/add/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error adding product ${productId} to wishlist:`, error);
    throw error;
  }
};

const removeFromWishlist = async (productId: string): Promise<void> => {
  try {
    await apiClient.post(`${WISHLIST_API_URL}/remove/${productId}`);
  } catch (error) {
    console.error(`Error removing product ${productId} from wishlist:`, error);
    throw error;
  }
};

export const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
}; 