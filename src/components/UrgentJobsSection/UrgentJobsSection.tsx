import React from "react";
import { useNavigate } from "react-router-dom";
import { RiAlertLine, RiCalendarLine, RiEyeLine } from "react-icons/ri";
import { formatDateTime } from "../../utils";
import "./UrgentJobsSection.scss";
import type { ComponentJob } from "../../utils/jobAdapter";

interface UrgentJobsSectionProps {
  urgentJobs: ComponentJob[];
  getPriorityColor: (priority: string) => string;
  isOverdue: (dueDate: string) => boolean;
}

const UrgentJobsSection: React.FC<UrgentJobsSectionProps> = ({
  urgentJobs,
  getPriorityColor,
  isOverdue,
}) => {
  const navigate = useNavigate();

  if (urgentJobs.length === 0) {
    return null;
  }

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
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
                <span className={`job-type type-${job.jobType.toLowerCase()}`}>
                  {job.jobType}
                </span>
                <span
                  className={`job-priority ${getPriorityColor(job.priority)}`}
                >
                  {job.priority}
                </span>
              </div>
              <p className="due-date">
                <RiCalendarLine />
                Due: {formatDateTime(job.dueDate)}
                {isOverdue(job.dueDate) && (
                  <span className="overdue-label">OVERDUE</span>
                )}
              </p>
            </div>
            <div className="job-actions">
              <button
                onClick={() => handleViewJob(job.id)}
                className="view-job-btn"
                title="View Job Details"
              >
                <RiEyeLine />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentJobsSection;
