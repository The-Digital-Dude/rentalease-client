import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdFilterList,
  MdSearch,
  MdVisibility,
  MdEdit,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdTrendingUp,
  MdReceipt,
  MdPendingActions,
  MdAdd,
  MdDelete,
} from "react-icons/md";
import propertyManagerInvoiceService from "../../services/propertyManagerInvoiceService";
import propertyService from "../../services/propertyService";
import { useAppSelector } from "../../store";
import { InvoiceCreateModal } from "../../components/InvoiceCreateModal/InvoiceCreateModal";
import { InvoiceDetailsModal } from "../../components/InvoiceDetailsModal/InvoiceDetailsModal";
import { InvoiceResponseModal } from "../../components/InvoiceResponseModal/InvoiceResponseModal";
import { toast } from "react-toastify";
import "./InvoiceManagement.scss";

interface DashboardStats {
  totalInvoices: number;
  pendingInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  totalValue: number;
  paidValue: number;
  pendingValue: number;
}

interface InvoiceListItem {
  _id: string;
  invoiceNumber: string;
  property?: any;
  propertyManager?: any;
  agency?: any;
  description: string;
  amount: number;
  dueDate: string;
  status: "Pending" | "Sent" | "Paid";
  notes?: string;
  sentAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt?: string;
}

type TabType = "pending" | "sent" | "paid" | "all";

