import { useState, useEffect } from "react";
import { 
  RiAddLine, 
  RiRefreshLine,
  RiHomeLine,
  RiAlertLine,
  RiUser3Line,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine,
  RiEyeLine
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { getFullRoute } from "../../config/roleBasedRoutes";
import PropertyFormModal from "../../components/PropertyFormModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import PropertyManagement from "../../components/PropertyManagement";
import StatsGrid from "../../components/StatsGrid";
import type { Property as PropertyCardType } from "../../components/PropertyCard";
import propertyService, { 
  type Property, 
  type CreatePropertyData,
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

  // Load properties
  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await propertyService.getProperties({ 
        page: 1, 
        limit: 1000 // Load all properties for comprehensive management
      });
      
      if (response.status === 'success') {
        setProperties(response.data.properties);
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
  }, []);

  // Event handlers
  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsFormModalOpen(true);
  };

  const handleEditProperty = (property: PropertyCardType) => {
    // Find the full property data from our properties array
    const fullProperty = properties.find(p => p.id === property.id);
    if (fullProperty) {
      setEditingProperty(fullProperty);
      setIsFormModalOpen(true);
    }
  };

  const handleViewProperty = (property: PropertyCardType) => {
    console.log('View property:', property.id);
    // TODO: Implement property details view
  };

  const handleDeleteProperty = (property: PropertyCardType) => {
    const fullProperty = properties.find(p => p.id === property.id);
    if (fullProperty) {
      setDeletingProperty(fullProperty);
      setIsDeleteModalOpen(true);
    }
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

  const handleRefresh = () => {
    loadProperties();
  };

  // Transform properties to match PropertyCard interface
  const transformedProperties: PropertyCardType[] = properties.map(property => ({
    id: property.id,
    address: property.fullAddress,
    propertyType: property.propertyType,
    region: property.region,
    propertyManager: property.propertyManager.companyName,
    tenantName: property.currentTenant?.name,
    tenantPhone: property.currentTenant?.phone,
    tenantEmail: property.currentTenant?.email,
    landlordName: property.currentLandlord?.name,
    landlordPhone: property.currentLandlord?.phone,
    landlordEmail: property.currentLandlord?.email,
    // Map lease dates - these might not be available in the current Property type
    leaseStartDate: undefined, // TODO: Add lease dates to Property type if needed
    leaseEndDate: undefined,
    // Map inspection dates from compliance schedule if available
    nextInspection: property.complianceSchedule?.gasCompliance?.nextInspection || 
                   property.complianceSchedule?.electricalSafety?.nextInspection,
    lastInspection: undefined, // TODO: Add last inspection date to Property type if needed
    notes: property.notes,
    createdDate: property.createdAt
  }));

  // Enhanced statistics
  const stats = [
    {
      label: "Total Properties",
      value: properties.length,
      icon: RiHomeLine,
      color: "primary" as const
    },
    {
      label: "Occupied Properties", 
      value: properties.filter(p => p.currentTenant?.name).length,
      icon: RiUser3Line,
      color: "success" as const
    },
    {
      label: "Vacant Properties",
      value: properties.filter(p => !p.currentTenant?.name).length,
      icon: RiEyeLine,
      color: "info" as const
    },
    {
      label: "Compliance Issues",
      value: properties.filter(p => p.hasOverdueCompliance).length,
      icon: RiAlertLine,
      color: "danger" as const
    },
    {
      label: "High Compliance",
      value: properties.filter(p => p.complianceSummary?.complianceScore && p.complianceSummary.complianceScore >= 85).length,
      icon: RiShieldCheckLine,
      color: "success" as const
    },
    {
      label: "Average Compliance",
      value: properties.length > 0 
        ? Math.round(properties.reduce((sum, p) => sum + (p.complianceSummary?.complianceScore || 0), 0) / properties.length)
        : 0,
      icon: RiShieldCheckLine,
      color: "warning" as const,
      suffix: "%"
    }
  ];

  if (loading) {
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

      {/* Enhanced Stats Dashboard */}
      <StatsGrid stats={stats} />

      {/* Property Management Component */}
      <PropertyManagement
        properties={transformedProperties}
        onPropertyEdit={handleEditProperty}
        onPropertyView={handleViewProperty}
        onAddProperty={handleAddProperty}
        title="Property Portfolio"
        description="Manage your properties with advanced filtering and search capabilities"
        searchPlaceholder="Search properties by address, tenant, landlord, or property manager..."
        enableFilters={true}
        showActions={true}
      />

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