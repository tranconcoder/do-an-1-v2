import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient, { setAuthTokens } from '../configs/axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../configs/jwt.config';

// Async thunk for login operation
export const loginUser = createAsyncThunk(
    'user/login',
    async ({ phoneNumber, password }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/login', { phoneNumber, password });
            if (response.status !== 200) {
                return rejectWithValue(response.message || 'Login failed');
            }
            console.log(response);

            // Check if 'shop' exists in the response metadata using 'in' operator
            if (!('shop' in response.data.metadata)) {
                return rejectWithValue({
                    message: 'Tài khoản này không phải là tài khoản cửa hàng'
                });
            }

            // Check if shop status is active
            if (response.data.metadata.shop.shop_status !== 'active') {
                return rejectWithValue({
                    message: 'Tài khoản cửa hàng chưa được kích hoạt'
                });
            }

            // Only store tokens if the user has shop permissions
            console.log(response.data);
            localStorage.setItem(ACCESS_TOKEN_KEY, response.data.metadata.token.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, response.data.metadata.token.refreshToken);

            // Return both user info and shop info from the response
            return {
                user: response.data.metadata.user,
                shop: response.data.metadata.shop
            };
        } catch (error) {
            console.log({ error });
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

// Async thunk for registering a shop
export const registerShop = createAsyncThunk(
    'user/registerShop',
    async (shopData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/sign-up-shop', shopData);

            console.log('Shop registration response:', response);

            // Check response status in response.data or response directly
            if (response.status !== 201) {
                const errorMessage =
                    response.data?.message || response.message || 'Shop registration failed';

                return rejectWithValue(errorMessage);
            }

            // Check if tokens are in response.data.metadata or response.metadata
            const metadata = response.data?.metadata || response.metadata;

            if (!metadata || !metadata.token) {
                console.error('Missing token data in registration response', response);
                return rejectWithValue('Registration completed but token data is missing');
            }

            // Store tokens in localStorage
            localStorage.setItem(ACCESS_TOKEN_KEY, metadata.token.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, metadata.token.refreshToken);

            // Return both user and shop info from the response
            return {
                user: metadata.user,
                shop: metadata.shop
            };
        } catch (error) {
            console.error('Shop registration error:', error);
            return rejectWithValue(error.response?.data || 'Shop registration failed');
        }
    }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/user/profile');

            // Make sure we have the shop information in the response
            if (response.data && response.data.metadata && response.data.metadata.shop) {
                return {
                    user: response.data.metadata.user,
                    shop: response.data.metadata.shop
                };
            }
            return response.data.metadata || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch profile');
        }
    }
);

// Async thunk for logout operation
export const logoutUser = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
    try {
        await axiosClient.post('/auth/logout');
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
});

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
                    user_email: action.payload.user.user_email || '',
                    user_avatar: action.payload.user.user_avatar || '',
                    user_fullName: action.payload.user.user_fullName || '',
                    user_dayOfBirth: action.payload.user.user_dayOfBirth || null,
                    user_sex:
                        action.payload.user.user_sex !== undefined
                            ? action.payload.user.user_sex
                            : false,
                    user_role: action.payload.user.user_role || null,
                    phoneNumber: action.payload.user.phoneNumber || '',
                    _id: action.payload.user._id || '',
                    // Preserve any other fields that might come from the API
                    ...action.payload.user
                };
                state.shopInfo = action.payload.shop;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Shop registration actions
            .addCase(registerShop.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerShop.fulfilled, (state, action) => {
                state.loading = false;
                // Update user information
                state.currentUser = {
                    user_email: action.payload.user.user_email || '',
                    user_avatar: action.payload.user.user_avatar || '',
                    user_fullName: action.payload.user.user_fullName || '',
                    user_dayOfBirth: action.payload.user.user_dayOfBirth || null,
                    user_sex:
                        action.payload.user.user_sex !== undefined
                            ? action.payload.user.user_sex
                            : false,
                    user_role: action.payload.user.user_role || null,
                    phoneNumber: action.payload.user.phoneNumber || '',
                    _id: action.payload.user._id || '',
                    // Preserve any other fields
                    ...action.payload.user
                };
                // Store the shop information
                state.shopInfo = action.payload.shop;
                state.isAuthenticated = true;
            })
            .addCase(registerShop.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch profile actions
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;

                // If we have shop data in the response, update the shopInfo state
                if (action.payload.shop) {
                    state.shopInfo = action.payload.shop;
                }

                // If we have user data in the response, update the user state
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
                state.currentUser = null;
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
export const { logout, clearError, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserEmail = (state) => state.user.currentUser.user_email;
export const selectUserAvatar = (state) => state.user.currentUser.user_avatar;
export const selectUserFullName = (state) => state.user.currentUser.user_fullName;
export const selectUserDayOfBirth = (state) => state.user.currentUser.user_dayOfBirth;
export const selectUserSex = (state) => state.user.currentUser;
export const selectShopInfo = (state) => state.user.shopInfo;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
