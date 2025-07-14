import React from "react";
import { RiDragDropLine, RiUserLine } from "react-icons/ri";
import "./JobAllocationTool.scss";

interface Job {
  id: string;
  job_id: string;
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

interface JobAllocationToolProps {
  jobs: Job[];
  technicians: Technician[];
  getPriorityColor: (priority: string) => string;
  handleDragStart: (e: React.DragEvent, job: Job) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, technicianId: string) => void;
}

const JobAllocationTool: React.FC<JobAllocationToolProps> = ({
  jobs,
  technicians,
  getPriorityColor,
  handleDragStart,
  handleDragOver,
  handleDrop,
}) => {
  const pendingJobs = jobs.filter((job) => job.status === "Pending");

  return (
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
            {pendingJobs.map((job) => (
              <div
                key={job.id}
                className="draggable-job"
                draggable
                onDragStart={(e) => handleDragStart(e, job)}
              >
                <div className="job-header">
                  <span className="job-id">{job.job_id}</span>
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
  );
};

export default JobAllocationTool;
