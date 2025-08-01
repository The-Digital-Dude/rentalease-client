import React from "react";
import {
  RiInformationLine,
  RiFileListLine,
  RiHomeLine,
  RiTeamLine,
  RiToolsLine,
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiBuildingLine,
  RiShieldCheckLine,
  RiEyeLine,
  RiStarLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { formatDateTime } from "../../utils";
import "./JobProfileTabs.scss";

interface JobProfileTabsProps {
  activeTab: "overview" | "details" | "property" | "technician";
  setActiveTab: (
    tab: "overview" | "details" | "property" | "technician"
  ) => void;
  job: any;
  property: any;
  technician: any;
  statistics: any;
  onViewProperty: (propertyId: string) => void;
  onViewTechnician: (technicianId: string) => void;
  getStatusBadgeClass: (status: string) => string;
  getPriorityBadgeClass: (priority: string) => string;
}

const JobProfileTabs: React.FC<JobProfileTabsProps> = ({
  activeTab,
  setActiveTab,
  job,
  property,
  technician,
  statistics,
  onViewProperty,
  onViewTechnician,
  getStatusBadgeClass,
  getPriorityBadgeClass,
}) => {
  return (
    <>
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <RiInformationLine />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <RiFileListLine />
          Job Details
        </button>
        <button
          className={`tab-btn ${activeTab === "property" ? "active" : ""}`}
          onClick={() => setActiveTab("property")}
        >
          <RiHomeLine />
          Property
        </button>
        <button
          className={`tab-btn ${activeTab === "technician" ? "active" : ""}`}
          onClick={() => setActiveTab("technician")}
        >
          <RiTeamLine />
          Technician
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            {/* Job Information */}
            <div className="info-section">
              <h2>Job Information</h2>
              <div className="info-grid">
                <div className="info-card">
                  <h3>Basic Details</h3>
                  <div className="detail-info">
                    <div className="detail-item">
                      <RiToolsLine />
                      <div>
                        <label>Job Type</label>
                        <span>{job.jobType}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <RiCalendarLine />
                      <div>
                        <label>Due Date</label>
                        <span>{formatDateTime(job.dueDate)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <RiTimeLine />
                      <div>
                        <label>Created</label>
                        <span>{formatDateTime(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <RiMapPinLine />
                      <div>
                        <label>Property</label>
                        <span>{property.address.fullAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Assignment Details</h3>
                  <div className="assignment-info">
                    <div className="assignment-item">
                      <label>Assigned Technician</label>
                      <span>
                        {technician
                          ? technician.firstName + " " + technician.lastName
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="cost-section">
              <h2>Cost Breakdown</h2>
              <div className="cost-grid">
                <div className="cost-card total">
                  <h3>Material Cost</h3>
                  <div className="cost-amount">${statistics.totalCost}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="details-content">
            <div className="section-header">
              <h2>Job Details</h2>
              <p>Complete job information and specifications</p>
            </div>

            <div className="details-grid">
              <div className="detail-card">
                <h3>Job Specifications</h3>
                <div className="spec-list">
                  <div className="spec-item">
                    <label>Job ID</label>
                    <span>{job.job_id}</span>
                  </div>
                  <div className="spec-item">
                    <label>Job Type</label>
                    <span>{job.jobType}</span>
                  </div>
                  <div className="spec-item">
                    <label>Priority</label>
                    <span
                      className={`priority-badge ${getPriorityBadgeClass(
                        job.priority
                      )}`}
                    >
                      {job.priority}
                    </span>
                  </div>
                  <div className="spec-item">
                    <label>Status</label>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="spec-item">
                    <label>Due Date</label>
                    <span>{formatDateTime(job.dueDate)}</span>
                  </div>
                  <div className="spec-item">
                    <label>Created Date</label>
                    <span>{formatDateTime(job.createdAt)}</span>
                  </div>
                </div>
              </div>

              {job.description && (
                <div className="detail-card full-width">
                  <h3>Description</h3>
                  <div className="description-text">{job.description}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "property" && (
          <div className="property-content">
            <div className="section-header">
              <h2>Property Information</h2>
              <p>Details about the property where this job is located</p>
            </div>

            <div className="property-details">
              <div className="property-card">
                <h3>Property Details</h3>
                <div className="property-info">
                  <div className="property-item">
                    <RiMapPinLine />
                    <div>
                      <label>Address</label>
                      <span>{property.address.fullAddress}</span>
                    </div>
                  </div>
                  <div className="property-item">
                    <RiBuildingLine />
                    <div>
                      <label>Property Type</label>
                      <span>{property.propertyType}</span>
                    </div>
                  </div>
                  <div className="property-item">
                    <RiShieldCheckLine />
                    <div>
                      <label>Status</label>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="property-card">
                <h3>Tenant Information</h3>
                <div className="tenant-info">
                  {property.currentTenant ? (
                    <>
                      <div className="contact-item">
                        <RiUser3Line />
                        <div>
                          <label>Name</label>
                          <span>{property.currentTenant.name}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiMailLine />
                        <div>
                          <label>Email</label>
                          <span>{property.currentTenant.email}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiPhoneLine />
                        <div>
                          <label>Phone</label>
                          <span>{property.currentTenant.phone}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data">
                      No tenant information available
                    </div>
                  )}
                </div>
              </div>

              <div className="property-card">
                <h3>Landlord Information</h3>
                <div className="landlord-info">
                  {property.currentLandlord ? (
                    <>
                      <div className="contact-item">
                        <RiUser3Line />
                        <div>
                          <label>Name</label>
                          <span>{property.currentLandlord.name}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiMailLine />
                        <div>
                          <label>Email</label>
                          <span>{property.currentLandlord.email}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiPhoneLine />
                        <div>
                          <label>Phone</label>
                          <span>{property.currentLandlord.phone}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data">
                      No landlord information available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="property-actions">
              <button
                onClick={() => onViewProperty(property.id)}
                className="btn-primary"
              >
                <RiEyeLine />
                View Property Details
              </button>
            </div>
          </div>
        )}

        {activeTab === "technician" && (
          <div className="technician-content">
            <div className="section-header">
              <h2>Technician Information</h2>
              <p>Details about the assigned technician</p>
            </div>

            {technician ? (
              <div className="technician-details">
                <div className="technician-card">
                  <h3>Technician Details</h3>
                  <div className="technician-info">
                    <div className="technician-item">
                      <RiUser3Line />
                      <div>
                        <label>Name</label>
                        <span>
                          {technician.firstName} {technician.lastName}
                        </span>
                      </div>
                    </div>
                    <div className="technician-item">
                      <RiMailLine />
                      <div>
                        <label>Email</label>
                        <span>{technician.email}</span>
                      </div>
                    </div>
                    <div className="technician-item">
                      <RiPhoneLine />
                      <div>
                        <label>Phone</label>
                        <span>{technician.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="technician-actions">
                  <button
                    onClick={() => onViewTechnician(technician.id)}
                    className="btn-primary"
                  >
                    <RiEyeLine />
                    View Technician Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-technician">
                <div className="no-data-card">
                  <RiTeamLine />
                  <h3>No Technician Assigned</h3>
                  <p>This job has not been assigned to a technician yet.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default JobProfileTabs;
