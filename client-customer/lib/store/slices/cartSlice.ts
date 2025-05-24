import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import cartService, { CartItem, CartSummary, UpdateCartPayload } from '../../services/api/cartService';

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: CartState = {
  items: [],
  summary: {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  },
  isLoading: false,
  isUpdating: false,
  error: null,
  lastUpdated: null
};

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      // Ensure response.data is not null or undefined, and has the expected structure
      if (response && response.data && response.data.items !== undefined && response.data.summary !== undefined) {
        if (response.data.items.length === 0) {
          // Return 3 fake cart items if the API response array is empty
          const fakeItems = [
            {
              _id: "fake_cart_item_1",
              skuId: "fake_sku_1",
              quantity: 1,
              product: {
                _id: "fake_product_1",
                product_name: "Fake Product 1",
                product_description: "This is a fake product for testing purposes.",
                product_images: ["https://via.placeholder.com/150"],
                product_price: 100000,
                product_discount: 10,
              },
              sku: {
                _id: "fake_sku_1",
                sku_price: 100000,
                sku_stock: 100,
                sku_attributes: [{ attribute_name: "Color", attribute_value: "Red" }],
              },
              shop: {
                _id: "fake_shop_1",
                shop_name: "Fake Shop A",
                shop_logo: "https://via.placeholder.com/50",
              },
            },
            {
              _id: "fake_cart_item_2",
              skuId: "fake_sku_2",
              quantity: 2,
              product: {
                _id: "fake_product_2",
                product_name: "Fake Product 2",
                product_description: "Another fake product for demonstration.",
                product_images: ["https://via.placeholder.com/150"],
                product_price: 250000,
                product_discount: 0,
              },
              sku: {
                _id: "fake_sku_2",
                sku_price: 250000,
                sku_stock: 50,
                sku_attributes: [{ attribute_name: "Size", attribute_value: "M" }],
              },
              shop: {
                _id: "fake_shop_2",
                shop_name: "Fake Shop B",
                shop_logo: "https://via.placeholder.com/50",
              },
            },
            {
              _id: "fake_cart_item_3",
              skuId: "fake_sku_3",
              quantity: 1,
              product: {
                _id: "fake_product_3",
                product_name: "Fake Product 3",
                product_description: "A third fake product to fill the cart.",
                product_images: ["https://via.placeholder.com/150"],
                product_price: 50000,
                product_discount: 5,
              },
              sku: {
                _id: "fake_sku_3",
                sku_price: 50000,
                sku_stock: 200,
                sku_attributes: [{ attribute_name: "Material", attribute_value: "Cotton" }],
              },
              shop: {
                _id: "fake_shop_1",
                shop_name: "Fake Shop A",
                shop_logo: "https://via.placeholder.com/50",
              },
            },
          ];
          const fakeSummary = cartService.calculateSummary(fakeItems);
          return { items: fakeItems, summary: fakeSummary };
        }
        return response.data;
      } else {
        // Return a default empty cart structure if data is missing or malformed
        return {
          items: [],
          summary: {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            itemCount: 0
          }
        };
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ skuId, quantity }: { skuId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(skuId, quantity);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItems = createAsyncThunk(
  'cart/updateCartItems',
  async (payload: UpdateCartPayload, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCart(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ skuId, quantity }: { skuId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateItemQuantity(skuId, quantity);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item quantity');
    }
  }
);

export const decreaseItemQuantity = createAsyncThunk(
  'cart/decreaseItemQuantity',
  async (skuId: string, { rejectWithValue }) => {
    try {
      const response = await cartService.decreaseItemQuantity(skuId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to decrease item quantity');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (skuId: string, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(skuId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.summary = initialState.summary;
      state.lastUpdated = Date.now();
    },
    // Optimistic update for better UX
    optimisticUpdateQuantity: (state, action: PayloadAction<{ skuId: string; quantity: number }>) => {
      const { skuId, quantity } = action.payload;
      const item = state.items.find(item => item.skuId === skuId);
      if (item) {
        item.quantity = quantity;
        state.summary = cartService.calculateSummary(state.items);
        state.lastUpdated = Date.now();
      }
    },
    // Optimistic remove for better UX
    optimisticRemoveItem: (state, action: PayloadAction<string>) => {
      const skuId = action.payload;
      state.items = state.items.filter(item => item.skuId !== skuId);
      state.summary = cartService.calculateSummary(state.items);
      state.lastUpdated = Date.now();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.lastUpdated = Date.now();
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Update cart items
      .addCase(updateCartItems.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCartItems.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.lastUpdated = Date.now();
      })
      .addCase(updateCartItems.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Update item quantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.lastUpdated = Date.now();
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Decrease item quantity
      .addCase(decreaseItemQuantity.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(decreaseItemQuantity.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.lastUpdated = Date.now();
      })
      .addCase(decreaseItemQuantity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
        state.lastUpdated = Date.now();
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  clearError, 
  clearCart, 
  optimisticUpdateQuantity, 
  optimisticRemoveItem 
} = cartSlice.actions;

export default cartSlice.reducer;