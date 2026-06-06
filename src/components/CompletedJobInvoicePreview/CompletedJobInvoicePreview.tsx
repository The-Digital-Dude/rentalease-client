import React from "react";
import type { Invoice, InvoiceDocumentReviewData } from "../../services/invoiceService";
import {
  COMPLETED_JOB_INVOICE_BANK_DETAILS,
  COMPLETED_JOB_INVOICE_COMPANY,
  COMPLETED_JOB_INVOICE_TERMS,
  buildInvoiceDisplayDates,
  buildInvoiceDocumentTitle,
  formatAddressLines,
  formatCurrency,
  formatInvoiceDate,
  getAttentionName,
  getReportStatusLabel,
  getWorksAuthorisedBy,
} from "../../utils/completedJobInvoiceContent";
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
  reportFile?: string | null;
}

interface CompletedJobInvoicePreviewProps {
  invoice: Invoice;
  job: PreviewJob;
  reviewData?: InvoiceDocumentReviewData | null;
  compact?: boolean;
}

const formatQuantity = (quantity: number) =>
  Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(2);

const CompletedJobInvoicePreview: React.FC<CompletedJobInvoicePreviewProps> = ({
  invoice,
  job,
  reviewData,
  compact = false,
}) => {
  const propertyAddress =
    reviewData?.propertyAddress || job.property.address.fullAddress;
  const serviceAddressLines = formatAddressLines(propertyAddress);
  const displayDates = buildInvoiceDisplayDates(invoice, reviewData);
  const attentionName = getAttentionName(reviewData);
  const reportStatus = getReportStatusLabel(reviewData, job);
  const authorisedBy = getWorksAuthorisedBy(reviewData);
  const invoiceNumber = buildInvoiceDocumentTitle(invoice.invoiceNumber);
  const recipientName = reviewData?.agencyName || job.agency?.name || "-";
  const description =
    invoice.description || job.jobType || "Completed job invoice";
  const secondaryLineItem = invoice.items.length > 1 ? invoice.items : [];

  return (
    <div
      className={`completed-job-invoice-preview ${
        compact ? "compact-preview" : ""
      }`}
    >
      <div className="invoice-header">
        <div className="company-block">
          <img
            src={COMPLETED_JOB_INVOICE_COMPANY.logoPath}
            alt="RentalEase"
            className="company-logo"
          />
          <div className="company-copy">
            <strong>{COMPLETED_JOB_INVOICE_COMPANY.name}</strong>
            <span>A.B.N : {COMPLETED_JOB_INVOICE_COMPANY.abn}</span>
            <span>{COMPLETED_JOB_INVOICE_COMPANY.addressLines[0]}</span>
            <span>{COMPLETED_JOB_INVOICE_COMPANY.addressLines[1]}</span>
            <span>{COMPLETED_JOB_INVOICE_COMPANY.phone}</span>
            <span>{COMPLETED_JOB_INVOICE_COMPANY.email}</span>
          </div>
        </div>

        <div className="invoice-meta">
          <span className="invoice-kicker">TAX INVOICE</span>
          <div className="invoice-number-row">
            <span>Invoice No:</span>
            <strong>{invoiceNumber}</strong>
          </div>
          <div className="invoice-number-row">
            <span>Invoice Date:</span>
            <strong>{displayDates.invoiceDateLabel}</strong>
          </div>
          <div className="invoice-number-row">
            <span>Due Date:</span>
            <strong>{displayDates.dueDateLabel}</strong>
          </div>
        </div>
      </div>

      <div className="recipient-grid">
        <div className="recipient-card">
          <strong>{recipientName}</strong>
          <span className="section-label">SERVICE ADDRESS</span>
          <div className="address-lines">
            {serviceAddressLines.map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </div>
          <span className="attention-line">For attention of: {attentionName}</span>
          <span className="authorised-line">{authorisedBy}</span>
        </div>

        <div className="summary-card">
          <span className="section-label">DESCRIPTION</span>
          <div className="summary-row">
            <span>{description}</span>
            <strong>{formatCurrency(invoice.totalCost)}</strong>
          </div>
          {secondaryLineItem.length > 0 && (
            <div className="line-item-list">
              {secondaryLineItem.slice(0, 4).map((item, index) => (
                <div key={item._id || item.id || index} className="line-item">
                  <span>{item.name}</span>
                  <span>
                    {formatQuantity(item.quantity)} x {formatCurrency(item.rate)}
                  </span>
                  <strong>{formatCurrency(item.amount)}</strong>
                </div>
              ))}
            </div>
          )}
          <div className="totals-stack">
            <div>
              <span>SUBTOTAL</span>
              <strong>{formatCurrency(invoice.subtotal)}</strong>
            </div>
            <div>
              <span>GST</span>
              <strong>{formatCurrency(invoice.tax)}</strong>
            </div>
            <div className="total-row">
              <span>TOTAL</span>
              <strong>{formatCurrency(invoice.totalCost)}</strong>
            </div>
          </div>
        </div>
      </div>

      <section className="pay-section">
        <h4>HOW TO PAY</h4>
        <p>We accept payment by: Bank transfer</p>

        <div className="bank-details">
          <div>
            <span>Bank Details:</span>
            <strong>Bank transfer</strong>
          </div>
          <div>
            <span>Name:</span>
            <strong>{COMPLETED_JOB_INVOICE_BANK_DETAILS.accountName}</strong>
          </div>
          <div>
            <span>Bank:</span>
            <strong>{COMPLETED_JOB_INVOICE_BANK_DETAILS.bankName}</strong>
          </div>
          <div>
            <span>BSB:</span>
            <strong>{COMPLETED_JOB_INVOICE_BANK_DETAILS.bsb}</strong>
          </div>
          <div>
            <span>Account Number:</span>
            <strong>{COMPLETED_JOB_INVOICE_BANK_DETAILS.accountNumber}</strong>
          </div>
          <div>
            <span>Payment Terms:</span>
            <strong>Payment terms are {COMPLETED_JOB_INVOICE_BANK_DETAILS.paymentTerms}</strong>
          </div>
        </div>
      </section>

      <section className="terms-section">
        <h4>Terms and conditions:</h4>
        {COMPLETED_JOB_INVOICE_TERMS.map((term, index) => (
          <p key={index}>
            {`${index + 1}. ${term}`}
          </p>
        ))}
      </section>

      {invoice.notes && (
        <section className="notes-section">
          <h4>Notes</h4>
          <p>{invoice.notes}</p>
        </section>
      )}

      <div className="footer-bar">
        <span>Generated by RentalEase CRM</span>
        <span>Generated on {formatInvoiceDate(new Date().toISOString())}</span>
        <span>Inspection report: {reportStatus}</span>
      </div>
    </div>
  );
};

export default CompletedJobInvoicePreview;
