import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient, { setAuthTokens } from '../../configs/axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../configs/token.config';

// Initial state definition
const initialState = {
    id: null,
    phoneNumber: null,
    user_fullName: null,
    user_email: null,
    user_role: null,
    isLoading: false,
    isAuthenticated: false,
    error: null
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
    'user/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/login', credentials);
            const { user, token } = response.data.metadata;

            // Store tokens in localStorage
            localStorage.setItem(ACCESS_TOKEN_KEY, token.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);

            return user;
        } catch (error) {
            console.error('Login error:', error);
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Async thunk for fetching user profile
export const fetchUser = createAsyncThunk('user/fetchUser', async (_, { rejectWithValue }) => {
    try {
        // Check if token exists in localStorage
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!token) {
            return rejectWithValue('No authentication token found');
        }

        // Fetch the user profile - using the correct endpoint
        const response = await axiosClient.get('/user/profile');

        // Return the metadata field from the response
        return response.data.metadata.user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
});

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

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.id = action.payload.id;
            state.phoneNumber = action.payload.phoneNumber;
            state.fullName = action.payload.fullName;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        loginFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            return initialState;
        },
        updateUserInfo: (state, action) => {
            return { ...state, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            // Login actions
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.id = action.payload.id;
                state.phoneNumber = action.payload.phoneNumber;
                state.fullName = action.payload.fullName;
                state.email = action.payload.email;
                state.role = action.payload.role;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch user profile actions
            .addCase(fetchUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.id = action.payload.id;
                state.phoneNumber = action.payload.phoneNumber;
                state.fullName = action.payload.fullName;
                state.email = action.payload.email;
                state.role = action.payload.role;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            })

            // Logout actions
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                return initialState;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUserInfo } = userSlice.actions;

// Selectors to get user info
export const selectUserInfo = (state) => state.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;
