import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

const store = configureStore({
    reducer: {
        user: userReducer
        // Add other reducers here as needed
    }
    // Optional: configure middleware, devTools, etc.
});

export default store;
