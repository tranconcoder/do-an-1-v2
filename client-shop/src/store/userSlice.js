import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient, { setAuthTokens } from '../configs/axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../configs/jwt.config';
import { setShopInfo, clearShopInfo } from './slices/shopSlice';

// Async thunk for login operation
export const loginUser = createAsyncThunk(
    'user/login',
    async ({ phoneNumber, password }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosClient.post('/auth/login', { phoneNumber, password });
            if (response.status !== 200) {
                return rejectWithValue(response.message || 'Login failed');
            }

            const { user, shop, token } = response.data.metadata;

            // Check if 'shop' exists in the response metadata
            if (!shop) {
                return rejectWithValue({
                    message: 'Tài khoản này không phải là tài khoản cửa hàng'
                });
            }

            // Check if shop status is active
            if (shop.shop_status !== 'active') {
                return rejectWithValue({
                    message: 'Tài khoản cửa hàng chưa được kích hoạt'
                });
            }

            // Store tokens
            localStorage.setItem(ACCESS_TOKEN_KEY, token.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);

            // Update shop slice
            dispatch(setShopInfo(shop));

            return { user, shop };
        } catch (error) {
            console.log({ error });
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

// Async thunk for registering a shop
export const registerShop = createAsyncThunk(
    'user/registerShop',
    async (shopData, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosClient.post('/auth/sign-up-shop', shopData);

            if (response.status !== 201) {
                const errorMessage =
                    response.data?.message || response.message || 'Shop registration failed';
                return rejectWithValue(errorMessage);
            }

            const { user, shop, token } = response.data.metadata;

            // Store tokens
            localStorage.setItem(ACCESS_TOKEN_KEY, token.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);

            // Update shop slice
            dispatch(setShopInfo(shop));

            return { user, shop };
        } catch (error) {
            console.error('Shop registration error:', error);
            return rejectWithValue(error.response?.data || 'Shop registration failed');
        }
    }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosClient.get('/user/profile');
            const { user, shop } = response.data.metadata;

            // Update shop slice
            if (shop) {
                dispatch(setShopInfo(shop));
            }

            return { user, shop };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

// Async thunk for logout operation
export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            await axiosClient.post('/auth/logout');
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            dispatch(clearShopInfo());
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

const initialState = {
    currentUser: {
        _id: '',
        phoneNumber: '',
        user_avatar: '',
        user_fullName: '',
        user_email: '',
        user_role: null,
        user_sex: false,
        user_status: 'ACTIVE'
    },
    isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_KEY),
    loading: false,
    error: null
};

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
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
                state.currentUser = {
                    ...state.currentUser,
                    ...action.payload.user
                };
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
                state.currentUser = {
                    ...state.currentUser,
                    ...action.payload.user
                };
                state.isAuthenticated = true;
            })
            .addCase(registerShop.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch profile actions
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
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
                return initialState;
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
export const selectUserId = (state) => state.user.currentUser._id;
export const selectUserEmail = (state) => state.user.currentUser.user_email;
export const selectUserAvatar = (state) => state.user.currentUser.user_avatar;
export const selectUserFullName = (state) => state.user.currentUser.user_fullName;
export const selectUserRole = (state) => state.user.currentUser.user_role;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
