import React from "react";
import {
  RiSearchLine,
  RiCalendarLine,
  RiUserLine,
  RiMoreLine,
} from "react-icons/ri";
import "./JobsOverview.scss";

interface Job {
  id: string;
  job_id: string;
  propertyAddress: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
  dueDate: string;
  assignedTechnician: string;
  status: "Pending" | "Scheduled" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
  createdDate: string;
}

interface JobsOverviewProps {
  filteredJobs: Job[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  isOverdue: (dueDate: string) => boolean;
  handleEditJob: (job: Job) => void;
  handleUpdateJobStatus: (jobId: string, newStatus: Job["status"]) => void;
  showActionMenu: string | null;
  setShowActionMenu: (jobId: string | null) => void;
}

const JobsOverview: React.FC<JobsOverviewProps> = ({
  filteredJobs,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  getStatusColor,
  getPriorityColor,
  isOverdue,
  handleEditJob,
  handleUpdateJobStatus,
  showActionMenu,
  setShowActionMenu,
}) => {
  return (
    <div className="content-card">
      <div className="section-header">
        <h2>Jobs Overview</h2>
        <div className="filters-section">
          <div className="search-box">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Gas">Gas</option>
            <option value="Electrical">Electrical</option>
            <option value="Smoke">Smoke</option>
            <option value="Repairs">Repairs</option>
          </select>
        </div>
      </div>

      <div className="jobs-table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Property Address</th>
              <th>Job Type</th>
              <th>Due Date</th>
              <th>Assigned Technician</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr
                key={job.id}
                className={
                  isOverdue(job.dueDate) && job.status !== "Completed"
                    ? "overdue-row"
                    : ""
                }
              >
                <td className="job-id-cell">{job.job_id}</td>
                <td className="address-cell">{job.propertyAddress}</td>
                <td>
                  <span
                    className={`job-type type-${job.jobType.toLowerCase()}`}
                  >
                    {job.jobType}
                  </span>
                </td>
                <td className="date-cell">
                  <div className="date-cell-items">
                    <RiCalendarLine />
                    {new Date(job.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="technician-cell">
                  <div className="technician-cell-items">
                    <RiUserLine />
                    {job.assignedTechnician || "Unassigned"}
                  </div>
                </td>
                <td>
                  <span className={`job-status ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`job-priority ${getPriorityColor(job.priority)}`}
                  >
                    {job.priority}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn"
                    onClick={() =>
                      setShowActionMenu(
                        showActionMenu === job.id ? null : job.id
                      )
                    }
                  >
                    <RiMoreLine />
                  </button>
                  {showActionMenu === job.id && (
                    <div className="action-menu">
                      <button onClick={() => handleEditJob(job)}>
                        Edit Job
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateJobStatus(job.id, "Completed")
                        }
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateJobStatus(job.id, "Scheduled")
                        }
                      >
                        Mark as Scheduled
                      </button>
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "Pending")}
                      >
                        Mark as Pending
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobsOverview;
