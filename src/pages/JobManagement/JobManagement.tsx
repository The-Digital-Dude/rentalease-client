import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  RiAddLine,
  RiToolsLine,
  RiTimeLine,
  RiFireLine,
  RiCheckboxCircleLine,
  RiGroupLine
} from "react-icons/ri";
import {
  JobFormModal,
  JobAllocationTool,
  JobsOverview,
} from "../../components";
import { jobService } from "../../services";
import technicianService from "../../services/technicianService";
import propertyService from "../../services/propertyService";
import type {
  Job as ServiceJob,
  CreateJobData,
  JobFilters,
} from "../../services/jobService";
import type { Technician as ServiceTechnician } from "../../services/technicianService";
import type { Property } from "../../services/propertyService";
import type { ComponentJob } from "../../utils/jobAdapter";
import { adaptServiceJobToComponentJob } from "../../utils/jobAdapter";
import type { ComponentTechnician } from "../../utils/technicianAdapter";
import { adaptServiceTechnicianToComponentTechnician } from "../../utils/technicianAdapter";
import type { RootState } from "../../store";
import "./JobManagement.scss";

interface JobFormData {
  propertyId: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs" | "Pool Safety" | "Routine Inspection";
  dueDate: string;
  assignedTechnician: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  description: string;
}

const initialFormData: JobFormData = {
  propertyId: "",
  jobType: "Gas",
  dueDate: "",
  assignedTechnician: "",
  priority: "Medium",
  description: "",
};

