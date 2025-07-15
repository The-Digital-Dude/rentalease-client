import React from 'react';
import { RiEyeLine, RiDownloadLine, RiCalendarLine } from 'react-icons/ri';
import './BillingCard.scss';

export interface PropertyBilling {
  id: string;
  propertyAddress: string;
  propertyManager: string;
  totalOutstanding: number;
  monthlyRent: number;
  bondAmount: number;
  lastPaymentDate?: string;
  nextPaymentDue: string;
  paymentHistory: Array<{
    id: string;
    status: string;
  }>;
  tenantName?: string;
  leaseStatus: "Active" | "Expired" | "Pending" | "Terminated";
}

interface BillingCardProps {
  billing: PropertyBilling;
  onViewHistory?: (billing: PropertyBilling) => void;
  onDownloadStatement?: (billing: PropertyBilling) => void;
  className?: string;
}

const BillingCard: React.FC<BillingCardProps> = ({
  billing,
  onViewHistory,
  onDownloadStatement,
  className = ''
}) => {
  const getLeaseStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Expired":
        return "status-expired";
      case "Pending":
        return "status-pending";
      case "Terminated":
        return "status-terminated";
      default:
        return "status-default";
    }
  };

  return (
    <div className={`billing-card ${className}`}>
      <div className="billing-header">
        <div className="property-info">
          <h4>{billing.propertyAddress}</h4>
          <p className="property-manager">{billing.propertyManager}</p>
        </div>
        <div className="lease-status">
          <span className={`status-badge ${getLeaseStatusColor(billing.leaseStatus)}`}>
            {billing.leaseStatus}
          </span>
        </div>
      </div>

      <div className="billing-summary">
        <div className="summary-item outstanding">
          <span className="label">Outstanding Amount</span>
          <span className="value">${billing.totalOutstanding.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Monthly Rent</span>
          <span className="value">${billing.monthlyRent.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Bond Amount</span>
          <span className="value">${billing.bondAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="billing-details">
        <div className="detail-row">
          <span>Tenant:</span>
          <span>{billing.tenantName || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span>Next Payment Due:</span>
          <span className="due-date">
            <RiCalendarLine />
            {billing.nextPaymentDue}
          </span>
        </div>
        {billing.lastPaymentDate && (
          <div className="detail-row">
            <span>Last Payment:</span>
            <span>{billing.lastPaymentDate}</span>
          </div>
        )}
      </div>

      <div className="payment-history-summary">
        <h5>Recent Payments</h5>
        <div className="payment-count">
          <span>Total Payments: {billing.paymentHistory.length}</span>
          <span>
            Paid: {billing.paymentHistory.filter((p) => p.status === "Paid").length}
          </span>
          <span>
            Pending: {billing.paymentHistory.filter((p) => p.status === "Pending").length}
          </span>
        </div>
      </div>

      <div className="billing-actions">
        <button 
          className="action-btn view-btn"
          onClick={() => onViewHistory?.(billing)}
        >
          <RiEyeLine />
          View Full History
        </button>
        <button 
          className="action-btn download-btn"
          onClick={() => onDownloadStatement?.(billing)}
        >
          <RiDownloadLine />
          Download Statement
        </button>
      </div>
    </div>
  );
};

export default BillingCard; 