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

  // If user is not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have access to this route, redirect to their dashboard
  if (!hasAccessToRoute(userType, requiredPath)) {
    const userDashboard = userType ? getFullRoute(userType, 'dashboard') : '/login';
    return <Navigate to={userDashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 