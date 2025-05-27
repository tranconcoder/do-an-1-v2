import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import cartService, { CartItem } from '@/lib/services/api/cartService';
import { useDispatch } from 'react-redux';

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    isLoading: false,
    error: null
};

// Async thunks for cart operations
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const items = await cartService.getCart();
        return items; // cartService.getCart() returns Promise<CartItem[]>
    } catch (error: any) {
        // Use a more generic error message as service returns void on error
        return rejectWithValue('Failed to fetch cart');
    }
});

export const addItemToCart = createAsyncThunk(
    'cart/addItemToCart',
    async (
        { skuId, quantity }: { skuId: string; quantity: number },
        { rejectWithValue, getState, dispatch }
    ) => {
        try {
            await cartService.increaseItemQuantity(skuId, quantity);

            const state = (getState() as any).cart as CartState;
            if (!state.items.find((item: CartItem) => item.sku_id === skuId)) {
                dispatch(fetchCart());
            }

            return null;
        } catch (error: any) {
            return rejectWithValue('Failed to add item to cart');
        }
    }
);

export const decreaseItemQuantity = createAsyncThunk(
    'cart/decreaseItemQuantity',
    async (skuId: string, { rejectWithValue }) => {
        try {
            await cartService.decreaseItemQuantity(skuId);
            return null;
        } catch (error: any) {
            return rejectWithValue('Failed to decrease item quantity');
        }
    }
);

export const removeItemFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (skuId: string, { rejectWithValue }) => {
        try {
            await cartService.removeItemFromCart(skuId);

            return null;
        } catch (error: any) {
            return rejectWithValue('Failed to remove item from cart');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartState: (state) => {
            state.items = [];
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
                state.isLoading = false;
                state.items = action.payload; // Payload is the array of CartItem
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch cart';
                state.items = []; // Clear items on fetch error
            })
            // Add item to cart (handles increase too)
            .addCase(addItemToCart.pending, (state) => {
                // state.isLoading = true; // Optional: indicate update is in progress
                state.error = null;
            })
            .addCase(addItemToCart.fulfilled, (state, action) => {
                // State update handled by subsequent fetchCart in component
                // state.isLoading = false;

                const index = state.items.findIndex(
                    (item: CartItem) => item.sku_id === action.meta.arg.skuId
                );
                if (index !== -1) {
                    state.items[index].quantity++;
                } else {
                }
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                // state.isLoading = false;
                state.error = (action.payload as string) || 'Failed to add item';
            })
            // Decrease item quantity
            .addCase(decreaseItemQuantity.pending, (state) => {
                // state.isLoading = true;
                state.error = null;
            })
            .addCase(decreaseItemQuantity.fulfilled, (state, action) => {
                // state.isLoading = false;

                const skuId = action.meta.arg;
                const index = state.items.findIndex((item: CartItem) => item.sku_id === skuId);

                if (index !== -1) {
                    state.items[index].quantity--;
                }
            })
            .addCase(decreaseItemQuantity.rejected, (state, action) => {
                // state.isLoading = false;
                state.error = (action.payload as string) || 'Failed to decrease quantity';
            })
            // Remove item from cart
            .addCase(removeItemFromCart.pending, (state) => {
                // state.isLoading = true;
                state.error = null;
            })
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                // state.isLoading = false;

                const skuId = action.meta.arg;
                const index = state.items.findIndex((item: CartItem) => item.sku_id === skuId);

                if (index !== -1) {
                    state.items.splice(index, 1);
                }
            })
            .addCase(removeItemFromCart.rejected, (state, action) => {
                // state.isLoading = false;
                state.error = (action.payload as string) || 'Failed to remove item';
            });
    }
});

export const { clearCartState } = cartSlice.actions;

export default cartSlice.reducer;
