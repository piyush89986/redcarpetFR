import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_BASE from "../../apiConfig";

// Fetch all malls / shops
export const fetchMalls = createAsyncThunk(
  "malls/fetchMalls",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/api/shops`);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch malls");
    }
  }
);

// Fetch a single mall by ID with its stores
export const fetchMallById = createAsyncThunk(
  "malls/fetchMallById",
  async (mallId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/api/shops/${mallId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch mall details");
    }
  }
);

// Toggle subscription status for a Mall or Store
export const toggleSubscription = createAsyncThunk(
  "malls/toggleSubscription",
  async ({ mallId, storeId, subscriptionStatus }, { rejectWithValue }) => {
    try {
      const payload = { subscriptionStatus };
      if (storeId) payload.storeId = storeId;

      const res = await axios.patch(
        `${API_BASE}/api/shops/${mallId}/subscription`,
        payload
      );
      return { mallId, storeId, subscriptionStatus, data: res.data };
    } catch (err) {
      // Fallback to PUT if PATCH not supported
      try {
        const payload = { subscriptionStatus };
        if (storeId) payload.storeId = storeId;
        const res = await axios.put(
          `${API_BASE}/api/shops/${mallId}/subscription`,
          payload
        );
        return { mallId, storeId, subscriptionStatus, data: res.data };
      } catch (fallbackErr) {
        return rejectWithValue(
          fallbackErr.response?.data?.error || fallbackErr.message || "Failed to update subscription"
        );
      }
    }
  }
);

const initialState = {
  malls: [],
  currentMall: null,
  loading: false,
  error: null,
  searchQuery: "",
};

const mallsSlice = createSlice({
  name: "malls",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrentMall: (state) => {
      state.currentMall = null;
    },
    optimisticToggleMallStatus: (state, action) => {
      const { mallId, status } = action.payload;
      const mall = state.malls.find((m) => m._id === mallId);
      if (mall) {
        mall.subscriptionStatus = status;
      }
      if (state.currentMall && state.currentMall._id === mallId) {
        state.currentMall.subscriptionStatus = status;
      }
    },
    optimisticToggleStoreStatus: (state, action) => {
      const { mallId, storeId, status } = action.payload;
      const mall = state.malls.find((m) => m._id === mallId);
      if (mall && mall.menuItems) {
        const store = mall.menuItems.find((s) => s._id === storeId);
        if (store) store.subscriptionStatus = status;
      }
      if (state.currentMall && state.currentMall.menuItems) {
        const store = state.currentMall.menuItems.find((s) => s._id === storeId);
        if (store) store.subscriptionStatus = status;
      }
    },
    removeMallFromState: (state, action) => {
      state.malls = state.malls.filter((m) => m._id !== action.payload);
    },
    removeStoreFromState: (state, action) => {
      const { storeId } = action.payload;
      if (state.currentMall && state.currentMall.menuItems) {
        state.currentMall.menuItems = state.currentMall.menuItems.filter(
          (item) => item._id !== storeId
        );
      }
    },
  },
  extraReducers: (builder) => {
    // fetchMalls
    builder
      .addCase(fetchMalls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMalls.fulfilled, (state, action) => {
        state.loading = false;
        state.malls = action.payload;
      })
      .addCase(fetchMalls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchMallById
    builder
      .addCase(fetchMallById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMallById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMall = action.payload;
      })
      .addCase(fetchMallById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // toggleSubscription
    builder
      .addCase(toggleSubscription.fulfilled, (state, action) => {
        const { mallId, storeId, subscriptionStatus } = action.payload;
        if (!storeId) {
          // Mall level
          const mall = state.malls.find((m) => m._id === mallId);
          if (mall) mall.subscriptionStatus = subscriptionStatus;
          if (state.currentMall && state.currentMall._id === mallId) {
            state.currentMall.subscriptionStatus = subscriptionStatus;
          }
        } else {
          // Store level inside mall
          const mall = state.malls.find((m) => m._id === mallId);
          if (mall && mall.menuItems) {
            const store = mall.menuItems.find((s) => s._id === storeId);
            if (store) store.subscriptionStatus = subscriptionStatus;
          }
          if (state.currentMall && state.currentMall.menuItems) {
            const store = state.currentMall.menuItems.find((s) => s._id === storeId);
            if (store) store.subscriptionStatus = subscriptionStatus;
          }
        }
      });
  },
});

export const {
  setSearchQuery,
  clearCurrentMall,
  optimisticToggleMallStatus,
  optimisticToggleStoreStatus,
  removeMallFromState,
  removeStoreFromState,
} = mallsSlice.actions;

export default mallsSlice.reducer;
