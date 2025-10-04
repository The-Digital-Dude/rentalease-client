import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiCheckLine,
  RiAlertLine,
  RiRefreshLine,
  RiSearchLine,
  RiMapPinLine,
  RiCalendarLine,
  RiTimeLine,
  RiEyeLine,
  RiLoader4Line,
} from "react-icons/ri";
import toast from "react-hot-toast";
import technicianService from "../../services/technicianService";
import jobService from "../../services/jobService";
import type { Job } from "../../services/jobService";
import JobCompletionModal from "../../components/JobCompletionModal";
import "./MyJobs.scss";

type TechnicianTab = "all" | "Scheduled" | "In Progress" | "Completed" | "Overdue";

const STATUS_TABS: Array<{ id: TechnicianTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "Scheduled", label: "Scheduled" },
  { id: "In Progress", label: "In Progress" },
  { id: "Completed", label: "Completed" },
  { id: "Overdue", label: "Overdue" },
];

type JobsResponse = {
  status: string;
  message?: string;
  data?: {
    jobs?: Job[];
    statistics?: {
      statusCounts?: Record<string, number>;
      totalJobs?: number;
    };
  };
};

const MyJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statistics, setStatistics] = useState<{
    statusCounts: Record<string, number>;
    totalJobs: number;
  }>({ statusCounts: {}, totalJobs: 0 });
  const [statusFilter, setStatusFilter] = useState<TechnicianTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [jobToComplete, setJobToComplete] = useState<Job | null>(null);
  const [completionLoading, setCompletionLoading] = useState(false);

  const fetchJobs = useCallback(
    async (currentStatus: TechnicianTab) => {
      setLoading(true);
      setError(null);

      try {
        const response: JobsResponse = await technicianService.getMyJobs({
          status: currentStatus === "all" ? undefined : currentStatus,
          limit: 100,
        });

        if (response.status === "success" && response.data) {
          setJobs(response.data.jobs ?? []);
          setStatistics({
            statusCounts: response.data.statistics?.statusCounts ?? {},
            totalJobs: response.data.statistics?.totalJobs ?? 0,
          });
        } else {
          throw new Error(response.message || "Failed to fetch jobs");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchJobs(statusFilter);
  }, [fetchJobs, statusFilter]);

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    const term = searchTerm.toLowerCase();

    return jobs.filter((job) => {
      const address = extractAddress(job)?.toLowerCase() ?? "";
      const jobId = job.job_id?.toLowerCase() ?? "";
      const jobType = job.jobType?.toLowerCase() ?? "";
      const description = job.description?.toLowerCase() ?? "";

      return (
        address.includes(term) ||
        jobId.includes(term) ||
        jobType.includes(term) ||
        description.includes(term)
      );
    });
  }, [jobs, searchTerm]);

  const summaryCards = useMemo(() => {
    const counts = statistics.statusCounts || {};
    return [
      { label: "Total", value: statistics.totalJobs || jobs.length },
      { label: "Scheduled", value: counts["Scheduled"] || 0 },
      { label: "In Progress", value: counts["In Progress"] || 0 },
      { label: "Completed", value: counts["Completed"] || 0 },
      { label: "Overdue", value: counts["Overdue"] || 0 },
    ];
  }, [statistics, jobs.length]);

  const handleCompleteClick = (job: Job) => {
    setJobToComplete(job);
    setShowCompletionModal(true);
  };

  const handleCompletionSubmit = async (data: {
    reportFile: File | null;
    hasInvoice: boolean;
    invoiceData?: {
      description: string;
      items: Array<{
        id: string;
        name: string;
        quantity: number;
        rate: number;
        amount: number;
      }>;
      subtotal: number;
      tax: number;
      taxPercentage: number;
      totalCost: number;
      notes: string;
    };
  }) => {
    if (!jobToComplete) return;

    try {
      setCompletionLoading(true);
      await jobService.completeJob(jobToComplete.id, data);
      toast.success("Job completed successfully");
      setShowCompletionModal(false);
      setJobToComplete(null);
      fetchJobs(statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete job");
      throw err;
    } finally {
      setCompletionLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
      case "scheduled":
        return "warning";
      case "overdue":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch ((priority || "medium").toLowerCase()) {
      case "urgent":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const formatDueLabel = (date: string) => {
    const due = new Date(date);
    const today = new Date();
    if (due.toDateString() === today.toDateString()) return "Due today";
    if (due < today) return "Overdue";
    return `Due ${due.toLocaleDateString()}`;
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
            <p>View jobs you've claimed, track progress, and complete reports.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => fetchJobs(statusFilter)}>
            <RiRefreshLine /> Refresh
          </button>
        </div>
      </div>

      <div className="stats-row">
        {summaryCards.map((card) => (
          <div key={card.label} className="stat-card">
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${statusFilter === tab.id ? "active" : ""}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="search-input">
          <RiSearchLine />
          <input
            type="text"
            placeholder="Search jobs by address, type, or notes"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <RiLoader4Line className="loading-spinner" />
          <p>Loading your jobs…</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <RiAlertLine />
          <div>
            <h3>We couldn't load your jobs</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <RiBriefcaseLine />
          <h3>No jobs in this view</h3>
          <p>You're all caught up. Check for available jobs to claim a new one.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            const priorityClass = getPriorityClass(job.priority);
            const statusClass = getStatusClass(job.status);
            const propertyAddress = extractAddress(job) || "Address not available";
            const dueLabel = formatDueLabel(job.dueDate);

            const canComplete = job.status === "In Progress";

            return (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-type">
                    <RiBriefcaseLine />
                    <span>{job.jobType}</span>
                    <span className="job-id">#{job.job_id}</span>
                  </div>
                  <div className="job-badges">
                    <span className={`priority-badge ${priorityClass}`}>
                      {job.priority || "Medium"}
                    </span>
                    <span className={`status-badge ${statusClass}`}>{job.status}</span>
                  </div>
                </div>

                <div className="job-details">
                  <div className="detail-row">
                    <RiMapPinLine />
                    <span>{propertyAddress}</span>
                  </div>
                  <div className="detail-row">
                    <RiCalendarLine />
                    <span>{new Date(job.dueDate).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <RiTimeLine />
                    <span>{job.estimatedDuration || "Duration TBD"}</span>
                  </div>
                  <p className="job-notes">
                    {job.description || "No additional notes provided."}
                  </p>
                  <span className={`due-badge ${statusClass}`}>{dueLabel}</span>
                </div>

                <div className="job-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <RiEyeLine /> View Details
                  </button>
                  {canComplete && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCompleteClick(job)}
                    >
                      <RiCheckLine /> Complete Job
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <JobCompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setJobToComplete(null);
        }}
        onSubmit={handleCompletionSubmit}
        jobId={jobToComplete?.id || ""}
        dueDate={jobToComplete?.dueDate || new Date().toISOString()}
        loading={completionLoading}
      />
    </div>
  );
};

function extractAddress(job: Job): string | undefined {
  const property = job.property;
  if (!property) return undefined;

  if (typeof property === "string") {
    return property;
  }

  const address = property.address;
  if (!address) return undefined;

  if (typeof address === "string") {
    return address;
  }

  return (
    address.fullAddress ||
    [address.street, address.suburb, address.state, address.postcode]
      .filter(Boolean)
      .join(", ")
  );
}

export default MyJobs;
