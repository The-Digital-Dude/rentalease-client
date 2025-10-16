import React, { useState, useEffect } from "react";
import { MdClose, MdCheckCircle, MdCancel, MdPending } from "react-icons/md";
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
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: "Accepted" | "Rejected") => {
    setLoading(true);

    try {
      if (!invoice) {
        throw new Error("No invoice selected");
      }

      if (userType !== "property_manager") {
        toast.error("Only property managers can update invoice status.");
        return;
      }

      await propertyManagerInvoiceService.updateInvoiceStatus(invoice._id, {
        status: newStatus,
      });

      toast.success(`Invoice ${newStatus.toLowerCase()} successfully`);
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
    if (!invoice) return "Unknown Property";

    // Handle new API format with propertyId object
    if (invoice.propertyId && typeof invoice.propertyId === "object") {
      return invoice.propertyId.address?.fullAddress || "Unknown Property";
    }

    // Handle old format with property object
    if (invoice.property && typeof invoice.property === "object") {
      // Handle new nested address format
      if (invoice.property.address?.fullAddress) {
        return invoice.property.address.fullAddress;
      }
      // Handle old flat format
      return invoice.property.fullAddress || "Unknown Property";
    }

    return "Unknown Property";
  };

  const getPropertyManagerName = () => {
    if (!invoice) return "";

    // Handle new API format with propertyManagerId object
    if (
      invoice.propertyManagerId &&
      typeof invoice.propertyManagerId === "object"
    ) {
      const pm = invoice.propertyManagerId;
      return (
        `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
      );
    }

    // Handle property's assigned property manager from new nested format
    if (invoice.propertyId && typeof invoice.propertyId === "object") {
      const property = invoice.propertyId as any;
      if (property.assignedPropertyManager) {
        const pm = property.assignedPropertyManager;
        return (
          `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
        );
      }
    }

    // Handle old format with propertyManager object
    if (
      invoice.propertyManager &&
      typeof invoice.propertyManager === "object"
    ) {
      const pm = invoice.propertyManager;
      return (
        `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
      );
    }

    return "";
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "Pending":
        return <MdPending />;
      case "Accepted":
        return <MdCheckCircle />;
      case "Rejected":
        return <MdCancel />;
      default:
        return <MdPending />;
    }
  };

  const isStatusLocked =
    invoice?.status === "Accepted" || invoice?.status === "Rejected";

  if (!isOpen || !invoice) return null;

  return (
    <div className="invoice-response-modal-overlay" onClick={onClose}>
      <div
        className="invoice-response-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{getStatusIcon(invoice.status)} Update Invoice Status</h2>
          <button className="close-btn" onClick={onClose} type="button">
            <MdClose />
          </button>
        </div>

        <div className="modal-body">
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
            {getPropertyManagerName() && (
              <div className="summary-item">
                <span className="label">Property Manager:</span>
                <span className="value">{getPropertyManagerName()}</span>
              </div>
            )}
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

          {/* Status Locked Message */}
          {isStatusLocked && (
            <div
              className={`confirmation-message ${invoice.status.toLowerCase()}`}
            >
              <p>
                {invoice.status === "Accepted" ? (
                  <MdCheckCircle />
                ) : (
                  <MdCancel />
                )}
                This invoice has been {invoice.status.toLowerCase()}. The status
                cannot be changed.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={() => handleUpdateStatus("Rejected")}
              className="submit-btn status-rejected"
              disabled={
                loading || userType !== "property_manager" || isStatusLocked
              }
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <MdCancel /> Reject Invoice
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("Accepted")}
              className="submit-btn status-accepted"
              disabled={
                loading || userType !== "property_manager" || isStatusLocked
              }
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <MdCheckCircle /> Accept Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceResponseModal;
