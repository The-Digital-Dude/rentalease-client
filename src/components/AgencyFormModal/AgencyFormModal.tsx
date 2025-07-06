import { useState, useEffect } from "react";
import Modal from "../Modal";
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
  status: "active" | "inactive";
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
  status: "active" | "inactive";
}

interface AgencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AgencyFormData) => void;
  editingAgency?: Agency | null;
  complianceLevels: string[];
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
};

const AgencyFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingAgency,
  complianceLevels,
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
    onSubmit(formData);
    setFormData(initialFormData);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingAgency ? "Edit Property Manager" : "Add New Property Manager"}
      size="large"
    >
      <form onSubmit={handleFormSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Property Manager Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
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
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="region">Region</label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="complianceLevel">Compliance Level</label>
            <select
              id="complianceLevel"
              name="complianceLevel"
              value={formData.complianceLevel}
              onChange={handleInputChange}
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
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editingAgency ? "Update Agency" : "Add Agency"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgencyFormModal;
