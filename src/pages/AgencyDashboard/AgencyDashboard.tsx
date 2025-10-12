import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBuildingLine,
  RiUserLine,
  RiCalendarLine,
  RiCheckLine,
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiMessageLine,
  RiBarChartLine,
  RiMapPinLine,
  RiTimeLine,
  RiLoaderLine,
  RiAlertLine,
  RiStarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiTimeLine as RiClockLine,
  RiUserStarLine,
  RiSpeedLine,
  RiAwardLine,
  RiPieChartLine,
  RiMoneyDollarCircleLine,
  RiArrowUpLine as RiTrendingUpLine,
  RiArrowDownLine as RiTrendingDownLine,
  RiEyeLine,
  RiPlayLine,
  RiPauseLine,
  RiRefreshLine,
  RiFilterLine,
  RiSearchLine,
  RiNotificationLine,
  RiSettingsLine,
  RiDownloadLine,
  RiShareLine,
  RiMoreLine,
  RiHomeLine,
  RiShieldCheckLine,
  RiTimerLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiBriefcaseLine,
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
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
  Legend,
} from "recharts";
import { useAppSelector } from "../../store";
import { agencyService } from "../../services/agencyService";
import jobService from "../../services/jobService";
import subscriptionService from "../../services/subscriptionService";
import "./AgencyDashboard.scss";

// Utility function to check authentication
const checkAuth = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }
  return token;
};

// Types based on the API response
interface DashboardData {
  quickStats: {
    totalProperties: number;
    totalJobs: number;
    totalTechnicians: number;
    activeJobs: number;
    completedJobs: number;
    overdueJobs: number;
  };
  jobStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  propertyStatusDistribution: Array<{
    status: string | null;
    count: number;
    percentage: number;
  }>;
  technicianAvailability: Array<{
    status: string;
    count: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    year: number;
    total: number;
    completed: number;
    scheduled: number;
  }>;
  recentJobs: Array<{
    id: string;
    job_id: string;
    jobType: string;
    status: string;
    dueDate: string;
    updatedAt: string;
    property: string;
  }>;
  recentProperties: Array<{
    id: string;
    address: string;
    propertyType: string;
    createdAt: string;
  }>;
  performanceSummary: {
    completionRate: number;
    averageJobsPerProperty: number;
    averageJobsPerTechnician: number;
  };
  lastUpdated: string;
}

interface AgencyJob {
  id: string;
  job_id: string;
  propertyAddress: string;
  jobType: string;
  priority: string;
  status: string;
  assignedDate: string;
  dueDate: string;
  estimatedDuration: string;
  description: string;
  completedAt?: string;
  actualDuration?: string;
  rating?: number;
  feedback?: string;
}

