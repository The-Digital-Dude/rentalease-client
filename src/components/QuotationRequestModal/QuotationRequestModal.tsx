import React, { useState, useEffect } from "react";
import {
  RiCloseLine,
  RiServiceLine,
  RiCalendarLine,
  RiFileTextLine,
  RiHomeLine,
  RiSendPlaneLine,
  RiDraftLine,
} from "react-icons/ri";
import { quotationService, propertyService } from "../../services";
import { useAppSelector } from "../../store";
import Toast from "../Toast";
import "./QuotationRequestModal.scss";

interface Property {
  id: string;
  title: string;
  address: {
    fullAddress: string;
  };
}

interface QuotationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ToastType {
  message: string;
  type: "success" | "error" | "info";
}

const QuotationRequestModal: React.FC<QuotationRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    jobType: "",
    property: "",
    dueDate: "",
    description: "",
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { userType } = useAppSelector((state) => state.user);

  const jobTypes = [
    "Vacant Property Cleaning",
    "Water Connection",
    "Gas Connection",
    "Electricity Connection",
    "Landscaping & Outdoor Maintenance",
    "Pest Control",
    "Grout Cleaning",
    "Removalists",
    "Handyman Services",
    "Painters",
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      // Reset form when modal opens
      setFormData({
        jobType: "",
        property: "",
        dueDate: "",
        description: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await propertyService.getProperties();
      setProperties(response.data?.properties || []);
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      setToast({
        message: "Failed to load properties",
        type: "error"
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.jobType) {
      newErrors.jobType = "Service type is required";
    }

    if (!formData.property) {
      newErrors.property = "Property is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (new Date(formData.dueDate) <= new Date()) {
      newErrors.dueDate = "Due date must be in the future";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, status: "Draft" | "Sent" = "Sent") => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await quotationService.createQuotationRequest({
        jobType: formData.jobType,
        property: formData.property,
        dueDate: formData.dueDate,
        description: formData.description,
        status: status,
      });

      const message = status === "Draft"
        ? "Quotation request saved as draft!"
        : "Quotation request submitted successfully!";

      setToast({
        message: message,
        type: "success"
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("Error creating quotation request:", error);
      setToast({
        message: error.message || "Failed to submit quotation request",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quotation-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <RiServiceLine />
            <div>
              <h2>Request Beyond Compliance Service</h2>
              <p>Submit a quotation request for additional property services</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Service Type Selection */}
          <div className="form-group">
            <label htmlFor="jobType">
              <RiServiceLine />
              Service Type *
            </label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              className={errors.jobType ? "error" : ""}
              required
            >
              <option value="">Select service type...</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.jobType && <span className="error-message">{errors.jobType}</span>}
          </div>

          {/* Property Selection */}
          <div className="form-group">
            <label htmlFor="property">
              <RiHomeLine />
              Property *
            </label>
            {loadingProperties ? (
              <div className="loading-select">Loading properties...</div>
            ) : (
              <select
                id="property"
                name="property"
                value={formData.property}
                onChange={handleInputChange}
                className={errors.property ? "error" : ""}
                required
              >
                <option value="">Select property...</option>
                {Array.isArray(properties) && properties.map((property: any) => (
                  <option key={property.id || property._id} value={property.id || property._id}>
                    {property.fullAddress}
                  </option>
                ))}
              </select>
            )}
            {errors.property && <span className="error-message">{errors.property}</span>}
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label htmlFor="dueDate">
              <RiCalendarLine />
              Required Completion Date *
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              min={getTomorrowDate()}
              className={errors.dueDate ? "error" : ""}
              required
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              <RiFileTextLine />
              Service Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the service requirements, specific details, access instructions, etc."
              rows={4}
              maxLength={1000}
              className={errors.description ? "error" : ""}
              required
            />
            <div className="char-count">
              {formData.description.length}/1000 characters
            </div>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Service Info */}
          <div className="service-info">
            <div className="info-card">
              <h4>What happens next?</h4>
              <ol>
                <li>Your request will be reviewed by our team</li>
                <li>You'll receive a detailed quotation via email</li>
                <li>Accept or decline the quotation</li>
                <li>Once accepted, a job will be created and assigned to a technician</li>
              </ol>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={loading}
            onClick={(e) => handleSubmit(e, "Draft")}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <RiDraftLine />
                Save as Draft
              </>
            )}
          </button>
          <button
            type="submit"
            form="quotation-form"
            className="btn-primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Submitting...
              </>
            ) : (
              <>
                <RiSendPlaneLine />
                Submit Request
              </>
            )}
          </button>
        </div>

        {/* Toast notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default QuotationRequestModal;