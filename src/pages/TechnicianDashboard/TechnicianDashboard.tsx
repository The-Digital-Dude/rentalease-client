import { useState, useEffect } from "react";
import {
  RiBriefcaseLine,
  RiCalendarLine,
  RiMapPinLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiLoaderLine,
  RiAlertLine,
  RiStarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiTimeLine as RiClockLine,
  RiUserStarLine,
  RiSpeedLine,
  RiAwardLine,
  RiBarChartLine,
  RiPieChartLine,
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
} from "recharts";
import { useAppSelector } from "../../store";
import "./TechnicianDashboard.scss";

interface TechnicianJob {
  id: string;
  propertyAddress: string;
  jobType: string;
  priority: string;
  status: string;
  assignedDate: string;
  estimatedDuration: string;
  description: string;
  completedAt?: string;
  actualDuration?: string;
  rating?: number;
  feedback?: string;
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  overdueJobs: number;
  scheduledJobs: number;
  averageCompletionTime: number;
  completionRate: number;
  averageRating: number;
  totalEarnings: number;
  efficiencyScore: number;
}

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

const TechnicianDashboard = () => {
  const { user } = useAppSelector((state) => state.user);
  const [jobs, setJobs] = useState<TechnicianJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [stats, setStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    overdueJobs: 0,
    scheduledJobs: 0,
    averageCompletionTime: 0,
    completionRate: 0,
    averageRating: 0,
    totalEarnings: 0,
    efficiencyScore: 0,
  });

  useEffect(() => {
    // Simulate fetching technician's jobs
    const fetchTechnicianJobs = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockJobs: TechnicianJob[] = [
          {
            id: "1",
            propertyAddress: "123 Main St, Sydney NSW 2000",
            jobType: "Plumbing Repair",
            priority: "High",
            status: "In Progress",
            assignedDate: "2024-01-15",
            estimatedDuration: "2 hours",
            description: "Fix leaking tap in kitchen",
            actualDuration: "1.5 hours",
            rating: 5,
            feedback: "Excellent work, very professional",
          },
          {
            id: "2",
            propertyAddress: "456 Oak Ave, Melbourne VIC 3000",
            jobType: "Electrical Work",
            priority: "Medium",
            status: "Scheduled",
            assignedDate: "2024-01-16",
            estimatedDuration: "3 hours",
            description: "Replace faulty light switch",
          },
          {
            id: "3",
            propertyAddress: "789 Pine Rd, Brisbane QLD 4000",
            jobType: "Gas Safety Check",
            priority: "Urgent",
            status: "Completed",
            assignedDate: "2024-01-14",
            estimatedDuration: "1 hour",
            description: "Annual gas safety inspection",
            completedAt: "2024-01-14T15:30:00Z",
            actualDuration: "1.2 hours",
            rating: 4,
            feedback: "Good service, thorough inspection",
          },
          {
            id: "4",
            propertyAddress: "321 Elm St, Perth WA 6000",
            jobType: "Smoke Alarm Installation",
            priority: "High",
            status: "Overdue",
            assignedDate: "2024-01-10",
            estimatedDuration: "2 hours",
            description: "Install new smoke alarms",
          },
          {
            id: "5",
            propertyAddress: "654 Maple Dr, Adelaide SA 5000",
            jobType: "Pool Safety Inspection",
            priority: "Medium",
            status: "Completed",
            assignedDate: "2024-01-12",
            estimatedDuration: "2.5 hours",
            description: "Pool safety compliance check",
            completedAt: "2024-01-12T14:15:00Z",
            actualDuration: "2.3 hours",
            rating: 5,
            feedback: "Very thorough inspection, highly recommended",
          },
        ];
        setJobs(mockJobs);

        // Calculate statistics
        const totalJobs = mockJobs.length;
        const activeJobs = mockJobs.filter(
          (j) => j.status === "In Progress"
        ).length;
        const completedJobs = mockJobs.filter(
          (j) => j.status === "Completed"
        ).length;
        const overdueJobs = mockJobs.filter(
          (j) => j.status === "Overdue"
        ).length;
        const scheduledJobs = mockJobs.filter(
          (j) => j.status === "Scheduled"
        ).length;

        const completedJobsWithDuration = mockJobs.filter(
          (j) => j.status === "Completed" && j.actualDuration
        );
        const averageCompletionTime =
          completedJobsWithDuration.length > 0
            ? completedJobsWithDuration.reduce((acc, job) => {
                const estimated = parseFloat(
                  job.estimatedDuration.split(" ")[0]
                );
                const actual = parseFloat(job.actualDuration!.split(" ")[0]);
                return acc + (estimated - actual);
              }, 0) / completedJobsWithDuration.length
            : 0;

        const completionRate =
          totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

        const ratedJobs = mockJobs.filter((j) => j.rating);
        const averageRating =
          ratedJobs.length > 0
            ? ratedJobs.reduce((acc, job) => acc + (job.rating || 0), 0) /
              ratedJobs.length
            : 0;

        const totalEarnings = completedJobs * 85; // Mock hourly rate
        const efficiencyScore = Math.min(
          100,
          Math.max(
            0,
            completionRate * 0.4 +
              averageRating * 20 +
              (averageCompletionTime > 0 ? 20 : 0)
          )
        );

        setStats({
          totalJobs,
          activeJobs,
          completedJobs,
          overdueJobs,
          scheduledJobs,
          averageCompletionTime,
          completionRate,
          averageRating,
          totalEarnings,
          efficiencyScore,
        });
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianJobs();
  }, []);

  const handleJobStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      // TODO: Replace with actual API call
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
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
  const jobTypeData = jobs.reduce((acc, job) => {
    acc[job.jobType] = (acc[job.jobType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobTypeChartData: ChartData[] = Object.entries(jobTypeData).map(
    ([type, count]) => ({
      name: type,
      value: count,
    })
  );

  const statusChartData: ChartData[] = [
    { name: "Completed", value: stats.completedJobs, fill: "#10b981" },
    { name: "Active", value: stats.activeJobs, fill: "#f59e0b" },
    { name: "Scheduled", value: stats.scheduledJobs, fill: "#3b82f6" },
    { name: "Overdue", value: stats.overdueJobs, fill: "#ef4444" },
  ];

  const weeklyProgressData = [
    { day: "Mon", completed: 3, scheduled: 2 },
    { day: "Tue", completed: 5, scheduled: 1 },
    { day: "Wed", completed: 2, scheduled: 4 },
    { day: "Thu", completed: 4, scheduled: 3 },
    { day: "Fri", completed: 6, scheduled: 2 },
    { day: "Sat", completed: 1, scheduled: 0 },
    { day: "Sun", completed: 0, scheduled: 1 },
  ];

  const performanceData = [
    { metric: "Completion Rate", value: stats.completionRate, target: 90 },
    { metric: "Avg Rating", value: stats.averageRating * 20, target: 80 },
    { metric: "Efficiency", value: stats.efficiencyScore, target: 85 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const renderJobCard = (job: TechnicianJob) => (
    <div key={job.id} className="job-card">
      <div className="job-header">
        <div className="job-type">
          <RiBriefcaseLine />
          <span>{job.jobType}</span>
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
        {job.status === "Scheduled" && (
          <>
            <button
              className="btn btn-primary"
              onClick={() => handleJobStatusUpdate(job.id, "In Progress")}
            >
              <RiLoaderLine />
              Start Job
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
              className="btn btn-secondary"
              onClick={() => handleJobStatusUpdate(job.id, "Scheduled")}
            >
              <RiCloseLine />
              Pause
            </button>
          </>
        )}
      </div>
    </div>
  );

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "active") {
      return job.status === "In Progress" || job.status === "Scheduled";
    }
    return job.status === "Completed";
  });

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

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || "Technician"}!</h1>
          <p>Your performance overview and job management dashboard</p>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{stats.activeJobs}</h3>
              <p>Active Jobs</p>
              <div className="stat-trend">
                <RiArrowUpLine />
                <span>+12% this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <RiCheckLine />
            </div>
            <div className="stat-content">
              <h3>{stats.completedJobs}</h3>
              <p>Completed Jobs</p>
              <div className="stat-trend">
                <RiArrowUpLine />
                <span>+8% this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <RiAlertLine />
            </div>
            <div className="stat-content">
              <h3>{stats.overdueJobs}</h3>
              <p>Overdue Jobs</p>
              <div className="stat-trend">
                <RiArrowDownLine />
                <span>-5% this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <RiStarLine />
            </div>
            <div className="stat-content">
              <h3>{stats.averageRating.toFixed(1)}</h3>
              <p>Avg Rating</p>
              <div className="stat-trend">
                <RiArrowUpLine />
                <span>+0.3 this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card earnings">
            <div className="stat-icon">
              <RiAwardLine />
            </div>
            <div className="stat-content">
              <h3>${stats.totalEarnings}</h3>
              <p>Total Earnings</p>
              <div className="stat-trend">
                <RiArrowUpLine />
                <span>+15% this week</span>
              </div>
            </div>
          </div>

          <div className="stat-card efficiency">
            <div className="stat-icon">
              <RiSpeedLine />
            </div>
            <div className="stat-content">
              <h3>{stats.efficiencyScore.toFixed(0)}%</h3>
              <p>Efficiency Score</p>
              <div className="stat-trend">
                <RiArrowUpLine />
                <span>+3% this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Job Status Distribution</h3>
              <RiPieChartLine />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusChartData}
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
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Weekly Progress</h3>
              <RiBarChartLine />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Performance Metrics</h3>
              <RiArrowUpLine />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="80%"
                data={performanceData}
              >
                <RadialBar dataKey="value" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Job Types</h3>
              <RiBarChartLine />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={jobTypeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#024974" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active Jobs (
            {
              jobs.filter(
                (j) => j.status === "In Progress" || j.status === "Scheduled"
              ).length
            }
            )
          </button>
          <button
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed ({jobs.filter((j) => j.status === "Completed").length})
          </button>
        </div>

        <div className="jobs-container">
          {filteredJobs.length === 0 ? (
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

export default TechnicianDashboard;
