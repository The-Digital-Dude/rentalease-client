import React, { useState } from "react";
import {
  RiSearchLine,
  RiCalendarLine,
  RiUserLine,
  RiMoreLine,
  RiEdit2Line,
} from "react-icons/ri";
import "./JobsOverview.scss";
import JobFormModal, { type JobFormData } from "../JobFormModal";
import type { ComponentJob } from "../../utils/jobAdapter";
import type { ComponentTechnician } from "../../utils/staffAdapter";

interface JobsOverviewProps {
  filteredJobs: ComponentJob[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  isOverdue: (dueDate: string) => boolean;
  handleEditJob: (job: ComponentJob) => void;
  handleUpdateJobStatus: (jobId: string, newStatus: ComponentJob["status"]) => void;
  showActionMenu: string | null;
  setShowActionMenu: (jobId: string | null) => void;
  technicians: ComponentTechnician[];
  onJobUpdate: (updatedJob: ComponentJob) => void;
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
  technicians,
  onJobUpdate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ComponentJob | null>(null);

  // Helper function to format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const handleEditClick = (job: ComponentJob) => {
    // Find the technician ID by name if we only have the name
    let technicianId = job.assignedTechnicianId;
    if (!technicianId && job.assignedTechnician) {
      const technician = technicians.find(tech => tech.name === job.assignedTechnician);
      technicianId = technician?.id || '';
    }
    
    setEditingJob({
      ...job,
      assignedTechnicianId: technicianId
    });
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const handleEditModalSubmit = (formData: JobFormData) => {
    if (editingJob) {
      const updatedJob = {
        ...editingJob,
        ...formData,
        assignedTechnician: formData.assignedTechnician 
          ? technicians.find(tech => tech.id === formData.assignedTechnician)?.name || formData.assignedTechnician
          : '',
        assignedTechnicianId: formData.assignedTechnician || '',
        description: formData.description ?? editingJob.description ?? '',
        createdDate: editingJob.createdDate,
      };
      onJobUpdate(updatedJob);
      handleEditModalClose();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (editingJob) {
      setEditingJob({
        ...editingJob,
        [e.target.name]: e.target.value,
      });
    }
  };

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
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(job)}
                    title="Edit Job"
                  >
                    <RiEdit2Line />
                  </button>
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
                      <button onClick={() => handleEditClick(job)}>
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

      {isEditModalOpen && editingJob && (
        <JobFormModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSubmit={handleEditModalSubmit}
          formData={{
            ...editingJob,
            assignedTechnician: editingJob.assignedTechnicianId,
            dueDate: formatDateForInput(editingJob.dueDate),
            description: editingJob.description || '',
          }}
          onInputChange={handleInputChange}
          technicians={technicians}
          mode="edit"
        />
      )}
    </div>
  );
};

export default JobsOverview;
