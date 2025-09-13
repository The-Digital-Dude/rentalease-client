import React, { lazy } from "react";
import type { UserType } from "../store/userSlice";
import { allowedRoutes, defaultRoutes } from "./roleBasedRoutes";

// Lazy load components
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const DevDashboard = lazy(() => import("../pages/DevDashboard/DevDashboard"));
const Properties = lazy(() => import("../pages/Properties/Properties"));
const PropertyAssignment = lazy(() => import("../pages/PropertyAssignment/PropertyAssignment"));
const Jobs = lazy(() => import("../pages/JobManagement/JobManagement"));
const Technician = lazy(() => import("../pages/Technician/Technician"));
const PropertyManagerManagement = lazy(
  () => import("../pages/PropertyManagerManagement/PropertyManagerManagement")
);
const TechnicianDashboard = lazy(
  () => import("../pages/TechnicianDashboard/TechnicianDashboard")
);
const StaffDashboard = lazy(
  () => import("../pages/StaffDashboard/StaffDashboard")
);
const Agencies = lazy(() => import("../pages/Agencies/Agencies"));
const AgencyJobs = lazy(() => import("../pages/AgencyJobs/AgencyJobs"));
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
const AvailableJobs = lazy(
  () => import("../pages/AvailableJobs/AvailableJobs")
);
const MyJobs = lazy(() => import("../pages/Technician/MyJobs"));
const ActiveJobs = lazy(() => import("../pages/Technician/ActiveJobs"));
const OverdueJobs = lazy(() => import("../pages/Technician/OverdueJobs"));
const CompletedJobs = lazy(() => import("../pages/Technician/CompletedJobs"));
const ScheduledJobs = lazy(() => import("../pages/ScheduledJobs/ScheduledJobs"));
const SystemOverdueJobs = lazy(() => import("../pages/OverdueJobs/OverdueJobs"));
const SystemCompletedJobs = lazy(() => import("../pages/CompletedJobs/CompletedJobs"));
const MyPayments = lazy(() => import("../pages/Technician/MyPayments"));
const TeamMemberManagement = lazy(
  () => import("../pages/TeamMemberManagement/TeamMemberManagement")
);
const TechnicianPaymentManagement = lazy(
  () => import("../pages/TechnicianPaymentManagement/TechnicianPaymentManagement")
);
const Subscription = lazy(() => import("../pages/Subscription/Subscription"));
const EmailCommunication = lazy(() => import("../pages/EmailCommunication").then(module => ({ default: module.EmailCommunication })));
const Messages = lazy(() => import("../pages/Messages/Messages"));

// Define route configuration
export const routeConfig = (userType: UserType) => {
  // Get allowed routes for the user type
  const userRoutes = allowedRoutes[userType] || [];

  // Base route components mapping
  const routeComponents: Record<string, React.ComponentType> = {
    dashboard: Dashboard,
    devDashboard: DevDashboard,
    properties: Properties,
    propertyAssignment: PropertyAssignment,
    jobs: Jobs,
    technician: Technician,
    propertyManagerManagement: PropertyManagerManagement,
    staff: StaffDashboard,
    agencies: Agencies,
    agencyJobs: AgencyJobs,
    contacts: Contacts,
    reports: Reports,
    region: RegionManagement,
    compliance: PropertyCompliance,
    payment: PaymentProperty,
    availableJobs: AvailableJobs,
    myJobs: MyJobs,
    activeJobs: ActiveJobs,
    overdueJobs: OverdueJobs,
    completedJobs: CompletedJobs,
    scheduledJobs: ScheduledJobs,
    "overdue-jobs": SystemOverdueJobs,
    "completed-jobs": SystemCompletedJobs,
    "scheduled-jobs": ScheduledJobs,
    myPayments: MyPayments,
    technicianPayments: TechnicianPaymentManagement,
    teamMembers: TeamMemberManagement,
    subscription: Subscription,
    messages: Messages,
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
