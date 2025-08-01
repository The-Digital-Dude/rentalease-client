import React, { useState, useEffect, useCallback } from "react";
import { RiMoneyDollarBoxLine } from "react-icons/ri";
import { technicianService } from "../../services";
import { TechnicianPaymentTable } from "../../components";
import "./MyPayments.scss";

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

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<TechnicianPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statistics, setStatistics] = useState<{
    statusCounts: Record<string, number>;
    totalPayments: number;
  } | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    jobType: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await technicianService.getMyPayments({
        page: currentPage,
        limit: 20,
        ...filters,
      });

      if (response.status === "success") {
        setPayments(response.data.payments || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 20,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
        setStatistics(response.data.statistics || null);
      } else {
        setError(response.message || "Failed to fetch payments");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching payments");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="my-payments-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <RiMoneyDollarBoxLine />
          </div>
          <div className="header-text">
            <h1>My Payments</h1>
            <p>View your payment history and earnings from completed jobs</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <TechnicianPaymentTable
          title="Payment History"
          payments={payments}
          loading={loading}
          error={error}
          pagination={pagination}
          statistics={statistics || undefined}
          onPageChange={handlePageChange}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
};

export default MyPayments;
