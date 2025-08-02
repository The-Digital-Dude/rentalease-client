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
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [propertyManagerFilter, setPropertyManagerFilter] =
    useState<string>("all");
  const [complianceStatusFilter, setComplianceStatusFilter] =
    useState<string>("all");
  const [complianceTypeFilter, setComplianceTypeFilter] =
    useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [bedroomsFilter, setBedroomsFilter] = useState<string>("all");

  // Get unique values for filters
  const uniqueRegions = useMemo(() => {
    const regions = properties.map((p) => p.region).filter(Boolean);
    return [...new Set(regions)].sort();
  }, [properties]);

  const uniquePropertyTypes = useMemo(() => {
    const types = properties.map((p) => p.propertyType).filter(Boolean);
    return [...new Set(types)].sort();
  }, [properties]);

  const uniqueStates = useMemo(() => {
    const states = properties.map((p) => p.address.state).filter(Boolean);
    return [...new Set(states)].sort();
  }, [properties]);

  const uniqueAgencies = useMemo(() => {
    const agencies = properties
      .map((p) => p.agency?.companyName)
      .filter(Boolean);
    return [...new Set(agencies)].sort();
  }, [properties]);

  const uniquePropertyManagers = useMemo(() => {
    const managers = properties.map((p) => p.propertyManager).filter(Boolean);
    return [...new Set(managers)].sort();
  }, [properties]);

  const uniqueBedrooms = useMemo(() => {
    const bedrooms = properties.map((p) => p.bedrooms).filter(Boolean);
    return [...new Set(bedrooms)].sort((a, b) => a - b);
  }, [properties]);

  // Helper function to check if property has compliance issues
  const hasComplianceIssues = (property: Property) => {
    const compliance = property.complianceSchedule;
    if (!compliance) return false;

    return (
      compliance.gasCompliance?.status === "Overdue" ||
      compliance.electricalSafety?.status === "Overdue" ||
      compliance.smokeAlarms?.status === "Overdue" ||
      compliance.poolSafety?.status === "Overdue" ||
      compliance.gasCompliance?.status === "Due Soon" ||
      compliance.electricalSafety?.status === "Due Soon" ||
      compliance.smokeAlarms?.status === "Due Soon" ||
      compliance.poolSafety?.status === "Due Soon"
    );
  };

  // Helper function to check if property has specific compliance type issues
  const hasComplianceTypeIssue = (
    property: Property,
    complianceType: string
  ) => {
    const compliance = property.complianceSchedule;
    if (!compliance) return false;

    switch (complianceType) {
      case "gas":
        return (
          compliance.gasCompliance?.status === "Overdue" ||
          compliance.gasCompliance?.status === "Due Soon"
        );
      case "electrical":
        return (
          compliance.electricalSafety?.status === "Overdue" ||
          compliance.electricalSafety?.status === "Due Soon"
        );
      case "smoke":
        return (
          compliance.smokeAlarms?.status === "Overdue" ||
          compliance.smokeAlarms?.status === "Due Soon"
        );
      case "pool":
        return (
          compliance.poolSafety?.status === "Overdue" ||
          compliance.poolSafety?.status === "Due Soon"
        );
      default:
        return false;
    }
  };

  // Helper function to check if property was created within date range
  const isWithinDateRange = (property: Property, range: string) => {
    if (!property.createdAt) return false;
    const createdAt = new Date(property.createdAt);
    const now = new Date();
    const daysDiff =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    switch (range) {
      case "last7days":
        return daysDiff <= 7;
      case "last30days":
        return daysDiff <= 30;
      case "last90days":
        return daysDiff <= 90;
      case "last6months":
        return daysDiff <= 180;
      case "lastyear":
        return daysDiff <= 365;
      default:
        return true;
    }
  };

  // Clear all filters function
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setRegionFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setStateFilter("all");
    setAgencyFilter("all");
    setPropertyManagerFilter("all");
    setComplianceStatusFilter("all");
    setComplianceTypeFilter("all");
    setDateRangeFilter("all");
    setBedroomsFilter("all");
  };

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
          .includes(searchTerm.toLowerCase()) ||
        property.agency?.companyName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRegion =
        regionFilter === "all" || property.region === regionFilter;
      const matchesType =
        typeFilter === "all" || property.propertyType === typeFilter;
      const matchesState =
        stateFilter === "all" || property.address.state === stateFilter;
      const matchesAgency =
        agencyFilter === "all" || property.agency?.companyName === agencyFilter;
      const matchesPropertyManager =
        propertyManagerFilter === "all" ||
        property.propertyManager === propertyManagerFilter;

      // Status filtering based on tenant occupancy
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "occupied" && property.currentTenant) ||
        (statusFilter === "vacant" && !property.currentTenant);

      // Compliance status filtering
      const matchesComplianceStatus =
        complianceStatusFilter === "all" ||
        (complianceStatusFilter === "overdue" &&
          property.hasOverdueCompliance) ||
        (complianceStatusFilter === "dueSoon" &&
          hasComplianceIssues(property) &&
          !property.hasOverdueCompliance) ||
        (complianceStatusFilter === "compliant" &&
          !hasComplianceIssues(property));

      // Compliance type filtering
      const matchesComplianceType =
        complianceTypeFilter === "all" ||
        hasComplianceTypeIssue(property, complianceTypeFilter);

      // Date range filtering
      const matchesDateRange = isWithinDateRange(property, dateRangeFilter);

      // Bedrooms filtering
      const matchesBedrooms =
        bedroomsFilter === "all" ||
        property.bedrooms?.toString() === bedroomsFilter;

      return (
        matchesSearch &&
        matchesRegion &&
        matchesType &&
        matchesStatus &&
        matchesState &&
        matchesAgency &&
        matchesPropertyManager &&
        matchesComplianceStatus &&
        matchesComplianceType &&
        matchesDateRange &&
        matchesBedrooms
      );
    });
  }, [
    properties,
    searchTerm,
    regionFilter,
    typeFilter,
    statusFilter,
    stateFilter,
    agencyFilter,
    propertyManagerFilter,
    complianceStatusFilter,
    complianceTypeFilter,
    dateRangeFilter,
    bedroomsFilter,
  ]);

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
        {
          id: "state",
          placeholder: "All States",
          value: stateFilter,
          onChange: setStateFilter,
          options: uniqueStates.map((state) => ({
            value: state,
            label: state,
          })),
        },
        {
          id: "agency",
          placeholder: "All Agencies",
          value: agencyFilter,
          onChange: setAgencyFilter,
          options: uniqueAgencies.map((agency) => ({
            value: agency,
            label: agency,
          })),
        },
        {
          id: "propertyManager",
          placeholder: "All Property Managers",
          value: propertyManagerFilter,
          onChange: setPropertyManagerFilter,
          options: uniquePropertyManagers.map((manager) => ({
            value: manager,
            label: manager,
          })),
        },
        {
          id: "complianceStatus",
          placeholder: "All Compliance Status",
          value: complianceStatusFilter,
          onChange: setComplianceStatusFilter,
          options: [
            { value: "overdue", label: "Overdue" },
            { value: "dueSoon", label: "Due Soon" },
            { value: "compliant", label: "Compliant" },
          ],
        },
        {
          id: "complianceType",
          placeholder: "All Compliance Types",
          value: complianceTypeFilter,
          onChange: setComplianceTypeFilter,
          options: [
            { value: "gas", label: "Gas Compliance" },
            { value: "electrical", label: "Electrical Safety" },
            { value: "smoke", label: "Smoke Alarms" },
            { value: "pool", label: "Pool Safety" },
          ],
        },
        {
          id: "dateRange",
          placeholder: "All Time",
          value: dateRangeFilter,
          onChange: setDateRangeFilter,
          options: [
            { value: "last7days", label: "Last 7 Days" },
            { value: "last30days", label: "Last 30 Days" },
            { value: "last90days", label: "Last 90 Days" },
            { value: "last6months", label: "Last 6 Months" },
            { value: "lastyear", label: "Last Year" },
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
        onClearAll={handleClearAllFilters}
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
