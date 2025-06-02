import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import warehouseReducer from './slices/warehouseSlice';
import shopReducer from './slices/shopSlice';
import chatReducer from './slices/chatSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        warehouses: warehouseReducer,
        shop: shopReducer,
        chat: chatReducer
    }
});

export default store;
