import React, { useState, useEffect } from "react";
import {
  RiSearchLine,
  RiFilterLine,
  RiMoneyDollarBoxLine,
  RiCheckLine,
  RiCloseLine,
  RiLoaderLine,
  RiUserLine,
  RiCalendarLine,
  RiEyeLine,
} from "react-icons/ri";
import Pagination from "../Pagination/Pagination";
import { getStatusColor, formatDate, formatCurrency } from "../../utils/paymentUtils";
import "./TechnicianPaymentTable.scss";

interface TechnicianPayment {
  id: string;
  paymentNumber: string;
  technicianId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  jobId: {
    _id: string;
    property: {
      _id: string;
      address: {
        street: string;
        suburb: string;
        state: string;
        postcode: string;
        fullAddress: string;
      };
    };
    jobType: string;
    dueDate: string;
    description: string;
    job_id: string;
  };
  jobType: string;
  amount: number;
  status: "Pending" | "Paid" | "Cancelled";
  jobCompletedAt: string;
  paymentDate?: string;
  notes?: string;
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
    technicianId: string;
    search: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange?: (key: string, value: string) => void;
  onPaymentAction?: (paymentId: string, action: string, payment: TechnicianPayment) => void;
  searchInput?: string;
  onSearchInputChange?: (value: string) => void;
  onSearchKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSearchBlur?: () => void;
  showActions?: boolean;
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
  onPaymentAction,
  searchInput,
  onSearchInputChange,
  onSearchKeyPress,
  onSearchBlur,
  showActions = true,
}) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters?.status || "",
    jobType: filters?.jobType || "",
    technicianId: filters?.technicianId || "",
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
      onFilterChange(key, value);
    }
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
                placeholder="Search by payment number, technician name, or job ID... (Press Enter or wait 1s)"
                value={searchInput !== undefined ? searchInput : localFilters.search}
                onChange={(e) => {
                  if (onSearchInputChange) {
                    onSearchInputChange(e.target.value);
                  } else {
                    handleFilterChange("search", e.target.value);
                  }
                }}
                onKeyDown={onSearchKeyPress}
                onBlur={onSearchBlur}
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

              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
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
              <th>Technician</th>
              <th>Job Details</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Completed Date</th>
              <th>Payment Date</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 8 : 7} className="empty-state">
                  <div className="empty-content">
                    <RiMoneyDollarBoxLine className="empty-icon" />
                    <p>No payments found</p>
                    {Object.values(localFilters).some((f) => f !== "") && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          const clearedFilters = {
                            status: "",
                            jobType: "",
                            technicianId: "",
                            search: "",
                            startDate: "",
                            endDate: "",
                          };
                          setLocalFilters(clearedFilters);
                          if (onFilterChange) {
                            Object.keys(clearedFilters).forEach(key => {
                              onFilterChange(key, "");
                            });
                          }
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
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
                  <td className="technician">
                    <div className="technician-info">
                      <RiUserLine className="technician-icon" />
                      <div className="technician-details">
                        <span className="name">
                          {payment.technicianId?.firstName || 'N/A'}{" "}
                          {payment.technicianId?.lastName || ''}
                        </span>
                        <span className="email">
                          {payment.technicianId?.email || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="job-details">
                    <div className="job-info">
                      <span className="job-id">
                        #{payment.jobId?.job_id || 'N/A'}
                      </span>
                      <span className="job-type">{payment.jobType || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="amount">
                    <span className="amount-text">
                      {formatCurrency(payment.amount)}
                    </span>
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
                  <td className="completed-date">
                    <div className="date-info">
                      <RiCalendarLine className="date-icon" />
                      <span>{formatDate(payment.jobCompletedAt)}</span>
                    </div>
                  </td>
                  <td className="payment-date">
                    <div className="date-info">
                      <RiCalendarLine className="date-icon" />
                      <span>
                        {payment.paymentDate
                          ? formatDate(payment.paymentDate)
                          : "-"}
                      </span>
                    </div>
                  </td>
                  {showActions && (
                    <td className="actions">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            if (onPaymentAction) {
                              onPaymentAction(payment.id, "view", payment);
                            }
                          }}
                          title="View Details"
                        >
                          <RiEyeLine />
                        </button>
                        {payment.status === "Pending" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              if (onPaymentAction) {
                                onPaymentAction(payment.id, "markPaid", payment);
                              }
                            }}
                            title="Mark as Paid"
                          >
                            <RiCheckLine />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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
