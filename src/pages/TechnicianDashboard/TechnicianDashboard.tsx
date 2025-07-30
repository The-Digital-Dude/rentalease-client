import { useState, useEffect } from "react";
import {
  RiBriefcaseLine,
  RiCalendarLine,
  RiMapPinLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiLoaderLine,
} from "react-icons/ri";
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
}

const TechnicianDashboard = () => {
  const { user } = useAppSelector((state) => state.user);
  const [jobs, setJobs] = useState<TechnicianJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

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
        ];
        setJobs(mockJobs);
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
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || "Technician"}!</h1>
          <p>Manage your assigned jobs and update work status</p>
        </div>
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{jobs.filter((j) => j.status === "In Progress").length}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiCalendarLine />
            </div>
            <div className="stat-content">
              <h3>{jobs.filter((j) => j.status === "Scheduled").length}</h3>
              <p>Scheduled Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiCheckLine />
            </div>
            <div className="stat-content">
              <h3>{jobs.filter((j) => j.status === "Completed").length}</h3>
              <p>Completed Today</p>
            </div>
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
