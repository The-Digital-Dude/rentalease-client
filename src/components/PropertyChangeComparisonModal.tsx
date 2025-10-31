import React from "react";
import {
  RiCloseLine,
  RiHistoryLine,
  RiMailLine,
  RiPhoneLine,
  RiUser3Line,
} from "react-icons/ri";
import type {
  PropertyLog,
  PropertyLogSnapshot,
} from "../services/propertyService";
import { formatDateTime } from "../utils";
import "./PropertyChangeComparisonModal.scss";

interface PropertyChangeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: PropertyLog | null;
}

const PropertyChangeComparisonModal: React.FC<
  PropertyChangeComparisonModalProps
> = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  const renderStateSection = (
    state: PropertyLogSnapshot | undefined,
    title: string
  ) => {
    if (!state) {
      return (
        <div className="state-column">
          <h3 className="state-title">{title}</h3>
          <div className="empty-state">
            <p>No data available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="state-column">
        <h3 className="state-title">{title}</h3>

        {/* Agency Section */}
        {state.agency && (
          <div className="entity-card">
            <h4 className="entity-header">
              <RiUser3Line />
              Agency
            </h4>
            <div className="entity-content">
              <h5 className="entity-name">{state.agency.name}</h5>
              <div className="contact-details">
                {state.agency.email && (
                  <div className="entity-detail">
                    <RiMailLine />
                    <span>{state.agency.email}</span>
                  </div>
                )}
                {state.agency.phone && (
                  <div className="entity-detail">
                    <RiPhoneLine />
                    <span>{state.agency.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tenant Section */}
        {state.tenant && (
          <div className="entity-card">
            <h4 className="entity-header">
              <RiUser3Line />
              Tenant
            </h4>
            <div className="entity-content">
              <h5 className="entity-name">{state.tenant.name}</h5>
              <div className="contact-details">
                {state.tenant.email && (
                  <div className="entity-detail">
                    <RiMailLine />
                    <span>{state.tenant.email}</span>
                  </div>
                )}
                {state.tenant.phone && (
                  <div className="entity-detail">
                    <RiPhoneLine />
                    <span>{state.tenant.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Landlord Section */}
        {state.landlord && (
          <div className="entity-card">
            <h4 className="entity-header">
              <RiUser3Line />
              Landlord
            </h4>
            <div className="entity-content">
              <h5 className="entity-name">{state.landlord.name}</h5>
              <div className="contact-details">
                {state.landlord.email && (
                  <div className="entity-detail">
                    <RiMailLine />
                    <span>{state.landlord.email}</span>
                  </div>
                )}
                {state.landlord.phone && (
                  <div className="entity-detail">
                    <RiPhoneLine />
                    <span>{state.landlord.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Property Manager Section */}
        {state.propertyManager && (
          <div className="entity-card">
            <h4 className="entity-header">
              <RiUser3Line />
              Property Manager
            </h4>
            <div className="entity-content">
              <h5 className="entity-name">{state.propertyManager.name}</h5>
              <div className="contact-details">
                {state.propertyManager.email && (
                  <div className="entity-detail">
                    <RiMailLine />
                    <span>{state.propertyManager.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show message if no entities */}
        {!state.agency &&
          !state.tenant &&
          !state.landlord &&
          !state.propertyManager && (
            <div className="empty-state">
              <p>No entity information available</p>
            </div>
          )}
      </div>
    );
  };

  const renderComparison = () => {
    const oldState = log.oldState;
    const newState = log.newState;

    if (!oldState && !newState) {
      return (
        <div className="empty-state">
          <p>No state comparison data available.</p>
        </div>
      );
    }

    return (
      <div className="comparison-container">
        {renderStateSection(oldState, "Previous State")}
        {renderStateSection(newState, "Updated State")}
      </div>
    );
  };

  const getChangeTypeLabel = (changeType: string) => {
    const typeLabels: { [key: string]: string } = {
      property_created: "Property Created",
      agency_changed: "Agency Changed",
      tenant_changed: "Tenant Changed",
      landlord_changed: "Landlord Changed",
      property_manager_changed: "Property Manager Changed",
      address_changed: "Address Changed",
      compliance_updated: "Compliance Updated",
      property_type_changed: "Property Type Changed",
      region_changed: "Region Changed",
      notes_updated: "Notes Updated",
    };

    return typeLabels[changeType] || changeType;
  };

  return (
    <div className="property-change-comparison-overlay" onClick={onClose}>
      <div
        className="property-change-comparison-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <RiHistoryLine />
            <div>
              <h2>Updated by {log.changedBy.userName}</h2>
              <p className="change-metadata">
                {log.changedBy.userType} at {formatDateTime(log.createdAt)}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <div className="modal-content">{renderComparison()}</div>
      </div>
    </div>
  );
};

export default PropertyChangeComparisonModal;
