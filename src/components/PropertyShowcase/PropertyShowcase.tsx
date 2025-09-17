import React from 'react';
import { RiEyeLine, RiEditLine, RiAddLine } from 'react-icons/ri';
import PropertyCard from '../PropertyCard';
import PropertyGrid from '../PropertyGrid';
import PropertyManagement from '../PropertyManagement';
import type { Property } from '../PropertyCard';
import './PropertyShowcase.scss';

// Sample property data for demonstration
const sampleProperties: Property[] = [
  {
    id: "DEMO001",
    address: {
      street: "123 Demo Street",
      suburb: "Example City",
      state: "VIC",
      postcode: "3000",
      fullAddress: "123 Demo Street, Example City VIC 3000",
    },
    fullAddress: "123 Demo Street, Example City VIC 3000",
    propertyType: "Apartment",
    propertyManager: "Demo Property Group",
    region: "Example Region",
    currentTenant: {
      name: "John Demo",
      email: "john.demo@example.com",
      phone: "0412 345 678",
    },
    currentLandlord: {
      name: "Sarah Example",
      email: "sarah.example@email.com",
      phone: "0423 567 890",
    },
    agency: {
      _id: "agency-demo",
      companyName: "Demo Realty",
      contactPerson: "Alex Agent",
      email: "contact@demorealty.com",
      phone: "1300 000 000",
    },
    complianceSchedule: {
      gasCompliance: { status: "Compliant" },
      electricalSafety: { status: "Due Soon" },
      smokeAlarms: { status: "Compliant" },
      poolSafety: { status: "Not Required" },
    },
    complianceSummary: {
      compliant: 2,
      dueSoon: 1,
      overdue: 0,
    },
    bedrooms: 2,
    notes:
      "This is a demonstration property showing the PropertyCard component with all features.",
  },
  {
    id: "DEMO002",
    address: {
      street: "456 Sample Avenue",
      suburb: "Test Town",
      state: "NSW",
      postcode: "2000",
      fullAddress: "456 Sample Avenue, Test Town NSW 2000",
    },
    fullAddress: "456 Sample Avenue, Test Town NSW 2000",
    propertyType: "House",
    propertyManager: "Sample Rentals",
    region: "Test Region",
    currentLandlord: {
      name: "Michael Test",
      email: "michael.test@email.com",
      phone: "0434 678 901",
    },
    agency: {
      _id: "agency-sample",
      companyName: "Sample Rentals",
      contactPerson: "Taylor Manager",
      email: "hello@samplerentals.com",
      phone: "1300 111 111",
    },
    complianceSchedule: {
      gasCompliance: { status: "Due Soon" },
      electricalSafety: { status: "Compliant" },
      smokeAlarms: { status: "Compliant" },
      poolSafety: { status: "Not Required" },
    },
    complianceSummary: {
      compliant: 3,
      dueSoon: 1,
      overdue: 0,
    },
    bedrooms: 3,
    notes: "Vacant property available for rent.",
  },
];

interface PropertyShowcaseProps {
  className?: string;
}

const PropertyShowcase: React.FC<PropertyShowcaseProps> = ({ className = '' }) => {
  const handlePropertyEdit = (property: Property) => {
    alert(`Edit property: ${property.fullAddress || property.address.fullAddress}`);
  };

  const handlePropertyView = (property: Property) => {
    alert(`View property details: ${property.fullAddress || property.address.fullAddress}`);
  };

  const handleAddProperty = () => {
    alert('Add new property clicked!');
  };

  return (
    <div className={`property-showcase ${className}`}>
      <div className="showcase-section">
        <h2>Property Component Showcase</h2>
        <p>Demonstration of reusable PropertyCard, PropertyGrid, and PropertyManagement components</p>
      </div>

      {/* Single Property Card Example */}
      <div className="showcase-section">
        <h3>Individual Property Card</h3>
        <p>Display a single property with all features enabled</p>
        <div className="single-card-demo">
          <PropertyCard
            property={sampleProperties[0]}
            onEdit={handlePropertyEdit}
            onView={handlePropertyView}
            showActions={true}
          />
        </div>
      </div>

      {/* Property Card without Actions */}
      <div className="showcase-section">
        <h3>Property Card (View Only)</h3>
        <p>Property card with actions disabled - perfect for display-only contexts</p>
        <div className="single-card-demo">
          <PropertyCard
            property={sampleProperties[1]}
            showActions={false}
          />
        </div>
      </div>

      {/* Property Grid Example */}
      <div className="showcase-section">
        <h3>Property Grid with Search</h3>
        <p>Grid layout with search functionality but no filters</p>
        <PropertyGrid
          properties={sampleProperties}
          searchValue=""
          onSearchChange={(value) => console.log('Search:', value)}
          searchPlaceholder="Search demo properties..."
          onPropertyEdit={handlePropertyEdit}
          onPropertyView={handlePropertyView}
          emptyStateAction={{
            label: "Add Demo Property",
            onClick: handleAddProperty
          }}
        />
      </div>

      {/* Complete Property Management */}
      <div className="showcase-section">
        <h3>Complete Property Management</h3>
        <p>Full-featured property management with intelligent filtering and search</p>
        <PropertyManagement
          properties={sampleProperties}
          onPropertyEdit={handlePropertyEdit}
          onPropertyView={handlePropertyView}
          onAddProperty={handleAddProperty}
          title="Demo Property Portfolio"
          description="Advanced property management with automatic filtering options"
          enableFilters={true}
        />
      </div>

      {/* Usage Examples */}
      <div className="showcase-section">
        <h3>Usage Examples</h3>
        <div className="usage-examples">
          <div className="example-card">
            <h4><RiEyeLine /> PropertyCard</h4>
            <p>Perfect for individual property displays, cards, or detail views</p>
            <code>
              {`<PropertyCard 
  property={property} 
  onEdit={handleEdit}
  onView={handleView}
/>`}
            </code>
          </div>

          <div className="example-card">
            <h4><RiEditLine /> PropertyGrid</h4>
            <p>Ideal for property listings with search and responsive grid layout</p>
            <code>
              {`<PropertyGrid 
  properties={properties}
  searchValue={search}
  onSearchChange={setSearch}
  filters={filterConfig}
/>`}
            </code>
          </div>

          <div className="example-card">
            <h4><RiAddLine /> PropertyManagement</h4>
            <p>Complete solution with intelligent filtering and all management features</p>
            <code>
              {`<PropertyManagement 
  properties={properties}
  onPropertyEdit={handleEdit}
  enableFilters={true}
/>`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyShowcase; 
