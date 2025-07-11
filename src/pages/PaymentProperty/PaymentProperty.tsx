import { useState } from "react";
import {
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiDownloadLine,
  RiEyeLine,
  RiSearchLine,
  RiFilterLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseCircleLine,
  RiAlertLine,
  RiAddLine,
  RiMapPin2Line,
} from "react-icons/ri";
import { PropertyFormModal } from "../../components";
import "./PaymentProperty.scss";

interface Payment {
  id: string;
  propertyAddress: string;
  propertyManager: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  paymentType: "Rent" | "Bond" | "Maintenance" | "Utilities" | "Other";
  description?: string;
  invoiceNumber: string;
  tenantName?: string;
  paymentMethod?: string;
  createdDate: string;
}

interface PropertyBilling {
  id: string;
  propertyAddress: string;
  propertyManager: string;
  totalOutstanding: number;
  monthlyRent: number;
  bondAmount: number;
  lastPaymentDate?: string;
  nextPaymentDue: string;
  paymentHistory: Payment[];
  tenantName?: string;
  leaseStatus: "Active" | "Expired" | "Pending" | "Terminated";
}

interface Property {
  id: string;
  address: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  propertyManager: string;
  region: string;
  status: "Available" | "Occupied" | "Maintenance" | "Pending";
  leaseStartDate?: string;
  leaseEndDate?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  createdDate: string;
  lastInspection?: string;
  nextInspection?: string;
  notes?: string;
}

