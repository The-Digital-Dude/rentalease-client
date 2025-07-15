import { useState } from "react";
import {
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiAddLine,
  RiMapPin2Line,
} from "react-icons/ri";
import { 
  PropertyFormModal,
  StatsGrid,
  TabNavigation,
  SearchFilterBar,
  PaymentCard,
  BillingCard,
  EmptyState,
  TenantInfo,
  LandlordInfo
} from "../../components";
import type { 
  TabItem, 
  FilterConfig, 
  Payment as PaymentType,
  PropertyBilling as PropertyBillingType
} from "../../components";
import "./PaymentProperty.scss";

// Using types from components
type Payment = PaymentType;
type PropertyBilling = PropertyBillingType;

interface Property {
  id: string;
  address: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  propertyManager: string;
  region: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
  createdDate: string;
  lastInspection?: string;
  nextInspection?: string;
  notes?: string;
}

interface PropertyFormData {
  address: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  propertyManager: string;
  region: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
  notes?: string;
}

// Mock data for payments
const mockPayments: Payment[] = [
  {
    id: "PAY001",
    propertyAddress: "123 Collins Street, Melbourne VIC 3000",
    propertyManager: "Melbourne Property Group",
    amount: 650,
    dueDate: "2024-02-01",
    paidDate: "2024-01-30",
    status: "Paid",
    paymentType: "Rent",
    description: "Weekly rent payment",
    invoiceNumber: "INV-2024-001",
    tenantName: "John Smith",
    paymentMethod: "Direct Debit",
    createdDate: "2024-01-15",
  },
  {
    id: "PAY002",
    propertyAddress: "456 George Street, Sydney NSW 2000",
    propertyManager: "Sydney Rentals",
    amount: 850,
    dueDate: "2024-02-01",
    status: "Pending",
    paymentType: "Rent",
    description: "Weekly rent payment",
    invoiceNumber: "INV-2024-002",
    tenantName: "Sarah Johnson",
    createdDate: "2024-01-20",
  },
  {
    id: "PAY003",
    propertyAddress: "789 Queen Street, Brisbane QLD 4000",
    propertyManager: "Brisbane Property Solutions",
    amount: 720,
    dueDate: "2024-01-28",
    status: "Overdue",
    paymentType: "Rent",
    description: "Weekly rent payment",
    invoiceNumber: "INV-2024-003",
    tenantName: "Mike Davis",
    createdDate: "2024-01-15",
  },
  {
    id: "PAY004",
    propertyAddress: "123 Collins Street, Melbourne VIC 3000",
    propertyManager: "Melbourne Property Group",
    amount: 250,
    dueDate: "2024-02-05",
    status: "Pending",
    paymentType: "Maintenance",
    description: "Plumbing repair costs",
    invoiceNumber: "INV-2024-004",
    tenantName: "John Smith",
    createdDate: "2024-01-25",
  },
];

// Mock data for property billing
const mockPropertyBilling: PropertyBilling[] = [
  {
    id: "BILL001",
    propertyAddress: "123 Collins Street, Melbourne VIC 3000",
    propertyManager: "Melbourne Property Group",
    totalOutstanding: 900,
    monthlyRent: 2800,
    bondAmount: 2800,
    lastPaymentDate: "2024-01-30",
    nextPaymentDue: "2024-02-05",
    tenantName: "John Smith",
    leaseStatus: "Active",
    paymentHistory: mockPayments.filter(
      (p) => p.propertyAddress === "123 Collins Street, Melbourne VIC 3000"
    ),
  },
  {
    id: "BILL002",
    propertyAddress: "456 George Street, Sydney NSW 2000",
    propertyManager: "Sydney Rentals",
    totalOutstanding: 850,
    monthlyRent: 3600,
    bondAmount: 3600,
    nextPaymentDue: "2024-02-01",
    tenantName: "Sarah Johnson",
    leaseStatus: "Active",
    paymentHistory: mockPayments.filter(
      (p) => p.propertyAddress === "456 George Street, Sydney NSW 2000"
    ),
  },
  {
    id: "BILL003",
    propertyAddress: "789 Queen Street, Brisbane QLD 4000",
    propertyManager: "Brisbane Property Solutions",
    totalOutstanding: 1440,
    monthlyRent: 3120,
    bondAmount: 3120,
    nextPaymentDue: "2024-01-28",
    tenantName: "Mike Davis",
    leaseStatus: "Active",
    paymentHistory: mockPayments.filter(
      (p) => p.propertyAddress === "789 Queen Street, Brisbane QLD 4000"
    ),
  },
];

