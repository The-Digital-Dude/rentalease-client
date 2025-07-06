import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

// Create the store with the user reducer
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Export store types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 