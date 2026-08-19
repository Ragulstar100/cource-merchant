import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

const API_URL = 'https://course-api-veiu.onrender.com';

export interface Merchant {
  shop: string;
  name: string | null;
  email: string | null;
  username: string;
  shopOwner?: string | null;
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

export const registerMerchant = createAsyncThunk(
  'auth/registerMerchant',
  async (
    payload: { shop: string; username: string; password: string; name?: string; email?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/shopify/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Registration failed');
      }
      return data.merchant; // returns { shop, name, email, username, token }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error during registration');
    }
  }
);

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

export const shopifyAutoLogin = createAsyncThunk(
  'auth/shopifyAutoLogin',
  async (shop: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/shopify/auto-login?shop=${encodeURIComponent(shop)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Auto-login failed');
      }
      dispatch(setAuth({ token: data.token, shop }));
      dispatch(fetchMerchantProfile());
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to auto-login');
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
      // Login
      .addCase(loginMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginMerchant.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.shop = action.payload.shop;
        state.merchant = {
          shop: action.payload.shop,
          name: action.payload.name,
          email: action.payload.email,
          username: action.payload.username,
        };
        localStorage.setItem('merchant_token', action.payload.token);
        localStorage.setItem('merchant_shop', action.payload.shop);
        localStorage.setItem('merchant_data', JSON.stringify(state.merchant));
      })
      .addCase(loginMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerMerchant.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.shop = action.payload.shop;
        state.merchant = {
          shop: action.payload.shop,
          name: action.payload.name,
          email: action.payload.email,
          username: action.payload.username,
        };
        localStorage.setItem('merchant_token', action.payload.token);
        localStorage.setItem('merchant_shop', action.payload.shop);
        localStorage.setItem('merchant_data', JSON.stringify(state.merchant));
      })
      .addCase(registerMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchMerchantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMerchantProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.merchant = {
          ...state.merchant,
          ...action.payload,
        } as Merchant;
        localStorage.setItem('merchant_data', JSON.stringify(state.merchant));
      })
      .addCase(fetchMerchantProfile.rejected, (state, action) => {
        state.loading = false;
        const err = action.payload as string || 'Failed to authenticate';
        if (err.includes('Failed to fetch')) {
          state.error = null;
        } else {
          state.error = err;
        }
        state.token = null;
        state.merchant = null;
        localStorage.removeItem('merchant_token');
        localStorage.removeItem('merchant_data');
      })
      // Auto Login
      .addCase(shopifyAutoLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shopifyAutoLogin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(shopifyAutoLogin.rejected, (state, action) => {
        state.loading = false;
        const err = action.payload as string || 'Failed to auto-login';
        if (err.includes('Failed to fetch')) {
          state.error = null;
        } else {
          state.error = err;
        }
      });
  },
});

export const { setAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
