import { useState, useEffect } from "react";
import { RiAddLine, RiRefreshLine, RiSearchLine } from "react-icons/ri";
import toast from "react-hot-toast";
import {
  JobFormModal,
  UrgentJobsSection,
  JobAllocationTool,
  JobsOverview,
} from "../../components";
import { jobService } from "../../services";
import type { Job as ServiceJob, CreateJobData } from "../../services/jobService";
import "./JobManagement.scss";

// Local Job interface for components (extends service Job with createdDate)
interface Job extends ServiceJob {
  createdDate: string;
}

// Technician interface for job assignment (from API)
interface ApiTechnician {
  id: string;
  fullName: string;
  tradeType: string;
  phone: string;
  email: string;
  availabilityStatus: string;
  serviceRegions: string[];
}

// Technician interface for JobFormModal component
interface Technician {
  id: string;
  name: string;
  specialties: string[];
  availability: "Available" | "Busy" | "Off Duty";
  currentJobs: number;
}

interface JobFormData {
  propertyAddress: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
  dueDate: string;
  assignedTechnician: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  description: string;
  estimatedDuration?: number;
  notes?: string;
}

interface DashboardStats {
  statusCounts: Record<string, number>;
  totalJobs: number;
}

const initialFormData: JobFormData = {
  propertyAddress: "",
  jobType: "Gas",
  dueDate: "",
  assignedTechnician: "",
  priority: "Medium",
  description: "",
  estimatedDuration: 1,
  notes: "",
};

