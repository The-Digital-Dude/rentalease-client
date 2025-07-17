import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiHomeLine,
  RiUser3Line,
  RiShieldCheckLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
} from "react-icons/ri";
import propertyService from "../../services/propertyService";
import type { Property } from "../../services/propertyService";
import { formatDateTime } from "../../utils";
import "./PropertyProfile.scss";

const PropertyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await propertyService.getProperty(id);
        if (response.status === "success") {
          setProperty(response.data.property);
        } else {
          setError(response.message || "Failed to load property");
        }
      } catch (error: any) {
        console.error("Error loading property:", error);
        setError(error.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

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

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit property:", property?.id);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Error Loading Property</h2>
          <p>{error || "Property not found"}</p>
          <button onClick={handleBack} className="btn btn-primary">
            <RiArrowLeftLine />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container property-profile-page">
      {/* Header */}
      <div className="profile-header">
        <button onClick={handleBack} className="back-btn">
          <RiArrowLeftLine />
          Back
        </button>
        <div className="header-content">
          <h1>{property.address.fullAddress}</h1>
          <p className="property-type">{property.propertyType}</p>
        </div>
        <button onClick={handleEdit} className="edit-btn">
          <RiEditLine />
          Edit Property
        </button>
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <h2>
            <RiHomeLine />
            Property Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Address</label>
              <p>{property.address.fullAddress}</p>
            </div>
            <div className="info-item">
              <label>Property Type</label>
              <p>{property.propertyType}</p>
            </div>
            <div className="info-item">
              <label>Region</label>
              <p>{property.region}</p>
            </div>
            <div className="info-item">
              <label>Status</label>
              <p
                className={`status ${
                  property.currentTenant ? "occupied" : "vacant"
                }`}
              >
                {property.currentTenant ? "Occupied" : "Vacant"}
              </p>
            </div>
          </div>
        </div>

        {/* Property Manager */}
        <div className="profile-section">
          <h2>
            <RiUser3Line />
            Property Manager
          </h2>
          <div className="contact-card">
            <div className="contact-info">
              <h3>{property.propertyManager.companyName}</h3>
              <p className="contact-person">
                {property.propertyManager.contactPerson}
              </p>
              <div className="contact-details">
                <div className="contact-item">
                  <RiMailLine />
                  <span>{property.propertyManager.email}</span>
                </div>
                <div className="contact-item">
                  <RiPhoneLine />
                  <span>{property.propertyManager.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Information */}
        {property.currentTenant && (
          <div className="profile-section">
            <h2>
              <RiUser3Line />
              Current Tenant
            </h2>
            <div className="contact-card">
              <div className="contact-info">
                <h3>{property.currentTenant.name}</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <RiMailLine />
                    <span>{property.currentTenant.email}</span>
                  </div>
                  <div className="contact-item">
                    <RiPhoneLine />
                    <span>{property.currentTenant.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Landlord Information */}
        {property.currentLandlord && (
          <div className="profile-section">
            <h2>
              <RiUser3Line />
              Landlord
            </h2>
            <div className="contact-card">
              <div className="contact-info">
                <h3>{property.currentLandlord.name}</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <RiMailLine />
                    <span>{property.currentLandlord.email}</span>
                  </div>
                  <div className="contact-item">
                    <RiPhoneLine />
                    <span>{property.currentLandlord.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Schedule */}
        <div className="profile-section">
          <h2>
            <RiShieldCheckLine />
            Compliance Schedule
          </h2>
          <div className="compliance-grid">
            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.gasCompliance?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Gas Compliance</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.gasCompliance?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.gasCompliance?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.gasCompliance?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.gasCompliance.nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.electricalSafety?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Electrical Safety</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.electricalSafety?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.electricalSafety?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.electricalSafety
                ?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.electricalSafety
                        .nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.smokeAlarms?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Smoke Alarms</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.smokeAlarms?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.smokeAlarms?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.smokeAlarms?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.smokeAlarms.nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            {property.complianceSchedule?.poolSafety?.required && (
              <div
                className={`compliance-card ${getComplianceStatusColor(
                  property.complianceSchedule?.poolSafety?.status ||
                    "Not Required"
                )}`}
              >
                <h3>Pool Safety</h3>
                <div className="compliance-status">
                  <span
                    className={`status-badge ${getComplianceStatusColor(
                      property.complianceSchedule?.poolSafety?.status ||
                        "Not Required"
                    )}`}
                  >
                    {property.complianceSchedule?.poolSafety?.status ||
                      "Not Required"}
                  </span>
                </div>
                {property.complianceSchedule?.poolSafety?.nextInspection && (
                  <div className="inspection-date">
                    <RiCalendarLine />
                    <span>
                      Next Inspection:{" "}
                      {formatDateTime(
                        property.complianceSchedule.poolSafety.nextInspection
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {property.notes && (
          <div className="profile-section">
            <h2>Notes</h2>
            <div className="notes-content">
              <p>{property.notes}</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="profile-section">
          <h2>Property Details</h2>
          <div className="metadata-grid">
            <div className="metadata-item">
              <label>Created</label>
              <p>{formatDateTime(property.createdAt)}</p>
            </div>
            {property.updatedAt && (
              <div className="metadata-item">
                <label>Last Updated</label>
                <p>{formatDateTime(property.updatedAt)}</p>
              </div>
            )}
            {property.hasOverdueCompliance && (
              <div className="metadata-item">
                <label>Compliance Status</label>
                <p className="status overdue">Has Overdue Compliance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyProfile;
