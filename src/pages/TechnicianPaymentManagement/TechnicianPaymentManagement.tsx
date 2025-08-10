import React, { useState, useEffect, useCallback } from "react";
import {
  RiMoneyDollarBoxLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
  RiEyeLine,
  RiCheckLine,
  RiTimeLine,
  RiBriefcaseLine,
  RiUserLine,
  RiRefreshLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiArrowUpLine as RiTrendingUpLine,
  RiArrowDownLine as RiTrendingDownLine,
  RiPieChartLine,
  RiBarChartLine,
  RiCalendarLine,
} from "react-icons/ri";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../services/api";
import "./TechnicianPaymentManagement.scss";

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
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  pendingCount: number;
  paidCount: number;
  averagePayment: number;
  monthlyGrowth: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const TechnicianPaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<TechnicianPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    jobType: "",
    technicianId: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<TechnicianPayment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(currentPage === 1);
    setRefreshing(currentPage > 1);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== "")
        ),
      });

      const response = await api.get(`/v1/technician-payments?${params}`);

      if (response.data.status === "success") {
        setPayments(response.data.data.payments || []);
        setPagination(
          response.data.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 20,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );

        // Calculate stats from the payments
        const allPayments = response.data.data.payments || [];
        const calculatedStats: PaymentStats = {
          totalPayments: allPayments.length,
          totalAmount: allPayments.reduce(
            (sum: number, payment: any) => sum + payment.amount,
            0
          ),
          pendingAmount: allPayments
            .filter((p: any) => p.status === "Pending")
            .reduce((sum: number, payment: any) => sum + payment.amount, 0),
          paidAmount: allPayments
            .filter((p: any) => p.status === "Paid")
            .reduce((sum: number, payment: any) => sum + payment.amount, 0),
          pendingCount: allPayments.filter((p: any) => p.status === "Pending")
            .length,
          paidCount: allPayments.filter((p: any) => p.status === "Paid").length,
          averagePayment:
            allPayments.length > 0
              ? allPayments.reduce(
                  (sum: number, payment: any) => sum + payment.amount,
                  0
                ) / allPayments.length
              : 0,
          monthlyGrowth: 12.5, // Mock data
        };
        setStats(calculatedStats);
      } else {
        setError(response.data.message || "Failed to fetch payments");
      }
    } catch (err: any) {
      console.error("Fetch payments error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching payments"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefresh = () => {
    fetchPayments();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    newStatus: string,
    notes?: string
  ) => {
    try {
      const response = await api.patch(
        `/v1/technician-payments/${paymentId}/status`,
        {
          status: newStatus,
          notes,
        }
      );

      if (response.data.status === "success") {
        // Update the local state
        setPayments((prev) =>
          prev.map((payment) =>
            payment.id === paymentId
              ? { ...payment, status: newStatus as any, notes }
              : payment
          )
        );

        // Refresh stats
        fetchPayments();
      } else {
        throw new Error(
          response.data.message || "Failed to update payment status"
        );
      }
    } catch (err: any) {
      console.error("Update payment status error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to update payment status"
      );
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

  const chartData = stats
    ? [
        {
          name: "Paid",
          value: stats.paidCount,
          amount: stats.paidAmount,
          color: "#10b981",
        },
        {
          name: "Pending",
          value: stats.pendingCount,
          amount: stats.pendingAmount,
          color: "#f59e0b",
        },
      ]
    : [];

  if (loading && currentPage === 1) {
    return (
      <div className="technician-payment-management">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading technician payments...</p>
        </div>
      </div>
    );
  }

  if (error && !payments.length) {
    return (
      <div className="technician-payment-management">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Payments</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            <RiRefreshLine />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-payment-management">
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <div className="header-icon">
              <RiMoneyDollarBoxLine />
            </div>
            <div className="header-text">
              <h1>Technician Payment Management</h1>
              <p>Manage and track all technician payments across the system</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine className={refreshing ? "spinning" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button className="btn btn-outline">
              <RiDownloadLine />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <RiMoneyDollarBoxLine />
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.totalAmount)}</h3>
                <p>Total Amount</p>
                <div className="stat-trend positive">
                  <RiTrendingUpLine />
                  <span>{stats.totalPayments} payments</span>
                </div>
              </div>
            </div>

            <div className="stat-card paid">
              <div className="stat-icon">
                <RiCheckLine />
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.paidAmount)}</h3>
                <p>Paid Amount</p>
                <div className="stat-trend positive">
                  <RiTrendingUpLine />
                  <span>{stats.paidCount} paid</span>
                </div>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">
                <RiTimeLine />
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.pendingAmount)}</h3>
                <p>Pending Amount</p>
                <div className="stat-trend warning">
                  <RiTimeLine />
                  <span>{stats.pendingCount} pending</span>
                </div>
              </div>
            </div>

            <div className="stat-card average">
              <div className="stat-icon">
                <RiBarChartLine />
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.averagePayment)}</h3>
                <p>Average Payment</p>
                <div className="stat-trend positive">
                  <RiTrendingUpLine />
                  <span>+{stats.monthlyGrowth}% growth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Chart */}
          <div className="chart-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Payment Status Distribution</h3>
                <RiPieChartLine />
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} payments`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-filter-container">
          <div className="search-box">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search by payment number, technician name, or job ID..."
              value={filters.search}
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

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filters.status}
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
                  value={filters.jobType}
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
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="payments-table-section">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    <div className="empty-content">
                      <RiMoneyDollarBoxLine className="empty-icon" />
                      <p>No payments found</p>
                      {Object.values(filters).some((f) => f !== "") && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setFilters({
                              status: "",
                              jobType: "",
                              technicianId: "",
                              search: "",
                              startDate: "",
                              endDate: "",
                            });
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
                            {payment.technicianId.firstName}{" "}
                            {payment.technicianId.lastName}
                          </span>
                          <span className="email">
                            {payment.technicianId.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="job-details">
                      <div className="job-info">
                        <span className="job-id">#{payment.jobId.job_id}</span>
                        <span className="job-type">{payment.jobType}</span>
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
                    <td className="actions">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentDetails(true);
                          }}
                          title="View Details"
                        >
                          <RiEyeLine />
                        </button>
                        {payment.status === "Pending" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              handleUpdatePaymentStatus(payment.id, "Paid")
                            }
                            title="Mark as Paid"
                          >
                            <RiCheckLine />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing{" "}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} payments
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentDetails(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowPaymentDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-details-grid">
                <div className="detail-group">
                  <label>Payment Number</label>
                  <span>{selectedPayment.paymentNumber}</span>
                </div>
                <div className="detail-group">
                  <label>Amount</label>
                  <span className="amount-large">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="detail-group">
                  <label>Status</label>
                  <span
                    className={`status-badge ${getStatusColor(
                      selectedPayment.status
                    )}`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="detail-group">
                  <label>Technician</label>
                  <span>
                    {selectedPayment.technicianId.firstName}{" "}
                    {selectedPayment.technicianId.lastName}
                  </span>
                </div>
                <div className="detail-group">
                  <label>Job ID</label>
                  <span>#{selectedPayment.jobId.job_id}</span>
                </div>
                <div className="detail-group">
                  <label>Job Type</label>
                  <span>{selectedPayment.jobType}</span>
                </div>
                <div className="detail-group">
                  <label>Job Completed</label>
                  <span>{formatDate(selectedPayment.jobCompletedAt)}</span>
                </div>
                <div className="detail-group">
                  <label>Payment Date</label>
                  <span>
                    {selectedPayment.paymentDate
                      ? formatDate(selectedPayment.paymentDate)
                      : "Not paid yet"}
                  </span>
                </div>
                {selectedPayment.notes && (
                  <div className="detail-group full-width">
                    <label>Notes</label>
                    <span>{selectedPayment.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedPayment.status === "Pending" && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleUpdatePaymentStatus(selectedPayment.id, "Paid");
                    setShowPaymentDetails(false);
                  }}
                >
                  <RiCheckLine />
                  Mark as Paid
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setShowPaymentDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianPaymentManagement;
