import React from "react";
import Modal from "../Modal";
import "./JobFormModal.scss";

export interface JobFormData {
  id?: string;
  job_id?: string;
  propertyAddress: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
  dueDate: string;
  assignedTechnician: string;
  status?: "Pending" | "Scheduled" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
}

interface Technician {
  id: string;
  name: string;
  specialties: string[];
  availability: "Available" | "Busy" | "Off Duty";
  currentJobs: number;
}

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: JobFormData) => void;
  formData: JobFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  technicians: Technician[];
  mode: 'create' | 'edit';
}

const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  technicians,
  mode
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const modalTitle = mode === 'create' ? 'Create New Job' : 'Edit Job';
  const submitButtonText = mode === 'create' ? 'Create Job' : 'Save Changes';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="propertyAddress">Property Address *</label>
          <input
            type="text"
            id="propertyAddress"
            name="propertyAddress"
            value={formData.propertyAddress}
            onChange={onInputChange}
            placeholder="Enter property address"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="jobType">Job Type *</label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={onInputChange}
              required
            >
              <option value="Gas">Gas</option>
              <option value="Electrical">Electrical</option>
              <option value="Smoke">Smoke</option>
              <option value="Repairs">Repairs</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority *</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={onInputChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {mode === 'edit' && (
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onInputChange}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="assignedTechnician">Assigned Technician</label>
            <select
              id="assignedTechnician"
              name="assignedTechnician"
              value={formData.assignedTechnician || "null"}
              onChange={onInputChange}
            >
              <option value="null">Select Technician</option>
              {technicians
                .filter((tech) => tech.availability === "Available" || (mode === 'edit' && tech.id === formData.assignedTechnician))
                .map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} ({technician.currentJobs} jobs)
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Enter job description or special instructions"
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {submitButtonText}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JobFormModal;
