import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiMapPinLine,
  RiTimeLine,
  RiCalendarLine,
  RiSearchLine,
  RiEyeLine,
  RiUserAddLine,
  RiCloseLine,
  RiLoader4Line,
  RiShieldFlashLine,
  RiFocus3Line,
} from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchAvailableJobs,
  claimJob,
  setFilters,
  clearFilters,
  type AvailableJob,
} from "../../store/availableJobsSlice";
import Toast from "../../components/Toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import "./AvailableJobs.scss";

const PRIORITY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "Urgent", label: "Urgent" },
  { id: "High", label: "High" },
  { id: "Medium", label: "Medium" },
  { id: "Low", label: "Low" },
];

const AvailableJobs: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    jobs,
    filteredJobs,
    loading,
    error,
    filters,
    claimingJobs,
  } = useAppSelector((state) => state.availableJobs);

  const [toast, setToast] = useState({
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    isVisible: false,
  });
  const [showClaimConfirmation, setShowClaimConfirmation] = useState(false);
  const [jobToClaim, setJobToClaim] = useState<AvailableJob | null>(null);

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedPriority, setSelectedPriority] = useState(
    filters.selectedPriority || "all"
  );
  const [selectedJobType, setSelectedJobType] = useState(
    filters.selectedJobType || "all"
  );

  useEffect(() => {
    dispatch(
      fetchAvailableJobs({
        status: "Pending",
        limit: 100,
        sortBy: "dueDate",
        sortOrder: "asc",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFilters({ search: searchTerm }));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    dispatch(setFilters({ selectedPriority }));
  }, [dispatch, selectedPriority]);

  useEffect(() => {
    dispatch(setFilters({ selectedJobType }));
  }, [dispatch, selectedJobType]);

  const jobTypeOptions = useMemo(() => {
    const jobTypes = new Set<string>();
    jobs.forEach((job) => {
      if (job.jobType) {
        jobTypes.add(job.jobType);
      }
    });
    return ["all", ...Array.from(jobTypes)];
  }, [jobs]);

  const stats = useMemo(() => {
    const urgent = filteredJobs.filter(
      (job) => job.priority === "Urgent" || job.urgency === "Urgent"
    ).length;
    const dueToday = filteredJobs.filter((job) => {
      const due = new Date(job.dueDate).toDateString();
      return due === new Date().toDateString();
    }).length;
    const highPriority = filteredJobs.filter(
      (job) => job.priority === "High"
    ).length;
    return {
      total: filteredJobs.length,
      urgent,
      dueToday,
      highPriority,
    };
  }, [filteredJobs]);

  const handleClaimJobClick = (job: AvailableJob) => {
    setJobToClaim(job);
    setShowClaimConfirmation(true);
  };

  const handleConfirmClaim = async () => {
    if (!jobToClaim) return;

    try {
      const result = await dispatch(claimJob(jobToClaim.id)).unwrap();
      setToast({
        message: result.message || "Job claimed successfully!",
        type: "success",
        isVisible: true,
      });
    } catch (err: any) {
      setToast({
        message: err || "Failed to claim job",
        type: "error",
        isVisible: true,
      });
    } finally {
      setShowClaimConfirmation(false);
      setJobToClaim(null);
    }
  };

  const handleCancelClaim = () => {
    setShowClaimConfirmation(false);
    setJobToClaim(null);
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const handleViewJob = (jobId: string) => navigate(`/jobs/${jobId}`);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedPriority("all");
    setSelectedJobType("all");
    dispatch(clearFilters());
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const isDueToday = (date: string) =>
    new Date(date).toDateString() === new Date().toDateString();

  const isOverdue = (date: string) => new Date(date) < new Date();

  const getDueLabel = (date: string) => {
    if (isDueToday(date)) return "Due today";
    if (isOverdue(date)) return "Overdue";
    return `Due ${new Date(date).toLocaleDateString()}`;
  };

  const getPropertySnippet = (job: AvailableJob) => {
    if (job.propertyAddress) return job.propertyAddress;
    return "Address not available";
  };

  return (
    <div className="available-jobs">
      <div className="page-header">
        <div className="header-content">
          <h1>Available Jobs</h1>
          <p>
            Browse and claim new jobs from agencies. Filter by priority, job type,
            and availability to plan your workload.
          </p>
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.urgent}</span>
            <span className="stat-label">Urgent</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.dueToday}</span>
            <span className="stat-label">Due Today</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => dispatch(fetchAvailableJobs())}>Retry</button>
        </div>
      )}

      <div className="filters-section">
        <div className="search-filter">
          <div className="search-input">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search by address, job type, or notes"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="filter-pills">
          <div className="pill-group">
            <span className="pill-label">
              <RiShieldFlashLine /> Priority
            </span>
            <div className="pill-options">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`filter-pill ${
                    selectedPriority === option.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedPriority(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pill-group">
            <span className="pill-label">
              <RiFocus3Line /> Job Type
            </span>
            <div className="pill-options">
              {jobTypeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`filter-pill ${
                    selectedJobType === option ? "active" : ""
                  }`}
                  onClick={() => setSelectedJobType(option)}
                >
                  {option === "all" ? "All" : option}
                </button>
              ))}
            </div>
          </div>

          <button className="clear-filters-btn" onClick={handleClearFilters}>
            <RiCloseLine />
            Clear
          </button>
        </div>
      </div>

      <div className="jobs-container">
        {loading ? (
          <div className="loading-container">
            <RiLoader4Line className="loading-spinner" />
            <p>Loading available jobs…</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <RiBriefcaseLine />
            <h3>No jobs match your filters</h3>
            <p>Try adjusting the filters or check back later for new jobs.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-type">
                    <RiBriefcaseLine />
                    <span>{job.jobType}</span>
                    <span className="job-id">#{job.job_id}</span>
                  </div>
                  <div className="job-badges">
                    <span
                      className={`priority-badge ${getPriorityBadgeClass(
                        job.priority
                      )}`}
                    >
                      {job.priority}
                    </span>
                    <span
                      className={`urgency-badge ${
                        isOverdue(job.dueDate)
                          ? "danger"
                          : isDueToday(job.dueDate)
                          ? "warning"
                          : "secondary"
                      }`}
                    >
                      {getDueLabel(job.dueDate)}
                    </span>
                  </div>
                </div>

                <div className="job-details">
                  <div className="detail-row">
                    <RiMapPinLine />
                    <span>{getPropertySnippet(job)}</span>
                  </div>
                  <div className="detail-row">
                    <RiTimeLine />
                    <span>{job.estimatedDuration || "Duration TBD"}</span>
                  </div>
                  <div className="detail-row">
                    <RiCalendarLine />
                    <span>{new Date(job.dueDate).toLocaleString()}</span>
                  </div>
                  <div className="job-description">
                    <h4>Job Details</h4>
                    <p>{job.description || "No additional details provided."}</p>
                  </div>
                  <div className="property-meta">
                    <span>Property Type: {job.propertyType || "Not specified"}</span>
                    <span>Agency: {job.agencyName || "Unknown"}</span>
                  </div>
                </div>

                <div className="job-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleViewJob(job.id)}
                  >
                    <RiEyeLine />
                    View Details
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleClaimJobClick(job)}
                    disabled={claimingJobs[job.id]}
                  >
                    <RiUserAddLine />
                    {claimingJobs[job.id] ? "Claiming..." : "Claim Job"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <ConfirmationModal
        isOpen={showClaimConfirmation}
        title="Claim Job"
        message="Are you sure you want to claim this job? Once claimed, it will move to your active jobs list."
        confirmLabel="Yes, claim job"
        cancelLabel="Cancel"
        onConfirm={handleConfirmClaim}
        onCancel={handleCancelClaim}
      />
    </div>
  );
};

export default AvailableJobs;
