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
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiEyeLine,
  RiToolsLine,
  RiBuildingLine,
  RiTeamLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiStarLine,
} from "react-icons/ri";
import { agencyService } from "../../services/agencyService";
import type { AgencyProfile as AgencyProfileType } from "../../services/agencyService";
import { formatDateTime } from "../../utils";
import "./AgencyProfile.scss";

const AgencyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agencyData, setAgencyData] = useState<AgencyProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "properties" | "jobs" | "technicians"
  >("overview");

  useEffect(() => {
    const fetchAgencyData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await agencyService.getSingleAgency(id);

        if (response.success && response.data) {
          setAgencyData(response.data);
        } else {
          setError(response.message || "Failed to load agency data");
        }
      } catch (error: any) {
        console.error("Error loading agency:", error);
        setError(error.message || "Failed to load agency data");
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyData();
  }, [id]);

  const handleBack = () => {
    navigate("/agencies");
  };

  const handleEdit = () => {
    // Navigate to edit agency or open edit modal
    console.log("Edit agency:", id);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading agency profile...</p>
        </div>
      </div>
    );
  }

  if (error || !agencyData) {
    return (
      <div className="page-container">
        <div className="error-state">
          <RiAlertLine />
          <h3>Error Loading Agency</h3>
          <p>{error || "Agency not found"}</p>
          <button onClick={handleBack} className="btn-primary">
            Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  const { agency, statistics, properties, jobs, technicians } = agencyData;

  // Calculate new properties this month
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const newPropertiesThisMonth = properties.filter((property) => {
    if (!property.createdAt) return false;
    const createdDate = new Date(property.createdAt);
    return (
      createdDate.getMonth() === thisMonth &&
      createdDate.getFullYear() === thisYear
    );
  }).length;

  const statsCards = [
    {
      title: "Total Properties",
      value: statistics.totalProperties,
      change: `+${newPropertiesThisMonth} this month`,
      changeType: newPropertiesThisMonth > 0 ? "positive" : "neutral",
      icon: RiHomeLine,
      color: "blue",
    },
    {
      title: "Total Jobs",
      value: statistics.totalJobs,
      change: `${statistics.jobStatusCounts.completed} completed`,
      changeType: "positive",
      icon: RiToolsLine,
      color: "green",
    },
    {
      title: "Active Technicians",
      value: statistics.totalTechnicians,
      change: `${statistics.technicianAvailability.available} available`,
      changeType: "positive",
      icon: RiTeamLine,
      color: "purple",
    },
    {
      title: "Job Value",
      value: `$${statistics.financials.totalJobValue.toLocaleString()}`,
      change: `$${statistics.financials.averageJobValue.toFixed(0)} avg`,
      changeType: "neutral",
      icon: RiMoneyDollarBoxLine,
      color: "orange",
    },
  ];

  const getStatusBadgeClass = (status: string | undefined) => {
    if (!status) return "status-neutral";

    switch (status.toLowerCase()) {
      case "active":
      case "completed":
      case "available":
        return "status-success";
      case "pending":
      case "scheduled":
      case "busy":
        return "status-warning";
      case "inactive":
      case "overdue":
      case "unavailable":
        return "status-danger";
      default:
        return "status-neutral";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  return (
    <div className="page-container agency-profile-page">
      {/* Header */}
      <div className="profile-header">
        <button onClick={handleBack} className="back-btn">
          <RiArrowLeftLine />
          Back to Agencies
        </button>
        <div className="header-content">
          <div className="agency-info">
            <h1>{agency.companyName}</h1>
            <p className="agency-region">{agency.region}</p>
            <div className="agency-meta">
              <span
                className={`status-badge ${getStatusBadgeClass(agency.status)}`}
              >
                {agency.status}
              </span>
              <span className="compliance-level">{agency.compliance}</span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleEdit} className="btn-secondary">
              <RiEditLine />
              Edit Agency
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <span className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <RiBuildingLine />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "properties" ? "active" : ""}`}
          onClick={() => setActiveTab("properties")}
        >
          <RiHomeLine />
          Properties ({statistics.totalProperties})
        </button>
        <button
          className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          <RiToolsLine />
          Jobs ({statistics.totalJobs})
        </button>
        <button
          className={`tab-btn ${activeTab === "technicians" ? "active" : ""}`}
          onClick={() => setActiveTab("technicians")}
        >
          <RiTeamLine />
          Technicians ({statistics.totalTechnicians})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            {/* Agency Information */}
            <div className="info-section">
              <h2>Agency Information</h2>
              <div className="info-grid">
                <div className="info-card">
                  <h3>Contact Details</h3>
                  <div className="contact-info">
                    <div className="contact-item">
                      <RiUser3Line />
                      <div>
                        <label>Contact Person</label>
                        <span>{agency.contactPerson}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <RiMailLine />
                      <div>
                        <label>Email</label>
                        <span>{agency.email}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <RiPhoneLine />
                      <div>
                        <label>Phone</label>
                        <span>{agency.phone}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <RiMapPinLine />
                      <div>
                        <label>Region</label>
                        <span>{agency.region}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Business Details</h3>
                  <div className="business-info">
                    <div className="business-item">
                      <label>ABN</label>
                      <span>{agency.abn}</span>
                    </div>
                    <div className="business-item">
                      <label>Compliance Package</label>
                      <span>{agency.compliance}</span>
                    </div>
                    <div className="business-item">
                      <label>Outstanding Amount</label>
                      <span className="amount">
                        ${agency.outstandingAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="business-item">
                      <label>Joined Date</label>
                      <span>
                        {agency.joinedDate
                          ? formatDateTime(agency.joinedDate)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="performance-section">
              <h2>Performance Overview</h2>
              <div className="performance-grid">
                <div className="performance-card">
                  <h3>Job Status Distribution</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-dot pending"></span>
                      <span>Pending: {statistics.jobStatusCounts.pending}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot scheduled"></span>
                      <span>
                        Scheduled: {statistics.jobStatusCounts.scheduled}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot completed"></span>
                      <span>
                        Completed: {statistics.jobStatusCounts.completed}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot overdue"></span>
                      <span>Overdue: {statistics.jobStatusCounts.overdue}</span>
                    </div>
                  </div>
                </div>

                <div className="performance-card">
                  <h3>Property Status</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-dot active"></span>
                      <span>
                        Active: {statistics.propertyStatusCounts.active}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot inactive"></span>
                      <span>
                        Inactive: {statistics.propertyStatusCounts.inactive}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot maintenance"></span>
                      <span>
                        Maintenance:{" "}
                        {statistics.propertyStatusCounts.maintenance}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="performance-card">
                  <h3>Technician Availability</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-dot available"></span>
                      <span>
                        Available: {statistics.technicianAvailability.available}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot busy"></span>
                      <span>
                        Busy: {statistics.technicianAvailability.busy}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot unavailable"></span>
                      <span>
                        Unavailable:{" "}
                        {statistics.technicianAvailability.unavailable}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "properties" && (
          <div className="properties-content">
            <div className="section-header">
              <h2>Properties ({properties.length})</h2>
              <p>Manage properties under this agency</p>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Tenant</th>
                    <th>Landlord</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <div className="property-address">
                          <strong>{property.address.fullAddress}</strong>
                        </div>
                      </td>
                      <td>{property.propertyType}</td>
                      <td>
                        {property.currentTenant ? (
                          <div className="tenant-info">
                            <div>{property.currentTenant.name}</div>
                            <small>{property.currentTenant.email}</small>
                          </div>
                        ) : (
                          <span className="no-data">No tenant</span>
                        )}
                      </td>
                      <td>
                        {property.currentLandlord ? (
                          <div className="landlord-info">
                            <div>{property.currentLandlord.name}</div>
                            <small>{property.currentLandlord.email}</small>
                          </div>
                        ) : (
                          <span className="no-data">No landlord</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            property.status || "active"
                          )}`}
                        >
                          {property.status || "Active"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewProperty(property.id)}
                          title="View Property"
                        >
                          <RiEyeLine />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="jobs-content">
            <div className="section-header">
              <h2>Jobs ({jobs.length})</h2>
              <p>View and manage all jobs for this agency</p>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Type</th>
                    <th>Property</th>
                    <th>Technician</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <span className="job-id">{job.job_id}</span>
                      </td>
                      <td>{job.jobType}</td>
                      <td>
                        <div className="property-info">
                          <div>{job.property.address.street}</div>
                          <small>
                            {job.property.address.suburb},{" "}
                            {job.property.address.state}
                          </small>
                        </div>
                      </td>
                      <td>
                        {job.assignedTechnician ? (
                          <div className="technician-info">
                            <div>{job.assignedTechnician.fullName}</div>
                            <small>{job.assignedTechnician.tradeType}</small>
                          </div>
                        ) : (
                          <span className="no-data">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {job.dueDate ? formatDateTime(job.dueDate) : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`priority-badge ${getPriorityBadgeClass(
                            job.priority
                          )}`}
                        >
                          {job.priority}
                        </span>
                      </td>
                      <td>{job.cost ? `$${job.cost.totalCost}` : "N/A"}</td>
                      <td>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewJob(job.id)}
                          title="View Job"
                        >
                          <RiEyeLine />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "technicians" && (
          <div className="technicians-content">
            <div className="section-header">
              <h2>Technicians ({technicians.length})</h2>
              <p>Agency technicians and their current status</p>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Trade Type</th>
                    <th>Availability</th>
                    <th>Current Jobs</th>
                    <th>Hourly Rate</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <strong>{member.fullName}</strong>
                      </td>
                      <td>{member.tradeType}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            member.availabilityStatus
                          )}`}
                        >
                          {member.availabilityStatus}
                        </span>
                      </td>
                      <td>
                        <span className="jobs-count">{member.currentJobs}</span>
                      </td>
                      <td>
                        <span className="hourly-rate">
                          ${member.hourlyRate}/hr
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            member.status
                          )}`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td>
                        {member.createdAt
                          ? formatDateTime(member.createdAt)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyProfile;
