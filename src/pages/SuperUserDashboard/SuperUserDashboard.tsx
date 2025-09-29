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
  RiDownloadLine,
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
import { useNavigate } from "react-router-dom";
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
  const userState = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  // Debug logging to check user state
  useEffect(() => {
    console.log('SuperUserDashboard - User State Debug:', {
      fullState: userState,
      userName: userState?.name,
      userNameTrimmed: userState?.name?.trim(),
      userNameLength: userState?.name?.length,
      localStorage: localStorage.getItem('userData')
    });
  }, [userState]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [selectedChartData, setSelectedChartData] = useState<any>(null);
  const [showChartDetails, setShowChartDetails] = useState(false);

  // Chart filtering states
  const [chartDateRange, setChartDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [chartStatusFilter, setChartStatusFilter] = useState("all");
  const [chartViewType, setChartViewType] = useState<
    "monthly" | "weekly" | "daily"
  >("monthly");
  const [filteredChartData, setFilteredChartData] = useState<any>(null);
  const [loadingFilteredData, setLoadingFilteredData] = useState(false);

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

  const fetchFilteredData = async () => {
    if (
      !chartDateRange.startDate &&
      !chartDateRange.endDate &&
      chartStatusFilter === "all" &&
      chartViewType === "monthly"
    ) {
      setFilteredChartData(null);
      return;
    }

    try {
      setLoadingFilteredData(true);
      const params = {
        startDate: chartDateRange.startDate || undefined,
        endDate: chartDateRange.endDate || undefined,
        viewType: chartViewType,
        statusFilter: chartStatusFilter,
      };

      const response = await dashboardService.getFilteredAdminStats(params);
      if (response.status === "success") {
        setFilteredChartData(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch filtered data:", error);
    } finally {
      setLoadingFilteredData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchFilteredData();
  }, [chartDateRange, chartStatusFilter, chartViewType]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Navigation handlers for quick actions
  const handleQuickAction = (route: string) => {
    navigate(`/${route}`);
  };

  // Handler for job item clicks
  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Handler for stat card clicks
  const handleStatCardClick = (type: string) => {
    switch (type) {
      case "agencies":
        navigate("/agencies");
        break;
      case "properties":
        navigate("/properties");
        break;
      case "technicians":
        navigate("/technician");
        break;
      case "jobs":
        navigate("/jobs");
        break;
      case "payments":
        navigate("/technicianPayments");
        break;
      case "teamMembers":
        navigate("/teamMembers");
        break;
      default:
        break;
    }
  };

  // Handle chart interactions
  const handleChartClick = (data: any) => {
    if (data && data.activePayload) {
      setSelectedChartData(data.activePayload[0].payload);
      setShowChartDetails(true);
    }
  };

  const handleChartExport = () => {
    const dataToExport = filteredChartData ? chartData.trends : monthlyTrends;
    const headers = filteredChartData
      ? "Period,Total Jobs,Completed Jobs,Pending Jobs,In Progress Jobs,Overdue Jobs\n"
      : "Month,Total Jobs,Completed Jobs\n";

    const csvRows = filteredChartData
      ? dataToExport.map(
          (row: any) =>
            `${row.month},${row.totalJobs},${row.completedJobs},${
              row.pendingJobs || 0
            },${row.inProgressJobs || 0},${row.overdueJobs || 0}`
        )
      : dataToExport.map(
          (row: any) => `${row.month},${row.totalJobs},${row.completedJobs}`
        );

    const csvContent =
      "data:text/csv;charset=utf-8," + headers + csvRows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `dashboard_trends_${filteredChartData ? "filtered_" : ""}${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Filter recent jobs based on search and status
  const filteredRecentJobs = recentJobs.filter((job) => {
    const matchesSearch =
      job.job_id.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.jobType.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.technicianName.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.propertyAddress.toLowerCase().includes(jobSearchTerm.toLowerCase());

    const matchesStatus =
      jobStatusFilter === "all" ||
      job.status.toLowerCase() === jobStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(recentJobs.map((job) => job.status))];

  // Use filtered data if available, otherwise use original data
  const chartData = filteredChartData
    ? {
        trends: filteredChartData.trends.map((trend: any) => ({
          month: trend.period,
          totalJobs: trend.totalJobs,
          completedJobs: trend.completedJobs,
          pendingJobs: trend.pendingJobs,
          inProgressJobs: trend.inProgressJobs,
          overdueJobs: trend.overdueJobs,
        })),
        statusDistribution: filteredChartData.statusDistribution,
      }
    : {
        trends: monthlyTrends,
        statusDistribution: jobStatusDistribution,
      };

  // Get date range options (last 6 months by default)
  const getDateRangeOptions = () => {
    const options = [
      { value: "3", label: "Last 3 Months" },
      { value: "6", label: "Last 6 Months" },
      { value: "12", label: "Last 12 Months" },
      { value: "custom", label: "Custom Range" },
    ];
    return options;
  };

  return (
    <div className="super-user-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, {userState?.name?.trim() || "Super User"}!</h1>
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
          <div
            className="stat-card primary clickable"
            onClick={() => handleStatCardClick("agencies")}
          >
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

          <div
            className="stat-card properties clickable"
            onClick={() => handleStatCardClick("properties")}
          >
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

          <div
            className="stat-card technicians clickable"
            onClick={() => handleStatCardClick("technicians")}
          >
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

          <div
            className="stat-card jobs clickable"
            onClick={() => handleStatCardClick("jobs")}
          >
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

          <div 
            className="stat-card active clickable"
            onClick={() => handleStatCardClick("jobs")}
          >
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

          <div 
            className="stat-card success clickable"
            onClick={() => handleStatCardClick("jobs")}
          >
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

          <div 
            className="stat-card warning clickable"
            onClick={() => handleStatCardClick("jobs")}
          >
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

          <div
            className="stat-card earnings clickable"
            onClick={() => handleStatCardClick("payments")}
          >
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

          <div
            className="stat-card team-members clickable"
            onClick={() => handleStatCardClick("teamMembers")}
          >
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

          <div 
            className="stat-card staff clickable"
            onClick={() => handleStatCardClick("properties")}
          >
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
        {/* Monthly Trends - Full Width on Top */}
        <div className="chart-row-full">
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>Monthly Job Trends</h3>
              <div className="chart-actions">
                <button
                  className="chart-export-btn"
                  onClick={handleChartExport}
                  title="Export Data"
                  type="button"
                >
                  <RiDownloadLine />
                </button>
              </div>
            </div>

            {/* Chart Filters */}
            <div className="chart-filters">
              <div className="filter-group">
                <label>Time Range:</label>
                <select
                  value={chartDateRange.startDate || "6"}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== "custom") {
                      const months = parseInt(value);
                      const endDate = new Date();
                      const startDate = new Date();
                      startDate.setMonth(startDate.getMonth() - months);
                      setChartDateRange({
                        startDate: startDate.toISOString().split("T")[0],
                        endDate: endDate.toISOString().split("T")[0],
                      });
                    }
                  }}
                  className="filter-select"
                >
                  {getDateRangeOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>View:</label>
                <select
                  value={chartViewType}
                  onChange={(e) =>
                    setChartViewType(
                      e.target.value as "monthly" | "weekly" | "daily"
                    )
                  }
                  className="filter-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={chartStatusFilter}
                  onChange={(e) => setChartStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="in_progress">In Progress Only</option>
                  <option value="overdue">Overdue Only</option>
                </select>
              </div>

              <div className="filter-actions">
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setChartDateRange({ startDate: "", endDate: "" });
                    setChartStatusFilter("all");
                    setChartViewType("monthly");
                  }}
                  type="button"
                >
                  Reset Filters
                </button>
              </div>
            </div>
            {loadingFilteredData ? (
              <div className="chart-loading">
                <RiLoaderLine className="loading-spinner" />
                <p>Loading filtered data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                  data={chartData.trends}
                  onClick={handleChartClick}
                  style={{ cursor: "pointer" }}
                >
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
                    formatter={(value, name) => [
                      value,
                      name === "totalJobs" ? "Total Jobs" : "Completed Jobs",
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalJobs"
                    fill="#3b82f6"
                    name="Total Jobs"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="completedJobs"
                    fill="#10b981"
                    name="Completed Jobs"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                  <Line
                    type="monotone"
                    dataKey="completedJobs"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            {selectedChartData && showChartDetails && (
              <div className="chart-details-modal">
                <div className="chart-details-content">
                  <div className="chart-details-header">
                    <h4>Details for {selectedChartData.month}</h4>
                    <button
                      className="close-modal-btn"
                      onClick={() => setShowChartDetails(false)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <div className="chart-details-body">
                    <div className="detail-item">
                      <span className="detail-label">Total Jobs:</span>
                      <span className="detail-value">
                        {selectedChartData.totalJobs}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Completed Jobs:</span>
                      <span className="detail-value">
                        {selectedChartData.completedJobs}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Completion Rate:</span>
                      <span className="detail-value">
                        {selectedChartData.totalJobs > 0
                          ? `${(
                              (selectedChartData.completedJobs /
                                selectedChartData.totalJobs) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pending Jobs:</span>
                      <span className="detail-value">
                        {selectedChartData.totalJobs -
                          selectedChartData.completedJobs}
                      </span>
                    </div>
                  </div>
                  <div className="chart-details-footer">
                    <button
                      className="view-month-jobs-btn"
                      onClick={() => {
                        navigate("/jobs");
                        setShowChartDetails(false);
                      }}
                      type="button"
                    >
                      View Jobs for {selectedChartData.month}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row - Status Distribution and Payment Overview */}
        <div className="chart-row-split">
          <div className="chart-card medium">
            <div className="chart-header">
              <h3>Job Status Distribution</h3>
              <RiPieChartLine />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.statusDistribution.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getStatusColor(entry.status)}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
                <Legend />
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
              <div className="payment-actions">
                <button
                  className="view-all-payments-btn"
                  onClick={() => navigate("/technicianPayments")}
                  type="button"
                >
                  View All Payments
                </button>
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
            <div className="jobs-filter-section">
              <div className="job-search">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  className="job-search-input"
                />
              </div>
              <div className="job-status-filter">
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className="status-filter-select"
                >
                  <option value="all">All Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status.toLowerCase()}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="recent-jobs">
              {filteredRecentJobs.length === 0 ? (
                <div className="no-jobs-found">
                  <p>No jobs found matching your criteria.</p>
                </div>
              ) : (
                filteredRecentJobs.slice(0, 8).map((job) => {
                  console.log(job, "job...");
                  return (
                    <div
                      key={job.id}
                      className="job-item clickable"
                      onClick={() => handleJobClick(job.id)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleJobClick(job.id);
                        }
                      }}
                    >
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
                          <span className="technician">
                            {job.technicianName}
                          </span>
                          {
                            <span className="address">
                              {job.propertyAddress}
                            </span>
                          }
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
                })
              )}
              {filteredRecentJobs.length > 8 && (
                <div className="view-more-jobs">
                  <button
                    className="view-more-btn"
                    onClick={() => navigate("/jobs")}
                    type="button"
                  >
                    View All Jobs ({filteredRecentJobs.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button
              className="action-button"
              onClick={() => handleQuickAction("agencies")}
              type="button"
            >
              <RiBuildingLine />
              <span>Manage Agencies</span>
            </button>
            <button
              className="action-button"
              onClick={() => handleQuickAction("properties")}
              type="button"
            >
              <RiHomeSmileLine />
              <span>View Properties</span>
            </button>
            <button
              className="action-button"
              onClick={() => handleQuickAction("technician")}
              type="button"
            >
              <RiToolsLine />
              <span>Manage Technicians</span>
            </button>
            <button
              className="action-button"
              onClick={() => handleQuickAction("teamMembers")}
              type="button"
            >
              <RiTeamLine />
              <span>Team Members</span>
            </button>
            <button
              className="action-button"
              onClick={() => handleQuickAction("technicianPayments")}
              type="button"
            >
              <RiMoneyDollarCircleLine />
              <span>Technician Payments</span>
            </button>
            <button
              className="action-button"
              onClick={() => handleQuickAction("reports")}
              type="button"
            >
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
