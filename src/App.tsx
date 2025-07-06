import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Sidebar, TopNavbar } from "./components";
import {
  Login,
  AgentLogin,
  AdminLogin,
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

  // Check if current route is any login page
  const isLoginPage = location.pathname.startsWith("/login");

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    dispatch(restoreAuthState());
    setIsAuthRestored(true);
  }, [dispatch]);

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
      <div className="app-loading" style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(2, 73, 116, 0.2)',
          borderTop: '3px solid #024974',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Render login pages without sidebar/navbar
  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/agent" element={<AgentLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
      </Routes>
    );
  }

  // If user is not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Render main app layout for other routes with role-based access
  return (
    <div className="app-layout">
      <TopNavbar onMobileMenuClick={handleMobileMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <Routes>
          {/* Dynamic routes generated based on user roles */}
          {generateAllRoutes()}
          
          {/* Redirect root path to user's dashboard */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={userType ? getFullRoute(userType, 'dashboard') : '/login'} 
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
                  <p>Your current role ({userType}) doesn't allow access to this resource.</p>
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
