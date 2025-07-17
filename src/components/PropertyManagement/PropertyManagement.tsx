import React, { useState, useMemo } from "react";
import PropertyGrid from "../PropertyGrid";
import type { Property } from "../PropertyCard";
import type { FilterConfig } from "../SearchFilterBar";
import "./PropertyManagement.scss";

interface PropertyManagementProps {
  properties: Property[];
  onPropertyEdit?: (property: Property) => void;
  onPropertyView?: (property: Property) => void;
  onAddProperty?: () => void;
  showActions?: boolean;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  enableFilters?: boolean;
  className?: string;
}

const PropertyManagement: React.FC<PropertyManagementProps> = ({
  properties,
  onPropertyEdit,
  onPropertyView,
  onAddProperty,
  showActions = true,
  title = "Property Portfolio",
  description = "Manage your existing properties",
  searchPlaceholder = "Search properties...",
  enableFilters = true,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get unique regions and property types for filters
  const uniqueRegions = useMemo(() => {
    const regions = properties.map((p) => p.region).filter(Boolean);
    return [...new Set(regions)].sort();
  }, [properties]);

  const uniquePropertyTypes = useMemo(() => {
    const types = properties.map((p) => p.propertyType).filter(Boolean);
    return [...new Set(types)].sort();
  }, [properties]);

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.address.fullAddress
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.propertyManager
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.currentTenant?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.currentLandlord?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRegion =
        regionFilter === "all" || property.region === regionFilter;
      const matchesType =
        typeFilter === "all" || property.propertyType === typeFilter;

      // Status filtering based on tenant occupancy
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "occupied" && property.currentTenant) ||
        (statusFilter === "vacant" && !property.currentTenant);

      return matchesSearch && matchesRegion && matchesType && matchesStatus;
    });
  }, [properties, searchTerm, regionFilter, typeFilter, statusFilter]);

  // Filter configurations
  const filters: FilterConfig[] = enableFilters
    ? [
        {
          id: "region",
          placeholder: "All Regions",
          value: regionFilter,
          onChange: setRegionFilter,
          options: uniqueRegions.map((region) => ({
            value: region,
            label: region,
          })),
        },
        {
          id: "type",
          placeholder: "All Types",
          value: typeFilter,
          onChange: setTypeFilter,
          options: uniquePropertyTypes.map((type) => ({
            value: type,
            label: type,
          })),
        },
        {
          id: "status",
          placeholder: "All Status",
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { value: "occupied", label: "Occupied" },
            { value: "vacant", label: "Vacant" },
          ],
        },
      ]
    : [];

  return (
    <div className={`property-management ${className}`}>
      <div className="section-header">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <PropertyGrid
        properties={filteredProperties}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        onPropertyEdit={onPropertyEdit}
        onPropertyView={onPropertyView}
        showActions={showActions}
        emptyStateAction={
          onAddProperty
            ? {
                label: "Add Property",
                onClick: onAddProperty,
              }
            : undefined
        }
      />
    </div>
  );
};

export default PropertyManagement;
