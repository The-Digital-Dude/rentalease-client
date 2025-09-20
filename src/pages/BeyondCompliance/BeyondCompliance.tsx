import React, { useState, useEffect } from "react";
import {
  RiServiceLine,
  RiAddLine,
  RiFileList3Line,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiMoneyDollarCircleLine,
  RiEyeLine,
  RiCheckLine,
  RiCloseLine,
  RiSendPlaneLine,
  RiDraftLine,
} from "react-icons/ri";
import quotationService from "../../services/quotationService";
import { formatDateTime } from "../../utils";
import Toast from "../../components/Toast";
import QuotationRequestModal from "../../components/QuotationRequestModal";
import QuotationViewModal from "../../components/QuotationViewModal";
import "./BeyondCompliance.scss";

interface ToastType {
  message: string;
  type: "success" | "error" | "info";
}

const BeyondCompliance: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "draft" | "sent" | "accepted" | "rejected"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotations();
      setQuotations(response.data || []);
    } catch (error: any) {
      console.error("Error fetching quotations:", error);
      setToast({
        message: error.message || "Failed to fetch quotations",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchQuotations(); // Refresh the quotations list
    setToast({
      message: "Quotation request submitted successfully!",
      type: "success",
    });
  };

  const handleViewQuotation = (quotation: any) => {
    setSelectedQuotation(quotation);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedQuotation(null);
  };

  const handleViewModalSuccess = () => {
    fetchQuotations(); // Refresh the quotations list
    setToast({
      message: "Quotation response submitted successfully!",
      type: "success",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "#6b7280";
      case "sent":
        return "#3b82f6";
      case "accepted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "expired":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <RiDraftLine />;
      case "sent":
        return <RiSendPlaneLine />;
      case "accepted":
        return <RiCheckLine />;
      case "rejected":
        return <RiCloseLine />;
      default:
        return <RiTimeLine />;
    }
  };

  const getPropertyAddress = (property: any): string => {
    if (typeof property === 'string') return 'Unknown Property';
    if (!property) return 'Unknown Property';
    if (property.fullAddress) return property.fullAddress;
    if (typeof property.address === 'string') return property.address;
    if (property.address && typeof property.address === 'object') {
      if (property.address.fullAddress) return property.address.fullAddress;
      const { street, suburb, state, postcode } = property.address;
      if (street && suburb && state && postcode) {
        return `${street}, ${suburb}, ${state} ${postcode}`;
      }
    }
    return 'Unknown Property';
  };

  const filteredQuotations = quotations.filter((quotation) => {
    if (activeTab === "all") return true;
    return quotation.status.toLowerCase() === activeTab;
  });

  const stats = {
    total: quotations.length,
    pending: quotations.filter((q) => q.status === "Sent").length,
    accepted: quotations.filter((q) => q.status === "Accepted").length,
    totalValue: quotations
      .filter((q) => q.status === "Accepted" && q.amount)
      .reduce((sum, q) => sum + q.amount, 0),
  };

  if (loading) {
    return (
      <div className="beyond-compliance-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading quotations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="beyond-compliance-page">
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1>
              <RiServiceLine />
              Beyond Compliance Services
            </h1>
            <p>
              Manage quotation requests for additional services like cleaning, utilities, landscaping, and more.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={handleCreateRequest}>
              <RiAddLine />
              Request New Service
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <RiFileList3Line />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiTimeLine />
            </div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiCheckboxCircleLine />
            </div>
            <div className="stat-content">
              <h3>{stats.accepted}</h3>
              <p>Accepted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <RiMoneyDollarCircleLine />
            </div>
            <div className="stat-content">
              <h3>${stats.totalValue.toLocaleString()}</h3>
              <p>Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All ({quotations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "draft" ? "active" : ""}`}
          onClick={() => setActiveTab("draft")}
        >
          Draft ({quotations.filter((q) => q.status === "Draft").length})
        </button>
        <button
          className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent ({quotations.filter((q) => q.status === "Sent").length})
        </button>
        <button
          className={`tab-btn ${activeTab === "accepted" ? "active" : ""}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted ({quotations.filter((q) => q.status === "Accepted").length})
        </button>
        <button
          className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected ({quotations.filter((q) => q.status === "Rejected").length})
        </button>
      </div>

      {/* Quotations List */}
      <div className="quotations-section">
        {filteredQuotations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <RiServiceLine />
            </div>
            <h3>No Beyond Compliance Requests Yet</h3>
            <p>
              {activeTab === "all"
                ? "Request quotations for services like cleaning, utility connections, landscaping, and more to expand your service offerings."
                : `No ${activeTab} quotations found.`}
            </p>
            <button className="btn-primary" onClick={handleCreateRequest}>
              <RiAddLine />
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="quotations-table">
            <table>
              <thead>
                <tr>
                  <th>Quotation #</th>
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
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation._id}>
                    <td>
                      <strong>{quotation.quotationNumber}</strong>
                    </td>
                    <td>{quotation.jobType}</td>
                    <td>
                      {getPropertyAddress(quotation.property)}
                    </td>
                    <td>{formatDateTime(quotation.dueDate)}</td>
                    <td>
                      {quotation.amount
                        ? `$${quotation.amount.toLocaleString()}`
                        : "Pending"}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(quotation.status),
                          color: "white",
                        }}
                      >
                        {getStatusIcon(quotation.status)}
                        {quotation.status}
                      </span>
                    </td>
                    <td>{formatDateTime(quotation.createdAt)}</td>
                    <td>
                      <button
                        className={`btn-sm ${
                          quotation.status === "Sent" ? "btn-primary" : "btn-secondary"
                        }`}
                        onClick={() => handleViewQuotation(quotation)}
                      >
                        <RiEyeLine />
                        {quotation.status === "Sent" ? "View & Respond" : "View Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Quotation Request Modal */}
      <QuotationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Quotation View Modal */}
      {selectedQuotation && (
        <QuotationViewModal
          isOpen={isViewModalOpen}
          quotation={selectedQuotation}
          onClose={handleViewModalClose}
          onSuccess={handleViewModalSuccess}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default BeyondCompliance;
