import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RiBriefcaseLine } from "react-icons/ri";
import { technicianService } from "../../services";
import type { Job } from "../../services";
import TechnicianJobTable from "../../components/TechnicianJobTable";
import "./MyJobs.scss";

const MyJobs: React.FC = () => {
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
    status: "",
    priority: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await technicianService.getMyJobs({
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
        setError(response.message || "Failed to fetch jobs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching jobs");
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
    <div className="my-jobs-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <RiBriefcaseLine />
          </div>
          <div className="header-text">
            <h1>My Jobs</h1>
            <p>View and manage all jobs assigned to you</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <TechnicianJobTable
          title="My Jobs"
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

export default MyJobs;
