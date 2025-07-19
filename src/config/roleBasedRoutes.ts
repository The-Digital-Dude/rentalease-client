import type { UserType } from "../store/userSlice";

// Define the default route for each user type after login
export const defaultRoutes: Record<UserType, string> = {
  super_user: "/dashboard",
  agency: "/agencies",
  staff: "/staff",
  tenant: "/tenant",
};

// Define the allowed routes for each user type
export const allowedRoutes: Record<UserType, string[]> = {
  super_user: [
    "dashboard",
    "properties",
    "jobs",
    "technician",
    "agencies",
    "contacts",
    "reports",
  ],
  agency: [
    "dashboard",
    "properties",
    "jobs",
    "technician",
    "contacts",
    "reports",
  ],
  staff: ["dashboard", "jobs", "contacts"],
  tenant: ["dashboard", "contacts"],
};

// Helper function to get the base route for a user type
export const getBaseRoute = (userType: UserType): string => {
  return defaultRoutes[userType] || "/";
};

// Helper function to check if a route is allowed for a user type
export const isRouteAllowed = (userType: UserType, route: string): boolean => {
  const allowedRoutesForUser = allowedRoutes[userType] || [];
  return allowedRoutesForUser.includes(route);
};
