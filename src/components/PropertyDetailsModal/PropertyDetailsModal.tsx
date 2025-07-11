import { RiDownloadLine } from "react-icons/ri";
import Modal from "../Modal/Modal";
import "./PropertyDetailsModal.scss";

interface ComplianceJob {
  id: string;
  propertyAddress: string;
  jobType:
    | "Gas"
    | "Electrical"
    | "Smoke"
    | "Repairs"
    | "Plumbing"
    | "Fire Safety";
  dueDate: string;
  completedDate?: string;
  status: "Compliant" | "Due Soon" | "Overdue" | "In Progress" | "Failed";
  priority: "Low" | "Medium" | "High" | "Critical";
  lastInspection?: string;
  nextInspection: string;
  certificateNumber?: string;
  technician?: string;
  complianceScore: number;
  notes?: string;
}

interface PropertyCompliance {
  id: string;
  address: string;
  overallComplianceScore: number;
  totalJobs: number;
  compliantJobs: number;
  overdueJobs: number;
  upcomingJobs: number;
  failedJobs: number;
  lastFullInspection: string;
  nextFullInspection: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  jobs: ComplianceJob[];
}

interface PropertyDetailsModalProps {
  property: PropertyCompliance | null;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyDetailsModal = ({
  property,
  isOpen,
  onClose,
}: PropertyDetailsModalProps) => {
  if (!property) return null;

  const getComplianceColor = (score: number) => {
    if (score >= 85) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "success";
      case "Due Soon":
        return "warning";
      case "Overdue":
        return "danger";
      case "In Progress":
        return "info";
      case "Failed":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "danger";
      case "High":
        return "warning";
      case "Medium":
        return "info";
      case "Low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical":
        return "danger";
      case "High":
        return "warning";
      case "Medium":
        return "info";
      case "Low":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Compliance Details - ${property.address}`}
      size="large"
    >
      <div className="property-details-modal">
        <div className="property-overview">
          <div className="overview-section">
            <h4>Property Summary</h4>
            <div className="summary-stats">
              <div
                className={`score-display ${getComplianceColor(
                  property.overallComplianceScore
                )}`}
              >
                <span className="score">
                  {property.overallComplianceScore}%
                </span>
                <span className="label">Overall Compliance</span>
              </div>
              <div
                className={`risk-display ${getRiskColor(property.riskLevel)}`}
              >
                <span className="risk">{property.riskLevel}</span>
                <span className="label">Risk Level</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detailed-jobs-table">
          <h4>Complete Job Breakdown</h4>
          <div className="jobs-table">
            <div className="table-header">
              <div className="table-cell">Job Type</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Priority</div>
              <div className="table-cell">Due Date</div>
              <div className="table-cell">Compliance Score</div>
              <div className="table-cell">Technician</div>
            </div>

            {property.jobs.map((job) => (
              <div key={job.id} className="table-row">
                <div className="table-cell">
                  <span className="job-type-cell">{job.jobType}</span>
                </div>
                <div className="table-cell">
                  <span
                    className={`status-badge ${getStatusColor(job.status)}`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="table-cell">
                  <span
                    className={`priority-badge ${getPriorityColor(
                      job.priority
                    )}`}
                  >
                    {job.priority}
                  </span>
                </div>
                <div className="table-cell">{job.dueDate}</div>
                <div className="table-cell">
                  <span
                    className={`score-badge ${getComplianceColor(
                      job.complianceScore
                    )}`}
                  >
                    {job.complianceScore}%
                  </span>
                </div>
                <div className="table-cell">
                  {job.technician || "Unassigned"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary">
            <RiDownloadLine />
            Export Property Report
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PropertyDetailsModal;
