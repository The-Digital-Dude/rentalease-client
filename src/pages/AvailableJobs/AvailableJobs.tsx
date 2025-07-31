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
} from "react-icons/ri";
import { useAppSelector, useAppDispatch } from "../../store";
import {
  fetchAvailableJobs,
  claimJob,
  setFilters,
  clearFilters,
  type AvailableJob,
} from "../../store/availableJobsSlice";
import "./AvailableJobs.scss";

const AvailableJobs = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { filteredJobs, loading, error, filters, totalJobs } = useAppSelector(
    (state) => state.availableJobs
  );

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

  const handleClaimJob = async (jobId: string) => {
    try {
      await dispatch(claimJob(jobId)).unwrap();
      console.log(`Job ${jobId} claimed successfully`);
    } catch (error) {
      console.error("Failed to claim job:", error);
    }
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

          {job.description && (
            <div className="job-description">
              <p>{job.description}</p>
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
            onClick={() => handleClaimJob(job.id)}
            disabled={loading}
          >
            <RiUserAddLine />
            Claim Job
          </button>
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
          <div className="date-filter">
            <RiCalendarLine />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Created Date"
            />
          </div>

          <div className="date-range-filter">
            <RiCalendarLine />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>

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

          <div className="region-filter">
            <RiFilterLine />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>

          <div className="property-type-filter">
            <RiFilterLine />
            <select
              value={selectedPropertyType}
              onChange={(e) => setSelectedPropertyType(e.target.value)}
            >
              <option value="all">All Property Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
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
