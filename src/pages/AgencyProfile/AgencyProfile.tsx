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
  RiVipCrown2Line,
  RiSettings2Line,
  RiExternalLinkFill,
  RiServiceLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine as RiEdit2Line,
  RiSendPlaneLine,
  RiCloseCircleLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { agencyService } from "../../services/agencyService";
import subscriptionService from "../../services/subscriptionService";
import { quotationService, propertyService } from "../../services";
import type { AgencyProfile as AgencyProfileType } from "../../services/agencyService";
import { formatDateTime } from "../../utils";
import { useAppSelector } from "../../store";
import PillBadge from "../../components/PillBadge";
import Toast from "../../components/Toast";
import "./AgencyProfile.scss";

const AgencyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userType } = useAppSelector((state) => state.user);
  const [agencyData, setAgencyData] = useState<AgencyProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "properties" | "jobs" | "propertyManagers" | "beyondCompliance"
  >("overview");
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

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

  const handleManageSubscription = async () => {
    try {
      setLoadingPortal(true);

      // For super users, pass the agency ID
      const requestData = userType === "super_user" ? { agencyId: id } : {};

      const portalUrl = await subscriptionService.createPortalSession(
        requestData
      );
      window.open(portalUrl, "_blank");
      setToast({
        message: "Billing portal opened in new tab",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error opening billing portal:", err);
      setToast({
        message: err.message || "Failed to open billing portal",
        type: "error",
      });
    } finally {
      setLoadingPortal(false);
    }
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

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <RiAlertLine />
          <h3>Error Loading Agency</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="btn-primary">
            Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  if (!agencyData) {
    return (
      <div className="page-container">
        <div className="error-state">
          <RiAlertLine />
          <h3>Agency Not Found</h3>
          <p>The requested agency could not be found.</p>
          <button onClick={handleBack} className="btn-primary">
            Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  const {
    agency,
    statistics,
    properties = [],
    jobs = [],
    propertyManagers = [],
  } = agencyData;

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

  const handleStatCardClick = (cardType: string) => {
    switch (cardType) {
      case "properties":
        setActiveTab("properties");
        break;
      case "jobs":
        setActiveTab("jobs");
        break;
      case "propertyManagers":
        setActiveTab("propertyManagers");
        break;
      default:
        break;
    }
  };

  const statsCards = [
    {
      title: "Total Properties",
      value: statistics?.totalProperties || 0,
      change: `+${newPropertiesThisMonth} this month`,
      changeType: newPropertiesThisMonth > 0 ? "positive" : "neutral",
      icon: RiHomeLine,
      color: "blue",
      clickAction: "properties",
    },
    {
      title: "Total Jobs",
      value: statistics?.totalJobs || 0,
      change: `${statistics?.jobStatusCounts?.completed || 0} completed`,
      changeType: "positive",
      icon: RiToolsLine,
      color: "green",
      clickAction: "jobs",
    },
    {
      title: "Property Managers",
      value: statistics?.totalPropertyManagers || 0,
      change: `${
        statistics?.propertyManagerAvailability?.available || 0
      } available`,
      changeType: "positive",
      icon: RiTeamLine,
      color: "purple",
      clickAction: "propertyManagers",
    },
    {
      title: "Job Value",
      value: `$${(
        statistics?.financials?.totalJobValue || 0
      ).toLocaleString()}`,
      change: `$${(statistics?.financials?.averageJobValue || 0).toFixed(
        0
      )} avg`,
      changeType: "neutral",
      icon: RiMoneyDollarBoxLine,
      color: "orange",
      clickAction: "jobs",
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
            <h1>{agency?.companyName || "Unknown Agency"}</h1>
            <p className="agency-region">
              {agency?.region || "Unknown Region"}
            </p>
            <div className="agency-meta">
              <span
                className={`status-badge ${getStatusBadgeClass(
                  agency?.status
                )}`}
              >
                {agency?.status || "Unknown"}
              </span>
              <span className="compliance-level">
                {agency?.compliance || "Unknown"}
              </span>
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
          <div
            key={index}
            className={`stat-card ${stat.color} clickable`}
            onClick={() => handleStatCardClick(stat.clickAction)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleStatCardClick(stat.clickAction);
              }
            }}
          >
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
          Properties ({statistics?.totalProperties || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          <RiToolsLine />
          Jobs ({statistics?.totalJobs || 0})
        </button>
        <button
          className={`tab-btn ${
            activeTab === "propertyManagers" ? "active" : ""
          }`}
          onClick={() => setActiveTab("propertyManagers")}
        >
          <RiTeamLine />
          Property Managers ({statistics?.totalPropertyManagers || 0})
        </button>
        <button
          className={`tab-btn ${
            activeTab === "beyondCompliance" ? "active" : ""
          }`}
          onClick={() => setActiveTab("beyondCompliance")}
        >
          <RiServiceLine />
          Beyond Compliance
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
                        <span>{agency?.contactPerson || "N/A"}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <RiMailLine />
                      <div>
                        <label>Email</label>
                        <span>{agency?.email || "N/A"}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <RiPhoneLine />
                      <div>
                        <label>Phone</label>
                        <span>{agency?.phone || "N/A"}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <RiMapPinLine />
                      <div>
                        <label>Region</label>
                        <span>{agency?.region || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Business Details</h3>
                  <div className="business-info">
                    <div className="business-item">
                      <label>ABN</label>
                      <span>{agency?.abn || "N/A"}</span>
                    </div>
                    <div className="business-item">
                      <label>Compliance Package</label>
                      <span>{agency?.compliance || "N/A"}</span>
                    </div>
                    <div className="business-item">
                      <label>Subscription Plan</label>
                      {agency?.subscription ? (
                        <div className="subscription-details">
                          <PillBadge
                            planType={
                              agency.subscription.planType as
                                | "starter"
                                | "pro"
                                | "enterprise"
                                | "trial"
                            }
                            status={
                              agency.subscription.status as
                                | "trial"
                                | "active"
                                | "past_due"
                                | "canceled"
                                | "incomplete"
                                | "unpaid"
                            }
                            size="medium"
                          />
                        </div>
                      ) : (
                        <div className="no-subscription-details">
                          <RiShieldCheckLine className="no-sub-icon" />
                          <span>No Active Subscription</span>
                        </div>
                      )}
                    </div>
                    <div className="business-item">
                      <label>Joined Date</label>
                      <span>
                        {agency?.joinedDate
                          ? formatDateTime(agency.joinedDate)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            {agency?.subscription && (
              <div className="subscription-section">
                <h2>Subscription Details</h2>
                <div className="subscription-card">
                  <div className="subscription-header">
                    <div className="plan-info">
                      <PillBadge
                        planType={
                          agency.subscription.planType as
                            | "starter"
                            | "pro"
                            | "enterprise"
                            | "trial"
                        }
                        status={
                          agency.subscription.status as
                            | "trial"
                            | "active"
                            | "past_due"
                            | "canceled"
                            | "incomplete"
                            | "unpaid"
                        }
                        size="medium"
                      />
                    </div>
                    <button
                      className="btn-secondary manage-subscription"
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                    >
                      {loadingPortal ? (
                        <>
                          <div className="spinner-small"></div>
                          Opening...
                        </>
                      ) : (
                        <>
                          <RiExternalLinkFill />
                          Manage Subscription
                        </>
                      )}
                    </button>
                  </div>
                  <div className="subscription-details-grid">
                    {agency.subscription.subscriptionStartDate && (
                      <div className="detail-item">
                        <label>Started</label>
                        <span>
                          {formatDateTime(
                            agency.subscription.subscriptionStartDate
                          )}
                        </span>
                      </div>
                    )}
                    {agency.subscription.subscriptionEndDate && (
                      <div className="detail-item">
                        <label>Next Billing</label>
                        <span>
                          {formatDateTime(
                            agency.subscription.subscriptionEndDate
                          )}
                        </span>
                      </div>
                    )}
                    {agency.subscription.trialEndsAt && (
                      <div className="detail-item">
                        <label>Trial Ends</label>
                        <span>
                          {formatDateTime(agency.subscription.trialEndsAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Overview */}
            <div className="performance-section">
              <h2>Performance Overview</h2>
              <div className="performance-grid">
                <div className="performance-card">
                  <h3>Job Status Distribution</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-dot pending"></span>
                      <span>
                        Pending: {statistics?.jobStatusCounts?.pending || 0}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot scheduled"></span>
                      <span>
                        Scheduled: {statistics?.jobStatusCounts?.scheduled || 0}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot completed"></span>
                      <span>
                        Completed: {statistics?.jobStatusCounts?.completed || 0}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot overdue"></span>
                      <span>
                        Overdue: {statistics?.jobStatusCounts?.overdue || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="performance-card">
                  <h3>Property Status</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-dot active"></span>
                      <span>
                        Active: {statistics?.propertyStatusCounts?.active || 0}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot inactive"></span>
                      <span>
                        Inactive:{" "}
                        {statistics?.propertyStatusCounts?.inactive || 0}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot maintenance"></span>
                      <span>
                        Maintenance:{" "}
                        {statistics?.propertyStatusCounts?.maintenance || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="performance-card">
                  <h3>Property Manager Availability</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-dot available"></span>
                      <span>
                        Available:{" "}
                        {statistics?.propertyManagerAvailability?.available ||
                          0}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot busy"></span>
                      <span>
                        Busy:{" "}
                        {statistics?.propertyManagerAvailability?.busy || 0}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-dot unavailable"></span>
                      <span>
                        Unavailable:{" "}
                        {statistics?.propertyManagerAvailability?.unavailable ||
                          0}
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
                    <tr
                      key={property.id}
                      className="property-row clickable"
                      onClick={() => handleViewProperty(property.id)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleViewProperty(property.id);
                        }
                      }}
                    >
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
                        <RiEyeLine className="row-indicator" />
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
                    <tr
                      key={job.id}
                      className="job-row clickable"
                      onClick={() => handleViewJob(job.id)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleViewJob(job.id);
                        }
                      }}
                    >
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
                        <RiEyeLine className="row-indicator" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "propertyManagers" && (
          <div className="property-managers-content">
            <div className="section-header">
              <h2>Property Managers ({propertyManagers.length})</h2>
              <p>Agency property managers and their current status</p>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Availability</th>
                    <th>Assigned Properties</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyManagers.map((manager) => (
                    <tr key={manager.id}>
                      <td>
                        <strong>{manager.fullName}</strong>
                      </td>
                      <td>{manager.email}</td>
                      <td>{manager.phone}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            manager.availabilityStatus
                          )}`}
                        >
                          {manager.availabilityStatus}
                        </span>
                      </td>
                      <td>
                        <span className="properties-count">
                          {manager.assignedPropertiesCount}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            manager.status
                          )}`}
                        >
                          {manager.status}
                        </span>
                      </td>
                      <td>
                        {manager.createdAt
                          ? formatDateTime(manager.createdAt)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Beyond Compliance Tab Content */}
        {activeTab === "beyondCompliance" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Beyond Compliance Services</h2>
              <div className="section-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setToast({
                      message: "Request New Service modal coming soon!",
                      type: "info",
                    });
                  }}
                >
                  <RiAddLine />
                  Request New Service
                </button>
              </div>
            </div>

            <div className="quotations-overview">
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">
                    <RiFileList3Line />
                  </div>
                  <div className="stat-content">
                    <h3>0</h3>
                    <p>Total Requests</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <RiTimeLine />
                  </div>
                  <div className="stat-content">
                    <h3>0</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <RiCheckboxCircleLine />
                  </div>
                  <div className="stat-content">
                    <h3>0</h3>
                    <p>Accepted</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <RiMoneyDollarBoxLine />
                  </div>
                  <div className="stat-content">
                    <h3>$0</h3>
                    <p>Total Value</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="quotations-list">
              <div className="empty-state">
                <div className="empty-icon">
                  <RiServiceLine />
                </div>
                <h3>No Beyond Compliance Requests Yet</h3>
                <p>
                  Request quotations for services like cleaning, utility
                  connections, landscaping, and more to expand your service
                  offerings.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setToast({
                      message: "Test quotation creation coming soon!",
                      type: "info",
                    });
                  }}
                >
                  <RiAddLine />
                  Create Your First Request
                </button>
              </div>
            </div>

            <div className="test-section">
              <h3>🧪 Testing Interface</h3>
              <p>Quick actions to test the Beyond Compliance workflow:</p>
              <div className="test-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setToast({
                      message: "Testing quotation request API endpoint...",
                      type: "info",
                    });
                  }}
                >
                  Test Quotation Request
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setToast({
                      message: "Testing quotation response API endpoint...",
                      type: "info",
                    });
                  }}
                >
                  Test Quotation Response
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setToast({
                      message: "Testing complete workflow...",
                      type: "info",
                    });
                  }}
                >
                  Test Full Workflow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AgencyProfile;
