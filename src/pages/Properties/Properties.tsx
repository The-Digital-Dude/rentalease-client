import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { defaultRoutes } from "../../config/roleBasedRoutes";
import type { UserType } from "../../store/userSlice";
import PropertiesHeader from "../../components/PropertiesHeader";
import PropertyErrorAlert from "../../components/PropertyErrorAlert";
import PropertyModals from "../../components/PropertyModals";
import PropertyManagement from "../../components/PropertyManagement";
import StatsGrid from "../../components/StatsGrid";
import type { Property as PropertyCardType } from "../../components/PropertyCard";
import propertyService, {
  type Property,
  type CreatePropertyData,
} from "../../services/propertyService";
import toast from "react-hot-toast";
import {
  RiHomeLine,
  RiUser3Line,
  RiEyeLine,
  RiAlertLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import "./Properties.scss";

const Properties = () => {
  const { userType } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const currentPath = userType ? defaultRoutes[userType as UserType] : "/";

  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load properties
  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await propertyService.getProperties({
        page: 1,
        limit: 1000, // Load all properties for comprehensive management
      });

      if (response.status === "success") {
        setProperties(response.data.properties);
      }
    } catch (error: any) {
      console.error("Error loading properties:", error);
      setError(error.message || "Failed to load properties");
      setProperties([]);
      toast.error("Failed to load properties. Please try again.");
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
    const fullProperty = properties.find((p) => p.id === property.id);
    if (fullProperty) {
      setEditingProperty(fullProperty);
      setIsFormModalOpen(true);
    }
  };

  const handleViewProperty = (property: PropertyCardType) => {
    navigate(`/properties/${property.id}`);
  };

  const handleDeleteProperty = (property: PropertyCardType) => {
    const fullProperty = properties.find((p) => p.id === property.id);
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
        const response = await propertyService.updateProperty(
          editingProperty.id,
          propertyData
        );
        if (response.status === "success") {
          setIsFormModalOpen(false);
          await loadProperties();
          toast.success("Property updated successfully!");
        }
      } else {
        const response = await propertyService.createProperty(propertyData);
        if (response.status === "success") {
          setIsFormModalOpen(false);
          await loadProperties();
          toast.success("Property created successfully!");
        }
      }
    } catch (error: any) {
      console.error("Error submitting property:", error);
      setError(error.message || "Failed to save property");
      toast.error("Failed to save property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProperty) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await propertyService.deleteProperty(
        deletingProperty.id
      );
      if (response.status === "success") {
        setIsDeleteModalOpen(false);
        setDeletingProperty(null);
        await loadProperties();
        toast.success("Property deleted successfully!");
      }
    } catch (error: any) {
      console.error("Error deleting property:", error);
      setError(error.message || "Failed to delete property");
      toast.error("Failed to delete property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transform properties to match PropertyCard interface
  const transformedProperties: PropertyCardType[] = properties.map(
    (property) => ({
      id: property.id,
      address: {
        street: property.address?.street || "",
        suburb: property.address?.suburb || "",
        state: property.address?.state || "NSW",
        postcode: property.address?.postcode || "",
        fullAddress:
          property.address?.fullAddress || property.fullAddress || "",
      },
      propertyType: property.propertyType,
      region: property.region as PropertyCardType["region"],
      agency: property.agency || {
        _id: "",
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
      },
      currentTenant: property.currentTenant,
      currentLandlord: property.currentLandlord,
      complianceSchedule: {
        gasCompliance: {
          nextInspection:
            property.complianceSchedule?.gasCompliance?.nextInspection,
          required:
            property.complianceSchedule?.gasCompliance?.required ?? true,
          status:
            property.complianceSchedule?.gasCompliance?.status ?? "Due Soon",
        },
        electricalSafety: {
          nextInspection:
            property.complianceSchedule?.electricalSafety?.nextInspection,
          required:
            property.complianceSchedule?.electricalSafety?.required ?? true,
          status:
            property.complianceSchedule?.electricalSafety?.status ?? "Due Soon",
        },
        smokeAlarms: {
          nextInspection:
            property.complianceSchedule?.smokeAlarms?.nextInspection,
          required: property.complianceSchedule?.smokeAlarms?.required ?? true,
          status:
            property.complianceSchedule?.smokeAlarms?.status ?? "Due Soon",
        },
        poolSafety: {
          nextInspection:
            property.complianceSchedule?.poolSafety?.nextInspection,
          required: property.complianceSchedule?.poolSafety?.required ?? false,
          status:
            property.complianceSchedule?.poolSafety?.status ?? "Not Required",
        },
      },
      notes: property.notes,
      isActive: true, // Default to true since it's not in the service interface
      createdAt: property.createdAt,
      updatedAt: property.updatedAt || property.createdAt,
    })
  );

  // Enhanced statistics
  const now = new Date();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const recentlyAddedCount = properties.filter((p) => {
    if (!p.createdAt) return false;
    const createdAt = new Date(p.createdAt);
    return now.getTime() - createdAt.getTime() <= THIRTY_DAYS_MS;
  }).length;

  const stats = [
    {
      label: "Total Properties",
      value: properties.length,
      icon: RiHomeLine,
      color: "primary" as const,
    },
    {
      label: "Recently Added Properties",
      value: recentlyAddedCount,
      icon: RiHomeLine,
      color: "warning" as const,
    },
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
      <PropertiesHeader
        onRefresh={loadProperties}
        onAddProperty={handleAddProperty}
        loading={loading}
      />

      <PropertyErrorAlert error={error} onDismiss={() => setError(null)} />

      <StatsGrid stats={stats} />

      <PropertyManagement
        properties={transformedProperties}
        onPropertyEdit={handleEditProperty}
        onPropertyView={handleViewProperty}
        onAddProperty={handleAddProperty}
        title="Property Portfolio"
        description="Manage your properties with advanced filtering and search capabilities"
        searchPlaceholder="Search properties by address, tenant, landlord, or agency..."
        enableFilters={true}
        showActions={true}
      />

      <PropertyModals
        isFormModalOpen={isFormModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        editingProperty={editingProperty}
        deletingProperty={deletingProperty}
        isSubmitting={isSubmitting}
        onFormClose={() => setIsFormModalOpen(false)}
        onDeleteClose={() => setIsDeleteModalOpen(false)}
        onSubmit={handleSubmitProperty}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Properties;
