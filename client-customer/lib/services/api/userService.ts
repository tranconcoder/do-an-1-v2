import apiClient from '../axiosInstance';
import { User, Shop } from "@/lib/store/slices/userSlice"; // Import types from userSlice

// Define the expected structure of the /user/profile API response
interface ProfileApiResponse {
  message: string;
  metadata: {
    user: User;
    shop?: Shop; // Shop is optional in the response
  };
  statusCode?: number;
}

const USER_API_URL = '/user'; // Base URL for user endpoints

const userService = {
  /**
   * Fetches the currently logged-in user's profile.
   * @returns {Promise<{user: User, shop?: Shop}>} A promise that resolves to the user and optional shop data.
   */
  getProfile: async (): Promise<{user: User, shop?: Shop}> => {
    try {
      const response = await apiClient.get<ProfileApiResponse>(`${USER_API_URL}/profile`);
      
      if (response.data && response.data.metadata) {
        return response.data.metadata; // Returns { user: ..., shop: ... }
      }
      
      throw new Error('Profile data not found in API response structure.');

    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error; // Re-throw to allow the calling component/hook to handle it
    }
  },

  // Add other user-related API calls here if needed, e.g.,
  // updateProfile: async (userData: Partial<User>) => { ... }
};

export default userService; 