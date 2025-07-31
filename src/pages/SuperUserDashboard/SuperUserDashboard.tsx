import { useState, useEffect } from "react";
import {
  RiUserLine,
  RiBuildingLine,
  RiTeamLine,
  RiBarChartLine,
  RiSettingsLine,
  RiShieldLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiCheckLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import "./SuperUserDashboard.scss";

interface DashboardStats {
  totalAgencies: number;
  totalProperties: number;
  totalStaff: number;
  totalTechnicians: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  pendingApprovals: number;
}

const SuperUserDashboard = () => {
  const { user } = useAppSelector((state) => state.user);
  const [stats, setStats] = useState<DashboardStats>({
    totalAgencies: 0,
    totalProperties: 0,
    totalStaff: 0,
    totalTechnicians: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching super user dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockStats: DashboardStats = {
          totalAgencies: 15,
          totalProperties: 247,
          totalStaff: 89,
          totalTechnicians: 34,
          activeJobs: 23,
          completedJobs: 156,
          totalRevenue: 1250000,
          pendingApprovals: 7,
        };
        setStats(mockStats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="super-user-dashboard">
        <div className="loading-container">
          <p>Loading super user dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="super-user-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h2>Super User Dashboard</h2>
            <p>System-wide overview and administration</p>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.name || "Super User"}</span>
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
              <h3>{stats.totalAgencies}</h3>
              <p>Total Agencies</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiUserLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalProperties}</h3>
              <p>Total Properties</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiTeamLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalStaff}</h3>
              <p>Total Staff</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalTechnicians}</h3>
              <p>Total Technicians</p>
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
              <RiBarChartLine />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats.totalRevenue)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <RiShieldLine />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-button">
              <RiUserLine />
              <span>Manage Agencies</span>
            </button>
            <button className="action-button">
              <RiBuildingLine />
              <span>View Properties</span>
            </button>
            <button className="action-button">
              <RiTeamLine />
              <span>Manage Staff</span>
            </button>
            <button className="action-button">
              <RiSettingsLine />
              <span>System Settings</span>
            </button>
            <button className="action-button">
              <RiBarChartLine />
              <span>View Reports</span>
            </button>
            <button className="action-button">
              <RiShieldLine />
              <span>Pending Approvals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperUserDashboard;
