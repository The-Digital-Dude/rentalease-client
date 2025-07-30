import { useState } from "react";
import { useAppSelector } from "../../store";
import { Sidebar } from "../Sidebar";
import TopNavbar from "../TopNavbar";
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
      <TopNavbar onMobileMenuClick={toggleSidebar} />

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