interface AgencyProperty {
  id: string;
  address: string;
  propertyType: string;
  status: string;
  createdAt: string;
  currentTenant?: {
    name: string;
    email: string;
    phone: string;
  };
  currentLandlord?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface AgencyStats {
  totalProperties: number;
  totalJobs: number;
  totalTechnicians: number;
  activeJobs: number;
  completedJobs: number;
  overdueJobs: number;
  scheduledJobs: number;
  completionRate: number;
  averageJobsPerProperty: number;
  averageJobsPerTechnician: number;
  efficiencyScore: number;
  propertyUtilizationRate: number;
  jobSuccessRate: number;
  totalPropertyManagers: number;
}

interface ChartData {
  name: string;
  value: number;
  fill?: string;
  color?: string;
}

const AgencyDashboard = () => {
  const user = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [jobs, setJobs] = useState<AgencyJob[]>([]);
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AgencyStats>({
    totalProperties: 0,
    totalJobs: 0,
    totalTechnicians: 0,
    activeJobs: 0,
    completedJobs: 0,
    overdueJobs: 0,
    scheduledJobs: 0,
    completionRate: 0,
    averageJobsPerProperty: 0,
    averageJobsPerTechnician: 0,
    efficiencyScore: 0,
    propertyUtilizationRate: 0,
    jobSuccessRate: 0,
    totalPropertyManagers: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Check if user is authenticated
      const token = checkAuth();
      console.log(
        "Fetching agency dashboard data with token:",
        token.substring(0, 20) + "..."
      );

      const result = await agencyService.getDashboardData();

      if (result.status === "success") {
        setDashboardData(result.data);

        // Transform recent jobs to match our interface
        const transformedJobs: AgencyJob[] = result.data.recentJobs.map(
          (job: any) => ({
            id: job.id,
            job_id: job.job_id,
            propertyAddress: job.property,
            jobType: job.jobType,
            priority: "Medium", // Default since not in API
            status: job.status,
            assignedDate: job.updatedAt,
            dueDate: job.dueDate,
            estimatedDuration: "2 hours", // Default since not in API
            description: `${job.jobType} service at ${job.property}`,
          })
        );

        setJobs(transformedJobs);

        // Transform recent properties
        const transformedProperties: AgencyProperty[] =
          result.data.recentProperties.map((property: any) => ({
            id: property.id,
            address: property.address,
            propertyType: property.propertyType,
            status: "Active", // Default since not in API
            createdAt: property.createdAt,
          }));

        setProperties(transformedProperties);

        // Calculate enhanced statistics
        const quickStats = result.data.quickStats;
        const performanceSummary = result.data.performanceSummary;

        // Calculate scheduled jobs from job status distribution
        const scheduledJobsCount =
          result.data.jobStatusDistribution.find(
            (status: any) => status.status.toLowerCase() === "scheduled"
          )?.count || 0;

        const enhancedStats: AgencyStats = {
          totalProperties: quickStats.totalProperties,
          totalJobs: quickStats.totalJobs,
          totalTechnicians: quickStats.totalTechnicians,
          totalPropertyManagers: quickStats.totalPropertyManagers,
          activeJobs: quickStats.activeJobs,
          completedJobs: quickStats.completedJobs,
          overdueJobs: quickStats.overdueJobs,
          scheduledJobs: scheduledJobsCount,
          completionRate: performanceSummary.completionRate,
          averageJobsPerProperty: performanceSummary.averageJobsPerProperty,
          averageJobsPerTechnician: performanceSummary.averageJobsPerTechnician,
          efficiencyScore: calculateEfficiencyScore(
            quickStats,
            performanceSummary
          ),
          propertyUtilizationRate: calculatePropertyUtilizationRate(quickStats),
          jobSuccessRate: calculateJobSuccessRate(quickStats),
        };

        setStats(enhancedStats);
      } else {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateEfficiencyScore = (
    quickStats: any,
    performanceSummary: any
  ) => {
    const completionRate = performanceSummary.completionRate;
    const overduePenalty = quickStats.overdueJobs * 10;
    const propertyEfficiency =
      quickStats.totalProperties > 0
        ? (quickStats.activeJobs / quickStats.totalProperties) * 100
        : 0;

    return Math.max(
      0,
      Math.min(100, completionRate - overduePenalty + propertyEfficiency)
    );
  };

  const calculatePropertyUtilizationRate = (quickStats: any) => {
    return quickStats.totalProperties > 0
      ? (quickStats.activeJobs / quickStats.totalJobs) * 100
      : 0;
  };

  const calculateJobSuccessRate = (quickStats: any) => {
    return quickStats.totalJobs > 0
      ? (quickStats.completedJobs / quickStats.totalJobs) * 100
      : 0;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle subscription management
  const handleManageSubscription = async () => {
    try {
      const portalUrl = await subscriptionService.createPortalSession();
      window.open(portalUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to create subscription portal session:", error);
      alert("Failed to open subscription management. Please try again.");
    }
  };

  // Navigation handlers for stat cards
  const handleStatCardClick = (statType: string) => {
    switch (statType) {
      case "properties":
        navigate("/properties");
        break;
      case "jobs":
        navigate("/agencyJobs");
        break;
      case "completedJobs":
        navigate("/completed-jobs");
        break;
      case "overdueJobs":
        navigate("/overdue-jobs");
        break;
      case "scheduledJobs":
        navigate("/scheduled-jobs");
        break;
      case "propertyManagers":
        navigate("/propertyManagerManagement");
        break;
      default:
        break;
    }
  };

  const handleJobStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      const result = await jobService.updateJobStatus(jobId, newStatus as any);

      if (result.success) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, status: newStatus } : job
          )
        );
        console.log("Job status updated successfully");
      } else {
        console.error("Failed to update job status:", result.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to update job status:", error);
      // You could show a toast notification here
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
      case "pending":
        return "warning";
      case "scheduled":
        return "info";
      case "overdue":
        return "danger";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "danger";
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  // Chart data preparation
  const jobStatusChartData: ChartData[] =
    dashboardData?.jobStatusDistribution.map((item) => ({
      name: item.status,
      value: item.count,
      fill:
        getStatusColor(item.status) === "success"
          ? "#10b981"
          : getStatusColor(item.status) === "warning"
          ? "#f59e0b"
          : getStatusColor(item.status) === "info"
          ? "#3b82f6"
          : getStatusColor(item.status) === "danger"
          ? "#ef4444"
          : "#6b7280",
    })) || [];

  const propertyStatusChartData: ChartData[] =
    dashboardData?.propertyStatusDistribution.map((item) => ({
      name: item.status || "Unknown",
      value: item.count,
      fill: "#3b82f6",
    })) || [];

  const monthlyProgressData = dashboardData?.monthlyProgress || [];

  const performanceMetricsData = [
    {
      name: "Completion Rate",
      value: stats.completionRate,
      target: 90,
      color: "#10b981",
    },
    {
      name: "Property Utilization",
      value: stats.propertyUtilizationRate,
      target: 80,
      color: "#3b82f6",
    },
    {
      name: "Job Success Rate",
      value: stats.jobSuccessRate,
      target: 95,
      color: "#f59e0b",
    },
    {
      name: "Efficiency Score",
      value: stats.efficiencyScore,
      target: 85,
      color: "#8b5cf6",
    },
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  const renderJobCard = (job: AgencyJob) => (
    <div key={job.id} className="job-card">
      <div className="job-header">
        <div className="job-type">
          <RiBriefcaseLine />
          <span>{job.jobType}</span>
          <span className="job-id">#{job.job_id}</span>
        </div>
        <div className="job-status">
          <span className={`status-badge ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
      </div>

      <div className="job-details">
        <div className="job-address">
          <RiMapPinLine />
          <span>{job.propertyAddress}</span>
        </div>
        <div className="job-description">
          <p>{job.description}</p>
        </div>
        <div className="job-meta">
          <div className="job-priority">
            <span
              className={`priority-badge ${getPriorityColor(job.priority)}`}
            >
              {job.priority} Priority
            </span>
          </div>
          <div className="job-duration">
            <RiTimeLine />
            <span>{job.estimatedDuration}</span>
          </div>
        </div>
        <div className="job-dates">
          <div className="due-date">
            <RiCalendarLine />
            <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
        {job.rating && (
          <div className="job-rating">
            <RiStarLine />
            <span>{job.rating}/5</span>
            {job.feedback && (
              <div className="job-feedback">
                <p>"{job.feedback}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="job-actions">
        {job.status === "Pending" && (
          <>
            <button
              className="btn btn-primary"
              onClick={() => handleJobStatusUpdate(job.id, "In Progress")}
            >
              <RiPlayLine />
              Start Job
            </button>
            <button className="btn btn-secondary">
              <RiEyeLine />
              View Details
            </button>
          </>
        )}
        {job.status === "In Progress" && (
          <>
            <button
              className="btn btn-success"
              onClick={() => handleJobStatusUpdate(job.id, "Completed")}
            >
              <RiCheckLine />
              Complete
            </button>
            <button
              className="btn btn-warning"
              onClick={() => handleJobStatusUpdate(job.id, "Pending")}
            >
              <RiPauseLine />
              Pause
            </button>
          </>
        )}
        {job.status === "Completed" && (
          <button className="btn btn-info">
            <RiEyeLine />
            View Details
          </button>
        )}
      </div>
    </div>
  );

  const renderPropertyCard = (property: AgencyProperty) => (
    <div key={property.id} className="property-card">
      <div className="property-header">
        <div className="property-type">
          <RiBuildingLine />
          <span>{property.propertyType}</span>
          <span className="property-id">#{property.id.slice(-6)}</span>
        </div>
        <div className="property-status">
          <span className={`status-badge ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
      </div>

      <div className="property-details">
        <div className="property-address">
          <RiMapPinLine />
          <span>{property.address}</span>
        </div>
        <div className="property-meta">
          <div className="property-created">
            <RiCalendarLine />
            <span>
              Added: {new Date(property.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {property.currentTenant && (
          <div className="property-tenant">
            <RiUserLine />
            <span>Tenant: {property.currentTenant.name}</span>
          </div>
        )}
      </div>

      <div className="property-actions">
        <button className="btn btn-primary">
          <RiEyeLine />
          View Details
        </button>
        <button className="btn btn-secondary">
          <RiBriefcaseLine />
          Manage Jobs
        </button>
      </div>
    </div>
  );

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "active") {
      return job.status === "In Progress" || job.status === "Pending";
    } else if (activeTab === "completed") {
      return job.status === "Completed";
    } else if (activeTab === "overdue") {
      return job.status === "Overdue";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="agency-dashboard">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agency-dashboard">
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

  return (
    <div className="agency-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name || "Agency"}!</h1>
            <p>Your property management and job overview dashboard</p>
            <div className="last-updated">
              <RiInformationLine />
              <span>
                Last updated:{" "}
                {dashboardData
                  ? new Date(dashboardData.lastUpdated).toLocaleString()
                  : "N/A"}
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
            onClick={() => handleStatCardClick("properties")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatCardClick("properties");
              }
            }}
          >
            <div className="stat-icon">
              <RiBuildingLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalProperties}</h3>
              <p>Total Properties</p>
              <div className="stat-trend positive">
                <RiTrendingUpLine />
                <span>
                  +{stats.propertyUtilizationRate.toFixed(1)}% utilization
                </span>
              </div>
            </div>
          </div>

          <div
            className="stat-card active clickable"
            onClick={() => handleStatCardClick("jobs")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatCardClick("jobs");
              }
            }}
          >
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalJobs}</h3>
              <p>Total Jobs</p>
              <div className="stat-trend neutral">
                <RiLoaderLine />
                <span>{stats.activeJobs} active</span>
              </div>
            </div>
          </div>

          <div
            className="stat-card success clickable"
            onClick={() => handleStatCardClick("completedJobs")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatCardClick("completedJobs");
              }
            }}
          >
            <div className="stat-icon">
              <RiCheckLine />
            </div>
            <div className="stat-content">
              <h3>{stats.completedJobs}</h3>
              <p>Completed Jobs</p>
              <div className="stat-trend positive">
                <RiTrendingUpLine />
                <span>+{stats.completionRate.toFixed(1)}% rate</span>
              </div>
            </div>
          </div>

          <div
            className="stat-card technicians clickable"
            onClick={() => handleStatCardClick("propertyManagers")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatCardClick("propertyManagers");
              }
            }}
          >
            <div className="stat-icon">
              <RiUserStarLine />
            </div>
            <div className="stat-content">
              <h3>{stats.totalPropertyManagers}</h3>
              <p>Property Managers</p>
              <div className="stat-trend neutral">
                <RiUserStarLine />
                <span>Available Property Managers</span>
              </div>
            </div>
          </div>

          <div
            className="stat-card scheduled clickable"
            onClick={() => handleStatCardClick("scheduledJobs")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatCardClick("scheduledJobs");
              }
            }}
          >
            <div className="stat-icon">
              <RiCalendarLine />
            </div>
            <div className="stat-content">
              <h3>{stats.scheduledJobs}</h3>
              <p>Scheduled Jobs</p>
              <div className="stat-trend info">
                <RiTimeLine />
                <span>Ready to start</span>
              </div>
            </div>
          </div>

          <div
            className="stat-card warning clickable"
            onClick={() => handleStatCardClick("overdueJobs")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatCardClick("overdueJobs");
              }
            }}
          >
            <div className="stat-icon">
              <RiAlertLine />
            </div>
            <div className="stat-content">
              <h3>{stats.overdueJobs}</h3>
              <p>Overdue Jobs</p>
              <div className="stat-trend negative">
                <RiTrendingDownLine />
                <span>Needs attention</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="charts-section">
        <div className="chart-grid">
          <div className="chart-card large">
            <div className="chart-header">
              <h3>Monthly Job Progress</h3>
              <div className="chart-actions">
                <RiBarChartLine />
                <button className="chart-btn">
                  <RiMoreLine />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyProgressData}>
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
                  dataKey="completed"
                  fill="#10b981"
                  name="Completed"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="scheduled"
                  fill="#3b82f6"
                  name="Scheduled"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card large">
            <div className="chart-header">
              <h3>Job Status Distribution</h3>
              <RiPieChartLine />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={jobStatusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <RiBarChartLine />
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <RiPlayLine />
            Active Jobs (
            {
              jobs.filter(
                (j) => j.status === "In Progress" || j.status === "Pending"
              ).length
            }
            )
          </button>
          <button
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            <RiCheckLine />
            Completed ({jobs.filter((j) => j.status === "Completed").length})
          </button>
          <button
            className={`tab-btn ${activeTab === "overdue" ? "active" : ""}`}
            onClick={() => setActiveTab("overdue")}
          >
            <RiAlertLine />
            Overdue ({jobs.filter((j) => j.status === "Overdue").length})
          </button>
        </div>

        <div className="jobs-container">
          {activeTab === "overview" ? (
            <div className="overview-content">
              <div className="recent-jobs-section">
                <div className="section-header">
                  <h3>Recent Jobs</h3>
                </div>
                <div className="jobs-grid">
                  {jobs.slice(0, 6).map(renderJobCard)}
                </div>
              </div>

              <div className="recent-properties-section">
                <div className="section-header">
                  <h3>Recent Properties</h3>
                </div>
                <div className="properties-grid">
                  {properties.slice(0, 6).map(renderPropertyCard)}
                </div>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <RiBriefcaseLine />
              <h3>No {activeTab} jobs</h3>
              <p>You don't have any {activeTab} jobs at the moment.</p>
            </div>
          ) : (
            <div className="jobs-grid">{filteredJobs.map(renderJobCard)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