// Mock data for existing properties
const mockProperties: Property[] = [
  {
    id: "PROP001",
    address: "123 Collins Street, Melbourne VIC 3000",
    propertyType: "Apartment",
    propertyManager: "Melbourne Property Group",
    region: "Melbourne Central",
    leaseStartDate: "2024-01-15",
    leaseEndDate: "2024-12-14",
    tenantName: "John Smith",
    tenantEmail: "john.smith@email.com",
    tenantPhone: "0412 345 678",
    landlordName: "Sarah Williams",
    landlordEmail: "sarah.williams@email.com",
    landlordPhone: "0423 567 890",
    createdDate: "2024-01-10",
    lastInspection: "2024-01-15",
    nextInspection: "2024-04-15",
    notes: "New tenant, bond paid in full. Excellent payment history.",
  },
  {
    id: "PROP002",
    address: "456 George Street, Sydney NSW 2000",
    propertyType: "House",
    propertyManager: "Sydney Rentals",
    region: "Sydney CBD",
    leaseStartDate: "2023-11-01",
    leaseEndDate: "2024-10-31",
    tenantName: "Sarah Johnson",
    tenantEmail: "sarah.johnson@email.com",
    tenantPhone: "0423 567 890",
    landlordName: "Michael Brown",
    landlordEmail: "michael.brown@email.com",
    landlordPhone: "0434 678 901",
    createdDate: "2024-01-05",
    lastInspection: "2024-01-20",
    nextInspection: "2024-04-20",
    notes: "Recently renovated kitchen. Long-term tenant, very reliable.",
  },
  {
    id: "PROP003",
    address: "789 Queen Street, Brisbane QLD 4000",
    propertyType: "Townhouse",
    propertyManager: "Brisbane Property Solutions",
    region: "Brisbane City",
    leaseStartDate: "2023-09-15",
    leaseEndDate: "2024-09-14",
    tenantName: "Mike Davis",
    tenantEmail: "mike.davis@email.com",
    tenantPhone: "0434 789 012",
    landlordName: "Emma Wilson",
    landlordEmail: "emma.wilson@email.com",
    landlordPhone: "0445 789 012",
    createdDate: "2024-01-08",
    lastInspection: "2024-01-25",
    nextInspection: "2024-02-15",
    notes:
      "Plumbing repairs in progress. Tenant staying elsewhere temporarily.",
  },
  {
    id: "PROP004",
    address: "321 Flinders Street, Adelaide SA 5000",
    propertyType: "Apartment",
    propertyManager: "Adelaide Property Services",
    region: "Adelaide CBD",
    leaseStartDate: "2024-02-01",
    leaseEndDate: "2025-01-31",
    tenantName: "Emma Wilson",
    tenantEmail: "emma.wilson@email.com",
    tenantPhone: "0445 123 456",
    landlordName: "David Chen",
    landlordEmail: "david.chen@email.com",
    landlordPhone: "0456 890 123",
    createdDate: "2024-01-20",
    lastInspection: "2024-02-01",
    nextInspection: "2024-05-01",
    notes: "Young professional, first-time renter. Good references.",
  },
  {
    id: "PROP005",
    address: "567 Hay Street, Perth WA 6000",
    propertyType: "House",
    propertyManager: "Perth Property Management",
    region: "Perth CBD",
    landlordName: "Robert Taylor",
    landlordEmail: "robert.taylor@email.com",
    landlordPhone: "0467 901 234",
    createdDate: "2024-01-25",
    lastInspection: "2024-02-01",
    nextInspection: "2024-05-01",
    notes:
      "Premium location, recently painted. Previous tenant relocated interstate.",
  },
  {
    id: "PROP006",
    address: "144 Bourke Street, Melbourne VIC 3000",
    propertyType: "Commercial",
    propertyManager: "Melbourne Commercial Properties",
    region: "Melbourne Central",
    leaseStartDate: "2023-07-01",
    leaseEndDate: "2026-06-30",
    tenantName: "Tech Solutions Pty Ltd",
    tenantEmail: "admin@techsolutions.com.au",
    tenantPhone: "03 9876 5432",
    landlordName: "Jennifer Lee",
    landlordEmail: "jennifer.lee@email.com",
    landlordPhone: "0478 012 345",
    createdDate: "2023-06-15",
    lastInspection: "2024-01-10",
    nextInspection: "2024-04-10",
    notes: "Commercial lease, 3-year term. Excellent business tenant.",
  },
  {
    id: "PROP007",
    address: "78 Elizabeth Street, Hobart TAS 7000",
    propertyType: "Townhouse",
    propertyManager: "Hobart Rentals",
    region: "Hobart CBD",
    leaseStartDate: "2024-03-01",
    leaseEndDate: "2025-02-28",
    tenantName: "David Chen",
    tenantEmail: "david.chen@email.com",
    tenantPhone: "0456 789 123",
    landlordName: "Karen White",
    landlordEmail: "karen.white@email.com",
    landlordPhone: "0489 123 456",
    createdDate: "2024-01-30",
    lastInspection: "2024-02-05",
    nextInspection: "2024-05-05",
    notes: "Lease approved, awaiting move-in. Bond received.",
  },
  {
    id: "PROP008",
    address: "99 King William Street, Adelaide SA 5000",
    propertyType: "Apartment",
    propertyManager: "Adelaide Property Services",
    region: "Adelaide CBD",
    leaseStartDate: "2024-01-01",
    leaseEndDate: "2024-12-31",
    tenantName: "Lisa Park",
    tenantEmail: "lisa.park@email.com",
    tenantPhone: "0467 890 234",
    landlordName: "Thomas Anderson",
    landlordEmail: "thomas.anderson@email.com",
    landlordPhone: "0490 234 567",
    createdDate: "2023-12-15",
    lastInspection: "2024-01-15",
    nextInspection: "2024-04-15",
    notes: "Quiet tenant, works from home. Excellent rental history.",
  },
];

