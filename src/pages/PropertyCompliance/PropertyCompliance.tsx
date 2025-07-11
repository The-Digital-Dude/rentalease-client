import { useState } from "react";
import { RiEyeLine, RiDownloadLine, RiAlertLine } from "react-icons/ri";
import PropertyDetailsModal from "../../components/PropertyDetailsModal";
import "./PropertyCompliance.scss";

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

const initialComplianceData: PropertyCompliance[] = [
  {
    id: "PC001",
    address: "123 Collins Street, Melbourne VIC 3000",
    overallComplianceScore: 85,
    totalJobs: 6,
    compliantJobs: 4,
    overdueJobs: 1,
    upcomingJobs: 1,
    failedJobs: 0,
    lastFullInspection: "2023-06-15",
    nextFullInspection: "2024-06-15",
    riskLevel: "Medium",
    jobs: [
      {
        id: "J001",
        propertyAddress: "123 Collins Street, Melbourne VIC 3000",
        jobType: "Gas",
        dueDate: "2024-01-15",
        completedDate: "2024-01-14",
        status: "Compliant",
        priority: "High",
        lastInspection: "2024-01-14",
        nextInspection: "2025-01-14",
        certificateNumber: "GAS-2024-001",
        technician: "John Smith",
        complianceScore: 95,
        notes: "All gas appliances tested and certified",
      },
      {
        id: "J002",
        propertyAddress: "123 Collins Street, Melbourne VIC 3000",
        jobType: "Electrical",
        dueDate: "2024-01-10",
        status: "Overdue",
        priority: "Critical",
        nextInspection: "2024-01-10",
        technician: "Sarah Wilson",
        complianceScore: 0,
        notes: "Electrical safety switch installation required",
      },
      {
        id: "J003",
        propertyAddress: "123 Collins Street, Melbourne VIC 3000",
        jobType: "Smoke",
        dueDate: "2024-01-25",
        status: "Due Soon",
        priority: "High",
        nextInspection: "2024-01-25",
        technician: "Mike Johnson",
        complianceScore: 80,
        notes: "Smoke alarm batteries need replacement",
      },
      {
        id: "J004",
        propertyAddress: "123 Collins Street, Melbourne VIC 3000",
        jobType: "Fire Safety",
        dueDate: "2024-02-01",
        completedDate: "2024-01-30",
        status: "Compliant",
        priority: "Medium",
        lastInspection: "2024-01-30",
        nextInspection: "2025-01-30",
        certificateNumber: "FIRE-2024-001",
        technician: "Emma Brown",
        complianceScore: 90,
        notes: "Fire extinguishers serviced and certified",
      },
    ],
  },
  {
    id: "PC002",
    address: "456 George Street, Sydney NSW 2000",
    overallComplianceScore: 95,
    totalJobs: 4,
    compliantJobs: 4,
    overdueJobs: 0,
    upcomingJobs: 0,
    failedJobs: 0,
    lastFullInspection: "2023-08-20",
    nextFullInspection: "2024-08-20",
    riskLevel: "Low",
    jobs: [
      {
        id: "J005",
        propertyAddress: "456 George Street, Sydney NSW 2000",
        jobType: "Gas",
        dueDate: "2024-02-01",
        completedDate: "2024-01-28",
        status: "Compliant",
        priority: "Medium",
        lastInspection: "2024-01-28",
        nextInspection: "2025-01-28",
        certificateNumber: "GAS-2024-002",
        technician: "David Chen",
        complianceScore: 98,
        notes: "All systems functioning perfectly",
      },
    ],
  },
  {
    id: "PC003",
    address: "789 Queen Street, Brisbane QLD 4000",
    overallComplianceScore: 45,
    totalJobs: 6,
    compliantJobs: 1,
    overdueJobs: 4,
    upcomingJobs: 1,
    failedJobs: 1,
    lastFullInspection: "2023-03-10",
    nextFullInspection: "2024-03-10",
    riskLevel: "Critical",
    jobs: [
      {
        id: "J006",
        propertyAddress: "789 Queen Street, Brisbane QLD 4000",
        jobType: "Plumbing",
        dueDate: "2024-01-05",
        status: "Overdue",
        priority: "Critical",
        nextInspection: "2024-01-05",
        technician: "Emma Brown",
        complianceScore: 0,
        notes: "Major water leak detected - urgent repair required",
      },
      {
        id: "J007",
        propertyAddress: "789 Queen Street, Brisbane QLD 4000",
        jobType: "Electrical",
        dueDate: "2024-01-08",
        status: "Failed",
        priority: "Critical",
        nextInspection: "2024-01-08",
        complianceScore: 0,
        notes: "Electrical inspection failed - safety hazards identified",
      },
    ],
  },
];

