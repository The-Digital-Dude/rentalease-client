import { useState, useEffect } from "react";
import {
  RiHomeLine,
  RiCalendarLine,
  RiCheckLine,
  RiLoaderLine,
  RiBriefcaseLine,
  RiMapPinLine,
  RiTimeLine,
  RiMessageLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import "./TenantDashboard.scss";

interface TenantProperty {
  id: string;
  address: string;
  propertyType: string;
  rentAmount: string;
  nextPayment: string;
  status: string;
}

interface MaintenanceRequest {
  id: string;
  propertyAddress: string;
  requestType: string;
  priority: string;
  status: string;
  submittedDate: string;
  description: string;
}

const TenantDashboard = () => {
  const { user } = useAppSelector((state) => state.user);
  const [properties, setProperties] = useState<TenantProperty[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");

  useEffect(() => {
    // Simulate fetching tenant data
    const fetchTenantData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockProperties: TenantProperty[] = [
          {
            id: "1",
            address: "123 Main St, Sydney NSW 2000",
            propertyType: "2 Bedroom Apartment",
            rentAmount: "$2,500/month",
            nextPayment: "2024-02-01",
            status: "Active",
          },
        ];

        const mockRequests: MaintenanceRequest[] = [
          {
            id: "1",
            propertyAddress: "123 Main St, Sydney NSW 2000",
            requestType: "Plumbing Issue",
            priority: "Medium",
            status: "In Progress",
            submittedDate: "2024-01-15",
            description: "Kitchen tap is leaking",
          },
          {
            id: "2",
            propertyAddress: "123 Main St, Sydney NSW 2000",
            requestType: "Electrical Issue",
            priority: "High",
            status: "Submitted",
            submittedDate: "2024-01-20",
            description: "Light switch not working in bedroom",
          },
        ];

        setProperties(mockProperties);
        setMaintenanceRequests(mockRequests);
      } catch (error) {
        console.error("Failed to fetch tenant data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
        return "warning";
      case "submitted":
        return "info";
      case "active":
        return "success";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const renderPropertyCard = (property: TenantProperty) => (
    <div key={property.id} className="property-card">
      <div className="property-header">
        <div className="property-type">
          <RiHomeLine />
          <span>{property.propertyType}</span>
        </div>
        <div className="property-status">
          <span className={`status-badge ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
      </div>

      <div className="property-details">
        <div className="property-address">
          <RiMapPinLine />
          <span>{property.address}</span>
        </div>
        <div className="property-info">
          <div className="rent-info">
            <span className="label">Rent:</span>
            <span className="value">{property.rentAmount}</span>
          </div>
          <div className="payment-info">
            <span className="label">Next Payment:</span>
            <span className="value">{property.nextPayment}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequestCard = (request: MaintenanceRequest) => (
    <div key={request.id} className="request-card">
      <div className="request-header">
        <div className="request-type">
          <RiBriefcaseLine />
          <span>{request.requestType}</span>
        </div>
        <div className="request-status">
          <span className={`status-badge ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </div>

      <div className="request-details">
        <div className="request-address">
          <RiMapPinLine />
          <span>{request.propertyAddress}</span>
        </div>
        <div className="request-description">
          <p>{request.description}</p>
        </div>
        <div className="request-meta">
          <div className="request-priority">
            <span
              className={`priority-badge ${getPriorityColor(request.priority)}`}
            >
              {request.priority} Priority
            </span>
          </div>
          <div className="request-date">
            <RiTimeLine />
            <span>Submitted: {request.submittedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="tenant-dashboard">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || "Tenant"}!</h1>
          <p>Manage your properties and maintenance requests</p>
        </div>
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <RiHomeLine />
            </div>
            <div className="stat-content">
              <h3>{properties.length}</h3>
              <p>Properties</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiBriefcaseLine />
            </div>
            <div className="stat-content">
              <h3>{maintenanceRequests.length}</h3>
              <p>Maintenance Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiCheckLine />
            </div>
            <div className="stat-content">
              <h3>
                {
                  maintenanceRequests.filter((r) => r.status === "Completed")
                    .length
                }
              </h3>
              <p>Completed Requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "properties" ? "active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            Properties ({properties.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Maintenance Requests ({maintenanceRequests.length})
          </button>
        </div>

        <div className="content-container">
          {activeTab === "properties" ? (
            <div className="properties-container">
              {properties.length === 0 ? (
                <div className="empty-state">
                  <RiHomeLine />
                  <h3>No properties found</h3>
                  <p>You don't have any properties assigned to you.</p>
                </div>
              ) : (
                <div className="properties-grid">
                  {properties.map(renderPropertyCard)}
                </div>
              )}
            </div>
          ) : (
            <div className="requests-container">
              {maintenanceRequests.length === 0 ? (
                <div className="empty-state">
                  <RiBriefcaseLine />
                  <h3>No maintenance requests</h3>
                  <p>You don't have any maintenance requests at the moment.</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {maintenanceRequests.map(renderRequestCard)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
