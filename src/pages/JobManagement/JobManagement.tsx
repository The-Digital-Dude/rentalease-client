import { useState, useEffect } from "react";
import { RiAddLine } from "react-icons/ri";
import {
  JobFormModal,
  UrgentJobsSection,
  JobAllocationTool,
  JobsOverview,
} from "../../components";
import { jobService, staffService } from "../../services";
import type { Job as ServiceJob, CreateJobData } from "../../services/jobService";
import type { Staff as ServiceStaff } from "../../services/staffService";
import type { ComponentJob } from "../../utils/jobAdapter";
import { adaptServiceJobToComponentJob } from "../../utils/jobAdapter";
import type { ComponentTechnician } from "../../utils/staffAdapter";
import { adaptServiceStaffToComponentTechnician } from "../../utils/staffAdapter";
import "./JobManagement.scss";

interface JobFormData {
  propertyAddress: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
  dueDate: string;
  assignedTechnician: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  description: string;
}

const initialFormData: JobFormData = {
  propertyAddress: "",
  jobType: "Gas",
  dueDate: "",
  assignedTechnician: "",
  priority: "Medium",
  description: "",
};

const JobManagement = () => {
  const [jobs, setJobs] = useState<ComponentJob[]>([]);
  const [technicians, setTechnicians] = useState<ComponentTechnician[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [draggedJob, setDraggedJob] = useState<ComponentJob | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch jobs and technicians in parallel
      const [jobsResponse, techResponse] = await Promise.all([
        jobService.getJobs(),
        staffService.getStaff()
      ]);

      // Log responses for debugging
      console.log('Jobs Response:', jobsResponse);
      console.log('Tech Response:', techResponse);

      let componentTechnicians: ComponentTechnician[] = [];
      
      if (techResponse.success && techResponse.data) {
        const staffData = techResponse.data as ServiceStaff[];
        componentTechnicians = staffData.map(adaptServiceStaffToComponentTechnician);
        setTechnicians(componentTechnicians);
      } else {
        const errorMessage = techResponse.message || 'Failed to fetch technicians';
        console.error('Technicians fetch error:', errorMessage);
        setError(errorMessage);
      }

      if (jobsResponse.success && jobsResponse.data) {
        const componentJobs = (jobsResponse.data as ServiceJob[]).map(job => 
          adaptServiceJobToComponentJob(job, componentTechnicians)
        );
        setJobs(componentJobs);
      } else {
        const errorMessage = jobsResponse.message || 'Failed to fetch jobs';
        console.error('Jobs fetch error:', errorMessage);
        setError(errorMessage);
        return; // Exit early if jobs fetch fails
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
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
        ...formData,
        assignedTechnician: formData.assignedTechnician || null,
        priority: formData.priority
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
      setError('Failed to create job');
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
      const technician = technicians.find(tech => tech.id === technicianId);
      if (!technician) {
        setError('Technician not found');
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
        // Use the new assignJob endpoint
        const response = await jobService.assignJob(draggedJob.id, technicianId);
        
        if (response.success) {
          // Update local technicians state with new job count
          if (response.data && 'technician' in response.data) {
            const updatedTechnicians = technicians.map(tech => {
              if (tech.id === technicianId) {
                return {
                  ...tech,
                  currentJobs: (response.data as any).technician.currentJobs,
                  availability: (response.data as any).technician.availabilityStatus
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
        setError('Failed to assign job');
      }
    }
    setDraggedJob(null);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleEditJob = (job: ComponentJob) => {
    setFormData({
      propertyAddress: job.propertyAddress,
      jobType: job.jobType,
      dueDate: job.dueDate,
      assignedTechnician: job.assignedTechnician,
      priority: job.priority,
      description: job.description || "",
    });
    setShowCreateForm(true);
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: ComponentJob["status"]) => {
    try {
      const response = await jobService.updateJobStatus(jobId, newStatus);
      if (response.success) {
        await fetchInitialData(); // Refresh all data
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to update job status');
    }
    setShowActionMenu(null);
  };

  const handleUpdateJob = async (updatedJob: ComponentJob) => {
    try {
      setError(null);
      const response = await jobService.updateJob(updatedJob.id, {
        propertyAddress: updatedJob.propertyAddress,
        jobType: updatedJob.jobType,
        dueDate: updatedJob.dueDate,
        assignedTechnician: updatedJob.assignedTechnicianId || null as any,
        status: updatedJob.status,
        priority: updatedJob.priority,
        description: updatedJob.description || "",
      });
      
      if (response.success) {
        await fetchInitialData(); // Refresh all data
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to update job');
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
      />

      {/* Create Job Form Modal */}
      <JobFormModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateJob as any}
        formData={formData}
        onInputChange={handleInputChange}
        technicians={technicians}
        mode="create"
      />
    </div>
  );
};

export default JobManagement;
