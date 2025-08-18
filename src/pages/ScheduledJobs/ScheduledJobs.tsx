import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiEyeLine,
  RiEditLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiTimeLine,
  RiPlayLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiMoreLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { agencyService } from "../../services/agencyService";
import "./ScheduledJobs.scss";

// Types for job data
interface ScheduledJob {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  priority: string;
  description?: string;
  dueDate: string;
  assignedDate?: string;
  estimatedDuration?: string;
  property: {
    _id: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
    propertyType: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  agency?: {
    _id: string;
    name: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const ScheduledJobs = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // Fetch scheduled jobs data
  const fetchScheduledJobs = async (page: number = 1) => {
    try {
      setRefreshing(true);
      setError(null);

      // Build query parameters based on user role
      const params = new URLSearchParams({
        status: 'scheduled',
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (filterPriority) {
        params.append('priority', filterPriority);
      }

      // Role-based filtering
      if (user.userType === 'agency') {
        // Agency users only see their own jobs
        params.append('agencyId', user.id || '');
      }
      // Super users and team members see all jobs (no additional filter needed)

      const result = await agencyService.getJobs(`?${params.toString()}`);

      if (result.status === "success") {
        setJobs(result.data.jobs || []);
        setPagination({
          currentPage: result.data.pagination?.currentPage || 1,
          totalPages: result.data.pagination?.totalPages || 1,
          totalItems: result.data.pagination?.totalItems || 0,
          itemsPerPage: result.data.pagination?.itemsPerPage || 12,
        });
      } else {
        throw new Error(result.message || "Failed to fetch scheduled jobs");
      }
    } catch (error: any) {
      console.error("Failed to fetch scheduled jobs:", error);
      setError(error.message || "Failed to load scheduled jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduledJobs();
  }, [user.id, user.userType]);

  const handleRefresh = () => {
    fetchScheduledJobs(pagination.currentPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScheduledJobs(1);
  };

  const handleFilterChange = (priority: string) => {
    setFilterPriority(priority);
    fetchScheduledJobs(1);
  };

  const handlePageChange = (page: number) => {
    fetchScheduledJobs(page);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleStartJob = async (jobId: string) => {
    try {
      // Update job status to "In Progress"
      // This would typically call an API endpoint
      console.log("Starting job:", jobId);
      // Refresh the list after update
      handleRefresh();
    } catch (error) {
      console.error("Failed to start job:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "info";
      case "in progress":
        return "warning";
      case "completed":
        return "success";
      case "overdue":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
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

  const renderJobCard = (job: ScheduledJob) => (
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
        <div className="job-property">
          <RiMapPinLine />
          <span>{job.property.address.fullAddress}</span>
        </div>
        
        {job.description && (
          <div className="job-description">
            <p>{job.description}</p>
          </div>
        )}

        <div className="job-meta">
          <div className="job-priority">
            <span className={`priority-badge ${getPriorityColor(job.priority)}`}>
              {job.priority} Priority
            </span>
          </div>
          {job.estimatedDuration && (
            <div className="job-duration">
              <RiTimeLine />
              <span>{job.estimatedDuration}</span>
            </div>
          )}
        </div>

        <div className="job-dates">
          <div className="due-date">
            <RiCalendarLine />
            <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
          </div>
          {job.assignedDate && (
            <div className="assigned-date">
              <RiCalendarLine />
              <span>Scheduled: {new Date(job.assignedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {job.assignedTo && (
          <div className="job-assignee">
            <RiUserLine />
            <span>Assigned to: {job.assignedTo.name}</span>
          </div>
        )}

        {user.userType !== 'agency' && job.agency && (
          <div className="job-agency">
            <RiBriefcaseLine />
            <span>Agency: {job.agency.name}</span>
          </div>
        )}
      </div>

      <div className="job-actions">
        <button
          className="btn btn-primary"
          onClick={() => handleStartJob(job.id)}
        >
          <RiPlayLine />
          Start Job
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleViewJob(job.id)}
        >
          <RiEyeLine />
          View Details
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="scheduled-jobs">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading scheduled jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scheduled-jobs">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Scheduled Jobs</h3>
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
    <div className="scheduled-jobs">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <RiCalendarLine />
            Scheduled Jobs
          </h1>
          <p>
            {user.userType === 'agency' 
              ? `Jobs scheduled for your agency` 
              : `All scheduled jobs across the system`
            }
          </p>
          <div className="header-stats">
            <span className="stat">
              <strong>{pagination.totalItems}</strong> scheduled jobs
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

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search jobs by type, property, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-options">
          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="jobs-content">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <RiCalendarLine />
            <h3>No Scheduled Jobs</h3>
            <p>
              {searchTerm || filterPriority
                ? "No scheduled jobs match your current filters."
                : "There are no scheduled jobs at the moment."}
            </p>
            {(searchTerm || filterPriority) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("");
                  fetchScheduledJobs(1);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="jobs-grid">
              {jobs.map(renderJobCard)}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <RiArrowLeftLine />
                  Previous
                </button>
                
                <div className="page-info">
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <span>
                    ({pagination.totalItems} total jobs)
                  </span>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                  <RiArrowRightLine />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduledJobs;