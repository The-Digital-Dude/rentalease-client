import { useState, useEffect } from "react";
import {
  RiDashboardLine,
  RiBuildingLine,
  RiUserStarLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import propertyManagerReportService, {
  type PropertyManagerDashboard,
  type PropertyManagerOverview,
  type PropertyManagerJobAnalytics,
} from "../../services/propertyManagerReportService";
import PropertyOverview from "./components/PropertyOverview/PropertyOverview";
import JobAnalytics from "./components/JobAnalytics/JobAnalytics";
import TechnicianPaymentsReport from "../../components/TechnicianPaymentsReport/TechnicianPaymentsReport";
import "./PropertyManagerReports.scss";

const PropertyManagerReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<PropertyManagerDashboard | null>(null);
  const [overviewData, setOverviewData] = useState<PropertyManagerOverview | null>(null);
  const [jobAnalyticsData, setJobAnalyticsData] = useState<PropertyManagerJobAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "overview", label: "Property Overview", icon: RiDashboardLine },
    { id: "jobs", label: "Job Analytics", icon: RiBuildingLine },
    { id: "payments", label: "Technician Payments", icon: RiUserStarLine },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await propertyManagerReportService.getPropertyManagerDashboard();
      setDashboardData(response.data);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to fetch dashboard data");
    }
  };

  const fetchTabData = async (tabId: string) => {
    try {
      setLoading(true);

      switch (tabId) {
        case "overview":
          if (!overviewData) {
            const response = await propertyManagerReportService.getOverviewReport();
            setOverviewData(response.data);
          }
          break;
        case "jobs":
          if (!jobAnalyticsData) {
            const response = await propertyManagerReportService.getJobAnalytics();
            setJobAnalyticsData(response.data);
          }
          break;
        case "payments":
          // TechnicianPaymentsReport component handles its own data fetching
          break;
      }
    } catch (error: any) {
      console.error(`Error fetching ${tabId} data:`, error);
      toast.error(error.message || `Failed to fetch ${tabId} data`);
    } finally {
      setLoading(false);
    }
  };


  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <PropertyOverview data={overviewData} dashboardData={dashboardData} />;
      case "jobs":
        return <JobAnalytics data={jobAnalyticsData} />;
      case "payments":
        return <TechnicianPaymentsReport />;
      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="page-container property-manager-reports">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Property performance insights and detailed analytics</p>
      </div>

      <div className="reports-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PropertyManagerReports;