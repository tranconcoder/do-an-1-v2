import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer
        // Add other reducers here as needed
    }
    // Optional: configure middleware, devTools, etc.
});

export default store;
