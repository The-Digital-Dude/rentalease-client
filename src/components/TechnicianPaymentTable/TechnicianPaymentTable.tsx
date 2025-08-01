import React, { useState, useEffect } from "react";
import {
  RiSearchLine,
  RiFilterLine,
  RiMoneyDollarBoxLine,
  RiTimeLine,
  RiBriefcaseLine,
  RiCheckLine,
  RiCloseLine,
  RiLoaderLine,
} from "react-icons/ri";
import Pagination from "../Pagination/Pagination";
import "./TechnicianPaymentTable.scss";

interface TechnicianPayment {
  id: string;
  paymentNumber: string;
  technicianId: string;
  jobId: {
    _id: string;
    property: string;
    jobType: string;
    dueDate: string;
    description: string;
    job_id: string;
  };
  jobType: string;
  amount: number;
  status: "Pending" | "Paid" | "Cancelled";
  jobCompletedAt: string;
  createdAt: string;
}

interface TechnicianPaymentTableProps {
  title: string;
  payments: TechnicianPayment[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics?: {
    statusCounts: Record<string, number>;
    totalPayments: number;
  };
  onPageChange: (page: number) => void;
  filters?: {
    status: string;
    jobType: string;
    search: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange?: (filters: any) => void;
}

const TechnicianPaymentTable: React.FC<TechnicianPaymentTableProps> = ({
  title,
  payments,
  loading,
  error,
  pagination,
  statistics,
  onPageChange,
  filters,
  onFilterChange,
}) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters?.status || "",
    jobType: filters?.jobType || "",
    search: filters?.search || "",
    startDate: filters?.startDate || "",
    endDate: filters?.endDate || "",
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Paid":
        return "status-paid";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case "Gas":
        return "🔥";
      case "Electrical":
        return "⚡";
      case "Smoke":
        return "🚨";
      case "Repairs":
        return "🔧";
      case "Pool Safety":
        return "🏊";
      case "Routine Inspection":
        return "📋";
      default:
        return "📋";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="technician-payment-table">
        <div className="table-header">
          <h3>{title}</h3>
        </div>
        <div className="loading-state">
          <RiLoaderLine className="loading-icon" />
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="technician-payment-table">
        <div className="table-header">
          <h3>{title}</h3>
        </div>
        <div className="error-state">
          <RiCloseLine className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-payment-table">
      <div className="table-header">
        <div className="header-content">
          <h3>{title}</h3>
          {statistics && (
            <div className="statistics">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{statistics.totalPayments}</span>
              </div>
              {Object.entries(statistics.statusCounts).map(
                ([status, count]) => (
                  <div key={status} className="stat-item">
                    <span className="stat-label">{status}:</span>
                    <span className="stat-value">{count}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          <div className="search-filter-container">
            <div className="search-box">
              <RiSearchLine className="search-icon" />
              <input
                type="text"
                placeholder="Search payments..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <button
              className={`filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <RiFilterLine />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Job Type</label>
                <select
                  value={localFilters.jobType}
                  onChange={(e) =>
                    handleFilterChange("jobType", e.target.value)
                  }
                >
                  <option value="">All Job Types</option>
                  <option value="Gas">Gas</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Smoke">Smoke</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Pool Safety">Pool Safety</option>
                  <option value="Routine Inspection">Routine Inspection</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Job ID</th>
              <th>Job Type</th>
              <th>Amount</th>
              <th>Completed Date</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <div className="empty-content">
                    <RiMoneyDollarBoxLine className="empty-icon" />
                    <p>No payments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="payment-number">
                    <span className="payment-number-text">
                      {payment.paymentNumber}
                    </span>
                  </td>
                  <td className="job-id">
                    <span className="job-id-text">{payment.jobId.job_id}</span>
                  </td>
                  <td className="job-type">
                    <span className="job-type-icon">
                      {getJobTypeIcon(payment.jobType)}
                    </span>
                    <span className="job-type-text">{payment.jobType}</span>
                  </td>
                  <td className="amount">
                    <span className="amount-text">
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="completed-date">
                    <div className="completed-date-info">
                      <RiTimeLine className="completed-date-icon" />
                      <span className="completed-date-text">
                        {formatDate(payment.jobCompletedAt)}
                      </span>
                    </div>
                  </td>
                  <td className="status">
                    <span
                      className={`status-badge ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="created-date">
                    <div className="created-date-info">
                      <RiTimeLine className="created-date-icon" />
                      <span className="created-date-text">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalItems}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TechnicianPaymentTable;
