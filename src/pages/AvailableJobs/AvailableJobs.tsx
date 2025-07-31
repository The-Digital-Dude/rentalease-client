import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiMapPinLine,
  RiTimeLine,
  RiCalendarLine,
  RiSearchLine,
  RiEyeLine,
  RiUserAddLine,
  RiFilterLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";
import { useAppSelector, useAppDispatch } from "../../store";
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

const AvailableJobs = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { filteredJobs, loading, error, filters, totalJobs, claimingJobs } =
    useAppSelector((state) => state.availableJobs);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  // Confirmation modal state
  const [showClaimConfirmation, setShowClaimConfirmation] = useState(false);
  const [jobToClaim, setJobToClaim] = useState<AvailableJob | null>(null);

  // Local state for form inputs
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedDate, setSelectedDate] = useState(filters.selectedDate || "");
  const [selectedPriority, setSelectedPriority] = useState(
    filters.selectedPriority || "all"
  );
  const [selectedJobType, setSelectedJobType] = useState(
    filters.selectedJobType || "all"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");

  useEffect(() => {
    // Fetch available jobs on component mount with default filters
    dispatch(
      fetchAvailableJobs({
        status: "Pending",
        limit: 50,
        sortBy: "dueDate",
        sortOrder: "asc",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    // Update filters when local state changes
    dispatch(
      setFilters({
        search: searchTerm,
        selectedDate,
        selectedPriority,
        selectedJobType,
        startDate,
        endDate,
        region: selectedRegion,
        propertyType: selectedPropertyType,
      })
    );
  }, [
    dispatch,
    searchTerm,
    selectedDate,
    selectedPriority,
    selectedJobType,
    startDate,
    endDate,
    selectedRegion,
    selectedPropertyType,
  ]);

  const handleClaimJobClick = (job: AvailableJob) => {
    setJobToClaim(job);
    setShowClaimConfirmation(true);
  };

  const handleConfirmClaim = async () => {
    if (!jobToClaim) return;

    try {
      const result = await dispatch(claimJob(jobToClaim.id)).unwrap();

      // Show success toast
      setToast({
        message: result.message || "Job claimed successfully!",
        type: "success",
        isVisible: true,
      });

      console.log(`Job ${jobToClaim.id} claimed successfully`);
    } catch (error: any) {
      // Show error toast
      setToast({
        message: error || "Failed to claim job",
        type: "error",
        isVisible: true,
      });

      console.error("Failed to claim job:", error);
    } finally {
      setShowClaimConfirmation(false);
      setJobToClaim(null);
    }
  };

  const handleCancelClaim = () => {
    setShowClaimConfirmation(false);
    setJobToClaim(null);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const handleViewJob = (jobId: string) => {
    // Navigate to job details page
    navigate(`/jobs/${jobId}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
    setSelectedPriority("all");
    setSelectedJobType("all");
    setSelectedRegion("all");
    setSelectedPropertyType("all");
    dispatch(clearFilters());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "urgent":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "urgent":
        return "danger";
      case "normal":
        return "success";
      default:
        return "secondary";
    }
  };

  const renderJobCard = (job: AvailableJob) => {
    return (
      <div key={job.id} className="job-card">
        <div className="job-header">
          <div className="job-type">
            <RiBriefcaseLine />
            <span>{job.jobType}</span>
          </div>
          <div className="job-badges">
            <span
              className={`priority-badge ${getPriorityColor(job.priority)}`}
            >
              {job.priority} Priority
            </span>
            {job.urgency && (
              <span className={`urgency-badge ${getUrgencyColor(job.urgency)}`}>
                {job.urgency}
              </span>
            )}
          </div>
        </div>

        <div className="job-details">
          <div className="job-address">
            <RiMapPinLine />
            <div className="address-details">
              <span className="full-address">{job.propertyAddress}</span>
              {job.propertyStreet && (
                <span className="street-address">
                  {job.propertyStreet}, {job.propertySuburb} {job.propertyState}{" "}
                  {job.propertyPostcode}
                </span>
              )}
            </div>
          </div>

          {job.agencyName && (
            <div className="job-agency">
              <span className="agency-badge">{job.agencyName}</span>
            </div>
          )}

          <div className="job-meta">
            <div className="job-property-type">
              <span className="property-type-badge">{job.propertyType}</span>
            </div>
            <div className="job-date">
              <RiCalendarLine />
              <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          {job.notes && (
            <div className="job-notes">
              <p>
                <strong>Notes:</strong> {job.notes}
              </p>
            </div>
          )}
        </div>

        <div className="job-actions">
          <button
            className="btn btn-secondary"
            onClick={() => handleViewJob(job.id)}
          >
            <RiEyeLine />
            View Job
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleClaimJobClick(job)}
            disabled={claimingJobs[job.id] || loading}
          >
            {claimingJobs[job.id] ? (
              <>
                <RiLoader4Line className="spinner" />
                Claiming...
              </>
            ) : (
              <>
                <RiUserAddLine />
                Claim Job
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderJobSummary = (job: AvailableJob) => {
    return (
      <div className="job-summary">
        <div className="summary-header">
          <h4>Job Summary</h4>
        </div>

        <div className="summary-content">
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Job Type:</strong> {job.jobType}
            </div>

            <div className="summary-item">
              <strong>Priority:</strong>
              <span
                className={`priority-badge ${getPriorityColor(job.priority)}`}
              >
                {job.priority}
              </span>
            </div>

            <div className="summary-item full-width">
              <strong>Property Address:</strong>
              <div className="address-summary">
                {job.propertyAddress}
                {job.propertyStreet && (
                  <div className="full-address">
                    {job.propertyStreet}, {job.propertySuburb}{" "}
                    {job.propertyState} {job.propertyPostcode}
                  </div>
                )}
              </div>
            </div>

            <div className="summary-item">
              <strong>Property Type:</strong> {job.propertyType}
            </div>

            <div className="summary-item">
              <strong>Due Date:</strong>{" "}
              {new Date(job.dueDate).toLocaleDateString()}
            </div>

            {job.agencyName && (
              <div className="summary-item">
                <strong>Agency:</strong> {job.agencyName}
              </div>
            )}

            {job.notes && (
              <div className="summary-item full-width">
                <strong>Notes:</strong>
                <div className="notes-summary">{job.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && filteredJobs.length === 0) {
    return (
      <div className="available-jobs">
        <div className="loading-container">
          <RiBriefcaseLine className="loading-spinner" />
          <p>Loading available jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="available-jobs">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={5000}
      />

      {/* Confirmation Modal for Job Claiming */}
      <ConfirmationModal
        isOpen={showClaimConfirmation}
        onClose={handleCancelClaim}
        onConfirm={handleConfirmClaim}
        title="Confirm Job Claim"
        message={
          jobToClaim ? (
            <>
              <p>Are you sure you want to claim this job?</p>
              {renderJobSummary(jobToClaim)}
            </>
          ) : (
            "Are you sure you want to claim this job?"
          )
        }
        confirmText="Yes, Claim Job"
        cancelText="No, Cancel"
        confirmButtonType="primary"
        size="large"
      />

      <div className="page-header">
        <div className="header-content">
          <h1>Available Jobs</h1>
        </div>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{totalJobs}</span>
            <span className="stat-label">Available Jobs</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button
            onClick={() =>
              dispatch(
                fetchAvailableJobs({
                  status: "Pending",
                  limit: 50,
                  sortBy: "dueDate",
                  sortOrder: "asc",
                })
              )
            }
          >
            Try Again
          </button>
        </div>
      )}

      <div className="filters-section">
        <div className="search-filter">
          <div className="search-input">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search jobs by address, type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-controls">
          {/* <div className="date-range-filter">
            <RiCalendarLine />
            <b>From</b>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <b>to</b>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div> */}

          <div className="priority-filter">
            <RiFilterLine />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="job-type-filter">
            <RiFilterLine />
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="all">All Job Types</option>
              <option value="Gas">Gas</option>
              <option value="Electrical">Electrical</option>
              <option value="Smoke">Smoke</option>
              <option value="Repairs">Repairs</option>
              <option value="Pool Safety">Pool Safety</option>
              <option value="Routine Inspection">Routine Inspection</option>
            </select>
          </div>

          {(searchTerm ||
            selectedDate ||
            startDate ||
            endDate ||
            selectedPriority !== "all" ||
            selectedJobType !== "all" ||
            selectedRegion !== "all" ||
            selectedPropertyType !== "all") && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              <RiCloseLine />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="jobs-container">
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <RiBriefcaseLine />
            <h3>No available jobs found</h3>
            <p>
              {searchTerm ||
              selectedDate ||
              selectedPriority !== "all" ||
              selectedJobType !== "all"
                ? "Try adjusting your search criteria"
                : "There are no pending jobs without assigned technicians at the moment"}
            </p>
            {(searchTerm ||
              selectedDate ||
              selectedPriority !== "all" ||
              selectedJobType !== "all") && (
              <button className="btn btn-primary" onClick={handleClearFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="jobs-grid">{filteredJobs.map(renderJobCard)}</div>
        )}
      </div>
    </div>
  );
};

export default AvailableJobs;
