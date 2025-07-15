import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../components";
import {
  Dashboard,
  Agencies,
  JobManagement,
  Properties,
  Staff,
  RegionManagement,
  ReportsAnalytics,
  ContactsCommunication,
  PropertyCompliance,
  PaymentProperty,
} from "../pages";
import { getFullRoute, baseRoutes } from "./roleBasedRoutes";
import type { UserType } from "../store";

// Define component mapping for each base route
const componentMap: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  agencies: Agencies,
  jobs: JobManagement,
  properties: Properties,
  staff: Staff,
  regions: RegionManagement,
  reports: ReportsAnalytics,
  contacts: ContactsCommunication,
  compliance: PropertyCompliance,
  "payment-property": PaymentProperty,
  invoices: () => (
    <div className="page-container">
      <div className="page-header">
        <h1>Invoices</h1>
        <p>Track payments and billing</p>
      </div>
      <div className="content-card">
        <h3>Invoice Management</h3>
        <p>Invoice management features coming soon.</p>
      </div>
    </div>
  ),
};

// Function to generate dynamic routes for a user type
export const generateUserRoutes = (
  userType: UserType
): React.ReactElement[] => {
  const userRoutes = baseRoutes[userType];

  return userRoutes.map((baseRoute) => {
    const fullPath = getFullRoute(userType, baseRoute);
    const Component = componentMap[baseRoute];

    return (
      <Route
        key={fullPath}
        path={fullPath}
        element={
          <ProtectedRoute requiredPath={fullPath}>
            <Component />
          </ProtectedRoute>
        }
      />
    );
  });
};

// Function to generate all possible routes for all user types
export const generateAllRoutes = (): React.ReactElement[] => {
  const allRoutes: React.ReactElement[] = [];

  // Generate routes for each user type
  Object.keys(baseRoutes).forEach((userType) => {
    const routes = generateUserRoutes(userType as UserType);
    allRoutes.push(...routes);
  });

  return allRoutes;
};
