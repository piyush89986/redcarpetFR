import { createSlice } from "@reduxjs/toolkit";

const getStoredToken = () => localStorage.getItem("token") || null;
const getStoredRole = () => (localStorage.getItem("role") || "").toLowerCase().trim() || null;
const getStoredShopId = () => localStorage.getItem("shopId") || null;
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const initialState = {
  token: getStoredToken(),
  role: getStoredRole(),
  shopId: getStoredShopId(),
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, role, shopId, user } = action.payload;
      state.token = token || null;
      state.role = role ? role.toLowerCase().trim() : null;
      state.shopId = shopId || null;
      state.user = user || null;
      state.isAuthenticated = !!token;

      if (token) localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);
      if (shopId) localStorage.setItem("shopId", shopId);
      if (user) localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.shopId = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("shopId");
      localStorage.removeItem("user");
    },
    updateUserInfo: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, logout, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
