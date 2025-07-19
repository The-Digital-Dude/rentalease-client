import React from "react";
import { RiEditLine, RiEyeLine } from "react-icons/ri";
import { formatDateTime } from "../../utils";
import "./PropertyCard.scss";

export interface Property {
  id: string;
  address: {
    street: string;
    suburb: string;
    state: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "NT" | "ACT";
    postcode: string;
    fullAddress: string;
  };
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  agency: {
    _id: string;
    companyName: string;
    contactPerson: string;
    email?: string;
    phone?: string;
  };
  region:
    | "Sydney Metro"
    | "Melbourne Metro"
    | "Brisbane Metro"
    | "Perth Metro"
    | "Adelaide Metro"
    | "Darwin Metro"
    | "Hobart Metro"
    | "Canberra Metro"
    | "Regional NSW"
    | "Regional VIC"
    | "Regional QLD"
    | "Regional WA"
    | "Regional SA"
    | "Regional NT"
    | "Regional TAS";
  currentTenant?: {
    name: string;
    email: string;
    phone: string;
  };
  currentLandlord?: {
    name: string;
    email: string;
    phone: string;
  };
  complianceSchedule: {
    gasCompliance: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
    electricalSafety: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
    smokeAlarms: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
    poolSafety: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onView?: (property: Property) => void;
  showActions?: boolean;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onView,
  showActions = true,
  className = "",
}) => {
  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "compliant";
      case "Due Soon":
        return "due-soon";
      case "Overdue":
        return "overdue";
      case "Not Required":
        return "not-required";
      default:
        return "default";
    }
  };

  return (
    <div className={`property-card ${className}`}>
      <div className="property-header">
        <div className="property-info">
          <h4>{property.address.fullAddress}</h4>
          <p className="property-type">{property.propertyType}</p>
        </div>
        {showActions && (
          <div className="property-quick-actions">
            {onView && (
              <button
                className="quick-action-btn view"
                onClick={() => onView(property)}
                title="View Details"
              >
                <RiEyeLine />
              </button>
            )}
            {onEdit && (
              <button
                className="quick-action-btn edit"
                onClick={() => onEdit(property)}
                title="Edit Property"
              >
                <RiEditLine />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="property-details">
        <div className="detail-row">
          <span>Region:</span>
          <span>{property.region}</span>
        </div>
        <div className="detail-row">
          <span>Agency:</span>
          <span>{property.agency?.companyName || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span>Tenant:</span>
          <span>{property.currentTenant?.name || "Vacant"}</span>
        </div>
        <div className="detail-row">
          <span>Landlord:</span>
          <span>{property.currentLandlord?.name || "N/A"}</span>
        </div>
      </div>

      <div className="compliance-section">
        <h5>Compliance Status</h5>
        <div className="compliance-items">
          <div
            className={`compliance-item ${getComplianceStatusColor(
              property.complianceSchedule.gasCompliance.status
            )}`}
          >
            <span className="compliance-type">Gas</span>
            <span className="compliance-status">
              {property.complianceSchedule.gasCompliance.status}
            </span>
            {property.complianceSchedule.gasCompliance.nextInspection && (
              <span className="compliance-date">
                {formatDateTime(
                  property.complianceSchedule.gasCompliance.nextInspection
                )}
              </span>
            )}
          </div>
          <div
            className={`compliance-item ${getComplianceStatusColor(
              property.complianceSchedule.electricalSafety.status
            )}`}
          >
            <span className="compliance-type">Electrical</span>
            <span className="compliance-status">
              {property.complianceSchedule.electricalSafety.status}
            </span>
            {property.complianceSchedule.electricalSafety.nextInspection && (
              <span className="compliance-date">
                {formatDateTime(
                  property.complianceSchedule.electricalSafety.nextInspection
                )}
              </span>
            )}
          </div>
          <div
            className={`compliance-item ${getComplianceStatusColor(
              property.complianceSchedule.smokeAlarms.status
            )}`}
          >
            <span className="compliance-type">Smoke</span>
            <span className="compliance-status">
              {property.complianceSchedule.smokeAlarms.status}
            </span>
            {property.complianceSchedule.smokeAlarms.nextInspection && (
              <span className="compliance-date">
                {formatDateTime(
                  property.complianceSchedule.smokeAlarms.nextInspection
                )}
              </span>
            )}
          </div>
          {property.complianceSchedule.poolSafety.required && (
            <div
              className={`compliance-item ${getComplianceStatusColor(
                property.complianceSchedule.poolSafety.status
              )}`}
            >
              <span className="compliance-type">Pool Safety</span>
              <span className="compliance-status">
                {property.complianceSchedule.poolSafety.status}
              </span>
              {property.complianceSchedule.poolSafety.nextInspection && (
                <span className="compliance-date">
                  {formatDateTime(
                    property.complianceSchedule.poolSafety.nextInspection
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {showActions && (onEdit || onView) && (
        <div className="property-actions">
          {onView && (
            <button
              className="action-btn view-btn"
              onClick={() => onView(property)}
            >
              <RiEyeLine />
              View Details
            </button>
          )}
          {onEdit && (
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(property)}
            >
              <RiEditLine />
              Edit Property
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
