import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

const API_URL = 'https://course-api-veiu.onrender.com';

export interface Merchant {
  shop: string;
  name: string | null;
  email: string | null;
  shopOwner: string | null;
}

export interface AuthState {
  token: string | null;
  shop: string | null;
  merchant: Merchant | null;
  loading: boolean;
  error: string | null;
}

const initialToken = localStorage.getItem('merchant_token');
const initialShop = localStorage.getItem('merchant_shop');
const initialMerchant = localStorage.getItem('merchant_data')
  ? JSON.parse(localStorage.getItem('merchant_data')!)
  : null;

const initialState: AuthState = {
  token: initialToken,
  shop: initialShop,
  merchant: initialMerchant,
  loading: false,
  error: null,
};

export const fetchMerchantProfile = createAsyncThunk(
  'auth/fetchMerchantProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_URL}/shopify/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
      return data; // returns { shop, name, email, shopOwner }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error fetching profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; shop: string }>) {
      state.token = action.payload.token;
      state.shop = action.payload.shop;
      localStorage.setItem('merchant_token', action.payload.token);
      localStorage.setItem('merchant_shop', action.payload.shop);
    },
    logout(state) {
      state.token = null;
      state.shop = null;
      state.merchant = null;
      state.error = null;
      localStorage.removeItem('merchant_token');
      localStorage.removeItem('merchant_shop');
      localStorage.removeItem('merchant_data');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchMerchantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMerchantProfile.fulfilled, (state, action: PayloadAction<Merchant>) => {
        state.loading = false;
        state.merchant = action.payload;
        localStorage.setItem('merchant_data', JSON.stringify(action.payload));
      })
      .addCase(fetchMerchantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Invalidate session on authorization error
        state.token = null;
        state.shop = null;
        state.merchant = null;
        localStorage.removeItem('merchant_token');
        localStorage.removeItem('merchant_shop');
        localStorage.removeItem('merchant_data');
      });
  },
});

export const { setAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
