import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

// Create a Redux store
const store = configureStore({
    reducer: {
        user: userReducer
        // Add other reducers here as needed
    }
    // Add middleware or other configuration here if needed
});

export default store;
