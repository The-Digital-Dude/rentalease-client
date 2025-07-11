import type { UserType } from "../store";

// Define URL prefixes for each user type
export const roleBasedPrefixes: Record<UserType, string> = {
  super_user: "",
  property_manager: "/property-managers",
  staff: "/staff",
  tenant: "/tenant",
};

// Define base routes for each user type
export const baseRoutes: Record<UserType, string[]> = {
  super_user: [
    "dashboard",
    "agencies",
    "jobs",
    "staff",
    "regions",
    "reports",
    "contacts",
    "invoices",
    "compliance",
    "payment-property",
  ],
  property_manager: [
    "dashboard",
    "agencies",
    "jobs",
    "regions",
    "reports",
    "contacts",
    "invoices",
    "compliance",
    "payment-property",
  ],
  staff: ["dashboard", "jobs", "contacts"],
  tenant: ["dashboard", "contacts"],
};

// Function to get full route path for a user type
export const getFullRoute = (userType: UserType, baseRoute: string): string => {
  const prefix = roleBasedPrefixes[userType];
  if (baseRoute === "dashboard") {
    // For super_user, use /dashboard instead of / to avoid routing conflicts
    return prefix === "" ? "/dashboard" : `${prefix}/dashboard`;
  }
  return prefix === "" ? `/${baseRoute}` : `${prefix}/${baseRoute}`;
};

// Function to get all accessible routes for a user type
export const getAccessibleRoutes = (userType: UserType | null): string[] => {
  if (!userType) return [];
  return baseRoutes[userType].map((route) => getFullRoute(userType, route));
};

// Function to check if user has access to a route
export const hasAccessToRoute = (
  userType: UserType | null,
  route: string
): boolean => {
  if (!userType) {
    console.log("hasAccessToRoute: No userType provided"); // Debug log
    return false;
  }
  const accessibleRoutes = getAccessibleRoutes(userType);
  console.log("hasAccessToRoute:", { userType, route, accessibleRoutes }); // Debug log
  return accessibleRoutes.includes(route);
};

// Function to get base route from full path
export const getBaseRoute = (fullPath: string): string => {
  // Handle root path
  if (fullPath === "/") return "dashboard";

  // Remove leading slash and get last segment
  const segments = fullPath.replace(/^\//, "").split("/");
  return segments[segments.length - 1];
};

// Function to check if current user can access a base route
export const canAccessBaseRoute = (
  userType: UserType | null,
  baseRoute: string
): boolean => {
  if (!userType) return false;
  return baseRoutes[userType].includes(baseRoute);
};
