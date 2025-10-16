import type { UserType } from "../store/userSlice";

// Define the default route for each user type after login
export const defaultRoutes: Record<UserType, string> = {
  super_user: "/dashboard",
  agency: "/dashboard",
  staff: "/dashboard",
  tenant: "/login", // Tenants only use email interactions, no dashboard access
  technician: "/technician-dashboard",
  property_manager: "/dashboard",
  team_member: "/dashboard",
};

// Define the allowed routes for each user type
export const allowedRoutes: Record<UserType, string[]> = {
  super_user: [
    "dashboard",
    "propertyManagerManagement",
    // "devDashboard",
    "agencies",
    "properties",
    "jobs",
    "technician",
    "quotation-management",
    "invoice-management",
    "technicianPayments",
    "lead-management",
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
    "propertyManagerManagement",
    // "devDashboard",
    "properties",
    "propertyAssignment",
    "contacts",
    // "lead-management",
    "agencyJobs",
    "beyond-compliance",
    "quotation-management",
    "invoice-management",
    "subscription",
    "scheduled-jobs",
    "overdue-jobs",
    "completed-jobs",
    // "messages",
  ],
  staff: ["dashboard", "jobs", "contacts"],
  tenant: [], // Tenants interact only via email, no dashboard access needed
  technician: [
    "technician-dashboard",
    "availableJobs",
    "myJobs",
    "myPayments",
    "technician-support",
  ],
  property_manager: [
    "dashboard",
    // "devDashboard",
    "properties",
    "contacts",
    // "lead-management",
    "agencyJobs",
    "beyond-compliance",
    "invoice-management",
    "scheduled-jobs",
    "overdue-jobs",
    "completed-jobs",
    "reports",
    // "messages",
  ],
  team_member: [
    "dashboard",
    // "devDashboard",
    "agencies",
    "properties",
    "propertyManagerManagement",
    "jobs",
    "technician",
    "invoice-management",
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
