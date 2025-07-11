import { useState, useEffect } from "react";
import { RiSaveLine } from "react-icons/ri";
import Modal from "../Modal";
import { VALID_REGIONS } from "../../constants";
import "./PropertyFormModal.scss";

interface Property {
  id: string;
  address: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  propertyManager: string;
  region: string;
  status: "Available" | "Occupied" | "Maintenance" | "Pending";
  leaseStartDate?: string;
  leaseEndDate?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  createdDate: string;
  lastInspection?: string;
  nextInspection?: string;
  notes?: string;
}

interface PropertyFormData {
  address: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  propertyManager: string;
  region: string;
  status: "Available" | "Occupied" | "Maintenance" | "Pending";
  leaseStartDate?: string;
  leaseEndDate?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  notes?: string;
}

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyFormData) => void;
  editingProperty?: Property | null;
  isSubmitting?: boolean;
}

const initialFormData: PropertyFormData = {
  address: "",
  propertyType: "House",
  bedrooms: 1,
  bathrooms: 1,
  rentAmount: 0,
  propertyManager: "",
  region: "",
  status: "Available",
  leaseStartDate: "",
  leaseEndDate: "",
  tenantName: "",
  tenantEmail: "",
  tenantPhone: "",
  notes: "",
};

const PropertyFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingProperty,
  isSubmitting = false,
}: PropertyFormModalProps) => {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);

  // Update form data when editing property changes
  useEffect(() => {
    if (editingProperty) {
      setFormData({
        address: editingProperty.address,
        propertyType: editingProperty.propertyType,
        bedrooms: editingProperty.bedrooms,
        bathrooms: editingProperty.bathrooms,
        rentAmount: editingProperty.rentAmount,
        propertyManager: editingProperty.propertyManager,
        region: editingProperty.region,
        status: editingProperty.status,
        leaseStartDate: editingProperty.leaseStartDate || "",
        leaseEndDate: editingProperty.leaseEndDate || "",
        tenantName: editingProperty.tenantName || "",
        tenantEmail: editingProperty.tenantEmail || "",
        tenantPhone: editingProperty.tenantPhone || "",
        notes: editingProperty.notes || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingProperty, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingProperty ? "Edit Property" : "Add New Property"}
      size="large"
    >
      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-section">
          <h4>Property Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="address">Property Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full property address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="propertyType">Property Type *</label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                required
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Commercial">Commercial</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms *</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rentAmount">Weekly Rent Amount ($) *</label>
              <input
                type="number"
                id="rentAmount"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleInputChange}
                min="0"
                step="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="region">Region *</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Region</option>
                {VALID_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Management Details</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="propertyManager">Property Manager *</label>
              <input
                type="text"
                id="propertyManager"
                name="propertyManager"
                value={formData.propertyManager}
                onChange={handleInputChange}
                placeholder="Enter property manager name/company"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Property Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {formData.status === "Occupied" && (
          <div className="form-section">
            <h4>Tenant Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="tenantName">Tenant Name</label>
                <input
                  type="text"
                  id="tenantName"
                  name="tenantName"
                  value={formData.tenantName}
                  onChange={handleInputChange}
                  placeholder="Enter tenant name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenantEmail">Tenant Email</label>
                <input
                  type="email"
                  id="tenantEmail"
                  name="tenantEmail"
                  value={formData.tenantEmail}
                  onChange={handleInputChange}
                  placeholder="Enter tenant email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenantPhone">Tenant Phone</label>
                <input
                  type="tel"
                  id="tenantPhone"
                  name="tenantPhone"
                  value={formData.tenantPhone}
                  onChange={handleInputChange}
                  placeholder="Enter tenant phone"
                />
              </div>

              <div className="form-group">
                <label htmlFor="leaseStartDate">Lease Start Date</label>
                <input
                  type="date"
                  id="leaseStartDate"
                  name="leaseStartDate"
                  value={formData.leaseStartDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="leaseEndDate">Lease End Date</label>
                <input
                  type="date"
                  id="leaseEndDate"
                  name="leaseEndDate"
                  value={formData.leaseEndDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h4>Additional Information</h4>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about the property..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <RiSaveLine />
            {isSubmitting
              ? editingProperty
                ? "Updating Property..."
                : "Adding Property..."
              : editingProperty
              ? "Update Property"
              : "Add Property"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PropertyFormModal;
