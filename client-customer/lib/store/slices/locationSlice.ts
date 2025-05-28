import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationService, { Province, District, Ward, Location, CreateLocationPayload } from '@/lib/services/api/locationService';

// Define the state interface
interface LocationState {
    provinces: Province[];
    districts: District[];
    wards: Ward[];
    isLoadingProvinces: boolean;
    isLoadingDistricts: boolean;
    isLoadingWards: boolean;
    isCreatingLocation: boolean;
    error: string | null;
}

// Initial state
const initialState: LocationState = {
    provinces: [],
    districts: [],
    wards: [],
    isLoadingProvinces: false,
    isLoadingDistricts: false,
    isLoadingWards: false,
    isCreatingLocation: false,
    error: null,
};

// Async thunks for API calls
export const fetchProvinces = createAsyncThunk(
    'location/fetchProvinces',
    async (_, { rejectWithValue }) => {
        try {
            const provinces = await locationService.getProvinces();
            return provinces;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch provinces');
        }
    }
);

export const fetchDistricts = createAsyncThunk(
    'location/fetchDistricts',
    async (provinceId: string, { rejectWithValue }) => {
        try {
            const districts = await locationService.getDistricts(provinceId);
            return districts;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch districts');
        }
    }
);

export const fetchWards = createAsyncThunk(
    'location/fetchWards',
    async (districtId: string, { rejectWithValue }) => {
        try {
            const wards = await locationService.getWards(districtId);
            return wards;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch wards');
        }
    }
);

export const createLocation = createAsyncThunk(
    'location/createLocation',
    async (payload: CreateLocationPayload, { rejectWithValue }) => {
        try {
            const location = await locationService.createLocation(payload);
            return location;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create location');
        }
    }
);

// Create the slice
const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        clearLocationError: (state) => {
            state.error = null;
        },
        clearDistricts: (state) => {
            state.districts = [];
        },
        clearWards: (state) => {
            state.wards = [];
        },
        resetLocationState: (state) => {
            state.provinces = [];
            state.districts = [];
            state.wards = [];
            state.isLoadingProvinces = false;
            state.isLoadingDistricts = false;
            state.isLoadingWards = false;
            state.isCreatingLocation = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch provinces
        builder
            .addCase(fetchProvinces.pending, (state) => {
                state.isLoadingProvinces = true;
                state.error = null;
            })
            .addCase(fetchProvinces.fulfilled, (state, action) => {
                state.isLoadingProvinces = false;
                state.provinces = action.payload;
            })
            .addCase(fetchProvinces.rejected, (state, action) => {
                state.isLoadingProvinces = false;
                state.error = action.payload as string;
            });

        // Fetch districts
        builder
            .addCase(fetchDistricts.pending, (state) => {
                state.isLoadingDistricts = true;
                state.error = null;
            })
            .addCase(fetchDistricts.fulfilled, (state, action) => {
                state.isLoadingDistricts = false;
                state.districts = action.payload;
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.isLoadingDistricts = false;
                state.error = action.payload as string;
            });

        // Fetch wards
        builder
            .addCase(fetchWards.pending, (state) => {
                state.isLoadingWards = true;
                state.error = null;
            })
            .addCase(fetchWards.fulfilled, (state, action) => {
                state.isLoadingWards = false;
                state.wards = action.payload;
            })
            .addCase(fetchWards.rejected, (state, action) => {
                state.isLoadingWards = false;
                state.error = action.payload as string;
            });

        // Create location
        builder
            .addCase(createLocation.pending, (state) => {
                state.isCreatingLocation = true;
                state.error = null;
            })
            .addCase(createLocation.fulfilled, (state) => {
                state.isCreatingLocation = false;
            })
            .addCase(createLocation.rejected, (state, action) => {
                state.isCreatingLocation = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { clearLocationError, clearDistricts, clearWards, resetLocationState } = locationSlice.actions;

// Export reducer
export default locationSlice.reducer; 