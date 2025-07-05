import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar, TopNavbar } from "./components";
import { Dashboard, Agencies, JobManagement, Staff } from "./pages";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="app-layout">
      <TopNavbar onMobileMenuClick={handleMobileMenuClick} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/jobs" element={<JobManagement />} />
          <Route path="/staff" element={<Staff />} />
          <Route
            path="/invoices"
            element={
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
            }
          />
          <Route
            path="*"
            element={
              <div className="page-container">
                <div className="page-header">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist</p>
                </div>
                <div className="content-card">
                  <h3>Oops!</h3>
                  <p>The page you're looking for doesn't exist.</p>
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
