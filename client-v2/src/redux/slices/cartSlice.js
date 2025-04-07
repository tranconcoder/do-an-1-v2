import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../configs/axios';
import { API_URL } from '../../configs/env.config';

// Async thunk for fetching cart data
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get('/cart');

        return response.data.metadata;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
});

const initialState = {
    items: [], // Array of cart items
    loading: false,
    error: null
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { id, cart_quantity, product_name, product_price, product_thumb } =
                action.payload;
            const existingItem = state.items.find((item) => item.id === id);

            if (existingItem) {
                existingItem.cart_quantity += cart_quantity;
            } else {
                state.items.push({
                    id,
                    cart_quantity,
                    product_name,
                    product_price,
                    product_thumb: `${API_URL}/media/${product_thumb}`
                });
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        updateCartQuantity: (state, action) => {
            const { id, cart_quantity } = action.payload;
            const item = state.items.find((item) => item.id === id);
            if (item) {
                item.cart_quantity = cart_quantity;
            }
        },
        clearCart: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.cart_shop.flatMap((shop) =>
                    shop.products.map((product) => ({
                        id: product.sku,
                        cart_quantity: product.cart_quantity,
                        product_name: product.product_name,
                        product_price: product.product_price,
                        product_thumb: `${API_URL}/media/${product.product_thumb}`,
                        shop_id: shop.shop
                    }))
                );
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartItemCount = (state) =>
    state.cart.items.reduce((total, item) => total + item.cart_quantity, 0);
export const selectCartTotal = (state) =>
    state.cart.items.reduce((total, item) => total + item.cart_quantity * item.product_price, 0);

export default cartSlice.reducer;
