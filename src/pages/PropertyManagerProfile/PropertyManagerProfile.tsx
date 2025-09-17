import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiUserLine,
  RiHomeLine,
  RiBarChartLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiEditLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiStarLine,
  RiErrorWarningLine,
  RiLoaderLine,
  RiBriefcaseLine,
  RiCalendarLine,
} from "react-icons/ri";
import {
  propertyManagerService,
  type PropertyManager,
  type AssignedProperty,
} from "../../services";
import "./PropertyManagerProfile.scss";
import toast from "react-hot-toast";

const PropertyManagerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [propertyManager, setPropertyManager] = useState<PropertyManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "performance">("overview");

  useEffect(() => {
    if (id) {
      fetchPropertyManager(id);
    }
  }, [id]);

  const fetchPropertyManager = async (propertyManagerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyManagerService.getPropertyManagerById(propertyManagerId);

      if (response.success && response.data.propertyManager) {
        setPropertyManager(response.data.propertyManager);
      } else {
        setError("Property Manager not found");
        toast.error("Property Manager not found");
      }
    } catch (err: any) {
      console.error("Error fetching property manager:", err);
      setError(err.response?.data?.message || "Failed to load property manager");
      toast.error("Failed to load property manager");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "status-available";
      case "Unavailable":
      case "Busy":
        return "status-busy";
      case "On Leave":
        return "status-leave";
      case "Active":
        return "status-active";
      case "Inactive":
      case "Suspended":
        return "status-inactive";
      case "Pending":
        return "status-pending";
      default:
        return "status-pending";
    }
  };

  const renderOverview = () => (
    <div className="overview-content">
      <div className="overview-grid">
        <div className="info-section">
          <h3>
            <RiUserLine /> Personal Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{propertyManager?.fullName}</p>
            </div>
            <div className="info-item">
              <label>Status</label>
              <div className="status-badges">
                <span className={`status-badge ${getStatusColor(propertyManager?.status || "")}`}>
                  {propertyManager?.status}
                </span>
                <span className={`status-badge ${getStatusColor(propertyManager?.availabilityStatus || "")}`}>
                  {propertyManager?.availabilityStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <h3>
            <RiPhoneLine /> Contact Information
          </h3>
          <div className="contact-card">
            <div className="contact-info">
              <div className="contact-details">
                <div className="contact-item">
                  <RiPhoneLine />
                  <span>{propertyManager?.phone}</span>
                </div>
                <div className="contact-item">
                  <RiMailLine />
                  <span>{propertyManager?.email}</span>
                </div>
                {propertyManager?.address?.fullAddress && (
                  <div className="contact-item">
                    <RiMapPinLine />
                    <span>{propertyManager.address.fullAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h3>
            <RiBriefcaseLine /> Property Management
          </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{propertyManager?.assignedPropertiesCount || 0}</div>
              <div className="stat-label">Total Properties</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{propertyManager?.activePropertiesCount || 0}</div>
              <div className="stat-label">Active Properties</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{propertyManager?.assignmentSummary?.primaryAssignments || 0}</div>
              <div className="stat-label">Primary Assignments</div>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h3>
            <RiCalendarLine /> Account Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Created</label>
              <p>{propertyManager?.createdAt ? new Date(propertyManager.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Last Login</label>
              <p>{propertyManager?.lastLogin ? new Date(propertyManager.lastLogin).toLocaleDateString() : "Never"}</p>
            </div>
            <div className="info-item">
              <label>Last Active</label>
              <p>{propertyManager?.lastActive ? new Date(propertyManager.lastActive).toLocaleDateString() : "Never"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="properties-content">
      <div className="properties-header">
        <h3>Assigned Properties</h3>
        <p>Properties currently managed by this property manager</p>
      </div>

      {propertyManager?.assignedProperties && propertyManager.assignedProperties.length > 0 ? (
        <div className="properties-table">
          <table>
            <thead>
              <tr>
                <th>Property Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {propertyManager.assignedProperties.map((assignment, index) => (
                <tr key={index}>
                  <td>
                    {assignment.property?.address ?
                      `${assignment.property.address.street}, ${assignment.property.address.suburb} ${assignment.property.address.state} ${assignment.property.address.postcode}`
                      : assignment.propertyId
                    }
                  </td>
                  <td>
                    <span className={`role-badge role-${assignment.role?.toLowerCase()}`}>
                      {assignment.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td>{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <RiHomeLine />
          <h4>No Properties Assigned</h4>
          <p>This property manager currently has no properties assigned.</p>
        </div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="performance-content">
      <div className="performance-header">
        <h3>Performance Metrics</h3>
        <p>Property management performance and statistics</p>
      </div>

      <div className="performance-grid">
        <div className="performance-card">
          <h4>Assignment Summary</h4>
          <div className="performance-stats">
            <div className="perf-stat">
              <span className="perf-label">Total Properties</span>
              <span className="perf-value">{propertyManager?.assignmentSummary?.totalProperties || 0}</span>
            </div>
            <div className="perf-stat">
              <span className="perf-label">Active Properties</span>
              <span className="perf-value">{propertyManager?.assignmentSummary?.activeProperties || 0}</span>
            </div>
            <div className="perf-stat">
              <span className="perf-label">Inactive Properties</span>
              <span className="perf-value">{propertyManager?.assignmentSummary?.inactiveProperties || 0}</span>
            </div>
          </div>
        </div>

        <div className="performance-card">
          <h4>Assignment Types</h4>
          <div className="performance-stats">
            <div className="perf-stat">
              <span className="perf-label">Primary Assignments</span>
              <span className="perf-value">{propertyManager?.assignmentSummary?.primaryAssignments || 0}</span>
            </div>
            <div className="perf-stat">
              <span className="perf-label">Secondary Assignments</span>
              <span className="perf-value">{propertyManager?.assignmentSummary?.secondaryAssignments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="property-manager-profile">
        <div className="loading-state">
          <div className="spinner">
            <RiLoaderLine className="spinning" />
          </div>
          <h2>Loading Property Manager Profile</h2>
          <p>Please wait while we fetch the details...</p>
        </div>
      </div>
    );
  }

  if (error || !propertyManager) {
    return (
      <div className="property-manager-profile">
        <div className="error-state">
          <RiErrorWarningLine />
          <h2>Error Loading Profile</h2>
          <p>{error || "Property Manager not found"}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            <RiArrowLeftLine /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="property-manager-profile">
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <RiArrowLeftLine /> Back
        </button>

        <div className="header-content">
          <h1>{propertyManager.fullName}</h1>
          <p className="property-manager-role">Property Manager</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <RiUserLine /> Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "properties" ? "active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            <RiHomeLine /> Properties
          </button>
          <button
            className={`tab-btn ${activeTab === "performance" ? "active" : ""}`}
            onClick={() => setActiveTab("performance")}
          >
            <RiBarChartLine /> Performance
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "properties" && renderProperties()}
          {activeTab === "performance" && renderPerformance()}
        </div>
      </div>
    </div>
  );
};

export default PropertyManagerProfile;