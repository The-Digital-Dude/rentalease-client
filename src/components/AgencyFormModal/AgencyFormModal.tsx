import { useState, useEffect, useRef } from "react";
import Modal from "../Modal";
import { VALID_REGIONS, COMPLIANCE_TYPES } from "../../constants";
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
  complianceSubscriptions?: string[];
  status: "active" | "inactive" | "pending" | "suspended";
  outstandingAmount: number;
  subscriptionAmount?: number;
}

interface AgencyFormData {
  name: string;
  abn: number | string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  complianceLevel: string;
  complianceSubscriptions: string[];
  status: "active" | "inactive" | "pending" | "suspended";
  password?: string;
  subscriptionAmount?: number | string;
}

interface AgencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AgencyFormData) => void;
  editingAgency?: Agency | null;
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
  complianceSubscriptions: [],
  status: "active",
  password: "",
  subscriptionAmount: "",
};

const AgencyFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingAgency,
  regions,
  isSubmitting = false,
}: AgencyFormModalProps) => {
  const [formData, setFormData] = useState<AgencyFormData>(initialFormData);
  const [isComplianceDropdownOpen, setIsComplianceDropdownOpen] =
    useState(false);
  const complianceDropdownRef = useRef<HTMLDivElement>(null);

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
        complianceSubscriptions: editingAgency.complianceSubscriptions || [],
        status: editingAgency.status,
        subscriptionAmount: editingAgency.subscriptionAmount || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingAgency, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        complianceDropdownRef.current &&
        !complianceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsComplianceDropdownOpen(false);
      }
    };

    if (isComplianceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isComplianceDropdownOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle number inputs properly
    if (name === "subscriptionAmount" || name === "abn") {
      const numericValue = value === "" ? "" : Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Prevent scroll wheel from changing number inputs
  const handleNumberInputWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  // Handle compliance checkbox toggle
  const handleComplianceToggle = (type: string) => {
    setFormData((prev) => {
      const current = prev.complianceSubscriptions || [];
      const isSelected = current.includes(type);

      if (isSelected) {
        return {
          ...prev,
          complianceSubscriptions: current.filter((t) => t !== type),
        };
      } else {
        return {
          ...prev,
          complianceSubscriptions: [...current, type],
        };
      }
    });
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
              type="number"
              id="abn"
              name="abn"
              value={formData.abn}
              onChange={handleInputChange}
              onWheel={handleNumberInputWheel}
              disabled={isSubmitting}
              required
              min="10000000000"
              max="99999999999"
              step="1"
              placeholder="11 digit ABN"
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
          {/* <div className="form-group">
            <label htmlFor="complianceSubscriptions">
              Compliance Subscriptions
            </label>
            <div className="custom-multi-select" ref={complianceDropdownRef}>
              <div
                className={`select-display ${
                  isComplianceDropdownOpen ? "open" : ""
                } ${isSubmitting ? "disabled" : ""}`}
                onClick={() =>
                  !isSubmitting &&
                  setIsComplianceDropdownOpen(!isComplianceDropdownOpen)
                }
              >
                <span className="selected-text">
                  {formData.complianceSubscriptions &&
                  formData.complianceSubscriptions.length > 0
                    ? formData.complianceSubscriptions.join(", ")
                    : "Select compliance types..."}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
              {isComplianceDropdownOpen && !isSubmitting && (
                <div className="dropdown-menu">
                  {COMPLIANCE_TYPES.map((type) => (
                    <label key={type} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={
                          formData.complianceSubscriptions?.includes(type) ||
                          false
                        }
                        onChange={() => handleComplianceToggle(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div> */}
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
          {/* Subscription amount field */}
          {/* <div className="form-group">
            <label htmlFor="subscriptionAmount">
              Subscription Amount (AUD) {!editingAgency && "*"}
            </label>
            <input
              type="number"
              id="subscriptionAmount"
              name="subscriptionAmount"
              value={formData.subscriptionAmount || ""}
              onChange={handleInputChange}
              onWheel={handleNumberInputWheel}
              placeholder="99"
              min="1"
              max="100000"
              step="1"
              disabled={isSubmitting}
              required={!editingAgency}
            />
            <small
              style={{
                color: "#757575",
                fontSize: "12px",
                marginTop: "4px",
                display: "block",
              }}
            >
              Amount between $1 and $100,000 AUD per month
            </small>
          </div> */}
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
