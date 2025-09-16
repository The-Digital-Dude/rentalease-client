import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiSearchLine,
  RiRefreshLine,
  RiEyeLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiTimeLine,
  RiPlayLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiCloseLine,
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
  const [searchInput, setSearchInput] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterJobType, setFilterJobType] = useState<string>("");
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // Refs for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestSearchRef = useRef<string>("");

  // Fetch scheduled jobs data
  const fetchScheduledJobs = useCallback(
    async (
      page: number = 1,
      resetPagination: boolean = false,
      searchValue?: string
    ) => {
      try {
        if (resetPagination) {
          setRefreshing(true);
        } else {
          setLoading(page === 1);
        }
        setError(null);

        // Build query parameters based on user role
        const params = new URLSearchParams({
          status: "Scheduled",
          page: page.toString(),
          limit: pagination.itemsPerPage.toString(),
        });

        // Use provided value or latest typed (ref) to avoid immediate fetch on keystroke
        const searchToUse =
          searchValue !== undefined ? searchValue : latestSearchRef.current;
        if (searchToUse.trim()) {
          params.append("search", searchToUse.trim());
          console.log("🔍 Searching for:", searchToUse.trim());
        }

        if (filterPriority) {
          params.append("priority", filterPriority);
        }

        if (filterJobType) {
          params.append("jobType", filterJobType);
        }

        if (filterDateRange.startDate) {
          params.append("startDate", filterDateRange.startDate);
        }

        if (filterDateRange.endDate) {
          params.append("endDate", filterDateRange.endDate);
        }

        // Role-based filtering is handled by the backend based on authentication
        // Super users see all jobs, agencies see only their own jobs

        const result = await agencyService.getJobs(params.toString());
        console.log("📊 API Response:", result);

        if (result.status === "success") {
          setJobs(result.data.jobs || []);
          setPagination({
            currentPage: result.data.pagination?.currentPage || 1,
            totalPages: result.data.pagination?.totalPages || 1,
            totalItems: result.data.pagination?.totalItems || 0,
            itemsPerPage: result.data.pagination?.itemsPerPage || 12,
          });
          console.log("✅ Jobs loaded:", result.data.jobs?.length || 0, "jobs");
        } else {
          throw new Error(result.message || "Failed to fetch scheduled jobs");
        }
      } catch (error: unknown) {
        console.error("Failed to fetch scheduled jobs:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load scheduled jobs";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      pagination.itemsPerPage,
      filterPriority,
      filterJobType,
      filterDateRange.startDate,
      filterDateRange.endDate,
    ]
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchValue: string) => {
      console.log("⏰ Debounced search triggered for:", searchValue);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        console.log("🚀 Executing search after 1000ms delay for:", searchValue);
        fetchScheduledJobs(1, true, searchValue);
      }, 1000); // 1000ms delay
    },
    [fetchScheduledJobs]
  );

  useEffect(() => {
    fetchScheduledJobs();
  }, [user.id, user.userType, fetchScheduledJobs]);

  // Effect to trigger search when filters change
  useEffect(() => {
    fetchScheduledJobs(1, true);
  }, [
    filterPriority,
    filterJobType,
    filterDateRange.startDate,
    filterDateRange.endDate,
    fetchScheduledJobs,
  ]);

  const handleRefresh = () => {
    setSearchInput("");
    setFilterPriority("");
    setFilterJobType("");
    setFilterDateRange({ startDate: "", endDate: "" });
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    fetchScheduledJobs(1, true);
  };

  const handleSearchInputChange = (value: string) => {
    console.log("📝 Search input changed to:", value);
    setSearchInput(value);
    latestSearchRef.current = value;
    debouncedSearch(value);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      fetchScheduledJobs(1, true, searchInput);
    }
  };

  const handleSearchBlur = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    fetchScheduledJobs(1, true, latestSearchRef.current);
  };

  const handlePriorityFilterChange = (priority: string) => {
    setFilterPriority(priority);
  };

  const handleJobTypeFilterChange = (jobType: string) => {
    setFilterJobType(jobType);
  };

  const handleDateRangeChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setFilterDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setFilterPriority("");
    setFilterJobType("");
    setFilterDateRange({ startDate: "", endDate: "" });
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    fetchScheduledJobs(1, true, ""); // Clear search and fetch
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
            <span
              className={`priority-badge ${getPriorityColor(job.priority)}`}
            >
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
              <span>
                Scheduled: {new Date(job.assignedDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {job.assignedTo && (
          <div className="job-assignee">
            <RiUserLine />
            <span>Assigned to: {job.assignedTo.name}</span>
          </div>
        )}

        {user.userType !== "agency" && job.agency && (
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
            {user.userType === "agency"
              ? `Jobs scheduled for your agency`
              : `All scheduled jobs across the system`}
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

      <div
        className={`filters-section ${
          searchInput ||
          filterPriority ||
          filterJobType ||
          filterDateRange.startDate ||
          filterDateRange.endDate
            ? "has-active-filters"
            : ""
        }`}
      >
        <div className="search-form">
          <div className="search-input">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search by job ID, property address, job type, or description... (search as you type)"
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleSearchBlur}
            />
          </div>
        </div>

        <div className="filter-options">
          <div className="filter-row">
            <div className="filter-group">
              <label>Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => handlePriorityFilterChange(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Job Type:</label>
              <select
                value={filterJobType}
                onChange={(e) => handleJobTypeFilterChange(e.target.value)}
              >
                <option value="">All Job Types</option>
                <option value="Gas">Gas</option>
                <option value="Electrical">Electrical</option>
                <option value="Smoke">Smoke</option>
                <option value="Repairs">Repairs</option>
                <option value="Pool Safety">Pool Safety</option>
                <option value="Routine Inspection">Routine Inspection</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Due Date From:</label>
              <input
                type="date"
                value={filterDateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange("startDate", e.target.value)
                }
              />
            </div>

            <div className="filter-group">
              <label>Due Date To:</label>
              <input
                type="date"
                value={filterDateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange("endDate", e.target.value)
                }
              />
            </div>

            {(searchInput ||
              filterPriority ||
              filterJobType ||
              filterDateRange.startDate ||
              filterDateRange.endDate) && (
              <div className="filter-group">
                <button className="btn btn-secondary" onClick={clearAllFilters}>
                  <RiCloseLine />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="jobs-content">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <RiCalendarLine />
            <h3>No Scheduled Jobs</h3>
            <p>
              {searchInput ||
              filterPriority ||
              filterJobType ||
              filterDateRange.startDate ||
              filterDateRange.endDate
                ? "No scheduled jobs match your current filters."
                : "There are no scheduled jobs at the moment."}
            </p>
            {(searchInput ||
              filterPriority ||
              filterJobType ||
              filterDateRange.startDate ||
              filterDateRange.endDate) && (
              <button className="btn btn-secondary" onClick={clearAllFilters}>
                <RiCloseLine />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="jobs-grid">{jobs.map(renderJobCard)}</div>

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
                  <span>({pagination.totalItems} total jobs)</span>
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
