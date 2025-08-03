import React from "react";
import { RiDragDropLine, RiUserLine, RiLoader4Line } from "react-icons/ri";
import { formatDateTime } from "../../utils";
import "./JobAllocationTool.scss";
import type { ComponentJob } from "../../utils/jobAdapter";
import type { ComponentTechnician } from "../../utils/technicianAdapter";

interface JobAllocationToolProps {
  jobs: ComponentJob[];
  technicians: ComponentTechnician[];
  getPriorityColor: (priority: string) => string;
  handleDragStart: (e: React.DragEvent, job: ComponentJob) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, technicianId: string) => void;
  isAssigningJob?: boolean;
  assigningJobId?: string | null;
}

const JobAllocationTool: React.FC<JobAllocationToolProps> = ({
  jobs,
  technicians,
  getPriorityColor,
  handleDragStart,
  handleDragOver,
  handleDrop,
  isAssigningJob = false,
  assigningJobId = null,
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
                className={`draggable-job ${
                  isAssigningJob && assigningJobId === job.id ? "assigning" : ""
                }`}
                draggable={!isAssigningJob}
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
                    Due: {formatDateTime(job.dueDate)}
                  </span>
                  <span
                    className={`priority ${getPriorityColor(job.priority)}`}
                  >
                    {job.priority}
                  </span>
                </div>
                {isAssigningJob && assigningJobId === job.id && (
                  <div className="loading-overlay">
                    <RiLoader4Line className="spinner" />
                    <span>Assigning...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="technicians-grid">
          <h3>Available Technicians</h3>
          {technicians.map((technician) => {
            console.log(technician, "technician");
            return (
              <div
                key={technician.id}
                className={`technician-card ${technician.availability
                  .toLowerCase()
                  .replace(" ", "-")} ${isAssigningJob ? "assigning" : ""}`}
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
                  <div className="contact-info">
                    <div className="email">{technician.email}</div>
                    <div className="phone">{technician.phone}</div>
                  </div>

                  <div className="specialties">
                    {technician.specialties.length > 0 ? (
                      technician.specialties.map((specialty) => (
                        <span key={specialty} className="specialty-tag">
                          {specialty}
                        </span>
                      ))
                    ) : (
                      <span className="specialty-tag">General</span>
                    )}
                  </div>

                  <div className="stats">
                    <div className="workload">
                      <RiUserLine />
                      {technician.currentJobs}/{technician.maxJobs} active jobs
                    </div>
                    <div className="experience">
                      {technician.experience} years experience
                    </div>
                    {technician.completedJobs > 0 && (
                      <div className="completed-jobs">
                        {technician.completedJobs} completed
                      </div>
                    )}
                    {technician.averageRating > 0 && (
                      <div className="rating">
                        ⭐ {technician.averageRating.toFixed(1)} (
                        {technician.totalRatings})
                      </div>
                    )}
                  </div>
                </div>
                {isAssigningJob && (
                  <div className="loading-overlay">
                    <RiLoader4Line className="spinner" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobAllocationTool;
