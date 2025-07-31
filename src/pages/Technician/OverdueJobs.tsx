import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RiAlertLine } from "react-icons/ri";
import { technicianService } from "../../services";
import type { Job } from "../../services";
import TechnicianJobTable from "../../components/TechnicianJobTable";
import "./OverdueJobs.scss";

const OverdueJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
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
    totalJobs: number;
  } | null>(null);
  const [filters, setFilters] = useState({
    jobType: "",
    priority: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await technicianService.getOverdueJobs({
        page: currentPage,
        limit: 10,
        ...filters,
      });

      if (response.status === "success") {
        setJobs(response.data.jobs || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
        setStatistics(response.data.statistics || null);
      } else {
        setError(response.message || "Failed to fetch overdue jobs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching overdue jobs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleJobClick = (job: Job) => {
    navigate(`/jobs/${job.id}`);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="overdue-jobs-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <RiAlertLine />
          </div>
          <div className="header-text">
            <h1>Overdue Jobs</h1>
            <p>
              View and prioritize your overdue jobs that need immediate
              attention
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <TechnicianJobTable
          title="Overdue Jobs"
          jobs={jobs}
          loading={loading}
          error={error}
          pagination={pagination}
          statistics={statistics || undefined}
          onPageChange={handlePageChange}
          onJobClick={handleJobClick}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
};

export default OverdueJobs;
