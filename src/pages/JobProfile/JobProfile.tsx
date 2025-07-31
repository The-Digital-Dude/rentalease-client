import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiToolsLine,
  RiUser3Line,
  RiShieldCheckLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiEyeLine,
  RiBuildingLine,
  RiTeamLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiStarLine,
  RiHomeLine,
  RiInformationLine,
  RiRefreshLine,
} from "react-icons/ri";
import jobService from "../../services/jobService";
import type { Job } from "../../services/jobService";
import { formatDateTime } from "../../utils";
import "./JobProfile.scss";

interface JobProfileData {
  job: Job;
  property: {
    id: string;
    address: {
      fullAddress: string;
      street: string;
      suburb: string;
      state: string;
      postcode: string;
    };
    propertyType: string;
    currentTenant?: {
      name: string;
      email: string;
      phone: string;
    };
    currentLandlord?: {
      name: string;
      email: string;
      phone: string;
    };
    status: string;
  };
  technician?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    availabilityStatus: string;
    currentJobs: number;
    hourlyRate: number;
  };
  statistics: {
    totalCost: number;
    estimatedDuration: number;
    actualDuration?: number;
    isOverdue: boolean;
    daysUntilDue: number;
  };
}

const JobProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState<JobProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "property" | "technician"
  >("overview");

  useEffect(() => {
    const fetchJobData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await jobService.getJobById(id);

        if (response.success && response.data) {
          // Transform the data to match our JobProfileData interface
          const job = response.data as any; // Using any for now since the API response structure is different

          // Use real data from the API response
          const jobData: JobProfileData = {
            job: {
              id: job.id,
              job_id: job.job_id,
              property: job.property,
              jobType: job.jobType,
              dueDate: job.dueDate,
              assignedTechnician: job.assignedTechnician,
              status: job.status,
              priority: job.priority,
              description: job.description,
              completedAt: job.completedAt,
              estimatedDuration: job.estimatedDuration,
              actualDuration: job.actualDuration,
              cost: job.cost,
              notes: job.notes,
              owner: job.owner,
              createdBy: job.createdBy,
              lastUpdatedBy: job.lastUpdatedBy,
              createdAt: job.createdAt,
              updatedAt: job.updatedAt,
            },
            property: {
              id: job.property._id,
              address: {
                fullAddress: job.property.address.fullAddress,
                street: job.property.address.street,
                suburb: job.property.address.suburb,
                state: job.property.address.state,
                postcode: job.property.address.postcode,
              },
              propertyType: job.property.propertyType,
              currentTenant: job.property.currentTenant,
              currentLandlord: job.property.currentLandlord,
              status: "Active", // Default status since it's not in the API response
            },
            technician: job.assignedTechnician
              ? {
                  id: job.assignedTechnician._id || job.assignedTechnician.id,
                  firstName:
                    job.assignedTechnician.firstName ||
                    job.assignedTechnician.name,
                  lastName:
                    job.assignedTechnician.lastName ||
                    job.assignedTechnician.name,
                  phone: job.assignedTechnician.phone || "",
                  email: job.assignedTechnician.email || "",
                  availabilityStatus:
                    job.assignedTechnician.availabilityStatus || "Unknown",
                  currentJobs: job.assignedTechnician.currentJobs || 0,
                  hourlyRate: job.assignedTechnician.hourlyRate || 0,
                }
              : undefined,
            statistics: {
              totalCost: job.cost?.totalCost || 0,
              estimatedDuration: job.estimatedDuration || 0,
              actualDuration: job.actualDuration,
              isOverdue: job.isOverdue || job.status === "Overdue",
              daysUntilDue: Math.ceil(
                (new Date(job.dueDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              ),
            },
          };

          setJobData(jobData);
        } else {
          setError(response.message || "Failed to load job data");
        }
      } catch (error: unknown) {
        console.error("Error loading job:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load job data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  const handleBack = () => {
    navigate("/jobs");
  };

  const handleEdit = () => {
    // Navigate to edit job or open edit modal
    console.log("Edit job:", id);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleViewTechnician = (technicianId: string) => {
    navigate(`/staff/${technicianId}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <div className="job-profile-error-content">
            <h3>Loading Job Profile</h3>
            <p>Please wait while we fetch the job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="page-container">
        <style>
          {`
            .job-profile-error-state {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              min-height: 60vh !important;
              text-align: center !important;
              padding: 2rem !important;
            }
            .job-profile-error-icon {
              width: 80px !important;
              height: 80px !important;
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              margin-bottom: 1.5rem !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            }
            .job-profile-error-icon svg {
              font-size: 2.5rem !important;
              color: #dc2626 !important;
            }
            .job-profile-error-content {
              max-width: 500px !important;
              background: white !important;
              border-radius: 1rem !important;
              padding: 2rem !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
              border: 1px solid #e5e7eb !important;
            }
            .job-profile-error-content h3 {
              font-size: 1.75rem !important;
              font-weight: 700 !important;
              margin: 0 0 1rem 0 !important;
              background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
              -webkit-background-clip: text !important;
              -webkit-text-fill-color: transparent !important;
              background-clip: text !important;
            }
            .job-profile-error-content p {
              color: #6b7280 !important;
              margin: 0 0 2rem 0 !important;
              font-size: 1.125rem !important;
              line-height: 1.6 !important;
            }
            .job-profile-error-details {
              background: #fef2f2 !important;
              border: 1px solid #fecaca !important;
              border-radius: 0.5rem !important;
              padding: 1rem !important;
              margin-bottom: 2rem !important;
              text-align: left !important;
            }
            .job-profile-error-code {
              font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important;
              font-size: 0.875rem !important;
              color: #dc2626 !important;
              background: #fee2e2 !important;
              padding: 0.25rem 0.5rem !important;
              border-radius: 0.25rem !important;
              display: inline-block !important;
              margin-bottom: 0.5rem !important;
            }
            .job-profile-error-message {
              color: #991b1b !important;
              font-size: 0.875rem !important;
              line-height: 1.5 !important;
            }
            .job-profile-error-actions {
              display: flex !important;
              gap: 1rem !important;
              justify-content: center !important;
              flex-wrap: wrap !important;
            }
            .job-profile-btn-primary {
              background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
              color: white !important;
              border: none !important;
              padding: 0.875rem 1.75rem !important;
              border-radius: 0.5rem !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              font-weight: 600 !important;
              font-size: 1rem !important;
              display: flex !important;
              align-items: center !important;
              gap: 0.5rem !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            }
            .job-profile-btn-primary:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
            }
            .job-profile-btn-secondary {
              background: white !important;
              color: #6b7280 !important;
              border: 2px solid #e5e7eb !important;
              padding: 0.875rem 1.75rem !important;
              border-radius: 0.5rem !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              font-weight: 600 !important;
              font-size: 1rem !important;
              display: flex !important;
              align-items: center !important;
              gap: 0.5rem !important;
            }
            .job-profile-btn-secondary:hover {
              background: #f9fafb !important;
              border-color: #d1d5db !important;
              color: #374151 !important;
              transform: translateY(-1px) !important;
            }
          `}
        </style>
        <div className="job-profile-error-state">
          <div className="job-profile-error-icon">
            <RiAlertLine />
          </div>
          <div className="job-profile-error-content">
            <h3>Error Loading Job</h3>
            <p>{error || "Job not found"}</p>
            {error && (
              <div className="job-profile-error-details">
                <div className="job-profile-error-code">ERROR_403</div>
                <div className="job-profile-error-message">
                  {error.includes("permission") ||
                  error.includes("access denied")
                    ? "You don't have permission to view this job. Please contact your administrator if you believe this is an error."
                    : "An unexpected error occurred while loading the job details. Please try again or contact support if the problem persists."}
                </div>
              </div>
            )}
            <div className="job-profile-error-actions">
              <button onClick={handleBack} className="job-profile-btn-primary">
                <RiArrowLeftLine />
                Back to Jobs
              </button>
              <button
                onClick={() => window.location.reload()}
                className="job-profile-btn-secondary"
              >
                <RiRefreshLine />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { job, property, technician, statistics } = jobData;

  const statsCards = [
    {
      title: "Job Status",
      value: job.status,
      change: statistics.isOverdue
        ? `${Math.abs(statistics.daysUntilDue)} days overdue`
        : `${statistics.daysUntilDue} days until due`,
      changeType: statistics.isOverdue
        ? "negative"
        : statistics.daysUntilDue <= 1
        ? "warning"
        : "positive",
      icon: RiCheckboxCircleLine,
      color: "blue",
    },
    {
      title: "Priority",
      value: job.priority,
      change: "Job priority level",
      changeType: "neutral",
      icon: RiStarLine,
      color:
        job.priority === "Urgent"
          ? "red"
          : job.priority === "High"
          ? "orange"
          : "green",
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "available":
        return "status-success";
      case "scheduled":
      case "pending":
        return "status-warning";
      case "overdue":
      case "unavailable":
        return "status-danger";
      default:
        return "status-neutral";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "priority-urgent";
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  return (
    <div className="page-container job-profile-page">
      {/* Header */}
      <div className="profile-header">
        <button onClick={handleBack} className="back-btn">
          <RiArrowLeftLine />
          Back to Jobs
        </button>
        <div className="header-content">
          <div className="job-info">
            <h1>{job.job_id}</h1>
            <p className="job-type">{job.jobType}</p>
            <div className="job-meta">
              <span
                className={`status-badge ${getStatusBadgeClass(job.status)}`}
              >
                {job.status}
              </span>
              <span
                className={`priority-badge ${getPriorityBadgeClass(
                  job.priority
                )}`}
              >
                {job.priority}
              </span>
            </div>
          </div>
          {/* <div className="header-actions">
            <button onClick={handleEdit} className="btn-secondary">
              <RiEditLine />
              Edit Job
            </button>
          </div> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <span className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <RiInformationLine />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <RiFileListLine />
          Job Details
        </button>
        <button
          className={`tab-btn ${activeTab === "property" ? "active" : ""}`}
          onClick={() => setActiveTab("property")}
        >
          <RiHomeLine />
          Property
        </button>
        <button
          className={`tab-btn ${activeTab === "technician" ? "active" : ""}`}
          onClick={() => setActiveTab("technician")}
        >
          <RiTeamLine />
          Technician
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            {/* Job Information */}
            <div className="info-section">
              <h2>Job Information</h2>
              <div className="info-grid">
                <div className="info-card">
                  <h3>Basic Details</h3>
                  <div className="detail-info">
                    <div className="detail-item">
                      <RiToolsLine />
                      <div>
                        <label>Job Type</label>
                        <span>{job.jobType}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <RiCalendarLine />
                      <div>
                        <label>Due Date</label>
                        <span>{formatDateTime(job.dueDate)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <RiTimeLine />
                      <div>
                        <label>Created</label>
                        <span>{formatDateTime(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <RiMapPinLine />
                      <div>
                        <label>Property</label>
                        <span>{property.address.fullAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Assignment Details</h3>
                  <div className="assignment-info">
                    <div className="assignment-item">
                      <label>Assigned Technician</label>
                      <span>
                        {technician
                          ? technician.firstName + " " + technician.lastName
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            {job.description && (
              <>
                <div>
                  {/* <div className="description-section">
                    <h2>Job Description</h2>
                    <div className="description-content">
                      <p>{job.description}</p>
                    </div>
                  </div> */}
                </div>
              </>
            )}

            {/* Cost Breakdown */}
            <div className="cost-section">
              <h2>Cost Breakdown</h2>
              <div className="cost-grid">
                <div className="cost-card total">
                  <h3>Material Cost</h3>
                  <div className="cost-amount">${statistics.totalCost}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="details-content">
            <div className="section-header">
              <h2>Job Details</h2>
              <p>Complete job information and specifications</p>
            </div>

            <div className="details-grid">
              <div className="detail-card">
                <h3>Job Specifications</h3>
                <div className="spec-list">
                  <div className="spec-item">
                    <label>Job ID</label>
                    <span>{job.job_id}</span>
                  </div>
                  <div className="spec-item">
                    <label>Job Type</label>
                    <span>{job.jobType}</span>
                  </div>
                  <div className="spec-item">
                    <label>Priority</label>
                    <span
                      className={`priority-badge ${getPriorityBadgeClass(
                        job.priority
                      )}`}
                    >
                      {job.priority}
                    </span>
                  </div>
                  <div className="spec-item">
                    <label>Status</label>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="spec-item">
                    <label>Due Date</label>
                    <span>{formatDateTime(job.dueDate)}</span>
                  </div>
                  <div className="spec-item">
                    <label>Created Date</label>
                    <span>{formatDateTime(job.createdAt)}</span>
                  </div>
                </div>
              </div>

              {job.description && (
                <div className="detail-card full-width">
                  <h3>Description</h3>
                  <div className="description-text">{job.description}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "property" && (
          <div className="property-content">
            <div className="section-header">
              <h2>Property Information</h2>
              <p>Details about the property where this job is located</p>
            </div>

            <div className="property-details">
              <div className="property-card">
                <h3>Property Details</h3>
                <div className="property-info">
                  <div className="property-item">
                    <RiMapPinLine />
                    <div>
                      <label>Address</label>
                      <span>{property.address.fullAddress}</span>
                    </div>
                  </div>
                  <div className="property-item">
                    <RiBuildingLine />
                    <div>
                      <label>Property Type</label>
                      <span>{property.propertyType}</span>
                    </div>
                  </div>
                  <div className="property-item">
                    <RiShieldCheckLine />
                    <div>
                      <label>Status</label>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="property-card">
                <h3>Tenant Information</h3>
                <div className="tenant-info">
                  {property.currentTenant ? (
                    <>
                      <div className="contact-item">
                        <RiUser3Line />
                        <div>
                          <label>Name</label>
                          <span>{property.currentTenant.name}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiMailLine />
                        <div>
                          <label>Email</label>
                          <span>{property.currentTenant.email}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiPhoneLine />
                        <div>
                          <label>Phone</label>
                          <span>{property.currentTenant.phone}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data">
                      No tenant information available
                    </div>
                  )}
                </div>
              </div>

              <div className="property-card">
                <h3>Landlord Information</h3>
                <div className="landlord-info">
                  {property.currentLandlord ? (
                    <>
                      <div className="contact-item">
                        <RiUser3Line />
                        <div>
                          <label>Name</label>
                          <span>{property.currentLandlord.name}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiMailLine />
                        <div>
                          <label>Email</label>
                          <span>{property.currentLandlord.email}</span>
                        </div>
                      </div>
                      <div className="contact-item">
                        <RiPhoneLine />
                        <div>
                          <label>Phone</label>
                          <span>{property.currentLandlord.phone}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data">
                      No landlord information available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="property-actions">
              <button
                onClick={() => handleViewProperty(property.id)}
                className="btn-primary"
              >
                <RiEyeLine />
                View Property Details
              </button>
            </div>
          </div>
        )}

        {activeTab === "technician" && (
          <div className="technician-content">
            <div className="section-header">
              <h2>Technician Information</h2>
              <p>Details about the assigned technician</p>
            </div>

            {technician ? (
              <div className="technician-details">
                <div className="technician-card">
                  <h3>Technician Details</h3>
                  <div className="technician-info">
                    <div className="technician-item">
                      <RiUser3Line />
                      <div>
                        <label>Name</label>
                        <span>{technician.firstName} {technician.lastName}</span>
                      </div>
                    </div>
                    <div className="technician-item">
                      <RiMailLine />
                      <div>
                        <label>Email</label>
                        <span>{technician.email}</span>
                      </div>
                    </div>
                    <div className="technician-item">
                      <RiPhoneLine />
                      <div>
                        <label>Phone</label>
                        <span>{technician.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="technician-actions">
                  <button
                    onClick={() => handleViewTechnician(technician.id)}
                    className="btn-primary"
                  >
                    <RiEyeLine />
                    View Technician Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-technician">
                <div className="no-data-card">
                  <RiTeamLine />
                  <h3>No Technician Assigned</h3>
                  <p>This job has not been assigned to a technician yet.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobProfile;
