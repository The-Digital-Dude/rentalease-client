import { useState } from "react";
import { RiAddLine } from "react-icons/ri";
import {
  JobFormModal,
  UrgentJobsSection,
  JobAllocationTool,
  JobsOverview,
} from "../../components";
import "./JobManagement.scss";

interface Job {
  id: string;
  propertyAddress: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
  dueDate: string;
  assignedTechnician: string;
  status: "Pending" | "Scheduled" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
  createdDate: string;
}

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
}

const initialJobs: Job[] = [
  {
    id: "J001",
    propertyAddress: "123 Collins Street, Melbourne VIC 3000",
    jobType: "Gas",
    dueDate: "2024-01-15",
    assignedTechnician: "John Smith",
    status: "Overdue",
    priority: "Urgent",
    description: "Annual gas safety inspection required",
    createdDate: "2024-01-01",
  },
  {
    id: "J002",
    propertyAddress: "456 George Street, Sydney NSW 2000",
    jobType: "Electrical",
    dueDate: "2024-01-20",
    assignedTechnician: "Sarah Wilson",
    status: "Scheduled",
    priority: "High",
    description: "Safety switch installation",
    createdDate: "2024-01-05",
  },
  {
    id: "J003",
    propertyAddress: "789 Queen Street, Brisbane QLD 4000",
    jobType: "Smoke",
    dueDate: "2024-01-25",
    assignedTechnician: "Mike Johnson",
    status: "Pending",
    priority: "Medium",
    description: "Smoke alarm battery replacement",
    createdDate: "2024-01-08",
  },
  {
    id: "J004",
    propertyAddress: "321 Adelaide Street, Perth WA 6000",
    jobType: "Repairs",
    dueDate: "2024-02-01",
    assignedTechnician: "Emma Brown",
    status: "Pending",
    priority: "Low",
    description: "Leaky faucet repair",
    createdDate: "2024-01-10",
  },
  {
    id: "J005",
    propertyAddress: "654 King Street, Adelaide SA 5000",
    jobType: "Gas",
    dueDate: "2024-01-18",
    assignedTechnician: "David Chen",
    status: "Overdue",
    priority: "Urgent",
    description: "Gas leak inspection and repair",
    createdDate: "2024-01-02",
  },
  {
    id: "J006",
    propertyAddress: "987 Elizabeth Street, Hobart TAS 7000",
    jobType: "Electrical",
    dueDate: "2024-01-16",
    assignedTechnician: "",
    status: "Overdue",
    priority: "Urgent",
    description: "Emergency electrical fault investigation",
    createdDate: "2024-01-03",
  },
  {
    id: "J007",
    propertyAddress: "741 Darwin Road, Darwin NT 0800",
    jobType: "Gas",
    dueDate: "2024-01-17",
    assignedTechnician: "John Smith",
    status: "Overdue",
    priority: "High",
    description: "Gas meter replacement required",
    createdDate: "2024-01-04",
  },
  {
    id: "J008",
    propertyAddress: "852 Canberra Ave, Canberra ACT 2600",
    jobType: "Smoke",
    dueDate: "2024-01-19",
    assignedTechnician: "",
    status: "Pending",
    priority: "Urgent",
    description: "Fire alarm system malfunction",
    createdDate: "2024-01-06",
  },
];

const initialTechnicians: Technician[] = [
  {
    id: "T001",
    name: "John Smith",
    specialties: ["Gas", "Electrical"],
    availability: "Available",
    currentJobs: 2,
  },
  {
    id: "T002",
    name: "Sarah Wilson",
    specialties: ["Electrical", "Smoke"],
    availability: "Busy",
    currentJobs: 4,
  },
  {
    id: "T003",
    name: "Mike Johnson",
    specialties: ["Smoke", "Repairs"],
    availability: "Available",
    currentJobs: 1,
  },
  {
    id: "T004",
    name: "Emma Brown",
    specialties: ["Repairs", "Gas"],
    availability: "Available",
    currentJobs: 3,
  },
  {
    id: "T005",
    name: "David Chen",
    specialties: ["Gas", "Electrical", "Repairs"],
    availability: "Off Duty",
    currentJobs: 0,
  },
];

const initialFormData: JobFormData = {
  propertyAddress: "",
  jobType: "Gas",
  dueDate: "",
  assignedTechnician: "",
  priority: "Medium",
  description: "",
};

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [technicians] = useState<Technician[]>(initialTechnicians);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

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

  const handleCreateJob = (formData: JobFormData) => {
    const newJob: Job = {
      id: `J${String(jobs.length + 1).padStart(3, "0")}`,
      ...formData,
      status: "Pending",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setJobs([...jobs, newJob]);
    setFormData(initialFormData);
    setShowCreateForm(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, technicianId: string) => {
    e.preventDefault();
    if (draggedJob) {
      const technician = technicians.find((t) => t.id === technicianId);
      if (technician) {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === draggedJob.id
              ? {
                  ...job,
                  assignedTechnician: technician.name,
                  status: "Scheduled" as const,
                }
              : job
          )
        );
      }
    }
    setDraggedJob(null);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleEditJob = (job: Job) => {
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

  const handleUpdateJobStatus = (jobId: string, newStatus: Job["status"]) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    setShowActionMenu(null);
  };

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
      />

      {/* Create Job Form Modal */}
      <JobFormModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateJob}
        formData={formData}
        onInputChange={handleInputChange}
        technicians={technicians}
      />
    </div>
  );
};

export default JobManagement;
