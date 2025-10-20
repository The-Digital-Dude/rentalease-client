import React from "react";
import {
  RiEditLine,
  RiMapPinLine,
  RiBuildingLine,
  RiUserLine,
  RiTeamLine,
  RiMailLine,
  RiPhoneLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import "./PropertyCard.scss";

export interface PropertyContact {
  name?: string;
  email?: string;
  phone?: string;
}

export interface PropertyAgency {
  _id?: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export interface ComplianceStatus {
  status?: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
  nextInspection?: string;
}

export interface Property {
  id: string;
  address: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    fullAddress?: string;
  };
  fullAddress?: string;
  propertyType?: string;
  region?: string;
  agency?: PropertyAgency;
  propertyManager?: string;
  assignedPropertyManager?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  bedrooms?: number;
  currentTenant?: PropertyContact;
  currentLandlord?: PropertyContact;
  complianceSchedule?: {
    gasCompliance?: ComplianceStatus;
    electricalSafety?: ComplianceStatus;
    smokeAlarms?: ComplianceStatus;
    minimumSafetyStandard?: ComplianceStatus;
  };
  complianceSummary?: {
    compliant?: number;
    dueSoon?: number;
    overdue?: number;
    total?: number;
    complianceScore?: number;
  };
  hasOverdueCompliance?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  const {
    address,
    fullAddress,
    propertyType,
    region,
    agency,
    assignedPropertyManager,
    currentTenant,
    currentLandlord,
    complianceSchedule,
    complianceSummary,
    hasOverdueCompliance,
  } = property;

  const resolvedAddress =
    fullAddress ||
    address?.fullAddress ||
    [address?.street, address?.suburb, address?.state, address?.postcode]
      .filter(Boolean)
      .join(", ");

  const handleCardClick = () => {
    if (onView) {
      onView(property);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(property);
    }
  };

  const complianceCounts = React.useMemo(() => {
    if (complianceSummary) {
      return {
        compliant: complianceSummary.compliant ?? 0,
        dueSoon: complianceSummary.dueSoon ?? 0,
        overdue: complianceSummary.overdue ?? 0,
      };
    }

    const statuses = [
      complianceSchedule?.gasCompliance?.status,
      complianceSchedule?.electricalSafety?.status,
      complianceSchedule?.smokeAlarms?.status,
      complianceSchedule?.minimumSafetyStandard?.status,
    ].filter(Boolean) as Array<ComplianceStatus["status"]>;

    return statuses.reduce(
      (acc, status) => {
        if (status === "Overdue") acc.overdue += 1;
        else if (status === "Due Soon") acc.dueSoon += 1;
        else if (status === "Compliant") acc.compliant += 1;
        return acc;
      },
      { compliant: 0, dueSoon: 0, overdue: 0 }
    );
  }, [complianceSchedule, complianceSummary]);

  const canView = Boolean(onView);

  const buildContact = (contact?: PropertyContact) => {
    if (!contact) return null;
    return (
      <div className="property-card__contact-details">
        <strong>{contact.name || "Not provided"}</strong>
        <div className="property-card__contact-row">
          <RiMailLine />
          <span>{contact.email || "—"}</span>
        </div>
        <div className="property-card__contact-row">
          <RiPhoneLine />
          <span>{contact.phone || "—"}</span>
        </div>
      </div>
    );
  };

  const managerName = assignedPropertyManager
    ? `${assignedPropertyManager.firstName ?? ""} ${assignedPropertyManager.lastName ?? ""}`.trim()
    : undefined;

  const cardClasses = [
    "property-card",
    className,
    canView ? "clickable" : "",
    hasOverdueCompliance ? "has-issue" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClasses}
      onClick={canView ? handleCardClick : undefined}
      onKeyDown={canView ? handleKeyPress : undefined}
      role={canView ? "button" : undefined}
      tabIndex={canView ? 0 : -1}
    >
      <div className="property-card__header">
        <div className="property-card__summary">
          <h4>{resolvedAddress || "Property"}</h4>
          {propertyType && <p className="property-card__type">{propertyType}</p>}
        </div>
        {showActions && onEdit && (
          <button
            type="button"
            className="property-card__action"
            onClick={handleEditClick}
          >
            <RiEditLine />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="property-card__meta">
        <div className="property-card__meta-item">
          <span className="property-card__meta-label">
            <RiMapPinLine /> Region
          </span>
          <span className="property-card__meta-value">{region || "Not specified"}</span>
        </div>
        <div className="property-card__meta-item">
          <span className="property-card__meta-label">
            <RiBuildingLine /> Agency
          </span>
          <span className="property-card__meta-value">
            {agency?.companyName || "Not assigned"}
          </span>
        </div>
        <div className="property-card__meta-item">
          <span className="property-card__meta-label">
            <RiTeamLine /> Manager
          </span>
          <span className="property-card__meta-value">
            {managerName || "Not assigned"}
          </span>
        </div>
      </div>

      <div className="property-card__contacts">
        <div className="property-card__contact">
          <span className="property-card__meta-label">
            <RiUserLine /> Tenant
          </span>
          {buildContact(currentTenant) || <span className="property-card__empty">Not provided</span>}
        </div>
        <div className="property-card__contact">
          <span className="property-card__meta-label">
            <RiUserLine /> Landlord
          </span>
          {buildContact(currentLandlord) || <span className="property-card__empty">Not provided</span>}
        </div>
      </div>

      <div className="property-card__compliance">
        <div className="property-card__compliance-header">
          <RiShieldCheckLine />
          <span>Compliance overview</span>
        </div>
        <div className="property-card__compliance-badges">
          <span className={`property-card__badge ${complianceCounts.overdue ? "property-card__badge--overdue" : ""}`}>
            Overdue: {complianceCounts.overdue}
          </span>
          <span className={`property-card__badge ${complianceCounts.dueSoon ? "property-card__badge--due" : ""}`}>
            Due soon: {complianceCounts.dueSoon}
          </span>
          <span className="property-card__badge property-card__badge--ok">
            Compliant: {complianceCounts.compliant}
          </span>
        </div>
        {hasOverdueCompliance && (
          <div className="property-card__alert">Compliance attention required</div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
