import React, { useState } from "react";
import {
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiFileTextLine,
  RiSendPlaneLine,
  RiDraftLine,
} from "react-icons/ri";
import { quotationService } from "../../services";
import Toast from "../Toast";
import "./QuotationResponseModal.scss";

interface ToastType {
  message: string;
  type: "success" | "error" | "info";
}

interface QuotationResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  quotation: any;
}

const QuotationResponseModal: React.FC<QuotationResponseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  quotation,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    notes: "",
    validUntil: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen || !quotation) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount) {
      newErrors.amount = "Quote amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a valid positive number";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Valid until date is required";
    } else if (new Date(formData.validUntil) <= new Date()) {
      newErrors.validUntil = "Valid until date must be in the future";
    }

    if (!formData.notes.trim()) {
      newErrors.notes = "Notes/terms are required";
    } else if (formData.notes.length > 1000) {
      newErrors.notes = "Notes cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await quotationService.sendQuotation(quotation._id, {
        amount: Number(formData.amount),
        notes: formData.notes,
        validUntil: formData.validUntil,
      });

      setToast({
        message: "Quotation sent successfully!",
        type: "success"
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("Error sending quotation:", error);
      setToast({
        message: error.message || "Failed to send quotation",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="modal-overlay">
      <div className="quotation-response-modal">
        <div className="modal-header">
          <div className="header-content">
            <RiMoneyDollarCircleLine />
            <div>
              <h2>Send Quotation</h2>
              <p>Provide pricing and terms for this service request</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <div className="modal-body">
          {/* Quotation Details */}
          <div className="quotation-details">
            <h3>Request Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Quotation #:</label>
                <span>{quotation.quotationNumber}</span>
              </div>
              <div className="detail-item">
                <label>Service Type:</label>
                <span>{quotation.jobType}</span>
              </div>
              <div className="detail-item">
                <label>Property:</label>
                <span>{quotation.property?.fullAddress || "Property Details"}</span>
              </div>
              <div className="detail-item">
                <label>Due Date:</label>
                <span>{formatDate(quotation.dueDate)}</span>
              </div>
              <div className="detail-item">
                <label>Agency:</label>
                <span>{quotation.agency?.name || "Agency Name"}</span>
              </div>
            </div>
            <div className="detail-description">
              <label>Description:</label>
              <p>{quotation.description}</p>
            </div>
          </div>

          <form id="quotation-response-form" onSubmit={handleSubmit}>
            {/* Quote Amount */}
            <div className="form-group">
              <label htmlFor="amount">
                <RiMoneyDollarCircleLine />
                Quote Amount (AUD) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter quote amount"
                min="0"
                step="0.01"
                className={errors.amount ? "error" : ""}
                required
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>

            {/* Valid Until */}
            <div className="form-group">
              <label htmlFor="validUntil">
                <RiCalendarLine />
                Quote Valid Until *
              </label>
              <input
                type="date"
                id="validUntil"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                min={getTomorrowDate()}
                className={errors.validUntil ? "error" : ""}
                required
              />
              {errors.validUntil && <span className="error-message">{errors.validUntil}</span>}
            </div>

            {/* Notes/Terms */}
            <div className="form-group">
              <label htmlFor="notes">
                <RiFileTextLine />
                Terms & Conditions *
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter terms and conditions, payment terms, scope of work, etc."
                rows={6}
                maxLength={1000}
                className={errors.notes ? "error" : ""}
                required
              />
              <div className="char-count">
                {formData.notes.length}/1000 characters
              </div>
              {errors.notes && <span className="error-message">{errors.notes}</span>}
            </div>
          </form>
        </div>

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
            type="submit"
            form="quotation-response-form"
            className="btn-primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Sending...
              </>
            ) : (
              <>
                <RiSendPlaneLine />
                Send Quotation
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

export default QuotationResponseModal;