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
  RiRefreshLine,
  RiAlertLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiArrowUpLine as RiTrendingUpLine,
  RiArrowDownLine as RiTrendingDownLine,
  RiEyeLine,
  RiUserStarLine,
  RiPieChartLine,
  RiLineChartLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiLoaderLine,
  RiToolsLine,
  RiHomeSmileLine,
  RiHandHeartLine,
} from "react-icons/ri";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import { useAppSelector } from "../../store";
import dashboardService from "../../services/dashboardService";
import "./SuperUserDashboard.scss";

interface DashboardData {
  overview: {
    totalAgencies: number;
    totalProperties: number;
    totalTechnicians: number;
    totalPropertyManagers: number;
    totalTeamMembers: number;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    pendingJobs: number;
    overdueJobs: number;
  };
  jobStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  recentActivity: {
    newAgencies: number;
    newProperties: number;
    newTechnicians: number;
    newJobs: number;
    completedJobsWeek: number;
  };
  paymentStats: {
    totalPayments: number;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    pendingCount: number;
    paidCount: number;
  };
  monthlyTrends: Array<{
    month: string;
    totalJobs: number;
    completedJobs: number;
  }>;
  topTechnicians: Array<{
    name: string;
    completedJobs: number;
  }>;
  recentJobs: Array<{
    id: string;
    job_id: string;
    jobType: string;
    status: string;
    dueDate: string;
    createdAt: string;
    technicianName: string;
    propertyAddress: string;
  }>;
  lastUpdated: string;
}

