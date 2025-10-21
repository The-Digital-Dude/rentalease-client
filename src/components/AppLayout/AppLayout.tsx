import { useState } from "react";
import { useAppSelector } from "../../store";
import { Sidebar } from "../Sidebar";
import TopNavbar from "../TopNavbar";
import ChatWithUs from "../ChatWithUs";
import { SidebarProvider, useSidebar } from "../../contexts/SidebarContext";
import "./AppLayout.scss";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayoutContent = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed } = useSidebar();
  const { userType } = useAppSelector((state) => state.user);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
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
      
      {/* Chat Support Widget - Agency and Property Manager users */}
      {(userType === 'agency' || userType === 'property_manager') && (
        <ChatWithUs />
      )}
    </div>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { userType } = useAppSelector((state) => state.user);

  // Don't show layout for login pages
  if (!userType) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
};
