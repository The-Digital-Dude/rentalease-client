import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RiMoneyDollarBoxLine,
  RiDownloadLine,
  RiCheckLine,
  RiTimeLine,
  RiRefreshLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiArrowUpLine as RiTrendingUpLine,
  RiPieChartLine,
  RiBarChartLine,
  RiInformationLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../services/api";
import TechnicianPaymentTable from "../../components/TechnicianPaymentTable/TechnicianPaymentTable";
import { getStatusColor, formatDate, formatCurrency } from "../../utils/paymentUtils";
import { exportPaymentsToCSV, validatePaymentDataForExport, getExportSummary } from "../../utils/csvUtils";
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
    property: {
      _id: string;
      name: string;
      address: string;
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
  const [searchInput, setSearchInput] = useState(""); // Separate state for input
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<TechnicianPayment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState<{
    paymentId: string;
    newStatus: string;
    paymentData?: TechnicianPayment;
  } | null>(null);

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

  // Debounced search function
  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      handleFilterChange("search", value);
    }, 1000); // 1000ms (1 second) debounce delay
  };

  // Handle Enter key press for immediate search
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Clear existing timeout and trigger immediate search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      handleFilterChange("search", searchInput);
    }
  };

  // Handle search blur for immediate search
  const handleSearchBlur = () => {
    // Clear existing timeout and trigger immediate search on blur
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchInput !== filters.search) {
      handleFilterChange("search", searchInput);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
        // Update the local state with the returned payment data
        const updatedPayment = response.data.data.payment;
        setPayments((prev) =>
          prev.map((payment) =>
            payment.id === paymentId
              ? {
                  ...payment,
                  status: updatedPayment.status,
                  notes: updatedPayment.notes,
                  paymentDate: updatedPayment.paymentDate,
                }
              : payment
          )
        );

        // Refresh stats
        fetchPayments();
        
        // Show success message
        alert(`Payment successfully marked as ${newStatus}!`);
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

  const showPaymentConfirmation = (paymentId: string, newStatus: string, paymentData: TechnicianPayment) => {
    setPendingPaymentAction({ paymentId, newStatus, paymentData });
    setShowConfirmDialog(true);
  };

  // Export functionality
  const handleExport = async () => {
    try {
      setExportLoading(true);
      setExportError(null);

      // Fetch ALL payments with current filters (no pagination limit)
      const params = new URLSearchParams({
        limit: "9999", // Large number to get all results
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== "")
        ),
      });

      const response = await api.get(`/v1/technician-payments?${params}`);

      if (response.data.status === "success") {
        const allPayments = response.data.data.payments || [];

        // Validate data before export
        validatePaymentDataForExport(allPayments);

        // Export to CSV
        exportPaymentsToCSV(allPayments);

        // Show success message
        const summary = getExportSummary(allPayments.length, filters);
        alert(summary); // You can replace this with a toast notification

      } else {
        throw new Error(response.data.message || "Failed to fetch payment data for export");
      }
    } catch (err: any) {
      console.error("Export error:", err);
      const errorMessage = err.message || "Failed to export payments. Please try again.";
      setExportError(errorMessage);
      alert(`Export failed: ${errorMessage}`); // You can replace this with a toast notification
    } finally {
      setExportLoading(false);
    }
  };

  const handleConfirmPaymentUpdate = () => {
    if (pendingPaymentAction) {
      handleUpdatePaymentStatus(pendingPaymentAction.paymentId, pendingPaymentAction.newStatus);
      setShowConfirmDialog(false);
      setPendingPaymentAction(null);
    }
  };

  const handleCancelPaymentUpdate = () => {
    setShowConfirmDialog(false);
    setPendingPaymentAction(null);
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
            <button
              className="btn btn-outline"
              onClick={handleExport}
              disabled={exportLoading || loading}
              title={exportLoading ? "Exporting data..." : "Export all payments to CSV"}
            >
              <RiDownloadLine className={exportLoading ? "spinning" : ""} />
              {exportLoading ? "Exporting..." : "Export"}
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

      {/* Payments Table */}
      <TechnicianPaymentTable
        title="Payment Management"
        payments={payments}
        loading={loading}
        error={error}
        pagination={pagination}
        statistics={stats ? {
          statusCounts: {
            Pending: stats.pendingCount,
            Paid: stats.paidCount
          },
          totalPayments: stats.totalPayments
        } : undefined}
        onPageChange={handlePageChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        searchInput={searchInput}
        onSearchInputChange={handleSearchChange}
        onSearchKeyPress={handleSearchKeyPress}
        onSearchBlur={handleSearchBlur}
        onPaymentAction={(paymentId, action, payment) => {
          if (action === "view") {
            setSelectedPayment(payment);
            setShowPaymentDetails(true);
          } else if (action === "markPaid") {
            showPaymentConfirmation(paymentId, "Paid", payment);
          }
        }}
        showActions={true}
      />

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
                    showPaymentConfirmation(selectedPayment.id, "Paid", selectedPayment);
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

      {/* Payment Confirmation Dialog */}
      {showConfirmDialog && pendingPaymentAction && (
        <div
          className="modal-overlay"
          onClick={handleCancelPaymentUpdate}
        >
          <div className="modal-content confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Payment Update</h3>
              <button
                className="modal-close"
                onClick={handleCancelPaymentUpdate}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="confirmation-content">
                <div className="confirmation-icon">
                  <RiCheckboxCircleLine />
                </div>
                <div className="confirmation-details">
                  <h4>Mark Payment as {pendingPaymentAction.newStatus}?</h4>
                  <p>Are you sure you want to mark this payment as {pendingPaymentAction.newStatus.toLowerCase()}?</p>
                  
                  {pendingPaymentAction.paymentData && (
                    <div className="payment-summary">
                      <div className="summary-item">
                        <span className="label">Payment:</span>
                        <span className="value">{pendingPaymentAction.paymentData.paymentNumber}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Technician:</span>
                        <span className="value">
                          {pendingPaymentAction.paymentData.technicianId.firstName} {pendingPaymentAction.paymentData.technicianId.lastName}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Amount:</span>
                        <span className="value amount">
                          {formatCurrency(pendingPaymentAction.paymentData.amount)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Job Type:</span>
                        <span className="value">{pendingPaymentAction.paymentData.jobType}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="confirmation-note">
                    <RiInformationLine />
                    <span>
                      This action will set the payment date to <strong>{new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</strong> and cannot be undone.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancelPaymentUpdate}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleConfirmPaymentUpdate}
              >
                <RiCheckLine />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianPaymentManagement;
