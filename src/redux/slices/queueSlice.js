import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  queueData: [],
  shopInfo: null,
  loading: true,
  autoSmsEnabled: JSON.parse(localStorage.getItem("autoSmsEnabled") ?? "true"),
  alertAheadSlots: Number(localStorage.getItem("alertAheadSlots") || "2"),
  smsAlertedMap: JSON.parse(localStorage.getItem("smsAlertedMap") || "{}"),
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setQueueData: (state, action) => {
      state.queueData = action.payload;
    },
    setShopInfo: (state, action) => {
      state.shopInfo = action.payload;
    },
    setQueueLoading: (state, action) => {
      state.loading = action.payload;
    },
    removeQueueItem: (state, action) => {
      state.queueData = state.queueData.filter((item) => item._id !== action.payload);
    },
    setAutoSms: (state, action) => {
      state.autoSmsEnabled = action.payload;
      localStorage.setItem("autoSmsEnabled", JSON.stringify(action.payload));
    },
    setAlertAhead: (state, action) => {
      state.alertAheadSlots = action.payload;
      localStorage.setItem("alertAheadSlots", String(action.payload));
    },
    markSmsAlerted: (state, action) => {
      const { customerId } = action.payload;
      state.smsAlertedMap[customerId] = true;
      localStorage.setItem("smsAlertedMap", JSON.stringify(state.smsAlertedMap));
    },
    clearAlertedMap: (state) => {
      state.smsAlertedMap = {};
      localStorage.removeItem("smsAlertedMap");
    },
  },
});

export const {
  setQueueData,
  setShopInfo,
  setQueueLoading,
  removeQueueItem,
  setAutoSms,
  setAlertAhead,
  markSmsAlerted,
  clearAlertedMap,
} = queueSlice.actions;

export default queueSlice.reducer;
