import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    shop_id: null,
    shop_userId: null,
    shop_name: null,
    shop_email: null,
    shop_type: null,
    shop_logo: null,
    shop_location: null,
    shop_phoneNumber: null,
    shop_owner_fullName: null,
    shop_owner_email: null,
    shop_owner_phoneNumber: null,
    shop_owner_cardID: null,
    shop_status: null,
    is_brand: false
};

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        setShopInfo: (state, action) => {
            const shopData = action.payload;
            return {
                ...state,
                shop_id: shopData._id,
                shop_userId: shopData.shop_userId,
                shop_name: shopData.shop_name,
                shop_email: shopData.shop_email,
                shop_type: shopData.shop_type,
                shop_logo: shopData.shop_logo,
                shop_location: shopData.shop_location,
                shop_phoneNumber: shopData.shop_phoneNumber,
                shop_owner_fullName: shopData.shop_owner_fullName,
                shop_owner_email: shopData.shop_owner_email,
                shop_owner_phoneNumber: shopData.shop_owner_phoneNumber,
                shop_owner_cardID: shopData.shop_owner_cardID,
                shop_status: shopData.shop_status,
                is_brand: shopData.is_brand
            };
        },
        clearShopInfo: () => initialState,
        updateShopInfo: (state, action) => {
            return { ...state, ...action.payload };
        }
    }
});

export const { setShopInfo, clearShopInfo, updateShopInfo } = shopSlice.actions;

// Selectors
export const selectShopInfo = (state) => state.shop;
export const selectShopId = (state) => state.shop.shop_id;
export const selectShopStatus = (state) => state.shop.shop_status;

export default shopSlice.reducer;
