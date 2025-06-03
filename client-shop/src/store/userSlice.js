import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient, { setAuthTokens } from '../configs/axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../configs/jwt.config';
import { setShopInfo, clearShopInfo } from './slices/shopSlice';

// Helper function to check if token exists and is valid
const isTokenValid = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;

    try {
        // Basic token format check (should be JWT)
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        // Decode payload to check expiration
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;

        // Check if token is expired (with 5 minute buffer)
        return payload.exp > currentTime + 300;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};

// Async thunk for initializing authentication state on app start
export const initializeAuth = createAsyncThunk(
    'user/initializeAuth',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);

            if (!token || !isTokenValid()) {
                // Clear invalid tokens
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                return rejectWithValue('No valid token found');
            }

            // Set auth tokens in axios
            setAuthTokens(token, localStorage.getItem(REFRESH_TOKEN_KEY));

            // Fetch user profile to validate token and get user data
            const response = await axiosClient.get('/user/profile');
            const { user, shop } = response.data.metadata;

            // Update shop slice
            if (shop) {
                dispatch(setShopInfo(shop));
            }

            return { user, shop, isValid: true };
        } catch (error) {
            // If initialization fails, clear tokens
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            dispatch(clearShopInfo());

            console.error('Auth initialization failed:', error);
            return rejectWithValue('Authentication initialization failed');
        }
    }
);

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

            // Set auth tokens in axios
            setAuthTokens(token.accessToken, token.refreshToken);

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

            // Set auth tokens in axios
            setAuthTokens(token.accessToken, token.refreshToken);

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
    async (_, { rejectWithValue, dispatch, getState }) => {
        try {
            // Check if we actually have a token before making the request
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);
            if (!token) {
                return rejectWithValue('No authentication token available');
            }

            // Validate token before making request
            if (!isTokenValid()) {
                dispatch(clearAuthState());
                return rejectWithValue('Token expired or invalid');
            }

            const response = await axiosClient.get('/user/profile');
            const { user, shop } = response.data.metadata;

            // Update shop slice
            if (shop) {
                dispatch(setShopInfo(shop));
            }

            return { user, shop };
        } catch (error) {
            // If the profile fetch fails due to auth issues, clear the tokens and logout
            if (error.response?.status === 403 || error.response?.status === 401) {
                dispatch(clearAuthState());
            }
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
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if API call fails
        } finally {
            // Always clear local state
            dispatch(clearAuthState());
        }
        return true;
    }
);

// Determine initial authentication state more carefully
const getInitialAuthState = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;

    // Only return true if token exists and appears valid
    return isTokenValid();
};

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
    isAuthenticated: getInitialAuthState(),
    authInitialized: false, // Track if auth has been initialized
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
        },
        // Synchronous logout action for immediate state clearing
        clearAuthState: (state) => {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            return {
                ...initialState,
                isAuthenticated: false,
                authInitialized: true // Keep initialized state
            };
        },
        // Set auth initialized flag
        setAuthInitialized: (state) => {
            state.authInitialized = true;
        }
    },
    extraReducers: (builder) => {
        builder
            // Initialize auth actions
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.authInitialized = true;
                if (action.payload.isValid) {
                    state.currentUser = {
                        ...state.currentUser,
                        ...action.payload.user
                    };
                    state.isAuthenticated = true;
                } else {
                    state.isAuthenticated = false;
                }
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.loading = false;
                state.authInitialized = true;
                state.isAuthenticated = false;
                state.error = action.payload;
            })

            // Login actions
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.authInitialized = true;
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
                state.authInitialized = true;
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
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.authInitialized = true;
                state.currentUser = {
                    ...state.currentUser,
                    ...action.payload.user
                };
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.authInitialized = true;
                // Don't set error for profile fetch failures to avoid blocking UI
                console.error('Profile fetch failed:', action.payload);
            })

            // Logout actions
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.authInitialized = true;
                state.isAuthenticated = false;
                state.currentUser = initialState.currentUser;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.loading = false;
                state.authInitialized = true;
                state.isAuthenticated = false;
                state.currentUser = initialState.currentUser;
            });
    }
});

export const { clearError, updateUserProfile, clearAuthState, setAuthInitialized } =
    userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserId = (state) => state.user.currentUser._id;
export const selectUserEmail = (state) => state.user.currentUser.user_email;
export const selectUserAvatar = (state) => state.user.currentUser.user_avatar;
export const selectUserFullName = (state) => state.user.currentUser.user_fullName;
export const selectUserRole = (state) => state.user.currentUser.user_role;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectAuthInitialized = (state) => state.user.authInitialized;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
