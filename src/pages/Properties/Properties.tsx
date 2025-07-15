import { useState, useEffect } from "react";
import { 
  RiAddLine, 
  RiSearchLine, 
  RiFilterLine, 
  RiEyeLine, 
  RiEditLine, 
  RiDeleteBinLine,
  RiHomeLine,
  RiAlertLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUser3Line,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine,
  RiRefreshLine
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { getFullRoute } from "../../config/roleBasedRoutes";
import PropertyFormModal from "../../components/PropertyFormModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TenantInfo from "../../components/TenantInfo";
import LandlordInfo from "../../components/LandlordInfo";
import propertyService, { 
  type Property, 
  type CreatePropertyData,
  VALID_REGIONS, 
  VALID_STATES, 
  PROPERTY_TYPES
} from "../../services/propertyService";
import "./Properties.scss";

const Properties = () => {
  const { userType } = useAppSelector((state) => state.user);
  const currentPath = userType ? getFullRoute(userType, 'properties') : '/';

  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  // Load properties
  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        propertyType: typeFilter || undefined,
        region: regionFilter || undefined,
        state: stateFilter || undefined,
      };

      const response = await propertyService.getProperties(params);
      
      if (response.status === 'success') {
        setProperties(response.data.properties);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (error: any) {
      console.error('Error loading properties:', error);
      setError(error.message || 'Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadProperties();
  }, [currentPage, searchTerm, typeFilter, regionFilter, stateFilter]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Event handlers
  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsFormModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsFormModalOpen(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setDeletingProperty(property);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitProperty = async (propertyData: CreatePropertyData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingProperty) {
        // Update existing property
        const response = await propertyService.updateProperty(editingProperty.id, propertyData);
        if (response.status === 'success') {
          setIsFormModalOpen(false);
          await loadProperties();
        }
      } else {
        // Create new property
        const response = await propertyService.createProperty(propertyData);
        if (response.status === 'success') {
          setIsFormModalOpen(false);
          await loadProperties();
        }
      }
    } catch (error: any) {
      console.error('Error submitting property:', error);
      setError(error.message || 'Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProperty) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await propertyService.deleteProperty(deletingProperty.id);
      if (response.status === 'success') {
        setIsDeleteModalOpen(false);
        setDeletingProperty(null);
        await loadProperties();
      }
    } catch (error: any) {
      console.error('Error deleting property:', error);
      setError(error.message || 'Failed to delete property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRegionFilter("");
    setStateFilter("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadProperties();
  };

  // Helper functions
  const getComplianceColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const formatCurrency = (amount: number) => {
    return propertyService.formatCurrency(amount);
  };

  const formatDate = (dateString: string) => {
    return propertyService.formatDate(dateString);
  };

  // Statistics
  const stats = {
    total: totalCount,
    overdue: properties.filter(p => p.hasOverdueCompliance).length,
  };

  if (loading && properties.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container properties-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <RiHomeLine className="header-icon" />
              Properties
            </h1>
            <p>Manage your property portfolio with comprehensive tracking and compliance monitoring</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RiRefreshLine />
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddProperty}
            >
              <RiAddLine />
              Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <RiAlertLine />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Properties</div>
          </div>
          <div className="stat-icon total">
            <RiHomeLine />
          </div>
        </div>
        
        {stats.overdue > 0 && (
          <div className="stat-card urgent">
            <div className="stat-content">
              <div className="stat-value">{stats.overdue}</div>
              <div className="stat-label">Overdue Compliance</div>
            </div>
            <div className="stat-icon overdue">
              <RiAlertLine />
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <RiSearchLine className="search-icon" />
          <input
            type="text"
            placeholder="Search properties by address, suburb, or tenant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-grid">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {VALID_REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All States</option>
            {VALID_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <button
            className="btn btn-secondary"
            onClick={handleClearFilters}
          >
            <RiFilterLine />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <RiHomeLine className="empty-icon" />
          <h3>No Properties Found</h3>
          <p>
            {searchTerm || typeFilter || regionFilter || stateFilter
              ? "Try adjusting your search criteria or filters."
              : "Get started by adding your first property."
            }
          </p>
          {!searchTerm && !typeFilter && !regionFilter && !stateFilter && (
            <button className="btn btn-primary" onClick={handleAddProperty}>
              <RiAddLine />
              Add Property
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="properties-grid">
            {properties.map((property) => (
              <div key={property.id} className="property-card">
                {/* Property Header */}
                <div className="property-header">
                  <div className="property-title">
                    <h3>{property.fullAddress}</h3>
                  </div>
                  <div className="property-actions">
                    <button
                      className="action-btn view"
                      onClick={() => console.log('View property:', property.id)}
                      title="View Details"
                    >
                      <RiEyeLine />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditProperty(property)}
                      title="Edit Property"
                    >
                      <RiEditLine />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteProperty(property)}
                      title="Delete Property"
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>

                {/* Property Details */}
                <div className="property-details">
                  <div className="detail-row">
                    <RiHomeLine className="detail-icon" />
                    <span className="detail-text">
                      {property.propertyType}
                    </span>
                  </div>

                  <div className="detail-row">
                    <RiMapPinLine className="detail-icon" />
                    <span className="detail-text">{property.region}</span>
                  </div>

                  {property.currentTenant?.name && (
                    <TenantInfo tenant={property.currentTenant} />
                  )}

                  {property.currentLandlord?.name && (
                    <LandlordInfo landlord={property.currentLandlord} />
                  )}
                </div>

                {/* Compliance Status */}
                {property.complianceSummary && (
                  <div className="compliance-section">
                    <div className="compliance-header">
                      <span className="compliance-label">Compliance Score</span>
                      <span className={`compliance-score ${getComplianceColor(property.complianceSummary.complianceScore)}`}>
                        {property.complianceSummary.complianceScore}%
                      </span>
                    </div>
                    
                    {property.hasOverdueCompliance && (
                      <div className="compliance-alert">
                        <RiAlertLine />
                        <span>Overdue compliance items</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Property Footer */}
                <div className="property-footer">
                  <div className="property-meta">
                    <span className="meta-text">
                      <RiCalendarLine />
                      Added {formatDate(property.createdAt)}
                    </span>
                  </div>
                  <div className="property-manager">
                    <span className="manager-text">
                      {property.propertyManager.companyName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                <span>
                  Page {currentPage} of {totalPages} • {totalCount} properties
                </span>
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitProperty}
        editingProperty={editingProperty}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${deletingProperty?.fullAddress}"? This action cannot be undone.`}
        confirmText="Delete Property"
        cancelText="Cancel"
        confirmButtonType="danger"
      />
    </div>
  );
};

export default Properties; 