const JobManagement = () => {
  // Get user information for role-based access control
  const user = useSelector((state: RootState) => state.user);

  // Job data state
  const [jobs, setJobs] = useState<ComponentJob[]>([]);
  const [allJobs, setAllJobs] = useState<ComponentJob[]>([]); // Keep track of all jobs for stats
  const [technicians, setTechnicians] = useState<ComponentTechnician[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [draggedJob, setDraggedJob] = useState<ComponentJob | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssigningJob, setIsAssigningJob] = useState(false);
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  // Check if user can create jobs (super_user or team_member)
  const canCreateJobs = user.userType === "super_user" || user.userType === "team_member";

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Refetch jobs when pagination, filters, or sorting changes
  useEffect(() => {
    fetchJobs();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch technicians and properties (not jobs - that's handled separately)
      const [techResponse, propertiesResponse] = await Promise.all([
        technicianService.getTechnicians(),
        propertyService.getProperties({ limit: 100 }),
      ]);

      // Log responses for debugging
      console.log("Tech Response:", techResponse);
      console.log("Properties Response:", propertiesResponse);

      if (techResponse.status === "success" && techResponse.data.technicians) {
        const technicianData = techResponse.data
          .technicians as ServiceTechnician[];
        const componentTechnicians = technicianData.map(
          adaptServiceTechnicianToComponentTechnician
        );
        setTechnicians(componentTechnicians);
      } else {
        const errorMessage =
          techResponse.message || "Failed to fetch technicians";
        console.error("Technicians fetch error:", errorMessage);
        setError(errorMessage);
      }

      if (propertiesResponse.status === "success" && propertiesResponse.data) {
        setProperties(propertiesResponse.data.properties);
      } else {
        setError(propertiesResponse.message || "Failed to fetch properties");
      }

      // Fetch all jobs for stats (without pagination or filters)
      await fetchAllJobsForStats();
      // Fetch jobs with pagination
      await fetchJobs();
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllJobsForStats = async () => {
    try {
      // Fetch all jobs without pagination or filters for accurate stats
      const filters: JobFilters = {
        page: 1,
        limit: 1000, // Get a large number to get all jobs
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await jobService.getJobs(filters);

      if (response.success && response.data) {
        // Adapt all jobs for stats
        const allComponentJobs = (response.data as ServiceJob[]).map((job) =>
          adaptServiceJobToComponentJob(job, technicians)
        );
        setAllJobs(allComponentJobs);
      }
    } catch (err) {
      console.error("Fetch all jobs error:", err);
      // Don't set error here as this is just for stats
    }
  };

  const fetchJobs = async () => {
    try {
      setError(null);

      // Build filter object
      const filters: JobFilters = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder as "asc" | "desc",
      };

      // Add search filter
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      // Add status filter
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      // Add job type filter
      if (typeFilter !== "all") {
        filters.jobType = typeFilter;
      }

      const jobsResponse = await jobService.getJobs(filters);

      console.log("Jobs Response:", jobsResponse);

      if (jobsResponse.success && jobsResponse.data) {
        // Update pagination info
        if (jobsResponse.pagination) {
          setCurrentPage(jobsResponse.pagination.currentPage);
          setTotalPages(jobsResponse.pagination.totalPages);
          setTotalItems(jobsResponse.pagination.totalItems);
          setHasNextPage(jobsResponse.pagination.hasNextPage);
          setHasPrevPage(jobsResponse.pagination.hasPrevPage);
          setItemsPerPage(jobsResponse.pagination.itemsPerPage);
        }

        // Adapt jobs to component format
        const componentJobs = (jobsResponse.data as ServiceJob[]).map((job) =>
          adaptServiceJobToComponentJob(job, technicians)
        );
        setJobs(componentJobs);
      } else {
        const errorMessage = jobsResponse.message || "Failed to fetch jobs";
        console.error("Jobs fetch error:", errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    }
  };

  // Jobs are now filtered server-side, so we can use them directly
  const filteredJobs = jobs;

  // Get urgent/overdue jobs
  const urgentJobs = jobs.filter(
    (job) => job.status === "Overdue" || job.priority === "Urgent"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Scheduled":
        return "status-scheduled";
      case "Pending":
        return "status-pending";
      case "Overdue":
        return "status-overdue";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "priority-urgent";
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "";
    }
  };

  const handleCreateJob = async (formData: JobFormData) => {
    try {
      setIsCreatingJob(true);
      setError(null);
      const jobData: CreateJobData = {
        property: formData.propertyId,
        jobType: formData.jobType,
        dueDate: formData.dueDate,
        assignedTechnician: formData.assignedTechnician || null,
        priority: formData.priority,
        description: formData.description,
      };
      const response = await jobService.createJob(jobData);
      if (response.success && response.data) {
        await fetchInitialData(); // Refresh all data
        setFormData(initialFormData);
        setShowCreateForm(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to create job");
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragStart = (e: React.DragEvent<Element>, job: ComponentJob) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, technicianId: string) => {
    e.preventDefault();
    if (draggedJob) {
      // Find the technician
      const technician = technicians.find((tech) => tech.id === technicianId);
      if (!technician) {
        setError("Technician not found");
        return;
      }

      // Show confirmation dialog
      const confirmAssignment = window.confirm(
        `Are you sure you want to assign this job to ${technician.name}?\n\nJob: ${draggedJob.propertyAddress}\nTechnician: ${technician.name}`
      );

      if (!confirmAssignment) {
        setDraggedJob(null);
        return;
      }

      try {
        setIsAssigningJob(true);
        setAssigningJobId(draggedJob.id);

        // Use the new assignJob endpoint
        const response = await jobService.assignJob(
          draggedJob.id,
          technicianId
        );

        if (response.success) {
          // Update local technicians state with new job count
          if (response.data && "technician" in response.data) {
            const updatedTechnicians = technicians.map((tech) => {
              if (tech.id === technicianId) {
                return {
                  ...tech,
                  currentJobs: (response.data as any).technician.currentJobs,
                  availability: (response.data as any).technician
                    .availabilityStatus,
                };
              }
              return tech;
            });
            setTechnicians(updatedTechnicians);
          }
          await fetchInitialData(); // Refresh all data
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to assign job");
      } finally {
        setIsAssigningJob(false);
        setAssigningJobId(null);
      }
    }
    setDraggedJob(null);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleEditJob = (job: ComponentJob) => {
    setFormData({
      propertyId: job.propertyId,
      jobType: job.jobType,
      dueDate: job.dueDate,
      assignedTechnician: job.assignedTechnicianId,
      priority: job.priority,
      description: job.description || "",
    });
    setShowCreateForm(true);
  };

  const handleUpdateJobStatus = async (
    jobId: string,
    newStatus: ComponentJob["status"]
  ) => {
    try {
      // Find the job to get current technician info
      const currentJob = jobs.find((job) => job.id === jobId);
      const wasAssigned = currentJob?.assignedTechnicianId;

      // If marking as Pending or Cancelled and job was assigned, we need to unassign
      if ((newStatus === "Pending" || newStatus === "Cancelled") && wasAssigned) {
        // Update job to unassign technician and change status
        const response = await jobService.updateJob(jobId, {
          status: newStatus,
          assignedTechnician: null as any, // Unassign the technician
        });

        if (response.success) {
          // Refresh all data to get updated job counts from backend
          await fetchInitialData();
        } else {
          setError(response.message);
        }
      } else {
        // For other status changes, just update the status
        const response = await jobService.updateJobStatus(jobId, newStatus);
        if (response.success) {
          // Update jobs state locally
          setJobs((prevJobs) =>
            prevJobs.map((job) => {
              if (job.id === jobId) {
                return {
                  ...job,
                  status: newStatus,
                };
              }
              return job;
            })
          );
        } else {
          setError(response.message);
        }
      }
    } catch (err) {
      setError("Failed to update job status");
    }
    setShowActionMenu(null);
  };

  const handleUpdateJob = async (updatedJob: ComponentJob) => {
    try {
      setError(null);
      setIsAssigningJob(true);
      setAssigningJobId(updatedJob.id);

      const updatePayload: any = {
        jobType: updatedJob.jobType,
        dueDate: updatedJob.dueDate,
        assignedTechnician: updatedJob.assignedTechnicianId || null,
        status: updatedJob.status,
        priority: updatedJob.priority,
        description: updatedJob.description || "",
      };
      if (updatedJob.propertyId) {
        updatePayload.property = updatedJob.propertyId;
      }
      const response = await jobService.updateJob(updatedJob.id, updatePayload);
      if (response.success) {
        await fetchInitialData(); // Refresh all data
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to update job");
    } finally {
      setIsAssigningJob(false);
      setAssigningJobId(null);
    }
  };

  if (isLoading) {
    return <div className="page-container">Loading jobs...</div>;
  }

  return (
    <div className="page-container modern-job-management">
      <div className="modern-page-header">
        <div className="header-content">
          <div className="title-section">
            <div className="page-icon">
              <RiToolsLine />
            </div>
            <div className="title-content">
              <h1>Job Management Hub</h1>
              <p>Streamlined property maintenance & compliance workflow</p>
            </div>
          </div>
          <div className="header-actions">
            {canCreateJobs && (
              <button
                className="action-btn primary"
                onClick={() => setShowCreateForm(true)}
              >
                <RiAddLine />
                Create New Job
              </button>
            )}
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-icon total">
              <RiToolsLine />
            </div>
            <div className="stat-content">
              <span className="stat-number">{allJobs.length}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon pending">
              <RiTimeLine />
            </div>
            <div className="stat-content">
              <span className="stat-number">{allJobs.filter(j => j.status === 'Pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon completed">
              <RiCheckboxCircleLine />
            </div>
            <div className="stat-content">
              <span className="stat-number">{allJobs.filter(j => j.status === 'Completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon urgent">
              <RiFireLine />
            </div>
            <div className="stat-content">
              <span className="stat-number">{allJobs.filter(j => j.priority === 'Urgent' || j.status === 'Overdue').length}</span>
              <span className="stat-label">Urgent/Overdue</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon technicians">
              <RiGroupLine />
            </div>
            <div className="stat-content">
              <span className="stat-number">{technicians.filter(t => t.availability === 'Available').length}</span>
              <span className="stat-label">Available Techs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Allocation Tool - Hide for super users */}
      {user.userType !== "super_user" && (
        <JobAllocationTool
          jobs={jobs}
          technicians={technicians}
          getPriorityColor={getPriorityColor}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          isAssigningJob={isAssigningJob}
          assigningJobId={assigningJobId}
        />
      )}

      {/* Jobs Overview */}
      <JobsOverview
        filteredJobs={filteredJobs}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        isOverdue={isOverdue}
        handleEditJob={handleEditJob}
        handleUpdateJobStatus={handleUpdateJobStatus}
        showActionMenu={showActionMenu}
        setShowActionMenu={setShowActionMenu}
        technicians={technicians}
        onJobUpdate={handleUpdateJob}
        properties={properties}
        isAssigningJob={isAssigningJob}
        assigningJobId={assigningJobId}
      />

      {/* Pagination Controls */}
      <div className="pagination-section">
        <div className="pagination-info">
          <span>
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} jobs
          </span>
          <div className="items-per-page">
            <label>Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="pagination-controls">
          <button
            disabled={!hasPrevPage}
            onClick={() => setCurrentPage(1)}
            className="pagination-btn"
          >
            First
          </button>
          <button
            disabled={!hasPrevPage}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="page-numbers">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={!hasNextPage}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-btn"
          >
            Next
          </button>
          <button
            disabled={!hasNextPage}
            onClick={() => setCurrentPage(totalPages)}
            className="pagination-btn"
          >
            Last
          </button>
        </div>
      </div>

      {/* Create Job Form Modal */}
      <JobFormModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateJob as any}
        formData={formData}
        onInputChange={handleInputChange}
        technicians={technicians}
        properties={properties}
        mode="create"
        isSubmitting={isCreatingJob}
      />
    </div>
  );
};

export default JobManagement;
