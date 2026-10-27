import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import mallsReducer from "./slices/mallsSlice";
import queueReducer from "./slices/queueSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    malls: mallsReducer,
    queue: queueReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
