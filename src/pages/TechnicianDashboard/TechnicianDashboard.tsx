import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiCalendarLine,
  RiMapPinLine,
  RiCheckLine,
  RiLoaderLine,
  RiAlertLine,
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiRefreshLine,
  RiPlayLine,
  RiInformationLine,
  RiEyeLine,
} from "react-icons/ri";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { useAppSelector } from "../../store";
import { useTheme } from "../../contexts/ThemeContext";
import technicianService from "../../services/technicianService";
import "./TechnicianDashboard.scss";

type QuickStats = {
  totalJobs: number;
  activeJobs: number;
  scheduledJobs: number;
  completedJobs: number;
  overdueJobs: number;
};

type JobStatusDistribution = {
  status: string;
  count: number;
  percentage: number;
};

type WeeklyProgress = {
  day: string;
  completed: number;
  scheduled: number;
};

type RecentJobProperty =
  | string
  | {
      address?:
        | string
        | {
            fullAddress?: string;
            street?: string;
            suburb?: string;
            state?: string;
            postcode?: string;
          };
    };

type RecentJob = {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  dueDate: string;
  updatedAt: string;
  property: RecentJobProperty;
};

type PaymentStats = {
  totalPayments: number;
  pendingPayments: number;
  totalAmount: number;
  pendingAmount: number;
};

type DashboardData = {
  quickStats: QuickStats;
  jobStatusDistribution: JobStatusDistribution[];
  weeklyProgress: WeeklyProgress[];
  recentJobs: RecentJob[];
  paymentStats: PaymentStats;
  lastUpdated: string;
};

type TechnicianTab = "overview" | "active" | "completed" | "overdue";

const TechnicianDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TechnicianTab>("overview");

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const result = await technicianService.getDashboardData();

      if (result.status === "success") {
        setDashboardData(result.data as DashboardData);
      } else {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickStats = dashboardData?.quickStats;
  const paymentStats = dashboardData?.paymentStats;
  const recentJobs = useMemo(
    () => dashboardData?.recentJobs ?? [],
    [dashboardData?.recentJobs]
  );

  const completionRate = useMemo(() => {
    if (!quickStats || quickStats.totalJobs === 0) return 0;
    return (quickStats.completedJobs / quickStats.totalJobs) * 100;
  }, [quickStats]);

  const filteredJobs = useMemo(() => {
    if (activeTab === "overview") return recentJobs;

    return recentJobs.filter((job) => {
      const status = job.status?.toLowerCase();
      if (activeTab === "active") {
        return status === "in progress" || status === "scheduled";
      }
      if (activeTab === "completed") {
        return status === "completed";
      }
      if (activeTab === "overdue") {
        return status === "overdue";
      }
      return true;
    });
  }, [activeTab, recentJobs]);

  const jobStatusChartData = useMemo(
    () =>
      (dashboardData?.jobStatusDistribution ?? []).map((segment) => ({
        name: segment.status,
        value: segment.count,
        fill: getStatusColor(segment.status, isDarkMode),
      })),
    [dashboardData?.jobStatusDistribution, isDarkMode]
  );

  const weeklyProgressData = dashboardData?.weeklyProgress ?? [];

  const handleRefresh = () => fetchDashboardData();

  const handlePrimaryCta = () => navigate("/availableJobs");

  const navigateToPayments = () => navigate("/myPayments");

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
      case "scheduled":
        return "warning";
      case "overdue":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityClass = (priority: string | undefined) => {
    switch ((priority || "medium").toLowerCase()) {
      case "urgent":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
      default:
        return "success";
    }
  };

  const getPropertyAddress = (property: RecentJobProperty): string => {
    if (!property) return "Address not available";
    if (typeof property === "string") return property;

    const rawAddress = property.address;
    if (typeof rawAddress === "string") return rawAddress;
    if (!rawAddress) return "Address not available";

    return (
      rawAddress.fullAddress ||
      [
        rawAddress.street,
        rawAddress.suburb,
        rawAddress.state,
        rawAddress.postcode,
      ]
        .filter(Boolean)
        .join(", ") ||
      "Address not available"
    );
  };

  const renderJobCard = (job: RecentJob) => (
    <div key={job.id} className="job-card">
      <div className="job-header">
        <div className="job-type">
          <RiBriefcaseLine />
          <span>{job.jobType}</span>
          <span className="job-id">#{job.job_id}</span>
        </div>
        <span className={`status-badge ${getStatusClass(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="job-details">
        <div className="job-address">
          <RiMapPinLine />
          <span>{getPropertyAddress(job.property)}</span>
        </div>
        <div className="job-meta">
          <span className={`priority-badge ${getPriorityClass(job.status)}`}>
            {(job.status || "").replace(/(^\w|\s\w)/g, (s) => s.toUpperCase())}
          </span>
          <div className="job-due">
            <RiCalendarLine />
            <span>{new Date(job.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="job-actions">
        <button
          className="btn btn-outline"
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
          <RiEyeLine />
          View Job
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/myJobs")}>
          <RiPlayLine />
          Manage
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="technician-dashboard">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="technician-dashboard">
        <div className="error-container">
          <RiAlertLine className="error-icon" />
          <h3>Error loading technician dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            <RiRefreshLine />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name || "Technician"}!</h1>
            <p>
              Plan your day, monitor performance, and action jobs from here.
            </p>
            <div className="last-updated">
              <RiInformationLine />
              <span>
                Last updated:{" "}
                {dashboardData?.lastUpdated
                  ? new Date(dashboardData.lastUpdated).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handlePrimaryCta}>
              Browse Available Jobs
            </button>
            <button
              className="btn btn-outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine className={refreshing ? "spinning" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{quickStats?.totalJobs ?? 0}</h3>
              <p>Total Jobs</p>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon">
              <RiPlayLine />
            </div>
            <div className="stat-content">
              <h3>{quickStats?.activeJobs ?? 0}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">
              <RiCheckLine />
            </div>
            <div className="stat-content">
              <h3>{quickStats?.completedJobs ?? 0}</h3>
              <p>Completed Jobs</p>
              <span className="stat-subtext">
                {completionRate.toFixed(1)}% completion rate
              </span>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">
              <RiAlertLine />
            </div>
            <div className="stat-content">
              <h3>{quickStats?.overdueJobs ?? 0}</h3>
              <p>Overdue Jobs</p>
            </div>
          </div>
          <div className="stat-card earnings">
            <div className="stat-icon">
              <RiMoneyDollarCircleLine />
            </div>
            <div className="stat-content">
              <h3>${paymentStats?.totalAmount ?? 0}</h3>
              <p>Total Earnings</p>
              <span className="stat-subtext">
                Pending ${paymentStats?.pendingAmount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Job Status Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={jobStatusChartData}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {jobStatusChartData.map((entry, index) => (
                  <Cell key={entry.name + index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${isDarkMode ? "#374151" : "#e2e8f0"}`,
                  borderRadius: 8,
                  boxShadow: isDarkMode
                    ? "0 8px 16px rgba(0, 0, 0, 0.4)"
                    : "0 8px 16px rgba(15, 23, 42, 0.08)",
                  color: isDarkMode ? "#f9fafb" : "#1f2937",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Weekly Progress</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyProgressData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#374151" : "#e2e8f0"}
              />
              <XAxis
                dataKey="day"
                stroke={isDarkMode ? "#9ca3af" : "#94a3b8"}
              />
              <YAxis
                stroke={isDarkMode ? "#9ca3af" : "#94a3b8"}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                  border: `1px solid ${isDarkMode ? "#374151" : "#e2e8f0"}`,
                  borderRadius: 8,
                  boxShadow: isDarkMode
                    ? "0 8px 16px rgba(0, 0, 0, 0.4)"
                    : "0 8px 16px rgba(15, 23, 42, 0.08)",
                  color: isDarkMode ? "#f9fafb" : "#1f2937",
                }}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill={isDarkMode ? "#34d399" : "#10b981"}
              />
              <Bar
                dataKey="scheduled"
                name="Scheduled"
                fill={isDarkMode ? "#60a5fa" : "#3b82f6"}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {paymentStats && (
        <div className="payment-overview">
          <div className="section-header">
            <h2>Payment Overview</h2>
            <button className="btn btn-outline" onClick={navigateToPayments}>
              <RiEyeLine />
              View all payments
            </button>
          </div>
          <div className="payment-cards">
            <div className="payment-card">
              <div className="payment-icon">
                <RiMoneyDollarCircleLine />
              </div>
              <div className="payment-content">
                <h3>${paymentStats.totalAmount}</h3>
                <p>Total earnings</p>
                <span>{paymentStats.totalPayments} payments processed</span>
              </div>
            </div>
            <div className="payment-card pending">
              <div className="payment-icon">
                <RiCalendarLine />
              </div>
              <div className="payment-content">
                <h3>${paymentStats.pendingAmount}</h3>
                <p>Pending payments</p>
                <span>{paymentStats.pendingPayments} awaiting approval</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
            Active
          </button>
          <button
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            <RiCheckLine />
            Completed
          </button>
          <button
            className={`tab-btn ${activeTab === "overdue" ? "active" : ""}`}
            onClick={() => setActiveTab("overdue")}
          >
            <RiAlertLine />
            Overdue
          </button>
        </div>

        <div className="jobs-container">
          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <RiBriefcaseLine />
              <h3>No jobs to show</h3>
              <p>You're all caught up in this category. Nice work!</p>
            </div>
          ) : (
            <div className="jobs-grid">{filteredJobs.map(renderJobCard)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

function getStatusColor(status: string, isDarkMode: boolean = false): string {
  switch (status.toLowerCase()) {
    case "completed":
      return isDarkMode ? "#34d399" : "#10b981";
    case "scheduled":
      return isDarkMode ? "#60a5fa" : "#3b82f6";
    case "in progress":
      return isDarkMode ? "#fbbf24" : "#f59e0b";
    case "overdue":
      return isDarkMode ? "#f87171" : "#ef4444";
    default:
      return isDarkMode ? "#94a3b8" : "#6b7280";
  }
}

export default TechnicianDashboard;
