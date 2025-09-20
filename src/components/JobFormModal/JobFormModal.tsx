import React from "react";
import Modal from "../Modal";
import type { ComponentTechnician } from "../../utils/technicianAdapter";
import "./JobFormModal.scss";

export interface JobFormData {
  id?: string;
  job_id?: string;
  propertyId: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs" | "Pool Safety" | "Routine Inspection";
  dueDate: string;
  assignedTechnician: string;
  status?: "Pending" | "Scheduled" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
}

interface Property {
  id: string;
  fullAddress: string;
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
  technicians: ComponentTechnician[];
  properties: Property[];
  mode: "create" | "edit";
}

const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  technicians,
  properties,
  mode,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const modalTitle = mode === "create" ? "Create New Job" : "Edit Job";
  const submitButtonText = mode === "create" ? "Create Job" : "Save Changes";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="medium">
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="propertyId">Property *</label>
          <select
            id="propertyId"
            name="propertyId"
            value={formData.propertyId}
            onChange={onInputChange}
            required
          >
            <option value="">Select Property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.fullAddress}
              </option>
            ))}
          </select>
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
              <optgroup label="Compliance Jobs">
                <option value="Gas">Gas Safety</option>
                <option value="Electrical">Electrical Safety</option>
                <option value="Smoke">Smoke Alarm</option>
              </optgroup>
              <optgroup label="General Jobs">
                <option value="Repairs">Repairs</option>
                <option value="Pool Safety">Pool Safety</option>
                <option value="Routine Inspection">Routine Inspection</option>
              </optgroup>
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

        {mode === "edit" && (
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
              <option value="Cancelled">Cancelled</option>
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
                .filter((tech) => {
                  // In create mode, only show available technicians
                  if (mode === "create") {
                    return tech.availability === "Available";
                  }
                  // In edit mode, show available technicians and the currently assigned one
                  return (
                    tech.availability === "Available" ||
                    tech.availability === "Busy" ||
                    tech.id === formData.assignedTechnician
                  );
                })
                .map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} - {technician.email} (
                    {technician.currentJobs}/{technician.maxJobs} jobs,{" "}
                    {technician.experience}y exp) - {technician.availability}
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
