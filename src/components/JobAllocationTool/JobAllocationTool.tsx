import React, { useState, useMemo } from "react";
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
  RiFireLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFilterLine
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
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [showSkillFilter, setShowSkillFilter] = useState(false);

  const pendingJobs = jobs.filter((job) => job.status === "Pending");

  // Sort jobs based on selected criteria
  const sortedJobs = useMemo(() => {
    const jobsToSort = [...pendingJobs];

    if (sortBy === 'priority') {
      const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      jobsToSort.sort((a, b) => {
        const aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    } else if (sortBy === 'dueDate') {
      jobsToSort.sort((a, b) => {
        const aDate = new Date(a.dueDate).getTime();
        const bDate = new Date(b.dueDate).getTime();
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      });
    }

    return jobsToSort;
  }, [pendingJobs, sortBy, sortOrder]);

  // Get unique skills from technicians
  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    technicians.forEach(tech => {
      tech.specialties.forEach(specialty => skills.add(specialty));
    });
    return Array.from(skills).sort();
  }, [technicians]);

  // Filter technicians based on selected skill
  const filteredTechnicians = useMemo(() => {
    if (skillFilter === 'all') return technicians;
    return technicians.filter(tech =>
      tech.specialties.includes(skillFilter)
    );
  }, [technicians, skillFilter]);

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
              <div className="sort-controls">
                <button
                  className={`sort-btn ${sortBy === 'priority' ? 'active' : ''}`}
                  onClick={() => {
                    if (sortBy === 'priority') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('priority');
                      setSortOrder('desc');
                    }
                  }}
                  title="Sort by priority"
                >
                  Sort by Priority
                  {sortBy === 'priority' && (
                    sortOrder === 'desc' ? <RiArrowDownLine /> : <RiArrowUpLine />
                  )}
                </button>
                <button
                  className={`sort-btn ${sortBy === 'dueDate' ? 'active' : ''}`}
                  onClick={() => {
                    if (sortBy === 'dueDate') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('dueDate');
                      setSortOrder('asc');
                    }
                  }}
                  title="Sort by due date"
                >
                  Due Date
                  {sortBy === 'dueDate' && (
                    sortOrder === 'desc' ? <RiArrowDownLine /> : <RiArrowUpLine />
                  )}
                </button>
              </div>
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
              sortedJobs.map((job) => (
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
              <div className="filter-controls">
                <button
                  className={`filter-btn ${showSkillFilter ? 'active' : ''}`}
                  onClick={() => setShowSkillFilter(!showSkillFilter)}
                >
                  <RiFilterLine />
                  Filter by Skills
                </button>
                {showSkillFilter && (
                  <select
                    className="skill-filter-select"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  >
                    <option value="all">All Skills</option>
                    {availableSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="technicians-container">
            {filteredTechnicians.length === 0 ? (
              <div className="empty-state">
                <RiUserLine />
                <p>No technicians found with the selected skill</p>
                <button
                  className="reset-filter-btn"
                  onClick={() => setSkillFilter('all')}
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredTechnicians.map((technician) => {
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
            })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAllocationTool;
