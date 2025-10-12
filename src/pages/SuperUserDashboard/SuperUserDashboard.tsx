import { useState, useEffect } from "react";
import styles from "./SuperUserDashboard.module.scss";
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
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../services/dashboardService";

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
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Debug logging to check user state
  useEffect(() => {
    console.log("SuperUserDashboard - User State Debug:", {
      fullState: userState,
      userName: userState?.name,
      userNameTrimmed: userState?.name?.trim(),
      userNameLength: userState?.name?.length,
      localStorage: localStorage.getItem("userData"),
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
  const [selectedTimeRange, setSelectedTimeRange] = useState("6");
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
        return isDarkMode ? "#34d399" : "#10b981";
      case "in progress":
        return isDarkMode ? "#fbbf24" : "#f59e0b";
      case "pending":
        return isDarkMode ? "#60a5fa" : "#3b82f6";
      case "overdue":
        return isDarkMode ? "#f87171" : "#ef4444";
      default:
        return isDarkMode ? "#94a3b8" : "#6b7280";
    }
  };

  const COLORS = isDarkMode
    ? [
        "#60a5fa", // Blue
        "#34d399", // Green
        "#fbbf24", // Yellow
        "#f87171", // Red
        "#a78bfa", // Purple
        "#6ee7b7", // Light Green
      ]
    : ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  if (loading) {
    return (
      <div className={styles.superUserDashboard}>
        <div className={styles.loadingContainer}>
          <RiLoaderLine className={styles.loadingSpinner} />
          <p>Loading comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.superUserDashboard}>
        <div className={styles.errorContainer}>
          <RiErrorWarningLine className={styles.errorIcon} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleRefresh}
          >
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
    <div className={styles.superUserDashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1>Welcome back, {userState?.name?.trim() || "Super User"}!</h1>
            <p>Comprehensive system overview and administration dashboard</p>
            <div className={styles.lastUpdated}>
              <RiInformationLine />
              <span>
                Last updated:{" "}
                {new Date(dashboardData.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine className={refreshing ? styles.spinning : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className={styles.statsOverview}>
          <div
            className={`${styles.statCard} ${styles.primary} ${styles.clickable}`}
            onClick={() => handleStatCardClick("agencies")}
          >
            <div className={styles.statIcon}>
              <RiBuildingLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalAgencies}</h3>
              <p>Total Agencies</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newAgencies} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.properties} ${styles.clickable}`}
            onClick={() => handleStatCardClick("properties")}
          >
            <div className={styles.statIcon}>
              <RiHomeSmileLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalProperties}</h3>
              <p>Total Properties</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newProperties} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.technicians} ${styles.clickable}`}
            onClick={() => handleStatCardClick("technicians")}
          >
            <div className={styles.statIcon}>
              <RiToolsLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalTechnicians}</h3>
              <p>Total Technicians</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newTechnicians} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.jobs} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiBriefcaseLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalJobs}</h3>
              <p>Total Jobs</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newJobs} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.active} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiCalendarLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.activeJobs}</h3>
              <p>Active Jobs</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiLoaderLine />
                <span>In progress</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.success} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiCheckLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.completedJobs}</h3>
              <p>Completed Jobs</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.completedJobsWeek} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.warning} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiAlertLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.overdueJobs}</h3>
              <p>Overdue Jobs</p>
              <div className={`${styles.statTrend} ${styles.negative}`}>
                <RiTrendingDownLine />
                <span>Needs attention</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.earnings} ${styles.clickable}`}
            onClick={() => handleStatCardClick("payments")}
          >
            <div className={styles.statIcon}>
              <RiMoneyDollarCircleLine />
            </div>
            <div className={styles.statContent}>
              <h3>{formatCurrency(paymentStats.totalAmount)}</h3>
              <p>Total Payments</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiMoneyDollarCircleLine />
                <span>{paymentStats.totalPayments} payments</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.teamMembers} ${styles.clickable}`}
            onClick={() => handleStatCardClick("teamMembers")}
          >
            <div className={styles.statIcon}>
              <RiTeamLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalTeamMembers}</h3>
              <p>Team Members</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiUserLine />
                <span>Admin level access</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.staff} ${styles.clickable}`}
            onClick={() => handleStatCardClick("properties")}
          >
            <div className={styles.statIcon}>
              <RiHandHeartLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalPropertyManagers}</h3>
              <p>Property Managers</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiUserLine />
                <span>Active users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        {/* Monthly Trends - Full Width on Top */}
        <div className={styles.chartRowFull}>
          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <div className={styles.chartHeader}>
              <h3>Monthly Job Trends</h3>
              <div className={styles.chartActions}>
                <button
                  className={styles.chartExportBtn}
                  onClick={handleChartExport}
                  title="Export Data"
                  type="button"
                >
                  <RiDownloadLine />
                </button>
              </div>
            </div>

            {/* Chart Filters */}
            <div className={styles.chartFilters}>
              <div className={styles.filterGroup}>
                <label>Time Range:</label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedTimeRange(value);
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
                  className={styles.filterSelect}
                >
                  {getDateRangeOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTimeRange === "custom" && (
                <div
                  className={`${styles.filterGroup} ${styles.customDateRange}`}
                >
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={chartDateRange.startDate}
                    onChange={(e) => {
                      setChartDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }));
                    }}
                    className={styles.filterSelect}
                  />
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={chartDateRange.endDate}
                    onChange={(e) => {
                      setChartDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }));
                    }}
                    className={styles.filterSelect}
                  />
                </div>
              )}

              <div className={styles.filterGroup}>
                <label>View:</label>
                <select
                  value={chartViewType}
                  onChange={(e) =>
                    setChartViewType(
                      e.target.value as "monthly" | "weekly" | "daily"
                    )
                  }
                  className={styles.filterSelect}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Status:</label>
                <select
                  value={chartStatusFilter}
                  onChange={(e) => setChartStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="in_progress">In Progress Only</option>
                  <option value="overdue">Overdue Only</option>
                </select>
              </div>

              <div className={styles.filterActions}>
                <button
                  className={styles.resetFiltersBtn}
                  onClick={() => {
                    setChartDateRange({ startDate: "", endDate: "" });
                    setSelectedTimeRange("6");
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
              <div className={styles.chartLoading}>
                <RiLoaderLine className={styles.loadingSpinner} />
                <p>Loading filtered data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                  data={chartData.trends}
                  onClick={handleChartClick}
                  style={{ cursor: "pointer" }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#f0f0f0"}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  />
                  <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "white",
                      border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                        : "0 4px 12px rgba(0, 0, 0, 0.1)",
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
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
                    fill={isDarkMode ? "#60a5fa" : "#3b82f6"}
                    name="Total Jobs"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="completedJobs"
                    fill={isDarkMode ? "#34d399" : "#10b981"}
                    name="Completed Jobs"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                  <Line
                    type="monotone"
                    dataKey="completedJobs"
                    stroke={isDarkMode ? "#34d399" : "#059669"}
                    strokeWidth={3}
                    dot={{
                      fill: isDarkMode ? "#34d399" : "#059669",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      stroke: isDarkMode ? "#34d399" : "#059669",
                      strokeWidth: 2,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            {selectedChartData && showChartDetails && (
              <div className={styles.chartDetailsModal}>
                <div className={styles.chartDetailsContent}>
                  <div className={styles.chartDetailsHeader}>
                    <h4>Details for {selectedChartData.month}</h4>
                    <button
                      className={styles.closeModalBtn}
                      onClick={() => setShowChartDetails(false)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <div className={styles.chartDetailsBody}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Total Jobs:</span>
                      <span className={styles.detailValue}>
                        {selectedChartData.totalJobs}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        Completed Jobs:
                      </span>
                      <span className={styles.detailValue}>
                        {selectedChartData.completedJobs}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        Completion Rate:
                      </span>
                      <span className={styles.detailValue}>
                        {selectedChartData.totalJobs > 0
                          ? `${(
                              (selectedChartData.completedJobs /
                                selectedChartData.totalJobs) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Pending Jobs:</span>
                      <span className={styles.detailValue}>
                        {selectedChartData.totalJobs -
                          selectedChartData.completedJobs}
                      </span>
                    </div>
                  </div>
                  <div className={styles.chartDetailsFooter}>
                    <button
                      className={styles.viewMonthJobsBtn}
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
        <div className={styles.chartRowSplit}>
          <div className={`${styles.chartCard} ${styles.medium}`}>
            <div className={styles.chartHeader}>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "white",
                    border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    boxShadow: isDarkMode
                      ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                      : "0 4px 12px rgba(0, 0, 0, 0.1)",
                    color: isDarkMode ? "#f9fafb" : "#1f2937",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`${styles.chartCard} ${styles.medium}`}>
            <div className={styles.chartHeader}>
              <h3>Payment Overview</h3>
              <RiMoneyDollarCircleLine />
            </div>
            <div className={styles.paymentSummary}>
              <div className={styles.paymentItem}>
                <div className={`${styles.paymentIcon} ${styles.paid}`}>
                  <RiCheckboxCircleLine />
                </div>
                <div className={styles.paymentDetails}>
                  <h4>{formatCurrency(paymentStats.paidAmount)}</h4>
                  <p>{paymentStats.paidCount} Paid</p>
                </div>
              </div>
              <div className={styles.paymentItem}>
                <div className={`${styles.paymentIcon} ${styles.pending}`}>
                  <RiTimeLine />
                </div>
                <div className={styles.paymentDetails}>
                  <h4>{formatCurrency(paymentStats.pendingAmount)}</h4>
                  <p>{paymentStats.pendingCount} Pending</p>
                </div>
              </div>
              <div className={styles.paymentActions}>
                <button
                  className={styles.viewAllPaymentsBtn}
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
      <div className={styles.dashboardContent}>
        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>Top Performing Technicians</h3>
              <RiUserStarLine />
            </div>
            <div className={styles.technicianList}>
              {topTechnicians.length === 0 ? (
                <p>No data available</p>
              ) : (
                topTechnicians.map((tech, index) => (
                  <div key={index} className={styles.technicianItem}>
                    <div className={styles.rank}>#{index + 1}</div>
                    <div className={styles.techInfo}>
                      <span className={styles.name}>{tech.name}</span>
                      <span className={styles.jobs}>
                        {tech.completedJobs} jobs completed
                      </span>
                    </div>
                    <div className={styles.completionBadge}>
                      <RiCheckLine />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>Recent Jobs</h3>
              <RiBriefcaseLine />
            </div>
            <div className={styles.jobsFilterSection}>
              <div className={styles.jobSearch}>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  className={styles.jobSearchInput}
                />
              </div>
              <div className={styles.jobStatusFilter}>
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className={styles.statusFilterSelect}
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
            <div className={styles.recentJobs}>
              {filteredRecentJobs.length === 0 ? (
                <div className={styles.noJobsFound}>
                  <p>No jobs found matching your criteria.</p>
                </div>
              ) : (
                filteredRecentJobs.slice(0, 8).map((job) => {
                  console.log(job, "job...");
                  return (
                    <div
                      key={job.id}
                      className={`${styles.jobItem} ${styles.clickable}`}
                      onClick={() => handleJobClick(job.id)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleJobClick(job.id);
                        }
                      }}
                    >
                      <div className={styles.jobInfo}>
                        <div className={styles.jobHeader}>
                          <span className={styles.jobId}>#{job.job_id}</span>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[job.status.toLowerCase().replace(" ", "-")]
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className={styles.jobDetails}>
                          <span className={styles.jobType}>{job.jobType}</span>
                          <span className={styles.technician}>
                            {job.technicianName}
                          </span>
                          {
                            <span className={styles.address}>
                              {job.propertyAddress}
                            </span>
                          }
                        </div>
                      </div>
                      <div className={styles.jobDate}>
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
                <div className={styles.viewMoreJobs}>
                  <button
                    className={styles.viewMoreBtn}
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
        <div className={styles.quickActions}>
          <div className={styles.quickActionsHeader}>
            <h3 className={styles.title}>Quick Actions</h3>
            <p className={styles.subtitle}>
              Navigate to frequently used sections
            </p>
          </div>
          <div className={styles.actionsGrid}>
            <button
              className={`${styles.actionCard} ${styles.agencies}`}
              onClick={() => handleQuickAction("agencies")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiBuildingLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Agencies</h4>
                <p className={styles.cardDescription}>
                  Manage and monitor agencies
                </p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.properties}`}
              onClick={() => handleQuickAction("properties")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiHomeSmileLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Properties</h4>
                <p className={styles.cardDescription}>View property listings</p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.technicians}`}
              onClick={() => handleQuickAction("technician")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiToolsLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Technicians</h4>
                <p className={styles.cardDescription}>
                  Manage service providers
                </p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.team}`}
              onClick={() => handleQuickAction("teamMembers")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiTeamLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Team</h4>
                <p className={styles.cardDescription}>Manage team members</p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.payments}`}
              onClick={() => handleQuickAction("technicianPayments")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiMoneyDollarCircleLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Payments</h4>
                <p className={styles.cardDescription}>
                  Technician payment tracking
                </p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.reports}`}
              onClick={() => handleQuickAction("reports")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiBarChartLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Reports</h4>
                <p className={styles.cardDescription}>
                  View analytics & insights
                </p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperUserDashboard;
