import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiStarFill,
  RiStarLine,
  RiShieldCheckLine,
  RiToolsLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlarmWarningLine,
  RiCalendarLine,
  RiMoneyDollarBoxLine,
  RiTrophyLine,
  RiBriefcaseLine,
  RiHome3Line,
  RiSettings2Line,
  RiWalletLine
} from "react-icons/ri";
import technicianService from "../../services/technicianService";
import jobService from "../../services/jobService";
import technicianPaymentService from "../../services/technicianPaymentService";
import type { Technician } from "../../services/technicianService";
import type { Job } from "../../services/jobService";
import type { TechnicianPayment } from "../../services/technicianPaymentService";
import { formatDateTime } from "../../utils";
import "./TechnicianProfile.scss";

const TechnicianProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [payments, setPayments] = useState<TechnicianPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "performance" | "payments">("overview");

  useEffect(() => {
    const loadTechnician = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await technicianService.getTechnicianById(id);
        if (response.status === "success" && response.data.technician) {
          setTechnician(response.data.technician);
        } else {
          setError(response.message || "Failed to load technician");
        }
      } catch (error: any) {
        console.error("Error loading technician:", error);
        setError(error.message || "Failed to load technician");
      } finally {
        setLoading(false);
      }
    };

    const loadJobs = async () => {
      if (!id) return;
      try {
        setJobsLoading(true);
        // Fetch recent jobs for this technician
        const response = await jobService.getJobs({
          assignedTechnician: id,
          limit: 10,
          sortBy: "dueDate",
          sortOrder: "desc"
        });
        if (response.success && Array.isArray(response.data)) {
          const jobsData = response.data.filter(
            (item: any) => item.job_id && item.property && item.jobType
          ) as Job[];
          setJobs(jobsData);
        }
      } catch (error: any) {
        console.error("Error loading jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    };

    const loadPayments = async () => {
      if (!id) return;
      try {
        setPaymentsLoading(true);
        console.log("Loading payments for technician ID:", id);

        // Use the correct technician payment service
        const response = await technicianPaymentService.getPayments({
          technicianId: id,
          limit: 100,
          page: 1
        });

        console.log("Technician payments API response:", response);

        if (response.status === "success" && response.data?.payments) {
          console.log("Found payments for technician:", response.data.payments.length);
          console.log("Payment details:", response.data.payments);
          setPayments(response.data.payments);
        } else {
          console.log("No payments found or unsuccessful response for technician");
          setPayments([]);
        }
      } catch (error: any) {
        console.error("Failed to load payments:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        setPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };

    loadTechnician();
    loadJobs();
    loadPayments();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "busy":
        return "warning";
      case "unavailable":
        return "danger";
      case "on leave":
        return "info";
      default:
        return "secondary";
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "scheduled":
        return "info";
      case "overdue":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const renderStars = (rating: number, totalRatings: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<RiStarFill key={i} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<RiStarFill key={i} className="star half" />);
      } else {
        stars.push(<RiStarLine key={i} className="star empty" />);
      }
    }

    return (
      <div className="rating-display">
        <div className="stars">{stars}</div>
        <span className="rating-text">
          {rating.toFixed(1)} ({totalRatings} reviews)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="technician-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading technician profile...</p>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="technician-profile-page">
        <div className="error-container">
          <div className="error-icon">
            <RiAlarmWarningLine />
          </div>
          <h2>Technician Not Found</h2>
          <p>{error || "The requested technician could not be found."}</p>
          <button onClick={handleBack} className="back-button">
            <RiArrowLeftLine />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-profile-page">
      {/* Header */}
      <div className="profile-header">
        <button onClick={handleBack} className="back-button">
          <RiArrowLeftLine />
          Back
        </button>

        <div className="hero-section">
          <div className="technician-avatar">
            <RiUserLine />
          </div>

          <div className="technician-info">
            <h1 className="technician-name">{technician.fullName}</h1>
            <div className="technician-meta">
              <span className={`status-badge ${getStatusColor(technician.availabilityStatus)}`}>
                <RiShieldCheckLine />
                {technician.availabilityStatus}
              </span>
              <span className="experience">
                <RiTrophyLine />
                {technician.experience} years experience
              </span>
            </div>

            {technician.averageRating > 0 && (
              <div className="rating-section">
                {renderStars(technician.averageRating, technician.totalRatings)}
              </div>
            )}
          </div>

          <div className="quick-actions">
            <a href={`tel:${technician.phone}`} className="action-button phone">
              <RiPhoneLine />
              Call
            </a>
            <a href={`mailto:${technician.email}`} className="action-button email">
              <RiMailLine />
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <RiHome3Line />
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          <RiToolsLine />
          Jobs ({jobs.length})
        </button>
        <button
          className={`tab-button ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
        >
          <RiTrophyLine />
          Performance
        </button>
        <button
          className={`tab-button ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          <RiWalletLine />
          Payments ({payments.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card jobs-completed">
                <div className="stat-icon">
                  <RiCheckboxCircleLine />
                </div>
                <div className="stat-content">
                  <h3>{technician.completedJobs}</h3>
                  <p>Jobs Completed</p>
                </div>
              </div>

              <div className="stat-card active-jobs">
                <div className="stat-icon">
                  <RiToolsLine />
                </div>
                <div className="stat-content">
                  <h3>{technician.currentJobs}</h3>
                  <p>Active Jobs</p>
                </div>
              </div>

              <div className="stat-card max-capacity">
                <div className="stat-icon">
                  <RiBriefcaseLine />
                </div>
                <div className="stat-content">
                  <h3>{technician.maxJobs}</h3>
                  <p>Max Capacity</p>
                </div>
              </div>

              <div className="stat-card rating">
                <div className="stat-icon">
                  <RiStarFill />
                </div>
                <div className="stat-content">
                  <h3>{technician.averageRating.toFixed(1)}</h3>
                  <p>Average Rating</p>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="info-grid">
              {/* Contact Information */}
              <div className="info-card contact-card">
                <div className="card-header">
                  <h3>
                    <RiMailLine />
                    Contact Information
                  </h3>
                </div>
                <div className="card-content">
                  <div className="contact-item">
                    <RiMailLine />
                    <span>Email</span>
                    <a href={`mailto:${technician.email}`}>{technician.email}</a>
                  </div>
                  <div className="contact-item">
                    <RiPhoneLine />
                    <span>Phone</span>
                    <a href={`tel:${technician.phone}`}>{technician.phone}</a>
                  </div>
                  {technician.address?.fullAddress && (
                    <div className="contact-item">
                      <RiMapPinLine />
                      <span>Address</span>
                      <span>{technician.address.fullAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="info-card account-card">
                <div className="card-header">
                  <h3>
                    <RiSettings2Line />
                    Account Details
                  </h3>
                </div>
                <div className="card-content">
                  <div className="detail-item">
                    <span className="label">Status</span>
                    <span className={`value status ${technician.status.toLowerCase()}`}>
                      {technician.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Member Since</span>
                    <span className="value">{formatDateTime(technician.createdAt)}</span>
                  </div>
                  {technician.lastLogin && (
                    <div className="detail-item">
                      <span className="label">Last Login</span>
                      <span className="value">{formatDateTime(technician.lastLogin)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="jobs-tab">
            <div className="jobs-header">
              <h3>Recent Jobs</h3>
              <p>Last 10 jobs assigned to this technician</p>
            </div>

            {jobsLoading ? (
              <div className="jobs-loading">
                <div className="loading-spinner"></div>
                <p>Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="jobs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.job_id}>
                        <td>
                          <span className="job-id">#{job.job_id}</span>
                        </td>
                        <td>
                          <div className="property-info">
                            <span className="property-address">
                              {typeof job.property === 'object' && job.property?.address?.fullAddress
                                ? job.property.address.fullAddress
                                : job.property}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="job-type">{job.jobType}</span>
                        </td>
                        <td>
                          <span className="due-date">
                            {formatDateTime(job.dueDate)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getJobStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge ${job.priority?.toLowerCase() || 'normal'}`}>
                            {job.priority || 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-jobs">
                <RiToolsLine />
                <h4>No Jobs Found</h4>
                <p>This technician hasn't been assigned any jobs yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className="performance-tab">
            <div className="performance-metrics">
              <h3>Performance Overview</h3>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <h4>Job Completion Rate</h4>
                  </div>
                  <div className="metric-value">
                    <span className="percentage">
                      {technician.completedJobs > 0 ?
                        Math.round((technician.completedJobs / (technician.completedJobs + technician.currentJobs)) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h4>Current Workload</h4>
                  </div>
                  <div className="metric-value">
                    <span className="workload">
                      {technician.currentJobs} / {technician.maxJobs}
                    </span>
                    <div className="workload-bar">
                      <div
                        className="workload-fill"
                        style={{
                          width: `${(technician.currentJobs / technician.maxJobs) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h4>Average Rating</h4>
                  </div>
                  <div className="metric-value">
                    {renderStars(technician.averageRating, technician.totalRatings)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="payments-tab">
            <div className="payments-header">
              <h3>Payment History</h3>
              <div className="payments-summary">
                <div className="summary-item">
                  <span className="label">Total Payments:</span>
                  <span className="value">{payments.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Earned:</span>
                  <span className="value">
                    ${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {paymentsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="no-payments">
                <div className="empty-state">
                  <RiWalletLine className="empty-icon" />
                  <h4>No Payment Records</h4>
                  <p>No payment history found for this technician.</p>
                </div>
              </div>
            ) : (
              <div className="payments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Job ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Job Type</th>
                      <th>Completed</th>
                      <th>Paid Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="invoice-id">
                          {payment.paymentNumber}
                        </td>
                        <td className="job-id">
                          {typeof payment.jobId === 'object' && payment.jobId?.job_id
                            ? payment.jobId.job_id
                            : payment.jobId}
                        </td>
                        <td className="amount">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td>
                          <span className={`status-badge ${payment.status.toLowerCase().replace(' ', '-')}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="job-type">
                          {payment.jobType}
                        </td>
                        <td className="date">
                          {payment.jobCompletedAt
                            ? new Date(payment.jobCompletedAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="date">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianProfile;