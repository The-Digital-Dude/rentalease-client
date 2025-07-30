import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import notificationReducer from "./notificationSlice";

// Create the store with the user reducer
export const store = configureStore({
  reducer: {
    user: userReducer,
    notifications: notificationReducer,
  },
});

// Export store types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
