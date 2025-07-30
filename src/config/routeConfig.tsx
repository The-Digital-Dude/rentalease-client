import React, { lazy } from "react";
import type { UserType } from "../store/userSlice";
import { allowedRoutes, defaultRoutes } from "./roleBasedRoutes";

// Lazy load components
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Properties = lazy(() => import("../pages/Properties/Properties"));
const Jobs = lazy(() => import("../pages/JobManagement/JobManagement"));
const Technician = lazy(() => import("../pages/Technician/Technician"));
const TechnicianDashboard = lazy(
  () => import("../pages/TechnicianDashboard/TechnicianDashboard")
);
const StaffDashboard = lazy(
  () => import("../pages/StaffDashboard/StaffDashboard")
);
const TenantDashboard = lazy(
  () => import("../pages/TenantDashboard/TenantDashboard")
);
const Agencies = lazy(() => import("../pages/Agencies/Agencies"));
const Contacts = lazy(
  () => import("../pages/ContactsCommunication/ContactsCommunication")
);
const Reports = lazy(
  () => import("../pages/ReportsAnalytics/ReportsAnalytics")
);
const RegionManagement = lazy(
  () => import("../pages/RegionManagement/RegionManagement")
);
const PropertyCompliance = lazy(
  () => import("../pages/PropertyCompliance/PropertyCompliance")
);
const PaymentProperty = lazy(
  () => import("../pages/PaymentProperty/PaymentProperty")
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
    technician: Technician,
    staff: StaffDashboard,
    tenant: TenantDashboard,
    agencies: Agencies,
    contacts: Contacts,
    reports: Reports,
    region: RegionManagement,
    compliance: PropertyCompliance,
    payment: PaymentProperty,
    technicianDashboard: TechnicianDashboard,
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
