import React from "react";
import { RiArrowLeftLine, RiCheckLine } from "react-icons/ri";
import "./JobProfileHeader.scss";

interface JobProfileHeaderProps {
  job: {
    job_id: string;
    jobType: string;
    status: string;
    priority: string;
  };
  onBack: () => void;
  onCompleteJob: () => void;
  completingJob: boolean;
  canComplete: boolean;
  getStatusBadgeClass: (status: string) => string;
  getPriorityBadgeClass: (priority: string) => string;
}

const JobProfileHeader: React.FC<JobProfileHeaderProps> = ({
  job,
  onBack,
  onCompleteJob,
  completingJob,
  canComplete,
  getStatusBadgeClass,
  getPriorityBadgeClass,
}) => {
  return (
    <div className="profile-header">
      <button onClick={onBack} className="back-btn">
        <RiArrowLeftLine />
        Back to Jobs
      </button>
      <div className="header-content">
        <div className="job-info">
          <h1>{job.job_id}</h1>
          <p className="job-type">{job.jobType}</p>
          <div className="job-meta">
            <span className={`status-badge ${getStatusBadgeClass(job.status)}`}>
              {job.status}
            </span>
            <span
              className={`priority-badge ${getPriorityBadgeClass(
                job.priority
              )}`}
            >
              {job.priority}
            </span>
          </div>
        </div>
        <div className="header-actions">
          {canComplete && (
            <button
              onClick={onCompleteJob}
              className="btn-primary"
              disabled={completingJob}
            >
              <RiCheckLine />
              {completingJob ? "Completing..." : "Complete Job"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobProfileHeader;
