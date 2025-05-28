import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import addressReducer from './slices/addressSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        cart: cartReducer,
        address: addressReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
