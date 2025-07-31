import React, { useState, useEffect } from "react";
import {
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiTimeLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiLoaderLine,
} from "react-icons/ri";
import type { Job } from "../../services";
import Pagination from "../Pagination/Pagination";
import "./TechnicianJobTable.scss";

interface TechnicianJobTableProps {
  title: string;
  jobs: Job[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics?: {
    statusCounts: Record<string, number>;
    totalJobs: number;
  };
  onPageChange: (page: number) => void;
  onJobClick?: (job: Job) => void;
  filters?: {
    jobType: string;
    status: string;
    priority: string;
    search: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange?: (filters: any) => void;
}

const TechnicianJobTable: React.FC<TechnicianJobTableProps> = ({
  title,
  jobs,
  loading,
  error,
  pagination,
  statistics,
  onPageChange,
  onJobClick,
  filters,
  onFilterChange,
}) => {
  const [localFilters, setLocalFilters] = useState({
    jobType: filters?.jobType || "",
    status: filters?.status || "",
    priority: filters?.priority || "",
    search: filters?.search || "",
    startDate: filters?.startDate || "",
    endDate: filters?.endDate || "",
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Scheduled":
        return "status-scheduled";
      case "Completed":
        return "status-completed";
      case "Overdue":
        return "status-overdue";
      default:
        return "status-default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "priority-low";
      case "Medium":
        return "priority-medium";
      case "High":
        return "priority-high";
      case "Urgent":
        return "priority-urgent";
      default:
        return "priority-default";
    }
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case "Gas":
        return "🔥";
      case "Electrical":
        return "⚡";
      case "Smoke":
        return "🚨";
      case "Repairs":
        return "🔧";
      case "Pool Safety":
        return "🏊";
      case "Routine Inspection":
        return "📋";
      default:
        return "📋";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="technician-job-table">
        <div className="table-header">
          <h2>{title}</h2>
        </div>
        <div className="loading-container">
          <RiLoaderLine className="loading-icon" />
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="technician-job-table">
        <div className="table-header">
          <h2>{title}</h2>
        </div>
        <div className="error-container">
          <RiAlertLine className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-job-table">
      <div className="table-header">
        <div className="header-left">
          <h2>{title}</h2>
          {statistics && (
            <div className="statistics">
              <span className="total-jobs">Total: {statistics.totalJobs}</span>
              {Object.entries(statistics.statusCounts).map(
                ([status, count]) => (
                  <span
                    key={status}
                    className={`status-count ${getStatusColor(status)}`}
                  >
                    {status}: {count}
                  </span>
                )
              )}
            </div>
          )}
        </div>
        <div className="header-right">
          <button
            className={`filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <RiFilterLine />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <RiSearchLine />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <div className="filter-group">
              <label>Job Type</label>
              <select
                value={localFilters.jobType}
                onChange={(e) => handleFilterChange("jobType", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Gas">Gas</option>
                <option value="Electrical">Electrical</option>
                <option value="Smoke">Smoke</option>
                <option value="Repairs">Repairs</option>
                <option value="Pool Safety">Pool Safety</option>
                <option value="Routine Inspection">Routine Inspection</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select
                value={localFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Priority</label>
              <select
                value={localFilters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Type</th>
              <th>Property</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <div className="empty-content">
                    <RiBriefcaseLine className="empty-icon" />
                    <p>No jobs found</p>
                  </div>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className={isOverdue(job.dueDate) ? "overdue" : ""}
                >
                  <td className="job-id">
                    <span className="job-id-text">{job.job_id}</span>
                  </td>
                  <td className="job-type">
                    <span className="job-type-icon">
                      {getJobTypeIcon(job.jobType)}
                    </span>
                    <span className="job-type-text">{job.jobType}</span>
                  </td>
                  <td className="property">
                    <div className="property-info">
                      <RiMapPinLine className="property-icon" />
                      <span className="property-address">
                        {typeof job.property === "string"
                          ? job.property
                          : job.property.fullAddress}
                      </span>
                    </div>
                  </td>
                  <td className="due-date">
                    <div className="due-date-info">
                      <RiTimeLine className="due-date-icon" />
                      <span
                        className={`due-date-text ${
                          isOverdue(job.dueDate) ? "overdue" : ""
                        }`}
                      >
                        {formatDate(job.dueDate)}
                      </span>
                      {isOverdue(job.dueDate) && (
                        <span className="overdue-badge">Overdue</span>
                      )}
                    </div>
                  </td>
                  <td className="status">
                    <span
                      className={`status-badge ${getStatusColor(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="priority">
                    <span
                      className={`priority-badge ${getPriorityColor(
                        job.priority
                      )}`}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => onJobClick?.(job)}
                      title="View Details"
                    >
                      <RiEyeLine />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalItems}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TechnicianJobTable;
