import { useState, useEffect } from "react";
import {
  RiBuildingLine,
  RiUserLine,
  RiCalendarLine,
  RiCheckLine,
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiMessageLine,
  RiBarChartLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import "./AgencyDashboard.scss";

interface AgencyStats {
  totalProperties: number;
  activeProperties: number;
  totalTenants: number;
  activeJobs: number;
  completedJobs: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  upcomingInspections: number;
}

const AgencyDashboard = () => {
  const { user } = useAppSelector((state) => state.user);
  const [stats, setStats] = useState<AgencyStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalTenants: 0,
    activeJobs: 0,
    completedJobs: 0,
    monthlyRevenue: 0,
    pendingMaintenance: 0,
    upcomingInspections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching agency dashboard data
    const fetchAgencyData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockStats: AgencyStats = {
          totalProperties: 24,
          activeProperties: 22,
          totalTenants: 18,
          activeJobs: 5,
          completedJobs: 89,
          monthlyRevenue: 45000,
          pendingMaintenance: 3,
          upcomingInspections: 2,
        };
        setStats(mockStats);
      } catch (error) {
        console.error("Failed to fetch agency data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="agency-dashboard">
        <div className="loading-container">
          <p>Loading agency dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agency-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h2>Agency Dashboard</h2>
            <p>Manage your properties and tenants</p>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.name || "Agency User"}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <RiBuildingLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalProperties}</h3>
              <p>Total Properties</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiUserLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalTenants}</h3>
              <p>Total Tenants</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiCalendarLine />
            </div>
            <div className="stat-content">
              <h3>{stats.activeJobs}</h3>
              <p>Active Jobs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiCheckLine />
            </div>
            <div className="stat-content">
              <h3>{stats.completedJobs}</h3>
              <p>Completed Jobs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiMoneyDollarBoxLine />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats.monthlyRevenue)}</h3>
              <p>Monthly Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiFileListLine />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingMaintenance}</h3>
              <p>Pending Maintenance</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiMessageLine />
            </div>
            <div className="stat-content">
              <h3>{stats.upcomingInspections}</h3>
              <p>Upcoming Inspections</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiBarChartLine />
            </div>
            <div className="stat-content">
              <h3>{stats.activeProperties}</h3>
              <p>Active Properties</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-button">
              <RiBuildingLine />
              <span>Manage Properties</span>
            </button>
            <button className="action-button">
              <RiUserLine />
              <span>View Tenants</span>
            </button>
            <button className="action-button">
              <RiCalendarLine />
              <span>Schedule Jobs</span>
            </button>
            <button className="action-button">
              <RiFileListLine />
              <span>Maintenance Requests</span>
            </button>
            <button className="action-button">
              <RiMessageLine />
              <span>Contact Tenants</span>
            </button>
            <button className="action-button">
              <RiBarChartLine />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
