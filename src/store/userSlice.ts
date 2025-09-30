import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  syncUserDataToLocalStorage,
  clearUserDataFromStorage,
  type UserDataStructure,
} from "../utils";

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
  avatar: string | null;
  phone: string | null;
  agencyId: string | null;
  agencyName: string | null;
}

// Define the initial state
const initialState: UserState = {
  isLoggedIn: false,
  email: null,
  userType: null,
  name: null,
  id: null,
  avatar: null,
  phone: null,
  agencyId: null,
  agencyName: null,
};

// Define the payload for login action
interface LoginPayload {
  email: string;
  userType: UserType;
  name: string;
  id: string;
  avatar?: string;
  phone?: string;
  agencyId?: string | null;
  agencyName?: string | null;
}

// Define the payload for profile update
interface ProfileUpdatePayload {
  name?: string;
  avatar?: string;
  phone?: string;
  agencyName?: string | null;
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
      state.avatar = action.payload.avatar || null;
      state.phone = action.payload.phone || null;
      state.agencyId = action.payload.agencyId ?? null;
      state.agencyName = action.payload.agencyName ?? null;

      // Also update localStorage to ensure consistency
      if (typeof window !== "undefined") {
        const userData = {
          email: action.payload.email,
          userType: action.payload.userType,
          name: action.payload.name,
          id: action.payload.id,
          avatar: action.payload.avatar || null,
          phone: action.payload.phone || null,
          agencyId: action.payload.agencyId ?? null,
          agencyName: action.payload.agencyName ?? null,
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
      state.avatar = null;
      state.phone = null;
      state.agencyId = null;
      state.agencyName = null;
      // Clear localStorage when logging out using helper
      clearUserDataFromStorage();
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
          state.avatar = parsedUserData.avatar || null;
          state.phone = parsedUserData.phone || null;
          state.agencyId = parsedUserData.agencyId || null;
          state.agencyName = parsedUserData.agencyName || null;

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
      if (action.payload.avatar !== undefined)
        state.avatar = action.payload.avatar;
      if (action.payload.phone !== undefined)
        state.phone = action.payload.phone;
      if (action.payload.agencyId !== undefined)
        state.agencyId = action.payload.agencyId ?? null;
      if (action.payload.agencyName !== undefined)
        state.agencyName = action.payload.agencyName ?? null;
    },
    // Action to update user profile
    updateUserProfile: (state, action: PayloadAction<ProfileUpdatePayload>) => {
      if (action.payload.name !== undefined) state.name = action.payload.name;
      if (action.payload.avatar !== undefined)
        state.avatar = action.payload.avatar;
      if (action.payload.phone !== undefined)
        state.phone = action.payload.phone;
      if (action.payload.agencyName !== undefined)
        state.agencyName = action.payload.agencyName;

      // Update localStorage with complete user data using helper
      if (
        typeof window !== "undefined" &&
        state.email &&
        state.userType &&
        state.id
      ) {
        const updatedUserData: UserDataStructure = {
          id: state.id,
          email: state.email,
          name: state.name || "",
          userType: state.userType,
          avatar: state.avatar,
          phone: state.phone,
          agencyId: state.agencyId,
          agencyName: state.agencyName,
        };
        syncUserDataToLocalStorage(updatedUserData);
      }
    },
  },
});

// Export actions
export const {
  login,
  logout,
  restoreAuthState,
  updateUser,
  updateUserProfile,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
