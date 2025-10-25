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
  MdNoteAlt,
  MdInfo,
  MdAttachFile,
  MdOpenInNew,
} from "react-icons/md";
import { toast } from "react-toastify";
import quotationService from "../../services/quotationService";
import { downloadQuotationPDF } from "../../utils/quotationPdfGenerator";
import "./QuotationViewModal.scss";

interface QuotationViewModalProps {
  quotation: {
    _id: string;
    quotationNumber: string;
    agency: {
      _id: string;
      companyName?: string;
      email?: string;
      contactPerson?: string;
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
    attachments?: Array<{
      _id: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
      cloudinaryId: string;
      uploadedAt: string;
    }>;
    agencyResponse?: {
      responseNotes?: string;
      responseDate?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuotationViewModal: React.FC<QuotationViewModalProps> = ({
  quotation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [responseNotes, setResponseNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Debug: Log quotation data to check if attachments are present
  React.useEffect(() => {
    if (isOpen && quotation) {
      console.log('Quotation data:', quotation);
      console.log('Attachments:', quotation.attachments);
      console.log('Has attachments:', quotation.attachments && quotation.attachments.length > 0);
    }
  }, [isOpen, quotation]);

  if (!isOpen) return null;

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
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

  const getDaysUntilExpiry = (validUntil: string) => {
    const expiry = new Date(validUntil);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPropertyAddress = (property: any): string => {
    if (typeof property === 'string') return 'Unknown Property';
    if (!property) return 'Unknown Property';

    if (property.fullAddress) return property.fullAddress;

    if (typeof property.address === 'string') return property.address;

    if (property.address && typeof property.address === 'object') {
      if (property.address.fullAddress) return property.address.fullAddress;
      const { street, suburb, state, postcode } = property.address;
      if (street && suburb && state && postcode) {
        return `${street}, ${suburb}, ${state} ${postcode}`;
      }
    }

    return 'Unknown Property';
  };

  const hasQuotedAmount = typeof quotation.amount === "number" && quotation.amount > 0;
  const isExpired = quotation.validUntil && new Date(quotation.validUntil) < new Date();
  const daysUntilDue = getDaysUntilDue(quotation.dueDate);
  const daysUntilExpiry = quotation.validUntil ? getDaysUntilExpiry(quotation.validUntil) : null;
  const isUrgent = daysUntilDue <= 3;
  const isNearExpiry = daysUntilExpiry !== null && daysUntilExpiry <= 2;
  const canRespond = quotation.status === "Sent" && !isExpired && hasQuotedAmount;
  const isAwaitingPricing = quotation.status === "Sent" && !isExpired && !hasQuotedAmount;

  const handleAccept = async () => {
    if (isExpired) {
      toast.error("This quotation has expired and cannot be accepted");
      return;
    }

    setLoading(true);
    try {
      await quotationService.respondToQuotation(quotation._id, {
        action: "accept",
        responseNotes: responseNotes || undefined,
      });

      toast.success("Quotation accepted successfully!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!responseNotes.trim()) {
      toast.error("Please provide a reason for rejecting this quotation");
      return;
    }

    setLoading(true);
    try {
      await quotationService.respondToQuotation(quotation._id, {
        action: "reject",
        responseNotes: responseNotes,
      });

      toast.success("Quotation rejected");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject quotation");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quotation-view-modal" onClick={(e) => e.stopPropagation()}>
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
          {/* Warning banners */}
          {isExpired && (
            <div className="warning-banner expired">
              <MdWarning />
              <div>
                <strong>Quotation Expired:</strong> This quotation expired on{" "}
                {formatDateShort(quotation.validUntil!)} and can no longer be accepted.
              </div>
            </div>
          )}

          {!isExpired && isNearExpiry && (
            <div className="warning-banner near-expiry">
              <MdWarning />
              <div>
                <strong>Expires Soon:</strong> This quotation expires{" "}
                {daysUntilExpiry === 0 ? "today" : `in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`}.
                Please respond promptly.
              </div>
            </div>
          )}

          {isUrgent && (
            <div className="warning-banner urgent">
              <MdWarning />
              <div>
                <strong>Urgent Service:</strong> This service is due{" "}
                {daysUntilDue > 0 ? `in ${daysUntilDue} days` : "overdue"}.
              </div>
            </div>
          )}

          {isAwaitingPricing && (
            <div className="warning-banner info">
              <MdInfo />
              <div>
                <strong>Awaiting Pricing:</strong> This quotation does not yet have a
                confirmed amount. Please contact the admin team to finalise pricing
                before accepting or rejecting.
              </div>
            </div>
          )}

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
                  <span>{getPropertyAddress(quotation.property)}</span>
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

            {/* Attachments Section */}
            {quotation.attachments && quotation.attachments.length > 0 && (
              <div className="detail-section attachments-section">
                <div className="section-header">
                  <MdAttachFile className="section-icon" />
                  <h3>Attachments ({quotation.attachments.length})</h3>
                </div>
                <div className="section-content">
                  <div className="attachments-list">
                    {quotation.attachments.map((attachment) => (
                      <div key={attachment._id} className="attachment-item">
                        <div className="attachment-info">
                          <span className="file-icon">{getFileIcon(attachment.mimeType)}</span>
                          <div className="file-details">
                            <span className="file-name">{attachment.fileName}</span>
                            <span className="file-meta">
                              {formatFileSize(attachment.fileSize)} • {formatDateShort(attachment.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                          title="View attachment"
                        >
                          <MdOpenInNew />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
              <div className="detail-section pricing-section">
                <div className="section-header">
                  <MdAttachMoney className="section-icon" />
                  <h3>Pricing</h3>
                </div>
                <div className="section-content">
                  <div className="pricing-display">
                    <div className="amount-large">
                      {formatCurrency(quotation.amount)}
                    </div>
                    <div className="amount-label">Quoted Amount (AUD)</div>
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
          </div>

          {/* Response Section */}
          {canRespond && (
            <div className="response-section">
              <h3>
                <MdNoteAlt />
                Your Response
              </h3>
              <div className="response-form">
                <div className="form-group">
                  <label htmlFor="responseNotes">
                    Response Notes (Optional for acceptance, required for rejection)
                  </label>
                  <textarea
                    id="responseNotes"
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Add any notes about your decision, requirements, or questions..."
                    rows={4}
                    maxLength={500}
                    disabled={loading}
                  />
                  <div className="character-count">
                    {responseNotes.length}/500 characters
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agency Response (if already responded) */}
          {quotation.agencyResponse?.responseNotes && (
            <div className="response-section">
              <h3>
                <MdDescription />
                Previous Response
              </h3>
              <div className="response-display">
                {quotation.respondedAt && (
                  <div className="response-date">
                    Responded on {formatDate(quotation.respondedAt)}
                  </div>
                )}
                <div className="response-notes">
                  {quotation.agencyResponse.responseNotes}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {canRespond ? (
            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleReject}
                disabled={loading}
              >
                <MdCancel />
                {loading ? "Rejecting..." : "Reject"}
              </button>
              <button
                className="btn-success"
                onClick={handleAccept}
                disabled={loading}
              >
                <MdCheckCircle />
                {loading ? "Accepting..." : "Accept Quotation"}
              </button>
            </div>
          ) : (
            <div className="close-only">
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationViewModal;
