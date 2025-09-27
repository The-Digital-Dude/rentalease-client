import {
  RiBuildingLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiBarChartLine,
} from "react-icons/ri";
import type { PropertyManagerJobAnalytics } from "../../../../services/propertyManagerReportService";
import "./JobAnalytics.scss";

interface JobAnalyticsProps {
  data: PropertyManagerJobAnalytics | null;
}

const JobAnalytics = ({ data }: JobAnalyticsProps) => {
  if (!data) {
    return (
      <div className="job-analytics">
        <div className="no-data">
          <RiBarChartLine size={48} />
          <h3>No Job Data</h3>
          <p>No job analytics available for your assigned properties.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#10b981";
      case "in progress":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="job-analytics">
      <div className="analytics-header">
        <h3>Job Analytics</h3>
        <p>Detailed analysis of job performance and distribution</p>
      </div>

      {/* Job Status Distribution */}
      <div className="chart-container">
        <div className="chart-header">
          <h4>Job Status Distribution</h4>
          <p>Current status breakdown of all jobs</p>
        </div>
        <div className="status-distribution">
          {data.statusDistribution.map((status) => (
            <div key={status.status} className="status-item">
              <div
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(status.status) }}
              ></div>
              <div className="status-info">
                <div className="status-count">{status.count}</div>
                <div className="status-label">{status.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Type Distribution */}
      <div className="chart-container">
        <div className="chart-header">
          <h4>Job Type Performance</h4>
          <p>Completion rates and performance by job type</p>
        </div>
        <div className="job-types-list">
          {data.typeDistribution.map((jobType, index) => (
            <div key={jobType.jobType} className="job-type-item">
              <div className="job-type-header">
                <div className="job-type-name">{jobType.jobType}</div>
                <div className="job-type-count">{jobType.count} jobs</div>
              </div>
              <div className="job-type-metrics">
                <div className="metric">
                  <span className="metric-label">Completed:</span>
                  <span className="metric-value">{jobType.completed}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Completion Rate:</span>
                  <span className="metric-value completion-rate">
                    {jobType.completionRate}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Avg Time:</span>
                  <span className="metric-value">
                    {jobType.avgCompletionTime || "N/A"} days
                  </span>
                </div>
              </div>
              <div className="completion-bar">
                <div
                  className="completion-fill"
                  style={{ width: `${jobType.completionRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Jobs */}
      {data.upcomingJobs.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h4>Upcoming Jobs</h4>
            <p>Jobs scheduled for the next 30 days</p>
          </div>
          <div className="upcoming-jobs-list">
            {data.upcomingJobs.slice(0, 10).map((job) => (
              <div key={job.id} className="upcoming-job-item">
                <div className="job-info">
                  <div className="job-header">
                    <span className="job-id">{job.jobId}</span>
                    <span className={`priority-badge ${job.priority.toLowerCase()}`}>
                      {job.priority}
                    </span>
                  </div>
                  <div className="job-details">
                    <div className="job-type">{job.jobType}</div>
                    <div className="property-address">{job.propertyAddress}</div>
                  </div>
                  <div className="job-assignment">
                    <div className="technician">
                      <RiBuildingLine size={14} />
                      {job.technicianName}
                    </div>
                    <div className="due-date">
                      <RiCalendarEventLine size={14} />
                      {new Date(job.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="job-status">
                  <span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Summary */}
      <div className="summary-metrics">
        <div className="summary-card">
          <div className="summary-icon">
            <RiBarChartLine />
          </div>
          <div className="summary-content">
            <div className="summary-value">
              {data.statusDistribution.reduce((sum, status) => sum + status.count, 0)}
            </div>
            <div className="summary-label">Total Jobs</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <RiCalendarEventLine />
          </div>
          <div className="summary-content">
            <div className="summary-value">{data.upcomingJobs.length}</div>
            <div className="summary-label">Upcoming Jobs</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <RiTimeLine />
          </div>
          <div className="summary-content">
            <div className="summary-value">{data.typeDistribution.length}</div>
            <div className="summary-label">Job Types</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;