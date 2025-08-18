import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the different user types
export type UserType =
  | "super_user"
  | "agency"
  | "staff"
  | "tenant"
  | "technician"
  | "property_manager"
  | "team_member";

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
  name: "user",
  initialState,
  reducers: {
    // Action to log in a user
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isLoggedIn = true;
      state.email = action.payload.email;
      state.userType = action.payload.userType;
      state.name = action.payload.name;
      state.id = action.payload.id;

      // Also update localStorage to ensure consistency
      if (typeof window !== "undefined") {
        const userData = {
          email: action.payload.email,
          userType: action.payload.userType,
          name: action.payload.name,
          id: action.payload.id,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    },
    // Action to log out a user
    logout: (state) => {
      state.isLoggedIn = false;
      state.email = null;
      state.userType = null;
      state.name = null;
      state.id = null;
      // Clear localStorage when logging out
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    },
    // Action to restore user state from localStorage
    restoreAuthState: (state) => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      console.log("Restoring auth state:", { token: !!token, userData });

      if (token && userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          console.log("Parsed user data:", parsedUserData);
          console.log("User name from localStorage:", parsedUserData.name);
          
          state.isLoggedIn = true;
          state.email = parsedUserData.email;
          state.userType = parsedUserData.userType;
          state.name = parsedUserData.name;
          state.id = parsedUserData.id;
          
          console.log("Auth state restored successfully");
        } catch (error) {
          console.error("Failed to parse userData from localStorage:", error);
          // If parsing fails, clear invalid data
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      } else {
        console.log("No token or userData found in localStorage");
      }
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
export const { login, logout, restoreAuthState, updateUser } =
  userSlice.actions;

// Export reducer
export default userSlice.reducer;
