import React, { useState } from "react";
import {
  RiEditLine,
  RiDeleteBin6Line,
  RiMailSendLine,
  RiEyeLine,
  RiVipCrown2Line,
  RiShieldCheckLine,
  RiMailLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import type { Agency } from "../../services/agencyService";
import "./AgencyCard.scss";

interface AgencyCardProps {
  agency: Agency;
  onEdit: (agency: Agency) => void;
  onDelete: (id: string) => void;
  onResendCredentials: (id: string) => void;
  onSendEmail: (agency: Agency) => void;
}

const AgencyCard: React.FC<AgencyCardProps> = ({
  agency,
  onEdit,
  onDelete,
  onResendCredentials,
  onSendEmail,
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCredentialsConfirm, setShowCredentialsConfirm] = useState(false);

  // Format subscription status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get CSS class for subscription status
  const getStatusClass = (status: string) => {
    return status.replace(/_/g, '-');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(agency.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleResendCredentialsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCredentialsConfirm(true);
  };

  const handleConfirmResendCredentials = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResendCredentials(agency.id);
    setShowCredentialsConfirm(false);
  };

  const handleCancelResendCredentials = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCredentialsConfirm(false);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/agencies/${agency.id}`);
  };

  const handleSendEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSendEmail(agency);
  };

  return (
    <div className="agency-card">
      <div className="agency-header">
        <h3>{agency.name}</h3>
        <div className="agency-actions">
          <span className={`status-badge ${agency.status}`}>
            {agency.status}
          </span>
          <button
            className="view-btn"
            onClick={handleViewProfile}
            title="View Agency Profile"
          >
            <RiEyeLine />
          </button>
          <button
            className="credentials-btn"
            onClick={handleResendCredentialsClick}
            title="Send Credentials Email"
          >
            <RiMailSendLine />
          </button>
          <button
            className="delete-btn"
            onClick={handleDeleteClick}
            title="Delete Agency"
          >
            <RiDeleteBin6Line />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <p>
            Are you sure you want to delete <strong>{agency.name}</strong>?
          </p>
          <div className="confirmation-actions">
            <button className="btn-danger btn-sm" onClick={handleConfirmDelete}>
              Yes, Delete
            </button>
            <button
              className="btn-secondary btn-sm"
              onClick={handleCancelDelete}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCredentialsConfirm && (
        <div className="credentials-confirmation">
          <div className="confirmation-header">
            <RiMailSendLine className="confirmation-icon" />
            <h4>Resend Credentials</h4>
          </div>
          <p>
            Are you sure you want to resend credentials to{" "}
            <strong>{agency.name}</strong>?
          </p>
          <div className="warning-message">
            <strong>⚠️ Warning:</strong> This will generate a new password and
            the current password will no longer work.
          </div>
          <div className="confirmation-actions">
            <button
              className="btn-primary btn-sm"
              onClick={handleConfirmResendCredentials}
            >
              Yes, Send New Credentials
            </button>
            <button
              className="btn-secondary btn-sm"
              onClick={handleCancelResendCredentials}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="agency-details">
        <div className="detail-group">
          <div className="detail-item">
            <span className="label">ABN</span>
            <span>{agency.abn}</span>
          </div>
          <div className="detail-item">
            <span className="label">Contact</span>
            <span>{agency.contactPerson}</span>
          </div>
        </div>
        <div className="detail-group">
          <div className="detail-item">
            <span className="label">Email</span>
            <span>{agency.contactEmail}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phone</span>
            <span>{agency.contactPhone}</span>
          </div>
        </div>
        <div className="detail-group">
          <div className="detail-item">
            <span className="label">Region</span>
            <span>{agency.region}</span>
          </div>
          <div className="detail-item">
            <span className="label">Compliance</span>
            <span>{agency.complianceLevel}</span>
          </div>
        </div>
      </div>

      <div className="agency-footer">
        <div className="subscription-info">
          {agency.subscription ? (
            <div className="subscription-status">
              <div className={`subscription-badge ${agency.subscription.planType} ${getStatusClass(agency.subscription.status)}`}>
                <RiVipCrown2Line className="subscription-icon" />
                <span>{formatStatus(agency.subscription.planType)} Plan - {formatStatus(agency.subscription.status)}</span>
              </div>
            </div>
          ) : (
            <div className="no-subscription">
              <RiShieldCheckLine className="no-sub-icon" />
              <span className="no-sub-text">No Subscription</span>
            </div>
          )}
        </div>
        <div className="footer-actions">
          <button
            className="btn-email"
            onClick={handleSendEmail}
            title="Send Email to Agency"
          >
            <RiMailLine />
            Email
          </button>
          <button
            className="btn-secondary"
            onClick={() => onEdit(agency)}
            title="Edit Agency"
          >
            <RiEditLine />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgencyCard;
