import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  RiAlertLine,
  RiCheckLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiLoaderLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { agencyService } from "../../services/agencyService";
import Button from "../../components/Button/Button";
import TechnicianInfoModal from "../../components/TechnicianInfoModal";
import "./AgencyJobs.scss";

// Types for job data
interface AgencyJob {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  priority: string;
  description?: string;
  dueDate: string;
  assignedDate?: string;
  completedAt?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  property: {
    _id: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
  };
  assignedTechnician?: {
    id: string;
    name: string;
    tradeType: string;
  } | null;
  cost?: {
    materialCost: number;
    laborCost: number;
    totalCost: number;
  };
  totalCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  reportFile?: any;
  hasInvoice?: boolean;
  invoice?: any;
  isOverdue?: boolean;
}

interface JobFilters {
  status: string;
  jobType: string;
  priority: string;
  search: string;
  startDate: string;
  endDate: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface JobStatistics {
  statusCounts: {
    [key: string]: number;
  };
  totalJobs: number;
}

const AgencyJobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.user);
  const [jobs, setJobs] = useState<AgencyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statistics, setStatistics] = useState<JobStatistics>({
    statusCounts: {},
    totalJobs: 0,
  });
  const [filters, setFilters] = useState<JobFilters>({
    status: "",
    jobType: "",
    priority: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("completedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);

  // Fetch jobs with filters and pagination
  const fetchJobs = async (page = 1, newFilters?: Partial<JobFilters>) => {
    try {
      setRefreshing(true);
      setError(null);

      const currentFilters = newFilters
        ? { ...filters, ...newFilters }
        : filters;

      // Build query parameters
      const effectiveSortBy =
        currentFilters.status.toLowerCase() === "completed" ? "completedAt" : sortBy;
      const effectiveSortOrder =
        currentFilters.status.toLowerCase() === "completed" ? "desc" : sortOrder;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sortBy: effectiveSortBy,
        sortOrder: effectiveSortOrder,
      });

      // Add filters to query params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const result = await agencyService.getJobs(params.toString());

      if (result.status === "success") {
        setJobs(result.data.jobs);
        setPagination(result.data.pagination);
        setStatistics(result.data.statistics);

        // Update filters if new filters were applied
        if (newFilters) {
          setFilters((prev) => ({ ...prev, ...newFilters }));
        }
      } else {
        throw new Error(result.message || "Failed to fetch jobs");
      }
    } catch (error: any) {
      console.error("Failed to fetch jobs:", error);
      setError(error.message || "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle navigation state filters (from dashboard stats)
  useEffect(() => {
    const stateFilter = location.state?.filter;
    if (stateFilter) {
      const filterMap = {
        'completed': { status: 'Completed' },
        'overdue': { status: 'Overdue' }
      };
      
      const newFilter = filterMap[stateFilter as keyof typeof filterMap];
      if (newFilter) {
        setFilters(prev => ({ ...prev, ...newFilter }));
        // Clear the state to prevent re-applying on next visit
        window.history.replaceState({}, document.title, location.pathname);
        // Fetch jobs with the new filter
        fetchJobs(1, newFilter);
      }
    }
  }, [location.state]);

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTechnicianClick = (technicianId: string) => {
    setSelectedTechnicianId(technicianId);
    setShowTechnicianModal(true);
  };

  const handleCloseTechnicianModal = () => {
    setShowTechnicianModal(false);
    setSelectedTechnicianId(null);
  };

  const handleQuickSearch = (value: string) => {
    handleFilterChange('search', value);
    // Auto-trigger search for immediate feedback
    if (value.trim() !== '') {
      const newFilters = { ...filters, search: value };
      fetchJobs(1, newFilters);
    }
  };

  const handleFilterSubmit = () => {
    fetchJobs(1, filters);
  };

  const handleFilterReset = () => {
    const resetFilters = {
      status: "",
      jobType: "",
      priority: "",
      search: "",
      startDate: "",
      endDate: "",
    };
    setFilters(resetFilters);
    fetchJobs(1, resetFilters);
  };

  const handlePageChange = (page: number) => {
    fetchJobs(page);
  };

  const handleSort = (field: string) => {
    const newSortOrder =
      sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newSortOrder);
    fetchJobs(1);
  };

  const handleRefresh = () => {
    fetchJobs(pagination.currentPage);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="agency-jobs">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agency-jobs">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={handleRefresh}>
            <RiRefreshLine />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="agency-jobs">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>{user?.userType === 'property_manager' ? 'Property Jobs' : 'Agency Jobs'}</h1>
            <p>{user?.userType === 'property_manager' ? 'Manage and track jobs for your assigned properties' : 'Manage and track all your property maintenance jobs'}</p>
          </div>
          <div className="header-actions">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine className={refreshing ? "spinning" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-overview">
          <div className="stat-card total">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{statistics.totalJobs}</h3>
              <p>Total Jobs</p>
            </div>
          </div>

          {Object.entries(statistics.statusCounts).map(([status, count]) => (
            <div key={status} className={`stat-card ${getStatusColor(status)}`}>
              <div className="stat-icon">
                {status === "completed" && <RiCheckLine />}
                {status === "pending" && <RiTimeLine />}
                {status === "in progress" && <RiLoaderLine />}
                {status === "overdue" && <RiAlertLine />}
                {status === "scheduled" && <RiCalendarLine />}
                {![
                  "completed",
                  "pending",
                  "in progress",
                  "overdue",
                  "scheduled",
                ].includes(status) && <RiBriefcaseLine />}
              </div>
              <div className="stat-content">
                <h3>{count}</h3>
                <p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-header">
          <div className="search-box">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search by Job ID, status, property address, technician name, or description..."
              value={filters.search}
              onChange={(e) => handleQuickSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleFilterSubmit()}
            />
          </div>
          <div className="filter-actions">
            <Button
              variant="outline"
              className={showFilters ? "active" : ""}
              onClick={() => setShowFilters(!showFilters)}
            >
              <RiFilterLine />
              Filters
            </Button>
            <Button variant="outline" onClick={handleFilterReset}>
              Clear
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) =>
                    handleFilterChange("jobType", e.target.value)
                  }
                >
                  <option value="">All Types</option>
                  <option value="smoke">Smoke Alarm</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="hvac">HVAC</option>
                  <option value="general">General Maintenance</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div className="filter-group">
                <Button variant="primary" onClick={handleFilterSubmit}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jobs Table */}
      <div className="jobs-table-container">
        <div className="table-header">
          <div className="table-info">
            <span>
              Showing {jobs.length} of {pagination.totalItems} jobs
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("job_id")}>
                  Job ID
                  {sortBy === "job_id" && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("jobType")}>
                  Type
                  {sortBy === "jobType" && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th>Property</th>
                <th onClick={() => handleSort("status")}>
                  Status
                  {sortBy === "status" && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("priority")}>
                  Priority
                  {sortBy === "priority" && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() =>
                    handleSort(filters.status.toLowerCase() === "completed"
                      ? "completedAt"
                      : "dueDate")
                  }
                >
                  {filters.status.toLowerCase() === "completed"
                    ? "Completed Date"
                    : "Due Date"}
                  {(sortBy === "dueDate" || sortBy === "completedAt") && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th>Technician</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="job-id">
                      <span className="id-text">#{job.job_id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="job-type">
                      <RiBriefcaseLine />
                      <span>{job.jobType}</span>
                    </div>
                    {job.description && (
                      <div className="job-description">
                        <span>{job.description}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="property-info">
                      <div className="property-address">
                        <RiMapPinLine />
                        <span>{job.property?.address?.street || 'Address not available'}</span>
                      </div>
                      <div className="property-type">
                        {job.property?.address?.state || ''}{" "}
                        {job.property?.address?.postcode || ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusColor(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`priority-badge ${getPriorityColor(
                        job.priority
                      )}`}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td>
                    <div className="due-date">
                      <RiCalendarLine />
                      <span>
                        {formatDate(
                          job.status.toLowerCase() === "completed" && job.completedAt
                            ? job.completedAt
                            : job.dueDate
                        )}
                      </span>
                    </div>
                  </td>
                  <td>
                    {job.assignedTechnician && job.assignedTechnician.name ? (
                      <div 
                        className="technician-info clickable"
                        onClick={() => handleTechnicianClick(job.assignedTechnician!.id)}
                        title="Click to view technician details"
                      >
                        <RiUserLine />
                        <span>{job.assignedTechnician.name}</span>
                        <div className="technician-trade">
                          {job.assignedTechnician.tradeType}
                        </div>
                      </div>
                    ) : (
                      <span className="no-technician">Unassigned</span>
                    )}
                  </td>

                  <td>
                    <div className="actions">
                      <Button
                        variant="outline"
                        size="sm"
                        iconOnly
                        className="action-btn view"
                        title="View Details"
                        aria-label="View Details"
                        onClick={() => handleViewJob(job.id)}
                      >
                        <RiEyeLine />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <span>
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} results
              </span>
            </div>
            <div className="pagination-controls">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <RiArrowLeftLine />
                Previous
              </Button>

              <div className="page-numbers">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${
                          pageNum === pagination.currentPage ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <RiArrowRightLine />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Technician Info Modal */}
      {selectedTechnicianId && (
        <TechnicianInfoModal
          isOpen={showTechnicianModal}
          onClose={handleCloseTechnicianModal}
          technicianId={selectedTechnicianId}
        />
      )}
    </div>
  );
};

export default AgencyJobs;