const PaymentProperty = () => {
  const [payments] = useState<Payment[]>(mockPayments);
  const [propertyBilling] = useState<PropertyBilling[]>(mockPropertyBilling);
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [activeTab, setActiveTab] = useState("payments");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.propertyAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      payment.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "all" ||
      payment.paymentType.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredBilling = propertyBilling.filter((billing) => {
    const matchesSearch =
      billing.propertyAddress
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      billing.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.propertyManager.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Component handlers
  const handlePaymentView = (payment: Payment) => {
    console.log('View payment:', payment.id);
  };

  const handlePaymentDownload = (payment: Payment) => {
    console.log('Download payment:', payment.id);
  };

  const handleBillingViewHistory = (billing: PropertyBilling) => {
    console.log('View billing history:', billing.id);
  };

  const handleBillingDownloadStatement = (billing: PropertyBilling) => {
    console.log('Download billing statement:', billing.id);
  };

  // Tab configuration
  const tabs: TabItem[] = [
    { id: "payments", label: "Payment History", icon: RiFileListLine },
    { id: "billing", label: "Property Billing", icon: RiMoneyDollarBoxLine },
    { id: "manage-properties", label: "Manage Properties", icon: RiMapPin2Line },
  ];

  // Filter configurations
  const paymentFilters: FilterConfig[] = [
    {
      id: "status",
      placeholder: "All Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "overdue", label: "Overdue" },
        { value: "cancelled", label: "Cancelled" },
      ]
    },
    {
      id: "type",
      placeholder: "All Types",
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: "rent", label: "Rent" },
        { value: "bond", label: "Bond" },
        { value: "maintenance", label: "Maintenance" },
        { value: "utilities", label: "Utilities" },
        { value: "other", label: "Other" },
      ]
    }
  ];

  const getTotalStats = () => {
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const paidAmount = payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = payments
      .filter((p) => p.status === "Pending")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const overdueAmount = payments
      .filter((p) => p.status === "Overdue")
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      totalPayments: payments.length,
      paidPayments: payments.filter((p) => p.status === "Paid").length,
      pendingPayments: payments.filter((p) => p.status === "Pending").length,
      overduePayments: payments.filter((p) => p.status === "Overdue").length,
    };
  };

  const stats = getTotalStats();

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyManager.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Stats configuration
  const statsData = [
    {
      value: `$${stats.paidAmount.toLocaleString()}`,
      label: "Total Paid",
      count: `${stats.paidPayments} payments`,
      type: "success" as const
    },
    {
      value: `$${stats.pendingAmount.toLocaleString()}`,
      label: "Pending",
      count: `${stats.pendingPayments} payments`,
      type: "warning" as const
    },
    {
      value: `$${stats.overdueAmount.toLocaleString()}`,
      label: "Overdue",
      count: `${stats.overduePayments} payments`,
      type: "danger" as const
    },
    {
      value: `$${stats.totalAmount.toLocaleString()}`,
      label: "Total Amount",
      count: `${stats.totalPayments} payments`,
      type: "info" as const
    }
  ];

  // Property modal handlers
  const handlePropertySubmit = async (formData: PropertyFormData) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingProperty) {
        // Update existing property
        const updatedProperty: Property = {
          ...editingProperty,
          ...formData,
        };
        setProperties(
          properties.map((p) =>
            p.id === editingProperty.id ? updatedProperty : p
          )
        );
        setSuccessMessage("Property updated successfully!");
      } else {
        // Add new property
        const newProperty: Property = {
          id: `PROP${String(properties.length + 1).padStart(3, "0")}`,
          ...formData,
          createdDate: new Date().toISOString().split("T")[0],
          nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        };
        setProperties([...properties, newProperty]);
        setSuccessMessage("Property added successfully!");
      }

      setShowPropertyModal(false);
      setEditingProperty(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setErrorMessage("Failed to save property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowPropertyModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1>Payment & Property Management</h1>
            <p>Manage properties, payments, billing, and financial records</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingProperty(null);
              setShowPropertyModal(true);
            }}
          >
            <RiAddLine />
            Add Property
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <StatsGrid stats={statsData} />

      {/* Tab Navigation */}
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="tab-content">
        {activeTab === "payments" && (
          <div className="content-card">
            <div className="section-header">
              <h3>Payment History</h3>
              <p>Track all property-related payments and transactions</p>
            </div>

            <SearchFilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search payments..."
              filters={paymentFilters}
            />

            <div className="payments-list">
              {filteredPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onView={handlePaymentView}
                  onDownload={handlePaymentDownload}
                />
              ))}
            </div>

            {filteredPayments.length === 0 && (
              <EmptyState
                title="No Payments Found"
                description="No payments found matching your criteria."
              />
            )}
          </div>
        )}

        {activeTab === "billing" && (
          <div className="content-card">
            <div className="section-header">
              <h3>Property Billing Overview</h3>
              <p>Comprehensive billing information for all properties</p>
            </div>

            <SearchFilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search properties..."
            />

            <div className="billing-grid">
              {filteredBilling.map((billing) => (
                <BillingCard
                  key={billing.id}
                  billing={billing}
                  onViewHistory={handleBillingViewHistory}
                  onDownloadStatement={handleBillingDownloadStatement}
                />
              ))}
            </div>

            {filteredBilling.length === 0 && (
              <EmptyState
                title="No Billing Information Found"
                description="No billing information found matching your criteria."
              />
            )}
          </div>
        )}

        {activeTab === "manage-properties" && (
          <div className="content-card">
            <div className="section-header">
              <h3>Property Portfolio</h3>
              <p>Manage your existing properties</p>
            </div>

            <SearchFilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search properties..."
            />

            <div className="properties-grid">
              {filteredProperties.map((property) => (
                <div key={property.id} className="property-card">
                  <div className="property-header">
                    <div className="property-info">
                      <h4>{property.address}</h4>
                      <p className="property-type">{property.propertyType}</p>
                    </div>
                  </div>

                  <div className="property-details">
                    <div className="detail-row">
                      <span>Region:</span>
                      <span>{property.region}</span>
                    </div>
                    <div className="detail-row">
                      <span>Manager:</span>
                      <span>{property.propertyManager}</span>
                    </div>
                  </div>

                  {property.tenantName && (
                    <TenantInfo tenant={{
                      name: property.tenantName,
                      email: property.tenantEmail || '',
                      phone: property.tenantPhone || ''
                    }} />
                  )}

                  {property.landlordName && (
                    <LandlordInfo landlord={{
                      name: property.landlordName,
                      email: property.landlordEmail || '',
                      phone: property.landlordPhone || ''
                    }} />
                  )}

                  <div className="property-footer">
                    <div className="property-dates">
                      <small>Added: {property.createdDate}</small>
                      {property.nextInspection && (
                        <small>
                          Next Inspection: {property.nextInspection}
                        </small>
                      )}
                    </div>

                    <div className="property-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditProperty(property)}
                      >
                        Edit Property
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <EmptyState
                title="No Properties Found"
                description="No properties found matching your criteria."
              />
            )}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      {/* <PropertyFormModal
        isOpen={showPropertyModal}
        onClose={() => {
          setShowPropertyModal(false);
          setEditingProperty(null);
        }}
        onSubmit={handlePropertySubmit}
        editingProperty={editingProperty}
        isSubmitting={isSubmitting}
      /> */}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="success-message-toast">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="error-message-toast">{errorMessage}</div>
      )}
    </div>
  );
};

export default PaymentProperty;
