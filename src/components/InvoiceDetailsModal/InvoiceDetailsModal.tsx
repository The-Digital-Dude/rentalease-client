import React from "react";
import { MdClose, MdReceipt, MdDownload } from "react-icons/md";
import type { PropertyManagerInvoice } from "../../services/propertyManagerInvoiceService";
import { generateInvoicePDF } from "../../utils/invoicePdfGenerator";
import "./InvoiceDetailsModal.scss";

interface InvoiceDetailsModalProps {
  invoice: PropertyManagerInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = () => {
    if (invoice) {
      generateInvoicePDF(invoice);
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
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

    // Fallback to property's assigned property manager (old format)
    if (invoice.property && typeof invoice.property === "object") {
      if (invoice.property.assignedPropertyManager) {
        const pm = invoice.property.assignedPropertyManager;
        return (
          `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
        );
      }
    }

    return "";
  };

  const getPropertyManagerEmail = () => {
    if (!invoice) return "";

    // Handle new API format with propertyManagerId object
    if (
      invoice.propertyManagerId &&
      typeof invoice.propertyManagerId === "object"
    ) {
      return invoice.propertyManagerId.email || "";
    }

    // Handle property's assigned property manager from new nested format
    if (invoice.propertyId && typeof invoice.propertyId === "object") {
      const property = invoice.propertyId as any;
      if (property.assignedPropertyManager) {
        return property.assignedPropertyManager.email || "";
      }
    }

    // Handle old format with propertyManager object
    if (
      invoice.propertyManager &&
      typeof invoice.propertyManager === "object"
    ) {
      return invoice.propertyManager.email || "";
    }

    // Fallback to property's assigned property manager (old format)
    if (invoice.property && typeof invoice.property === "object") {
      if (invoice.property.assignedPropertyManager) {
        return invoice.property.assignedPropertyManager.email || "";
      }
    }

    return "";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Sent":
        return "status-sent";
      case "Paid":
        return "status-paid";
      case "Accepted":
        return "status-accepted";
      case "Rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="invoice-details-modal-overlay" onClick={onClose}>
      <div
        className="invoice-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <MdReceipt /> Invoice Details
          </h2>
          <button className="close-btn" onClick={onClose} type="button">
            <MdClose />
          </button>
        </div>

        <div className="modal-body">
          <div className="invoice-header-section">
            <div className="invoice-number">
              <h3>{invoice.invoiceNumber}</h3>
              <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <div className="invoice-amount">
              <p className="amount-label">Total Amount</p>
              <p className="amount-value">{formatCurrency(invoice.amount)}</p>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-section">
              <h4>Property Information</h4>
              <div className="detail-item">
                <span className="label">Property Address:</span>
                <span className="value">{getPropertyAddress()}</span>
              </div>
              {getPropertyManagerName() && (
                <div className="detail-item">
                  <span className="label">Property Manager:</span>
                  <span className="value">{getPropertyManagerName()}</span>
                </div>
              )}
              {getPropertyManagerEmail() && (
                <div className="detail-item">
                  <span className="label">Manager Email:</span>
                  <span className="value">{getPropertyManagerEmail()}</span>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4>Invoice Information</h4>
              <div className="detail-item">
                <span className="label">Due Date:</span>
                <span className="value">{formatDateShort(invoice.dueDate)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Created:</span>
                <span className="value">{formatDate(invoice.createdAt)}</span>
              </div>
              {invoice.sentAt && (
                <div className="detail-item">
                  <span className="label">Sent:</span>
                  <span className="value">{formatDate(invoice.sentAt)}</span>
                </div>
              )}
              {invoice.paidAt && (
                <div className="detail-item">
                  <span className="label">Paid:</span>
                  <span className="value">{formatDate(invoice.paidAt)}</span>
                </div>
              )}
              {invoice.paymentMethod && (
                <div className="detail-item">
                  <span className="label">Payment Method:</span>
                  <span className="value">{invoice.paymentMethod}</span>
                </div>
              )}
              {invoice.paymentReference && (
                <div className="detail-item">
                  <span className="label">Payment Reference:</span>
                  <span className="value">{invoice.paymentReference}</span>
                </div>
              )}
            </div>

            <div className="detail-section full-width">
              <h4>Description</h4>
              <p className="description-text">{invoice.description}</p>
            </div>

            {invoice.notes && (
              <div className="detail-section full-width">
                <h4>Notes</h4>
                <p className="response-notes">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleDownloadPDF} className="download-pdf-btn">
            <MdDownload /> Download PDF
          </button>
          <button onClick={onClose} className="close-footer-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
