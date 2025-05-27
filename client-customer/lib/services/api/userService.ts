import apiClient from '../axiosInstance';
import { User, Shop } from "@/lib/store/slices/userSlice"; // Import types from userSlice

// Define the expected structure of the /user/profile API response
interface ProfileApiResponse {
  message: string;
  metadata: {
    user: User;
    shop?: Shop; // Shop is optional in the response
    // If the update endpoint also returns tokens, include them here
    // token?: {
    //   accessToken: string;
    //   refreshToken: string;
    // };
  };
  statusCode?: number;
}

// Define the payload for updating the profile
// Based on the form, these fields are likely updatable.
// Adjust if your backend expects a different structure or subset of fields.
export interface UpdateProfilePayload {
  user_fullName?: string;
  user_email?: string;      // Be cautious: email updates often require verification.
  phoneNumber?: string;     // Similar to email, phone updates might need verification.
  user_sex?: boolean | undefined;
  user_dayOfBirth?: string; // Ensure this is in a format your backend accepts (e.g., YYYY-MM-DD)
  user_avatar?: string;     // This would likely be a media ID or URL
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

  /**
   * Updates the currently logged-in user's profile.
   * @param {UpdateProfilePayload} profileData - The data to update.
   * @returns {Promise<{user: User, shop?: Shop}>} A promise that resolves to the updated user and optional shop data.
   */
  updateProfile: async (profileData: UpdateProfilePayload): Promise<{user: User, shop?: Shop}> => {
    try {
      const response = await apiClient.patch<ProfileApiResponse>(`${USER_API_URL}/profile`, profileData);
      
      if (response.data && response.data.metadata) {
        // Assuming the backend returns the updated user and potentially shop info
        // If tokens are also returned upon profile update, handle them here or in the component.
        return response.data.metadata;
      }
      
      throw new Error('Profile update failed or API response structure incorrect.');

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error; // Re-throw to allow the calling component/hook to handle it
    }
  }
};

export default userService; 