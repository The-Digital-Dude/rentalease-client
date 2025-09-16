import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiEyeLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiTimeLine,
  RiCheckLine,
  RiStarLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiMoreLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiAwardLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { agencyService } from "../../services/agencyService";
import "./CompletedJobs.scss";

// Types for job data
interface CompletedJob {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  priority: string;
  description?: string;
  dueDate: string;
  assignedDate?: string;
  completedAt: string;
  estimatedDuration?: string;
  actualDuration?: string;
  completionTime: number; // in hours
  rating?: number;
  feedback?: string;
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

const CompletedJobs = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterRating, setFilterRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("completedAt");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // Safe date formatter to avoid invalid date
  const formatDateSafely = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  // Refs for debouncing and latest search value
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestSearchRef = useRef<string>("");

  // Normalize completed timestamp from various possible fields
  const getCompletedTimestamp = (job: any): string | undefined => {
    return (
      job?.completedAt ||
      job?.completionDate ||
      job?.jobCompletedAt ||
      job?.completed_at ||
      job?.completionDetails?.completedAt ||
      undefined
    );
  };

  // Fetch completed jobs data
  const fetchCompletedJobs = useCallback(
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
          status: "Completed",
          page: page.toString(),
          limit: pagination.itemsPerPage.toString(),
          sort: sortBy,
        });

        const searchToUse =
          searchValue !== undefined ? searchValue : latestSearchRef.current;
        if (searchToUse && searchToUse.trim()) {
          params.append("search", searchToUse.trim());
        }

        if (filterPriority) {
          params.append("priority", filterPriority);
        }

        if (filterRating) {
          params.append("rating", filterRating);
        }

        // Role-based filtering
        if (user.userType === "agency") {
          // Agency users only see their own jobs
          params.append("agencyId", user.id || "");
        }
        // Super users and team members see all jobs (no additional filter needed)

        const result = await agencyService.getJobs(params.toString());

        if (result.status === "success") {
          const completedJobs =
            result.data.jobs?.map((job: any) => {
              const completedTs = getCompletedTimestamp(job);
              return {
                ...job,
                completedAt: completedTs,
                completionTime: calculateCompletionTime(
                  job.assignedDate,
                  completedTs
                ),
              };
            }) || [];

          setJobs(completedJobs);
          setPagination({
            currentPage: result.data.pagination?.currentPage || 1,
            totalPages: result.data.pagination?.totalPages || 1,
            totalItems: result.data.pagination?.totalItems || 0,
            itemsPerPage: result.data.pagination?.itemsPerPage || 12,
          });
        } else {
          throw new Error(result.message || "Failed to fetch completed jobs");
        }
      } catch (error: any) {
        console.error("Failed to fetch completed jobs:", error);
        setError(error.message || "Failed to load completed jobs");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      pagination.itemsPerPage,
      sortBy,
      filterPriority,
      filterRating,
      user.userType,
      user.id,
    ]
  );

  // Debounced search like Scheduled Jobs
  const debouncedSearch = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        fetchCompletedJobs(1, true, value);
      }, 1000);
    },
    [fetchCompletedJobs]
  );

  const calculateCompletionTime = (
    assignedDate?: string,
    completedAt?: string
  ): number => {
    if (!assignedDate || !completedAt) return 0;
    const assigned = new Date(assignedDate);
    const completed = new Date(completedAt);
    const diffTime = completed.getTime() - assigned.getTime();
    const diffHours = Math.round(diffTime / (1000 * 60 * 60));
    return Math.max(0, diffHours);
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, [user.id, user.userType, fetchCompletedJobs]);

  // Trigger fetch when filters/sort change
  useEffect(() => {
    fetchCompletedJobs(1, true);
  }, [filterPriority, filterRating, sortBy, fetchCompletedJobs]);

  const handleRefresh = () => {
    setSearchTerm("");
    setFilterPriority("");
    setFilterRating("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    latestSearchRef.current = "";
    fetchCompletedJobs(1, true, "");
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    latestSearchRef.current = value;
    debouncedSearch(value);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      fetchCompletedJobs(1, true, searchTerm);
    }
  };

  const handleSearchBlur = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    fetchCompletedJobs(1, true, latestSearchRef.current);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "priority") {
      setFilterPriority(value);
    } else if (filterType === "rating") {
      setFilterRating(value);
    }
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    fetchCompletedJobs(page);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const getStatusColor = (status: string) => {
    return "success"; // All jobs are completed
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

  const getCompletionBadge = (
    completionTime: number,
    estimatedDuration?: string
  ) => {
    if (!estimatedDuration) return "completed";

    const estimated = parseFloat(estimatedDuration) || 0;
    if (completionTime <= estimated * 0.8) return "fast";
    if (completionTime <= estimated * 1.2) return "on-time";
    return "delayed";
  };

  const renderRatingStars = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <RiStarLine
            key={star}
            className={star <= rating ? "filled" : "empty"}
          />
        ))}
        <span>{rating}/5</span>
      </div>
    );
  };

  const renderJobCard = (job: CompletedJob) => (
    <div key={job.id} className="job-card completed">
      <div className="job-header">
        <div className="job-type">
          <RiBriefcaseLine />
          <span>{job.jobType}</span>
          <span className="job-id">#{job.job_id}</span>
        </div>
        <div className="job-status">
          <span className={`status-badge ${getStatusColor(job.status)}`}>
            <RiCheckLine />
            Completed
          </span>
          <div
            className={`completion-badge ${getCompletionBadge(
              job.completionTime,
              job.estimatedDuration
            )}`}
          >
            {getCompletionBadge(job.completionTime, job.estimatedDuration) ===
              "fast" && (
              <>
                <RiAwardLine />
                <span>Fast Completion</span>
              </>
            )}
            {getCompletionBadge(job.completionTime, job.estimatedDuration) ===
              "on-time" && (
              <>
                <RiCheckLine />
                <span>On Time</span>
              </>
            )}
            {getCompletionBadge(job.completionTime, job.estimatedDuration) ===
              "delayed" && (
              <>
                <RiTimeLine />
                <span>Delayed</span>
              </>
            )}
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
            <span
              className={`priority-badge ${getPriorityColor(job.priority)}`}
            >
              {job.priority} Priority
            </span>
          </div>
          <div className="job-duration">
            <RiTimeLine />
            <span>
              {job.actualDuration || `${job.completionTime}h`}
              {job.estimatedDuration && ` (est. ${job.estimatedDuration})`}
            </span>
          </div>
        </div>

        <div className="job-dates">
          <div className="completion-date">
            <RiCalendarLine />
            <span>Completed: {formatDateSafely(job.completedAt)}</span>
          </div>
          <div className="due-date">
            <RiCalendarLine />
            <span>Was due: {new Date(job.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {job.assignedTo && (
          <div className="job-assignee">
            <RiUserLine />
            <span>Completed by: {job.assignedTo.name}</span>
          </div>
        )}

        {user.userType !== "agency" && job.agency && (
          <div className="job-agency">
            <RiBriefcaseLine />
            <span>Agency: {job.agency.name}</span>
          </div>
        )}

        {job.rating && (
          <div className="job-rating">
            {renderRatingStars(job.rating)}
            {job.feedback && (
              <div className="job-feedback">
                <p>"{job.feedback}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="job-actions">
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
      <div className="completed-jobs">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading completed jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="completed-jobs">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Completed Jobs</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            <RiRefreshLine />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const averageRating =
    jobs.length > 0
      ? jobs
          .filter((j) => j.rating)
          .reduce((sum, j) => sum + (j.rating || 0), 0) /
        jobs.filter((j) => j.rating).length
      : 0;

  return (
    <div className="completed-jobs">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <RiCheckLine />
            Completed Jobs
          </h1>
          <p>
            {user.userType === "agency"
              ? `Successfully completed jobs from your agency`
              : `All completed jobs across the system`}
          </p>
          <div className="header-stats">
            <span className="stat">
              <strong>{pagination.totalItems}</strong> completed jobs
            </span>
            {averageRating > 0 && (
              <span className="stat">
                <strong>{averageRating.toFixed(1)}</strong> avg rating
              </span>
            )}
            <span className="stat">
              <strong>
                {
                  jobs.filter(
                    (j) =>
                      getCompletionBadge(
                        j.completionTime,
                        j.estimatedDuration
                      ) === "fast"
                  ).length
                }
              </strong>{" "}
              fast completions
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
          searchTerm || filterPriority || filterRating
            ? "has-active-filters"
            : ""
        }`}
      >
        <div className="search-form">
          <div className="search-input">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search completed jobs by job ID, property address, job type, or description..."
              value={searchTerm}
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
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Rating:</label>
              <select
                value={filterRating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="completedAt">Completion Date</option>
                <option value="rating">Rating</option>
                <option value="priority">Priority</option>
                <option value="completionTime">Completion Time</option>
                <option value="jobType">Job Type</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="jobs-content">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <RiCheckLine />
            <h3>No Completed Jobs</h3>
            <p>
              {searchTerm || filterPriority || filterRating
                ? "No completed jobs match your current filters."
                : "No jobs have been completed yet."}
            </p>
            {(searchTerm || filterPriority || filterRating) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("");
                  setFilterRating("");
                  fetchCompletedJobs(1);
                }}
              >
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
                  <span>({pagination.totalItems} total completed jobs)</span>
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

export default CompletedJobs;