const SuperUserDashboard = () => {
  const { user } = useAppSelector((state) => state.user);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await dashboardService.getAdminStats();
      if (response.status === "success") {
        setDashboardData(response.data);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#10b981";
      case "in progress":
        return "#f59e0b";
      case "pending":
        return "#3b82f6";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  if (loading) {
    return (
      <div className="super-user-dashboard">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="super-user-dashboard">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            <RiRefreshLine />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const {
    overview,
    jobStatusDistribution,
    recentActivity,
    paymentStats,
    monthlyTrends,
    topTechnicians,
    recentJobs,
  } = dashboardData;

  return (
    <div className="super-user-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name || "Super User"}!</h1>
            <p>Comprehensive system overview and administration dashboard</p>
            <div className="last-updated">
              <RiInformationLine />
              <span>
                Last updated:{" "}
                {new Date(dashboardData.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine className={refreshing ? "spinning" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">
              <RiBuildingLine />
            </div>
            <div className="stat-content">
              <h3>{overview.totalAgencies}</h3>
              <p>Total Agencies</p>
              <div className="stat-trend positive">
                <RiTrendingUpLine />
                <span>+{recentActivity.newAgencies} this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card properties">
            <div className="stat-icon">
              <RiHomeSmileLine />
            </div>
            <div className="stat-content">
              <h3>{overview.totalProperties}</h3>
              <p>Total Properties</p>
              <div className="stat-trend positive">
                <RiTrendingUpLine />
                <span>+{recentActivity.newProperties} this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card technicians">
            <div className="stat-icon">
              <RiToolsLine />
            </div>
            <div className="stat-content">
              <h3>{overview.totalTechnicians}</h3>
              <p>Total Technicians</p>
              <div className="stat-trend positive">
                <RiTrendingUpLine />
                <span>+{recentActivity.newTechnicians} this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card jobs">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{overview.totalJobs}</h3>
              <p>Total Jobs</p>
              <div className="stat-trend positive">
                <RiTrendingUpLine />
                <span>+{recentActivity.newJobs} this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">
              <RiCalendarLine />
            </div>
            <div className="stat-content">
              <h3>{overview.activeJobs}</h3>
              <p>Active Jobs</p>
              <div className="stat-trend neutral">
                <RiLoaderLine />
                <span>In progress</span>
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <RiCheckLine />
            </div>
            <div className="stat-content">
              <h3>{overview.completedJobs}</h3>
              <p>Completed Jobs</p>
              <div className="stat-trend positive">
                <RiTrendingUpLine />
                <span>+{recentActivity.completedJobsWeek} this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <RiAlertLine />
            </div>
            <div className="stat-content">
              <h3>{overview.overdueJobs}</h3>
              <p>Overdue Jobs</p>
              <div className="stat-trend negative">
                <RiTrendingDownLine />
                <span>Needs attention</span>
              </div>
            </div>
          </div>

          <div className="stat-card earnings">
            <div className="stat-icon">
              <RiMoneyDollarCircleLine />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(paymentStats.totalAmount)}</h3>
              <p>Total Payments</p>
              <div className="stat-trend neutral">
                <RiMoneyDollarCircleLine />
                <span>{paymentStats.totalPayments} payments</span>
              </div>
            </div>
          </div>

          <div className="stat-card team-members">
            <div className="stat-icon">
              <RiTeamLine />
            </div>
            <div className="stat-content">
              <h3>{overview.totalTeamMembers}</h3>
              <p>Team Members</p>
              <div className="stat-trend neutral">
                <RiUserLine />
                <span>Admin level access</span>
              </div>
            </div>
          </div>

          <div className="stat-card staff">
            <div className="stat-icon">
              <RiHandHeartLine />
            </div>
            <div className="stat-content">
              <h3>{overview.totalPropertyManagers}</h3>
              <p>Property Managers</p>
              <div className="stat-trend neutral">
                <RiUserLine />
                <span>Active users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-grid">
          <div className="chart-card large">
            <div className="chart-header">
              <h3>Monthly Job Trends</h3>
              <div className="chart-actions">
                <RiLineChartLine />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="totalJobs"
                  fill="#3b82f6"
                  name="Total Jobs"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completedJobs"
                  fill="#10b981"
                  name="Completed Jobs"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="completedJobs"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card medium">
            <div className="chart-header">
              <h3>Job Status Distribution</h3>
              <RiPieChartLine />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={jobStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {jobStatusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getStatusColor(entry.status)}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card medium">
            <div className="chart-header">
              <h3>Payment Overview</h3>
              <RiMoneyDollarCircleLine />
            </div>
            <div className="payment-summary">
              <div className="payment-item">
                <div className="payment-icon paid">
                  <RiCheckboxCircleLine />
                </div>
                <div className="payment-details">
                  <h4>{formatCurrency(paymentStats.paidAmount)}</h4>
                  <p>{paymentStats.paidCount} Paid</p>
                </div>
              </div>
              <div className="payment-item">
                <div className="payment-icon pending">
                  <RiTimeLine />
                </div>
                <div className="payment-details">
                  <h4>{formatCurrency(paymentStats.pendingAmount)}</h4>
                  <p>{paymentStats.pendingCount} Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Technicians and Recent Jobs */}
      <div className="dashboard-content">
        <div className="content-grid">
          <div className="content-card">
            <div className="card-header">
              <h3>Top Performing Technicians</h3>
              <RiUserStarLine />
            </div>
            <div className="technician-list">
              {topTechnicians.length === 0 ? (
                <p>No data available</p>
              ) : (
                topTechnicians.map((tech, index) => (
                  <div key={index} className="technician-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="tech-info">
                      <span className="name">{tech.name}</span>
                      <span className="jobs">
                        {tech.completedJobs} jobs completed
                      </span>
                    </div>
                    <div className="completion-badge">
                      <RiCheckLine />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>Recent Jobs</h3>
              <RiBriefcaseLine />
            </div>
            <div className="recent-jobs">
              {recentJobs.slice(0, 8).map((job) => {
                console.log(job, "job...");
                return (
                  <div key={job.id} className="job-item">
                    <div className="job-info">
                      <div className="job-header">
                        <span className="job-id">#{job.job_id}</span>
                        <span
                          className={`status-badge ${job.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="job-details">
                        <span className="job-type">{job.jobType}</span>
                        <span className="technician">{job.technicianName}</span>
                        {<span className="address">{job.propertyAddress}</span>}
                      </div>
                    </div>
                    <div className="job-date">
                      <RiTimeLine />
                      <span>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-button">
              <RiBuildingLine />
              <span>Manage Agencies</span>
            </button>
            <button className="action-button">
              <RiHomeSmileLine />
              <span>View Properties</span>
            </button>
            <button className="action-button">
              <RiToolsLine />
              <span>Manage Technicians</span>
            </button>
            <button className="action-button">
              <RiTeamLine />
              <span>Team Members</span>
            </button>
            <button className="action-button">
              <RiMoneyDollarCircleLine />
              <span>Technician Payments</span>
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

export default SuperUserDashboard;
