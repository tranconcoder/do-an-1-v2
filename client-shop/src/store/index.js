import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import warehouseReducer from './slices/warehouseSlice';
import shopReducer from './slices/shopSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        warehouses: warehouseReducer,
        shop: shopReducer
    }
});

export default store;
