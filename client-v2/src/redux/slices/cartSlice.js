import { createSlice } from '@reduxjs/toolkit';

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
            const { id, cart_quantity, product_name, product_price, product_thumb } = action.payload;
            const existingItem = state.items.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.cart_quantity += cart_quantity;
            } else {
                state.items.push({
                    id,
                    cart_quantity,
                    product_name,
                    product_price,
                    product_thumb
                });
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        updateCartQuantity: (state, action) => {
            const { id, cart_quantity } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (item) {
                item.cart_quantity = cart_quantity;
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    setError,
    setLoading 
} = cartSlice.actions;

// Selectors
export const selectCartItems = state => state.cart.items;
export const selectCartLoading = state => state.cart.loading;
export const selectCartError = state => state.cart.error;
export const selectCartItemCount = state => state.cart.items.reduce((total, item) => total + item.cart_quantity, 0);
export const selectCartTotal = state => state.cart.items.reduce((total, item) => total + (item.cart_quantity * item.product_price), 0);

export default cartSlice.reducer;