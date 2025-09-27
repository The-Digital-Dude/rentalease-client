import { RiShieldCheckLine, RiArrowUpLine, RiArrowDownLine } from "react-icons/ri";
import type { PropertyManagerCompliance } from "../../../../services/propertyManagerReportService";
import "./ComplianceDashboard.scss";

interface ComplianceDashboardProps {
  data: PropertyManagerCompliance | null;
}

const ComplianceDashboard = ({ data }: ComplianceDashboardProps) => {
  if (!data) {
    return (
      <div className="compliance-dashboard">
        <div className="no-data">
          <RiShieldCheckLine size={48} />
          <h3>No Compliance Data</h3>
          <p>No compliance information available for your assigned properties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="compliance-dashboard">
      <div className="compliance-header">
        <h3>Compliance Dashboard</h3>
        <p>Property compliance status and upcoming inspections</p>
      </div>

      <div className="compliance-overview">
        <div className="overview-card">
          <div className="compliance-score-circle">
            <div className="score-circle" style={{
              background: `conic-gradient(var(--success-color) ${data.overview.complianceScore * 3.6}deg, var(--border-color) 0deg)`
            }}>
              <div className="score-center">
                <div className="score-percentage">{data.overview.complianceScore}%</div>
                <div className="score-label">Compliance</div>
              </div>
            </div>
          </div>
          <p>{data.overview.totalProperties} Properties Monitored</p>
        </div>
      </div>

      <div className="compliance-metrics">
        <div className="metric-card compliant">
          <div className="metric-value compliant">{data.overview.compliantProperties}</div>
          <div className="metric-label">Compliant Properties</div>
        </div>
        <div className="metric-card due-soon">
          <div className="metric-value due-soon">{data.overview.dueSoonProperties || 0}</div>
          <div className="metric-label">Due Soon</div>
        </div>
        <div className="metric-card overdue">
          <div className="metric-value overdue">{data.overview.overdueProperties || 0}</div>
          <div className="metric-label">Overdue</div>
        </div>
      </div>

      {data.upcomingInspections.length > 0 && (
        <div className="upcoming-inspections">
          <h4>Upcoming Inspections</h4>
          <div className="inspection-list">
            {data.upcomingInspections.slice(0, 10).map((inspection, index) => (
              <div key={index} className="inspection-item">
                <div className="inspection-type">{inspection.inspectionType}</div>
                <div className="property-address">{inspection.propertyAddress}</div>
                <div className="due-date">{new Date(inspection.dueDate).toLocaleDateString()}</div>
                <div className={`status ${inspection.status.toLowerCase().replace(' ', '-')}`}>
                  {inspection.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;