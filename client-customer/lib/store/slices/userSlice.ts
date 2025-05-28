import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import userService, { UserProfile } from '@/lib/services/api/userService';

// Define types based on the provided login response
export interface User {
    _id: string;
    phoneNumber: string;
    user_avatar: string;
    user_fullName: string;
    user_email: string;
    user_role: string;
    user_sex: boolean; // Changed to boolean to match UserProfile
    user_status: string;
    user_dayOfBirth: string; // Added based on response
    role_name?: string; // Changed to optional string to match UserProfile
}

export interface Shop {
    _id: string;
    shop_userId: string;
    shop_name: string;
    shop_email: string;
    shop_type: string;
    shop_logo: string;
    shop_certificate: string;
    shop_location: string;
    shop_phoneNumber: string;
    shop_description?: string;
    shop_owner_fullName: string;
    shop_owner_email: string;
    shop_owner_phoneNumber: string;
    shop_owner_cardID: string;
    shop_status: string;
    is_brand: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
}

interface UserState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    shop: Shop | null; // Add shop information
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    shop: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

export interface LoginSuccessPayload {
    user: User;
    token: {
        accessToken: string;
        refreshToken: string;
    };
    shop?: Shop; // Shop is optional
}

/* ---------------------------------------------------------- */
/*                        Async Thunks                        */
/* ---------------------------------------------------------- */

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getProfile();
            return response.metadata.user; // Assuming the user data is in response.metadata.user
        } catch (error: any) {
            // Handle errors and return a rejected value
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

/* ---------------------------------------------------------- */
/*                           Slice                            */
/* ---------------------------------------------------------- */

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart(state) {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess(state, action: PayloadAction<LoginSuccessPayload>) {
            state.user = action.payload.user;
            state.accessToken = action.payload.token.accessToken;
            state.refreshToken = action.payload.token.refreshToken;
            state.shop = action.payload.shop || null; // Set shop if present
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        loginFailure(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.shop = null;
        },
        logout(state) {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.shop = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('shop');
            }
        },
        // Optional: Action to load user from storage if needed on app init
        loadUserFromStorage(state, action: PayloadAction<UserState>) {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.shop = action.payload.shop;
            state.isAuthenticated = action.payload.isAuthenticated;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchUser thunk
            .addCase(fetchUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true; // Assume fetching user means authenticated
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false; // Assume failure to fetch user means not authenticated
                state.user = null;
                state.accessToken = null; // Clear tokens on fetch failure
                state.refreshToken = null;
                state.shop = null;
            });
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, loadUserFromStorage } =
    userSlice.actions;

export default userSlice.reducer;
