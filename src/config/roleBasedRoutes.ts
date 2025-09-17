import type { UserType } from "../store/userSlice";

// Define the default route for each user type after login
export const defaultRoutes: Record<UserType, string> = {
  super_user: "/dashboard",
  agency: "/dashboard",
  staff: "/dashboard",
  tenant: "/login", // Tenants only use email interactions, no dashboard access
  technician: "/dashboard",
  property_manager: "/dashboard",
  team_member: "/dashboard",
};

// Define the allowed routes for each user type
export const allowedRoutes: Record<UserType, string[]> = {
  super_user: [
    "dashboard",
    // "devDashboard",
    "agencies",
    "properties",
    "propertyManagerManagement",
    "jobs",
    "technician",
    "technicianPayments",
    "reports",
    "teamMembers",
    "regionalDashboard",
    "scheduled-jobs",
    "overdue-jobs",
    "completed-jobs",
    "messages",
  ],
  agency: [
    "dashboard",
    // "devDashboard",
    "properties",
    "propertyAssignment",
    "contacts",
    "propertyManagerManagement",
    "agencyJobs",
    "subscription",
    "scheduled-jobs",
    "overdue-jobs",
    "completed-jobs",
    "messages",
  ],
  staff: ["dashboard", "jobs", "contacts", "messages"],
  tenant: [], // Tenants interact only via email, no dashboard access needed
  technician: [
    "devDashboard",
    // "dashboard",
    "availableJobs",
    "myJobs",
    "activeJobs",
    "overdueJobs",
    "completedJobs",
    "myPayments",
    "messages",
  ],
  property_manager: [
    "dashboard",
    // "devDashboard",
    "properties",
    "contacts",
    "reports",
    "messages",
  ],
  team_member: [
    "dashboard",
    // "devDashboard",
    "agencies",
    "properties",
    "propertyManagerManagement",
    "jobs",
    "technician",
    "technicianPayments",
    "reports",
    "regionalDashboard",
    "scheduled-jobs",
    "overdue-jobs",
    "completed-jobs",
    "messages",
  ],
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
