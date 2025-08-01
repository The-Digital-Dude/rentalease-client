import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiAlertLine, RiRefreshLine, RiArrowLeftLine } from "react-icons/ri";
import jobService from "../../services/jobService";
import type { Job } from "../../services/jobService";
import { useAppSelector } from "../../store/hooks";
import Toast from "../../components/Toast";
import JobProfileHeader from "../../components/JobProfileHeader";
import JobProfileStats from "../../components/JobProfileStats";
import JobProfileTabs from "../../components/JobProfileTabs";
import JobCompletionModal from "../../components/JobCompletionModal";
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
  const { userType } = useAppSelector((state) => state.user);
  const [jobData, setJobData] = useState<JobProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingJob, setCompletingJob] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });
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

  const handleCompleteJob = () => {
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
    if (!id || !jobData) return;

    try {
      setCompletingJob(true);
      setError(null);

      // Call the job service to complete the job with report file and invoice data
      const completionResult = await jobService.completeJob(id, {
        reportFile: data.reportFile || undefined,
        hasInvoice: data.hasInvoice,
        invoiceData: data.invoiceData,
      });

      if (completionResult.success) {
        // Update the job data with the completed job
        const responseData = completionResult.data as {
          job: Job;
          technician: {
            id: string;
            fullName: string;
            currentJobs: number;
            availabilityStatus: string;
          };
        };

        if (responseData?.job) {
          setJobData({
            ...jobData,
            job: responseData.job,
          });
        }

        // Show success toast
        setToast({
          message: completionResult.message || "Job completed successfully!",
          type: "success",
          isVisible: true,
        });

        // Close the modal
        setShowCompletionModal(false);
      } else {
        // Show error toast
        setToast({
          message: completionResult.message || "Failed to complete job",
          type: "error",
          isVisible: true,
        });
      }
    } catch (error: unknown) {
      console.error("Error completing job:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to complete job";
      setToast({
        message: errorMessage,
        type: "error",
        isVisible: true,
      });
    } finally {
      setCompletingJob(false);
    }
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
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
  // Get the unix time (ms) for 12am of the job's due date
  const dueDateObj = new Date(job.dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  console.log(dueDateObj.getTime(), "Job due date 12am (unix time)");
  console.log(new Date().getTime(), "Today's Date");

  const canComplete =
    userType === "technician" &&
    dueDateObj.getTime() < new Date().getTime() &&
    job.status !== "Completed";

  return (
    <div className="page-container job-profile-page">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      {/* Job Completion Modal */}
      <JobCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onSubmit={handleCompletionSubmit}
        jobId={job.id}
        dueDate={job.dueDate}
        loading={completingJob}
      />

      {/* Header */}
      <JobProfileHeader
        job={job}
        onBack={handleBack}
        onCompleteJob={handleCompleteJob}
        completingJob={completingJob}
        canComplete={canComplete}
        getStatusBadgeClass={getStatusBadgeClass}
        getPriorityBadgeClass={getPriorityBadgeClass}
      />

      {/* Stats Cards */}
      <JobProfileStats job={job} statistics={statistics} />

      {/* Tabs */}
      <JobProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        job={job}
        property={property}
        technician={technician}
        statistics={statistics}
        onViewProperty={handleViewProperty}
        onViewTechnician={handleViewTechnician}
        getStatusBadgeClass={getStatusBadgeClass}
        getPriorityBadgeClass={getPriorityBadgeClass}
      />
    </div>
  );
};

export default JobProfile;
