import { useState } from "react";
import {
  RiAddLine,
  RiSearchLine,
  RiCloseLine,
  RiAlertLine,
  RiCalendarLine,
  RiUserLine,
  RiDragDropLine,
  RiMoreLine,
} from "react-icons/ri";
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

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();

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
      {urgentJobs.length > 0 && (
        <div className="content-card urgent-jobs-section">
          <div className="section-header">
            <h2>
              <RiAlertLine className="urgent-icon" />
              Urgent & Overdue Jobs ({urgentJobs.length})
            </h2>
          </div>
          <div className="urgent-jobs-grid">
            {urgentJobs.map((job) => (
              <div key={job.id} className="urgent-job-card">
                <div className="job-info">
                  <span className="job-id">{job.id}</span>
                  <h4>{job.propertyAddress}</h4>
                  <div className="job-meta">
                    <span
                      className={`job-type type-${job.jobType.toLowerCase()}`}
                    >
                      {job.jobType}
                    </span>
                    <span
                      className={`job-priority ${getPriorityColor(
                        job.priority
                      )}`}
                    >
                      {job.priority}
                    </span>
                  </div>
                  <p className="due-date">
                    <RiCalendarLine />
                    Due: {new Date(job.dueDate).toLocaleDateString()}
                    {isOverdue(job.dueDate) && (
                      <span className="overdue-label">OVERDUE</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Allocation Tool */}
      <div className="content-card allocation-section">
        <div className="section-header">
          <h2>
            <RiDragDropLine />
            Job Allocation Tool
          </h2>
          <p>Drag jobs to assign them to available technicians</p>
        </div>
        <div className="allocation-grid">
          <div className="unassigned-jobs">
            <h3>Unassigned Jobs</h3>
            <div className="job-list">
              {jobs
                .filter((job) => job.status === "Pending")
                .map((job) => (
                  <div
                    key={job.id}
                    className="draggable-job"
                    draggable
                    onDragStart={(e) => handleDragStart(e, job)}
                  >
                    <div className="job-header">
                      <span className="job-id">{job.id}</span>
                      <span
                        className={`job-type type-${job.jobType.toLowerCase()}`}
                      >
                        {job.jobType}
                      </span>
                    </div>
                    <p className="job-address">{job.propertyAddress}</p>
                    <div className="job-footer">
                      <span className="due-date">
                        Due: {new Date(job.dueDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`priority ${getPriorityColor(job.priority)}`}
                      >
                        {job.priority}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="technicians-grid">
            {technicians.map((technician) => (
              <div
                key={technician.id}
                className={`technician-card ${technician.availability
                  .toLowerCase()
                  .replace(" ", "-")}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, technician.id)}
              >
                <div className="technician-header">
                  <h4>{technician.name}</h4>
                  <span
                    className={`availability ${technician.availability
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {technician.availability}
                  </span>
                </div>
                <div className="technician-info">
                  <div className="specialties">
                    {technician.specialties.map((specialty) => (
                      <span key={specialty} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <div className="workload">
                    <RiUserLine />
                    {technician.currentJobs} active jobs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Overview */}
      <div className="content-card">
        <div className="section-header">
          <h2>Jobs Overview</h2>
          <div className="filters-section">
            <div className="search-box">
              <RiSearchLine className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Gas">Gas</option>
              <option value="Electrical">Electrical</option>
              <option value="Smoke">Smoke</option>
              <option value="Repairs">Repairs</option>
            </select>
          </div>
        </div>

        <div className="jobs-table-container">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Property Address</th>
                <th>Job Type</th>
                <th>Due Date</th>
                <th>Assigned Technician</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className={
                    isOverdue(job.dueDate) && job.status !== "Completed"
                      ? "overdue-row"
                      : ""
                  }
                >
                  <td className="job-id-cell">{job.id}</td>
                  <td className="address-cell">{job.propertyAddress}</td>
                  <td>
                    <span
                      className={`job-type type-${job.jobType.toLowerCase()}`}
                    >
                      {job.jobType}
                    </span>
                  </td>
                  <td className="date-cell">
                    <div className="date-cell-items">
                      <RiCalendarLine />
                      {new Date(job.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="technician-cell">
                    <div className="technician-cell-items">
                      <RiUserLine />
                      {job.assignedTechnician || "Unassigned"}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`job-status ${getStatusColor(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`job-priority ${getPriorityColor(
                        job.priority
                      )}`}
                    >
                      {job.priority}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn"
                      onClick={() =>
                        setShowActionMenu(
                          showActionMenu === job.id ? null : job.id
                        )
                      }
                    >
                      <RiMoreLine />
                    </button>
                    {showActionMenu === job.id && (
                      <div className="action-menu">
                        <button onClick={() => handleEditJob(job)}>
                          Edit Job
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateJobStatus(job.id, "Completed")
                          }
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateJobStatus(job.id, "Scheduled")
                          }
                        >
                          Mark as Scheduled
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateJobStatus(job.id, "Pending")
                          }
                        >
                          Mark as Pending
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Job Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Job</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                <RiCloseLine />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="job-form">
              <div className="form-group">
                <label htmlFor="propertyAddress">Property Address *</label>
                <input
                  type="text"
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  placeholder="Enter property address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="jobType">Job Type *</label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Gas">Gas</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Smoke">Smoke</option>
                    <option value="Repairs">Repairs</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date *</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="assignedTechnician">
                    Assigned Technician
                  </label>
                  <select
                    id="assignedTechnician"
                    name="assignedTechnician"
                    value={formData.assignedTechnician}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Technician</option>
                    {technicians
                      .filter((tech) => tech.availability === "Available")
                      .map((technician) => (
                        <option key={technician.id} value={technician.name}>
                          {technician.name} ({technician.currentJobs} jobs)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter job description or special instructions"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
