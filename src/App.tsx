import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Sidebar, TopNavbar } from "./components";
import {
  Login,
  AgentLogin,
  AdminLogin,
  PasswordReset,
  Dashboard,
} from "./pages";
import { useAppSelector, useAppDispatch } from "./store";
import { restoreAuthState } from "./store/userSlice";
import { generateAllRoutes } from "./config/routeConfig";
import { getFullRoute } from "./config/roleBasedRoutes";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthRestored, setIsAuthRestored] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Get user state from Redux
  const { isLoggedIn, userType } = useAppSelector((state) => state.user);

  // Check if current route is any authentication page (login, password reset)
  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname === "/password-reset";

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    // Only restore auth state if we're not already logged in (to avoid conflicts with fresh logins)
    if (!isLoggedIn) {
      console.log("Restoring auth state from localStorage"); // Debug log
      dispatch(restoreAuthState());
    }
    setIsAuthRestored(true);
  }, [dispatch, isLoggedIn]);

  // Debug: Log authentication state changes
  useEffect(() => {
    console.log("Auth state changed:", {
      isLoggedIn,
      userType,
      currentPath: location.pathname,
    });
  }, [isLoggedIn, userType, location.pathname]);

  // Handle navigation only immediately after restoring auth state (not during normal navigation)
  useEffect(() => {
    if (
      isLoggedIn &&
      userType &&
      isAuthRestored &&
      !isAuthPage &&
      location.pathname === "/"
    ) {
      const dashboardPath = getFullRoute(userType, "dashboard");
      console.log("Auto-navigating from root to dashboard:", dashboardPath);
      // Use a small delay to ensure React Router is ready
      setTimeout(() => {
        window.location.href = dashboardPath;
      }, 100);
    }
  }, [isLoggedIn, userType, isAuthRestored, isAuthPage]); // Removed location.pathname dependency to prevent constant redirects

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleMobileMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show loading while restoring auth state
  if (!isAuthRestored) {
    return (
      <div
        className="app-loading"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          className="loading-spinner"
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(2, 73, 116, 0.2)",
            borderTop: "3px solid #024974",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Render authentication pages without sidebar/navbar
  if (isAuthPage) {
    // If user is already logged in, redirect them to their dashboard (except for password reset page)
    if (
      isLoggedIn &&
      userType &&
      !location.pathname.startsWith("/password-reset")
    ) {
      const dashboardPath = getFullRoute(userType, "dashboard");
      console.log(
        "User already logged in, redirecting from auth page to dashboard:",
        dashboardPath
      );
      return <Navigate to={dashboardPath} replace />;
    }

    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/agent" element={<AgentLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/password-reset" element={<PasswordReset />} />
      </Routes>
    );
  }

  // If user is not logged in, redirect to login
  if (!isLoggedIn && isAuthRestored) {
    console.log("User not logged in, redirecting to login"); // Debug log
    return <Navigate to="/login" replace />;
  }

  // Render main app layout for other routes with role-based access
  return (
    <div className="app-layout">
      <TopNavbar onMobileMenuClick={handleMobileMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <Routes>
          {/* Simple test dashboard route without protection */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Dynamic routes generated based on user roles */}
          {generateAllRoutes()}

          {/* Redirect root path to user's dashboard */}
          <Route
            path="/"
            element={
              <Navigate
                to={userType ? getFullRoute(userType, "dashboard") : "/login"}
                replace
              />
            }
          />

          {/* Catch-all route for access denied */}
          <Route
            path="*"
            element={
              <div className="page-container">
                <div className="page-header">
                  <h1>Access Denied</h1>
                  <p>You don't have permission to access this page</p>
                </div>
                <div className="content-card">
                  <h3>Insufficient Permissions</h3>
                  <p>
                    Your current role ({userType}) doesn't allow access to this
                    resource.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
