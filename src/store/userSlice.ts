import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Define the different user types
export type UserType = 'super_user' | 'property_manager' | 'staff' | 'tenant';

// Define the user state interface
export interface UserState {
  isLoggedIn: boolean;
  email: string | null;
  userType: UserType | null;
  name: string | null;
  id: string | null;
}

// Define the initial state
const initialState: UserState = {
  isLoggedIn: false,
  email: null,
  userType: null,
  name: null,
  id: null,
};

// Define the payload for login action
interface LoginPayload {
  email: string;
  userType: UserType;
  name: string;
  id: string;
}

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to log in a user
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isLoggedIn = true;
      state.email = action.payload.email;
      state.userType = action.payload.userType;
      state.name = action.payload.name;
      state.id = action.payload.id;
    },
    // Action to log out a user
    logout: (state) => {
      state.isLoggedIn = false;
      state.email = null;
      state.userType = null;
      state.name = null;
      state.id = null;
    },
    // Action to update user info
    updateUser: (state, action: PayloadAction<Partial<LoginPayload>>) => {
      if (action.payload.email) state.email = action.payload.email;
      if (action.payload.userType) state.userType = action.payload.userType;
      if (action.payload.name) state.name = action.payload.name;
      if (action.payload.id) state.id = action.payload.id;
    },
  },
});

// Export actions
export const { login, logout, updateUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer; 