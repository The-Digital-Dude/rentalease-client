import React, { useState, useEffect } from "react";
import {
  RiHome3Line,
  RiUserLine,
  RiMapPinLine,
  RiRefreshLine,
  RiFilterLine,
  RiSearchLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiBuildingLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import propertyService from "../../services/propertyService";
import type { Property, PropertyFilters } from "../../services/propertyService";
import { useAppSelector } from "../../store";
import { useTheme } from "../../contexts/ThemeContext";
import "./PropertyManagerDashboard.scss";

const PropertyManagerDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching properties for property manager:", user?.id);
      const response = await propertyService.getProperties(filters);

      if (response.status === "success") {
        setProperties(response.data.properties || []);
        setPagination(response.data.pagination);
        console.log("Properties fetched:", response.data.properties.length);
      } else {
        setError("Failed to load properties");
      }
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(err.message || "An error occurred while loading properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const handleRefresh = () => {
    fetchProperties();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const getComplianceStatus = (property: Property) => {
    if (!property.complianceSummary) return "unknown";

    if (property.complianceSummary.overdue > 0) return "overdue";
    if (property.complianceSummary.dueSoon > 0) return "due-soon";
    return "compliant";
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <RiCheckboxCircleLine className="status-icon compliant" />;
      case "due-soon":
        return <RiAlertLine className="status-icon due-soon" />;
      case "overdue":
        return <RiErrorWarningLine className="status-icon overdue" />;
      default:
        return <RiShieldCheckLine className="status-icon unknown" />;
    }
  };

  return (
    <div className="property-manager-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <RiHome3Line className="page-icon" />
            My Properties
          </h1>
          <p>Manage and monitor the properties assigned to you</p>
        </div>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RiRefreshLine className={loading ? "spinning" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <RiBuildingLine />
          </div>
          <div className="stat-content">
            <h3>{properties.length}</h3>
            <p>Total Properties</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon compliant">
            <RiCheckboxCircleLine />
          </div>
          <div className="stat-content">
            <h3>
              {
                properties.filter((p) => getComplianceStatus(p) === "compliant")
                  .length
              }
            </h3>
            <p>Compliant</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon due-soon">
            <RiAlertLine />
          </div>
          <div className="stat-content">
            <h3>
              {
                properties.filter((p) => getComplianceStatus(p) === "due-soon")
                  .length
              }
            </h3>
            <p>Due Soon</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon overdue">
            <RiErrorWarningLine />
          </div>
          <div className="stat-content">
            <h3>
              {
                properties.filter((p) => getComplianceStatus(p) === "overdue")
                  .length
              }
            </h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="controls-section">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>
        </form>

        <div className="filters-container">
          <RiFilterLine className="filter-icon" />
          <select
            value={filters.propertyType || ""}
            onChange={(e) =>
              handleFilterChange("propertyType", e.target.value || undefined)
            }
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Commercial">Commercial</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filters.region || ""}
            onChange={(e) =>
              handleFilterChange("region", e.target.value || undefined)
            }
            className="filter-select"
          >
            <option value="">All Regions</option>
            <option value="Sydney Metro">Sydney Metro</option>
            <option value="Melbourne Metro">Melbourne Metro</option>
            <option value="Brisbane Metro">Brisbane Metro</option>
            <option value="Perth Metro">Perth Metro</option>
            <option value="Adelaide Metro">Adelaide Metro</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="properties-section">
        {loading ? (
          <div className="loading-container">
            <RiLoaderLine className="spinning" />
            <p>Loading properties...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <RiErrorWarningLine className="error-icon" />
            <h3>Failed to Load Properties</h3>
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <RiHome3Line className="empty-icon" />
            <h3>No Properties Found</h3>
            <p>No properties have been assigned to you yet.</p>
          </div>
        ) : (
          <>
            <div className="properties-grid">
              {properties.map((property) => {
                const complianceStatus = getComplianceStatus(property);
                return (
                  <div key={property.id} className="property-card">
                    <div className="property-header">
                      <div className="property-address">
                        <h4>{property.fullAddress}</h4>
                        <p className="property-type">
                          <RiBuildingLine />
                          {property.propertyType} • {property.region}
                        </p>
                      </div>
                      <div className="compliance-status">
                        {getComplianceIcon(complianceStatus)}
                      </div>
                    </div>

                    <div className="property-details">
                      <div className="detail-item">
                        <RiUserLine />
                        <div>
                          <label>Tenant</label>
                          <span>{property.currentTenant.name}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <RiMapPinLine />
                        <div>
                          <label>Agency</label>
                          <span>{property.agency.companyName}</span>
                        </div>
                      </div>
                    </div>

                    {property.complianceSummary && (
                      <div className="compliance-summary">
                        <div className="compliance-item">
                          <span className="label">Compliance Score</span>
                          <span className={`score ${complianceStatus}`}>
                            {property.complianceSummary.complianceScore}%
                          </span>
                        </div>
                        {property.complianceSummary.overdue > 0 && (
                          <div className="compliance-alert">
                            <RiErrorWarningLine />
                            {property.complianceSummary.overdue} overdue item(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() =>
                    handleFilterChange("page", pagination.currentPage - 1)
                  }
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNext}
                  onClick={() =>
                    handleFilterChange("page", pagination.currentPage + 1)
                  }
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyManagerDashboard;