interface Property {
  id: string;
  fullAddress: string;
  assignedPropertyManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceListItem[]>(
    []
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalInvoices: 0,
    pendingInvoices: 0,
    sentInvoices: 0,
    paidInvoices: 0,
    totalValue: 0,
    paidValue: 0,
    pendingValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    property: "",
    propertyManager: "",
    status: "",
  });
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceListItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userType } = useAppSelector((state) => state.user);

  useEffect(() => {
    fetchInvoices();
    fetchProperties();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, activeTab, searchTerm, filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response =
        await propertyManagerInvoiceService.getAllPropertyManagerInvoices();

      if (response.status === "success" && response.data?.invoices) {
        // Map the invoices to add _id field for compatibility
        const mappedInvoices = response.data.invoices.map((invoice: any) => ({
          ...invoice,
          _id: invoice.id || invoice._id,
          property: invoice.propertyId || invoice.property,
          propertyManager: invoice.propertyManagerId || invoice.propertyManager,
          agency: invoice.agencyId || invoice.agency,
        }));

        setInvoices(mappedInvoices);
        calculateDashboardStats(mappedInvoices);
      } else {
        console.warn("Response not successful:", response);
        setInvoices([]);
        calculateDashboardStats([]);
      }
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      toast.error(error.message || "Failed to fetch invoices");
      setInvoices([]);
      calculateDashboardStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await propertyService.getProperties({ limit: 1000 });
      if (response.status === "success" && response.data.properties) {
        const transformedProperties = response.data.properties.map(
          (prop: any) => ({
            id: prop.id,
            fullAddress: prop.fullAddress,
            assignedPropertyManager: prop.assignedPropertyManager,
          })
        );
        setProperties(transformedProperties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const calculateDashboardStats = (data: InvoiceListItem[]) => {
    const stats: DashboardStats = {
      totalInvoices: data.length,
      pendingInvoices: data.filter((i) => i.status === "Pending").length,
      sentInvoices: data.filter((i) => i.status === "Sent").length,
      paidInvoices: data.filter((i) => i.status === "Paid").length,
      totalValue: data.reduce((sum, i) => sum + (i.amount || 0), 0),
      paidValue: data
        .filter((i) => i.status === "Paid")
        .reduce((sum, i) => sum + (i.amount || 0), 0),
      pendingValue: data
        .filter((i) => i.status === "Pending" || i.status === "Sent")
        .reduce((sum, i) => sum + (i.amount || 0), 0),
    };
    setDashboardStats(stats);
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by tab
    switch (activeTab) {
      case "pending":
        filtered = filtered.filter((i) => i.status === "Pending");
        break;
      case "sent":
        filtered = filtered.filter((i) => i.status === "Sent");
        break;
      case "paid":
        filtered = filtered.filter((i) => i.status === "Paid");
        break;
      case "all":
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((i) => {
        const propertyAddress = getPropertyAddress(i);
        const propertyManagerName = getPropertyManagerName(i);

        return (
          propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          propertyManagerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply additional filters
    if (filters.property) {
      filtered = filtered.filter((i) => {
        const propertyId =
          typeof i.property === "object" ? i.property._id : i.property;
        return propertyId === filters.property;
      });
    }
    if (filters.propertyManager) {
      filtered = filtered.filter((i) => {
        const pmId =
          typeof i.propertyManager === "object"
            ? i.propertyManager._id
            : i.propertyManager;
        return pmId === filters.propertyManager;
      });
    }
    if (filters.status) {
      filtered = filtered.filter((i) => i.status === filters.status);
    }

    setFilteredInvoices(filtered);
  };

  const handleViewDetails = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleEditInvoice = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice);
    setShowCreateModal(true);
  };

  const handleUpdateStatus = (invoice: InvoiceListItem) => {
    if (userType !== "property_manager") {
      toast.error("Only property managers can update invoice status.");
      return;
    }
    setSelectedInvoice(invoice);
    setShowResponseModal(true);
  };

  const handleDeleteInvoice = async (invoice: InvoiceListItem) => {
    if (
      !window.confirm(
        `Are you sure you want to delete invoice ${invoice.invoiceNumber}?`
      )
    ) {
      return;
    }

    try {
      await propertyManagerInvoiceService.deletePropertyManagerInvoice(
        invoice._id
      );
      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete invoice");
    }
  };

  const getPropertyAddress = (invoice: InvoiceListItem): string => {
    const property = invoice.property;
    if (typeof property === "string") return "Unknown Property";
    if (!property) return "Unknown Property";
    // Handle new API format with address object
    if (property.address?.fullAddress) {
      return property.address.fullAddress;
    }
    // Handle old format
    return property.fullAddress || "Unknown Property";
  };

  const getPropertyManagerName = (invoice: InvoiceListItem): string => {
    const pm = invoice.propertyManager;
    if (!pm) return "";
    if (typeof pm === "string") return "";
    return (
      `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Sent":
        return "status-sent";
      case "Paid":
        return "status-paid";
      default:
        return "status-pending";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tabs = [
    {
      key: "pending" as TabType,
      label: "Pending",
      count: invoices.filter((i) => i.status === "Pending").length,
    },
    {
      key: "sent" as TabType,
      label: "Sent",
      count: invoices.filter((i) => i.status === "Sent").length,
    },
    {
      key: "paid" as TabType,
      label: "Paid",
      count: invoices.filter((i) => i.status === "Paid").length,
    },
    { key: "all" as TabType, label: "All", count: invoices.length },
  ];

  // Get unique property managers from invoices
  const propertyManagers = Array.from(
    new Map(
      invoices
        .filter(
          (inv) =>
            inv.propertyManager && typeof inv.propertyManager === "object"
        )
        .map((inv: any) => [
          inv.propertyManager._id,
          {
            id: inv.propertyManager._id,
            firstName: inv.propertyManager.firstName,
            lastName: inv.propertyManager.lastName,
          },
        ])
    ).values()
  );

  if (loading) {
    return (
      <div className="invoice-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading invoice management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-management">
      <div className="page-header">
        <div className="header-content">
          <div>
            <div className="header-title">
              <MdReceipt className="page-icon" />
              <h1>Invoice Management</h1>
            </div>
            <p className="header-subtitle">
              Create and manage invoices for property managers
            </p>
          </div>
          {(userType === "super_user" ||
            userType === "team_member" ||
            userType === "agency") && (
            <button
              className="create-invoice-btn"
              onClick={() => {
                setSelectedInvoice(null);
                setShowCreateModal(true);
              }}
            >
              <MdAdd /> Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <MdReceipt />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.totalInvoices}</h3>
            <p>Total Invoices</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MdPendingActions />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.pendingInvoices}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.paidInvoices}</h3>
            <p>Paid</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(dashboardStats.paidValue)}</h3>
            <p>Paid Value</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="invoice-filters-panel">
        <div className="search-filter-toolbar">
          <div className="search-section">
            <div className="search-input-container">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-controls">
              <select
                value={filters.property}
                onChange={(e) =>
                  setFilters({ ...filters, property: e.target.value })
                }
                className="compact-filter-select"
              >
                <option value="">All Properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.fullAddress}
                  </option>
                ))}
              </select>

              <select
                value={filters.propertyManager}
                onChange={(e) =>
                  setFilters({ ...filters, propertyManager: e.target.value })
                }
                className="compact-filter-select"
              >
                <option value="">All Property Managers</option>
                {propertyManagers.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {`${pm.firstName} ${pm.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || filters.property || filters.propertyManager) && (
              <button
                className="clear-all-btn"
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    property: "",
                    propertyManager: "",
                    status: "",
                  });
                }}
                title="Clear all filters"
              >
                <MdCancel />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Row */}
        {(searchTerm || filters.property || filters.propertyManager) && (
          <div className="active-filters-row">
            {searchTerm && (
              <span className="filter-chip">
                <MdSearch className="chip-icon" />
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="chip-remove"
                >
                  <MdCancel />
                </button>
              </span>
            )}
            {filters.property && (
              <span className="filter-chip">
                <MdFilterList className="chip-icon" />
                {properties.find((p) => p.id === filters.property)
                  ?.fullAddress || "Unknown Property"}
                <button
                  onClick={() => setFilters({ ...filters, property: "" })}
                  className="chip-remove"
                >
                  <MdCancel />
                </button>
              </span>
            )}
            {filters.propertyManager && (
              <span className="filter-chip">
                <MdFilterList className="chip-icon" />
                {propertyManagers.find(
                  (pm) => pm.id === filters.propertyManager
                )
                  ? `${
                      propertyManagers.find(
                        (pm) => pm.id === filters.propertyManager
                      )?.firstName
                    } ${
                      propertyManagers.find(
                        (pm) => pm.id === filters.propertyManager
                      )?.lastName
                    }`
                  : "Unknown PM"}
                <button
                  onClick={() =>
                    setFilters({ ...filters, propertyManager: "" })
                  }
                  className="chip-remove"
                >
                  <MdCancel />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="invoices-table-container">
        <div className="table-header">
          <h3>
            {tabs.find((t) => t.key === activeTab)?.label}
            <span className="count">({filteredInvoices.length})</span>
          </h3>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <MdReceipt className="empty-icon" />
            <h3>No invoices found</h3>
            <p>
              {activeTab === "pending"
                ? "No pending invoices at the moment."
                : `No invoices match the current ${activeTab} filter.`}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Property</th>
                  <th>Property Manager</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                  const isOverdue = daysUntilDue < 0;

                  return (
                    <tr
                      key={invoice._id}
                      className={
                        isOverdue && invoice.status === "Pending"
                          ? "overdue-row"
                          : ""
                      }
                    >
                      <td className="invoice-number">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="property-cell">
                        <div className="property-info">
                          <span className="property-address">
                            {getPropertyAddress(invoice)}
                          </span>
                        </div>
                      </td>
                      <td className="property-manager-cell">
                        <div className="property-manager-info">
                          <span className="property-manager-name">
                            {getPropertyManagerName(invoice)}
                          </span>
                        </div>
                      </td>
                      <td className="description">
                        {invoice.description.length > 50
                          ? `${invoice.description.substring(0, 50)}...`
                          : invoice.description}
                      </td>
                      <td className="amount">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td
                        className={`due-date ${
                          isOverdue && invoice.status === "Pending"
                            ? "overdue"
                            : ""
                        }`}
                      >
                        <div className="date-info">
                          <span>{formatDate(invoice.dueDate)}</span>
                          <small>
                            {daysUntilDue >= 0
                              ? `${daysUntilDue} days`
                              : "Overdue"}
                          </small>
                        </div>
                      </td>
                      <td className="status">
                        <span
                          className={`status-badge ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="created-date">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewDetails(invoice)}
                            title="View Details"
                          >
                            <MdVisibility />
                          </button>
                          {(userType === "super_user" ||
                            userType === "team_member" ||
                            userType === "agency") && (
                            <>
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEditInvoice(invoice)}
                                title="Edit Invoice"
                              >
                                <MdEdit />
                              </button>
                              {userType === "property_manager" && (
                                <button
                                  className="action-btn status-btn"
                                  onClick={() => handleUpdateStatus(invoice)}
                                  title="Update Status"
                                >
                                  <MdCheckCircle />
                                </button>
                              )}
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteInvoice(invoice)}
                                title="Delete Invoice"
                                disabled={invoice.status === "Paid"}
                              >
                                <MdDelete />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Create/Edit Modal */}
      <InvoiceCreateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => {
          fetchInvoices();
        }}
        invoice={selectedInvoice}
      />

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedInvoice(null);
        }}
      />

      {/* Invoice Status Update Modal */}
      <InvoiceResponseModal
        invoice={selectedInvoice}
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => {
          fetchInvoices();
        }}
      />
    </div>
  );
};

export default InvoiceManagement;
