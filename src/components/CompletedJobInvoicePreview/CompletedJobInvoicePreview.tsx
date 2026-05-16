import React from "react";
import type { Invoice, InvoiceDocumentReviewData } from "../../services/invoiceService";
import "./CompletedJobInvoicePreview.scss";

interface PreviewJob {
  job_id: string;
  jobType: string;
  property: {
    address: {
      fullAddress: string;
    };
  };
  agency?: {
    name?: string;
  };
}

interface CompletedJobInvoicePreviewProps {
  invoice: Invoice;
  job: PreviewJob;
  reviewData?: InvoiceDocumentReviewData | null;
  compact?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount || 0);

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatQuantity = (quantity: number) =>
  Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(2);

const getStatusClassName = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "draft" || normalizedStatus === "pending") {
    return "status-pending";
  }

  if (normalizedStatus === "sent") {
    return "status-sent";
  }

  if (normalizedStatus === "paid") {
    return "status-paid";
  }

  return "status-pending";
};

const CompletedJobInvoicePreview: React.FC<CompletedJobInvoicePreviewProps> = ({
  invoice,
  job,
  reviewData,
  compact = false,
}) => {
  const propertyAddress =
    reviewData?.propertyAddress || job.property.address.fullAddress;
  const serviceName = reviewData?.jobType || job.jobType;
  const agencyName = reviewData?.agencyName || job.agency?.name || "-";

  return (
    <div
      className={`completed-job-invoice-preview ${
        compact ? "compact-preview" : ""
      }`}
    >
      <div className="brand-banner">
        <div className="brand-lockup">
          <img
            src="/rentalease-logo.png"
            alt="RentalEase"
            className="brand-logo"
          />
          <div className="brand-copy">
            <span className="brand-name">RentalEase</span>
            <span className="brand-tagline">
              Property Compliance and Billing
            </span>
          </div>
        </div>
        <div className="brand-meta">
          <span>Generated Invoice</span>
          <strong>{reviewData?.jobNumber || job.job_id}</strong>
        </div>
      </div>

      <div className="invoice-header-section">
        <div className="invoice-number">
          <p className="preview-kicker">Invoice Number</p>
          <h3>{invoice.invoiceNumber}</h3>
          <span className={`status-badge ${getStatusClassName(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        <div className="invoice-amount">
          <p className="amount-label">Total Amount</p>
          <p className="amount-value">{formatCurrency(invoice.totalCost)}</p>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-section">
          <h4>Property Information</h4>
          <div className="detail-item">
            <span className="label">Property Address</span>
            <span className="value">{propertyAddress}</span>
          </div>
          <div className="detail-item">
            <span className="label">Agency</span>
            <span className="value">{agencyName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Inspection Report</span>
            <span className="value">
              {reviewData?.hasReport ? "Available" : "Missing"}
            </span>
          </div>
        </div>

        <div className="detail-section">
          <h4>Invoice Information</h4>
          <div className="detail-item">
            <span className="label">Job Number</span>
            <span className="value">{reviewData?.jobNumber || job.job_id}</span>
          </div>
          <div className="detail-item">
            <span className="label">Service</span>
            <span className="value">{serviceName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Created</span>
            <span className="value">{formatDate(invoice.createdAt)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Updated</span>
            <span className="value">{formatDate(invoice.updatedAt)}</span>
          </div>
        </div>

        <div className="detail-section full-width">
          <h4>Invoice Items</h4>
          <div className="preview-items-table">
            <div className="preview-items-head">
              <span>Item</span>
              <span>Qty</span>
              <span>Rate</span>
              <span>Amount</span>
            </div>
            {invoice.items.map((item, index) => (
              <div
                key={item._id || item.id || index}
                className="preview-items-row"
              >
                <span>{item.name}</span>
                <span>{formatQuantity(item.quantity)}</span>
                <span>{formatCurrency(item.rate)}</span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="preview-totals">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(invoice.subtotal)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{formatCurrency(invoice.tax)}</strong>
            </div>
            <div className="total-row">
              <span>Total</span>
              <strong>{formatCurrency(invoice.totalCost)}</strong>
            </div>
          </div>
        </div>

        <div className="detail-section full-width">
          <h4>Description</h4>
          <p className="description-text">{invoice.description || "-"}</p>
        </div>

        {invoice.notes && (
          <div className="detail-section full-width">
            <h4>Notes</h4>
            <p className="response-notes">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedJobInvoicePreview;
