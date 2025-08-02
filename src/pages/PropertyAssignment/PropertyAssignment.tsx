import React, { useState, useEffect } from "react";
import {
  RiHomeLine,
  RiUser3Line,
  RiCheckLine,
  RiCloseLine,
  RiRefreshLine,
} from "react-icons/ri";
import propertyService, {
  type Property,
  type PropertyManager,
  type AssignmentSummary,
} from "../../services/propertyService";
import toast from "react-hot-toast";
import "./PropertyAssignment.scss";

const PropertyAssignment: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyManagers, setPropertyManagers] = useState<PropertyManager[]>(
    []
  );
  const [assignmentSummaries, setAssignmentSummaries] = useState<
    Record<string, AssignmentSummary>
  >({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "assigned" | "unassigned"
  >("all");

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);

      // Load properties
      const propertiesResponse = await propertyService.getProperties({
        page: 1,
        limit: 1000,
      });

      if (propertiesResponse.status === "success") {
        setProperties(propertiesResponse.data.properties);
      }

      // Load available property managers
      const managersResponse =
        await propertyService.getAvailablePropertyManagers();
      if (managersResponse.status === "success") {
        setPropertyManagers(managersResponse.data.propertyManagers);
      }

      // Load assignment summaries for all properties
      if (propertiesResponse.status === "success") {
        const summaries: Record<string, AssignmentSummary> = {};
        await Promise.all(
          propertiesResponse.data.properties.map(async (property) => {
            try {
              const summaryResponse =
                await propertyService.getAssignmentSummary(property.id);
              if (summaryResponse.status === "success") {
                summaries[property.id] = summaryResponse.data;
              }
            } catch (error) {
              console.error(
                `Failed to load assignment summary for property ${property.id}:`,
                error
              );
            }
          })
        );
        setAssignmentSummaries(summaries);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter properties based on search and status
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.suburb.toLowerCase().includes(searchTerm.toLowerCase());

    const assignmentStatus = assignmentSummaries[property.id]?.assignmentStatus;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "assigned" && assignmentStatus === "Assigned") ||
      (filterStatus === "unassigned" && assignmentStatus === "Unassigned");

    return matchesSearch && matchesStatus;
  });

  // Handle assignment
  const handleAssignPropertyManager = async () => {
    if (!selectedProperty || !selectedManager) return;

    try {
      setAssigning(selectedProperty.id);

      await propertyService.assignPropertyManager(selectedProperty.id, {
        propertyManagerId: selectedManager,
        role: "Primary",
      });

      // Refresh assignment summary for this property
      const summaryResponse = await propertyService.getAssignmentSummary(
        selectedProperty.id
      );
      if (summaryResponse.status === "success") {
        setAssignmentSummaries((prev) => ({
          ...prev,
          [selectedProperty.id]: summaryResponse.data,
        }));
      }

      toast.success("Property manager assigned successfully!");
      setShowAssignmentModal(false);
      setSelectedProperty(null);
      setSelectedManager("");
    } catch (error: any) {
      console.error("Error assigning property manager:", error);
      toast.error(error.message || "Failed to assign property manager");
    } finally {
      setAssigning(null);
    }
  };

  const openAssignmentModal = (property: Property) => {
    setSelectedProperty(property);
    setSelectedManager("");
    setShowAssignmentModal(true);
  };

  const getStatusBadge = (status: string) => {
    const isAssigned = status === "Assigned";
    return (
      <span
        className={`status-badge ${isAssigned ? "assigned" : "unassigned"}`}
      >
        {isAssigned ? <RiCheckLine /> : <RiCloseLine />}
        {status}
      </span>
    );
  };

  const getManagerCard = (property: Property) => {
    const summary = assignmentSummaries[property.id];
    if (!summary || summary.assignmentStatus === "Unassigned") {
      return (
        <div className="manager-card unassigned">
          <RiUser3Line className="manager-icon" />
          <div className="manager-info">
            <h4>No Property Manager Assigned</h4>
            <p>Click to assign a property manager</p>
          </div>
        </div>
      );
    }

    const manager = summary.assignedPropertyManager;
    if (!manager) return null;

    // Safely generate initials from full name
    const getInitials = (firstName: string, lastName: string) => {
      const first = firstName || "";
      const last = lastName || "";
      const initials = (first[0] || "") + (last[0] || "");
      return initials.toUpperCase() || "PM";
    };

    return (
      <div className="manager-card assigned">
        <div className="manager-avatar">
          {getInitials(manager.firstName, manager.lastName)}
        </div>
        <div className="manager-info">
          <h4>
            {`${manager.firstName || ""} ${manager.lastName || ""}`.trim() ||
              "Unknown Manager"}
          </h4>
          <p>{manager.email || "No email"}</p>
          <p>{manager.phone || "No phone"}</p>
          <div className="manager-status-row">
            <span
              className={`status-badge ${(
                manager.status || "unknown"
              ).toLowerCase()}`}
            >
              {manager.status || "Unknown"}
            </span>
            <span
              className={`availability-status ${(
                manager.availabilityStatus || "unknown"
              ).toLowerCase()}`}
            >
              {manager.availabilityStatus || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="property-assignment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading property assignment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="property-assignment-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Property Manager Assignment</h1>
            <p>Assign properties to available property managers</p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={loadData}>
              <RiRefreshLine />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search properties by address or suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="status-filter">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as "all" | "assigned" | "unassigned"
              )
            }
            className="status-select"
          >
            <option value="all">All Properties</option>
            <option value="assigned">Assigned Only</option>
            <option value="unassigned">Unassigned Only</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <RiHomeLine />
          </div>
          <div className="stat-content">
            <h3>{properties.length}</h3>
            <p>Total Properties</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon assigned">
            <RiUser3Line />
          </div>
          <div className="stat-content">
            <h3>
              {
                Object.values(assignmentSummaries).filter(
                  (s) => s.assignmentStatus === "Assigned"
                ).length
              }
            </h3>
            <p>Assigned Properties</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon unassigned">
            <RiUser3Line />
          </div>
          <div className="stat-content">
            <h3>
              {
                Object.values(assignmentSummaries).filter(
                  (s) => s.assignmentStatus === "Unassigned"
                ).length
              }
            </h3>
            <p>Unassigned Properties</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <RiUser3Line />
          </div>
          <div className="stat-content">
            <h3>{propertyManagers.length}</h3>
            <p>Available Managers</p>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="properties-grid">
        {filteredProperties.map((property) => (
          <div key={property.id} className="property-card">
            <div className="property-header">
              <div className="property-address">
                <h3>{property.fullAddress}</h3>
                <p className="property-type">{property.propertyType}</p>
              </div>
              {getStatusBadge(
                assignmentSummaries[property.id]?.assignmentStatus ||
                  "Unassigned"
              )}
            </div>

            <div className="property-details">
              <div className="detail-item">
                <span className="label">Region:</span>
                <span className="value">{property.region}</span>
              </div>
              <div className="detail-item">
                <span className="label">State:</span>
                <span className="value">{property.address.state}</span>
              </div>
              <div className="detail-item">
                <span className="label">Suburb:</span>
                <span className="value">{property.address.suburb}</span>
              </div>
              {property.currentTenant && (
                <div className="detail-item">
                  <span className="label">Current Tenant:</span>
                  <span className="value">{property.currentTenant.name}</span>
                </div>
              )}
            </div>

            <div className="manager-section">{getManagerCard(property)}</div>

            <div className="property-actions">
              <button
                className={`assign-btn ${
                  assignmentSummaries[property.id]?.assignmentStatus ===
                  "Assigned"
                    ? "assigned"
                    : ""
                }`}
                onClick={() => openAssignmentModal(property)}
                disabled={
                  assigning === property.id ||
                  assignmentSummaries[property.id]?.assignmentStatus ===
                    "Assigned"
                }
              >
                {assigning === property.id
                  ? "Assigning..."
                  : assignmentSummaries[property.id]?.assignmentStatus ===
                    "Assigned"
                  ? "Already Assigned"
                  : "Assign Manager"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedProperty && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssignmentModal(false)}
        >
          <div
            className="assignment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Assign Property Manager</h2>
              <button
                className="close-btn"
                onClick={() => setShowAssignmentModal(false)}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="modal-content">
              <div className="property-info">
                <h3>{selectedProperty.fullAddress}</h3>
                <p>
                  {selectedProperty.propertyType} • {selectedProperty.region}
                </p>
              </div>

              <div className="manager-selection">
                <label htmlFor="manager-select">Select Property Manager:</label>
                <select
                  id="manager-select"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="manager-select"
                >
                  <option value="">Choose a property manager...</option>
                  {propertyManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.fullName} - {manager.assignedPropertiesCount}{" "}
                      properties
                    </option>
                  ))}
                </select>
              </div>

              {selectedManager && (
                <div className="selected-manager-info">
                  {(() => {
                    const manager = propertyManagers.find(
                      (m) => m.id === selectedManager
                    );
                    if (!manager) return null;

                    // Safely generate initials from full name
                    const getInitials = (name: string) => {
                      if (!name || typeof name !== "string") return "PM";
                      const parts = name
                        .split(" ")
                        .filter((part) => part.length > 0);
                      if (parts.length === 0) return "PM";
                      return parts
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase();
                    };

                    return (
                      <div className="manager-preview">
                        <div className="manager-avatar">
                          {getInitials(manager.fullName || "")}
                        </div>
                        <div className="manager-details">
                          <h4>{manager.fullName || "Unknown Manager"}</h4>
                          <p>{manager.email || "No email"}</p>
                          <p>{manager.phone || "No phone"}</p>
                          <div className="manager-stats">
                            <span
                              className={`status ${(
                                manager.status || "unknown"
                              ).toLowerCase()}`}
                            >
                              {manager.status || "Unknown"}
                            </span>
                            <span
                              className={`availability ${(
                                manager.availabilityStatus || "unknown"
                              ).toLowerCase()}`}
                            >
                              {manager.availabilityStatus || "Unknown"}
                            </span>
                            <span className="properties-count">
                              {manager.assignedPropertiesCount || 0} properties
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowAssignmentModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleAssignPropertyManager}
                disabled={!selectedManager || assigning === selectedProperty.id}
              >
                {assigning === selectedProperty.id
                  ? "Assigning..."
                  : "Assign Manager"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyAssignment;