const PropertyCompliance = () => {
  const [complianceData] = useState<PropertyCompliance[]>(
    initialComplianceData
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyCompliance | null>(null);

  const filteredData = complianceData.filter((property) => {
    const matchesSearch = property.address
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "compliant" && property.overallComplianceScore >= 85) ||
      (statusFilter === "needs-attention" &&
        property.overallComplianceScore < 85 &&
        property.overallComplianceScore >= 60) ||
      (statusFilter === "critical" && property.overallComplianceScore < 60);
    const matchesRisk =
      riskFilter === "all" || property.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

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

  const getOverallStats = () => {
    const totalProperties = complianceData.length;
    const compliantProperties = complianceData.filter(
      (p) => p.overallComplianceScore >= 85
    ).length;
    const criticalProperties = complianceData.filter(
      (p) => p.riskLevel === "Critical"
    ).length;
    const totalOverdueJobs = complianceData.reduce(
      (sum, p) => sum + p.overdueJobs,
      0
    );
    const totalFailedJobs = complianceData.reduce(
      (sum, p) => sum + p.failedJobs,
      0
    );
    const averageCompliance = Math.round(
      complianceData.reduce((sum, p) => sum + p.overallComplianceScore, 0) /
        totalProperties
    );

    return {
      totalProperties,
      compliantProperties,
      criticalProperties,
      totalOverdueJobs,
      totalFailedJobs,
      averageCompliance,
    };
  };

  const stats = getOverallStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Property Compliance Dashboard</h1>
        <p>
          Comprehensive breakdown of compliance jobs and property safety status
        </p>
      </div>

      {/* Critical Alerts */}
      {stats.criticalProperties > 0 && (
        <div className="critical-alerts">
          <div className="alert-header">
            <RiAlertLine className="alert-icon" />
            <h3>
              Critical Compliance Issues ({stats.criticalProperties} Properties)
            </h3>
          </div>
          <div className="alert-content">
            <p>
              Immediate attention required for properties with critical
              compliance issues.
            </p>
            <div className="alert-stats">
              <span className="stat">
                {stats.totalFailedJobs} Failed Inspections
              </span>
              <span className="stat">
                {stats.totalOverdueJobs} Overdue Jobs
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProperties}</div>
          <div className="stat-label">Total Properties</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{stats.compliantProperties}</div>
          <div className="stat-label">Fully Compliant</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{stats.averageCompliance}%</div>
          <div className="stat-label">Average Compliance</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{stats.totalOverdueJobs}</div>
          <div className="stat-label">Overdue Jobs</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{stats.criticalProperties}</div>
          <div className="stat-label">Critical Risk</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{stats.totalFailedJobs}</div>
          <div className="stat-label">Failed Inspections</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by property address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Compliance Levels</option>
            <option value="compliant">Compliant (85%+)</option>
            <option value="needs-attention">Needs Attention (60-84%)</option>
            <option value="critical">Critical (&lt;60%)</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="all">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>
          <button className="btn btn-primary">
            <RiDownloadLine />
            Export Compliance Report
          </button>
        </div>
      </div>

      {/* Property Compliance Cards */}
      <div className="compliance-grid">
        {filteredData.map((property) => (
          <div key={property.id} className="compliance-card">
            <div className="card-header">
              <div className="property-info">
                <h3>{property.address}</h3>
                <span
                  className={`risk-badge ${getRiskColor(property.riskLevel)}`}
                >
                  {property.riskLevel} Risk
                </span>
              </div>
              <div
                className={`compliance-score ${getComplianceColor(
                  property.overallComplianceScore
                )}`}
              >
                {property.overallComplianceScore}%
              </div>
            </div>

            <div className="card-content">
              <div className="compliance-stats">
                <div className="stat-item">
                  <span className="label">Total Jobs</span>
                  <span className="value">{property.totalJobs}</span>
                </div>
                <div className="stat-item success">
                  <span className="label">Compliant</span>
                  <span className="value">{property.compliantJobs}</span>
                </div>
                <div className="stat-item danger">
                  <span className="label">Overdue</span>
                  <span className="value">{property.overdueJobs}</span>
                </div>
                <div className="stat-item warning">
                  <span className="label">Upcoming</span>
                  <span className="value">{property.upcomingJobs}</span>
                </div>
                <div className="stat-item danger">
                  <span className="label">Failed</span>
                  <span className="value">{property.failedJobs}</span>
                </div>
              </div>

              <div className="inspection-info">
                <div className="info-item">
                  <span className="label">Last Inspection:</span>
                  <span className="value">{property.lastFullInspection}</span>
                </div>
                <div className="info-item">
                  <span className="label">Next Inspection:</span>
                  <span className="value">{property.nextFullInspection}</span>
                </div>
              </div>

              <div className="jobs-summary">
                <h4>Recent Jobs</h4>
                {property.jobs.slice(0, 2).map((job) => (
                  <div key={job.id} className="job-item">
                    <div className="job-info">
                      <span className="job-type">{job.jobType}</span>
                      <span className="job-due">Due: {job.dueDate}</span>
                    </div>
                    <div className="job-status">
                      <span
                        className={`status-badge ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                      <span
                        className={`priority-badge ${getPriorityColor(
                          job.priority
                        )}`}
                      >
                        {job.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {property.jobs.length > 2 && (
                  <div className="more-jobs">
                    +{property.jobs.length - 2} more jobs
                  </div>
                )}
              </div>
            </div>

            <div className="card-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedProperty(property)}
              >
                <RiEyeLine />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
};

export default PropertyCompliance;
