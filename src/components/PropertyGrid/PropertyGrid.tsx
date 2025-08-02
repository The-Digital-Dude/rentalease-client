import React from "react";
import SearchFilterBar from "../SearchFilterBar";
import PropertyCard from "../PropertyCard";
import EmptyState from "../EmptyState";
import type { Property } from "../PropertyCard/PropertyCard";
import type { FilterConfig } from "../SearchFilterBar";
import { RiHomeLine } from "react-icons/ri";
import "./PropertyGrid.scss";

interface PropertyGridProps {
  properties: Property[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onPropertyEdit?: (property: Property) => void;
  onPropertyView?: (property: Property) => void;
  showActions?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  onClearAll?: () => void;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search properties...",
  filters = [],
  onPropertyEdit,
  onPropertyView,
  showActions = true,
  emptyStateTitle = "No Properties Found",
  emptyStateDescription = "No properties found matching your criteria.",
  emptyStateAction,
  className = "",
  onClearAll,
}) => {
  return (
    <div className={`property-grid-container ${className}`}>
      <SearchFilterBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        onClearAll={onClearAll}
      />

      {properties.length > 0 ? (
        <div className="properties-grid">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={onPropertyEdit}
              onView={onPropertyView}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={RiHomeLine}
          title={emptyStateTitle}
          description={emptyStateDescription}
          action={emptyStateAction}
        />
      )}
    </div>
  );
};

export default PropertyGrid;
