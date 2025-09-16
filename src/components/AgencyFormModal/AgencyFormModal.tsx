import { useState, useEffect } from "react";
import Modal from "../Modal";
import { VALID_REGIONS } from "../../constants";
import "./AgencyFormModal.scss";

interface Agency {
  id: string;
  name: string;
  abn: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  complianceLevel: string;
  status: "active" | "inactive" | "pending" | "suspended";
  outstandingAmount: number;
}

interface AgencyFormData {
  name: string;
  abn: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  complianceLevel: string;
  status: "active" | "inactive" | "pending" | "suspended";
  password?: string;
}

interface AgencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AgencyFormData) => void;
  editingAgency?: Agency | null;
  complianceLevels: string[];
  regions: readonly string[];
  isSubmitting?: boolean;
}

const initialFormData: AgencyFormData = {
  name: "",
  abn: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  region: "",
  complianceLevel: "",
  status: "active",
  password: "",
};

const AgencyFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingAgency,
  complianceLevels,
  regions,
  isSubmitting = false,
}: AgencyFormModalProps) => {
  const [formData, setFormData] = useState<AgencyFormData>(initialFormData);

  useEffect(() => {
    if (editingAgency) {
      setFormData({
        name: editingAgency.name,
        abn: editingAgency.abn,
        contactPerson: editingAgency.contactPerson,
        contactEmail: editingAgency.contactEmail,
        contactPhone: editingAgency.contactPhone,
        region: editingAgency.region,
        complianceLevel: editingAgency.complianceLevel,
        status: editingAgency.status,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingAgency, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    onSubmit(formData);
    // Don't reset form data here - let parent component handle it after successful response
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingAgency ? "Edit Agency" : "Add New Agency"}
      size="large"
    >
      <form onSubmit={handleFormSubmit}>
        <div className={`form-grid ${isSubmitting ? "form-disabled" : ""}`}>
          <div className="form-group">
            <label htmlFor="name">Agency Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="abn">ABN</label>
            <input
              type="text"
              id="abn"
              name="abn"
              value={formData.abn}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPerson">Contact Person</label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactEmail">Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPhone">Phone</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="region">Region</label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="complianceLevel">Compliance Level</label>
            <select
              id="complianceLevel"
              name="complianceLevel"
              value={formData.complianceLevel}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Compliance Level</option>
              {complianceLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          {/* Password field only for new agencies */}
          {!editingAgency && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                placeholder="Enter a secure password"
                disabled={isSubmitting}
                required
              />
            </div>
          )}
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="submit-loading">
                <div className="spinner"></div>
                <span>
                  {editingAgency ? "Updating..." : "Adding Agency..."}
                </span>
              </div>
            ) : editingAgency ? (
              "Update Agency"
            ) : (
              "Add Agency"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgencyFormModal;
