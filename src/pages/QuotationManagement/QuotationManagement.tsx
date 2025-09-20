import React, { useState, useEffect } from "react";
import {
  MdFilterList,
  MdSearch,
  MdVisibility,
  MdEdit,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdTrendingUp,
  MdRequestQuote,
  MdPendingActions,
  MdDownload,
} from "react-icons/md";
import { RiFileList3Line } from "react-icons/ri";
import quotationService from "../../services/quotationService";
import { QuotationDetailsModal } from "../../components/QuotationDetailsModal/QuotationDetailsModal";
import { QuotationPricingModal } from "../../components/QuotationPricingModal/QuotationPricingModal";
import { downloadQuotationPDF } from "../../utils/quotationPdfGenerator";
import { toast } from "react-toastify";
import "./QuotationManagement.scss";

interface DashboardStats {
  totalRequests: number;
  pendingResponse: number;
  activeQuotes: number;
  acceptedQuotes: number;
  totalValue: number;
  averageResponseTime: string;
}

interface QuotationListItem {
  _id: string;
  quotationNumber: string;
  agency: {
    _id: string;
    name: string;
  } | string;
  jobType: string;
  property: {
    _id: string;
    title?: string;
    address?: string | {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
    fullAddress?: string;
  } | string;
  dueDate: string;
  amount?: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  createdAt: string;
  validUntil?: string;
}

type TabType = "new" | "pending" | "accepted" | "rejected" | "all";

export const QuotationManagement: React.FC = () => {
  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<QuotationListItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingResponse: 0,
    activeQuotes: 0,
    acceptedQuotes: 0,
    totalValue: 0,
    averageResponseTime: "0h",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    agency: "",
    serviceType: "",
    status: "",
    dateRange: "",
  });
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationListItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, activeTab, searchTerm, filters]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getAllQuotations();
      if (response.success && response.data) {
        setQuotations(response.data);
        calculateDashboardStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardStats = (data: QuotationListItem[]) => {
    const stats: DashboardStats = {
      totalRequests: data.length,
      pendingResponse: data.filter(q => q.status === "Sent").length,
      activeQuotes: data.filter(q => q.status === "Sent" && q.amount).length,
      acceptedQuotes: data.filter(q => q.status === "Accepted").length,
      totalValue: data.filter(q => q.status === "Accepted").reduce((sum, q) => sum + (q.amount || 0), 0),
      averageResponseTime: "2.5h", // This would be calculated from actual response times
    };
    setDashboardStats(stats);
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    // Filter by tab
    switch (activeTab) {
      case "new":
        filtered = filtered.filter(q => q.status === "Sent" && !q.amount);
        break;
      case "pending":
        filtered = filtered.filter(q => q.status === "Sent" && q.amount);
        break;
      case "accepted":
        filtered = filtered.filter(q => q.status === "Accepted");
        break;
      case "rejected":
        filtered = filtered.filter(q => q.status === "Rejected" || q.status === "Expired");
        break;
      case "all":
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(q => {
        const agencyName = getAgencyName(q.agency);
        const propertyAddress = getPropertyAddress(q.property);

        return agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               q.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
               propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
               q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply additional filters
    if (filters.agency) {
      filtered = filtered.filter(q => {
        const agencyId = typeof q.agency === 'object' ? q.agency._id : q.agency;
        return agencyId === filters.agency;
      });
    }
    if (filters.serviceType) {
      filtered = filtered.filter(q => q.jobType === filters.serviceType);
    }
    if (filters.status) {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    setFilteredQuotations(filtered);
  };

  const handleViewDetails = (quotation: QuotationListItem) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
  };

  const handleAddPricing = (quotation: QuotationListItem) => {
    setSelectedQuotation(quotation);
    setShowPricingModal(true);
  };

  const handleDownloadPDF = async (quotation: QuotationListItem) => {
    setDownloadingPdf(quotation._id);
    try {
      await downloadQuotationPDF(quotation);
      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to download PDF");
    } finally {
      setDownloadingPdf(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sent":
        return "status-sent";
      case "Accepted":
        return "status-accepted";
      case "Rejected":
        return "status-rejected";
      case "Expired":
        return "status-expired";
      default:
        return "status-draft";
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

  const getPropertyAddress = (property: any): string => {
    if (typeof property === 'string') return 'Unknown Property';
    if (!property) return 'Unknown Property';

    // Try fullAddress first
    if (property.fullAddress) return property.fullAddress;

    // If address is a string, use it
    if (typeof property.address === 'string') return property.address;

    // If address is an object, try to use fullAddress from it
    if (property.address && typeof property.address === 'object') {
      if (property.address.fullAddress) return property.address.fullAddress;

      // Build address from components
      const { street, suburb, state, postcode } = property.address;
      if (street && suburb && state && postcode) {
        return `${street}, ${suburb}, ${state} ${postcode}`;
      }
    }

    return 'Unknown Property';
  };

  const getAgencyName = (agency: any): string => {
    if (typeof agency === 'string') return 'Unknown Agency';
    if (!agency) return 'Unknown Agency';

    // Try name first, then email as fallback
    return agency.name || agency.email || 'Unknown Agency';
  };

  const tabs = [
    { key: "new" as TabType, label: "New Requests", count: quotations.filter(q => q.status === "Sent" && !q.amount).length },
    { key: "pending" as TabType, label: "Pending Response", count: quotations.filter(q => q.status === "Sent" && q.amount).length },
    { key: "accepted" as TabType, label: "Accepted", count: quotations.filter(q => q.status === "Accepted").length },
    { key: "rejected" as TabType, label: "Rejected", count: quotations.filter(q => q.status === "Rejected" || q.status === "Expired").length },
    { key: "all" as TabType, label: "All", count: quotations.length },
  ];

  if (loading) {
    return (
      <div className="quotation-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading quotation management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quotation-management">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <RiFileList3Line className="page-icon" />
            <h1>Quotation Management</h1>
          </div>
          <p className="header-subtitle">
            Manage quotation requests from agencies and provide pricing for beyond compliance services
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <MdRequestQuote />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.totalRequests}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MdPendingActions />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.pendingResponse}</h3>
            <p>Pending Response</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.activeQuotes}</h3>
            <p>Active Quotes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MdCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.acceptedQuotes}</h3>
            <p>Accepted</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(dashboardStats.totalValue)}</h3>
            <p>Total Value</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MdAccessTime />
          </div>
          <div className="stat-content">
            <h3>{dashboardStats.averageResponseTime}</h3>
            <p>Avg. Response Time</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by agency, service type, property, or quotation number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filters-container">
          <MdFilterList className="filter-icon" />
          <select
            value={filters.agency}
            onChange={(e) => setFilters({ ...filters, agency: e.target.value })}
            className="filter-select"
          >
            <option value="">All Agencies</option>
            {/* Agency options would be populated from API */}
          </select>
          <select
            value={filters.serviceType}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
            className="filter-select"
          >
            <option value="">All Services</option>
            <option value="Vacant Property Cleaning">Vacant Property Cleaning</option>
            <option value="Water Connection">Water Connection</option>
            <option value="Gas Connection">Gas Connection</option>
            <option value="Electricity Connection">Electricity Connection</option>
            <option value="Landscaping & Outdoor Maintenance">Landscaping & Outdoor Maintenance</option>
            <option value="Pest Control">Pest Control</option>
            <option value="Grout Cleaning">Grout Cleaning</option>
            <option value="Removalists">Removalists</option>
            <option value="Handyman Services">Handyman Services</option>
            <option value="Painters">Painters</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
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

      {/* Quotations Table */}
      <div className="quotations-table-container">
        <div className="table-header">
          <h3>
            {tabs.find(t => t.key === activeTab)?.label}
            <span className="count">({filteredQuotations.length})</span>
          </h3>
        </div>

        {filteredQuotations.length === 0 ? (
          <div className="empty-state">
            <RiFileList3Line className="empty-icon" />
            <h3>No quotations found</h3>
            <p>
              {activeTab === "new"
                ? "No new quotation requests require your attention at the moment."
                : `No quotations match the current ${activeTab} filter.`
              }
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="quotations-table">
              <thead>
                <tr>
                  <th>Quotation #</th>
                  <th>Agency</th>
                  <th>Service Type</th>
                  <th>Property</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quotation) => {
                  const daysUntilDue = getDaysUntilDue(quotation.dueDate);
                  const isUrgent = daysUntilDue <= 3;

                  return (
                    <tr key={quotation._id} className={isUrgent ? "urgent-row" : ""}>
                      <td className="quotation-number">
                        {quotation.quotationNumber}
                      </td>
                      <td className="agency-cell">
                        <div className="agency-info">
                          <span className="agency-name">
                            {getAgencyName(quotation.agency)}
                          </span>
                        </div>
                      </td>
                      <td className="service-type">
                        {quotation.jobType}
                      </td>
                      <td className="property-address">
                        {getPropertyAddress(quotation.property)}
                      </td>
                      <td className={`due-date ${isUrgent ? "urgent" : ""}`}>
                        <div className="date-info">
                          <span>{formatDate(quotation.dueDate)}</span>
                          <small>{daysUntilDue > 0 ? `${daysUntilDue} days` : "Overdue"}</small>
                        </div>
                      </td>
                      <td className="amount">
                        {quotation.amount ? formatCurrency(quotation.amount) : "—"}
                      </td>
                      <td className="status">
                        <span className={`status-badge ${getStatusColor(quotation.status)}`}>
                          {quotation.status}
                        </span>
                      </td>
                      <td className="created-date">
                        {formatDate(quotation.createdAt)}
                      </td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewDetails(quotation)}
                            title="View Details"
                          >
                            <MdVisibility />
                          </button>
                          {quotation.status === "Sent" && !quotation.amount && (
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleAddPricing(quotation)}
                              title="Add Pricing"
                            >
                              <MdEdit />
                            </button>
                          )}
                          <button
                            className="action-btn download-btn"
                            onClick={() => handleDownloadPDF(quotation)}
                            disabled={downloadingPdf === quotation._id}
                            title="Download PDF"
                          >
                            <MdDownload />
                          </button>
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

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Quotation Pricing Modal */}
      {selectedQuotation && (
        <QuotationPricingModal
          quotation={selectedQuotation}
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onSuccess={() => {
            fetchQuotations(); // Refresh the list after successful update
          }}
        />
      )}
    </div>
  );
};

export default QuotationManagement;