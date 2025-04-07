import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import wishlistReducer from './wishlistSlice';
import cartReducer from './slices/cartSlice';

// Create a Redux store
const store = configureStore({
    reducer: {
        user: userReducer,
        wishlist: wishlistReducer,
        cart: cartReducer
        // Add other reducers here as needed
    }
    // Add middleware or other configuration here if needed
});

export default store;
