import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    phoneNumber: null,
    fullName: null,
    email: null,
    role: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.phoneNumber = action.payload.phoneNumber;
            state.fullName = action.payload.fullName;
            state.email = action.payload.email;
            state.role = action.payload.role;
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
    }
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUserInfo } = userSlice.actions;

// Selector to get user info
export const selectUserInfo = (state) => state.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;
