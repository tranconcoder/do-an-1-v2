import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import addressService, { Address, CreateAddressPayload, UpdateAddressPayload } from '@/lib/services/api/addressService';

// Define the state interface
interface AddressState {
    addresses: Address[];
    defaultAddress: Address | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
}

// Initial state
const initialState: AddressState = {
    addresses: [],
    defaultAddress: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
};

// Async thunks for API calls
export const fetchUserAddresses = createAsyncThunk(
    'address/fetchUserAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const addresses = await addressService.getUserAddresses();
            return addresses;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
        }
    }
);

export const fetchDefaultAddress = createAsyncThunk(
    'address/fetchDefaultAddress',
    async (_, { rejectWithValue }) => {
        try {
            const defaultAddress = await addressService.getDefaultAddress();
            return defaultAddress;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch default address');
        }
    }
);

export const createAddress = createAsyncThunk(
    'address/createAddress',
    async (payload: CreateAddressPayload, { rejectWithValue, dispatch }) => {
        try {
            const newAddress = await addressService.createAddress(payload);
            // Refresh the address list after creating
            dispatch(fetchUserAddresses());
            return newAddress;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create address');
        }
    }
);

export const updateAddress = createAsyncThunk(
    'address/updateAddress',
    async ({ addressId, payload }: { addressId: string; payload: UpdateAddressPayload }, { rejectWithValue, dispatch }) => {
        try {
            const updatedAddress = await addressService.updateAddress(addressId, payload);
            // Refresh the address list after updating
            dispatch(fetchUserAddresses());
            return updatedAddress;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update address');
        }
    }
);

export const setDefaultAddress = createAsyncThunk(
    'address/setDefaultAddress',
    async (addressId: string, { rejectWithValue, dispatch }) => {
        try {
            const updatedAddress = await addressService.setDefaultAddress(addressId);
            // Refresh the address list after setting default
            dispatch(fetchUserAddresses());
            return updatedAddress;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
        }
    }
);

export const deleteAddress = createAsyncThunk(
    'address/deleteAddress',
    async (addressId: string, { rejectWithValue, dispatch }) => {
        try {
            await addressService.deleteAddress(addressId);
            // Refresh the address list after deleting
            dispatch(fetchUserAddresses());
            return addressId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
        }
    }
);

// Create the slice
const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAddressState: (state) => {
            state.addresses = [];
            state.defaultAddress = null;
            state.isLoading = false;
            state.isCreating = false;
            state.isUpdating = false;
            state.isDeleting = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch user addresses
        builder
            .addCase(fetchUserAddresses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserAddresses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.addresses = action.payload;
                // Update default address from the list
                state.defaultAddress = action.payload.find(addr => addr.is_default) || null;
            })
            .addCase(fetchUserAddresses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch default address
        builder
            .addCase(fetchDefaultAddress.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.defaultAddress = action.payload;
            })
            .addCase(fetchDefaultAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create address
        builder
            .addCase(createAddress.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createAddress.fulfilled, (state) => {
                state.isCreating = false;
            })
            .addCase(createAddress.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload as string;
            });

        // Update address
        builder
            .addCase(updateAddress.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state) => {
                state.isUpdating = false;
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        // Set default address
        builder
            .addCase(setDefaultAddress.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(setDefaultAddress.fulfilled, (state) => {
                state.isUpdating = false;
            })
            .addCase(setDefaultAddress.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        // Delete address
        builder
            .addCase(deleteAddress.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state) => {
                state.isDeleting = false;
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { clearError, resetAddressState } = addressSlice.actions;

// Export reducer
export default addressSlice.reducer; 