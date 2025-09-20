import React, { useState, useEffect } from "react";
import {
  MdClose,
  MdAttachMoney,
  MdCalendarToday,
  MdNoteAlt,
  MdSend,
  MdSave,
  MdWarning,
  MdInfo,
} from "react-icons/md";
import { toast } from "react-toastify";
import quotationService from "../../services/quotationService";
import "./QuotationPricingModal.scss";

interface QuotationPricingModalProps {
  quotation: {
    _id: string;
    quotationNumber: string;
    agency: {
      _id: string;
      name: string;
    } | string;
    jobType: string;
    property: {
      _id: string;
      title: string;
      address: string | {
        street: string;
        suburb: string;
        state: string;
        postcode: string;
        fullAddress: string;
      };
      fullAddress?: string;
    } | string;
    dueDate: string;
    amount?: number;
    notes?: string;
    validUntil?: string;
    status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
    description: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuotationPricingModal: React.FC<QuotationPricingModalProps> = ({
  quotation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    amount: quotation.amount || 0,
    notes: quotation.notes || "",
    validUntil: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (quotation.validUntil) {
      // Convert existing validUntil to local datetime format for input
      const date = new Date(quotation.validUntil);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setFormData(prev => ({
        ...prev,
        validUntil: localDate.toISOString().slice(0, 16),
      }));
    } else {
      // Default to 7 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const localDate = new Date(futureDate.getTime() - futureDate.getTimezoneOffset() * 60000);
      setFormData(prev => ({
        ...prev,
        validUntil: localDate.toISOString().slice(0, 16),
      }));
    }
  }, [quotation]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Valid until date is required";
    } else if (new Date(formData.validUntil) <= new Date()) {
      newErrors.validUntil = "Valid until date must be in the future";
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Notes cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSaveAndSend = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await quotationService.sendQuotation(quotation._id, {
        amount: formData.amount,
        notes: formData.notes,
        validUntil: new Date(formData.validUntil).toISOString(),
      });

      toast.success("Quotation updated and sent to agency successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to send quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOnly = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await quotationService.updateQuotation(quotation._id, {
        amount: formData.amount,
        notes: formData.notes,
        validUntil: new Date(formData.validUntil).toISOString(),
      });

      toast.success("Quotation updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update quotation");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(quotation.dueDate);
  const isUrgent = daysUntilDue <= 3;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quotation-pricing-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-title">
              <MdAttachMoney className="header-icon" />
              <div>
                <h2>Add Pricing</h2>
                <p>Quotation #{quotation.quotationNumber}</p>
              </div>
            </div>
            <button className="close-button" onClick={onClose} disabled={loading}>
              <MdClose />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Quotation Summary */}
          <div className="quotation-summary">
            <div className="summary-item">
              <label>Agency</label>
              <span>
                {typeof quotation.agency === 'object'
                  ? (quotation.agency.name || 'Unknown Agency')
                  : 'Unknown Agency'}
              </span>
            </div>
            <div className="summary-item">
              <label>Service Type</label>
              <span>{quotation.jobType}</span>
            </div>
            <div className="summary-item">
              <label>Property</label>
              <span>
                {typeof quotation.property === 'object'
                  ? (
                      quotation.property.fullAddress ||
                      (typeof quotation.property.address === 'object'
                        ? quotation.property.address.fullAddress ||
                          `${quotation.property.address.street || ''} ${quotation.property.address.suburb || ''} ${quotation.property.address.state || ''} ${quotation.property.address.postcode || ''}`.trim()
                        : quotation.property.address) ||
                      'Unknown Property'
                    )
                  : 'Unknown Property'}
              </span>
            </div>
            <div className="summary-item">
              <label>Due Date</label>
              <span className={isUrgent ? "urgent" : ""}>
                {formatDate(quotation.dueDate)}
                {isUrgent && (
                  <span className="urgency-badge">
                    {daysUntilDue > 0 ? `${daysUntilDue} days left` : "Overdue"}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Service Description */}
          <div className="description-section">
            <h3>Service Description</h3>
            <div className="description-text">{quotation.description}</div>
          </div>

          {/* Pricing Form */}
          <div className="pricing-form">
            <h3>Pricing Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">
                  <MdAttachMoney />
                  Quoted Amount (AUD) *
                </label>
                <div className="amount-input-container">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount || ""}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading}
                    className={errors.amount ? "error" : ""}
                  />
                </div>
                {errors.amount && <span className="error-message">{errors.amount}</span>}
                {formData.amount > 0 && (
                  <div className="amount-preview">
                    Preview: {formatCurrency(formData.amount)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="validUntil">
                  <MdCalendarToday />
                  Valid Until *
                </label>
                <input
                  type="datetime-local"
                  id="validUntil"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={errors.validUntil ? "error" : ""}
                />
                {errors.validUntil && <span className="error-message">{errors.validUntil}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">
                <MdNoteAlt />
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional information about the pricing, terms, or conditions..."
                rows={4}
                maxLength={500}
                disabled={loading}
                className={errors.notes ? "error" : ""}
              />
              {errors.notes && <span className="error-message">{errors.notes}</span>}
              <div className="character-count">
                {formData.notes.length}/500 characters
              </div>
            </div>
          </div>

          {/* Warning for urgent jobs */}
          {isUrgent && (
            <div className="warning-banner">
              <MdWarning />
              <div>
                <strong>Urgent Request:</strong> This job is due{" "}
                {daysUntilDue > 0 ? `in ${daysUntilDue} days` : "overdue"}.
                Please prioritize this quotation.
              </div>
            </div>
          )}

          {/* Info about sending */}
          <div className="info-banner">
            <MdInfo />
            <div>
              <strong>Note:</strong> Once sent, the agency will receive an email notification
              with the pricing details and can accept or reject the quotation.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="button-group">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveOnly}
              className="save-btn"
              disabled={loading}
            >
              <MdSave />
              {loading ? "Saving..." : "Save Only"}
            </button>
            <button
              type="button"
              onClick={handleSaveAndSend}
              className="send-btn primary"
              disabled={loading}
            >
              <MdSend />
              {loading ? "Sending..." : "Save & Send to Agency"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPricingModal;