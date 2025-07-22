import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { restoreAuthState } from "./store/userSlice";
import { routeConfig } from "./config/routeConfig";
import { defaultRoutes } from "./config/roleBasedRoutes";
import type { UserType } from "./store/userSlice";
import { AppLayout } from "./components";
import "./App.css";

// Import pages
import { Login, AdminLogin, AgentLogin, PasswordReset } from "./pages/Login";
import PropertyProfile from "./pages/PropertyProfile";

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
        location.pathname === "/login/agent") &&
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
    <AppLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/agent" element={<AgentLogin />} />
          <Route path="/password-reset" element={<PasswordReset />} />

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

          {/* Default Route */}
          <Route
            path="/"
            element={
              <Navigate
                to={userType ? defaultRoutes[userType as UserType] : "/login"}
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default App;
