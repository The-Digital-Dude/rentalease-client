import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { hasAccessToRoute, getFullRoute } from '../../config/roleBasedRoutes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPath: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPath }) => {
  const { isLoggedIn, userType } = useAppSelector((state) => state.user);

  console.log('ProtectedRoute check:', { isLoggedIn, userType, requiredPath }); // Debug log

  // If user is not logged in, redirect to login
  if (!isLoggedIn) {
    console.log('User not logged in, redirecting to login'); // Debug log
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to this route
  const hasAccess = hasAccessToRoute(userType, requiredPath);
  console.log('Access check result:', hasAccess, 'for path:', requiredPath); // Debug log

  // If user doesn't have access to this route, redirect to their dashboard
  if (!hasAccess) {
    const userDashboard = userType ? getFullRoute(userType, 'dashboard') : '/login';
    console.log('No access, redirecting to dashboard:', userDashboard); // Debug log
    return <Navigate to={userDashboard} replace />;
  }

  console.log('Access granted, rendering children'); // Debug log
  return <>{children}</>;
};

export default ProtectedRoute; 