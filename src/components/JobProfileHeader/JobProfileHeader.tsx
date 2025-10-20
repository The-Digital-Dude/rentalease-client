import React from "react";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftLine, RiCheckLine, RiCalendarLine } from "react-icons/ri";
import "./JobProfileHeader.scss";

interface JobProfileHeaderProps {
  job: {
    id: string;
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
  const navigate = useNavigate();

  const handleBookInspection = () => {
    // Determine compliance type based on job type
    let complianceType = "inspection";
    if (job.jobType === "Gas") {
      complianceType = "gas";
    } else if (job.jobType === "Electrical") {
      complianceType = "electrical";
    } else if (job.jobType === "Smoke") {
      complianceType = "smoke";
    }

    navigate(`/book-inspection/${job.id}/${complianceType}`);
  };

  return (
    <div className="profile-header">
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
          <button onClick={handleBookInspection} className="btn-primary">
            <RiCalendarLine />
            Book Inspection
          </button>
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
