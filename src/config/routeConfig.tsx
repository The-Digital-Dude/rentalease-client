import React, { lazy } from "react";
import type { UserType } from "../store/userSlice";
import { allowedRoutes, defaultRoutes } from "./roleBasedRoutes";

// Lazy load components
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Properties = lazy(() => import("../pages/Properties/Properties"));
const Jobs = lazy(() => import("../pages/JobManagement/JobManagement"));
const Staff = lazy(() => import("../pages/Staff/Staff"));
const Agencies = lazy(() => import("../pages/Agencies/Agencies"));
const Contacts = lazy(
  () => import("../pages/ContactsCommunication/ContactsCommunication")
);
const Reports = lazy(
  () => import("../pages/ReportsAnalytics/ReportsAnalytics")
);

// Define route configuration
export const routeConfig = (userType: UserType) => {
  // Get allowed routes for the user type
  const userRoutes = allowedRoutes[userType] || [];

  // Base route components mapping
  const routeComponents: Record<string, React.ComponentType> = {
    dashboard: Dashboard,
    properties: Properties,
    jobs: Jobs,
    staff: Staff,
    agencies: Agencies,
    contacts: Contacts,
    reports: Reports,
  };

  // Generate routes based on user permissions
  return userRoutes.map((route) => ({
    path: `/${route}`,
    element: React.createElement(routeComponents[route]),
  }));
};

// Get the default route for a user type
export const getDefaultRoute = (userType: UserType): string => {
  return defaultRoutes[userType] || "/login";
};
