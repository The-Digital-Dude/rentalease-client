import { useState, useEffect } from "react";
import {
  RiUserLine,
  RiCalendarLine,
  RiCheckLine,
  RiLoaderLine,
  RiBriefcaseLine,
  RiTeamLine,
  RiTimeLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import "./StaffDashboard.scss";

interface StaffJob {
  id: string;
  propertyAddress: string;
  jobType: string;
  priority: string;
  status: string;
  assignedDate: string;
  estimatedDuration: string;
  description: string;
  assignedTechnician?: string;
}

const StaffDashboard = () => {
  const { user } = useAppSelector((state) => state.user);
  const [jobs, setJobs] = useState<StaffJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate fetching staff jobs
    const fetchStaffJobs = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockJobs: StaffJob[] = [
          {
            id: "1",
            propertyAddress: "123 Main St, Sydney NSW 2000",
            jobType: "Plumbing Repair",
            priority: "High",
            status: "Assigned",
            assignedDate: "2024-01-15",
            estimatedDuration: "2 hours",
            description: "Fix leaking tap in kitchen",
            assignedTechnician: "John Smith",
          },
          {
            id: "2",
            propertyAddress: "456 Oak Ave, Melbourne VIC 3000",
            jobType: "Electrical Work",
            priority: "Medium",
            status: "Unassigned",
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

    fetchStaffJobs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
        return "warning";
      case "assigned":
        return "info";
      case "unassigned":
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

  const renderJobCard = (job: StaffJob) => (
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
          <RiTimeLine />
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
        {job.assignedTechnician && (
          <div className="assigned-technician">
            <RiTeamLine />
            <span>Assigned to: {job.assignedTechnician}</span>
          </div>
        )}
      </div>
    </div>
  );

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "overview") {
      return true; // Show all jobs
    } else if (activeTab === "unassigned") {
      return job.status === "Unassigned";
    } else if (activeTab === "assigned") {
      return job.status === "Assigned";
    }
    return job.status === "Completed";
  });

  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || "Staff Member"}!</h1>
          <p>Manage job assignments and track technician progress</p>
        </div>
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{jobs.length}</h3>
              <p>Total Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiUserLine />
            </div>
            <div className="stat-content">
              <h3>{jobs.filter((j) => j.status === "Unassigned").length}</h3>
              <p>Unassigned Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiTeamLine />
            </div>
            <div className="stat-content">
              <h3>{jobs.filter((j) => j.status === "Assigned").length}</h3>
              <p>Assigned Jobs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview ({jobs.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "unassigned" ? "active" : ""}`}
            onClick={() => setActiveTab("unassigned")}
          >
            Unassigned ({jobs.filter((j) => j.status === "Unassigned").length})
          </button>
          <button
            className={`tab-btn ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned ({jobs.filter((j) => j.status === "Assigned").length})
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

export default StaffDashboard;
