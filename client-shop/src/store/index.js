import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import warehouseReducer from './slices/warehouseSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        warehouses: warehouseReducer
    }
});

export default store;
