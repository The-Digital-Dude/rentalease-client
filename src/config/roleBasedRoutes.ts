import type { UserType } from "../store/userSlice";
import { TECHNICIAN_PAYMENTS_ENABLED } from "./features";

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
    "contacts",
    "quotation-management",
    "invoice-management",
    ...(TECHNICIAN_PAYMENTS_ENABLED ? ["technicianPayments"] : []),
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
    "invoice-management",
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
    "activeJobs",
    "overdueJobs",
    "completedJobs",
    "technician-calendar",
    "technician-profile",
    ...(TECHNICIAN_PAYMENTS_ENABLED ? ["myPayments"] : []),
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
    "contacts",
    "invoice-management",
    ...(TECHNICIAN_PAYMENTS_ENABLED ? ["technicianPayments"] : []),
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
