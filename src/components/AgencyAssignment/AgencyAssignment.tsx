import { useState, useEffect } from "react";
import {
  RiSearchLine,
  RiFilterLine,
  RiBuilding2Line,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiMapPinLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
} from "react-icons/ri";
import { agencyService, type Agency } from "../../services";
import "./AgencyAssignment.scss";

interface AgencyAssignmentProps {
  selectedAgency: Agency | null;
  onAgencySelect: (agency: Agency | null) => void;
  onCancel?: () => void;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

const AgencyAssignment = ({
  selectedAgency,
  onAgencySelect,
  onCancel,
  showHeader = true,
  title = "Select Agency",
  subtitle = "Choose an agency to assign to this property manager",
  className = "",
}: AgencyAssignmentProps) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Load agencies
  const loadAgencies = async () => {
    try {
      setLoading(true);
      const response = await agencyService.getAllAgencies();

      if (response.success && response.data) {
        setAgencies(response.data);
        setFilteredAgencies(response.data);
      }
    } catch (error) {
      console.error("Error loading agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  // Filter agencies based on search term and status
  useEffect(() => {
    let filtered = agencies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((agency) =>
        (agency.companyName || agency.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agency.email || agency.contactEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.abn.includes(searchTerm) ||
        agency.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((agency) => agency.status === statusFilter);
    }

    setFilteredAgencies(filtered);
  }, [agencies, searchTerm, statusFilter]);

  const handleAgencySelect = (agency: Agency) => {
    onAgencySelect(agency);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#22c55e";
      case "inactive":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      case "suspended":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className={`agency-assignment loading ${className}`}>
        <div className="loading-state">
          <RiLoader4Line className="spinner" />
          <span>Loading agencies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`agency-assignment ${className}`}>
      {showHeader && (
        <div className="assignment-header">
          <div className="header-content">
            <RiBuilding2Line className="header-icon" />
            <div>
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
          </div>
          {onCancel && (
            <button className="cancel-btn" onClick={onCancel}>
              <RiCloseLine />
            </button>
          )}
        </div>
      )}

      <div className="search-filters">
        <div className="search-container">
          <RiSearchLine className="search-icon" />
          <input
            type="text"
            placeholder="Search agencies by name, email, ABN, or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <RiFilterLine className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {selectedAgency && (
        <div className="selected-agency-banner">
          <div className="banner-content">
            <RiCheckLine className="check-icon" />
            <div className="agency-info">
              <strong>{selectedAgency.companyName || selectedAgency.name}</strong>
              <span>{selectedAgency.email || selectedAgency.contactEmail}</span>
            </div>
          </div>
          <button
            className="change-btn"
            onClick={() => onAgencySelect({} as Agency)}
          >
            Change
          </button>
        </div>
      )}

      <div className="agencies-grid">
        {filteredAgencies.length === 0 ? (
          <div className="empty-state">
            <RiBuilding2Line className="empty-icon" />
            <h4>No agencies found</h4>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No agencies available"}
            </p>
          </div>
        ) : (
          filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              className={`agency-card ${
                selectedAgency?.id === agency.id ? "selected" : ""
              }`}
              onClick={() => handleAgencySelect(agency)}
            >
              <div className="card-header">
                <div className="agency-title">
                  <RiBuilding2Line className="agency-icon" />
                  <h4>{agency.companyName || agency.name}</h4>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(agency.status) }}
                >
                  {agency.status}
                </div>
              </div>

              <div className="card-content">
                <div className="info-row">
                  <RiUserLine className="info-icon" />
                  <span>{agency.contactPerson}</span>
                </div>
                <div className="info-row">
                  <RiMailLine className="info-icon" />
                  <span>{agency.email || agency.contactEmail}</span>
                </div>
                <div className="info-row">
                  <RiPhoneLine className="info-icon" />
                  <span>{agency.contactPhone || agency.phone}</span>
                </div>
                <div className="info-row">
                  <RiMapPinLine className="info-icon" />
                  <span>{agency.region}</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="abn">ABN: {agency.abn}</span>
                {selectedAgency?.id === agency.id && (
                  <div className="selected-indicator">
                    <RiCheckLine />
                    Selected
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="agencies-summary">
        <span>
          Showing {filteredAgencies.length} of {agencies.length} agencies
        </span>
      </div>
    </div>
  );
};

export default AgencyAssignment;