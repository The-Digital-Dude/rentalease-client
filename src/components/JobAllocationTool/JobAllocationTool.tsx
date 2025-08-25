import React from "react";
import { 
  RiDragDropLine, 
  RiUserLine, 
  RiLoader4Line,
  RiCalendarLine,
  RiMapPinLine,
  RiStarFill,
  RiToolsLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiGroupLine,
  RiFireLine
} from "react-icons/ri";
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

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'gas': return <RiFireLine />;
      case 'electrical': return <RiFireLine />;
      case 'smoke': return <RiFireLine />;
      case 'repairs': return <RiToolsLine />;
      default: return <RiToolsLine />;
    }
  };

  return (
    <div className="modern-allocation-section">
      {/* Header Section */}
      <div className="allocation-header">
        <div className="header-content">
          <div className="title-section">
            <div className="icon-wrapper">
              <RiDragDropLine />
            </div>
            <div className="title-text">
              <h2>Smart Job Allocation</h2>
              <p>Intelligent job assignment with drag & drop functionality</p>
            </div>
          </div>
          <div className="stats-summary">
            <div className="stat-card">
              <span className="stat-number">{pendingJobs.length}</span>
              <span className="stat-label">Pending Jobs</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{technicians.filter(t => t.availability === 'Available').length}</span>
              <span className="stat-label">Available Techs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Allocation Interface */}
      <div className="allocation-workspace">
        
        {/* Unassigned Jobs Panel */}
        <div className="jobs-panel">
          <div className="panel-header">
            <h3>
              <RiGroupLine />
              Unassigned Jobs
              <span className="count-badge">{pendingJobs.length}</span>
            </h3>
            <div className="panel-actions">
              <button className="sort-btn">Sort by Priority</button>
            </div>
          </div>

          <div className="jobs-container">
            {pendingJobs.length === 0 ? (
              <div className="empty-state">
                <RiCheckboxCircleLine />
                <p>All jobs have been assigned!</p>
                <span>Great work managing your workflow</span>
              </div>
            ) : (
              pendingJobs.map((job) => (
                <div
                  key={job.id}
                  className={`modern-job-card ${
                    isAssigningJob && assigningJobId === job.id ? "assigning" : ""
                  } priority-${job.priority.toLowerCase()}`}
                  draggable={!isAssigningJob}
                  onDragStart={(e) => handleDragStart(e, job)}
                >
                  <div className="job-card-header">
                    <div className="job-id-section">
                      <span className="job-id">#{job.job_id}</span>
                      <div className={`job-type-badge type-${job.jobType.toLowerCase()}`}>
                        {getJobTypeIcon(job.jobType)}
                        <span>{job.jobType}</span>
                      </div>
                    </div>
                    <div className={`priority-indicator priority-${job.priority.toLowerCase()}`}>
                      {job.priority === 'Urgent' && <RiFireLine />}
                      <span>{job.priority}</span>
                    </div>
                  </div>

                  <div className="job-details">
                    <div className="address-section">
                      <RiMapPinLine />
                      <span className="address">{job.propertyAddress}</span>
                    </div>
                    <div className="due-date-section">
                      <RiCalendarLine />
                      <span className="due-date">{formatDateTime(job.dueDate)}</span>
                    </div>
                  </div>

                  <div className="job-description">
                    {job.description && (
                      <p>{job.description.slice(0, 80)}...</p>
                    )}
                  </div>

                  <div className="drag-handle">
                    <RiDragDropLine />
                    <span>Drag to assign</span>
                  </div>

                  {isAssigningJob && assigningJobId === job.id && (
                    <div className="assignment-overlay">
                      <div className="overlay-content">
                        <RiLoader4Line className="spinner" />
                        <span>Assigning job...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Technicians Panel */}
        <div className="technicians-panel">
          <div className="panel-header">
            <h3>
              <RiUserLine />
              Available Technicians
              <span className="count-badge">{technicians.length}</span>
            </h3>
            <div className="panel-actions">
              <button className="filter-btn">Filter by Skills</button>
            </div>
          </div>

          <div className="technicians-container">
            {technicians.map((technician) => {
              const workloadLevel = getWorkloadColor(technician.currentJobs, technician.maxJobs);
              
              return (
                <div
                  key={technician.id}
                  className={`modern-tech-card availability-${technician.availability
                    .toLowerCase()
                    .replace(" ", "-")} workload-${workloadLevel} ${isAssigningJob ? "drop-zone-active" : ""}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, technician.id)}
                >
                  <div className="tech-card-header">
                    <div className="tech-avatar">
                      <RiUserLine />
                    </div>
                    <div className="tech-info">
                      <h4 className="tech-name">{technician.name}</h4>
                      <div className="tech-contact">
                        <span className="email">{technician.email}</span>
                        <span className="phone">{technician.phone}</span>
                      </div>
                    </div>
                    <div className={`availability-badge ${technician.availability
                      .toLowerCase()
                      .replace(" ", "-")}`}>
                      {technician.availability}
                    </div>
                  </div>

                  <div className="tech-specialties">
                    {technician.specialties.length > 0 ? (
                      technician.specialties.map((specialty) => (
                        <span key={specialty} className={`specialty-chip specialty-${specialty.toLowerCase()}`}>
                          <RiToolsLine />
                          {specialty}
                        </span>
                      ))
                    ) : (
                      <span className="specialty-chip specialty-general">
                        <RiToolsLine />
                        General
                      </span>
                    )}
                  </div>

                  <div className="tech-metrics">
                    <div className="workload-section">
                      <div className="workload-header">
                        <RiGroupLine />
                        <span>Active Jobs</span>
                      </div>
                      <div className="workload-bar">
                        <div 
                          className={`workload-fill workload-${workloadLevel}`}
                          style={{ width: `${(technician.currentJobs / technician.maxJobs) * 100}%` }}
                        ></div>
                      </div>
                      <span className="workload-text">
                        {technician.currentJobs} / {technician.maxJobs}
                      </span>
                    </div>

                    <div className="performance-metrics">
                      <div className="metric">
                        <RiTimeLine />
                        <span>{technician.experience} years exp</span>
                      </div>
                      {technician.completedJobs > 0 && (
                        <div className="metric">
                          <RiCheckboxCircleLine />
                          <span>{technician.completedJobs} completed</span>
                        </div>
                      )}
                      {technician.averageRating > 0 && (
                        <div className="metric rating-metric">
                          <RiStarFill />
                          <span>{technician.averageRating.toFixed(1)} ({technician.totalRatings})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="drop-zone-indicator">
                    <RiDragDropLine />
                    <span>Drop job here to assign</span>
                  </div>

                  {isAssigningJob && (
                    <div className="assignment-overlay">
                      <div className="overlay-content">
                        <RiLoader4Line className="spinner" />
                        <span>Processing assignment...</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAllocationTool;