const JobManagement = () => {
  // State for jobs and data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apiTechnicians, setApiTechnicians] = useState<ApiTechnician[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ statusCounts: {}, totalJobs: 0 });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload jobs when filters or pagination change
  useEffect(() => {
    if (!isLoading) {
      loadJobs();
    }
  }, [currentPage, statusFilter, typeFilter, priorityFilter, searchTerm]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadJobs(),
        loadTechnicians(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { jobType: typeFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: "dueDate",
        sortOrder: "asc" as const,
      };

      const response = await jobService.getJobs(filters);
      
      if (response.success && Array.isArray(response.data)) {
        // Convert service jobs to local Job interface with createdDate
        const convertedJobs: Job[] = response.data.map((serviceJob: ServiceJob) => ({
          ...serviceJob,
          createdDate: serviceJob.createdAt.split('T')[0], // Convert ISO to date string
          assignedTechnician: typeof serviceJob.assignedTechnician === 'object' 
            ? serviceJob.assignedTechnician.fullName 
            : serviceJob.assignedTechnician
        }));
        
        setJobs(convertedJobs);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
        if (response.statistics) {
          setStats(response.statistics);
        }
      } else {
        throw new Error(response.message || 'Failed to load jobs');
      }
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
      if (!isLoading) {
        toast.error(error.message || 'Failed to load jobs');
      }
    }
  };

  const loadTechnicians = async () => {
    setIsLoadingTechnicians(true);
    try {
      const response = await jobService.getAvailableTechnicians();
      
      if (response.success && Array.isArray(response.data)) {
        // Store API technicians
        const apiTechs = response.data as unknown as ApiTechnician[];
        setApiTechnicians(apiTechs);
        
        // Convert to JobFormModal format
        const convertedTechs: Technician[] = apiTechs.map((tech) => ({
          id: tech.id,
          name: tech.fullName,
          specialties: [tech.tradeType], // Convert single trade type to array
          availability: tech.availabilityStatus === 'Available' ? 'Available' : 'Busy',
          currentJobs: 0 // We don't have this info from API, set to 0
        }));
        
        setTechnicians(convertedTechs);
      } else {
        throw new Error(response.message || 'Failed to load technicians');
      }
    } catch (error: any) {
      console.error('Failed to load technicians:', error);
      toast.error(error.message || 'Failed to load technicians');
    } finally {
      setIsLoadingTechnicians(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await jobService.getDashboardStats();
      
      if (response.success && response.statistics) {
        setStats(response.statistics);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
      // Don't show error toast for stats as it's not critical
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadJobs(),
        loadTechnicians(),
        loadStats()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateJob = async (formData: JobFormData) => {
    setIsCreatingJob(true);
    
    try {
      const jobData: CreateJobData = {
        propertyAddress: formData.propertyAddress,
        jobType: formData.jobType,
        dueDate: formData.dueDate,
        assignedTechnician: formData.assignedTechnician,
        description: formData.description,
        priority: formData.priority,
        estimatedDuration: formData.estimatedDuration,
        notes: formData.notes,
      };

      const response = await jobService.createJob(jobData);
      
      if (response.success) {
        toast.success('Job created successfully!');
        setShowCreateForm(false);
        setFormData(initialFormData);
        // Reload jobs to show the new job
        await loadJobs();
        await loadStats(); // Update statistics
      } else {
        throw new Error(response.message || 'Failed to create job');
      }
    } catch (error: any) {
      console.error('Failed to create job:', error);
      toast.error(error.message || 'Failed to create job. Please try again.');
    } finally {
      setIsCreatingJob(false);
    }
  };

  // Sync wrapper for JobFormModal
  const handleSubmitJob = (formData: JobFormData) => {
    handleCreateJob(formData);
  };

  const handleStatusUpdate = async (jobId: string, newStatus: Job["status"]) => {
    const loadingToastId = toast.loading('Updating job status...');
    
    try {
      const response = await jobService.updateJobStatus(jobId, newStatus);
      
      if (response.success) {
        toast.success('Job status updated successfully!', { id: loadingToastId });
        // Update the job in the local state
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
        await loadStats(); // Update statistics
      } else {
        throw new Error(response.message || 'Failed to update job status');
      }
    } catch (error: any) {
      console.error('Failed to update job status:', error);
      toast.error(error.message || 'Failed to update job status', { id: loadingToastId });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    const loadingToastId = toast.loading('Deleting job...');
    
    try {
      const response = await jobService.deleteJob(jobId);
      
      if (response.success) {
        toast.success('Job deleted successfully!', { id: loadingToastId });
        // Remove the job from local state
        setJobs(prev => prev.filter(job => job.id !== jobId));
        await loadStats(); // Update statistics
      } else {
        throw new Error(response.message || 'Failed to delete job');
      }
    } catch (error: any) {
      console.error('Failed to delete job:', error);
      toast.error(error.message || 'Failed to delete job', { id: loadingToastId });
    }
  };

  const handleEditJob = (job: any) => {
    // TODO: Implement job editing functionality
    toast('Job editing functionality coming soon!');
  };

  const handleUpdateJobStatus = (jobId: string, newStatus: any) => {
    handleStatusUpdate(jobId, newStatus);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
      case 'priority':
        setPriorityFilter(value);
        break;
    }
  };

  // Transform jobs to match JobsOverview interface
  console.log('Jobs loaded:', jobs.length, jobs);
  
  const transformedJobs: Array<{
    id: string;
    propertyAddress: string;
    jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
    dueDate: string;
    assignedTechnician: string;
    status: "Pending" | "Scheduled" | "Completed" | "Overdue";
    priority: "Low" | "Medium" | "High" | "Urgent";
    description?: string;
    createdDate: string;
  }> = jobs.map((job) => ({
    id: job.id,
    propertyAddress: job.propertyAddress,
    jobType: job.jobType,
    dueDate: job.dueDate,
    assignedTechnician: typeof job.assignedTechnician === 'object' && job.assignedTechnician 
      ? job.assignedTechnician.fullName 
      : job.assignedTechnician || 'Unassigned',
    status: job.status,
    priority: job.priority,
    description: job.description,
    createdDate: job.createdDate
  }));

  console.log('Transformed jobs:', transformedJobs.length, transformedJobs);

  // Filter jobs based on search and filters (for client-side filtering if needed)
  const filteredJobs = transformedJobs.filter((job) => {
    const matchesSearch = !searchTerm || 
      job.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get urgent/overdue jobs for the urgent jobs section
  const urgentJobs = jobs.filter(
    (job) => job.priority === "Urgent" || job.status === "Overdue"
  );

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "#22c55e";
      case "Scheduled":
        return "#3b82f6";
      case "Pending":
        return "#f59e0b";
      case "Overdue":
        return "#ef4444";
      default:
        return "#6b7280";
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

  const getPriorityColorHex = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "#dc2626";
      case "High":
        return "#ea580c";
      case "Medium":
        return "#d97706";
      case "Low":
        return "#65a30d";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  // Loading spinner component
  const LoadingSpinner = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
    const sizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-8 h-8',
      large: 'w-12 h-12'
    };

    return (
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
    );
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Job Management</h1>
          <p>Loading job management system...</p>
        </div>
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Please wait while we load your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1>Job Management</h1>
            <p>Manage and track maintenance jobs across your properties</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <LoadingSpinner size="small" /> : <RiRefreshLine />}
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          <button
              className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
              <RiAddLine />
            Create Job
          </button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalJobs || 0}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: getStatusColor("Pending") }}>
            {stats.statusCounts?.Pending || 0}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: getStatusColor("Scheduled") }}>
            {stats.statusCounts?.Scheduled || 0}
          </div>
          <div className="stat-label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: getStatusColor("Overdue") }}>
            {stats.statusCounts?.Overdue || 0}
          </div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Urgent Jobs Section */}
      {urgentJobs.length > 0 && (
      <UrgentJobsSection
        urgentJobs={urgentJobs}
        getPriorityColor={getPriorityColor}
        isOverdue={isOverdue}
      />
      )}

      {/* Jobs Overview */}
      {filteredJobs.length === 0 ? (
        <div className="content-card">
          <div className="empty-state">
            <p>No jobs found. Create your first job to get started!</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <RiAddLine />
              Create Your First Job
            </button>
          </div>
        </div>
      ) : (
        <JobsOverview
          filteredJobs={filteredJobs as any}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={(status) => handleFilterChange('status', status)}
          typeFilter={typeFilter}
          setTypeFilter={(type) => handleFilterChange('type', type)}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          isOverdue={isOverdue}
          handleEditJob={handleEditJob}
          handleUpdateJobStatus={handleUpdateJobStatus}
          showActionMenu={showActionMenu}
          setShowActionMenu={setShowActionMenu}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="content-card">
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages} ({totalItems} total jobs)
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Job Form Modal */}
      <JobFormModal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setFormData(initialFormData);
        }}
        onSubmit={handleSubmitJob}
        formData={formData}
        onInputChange={handleInputChange}
        technicians={technicians}
      />
    </div>
  );
};

export default JobManagement;
