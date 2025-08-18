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
  RiAlertLine,
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
import "./OverdueJobs.scss";

// Types for job data
interface OverdueJob {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  priority: string;
  description?: string;
  dueDate: string;
  assignedDate?: string;
  estimatedDuration?: string;
  daysOverdue: number;
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

const OverdueJobs = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const [jobs, setJobs] = useState<OverdueJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("daysOverdue");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // Fetch overdue jobs data
  const fetchOverdueJobs = async (page: number = 1) => {
    try {
      setRefreshing(true);
      setError(null);

      // Build query parameters based on user role
      const params = new URLSearchParams({
        status: 'overdue',
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sort: sortBy,
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
        const overdueJobs = result.data.jobs?.map((job: any) => ({
          ...job,
          daysOverdue: calculateDaysOverdue(job.dueDate),
        })) || [];
        
        setJobs(overdueJobs);
        setPagination({
          currentPage: result.data.pagination?.currentPage || 1,
          totalPages: result.data.pagination?.totalPages || 1,
          totalItems: result.data.pagination?.totalItems || 0,
          itemsPerPage: result.data.pagination?.itemsPerPage || 12,
        });
      } else {
        throw new Error(result.message || "Failed to fetch overdue jobs");
      }
    } catch (error: any) {
      console.error("Failed to fetch overdue jobs:", error);
      setError(error.message || "Failed to load overdue jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  useEffect(() => {
    fetchOverdueJobs();
  }, [user.id, user.userType, sortBy]);

  const handleRefresh = () => {
    fetchOverdueJobs(pagination.currentPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOverdueJobs(1);
  };

  const handleFilterChange = (priority: string) => {
    setFilterPriority(priority);
    fetchOverdueJobs(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    fetchOverdueJobs(page);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleUrgentAction = async (jobId: string) => {
    try {
      // Prioritize or escalate the job
      console.log("Taking urgent action on job:", jobId);
      // This would typically call an API endpoint
      handleRefresh();
    } catch (error) {
      console.error("Failed to take urgent action:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "overdue":
        return "danger";
      case "in progress":
        return "warning";
      case "completed":
        return "success";
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

  const getOverdueSeverity = (daysOverdue: number) => {
    if (daysOverdue >= 7) return "critical";
    if (daysOverdue >= 3) return "high";
    if (daysOverdue >= 1) return "medium";
    return "low";
  };

  const renderJobCard = (job: OverdueJob) => (
    <div key={job.id} className={`job-card overdue-${getOverdueSeverity(job.daysOverdue)}`}>
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
          <div className="overdue-indicator">
            <RiAlertLine />
            <span>{job.daysOverdue} days overdue</span>
          </div>
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
          <div className="due-date overdue">
            <RiCalendarLine />
            <span>Was due: {new Date(job.dueDate).toLocaleDateString()}</span>
          </div>
          {job.assignedDate && (
            <div className="assigned-date">
              <RiCalendarLine />
              <span>Assigned: {new Date(job.assignedDate).toLocaleDateString()}</span>
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
          className="btn btn-danger"
          onClick={() => handleUrgentAction(job.id)}
        >
          <RiAlertLine />
          Urgent Action
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
      <div className="overdue-jobs">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading overdue jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overdue-jobs">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Overdue Jobs</h3>
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
    <div className="overdue-jobs">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <RiAlertLine />
            Overdue Jobs
          </h1>
          <p>
            {user.userType === 'agency' 
              ? `Overdue jobs requiring immediate attention from your agency` 
              : `All overdue jobs across the system requiring urgent action`
            }
          </p>
          <div className="header-stats">
            <span className="stat critical">
              <strong>{jobs.filter(j => j.daysOverdue >= 7).length}</strong> critical (7+ days)
            </span>
            <span className="stat high">
              <strong>{jobs.filter(j => j.daysOverdue >= 3 && j.daysOverdue < 7).length}</strong> high (3-6 days)
            </span>
            <span className="stat total">
              <strong>{pagination.totalItems}</strong> total overdue
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
              placeholder="Search overdue jobs by type, property, or description..."
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
          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="daysOverdue">Days Overdue</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="jobType">Job Type</option>
            </select>
          </div>
        </div>
      </div>

      <div className="jobs-content">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <RiAlertLine />
            <h3>No Overdue Jobs</h3>
            <p>
              {searchTerm || filterPriority
                ? "No overdue jobs match your current filters."
                : "Great! There are no overdue jobs at the moment."}
            </p>
            {(searchTerm || filterPriority) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("");
                  fetchOverdueJobs(1);
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
                    ({pagination.totalItems} total overdue jobs)
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

export default OverdueJobs;