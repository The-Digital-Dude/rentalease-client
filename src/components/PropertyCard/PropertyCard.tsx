import React from 'react';
import { RiEditLine, RiEyeLine } from 'react-icons/ri';
import TenantInfo from '../TenantInfo';
import LandlordInfo from '../LandlordInfo';
import { formatDateTime } from '../../utils';
import './PropertyCard.scss';

export interface Property {
  id: string;
  address: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  propertyManager: string;
  region: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
  createdDate: string;
  lastInspection?: string;
  nextInspection?: string;
  notes?: string;
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
  className = ''
}) => {
  return (
    <div className={`property-card ${className}`}>
      <div className="property-header">
        <div className="property-info">
          <h4>{property.address}</h4>
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
          <span>Manager:</span>
          <span>{property.propertyManager}</span>
        </div>
        {property.leaseStartDate && (
          <div className="detail-row">
            <span>Lease Start:</span>
            <span>{formatDateTime(property.leaseStartDate)}</span>
          </div>
        )}
        {property.leaseEndDate && (
          <div className="detail-row">
            <span>Lease End:</span>
            <span>{formatDateTime(property.leaseEndDate)}</span>
          </div>
        )}
      </div>

      {property.tenantName && (
        <TenantInfo tenant={{
          name: property.tenantName,
          email: property.tenantEmail || '',
          phone: property.tenantPhone || ''
        }} />
      )}

      {property.landlordName && (
        <LandlordInfo landlord={{
          name: property.landlordName,
          email: property.landlordEmail || '',
          phone: property.landlordPhone || ''
        }} />
      )}

      <div className="property-footer">
        <div className="property-dates">
          <small>Added: {formatDateTime(property.createdDate)}</small>
          {property.lastInspection && (
            <small>Last Inspection: {formatDateTime(property.lastInspection)}</small>
          )}
          {property.nextInspection && (
            <small>Next Inspection: {formatDateTime(property.nextInspection)}</small>
          )}
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

      {property.notes && (
        <div className="property-notes">
          <h5>Notes</h5>
          <p>{property.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PropertyCard; 