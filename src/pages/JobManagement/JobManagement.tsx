import { useState, useEffect } from "react";
import { RiAddLine } from "react-icons/ri";
import {
  JobFormModal,
  UrgentJobsSection,
  JobAllocationTool,
  JobsOverview,
} from "../../components";
import { jobService } from "../../services";
import technicianService from "../../services/technicianService";
import propertyService from "../../services/propertyService";
import type {
  Job as ServiceJob,
  CreateJobData,
} from "../../services/jobService";
import type { Technician as ServiceTechnician } from "../../services/technicianService";
import type { Property } from "../../services/propertyService";
import type { ComponentJob } from "../../utils/jobAdapter";
import { adaptServiceJobToComponentJob } from "../../utils/jobAdapter";
import type { ComponentTechnician } from "../../utils/technicianAdapter";
import { adaptServiceTechnicianToComponentTechnician } from "../../utils/technicianAdapter";
import "./JobManagement.scss";

interface JobFormData {
  propertyId: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
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
  const [jobs, setJobs] = useState<ComponentJob[]>([]);
  const [technicians, setTechnicians] = useState<ComponentTechnician[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [draggedJob, setDraggedJob] = useState<ComponentJob | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssigningJob, setIsAssigningJob] = useState(false);
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch jobs, technicians, and properties in parallel
      const [jobsResponse, techResponse, propertiesResponse] =
        await Promise.all([
          jobService.getJobs(),
          technicianService.getTechnicians(),
          propertyService.getProperties({ limit: 100 }),
        ]);

      // Log responses for debugging
      console.log("Jobs Response:", jobsResponse);
      console.log("Tech Response:", techResponse);
      console.log("Properties Response:", propertiesResponse);

      let componentTechnicians: ComponentTechnician[] = [];

      if (techResponse.status === "success" && techResponse.data.technicians) {
        const technicianData = techResponse.data
          .technicians as ServiceTechnician[];
        componentTechnicians = technicianData.map(
          adaptServiceTechnicianToComponentTechnician
        );
        setTechnicians(componentTechnicians);
      } else {
        const errorMessage =
          techResponse.message || "Failed to fetch technicians";
        console.error("Technicians fetch error:", errorMessage);
        setError(errorMessage);
      }

      if (jobsResponse.success && jobsResponse.data) {
        const componentJobs = (jobsResponse.data as ServiceJob[]).map((job) =>
          adaptServiceJobToComponentJob(job, componentTechnicians)
        );
        setJobs(componentJobs);
      } else {
        const errorMessage = jobsResponse.message || "Failed to fetch jobs";
        console.error("Jobs fetch error:", errorMessage);
        setError(errorMessage);
        return; // Exit early if jobs fetch fails
      }

      if (propertiesResponse.status === "success" && propertiesResponse.data) {
        setProperties(propertiesResponse.data.properties);
      } else {
        setError(propertiesResponse.message || "Failed to fetch properties");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.jobType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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
    <div className="page-container job-management">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Job Management</h1>
            <p>Manage property maintenance and compliance jobs</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <RiAddLine size={18} />
            Create Job
          </button>
        </div>
      </div>

      {/* Urgent Jobs Section */}
      <UrgentJobsSection
        urgentJobs={urgentJobs}
        getPriorityColor={getPriorityColor}
        isOverdue={isOverdue}
      />

      {/* Job Allocation Tool */}
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

      {/* Jobs Overview */}
      <JobsOverview
        filteredJobs={filteredJobs}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
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
      />
    </div>
  );
};

export default JobManagement;
