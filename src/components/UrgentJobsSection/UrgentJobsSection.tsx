import React from "react";
import { RiAlertLine, RiCalendarLine } from "react-icons/ri";
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
  if (urgentJobs.length === 0) {
    return null;
  }

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
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentJobsSection;
