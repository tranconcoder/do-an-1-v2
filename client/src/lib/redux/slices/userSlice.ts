import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    isAuthenticated: boolean;
    user: {
        id?: string;
        name?: string;
        email?: string;
        token?: string;
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<any>) => {
            state.isAuthenticated = true;
            state.user = action.payload;
            state.loading = false;
            state.error = null;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        }
    }
});

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export const userReducer = userSlice.reducer;
