import React, { useState } from "react";
import {
  MdClose,
  MdBusiness,
  MdHome,
  MdWork,
  MdCalendarToday,
  MdAttachMoney,
  MdDescription,
  MdSchedule,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdWarning,
  MdDownload,
} from "react-icons/md";
import { toast } from "react-toastify";
import { downloadQuotationPDF } from "../../utils/quotationPdfGenerator";
import "./QuotationDetailsModal.scss";

interface QuotationDetailsModalProps {
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
    createdAt: string;
    sentAt?: string;
    respondedAt?: string;
    agencyResponse?: {
      responseNotes?: string;
      responseDate?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export const QuotationDetailsModal: React.FC<QuotationDetailsModalProps> = ({
  quotation,
  isOpen,
  onClose,
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      await downloadQuotationPDF(quotation);
      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Sent":
        return <MdAccessTime className="status-icon sent" />;
      case "Accepted":
        return <MdCheckCircle className="status-icon accepted" />;
      case "Rejected":
        return <MdCancel className="status-icon rejected" />;
      case "Expired":
        return <MdWarning className="status-icon expired" />;
      default:
        return <MdSchedule className="status-icon draft" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Sent":
        return "status-sent";
      case "Accepted":
        return "status-accepted";
      case "Rejected":
        return "status-rejected";
      case "Expired":
        return "status-expired";
      default:
        return "status-draft";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpired = quotation.validUntil && new Date(quotation.validUntil) < new Date();
  const daysUntilDue = getDaysUntilDue(quotation.dueDate);
  const isUrgent = daysUntilDue <= 3;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quotation-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-title">
              <h2>Quotation Details</h2>
              <div className={`status-badge ${getStatusClass(quotation.status)}`}>
                {getStatusIcon(quotation.status)}
                <span>{quotation.status}</span>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="download-btn"
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
              >
                <MdDownload />
                {downloadingPdf ? "Downloading..." : "Download PDF"}
              </button>
              <button className="close-button" onClick={onClose}>
                <MdClose />
              </button>
            </div>
          </div>
          <div className="quotation-number">
            <span>#{quotation.quotationNumber}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            {/* Agency Information */}
            <div className="detail-section">
              <div className="section-header">
                <MdBusiness className="section-icon" />
                <h3>Agency Information</h3>
              </div>
              <div className="section-content">
                <div className="detail-item">
                  <label>Agency Name</label>
                  <span>
                    {typeof quotation.agency === 'object' && quotation.agency !== null
                      ? (quotation.agency.companyName || quotation.agency.contactPerson || quotation.agency.email || 'Unknown Agency')
                      : quotation.agency || 'Unknown Agency'}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="detail-section">
              <div className="section-header">
                <MdHome className="section-icon" />
                <h3>Property Information</h3>
              </div>
              <div className="section-content">
                <div className="detail-item">
                  <label>Property Address</label>
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
                {typeof quotation.property === 'object' && quotation.property.title && (
                  <div className="detail-item">
                    <label>Property Title</label>
                    <span>{quotation.property.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Information */}
            <div className="detail-section">
              <div className="section-header">
                <MdWork className="section-icon" />
                <h3>Service Information</h3>
              </div>
              <div className="section-content">
                <div className="detail-item">
                  <label>Service Type</label>
                  <span>{quotation.jobType}</span>
                </div>
                <div className="detail-item">
                  <label>Description</label>
                  <span className="description-text">{quotation.description}</span>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="detail-section">
              <div className="section-header">
                <MdCalendarToday className="section-icon" />
                <h3>Timeline</h3>
              </div>
              <div className="section-content">
                <div className="detail-item">
                  <label>Due Date</label>
                  <span className={isUrgent ? "urgent-date" : ""}>
                    {formatDateShort(quotation.dueDate)}
                    {isUrgent && (
                      <span className="urgency-indicator">
                        {daysUntilDue > 0 ? ` (${daysUntilDue} days left)` : " (Overdue)"}
                      </span>
                    )}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Created</label>
                  <span>{formatDate(quotation.createdAt)}</span>
                </div>
                {quotation.sentAt && (
                  <div className="detail-item">
                    <label>Sent to Agency</label>
                    <span>{formatDate(quotation.sentAt)}</span>
                  </div>
                )}
                {quotation.respondedAt && (
                  <div className="detail-item">
                    <label>Agency Response</label>
                    <span>{formatDate(quotation.respondedAt)}</span>
                  </div>
                )}
                {quotation.validUntil && (
                  <div className="detail-item">
                    <label>Valid Until</label>
                    <span className={isExpired ? "expired-date" : ""}>
                      {formatDateShort(quotation.validUntil)}
                      {isExpired && <span className="expired-indicator"> (Expired)</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Information */}
            {quotation.amount && (
              <div className="detail-section">
                <div className="section-header">
                  <MdAttachMoney className="section-icon" />
                  <h3>Pricing</h3>
                </div>
                <div className="section-content">
                  <div className="detail-item">
                    <label>Quoted Amount</label>
                    <span className="amount-display">
                      {formatCurrency(quotation.amount)}
                    </span>
                  </div>
                  {quotation.notes && (
                    <div className="detail-item">
                      <label>Pricing Notes</label>
                      <span className="notes-text">{quotation.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Agency Response */}
            {quotation.agencyResponse?.responseNotes && (
              <div className="detail-section">
                <div className="section-header">
                  <MdDescription className="section-icon" />
                  <h3>Agency Response</h3>
                </div>
                <div className="section-content">
                  <div className="detail-item">
                    <label>Response Notes</label>
                    <span className="response-notes">
                      {quotation.agencyResponse.responseNotes}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="status-timeline">
            <h3>Status Timeline</h3>
            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Request Created</div>
                  <div className="timeline-date">{formatDate(quotation.createdAt)}</div>
                </div>
              </div>
              {quotation.sentAt && (
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">Sent to Agency</div>
                    <div className="timeline-date">{formatDate(quotation.sentAt)}</div>
                  </div>
                </div>
              )}
              {quotation.respondedAt && (
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-title">
                      Agency {quotation.status === "Accepted" ? "Accepted" : "Rejected"}
                    </div>
                    <div className="timeline-date">{formatDate(quotation.respondedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsModal;