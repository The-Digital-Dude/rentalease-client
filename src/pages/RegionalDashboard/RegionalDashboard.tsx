import { useState, useEffect, useMemo, useCallback } from "react";
import {
  RiHome3Line,
  RiToolsLine,
  RiBuildingLine,
  RiMapPin2Line,
  RiRefreshLine,
  RiEyeLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiTimeLine,
  RiStarLine,
  RiPhoneLine,
  RiMailLine,
  RiUserStarLine,
  RiSettings2Line
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import regionalService from "../../services/regionalService";
import type {
  RegionalStats,
  RegionalProperty,
  RegionalPropertyManager,
  RegionalTechnician,
  RegionalFilters
} from "../../services/regionalService";
import { VALID_REGIONS } from "../../constants";
import {
  getRegionsByState,
  getAllStates,
  getRegionDisplayName,
  getStateFromRegion,
  getRegionsForState,
  getFullStateName
} from "../../utils/regionUtils";
import "./RegionalDashboard.scss";

interface TabData {
  properties: RegionalProperty[];
  propertyManagers: RegionalPropertyManager[];
  technicians: RegionalTechnician[];
}

const RegionalDashboard = () => {
  const navigate = useNavigate();

  // State management
  const [stats, setStats] = useState<RegionalStats | null>(null);
  const [tabData, setTabData] = useState<TabData>({
    properties: [],
    propertyManagers: [],
    technicians: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"properties" | "propertyManagers" | "technicians">("properties");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Memoized region data
  const regionsByState = useMemo(() => getRegionsByState(), []);
  const allStates = useMemo(() => getAllStates(), []);

  // Get available regions based on selected state
  const availableRegions = useMemo(() => {
    if (selectedState === "all") {
      return VALID_REGIONS;
    }
    return regionsByState[selectedState] || [];
  }, [selectedState, regionsByState]);

  // Fetch regional stats
  const fetchStats = useCallback(async (filters: RegionalFilters = {}) => {
    try {
      setError(null);
      const data = await regionalService.getRegionalStats(filters);
      setStats(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch regional statistics";
      setError(errorMessage);
      console.error("Error fetching regional stats:", err);
    }
  }, []);

  // Fetch tab data based on active tab
  const fetchTabData = useCallback(async (tab: string, filters: RegionalFilters = {}) => {
    try {
      setError(null);

      const tabFilters = {
        ...filters,
        page: currentPage,
        limit: pageSize
      };

      switch (tab) {
        case "properties": {
          const propertiesData = await regionalService.getRegionalProperties(tabFilters);
          setTabData(prev => ({ ...prev, properties: propertiesData.properties }));
          setTotalPages(propertiesData.pagination.totalPages);
          break;
        }

        case "propertyManagers": {
          const managersData = await regionalService.getRegionalPropertyManagers(tabFilters);
          setTabData(prev => ({ ...prev, propertyManagers: managersData.propertyManagers }));
          setTotalPages(managersData.pagination.totalPages);
          break;
        }

        case "technicians": {
          const techniciansData = await regionalService.getRegionalTechnicians(tabFilters);
          setTabData(prev => ({ ...prev, technicians: techniciansData.technicians }));
          setTotalPages(techniciansData.pagination.totalPages);
          break;
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${tab} data`;
      setError(errorMessage);
      console.error(`Error fetching ${tab} data:`, err);
    }
  }, [currentPage, pageSize]);

  // Handle filter changes
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setCurrentPage(1);

    // If region is selected, update state accordingly
    if (region !== "all") {
      const state = getStateFromRegion(region);
      if (state && state !== selectedState) {
        setSelectedState(state);
      }
    }
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedRegion("all"); // Reset region when state changes
    setCurrentPage(1);
  };

  // Handle tab change
  const handleTabChange = (tab: "properties" | "propertyManagers" | "technicians") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats({ region: selectedRegion, state: selectedState }),
      fetchTabData(activeTab, { region: selectedRegion, state: selectedState })
    ]);
    setRefreshing(false);
  };

  // Navigation handlers
  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleViewPropertyManager = (managerId: string) => {
    navigate(`/property-managers/${managerId}`);
  };

  const handleViewTechnician = (technicianId: string) => {
    navigate(`/technicians/${technicianId}`);
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchTabData(activeTab)
      ]);
      setLoading(false);
    };

    loadInitialData();
  }, [activeTab, fetchStats, fetchTabData]); // Include all dependencies

  // Update data when filters change
  useEffect(() => {
    if (!loading) {
      const filters = {
        region: selectedRegion,
        state: selectedState
      };

      const loadData = async () => {
        await Promise.all([
          fetchStats(filters),
          fetchTabData(activeTab, filters)
        ]);
      };

      loadData();
    }
  }, [selectedRegion, selectedState, activeTab, currentPage, loading, fetchStats, fetchTabData]); // Include all dependencies

  // Render loading state
  if (loading) {
    return (
      <div className="regional-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading regional dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !stats) {
    return (
      <div className="regional-dashboard">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn btn-primary">
            <RiRefreshLine />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="regional-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Regional Dashboard</h1>
          <p>Comprehensive view of properties, managers, and technicians across all regions</p>
        </div>
        <div className="header-actions">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary refresh-btn"
          >
            <RiRefreshLine className={refreshing ? "spinning" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Region Selector */}
      <div className="region-selector">
        <div className="selector-header">
          <h3>
            <RiMapPin2Line />
            Select Region or State
          </h3>
          <p>Filter dashboard data by specific regions or states</p>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>State Filter</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All States</option>
              {allStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Region Filter</label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Regions</option>
              {availableRegions.map(region => {
                const displayInfo = getRegionDisplayName(region);
                return (
                  <option key={region} value={region}>
                    {displayInfo.name} ({displayInfo.state})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick Region Cards */}
        <div className="region-cards">
          <div
            className={`region-card ${selectedRegion === "all" && selectedState === "all" ? "active" : ""}`}
            onClick={() => {
              setSelectedRegion("all");
              setSelectedState("all");
              setCurrentPage(1);
            }}
          >
            <div className="card-icon all-regions">
              <RiMapPin2Line />
            </div>
            <div className="card-content">
              <h4>All Regions</h4>
              <p>National overview</p>
            </div>
          </div>

          {getAllStates().slice(0, 7).map(state => {
            const isActive = selectedState === state;
            const stateRegions = getRegionsForState(state);
            const count = stateRegions.reduce((total: number, region: string) => total + (stats?.regionBreakdown[region] || 0), 0);
            const fullStateName = getFullStateName(state);

            return (
              <div
                key={state}
                className={`region-card ${isActive ? "active" : ""} state-card`}
                onClick={() => {
                  setSelectedState(state);
                  setSelectedRegion("all");
                  setCurrentPage(1);
                }}
              >
                <div className="card-icon state">
                  <RiBuildingLine />
                </div>
                <div className="card-content">
                  <h4>{state}</h4>
                  <p>{count} properties</p>
                  <span className="region-type state">
                    {fullStateName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card properties">
              <div className="stat-icon">
                <RiHome3Line />
              </div>
              <div className="stat-content">
                <h3>{stats.overview?.totalProperties || 0}</h3>
                <p>Total Properties</p>
                <div className="stat-detail">
                  <span className="active-count">
                    <RiCheckboxCircleLine />
                    {stats.overview?.activeProperties || 0} active
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-card technicians">
              <div className="stat-icon">
                <RiToolsLine />
              </div>
              <div className="stat-content">
                <h3>{stats.overview?.totalTechnicians || 0}</h3>
                <p>Total Technicians</p>
                <div className="stat-detail">
                  <span className="available-count">
                    <RiCheckboxCircleLine />
                    {stats.overview?.availableTechnicians || 0} available
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-card property-managers">
              <div className="stat-icon">
                <RiUserStarLine />
              </div>
              <div className="stat-content">
                <h3>{stats.overview?.totalPropertyManagers || 0}</h3>
                <p>Property Managers</p>
                <div className="stat-detail">
                  <span className="active-count">
                    <RiCheckboxCircleLine />
                    {stats.overview?.activePropertyManagers || 0} active
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-card agencies">
              <div className="stat-icon">
                <RiBuildingLine />
              </div>
              <div className="stat-content">
                <h3>{stats.overview?.totalAgencies || 0}</h3>
                <p>Total Agencies</p>
                <div className="stat-detail">
                  <span className="active-count">
                    <RiCheckboxCircleLine />
                    {stats.overview?.activeAgencies || 0} active
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-card jobs">
              <div className="stat-icon">
                <RiSettings2Line />
              </div>
              <div className="stat-content">
                <h3>{stats.overview.totalJobs}</h3>
                <p>Total Jobs</p>
                <div className="stat-detail">
                  <span className="active-count">
                    <RiTimeLine />
                    {stats.overview.activeJobs} active
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-card overdue">
              <div className="stat-icon">
                <RiErrorWarningLine />
              </div>
              <div className="stat-content">
                <h3>{stats.overview.overdueJobs}</h3>
                <p>Overdue Jobs</p>
                <div className="stat-detail">
                  <span className="completed-count">
                    <RiCheckboxCircleLine />
                    {stats.overview.completedJobs} completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-section">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "properties" ? "active" : ""}`}
            onClick={() => handleTabChange("properties")}
          >
            <RiHome3Line />
            Properties
            <span className="tab-count">{stats?.overview.totalProperties || 0}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "propertyManagers" ? "active" : ""}`}
            onClick={() => handleTabChange("propertyManagers")}
          >
            <RiUserStarLine />
            Property Managers
            <span className="tab-count">{stats?.overview.totalPropertyManagers || 0}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "technicians" ? "active" : ""}`}
            onClick={() => handleTabChange("technicians")}
          >
            <RiToolsLine />
            Technicians
            <span className="tab-count">{stats?.overview.totalTechnicians || 0}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Properties Tab */}
          {activeTab === "properties" && (
            <div className="properties-table">
              <div className="table-header">
                <h3>Properties Overview</h3>
                <p>High-level property information with quick access</p>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Type</th>
                      <th>Region</th>
                      <th>Tenant</th>
                      <th>Manager</th>
                      <th>Agency</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabData.properties.map((property) => (
                      <tr key={property.id}>
                        <td>
                          <div className="address-cell">
                            <strong>{property.address}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="property-type">{property.propertyType}</span>
                        </td>
                        <td>
                          <span className="region-badge">{property.region}</span>
                        </td>
                        <td>
                          <div className="tenant-info">
                            <div className="tenant-name">{property.tenantName || 'N/A'}</div>
                            {property.tenantEmail && property.tenantEmail !== "N/A" && (
                              <div className="tenant-email">{property.tenantEmail}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          {property.propertyManager ? (
                            <div className="manager-info">
                              <div className="manager-name">{property.propertyManager.name}</div>
                              <div className="manager-contact">
                                <RiPhoneLine />
                                {property.propertyManager.phone}
                              </div>
                            </div>
                          ) : (
                            <span className="no-manager">Not assigned</span>
                          )}
                        </td>
                        <td>
                          {property.agency ? (
                            <div className="agency-info">
                              <div className="agency-name">{property.agency.name}</div>
                              <div className="agency-contact">
                                <RiMailLine />
                                {property.agency.email}
                              </div>
                            </div>
                          ) : (
                            <span className="no-agency">No agency</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewProperty(property.id)}
                            className="action-btn view-btn"
                            title="View Property Details"
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

          {/* Property Managers Tab */}
          {activeTab === "propertyManagers" && (
            <div className="property-managers-table">
              <div className="table-header">
                <h3>Property Managers Overview</h3>
                <p>Regional property managers and their assignments</p>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Region</th>
                      <th>Properties</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabData.propertyManagers.map((manager) => (
                      <tr key={manager.id}>
                        <td>
                          <div className="manager-profile">
                            <strong>{manager.name || 'N/A'}</strong>
                            <span className="manager-location">{manager.address || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div className="contact-item">
                              <RiMailLine />
                              {manager.email || 'N/A'}
                            </div>
                            <div className="contact-item">
                              <RiPhoneLine />
                              {manager.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="region-badge">{manager.region || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="property-count">
                            <span className="count-number">{manager.propertyCount || 0}</span>
                            <span className="count-label">properties</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${manager.status ? manager.status.toLowerCase() : 'unknown'}`}>
                            {manager.status || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewPropertyManager(manager.id)}
                            className="action-btn view-btn"
                            title="View Manager Details"
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

          {/* Technicians Tab */}
          {activeTab === "technicians" && (
            <div className="technicians-table">
              <div className="table-header">
                <h3>Technicians Overview</h3>
                <p>Service technicians across all regions</p>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Service Area</th>
                      <th>Experience</th>
                      <th>Rating</th>
                      <th>Jobs</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabData.technicians.map((technician) => (
                      <tr key={technician.id}>
                        <td>
                          <div className="technician-profile">
                            <strong>{technician.name || 'N/A'}</strong>
                            <span className="technician-location">{technician.address || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div className="contact-item">
                              <RiMailLine />
                              {technician.email || 'N/A'}
                            </div>
                            <div className="contact-item">
                              <RiPhoneLine />
                              {technician.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="region-badge">{technician.region || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="experience-badge">
                            {technician.experience || 0} years
                          </span>
                        </td>
                        <td>
                          <div className="rating-info">
                            <div className="rating-stars">
                              <RiStarLine />
                              <span>{technician.rating ? technician.rating.toFixed(1) : '0.0'}</span>
                            </div>
                            <span className="rating-count">({technician.totalRatings || 0})</span>
                          </div>
                        </td>
                        <td>
                          <div className="jobs-info">
                            <div className="jobs-completed">{technician.completedJobs || 0} completed</div>
                            <div className="jobs-current">{technician.currentJobs || 0} current</div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${technician.availabilityStatus ? technician.availabilityStatus.toLowerCase() : 'unknown'}`}>
                            {technician.availabilityStatus || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewTechnician(technician.id)}
                            className="action-btn view-btn"
                            title="View Technician Details"
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <RiArrowDownLine style={{ transform: "rotate(90deg)" }} />
              Previous
            </button>

            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
              <RiArrowUpLine style={{ transform: "rotate(90deg)" }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalDashboard;