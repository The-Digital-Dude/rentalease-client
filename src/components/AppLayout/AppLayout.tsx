import { useState } from "react";
import { useAppSelector } from "../../store";
import { Sidebar } from "../Sidebar";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import "./AppLayout.scss";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userType } = useAppSelector((state) => state.user);

  // Don't show layout for login pages
  if (!userType) {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button
              className="mobile-menu-button"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <RiCloseLine size={24} />
              ) : (
                <RiMenuLine size={24} />
              )}
            </button>
            <div className="app-logo">
              <h2>RentalEase</h2>
            </div>
          </div>
          <div className="navbar-right">
            <span className="user-role">{userType}</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
};
