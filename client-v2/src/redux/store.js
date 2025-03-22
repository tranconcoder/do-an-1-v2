import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import wishlistReducer from './wishlistSlice';

// Create a Redux store
const store = configureStore({
    reducer: {
        user: userReducer,
        wishlist: wishlistReducer
        // Add other reducers here as needed
    }
    // Add middleware or other configuration here if needed
});

export default store;
