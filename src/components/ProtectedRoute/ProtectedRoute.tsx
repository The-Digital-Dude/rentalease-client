import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { defaultRoutes, isRouteAllowed } from "../../config/roleBasedRoutes";
import type { UserType } from "../../store/userSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPath: string;
}

export const ProtectedRoute = ({
  children,
  requiredPath,
}: ProtectedRouteProps) => {
  const { userType } = useAppSelector((state) => state.user);

  // If no user type, redirect to login
  if (!userType) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to this route
  const hasAccess = isRouteAllowed(
    userType as UserType,
    requiredPath.replace("/", "")
  );

  // If no access, redirect to user's dashboard
  if (!hasAccess) {
    const userDashboard = defaultRoutes[userType as UserType] || "/login";
    return <Navigate to={userDashboard} replace />;
  }

  return <>{children}</>;
};
