import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../configs/axios';

// Action để fetch warehouses từ API
export const fetchWarehouses = createAsyncThunk(
    'warehouses/fetchWarehouses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/warehouse');
            return response.data.metadata;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải thông tin kho');
        }
    }
);

const initialState = {
    warehouses: [],
    loading: false,
    error: null
};

const warehouseSlice = createSlice({
    name: 'warehouses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWarehouses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouses.fulfilled, (state, action) => {
                state.loading = false;
                state.warehouses = action.payload;
            })
            .addCase(fetchWarehouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    }
});

export default warehouseSlice.reducer;