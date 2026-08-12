import { useState, useEffect } from "react";
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
  RiAlertLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { agencyService } from "../../services/agencyService";
import "./OverdueJobs.scss";

interface AttentionJob {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  priority: string;
  description?: string;
  dueDate: string;
  daysLate: number;
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

const daysLate = (dueDate: string): number => {
  const due = new Date(dueDate).toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
  const diffMs = new Date(today).getTime() - new Date(due).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

const OverdueJobs = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const [dueJobs, setDueJobs] = useState<AttentionJob[]>([]);
  const [overdueJobs, setOverdueJobs] = useState<AttentionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });

  const fetchJobs = async (page: number = 1) => {
    try {
      setRefreshing(true);
      setError(null);

      const baseParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sort: sortBy,
      });
      if (searchTerm) baseParams.append("search", searchTerm);
      if (filterPriority) baseParams.append("priority", filterPriority);
      if (user.userType === "agency") baseParams.append("agencyId", user.id || "");

      const dueParams = new URLSearchParams(baseParams);
      dueParams.set("status", "Due");

      const overdueParams = new URLSearchParams(baseParams);
      overdueParams.set("status", "Overdue");

      const [dueResult, overdueResult] = await Promise.all([
        agencyService.getJobs(`?${dueParams.toString()}`),
        agencyService.getJobs(`?${overdueParams.toString()}`),
      ]);

      const mapJob = (job: any): AttentionJob => ({
        ...job,
        daysLate: daysLate(job.dueDate),
      });

      setDueJobs(dueResult.status === "success" ? (dueResult.data.jobs || []).map(mapJob) : []);
      setOverdueJobs(overdueResult.status === "success" ? (overdueResult.data.jobs || []).map(mapJob) : []);

      const totalItems =
        (dueResult.data.pagination?.totalItems || 0) +
        (overdueResult.data.pagination?.totalItems || 0);

      setPagination((p) => ({ ...p, currentPage: page, totalItems }));
    } catch (err: any) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user.id, user.userType, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
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

  const renderJobCard = (job: AttentionJob, variant: "due" | "overdue") => (
    <div key={job.id} className={`job-card job-card--${variant}`}>
      <div className="job-card__header">
        <div className="job-card__type">
          <RiBriefcaseLine />
          <span>{job.jobType}</span>
          <span className="job-id">#{job.job_id}</span>
        </div>
        <div className="job-card__indicators">
          <span className={`status-pill status-pill--${variant}`}>
            {variant === "due" ? "Due" : "Overdue"}
          </span>
          <span className={`days-pill days-pill--${variant}`}>
            <RiTimeLine />
            {job.daysLate === 0
              ? "Due today"
              : job.daysLate === 1
              ? "1 day late"
              : `${job.daysLate} days late`}
          </span>
        </div>
      </div>

      <div className="job-card__body">
        <div className="job-card__address">
          <RiMapPinLine />
          <span>{job.property?.address?.fullAddress || "Address unavailable"}</span>
        </div>

        {job.description && (
          <p className="job-card__description">{job.description}</p>
        )}

        <div className="job-card__meta">
          <span className={`priority-badge ${getPriorityColor(job.priority)}`}>
            {job.priority} Priority
          </span>
          <div className="job-card__due">
            <RiCalendarLine />
            <span>
              Due:{" "}
              {new Date(job.dueDate).toLocaleDateString("en-AU", {
                timeZone: "Australia/Sydney",
              })}
            </span>
          </div>
        </div>

        {job.assignedTo && (
          <div className="job-card__assignee">
            <RiUserLine />
            <span>{job.assignedTo.name}</span>
          </div>
        )}

        {user.userType !== "agency" && job.agency && (
          <div className="job-card__agency">
            <RiBriefcaseLine />
            <span>{job.agency.name}</span>
          </div>
        )}
      </div>

      <div className="job-card__actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/jobs/${job.id}`)}
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
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overdue-jobs">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchJobs()}>
            <RiRefreshLine />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalCount = dueJobs.length + overdueJobs.length;

  return (
    <div className="overdue-jobs">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <RiAlertLine />
            Overdue Jobs
          </h1>
          <p>
            {user.userType === "agency"
              ? "Jobs from your agency requiring attention"
              : "All jobs across the system requiring attention"}
          </p>
          <div className="header-stats">
            <span className="stat stat--due">
              <strong>{dueJobs.length}</strong> Due (1–2 days)
            </span>
            <span className="stat stat--overdue">
              <strong>{overdueJobs.length}</strong> Overdue (3+ days)
            </span>
            <span className="stat stat--total">
              <strong>{totalCount}</strong> total
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => fetchJobs(pagination.currentPage)}
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
              placeholder="Search by job type, property or description..."
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
              onChange={(e) => {
                setFilterPriority(e.target.value);
                fetchJobs(1);
              }}
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
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="jobType">Job Type</option>
            </select>
          </div>
        </div>
      </div>

      <div className="jobs-content">
        {totalCount === 0 ? (
          <div className="empty-state">
            <RiCheckboxCircleLine className="empty-icon empty-icon--success" />
            <h3>All Clear</h3>
            <p>
              {searchTerm || filterPriority
                ? "No jobs match your current filters."
                : "No jobs require attention right now."}
            </p>
            {(searchTerm || filterPriority) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("");
                  fetchJobs(1);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {dueJobs.length > 0 && (
              <section className="jobs-section jobs-section--due">
                <div className="section-heading section-heading--due">
                  <RiTimeLine />
                  <span>Due — Not Yet Completed ({dueJobs.length})</span>
                  <span className="section-sub">Day 1–2 past due date · technician can still complete</span>
                </div>
                <div className="jobs-grid">
                  {dueJobs.map((j) => renderJobCard(j, "due"))}
                </div>
              </section>
            )}

            {overdueJobs.length > 0 && (
              <section className="jobs-section jobs-section--overdue">
                <div className="section-heading section-heading--overdue">
                  <RiAlertLine />
                  <span>Overdue — Immediate Attention Required ({overdueJobs.length})</span>
                  <span className="section-sub">3+ days past due date · requires rescheduling or urgent completion</span>
                </div>
                <div className="jobs-grid">
                  {overdueJobs.map((j) => renderJobCard(j, "overdue"))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OverdueJobs;