interface PropertyFormData {
  address: string;
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  propertyManager: string;
  region: string;
  status: "Available" | "Occupied" | "Maintenance" | "Pending";
  leaseStartDate?: string;
  leaseEndDate?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
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
    bedrooms: 2,
    bathrooms: 2,
    rentAmount: 650,
    propertyManager: "Melbourne Property Group",
    region: "Melbourne Central",
    status: "Occupied",
    leaseStartDate: "2024-01-15",
    leaseEndDate: "2024-12-14",
    tenantName: "John Smith",
    tenantEmail: "john.smith@email.com",
    tenantPhone: "0412 345 678",
    createdDate: "2024-01-10",
    lastInspection: "2024-01-15",
    nextInspection: "2024-04-15",
    notes: "New tenant, bond paid in full. Excellent payment history.",
  },
  {
    id: "PROP002",
    address: "456 George Street, Sydney NSW 2000",
    propertyType: "House",
    bedrooms: 3,
    bathrooms: 2,
    rentAmount: 850,
    propertyManager: "Sydney Rentals",
    region: "Sydney CBD",
    status: "Occupied",
    leaseStartDate: "2023-11-01",
    leaseEndDate: "2024-10-31",
    tenantName: "Sarah Johnson",
    tenantEmail: "sarah.johnson@email.com",
    tenantPhone: "0423 567 890",
    createdDate: "2024-01-05",
    lastInspection: "2024-01-20",
    nextInspection: "2024-04-20",
    notes: "Recently renovated kitchen. Long-term tenant, very reliable.",
  },
  {
    id: "PROP003",
    address: "789 Queen Street, Brisbane QLD 4000",
    propertyType: "Townhouse",
    bedrooms: 3,
    bathrooms: 3,
    rentAmount: 720,
    propertyManager: "Brisbane Property Solutions",
    region: "Brisbane City",
    status: "Maintenance",
    leaseStartDate: "2023-09-15",
    leaseEndDate: "2024-09-14",
    tenantName: "Mike Davis",
    tenantEmail: "mike.davis@email.com",
    tenantPhone: "0434 789 012",
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
    bedrooms: 1,
    bathrooms: 1,
    rentAmount: 420,
    propertyManager: "Adelaide Property Services",
    region: "Adelaide CBD",
    status: "Occupied",
    leaseStartDate: "2024-02-01",
    leaseEndDate: "2025-01-31",
    tenantName: "Emma Wilson",
    tenantEmail: "emma.wilson@email.com",
    tenantPhone: "0445 123 456",
    createdDate: "2024-01-20",
    lastInspection: "2024-02-01",
    nextInspection: "2024-05-01",
    notes: "Young professional, first-time renter. Good references.",
  },
  {
    id: "PROP005",
    address: "567 Hay Street, Perth WA 6000",
    propertyType: "House",
    bedrooms: 4,
    bathrooms: 2,
    rentAmount: 980,
    propertyManager: "Perth Property Management",
    region: "Perth CBD",
    status: "Available",
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
    bedrooms: 0,
    bathrooms: 2,
    rentAmount: 1250,
    propertyManager: "Melbourne Commercial Properties",
    region: "Melbourne Central",
    status: "Occupied",
    leaseStartDate: "2023-07-01",
    leaseEndDate: "2026-06-30",
    tenantName: "Tech Solutions Pty Ltd",
    tenantEmail: "admin@techsolutions.com.au",
    tenantPhone: "03 9876 5432",
    createdDate: "2023-06-15",
    lastInspection: "2024-01-10",
    nextInspection: "2024-04-10",
    notes: "Commercial lease, 3-year term. Excellent business tenant.",
  },
  {
    id: "PROP007",
    address: "78 Elizabeth Street, Hobart TAS 7000",
    propertyType: "Townhouse",
    bedrooms: 2,
    bathrooms: 2,
    rentAmount: 550,
    propertyManager: "Hobart Rentals",
    region: "Hobart CBD",
    status: "Pending",
    leaseStartDate: "2024-03-01",
    leaseEndDate: "2025-02-28",
    tenantName: "David Chen",
    tenantEmail: "david.chen@email.com",
    tenantPhone: "0456 789 123",
    createdDate: "2024-01-30",
    lastInspection: "2024-02-05",
    nextInspection: "2024-05-05",
    notes: "Lease approved, awaiting move-in. Bond received.",
  },
  {
    id: "PROP008",
    address: "99 King William Street, Adelaide SA 5000",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 1,
    rentAmount: 480,
    propertyManager: "Adelaide Property Services",
    region: "Adelaide CBD",
    status: "Occupied",
    leaseStartDate: "2023-12-01",
    leaseEndDate: "2024-11-30",
    tenantName: "Lisa Martinez",
    tenantEmail: "lisa.martinez@email.com",
    tenantPhone: "0467 890 234",
    createdDate: "2023-11-15",
    lastInspection: "2024-01-15",
    nextInspection: "2024-04-15",
    notes: "Responsible tenant, always pays on time. Works in healthcare.",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Pending":
        return "status-pending";
      case "Overdue":
        return "status-overdue";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <RiCheckLine />;
      case "Pending":
        return <RiAlertLine />;
      case "Overdue":
        return <RiCloseCircleLine />;
      case "Cancelled":
        return <RiCloseCircleLine />;
      default:
        return <RiAlertLine />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "Rent":
        return "type-rent";
      case "Bond":
        return "type-bond";
      case "Maintenance":
        return "type-maintenance";
      case "Utilities":
        return "type-utilities";
      case "Other":
        return "type-other";
      default:
        return "type-default";
    }
  };

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
    const matchesStatus =
      statusFilter === "all" ||
      property.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getPropertyStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "status-available";
      case "Occupied":
        return "status-occupied";
      case "Maintenance":
        return "status-maintenance";
      case "Pending":
        return "status-pending";
      default:
        return "status-default";
    }
  };

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

  const tabs = [
    { id: "payments", label: "Payment History", icon: RiFileListLine },
    { id: "billing", label: "Property Billing", icon: RiMoneyDollarBoxLine },
    {
      id: "manage-properties",
      label: "Manage Properties",
      icon: RiMapPin2Line,
    },
  ];

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
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-value">${stats.paidAmount.toLocaleString()}</div>
          <div className="stat-label">Total Paid</div>
          <div className="stat-count">{stats.paidPayments} payments</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">
            ${stats.pendingAmount.toLocaleString()}
          </div>
          <div className="stat-label">Pending</div>
          <div className="stat-count">{stats.pendingPayments} payments</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">
            ${stats.overdueAmount.toLocaleString()}
          </div>
          <div className="stat-label">Overdue</div>
          <div className="stat-count">{stats.overduePayments} payments</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">
            ${stats.totalAmount.toLocaleString()}
          </div>
          <div className="stat-label">Total Amount</div>
          <div className="stat-count">{stats.totalPayments} payments</div>
        </div>
      </div>

      <div className="payment-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === "payments" && (
          <div className="content-card">
            <div className="section-header">
              <h3>Payment History</h3>
              <p>Track all property-related payments and transactions</p>
            </div>

            <div className="payment-controls">
              <div className="search-box">
                <RiSearchLine />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-box">
                <RiFilterLine />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="filter-box">
                <RiFilterLine />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="rent">Rent</option>
                  <option value="bond">Bond</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="payments-list">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-info">
                      <h4>{payment.propertyAddress}</h4>
                      <p className="invoice-number">#{payment.invoiceNumber}</p>
                    </div>
                    <div className="payment-badges">
                      <span
                        className={`status-badge ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                      <span
                        className={`type-badge ${getPaymentTypeColor(
                          payment.paymentType
                        )}`}
                      >
                        {payment.paymentType}
                      </span>
                    </div>
                  </div>

                  <div className="payment-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span className="amount">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Due Date:</span>
                      <span>{payment.dueDate}</span>
                    </div>
                    {payment.paidDate && (
                      <div className="detail-row">
                        <span>Paid Date:</span>
                        <span>{payment.paidDate}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span>Tenant:</span>
                      <span>{payment.tenantName || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                      <span>Property Manager:</span>
                      <span>{payment.propertyManager}</span>
                    </div>
                    {payment.paymentMethod && (
                      <div className="detail-row">
                        <span>Payment Method:</span>
                        <span>{payment.paymentMethod}</span>
                      </div>
                    )}
                  </div>

                  {payment.description && (
                    <div className="payment-description">
                      <p>{payment.description}</p>
                    </div>
                  )}

                  <div className="payment-actions">
                    <button className="action-btn view-btn">
                      <RiEyeLine />
                      View Details
                    </button>
                    <button className="action-btn download-btn">
                      <RiDownloadLine />
                      Download Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPayments.length === 0 && (
              <div className="no-payments">
                <p>No payments found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "billing" && (
          <div className="content-card">
            <div className="section-header">
              <h3>Property Billing Overview</h3>
              <p>Comprehensive billing information for all properties</p>
            </div>

            <div className="billing-controls">
              <div className="search-box">
                <RiSearchLine />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="billing-grid">
              {filteredBilling.map((billing) => (
                <div key={billing.id} className="billing-card">
                  <div className="billing-header">
                    <div className="property-info">
                      <h4>{billing.propertyAddress}</h4>
                      <p className="property-manager">
                        {billing.propertyManager}
                      </p>
                    </div>
                    <div className="lease-status">
                      <span
                        className={`status-badge ${
                          billing.leaseStatus === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {billing.leaseStatus}
                      </span>
                    </div>
                  </div>

                  <div className="billing-summary">
                    <div className="summary-item outstanding">
                      <span className="label">Outstanding Amount</span>
                      <span className="value">
                        ${billing.totalOutstanding.toLocaleString()}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Monthly Rent</span>
                      <span className="value">
                        ${billing.monthlyRent.toLocaleString()}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Bond Amount</span>
                      <span className="value">
                        ${billing.bondAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="billing-details">
                    <div className="detail-row">
                      <span>Tenant:</span>
                      <span>{billing.tenantName || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                      <span>Next Payment Due:</span>
                      <span className="due-date">
                        <RiCalendarLine />
                        {billing.nextPaymentDue}
                      </span>
                    </div>
                    {billing.lastPaymentDate && (
                      <div className="detail-row">
                        <span>Last Payment:</span>
                        <span>{billing.lastPaymentDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="payment-history-summary">
                    <h5>Recent Payments</h5>
                    <div className="payment-count">
                      <span>
                        Total Payments: {billing.paymentHistory.length}
                      </span>
                      <span>
                        Paid:{" "}
                        {
                          billing.paymentHistory.filter(
                            (p) => p.status === "Paid"
                          ).length
                        }
                      </span>
                      <span>
                        Pending:{" "}
                        {
                          billing.paymentHistory.filter(
                            (p) => p.status === "Pending"
                          ).length
                        }
                      </span>
                    </div>
                  </div>

                  <div className="billing-actions">
                    <button className="action-btn view-btn">
                      <RiEyeLine />
                      View Full History
                    </button>
                    <button className="action-btn download-btn">
                      <RiDownloadLine />
                      Download Statement
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBilling.length === 0 && (
              <div className="no-billing">
                <p>No billing information found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "manage-properties" && (
          <div className="content-card">
            <div className="section-header">
              <h3>Property Portfolio</h3>
              <p>Manage your existing properties</p>
            </div>

            <div className="property-controls">
              <div className="search-box">
                <RiSearchLine />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-box">
                <RiFilterLine />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="properties-grid">
              {filteredProperties.map((property) => (
                <div key={property.id} className="property-card">
                  <div className="property-header">
                    <div className="property-info">
                      <h4>{property.address}</h4>
                      <p className="property-type">{property.propertyType}</p>
                    </div>
                    <span
                      className={`status-badge ${getPropertyStatusColor(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <div className="property-details">
                    <div className="detail-row">
                      <span>Bedrooms:</span>
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="detail-row">
                      <span>Bathrooms:</span>
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="detail-row">
                      <span>Weekly Rent:</span>
                      <span className="rent-amount">
                        ${property.rentAmount}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Region:</span>
                      <span>{property.region}</span>
                    </div>
                    <div className="detail-row">
                      <span>Manager:</span>
                      <span>{property.propertyManager}</span>
                    </div>
                  </div>

                  {property.status === "Occupied" && property.tenantName && (
                    <div className="tenant-info">
                      <h5>Tenant Information</h5>
                      <p>
                        <strong>Name:</strong> {property.tenantName}
                      </p>
                      {property.tenantEmail && (
                        <p>
                          <strong>Email:</strong> {property.tenantEmail}
                        </p>
                      )}
                      {property.tenantPhone && (
                        <p>
                          <strong>Phone:</strong> {property.tenantPhone}
                        </p>
                      )}
                      {property.leaseEndDate && (
                        <p>
                          <strong>Lease End:</strong> {property.leaseEndDate}
                        </p>
                      )}
                    </div>
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
                        <RiEyeLine />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="no-properties">
                <p>No properties found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={showPropertyModal}
        onClose={() => {
          setShowPropertyModal(false);
          setEditingProperty(null);
        }}
        onSubmit={handlePropertySubmit}
        editingProperty={editingProperty}
        isSubmitting={isSubmitting}
      />

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
