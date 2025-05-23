import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient, { setAuthTokens } from '../configs/axios';
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

            // Store tokens in localStorage
            setAuthTokens({
                accessToken: response.metadata.token.accessToken,
                refreshToken: response.metadata.token.refreshToken
            });

            // Check if the user is an admin - properly check the value, not just existence
            const isAdmin = response.metadata.admin === true;
            console.log('Login response metadata:', response.metadata);
            console.log('Is admin from login:', isAdmin);

            // Return user info with admin flag
            return {
                ...response.metadata.user,
                isAdmin
            };
        } catch (error) {
            console.error('Login error:', error);
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/user/profile');

            // Check if user is admin - properly check the value, not just existence
            const isAdmin = response.metadata?.admin === true;
            console.log('Profile metadata:', response.metadata);
            console.log('Is admin from profile:', isAdmin);

            return {
                ...(response.metadata || response.data),
                isAdmin
            };
        } catch (error) {
            console.error('Profile fetch error:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

// Async thunk for logout operation
export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            // Call logout endpoint
            await axiosClient.post('/auth/logout');

            // Clear tokens and state
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);

            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: {
            _id: '',
            user_email: '',
            user_avatar: '',
            user_fullName: '',
            phoneNumber: '', // Changed from user_phoneNumber to phoneNumber
            user_role: null,
            isAdmin: false
            // Other user model properties
        },
        isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_KEY),
        loading: false,
        error: null
    },
    reducers: {
        // Synchronous actions
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
                    _id: action.payload._id || '',
                    user_email: action.payload.user_email || '',
                    user_avatar: action.payload.user_avatar || '',
                    user_fullName: action.payload.user_fullName || '',
                    phoneNumber: action.payload.phoneNumber || '', // Changed from user_phoneNumber to phoneNumber
                    user_role: action.payload.user_role || null,
                    isAdmin: action.payload.isAdmin || false
                    // Preserve any other fields that might come from the API
                    // ...action.payload
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

                // Update user state with returned data
                state.currentUser = {
                    ...state.currentUser,
                    ...action.payload,
                    isAdmin: action.payload.isAdmin || false
                };

                // If the profile includes nested user data, also merge that
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
            })

            // Logout actions
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.currentUser = {
                    _id: '',
                    user_email: '',
                    user_avatar: '',
                    user_fullName: '',
                    phoneNumber: '', // Changed from user_phoneNumber to phoneNumber
                    user_role: null,
                    isAdmin: false
                };
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Export actions and reducer
export const { clearError, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserEmail = (state) => state.user.currentUser.user_email;
export const selectUserAvatar = (state) => state.user.currentUser.user_avatar;
export const selectUserFullName = (state) => state.user.currentUser.user_fullName;
export const selectUserPhoneNumber = (state) => state.user.currentUser.phoneNumber; // Changed from user_phoneNumber to phoneNumber
export const selectUserRole = (state) => state.user.currentUser.user_role;
export const selectIsAdmin = (state) => state.user.currentUser.isAdmin;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
