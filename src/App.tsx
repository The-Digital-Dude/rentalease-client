import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "./store";
import { restoreAuthState } from "./store/userSlice";
import { routeConfig } from "./config/routeConfig";
import { defaultRoutes } from "./config/roleBasedRoutes";
import type { UserType } from "./store/userSlice";
import { AppLayout, PublicLayout } from "./components";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import "./App.css";

// Import pages
import {
  Login,
  AdminLogin,
  AgentLogin,
  PropertyManagerLogin,
  TechnicianLogin,
  TeamMemberLogin,
  PasswordReset,
} from "./pages/Login";
import PropertyProfile from "./pages/PropertyProfile";
import AgencyProfile from "./pages/AgencyProfile";
import JobProfile from "./pages/JobProfile";
import InspectionBooking from "./pages/InspectionBooking";
import DevDashboard from "./pages/DevDashboard";
import { Settings, Profile } from "./pages";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
    }}
  >
    <div>Loading...</div>
  </div>
);

const App = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userType } = useAppSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    dispatch(restoreAuthState());
  }, [dispatch]);

  useEffect(() => {
    // Auto-navigate from root to dashboard for logged-in users
    if (userType && location.pathname === "/") {
      const dashboardPath = userType
        ? defaultRoutes[userType as UserType]
        : "/login";
      navigate(dashboardPath, { replace: true });
    }
  }, [userType, location.pathname, navigate]);

  useEffect(() => {
    // Redirect from auth pages if already logged in
    if (
      userType &&
      (location.pathname === "/login" ||
        location.pathname === "/login/admin" ||
        location.pathname === "/login/agent" ||
        location.pathname === "/login/property-manager" ||
        location.pathname === "/login/technician" ||
        location.pathname === "/login/team-member") &&
      !location.pathname.startsWith("/password-reset")
    ) {
      const dashboardPath = userType
        ? defaultRoutes[userType as UserType]
        : "/login";
      navigate(dashboardPath, { replace: true });
    }
  }, [userType, location.pathname, navigate]);

  // Generate routes based on user type
  const userRoutes = userType ? routeConfig(userType as UserType) : [];

  return (
    <WebSocketProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            zIndex: 9999,
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes - No Authentication Required */}
        <Route
          path="/book-inspection/:propertyId/:complienceType"
          element={
            <PublicLayout>
              <InspectionBooking />
            </PublicLayout>
          }
        />

        {/* Protected Routes - Require Authentication */}
        <Route
          path="/*"
          element={
            <AppLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/login/admin" element={<AdminLogin />} />
                  <Route path="/login/agent" element={<AgentLogin />} />
                  <Route
                    path="/login/property-manager"
                    element={<PropertyManagerLogin />}
                  />
                  <Route
                    path="/login/technician"
                    element={<TechnicianLogin />}
                  />
                  <Route
                    path="/login/team-member"
                    element={<TeamMemberLogin />}
                  />
                  <Route path="/password-reset" element={<PasswordReset />} />

                  {/* DevDashboard Route - Accessible to all users */}
                  <Route path="/dev-dashboard" element={<DevDashboard />} />

                  {/* Settings Route - Accessible to all authenticated users */}
                  <Route path="/settings" element={<Settings />} />

                  {/* Profile Route - Accessible to all authenticated users */}
                  <Route path="/profile" element={<Profile />} />

                  {/* Protected Routes */}
                  {userRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          {route.element}
                        </Suspense>
                      }
                    />
                  ))}

                  {/* Property Profile Route */}
                  <Route path="/properties/:id" element={<PropertyProfile />} />

                  {/* Agency Profile Route */}
                  <Route path="/agencies/:id" element={<AgencyProfile />} />

                  {/* Job Profile Route */}
                  <Route path="/jobs/:id" element={<JobProfile />} />

                  {/* Default Route */}
                  <Route
                    path="/"
                    element={
                      <Navigate
                        to={
                          userType
                            ? defaultRoutes[userType as UserType]
                            : "/login"
                        }
                        replace
                      />
                    }
                  />
                </Routes>
              </Suspense>
            </AppLayout>
          }
        />
      </Routes>
    </WebSocketProvider>
  );
};

export default App;
