import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient, { setAuthTokens } from '../configs/axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../configs/jwt.config';

// ...existing code...

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
    initialState: {
        // ...existing code...
    },
    reducers: {
        // ...existing code...
    },
    extraReducers: (builder) => {
        builder
            // ...existing code...

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

// ...existing code...
