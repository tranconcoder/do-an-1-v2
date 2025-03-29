import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../configs/axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../configs/jwt.config';

// Async thunk for login operation
export const loginUser = createAsyncThunk(
    'user/login',
    async ({ phoneNumber, password }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/login', { phoneNumber, password });

            if (response.statusCode !== 200) {
                return rejectWithValue(response.message || 'Login failed');
            }

            // Store tokens in localStorage - tokens are in response.metadata.token
            localStorage.setItem(ACCESS_TOKEN_KEY, response.metadata.token.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, response.metadata.token.refreshToken);

            // Return user info from response.metadata.user
            return response.metadata.user;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/user/profile');
            return response.metadata || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch profile');
        }
    }
);

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: {
            user_email: '',
            user_avatar: '',
            user_fullName: '',
            user_dayOfBirth: null,
            user_sex: false,
            user_role: null,
            // Keep other existing user properties
            phoneNumber: ''
        },
        shopInfo: null,
        isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_KEY),
        loading: false,
        error: null
    },
    reducers: {
        // Synchronous actions
        logout: (state) => {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            state.currentUser = {
                user_email: '',
                user_avatar: '',
                user_fullName: '',
                user_dayOfBirth: null,
                user_sex: false,
                user_role: null,
                phoneNumber: ''
            };
            state.shopInfo = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        updateUserProfile: (state, action) => {
            state.currentUser = {
                ...state.currentUser,
                ...action.payload
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Login actions
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                // Map the user data from the API response to our state structure
                state.currentUser = {
                    user_email: action.payload.user_email || '',
                    user_avatar: action.payload.user_avatar || '',
                    user_fullName: action.payload.user_fullName || '',
                    user_dayOfBirth: action.payload.user_dayOfBirth || null,
                    user_sex:
                        action.payload.user_sex !== undefined ? action.payload.user_sex : false,
                    user_role: action.payload.user_role || null,
                    phoneNumber: action.payload.phoneNumber || '',
                    _id: action.payload._id || '',
                    // Preserve any other fields that might come from the API
                    ...action.payload
                };
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch profile actions
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.shopInfo = action.payload;

                // If the profile includes user data, update the user state as well
                if (action.payload.user) {
                    state.currentUser = {
                        ...state.currentUser,
                        ...action.payload.user
                    };
                }
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Export actions and reducer
export const { logout, clearError, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserEmail = (state) => state.user.currentUser.user_email;
export const selectUserAvatar = (state) => state.user.currentUser.user_avatar;
export const selectUserFullName = (state) => state.user.currentUser.user_fullName;
export const selectUserDayOfBirth = (state) => state.user.currentUser.user_dayOfBirth;
export const selectUserSex = (state) => state.user.currentUser.user_sex;
export const selectUserRole = (state) => state.user.currentUser.user_role;
export const selectShopInfo = (state) => state.user.shopInfo;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
