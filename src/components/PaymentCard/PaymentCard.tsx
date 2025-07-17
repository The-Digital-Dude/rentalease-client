import React from "react";
import {
  RiEyeLine,
  RiDownloadLine,
  RiCheckLine,
  RiAlertLine,
  RiCloseCircleLine,
} from "react-icons/ri";
import "./PaymentCard.scss";

export interface Payment {
  id: string;
  propertyAddress: string;
  propertyManager: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  paymentType: "Rent" | "Bond" | "Maintenance" | "Utilities" | "Other";
  description?: string;
  invoiceNumber: string;
  tenantName?: string;
  paymentMethod?: string;
  createdDate: string;
}

interface PaymentCardProps {
  payment: Payment;
  onView?: (payment: Payment) => void;
  onDownload?: (payment: Payment) => void;
  className?: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onView,
  onDownload,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Pending":
        return "status-pending";
      case "Overdue":
        return "status-overdue";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <RiCheckLine />;
      case "Pending":
        return <RiAlertLine />;
      case "Overdue":
        return <RiCloseCircleLine />;
      case "Cancelled":
        return <RiCloseCircleLine />;
      default:
        return <RiAlertLine />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "Rent":
        return "type-rent";
      case "Bond":
        return "type-bond";
      case "Maintenance":
        return "type-maintenance";
      case "Utilities":
        return "type-utilities";
      case "Other":
        return "type-other";
      default:
        return "type-default";
    }
  };

  return (
    <div className={`payment-card ${className}`}>
      <div className="payment-header">
        <div className="payment-info">
          <h4>{payment.propertyAddress}</h4>
          <p className="invoice-number">#{payment.invoiceNumber}</p>
        </div>
        <div className="payment-badges">
          <span className={`status-badge ${getStatusColor(payment.status)}`}>
            {getStatusIcon(payment.status)}
            {payment.status}
          </span>
          <span
            className={`type-badge ${getPaymentTypeColor(payment.paymentType)}`}
          >
            {payment.paymentType}
          </span>
        </div>
      </div>

      <div className="payment-details">
        <div className="detail-row">
          <span>Amount:</span>
          <span className="amount">${payment.amount.toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span>Due Date:</span>
          <span>{payment.dueDate}</span>
        </div>
        {payment.paidDate && (
          <div className="detail-row">
            <span>Paid Date:</span>
            <span>{payment.paidDate}</span>
          </div>
        )}
        <div className="detail-row">
          <span>Tenant:</span>
          <span>{payment.tenantName || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span>Agency:</span>
          <span>{payment.propertyManager}</span>
        </div>
        {payment.paymentMethod && (
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>{payment.paymentMethod}</span>
          </div>
        )}
      </div>

      {payment.description && (
        <div className="payment-description">
          <p>{payment.description}</p>
        </div>
      )}

      <div className="payment-actions">
        <button
          className="action-btn view-btn"
          onClick={() => onView?.(payment)}
        >
          <RiEyeLine />
          View Details
        </button>
        <button
          className="action-btn download-btn"
          onClick={() => onDownload?.(payment)}
        >
          <RiDownloadLine />
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default PaymentCard;
