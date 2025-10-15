import React, { useState, useEffect } from "react";
import { MdClose, MdCheckCircle, MdSend, MdPending } from "react-icons/md";
import propertyManagerInvoiceService from "../../services/propertyManagerInvoiceService";
import type { PropertyManagerInvoice } from "../../services/propertyManagerInvoiceService";
import { toast } from "react-toastify";
import { useAppSelector } from "../../store";
import "./InvoiceResponseModal.scss";

interface InvoiceResponseModalProps {
  invoice: PropertyManagerInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceResponseModal: React.FC<InvoiceResponseModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userType } = useAppSelector((state) => state.user);
  const [status, setStatus] = useState<"Pending" | "Sent" | "Paid">("Sent");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      // Set initial status to next logical status
      if (invoice.status === "Pending") {
        setStatus("Sent");
      } else if (invoice.status === "Sent") {
        setStatus("Paid");
      } else {
        setStatus(invoice.status);
      }
      setPaymentMethod("");
      setPaymentReference("");
    }
  }, [isOpen, invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!invoice) {
        throw new Error("No invoice selected");
      }

      if (userType !== "property_manager") {
        toast.error("Only property managers can update invoice status.");
        return;
      }

      // Validate payment fields if marking as Paid
      if (status === "Paid" && !paymentMethod.trim()) {
        toast.error("Payment method is required when marking invoice as paid");
        setLoading(false);
        return;
      }

      await propertyManagerInvoiceService.updateInvoiceStatus(invoice._id, {
        status,
        paymentMethod: status === "Paid" ? paymentMethod.trim() : undefined,
        paymentReference:
          status === "Paid" ? paymentReference.trim() : undefined,
      });

      toast.success(`Invoice status updated to ${status} successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoice status");
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

  const getPropertyAddress = () => {
    if (!invoice) return "";
    if (typeof invoice.property === "string") return "Unknown Property";
    return invoice.property?.fullAddress || "Unknown Property";
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "Pending":
        return <MdPending />;
      case "Sent":
        return <MdSend />;
      case "Paid":
        return <MdCheckCircle />;
      default:
        return <MdPending />;
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="invoice-response-modal-overlay" onClick={onClose}>
      <div
        className="invoice-response-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{getStatusIcon(status)} Update Invoice Status</h2>
          <button className="close-btn" onClick={onClose} type="button">
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Invoice Summary */}
          <div className="invoice-summary">
            <div className="summary-item">
              <span className="label">Invoice Number:</span>
              <span className="value">{invoice.invoiceNumber}</span>
            </div>
            <div className="summary-item">
              <span className="label">Property:</span>
              <span className="value">{getPropertyAddress()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Amount:</span>
              <span className="value amount">
                {formatCurrency(invoice.amount)}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Due Date:</span>
              <span className="value">{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Current Status:</span>
              <span
                className={`value status-badge status-${invoice.status.toLowerCase()}`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="action-selection">
            <label className="action-label">Update Status To:</label>
            <div className="status-buttons">
              <button
                type="button"
                className={`status-btn pending-btn ${
                  status === "Pending" ? "active" : ""
                }`}
                onClick={() =>
                  userType === "property_manager" && setStatus("Pending")
                }
                disabled={userType !== "property_manager"}
              >
                <MdPending /> Pending
              </button>
              <button
                type="button"
                className={`status-btn sent-btn ${
                  status === "Sent" ? "active" : ""
                }`}
                onClick={() =>
                  userType === "property_manager" && setStatus("Sent")
                }
                disabled={userType !== "property_manager"}
              >
                <MdSend /> Sent
              </button>
              <button
                type="button"
                className={`status-btn paid-btn ${
                  status === "Paid" ? "active" : ""
                }`}
                onClick={() =>
                  userType === "property_manager" && setStatus("Paid")
                }
                disabled={userType !== "property_manager"}
              >
                <MdCheckCircle /> Paid
              </button>
            </div>
          </div>

          {/* Payment Details - Show only when status is Paid */}
          {status === "Paid" && (
            <div className="payment-details">
              <h4>Payment Details</h4>
              <div className="form-group">
                <label htmlFor="paymentMethod">
                  Payment Method <span className="required">*</span>
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="paymentReference">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID, cheque number, etc."
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          <div className={`confirmation-message ${status.toLowerCase()}`}>
            {status === "Pending" && (
              <p>
                <MdPending /> This invoice will be marked as Pending. It has not
                yet been sent to the property manager.
              </p>
            )}
            {status === "Sent" && (
              <p>
                <MdSend /> This invoice will be marked as Sent. The property
                manager has been notified.
              </p>
            )}
            {status === "Paid" && (
              <p>
                <MdCheckCircle /> This invoice will be marked as Paid for{" "}
                <strong>{formatCurrency(invoice.amount)}</strong>. This action
                cannot be easily undone.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`submit-btn status-${status.toLowerCase()}`}
              disabled={loading || userType !== "property_manager"}
            >
              {loading ? "Updating..." : `Mark as ${status}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceResponseModal;
