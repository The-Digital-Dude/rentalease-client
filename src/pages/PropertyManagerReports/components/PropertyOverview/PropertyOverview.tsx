import {
  RiBuildingLine,
  RiLineChartLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiTrophyLine,
} from "react-icons/ri";
import type {
  PropertyManagerOverview,
  PropertyManagerDashboard,
} from "../../../../services/propertyManagerReportService";
import "./PropertyOverview.scss";

interface PropertyOverviewProps {
  data: PropertyManagerOverview | null;
  dashboardData: PropertyManagerDashboard | null;
}

const PropertyOverview = ({ data, dashboardData }: PropertyOverviewProps) => {
  if (!data) {
    return (
      <div className="property-overview">
        <div className="no-data">
          <RiBuildingLine size={48} />
          <h3>No Properties Data</h3>
          <p>You don't have any assigned properties yet.</p>
        </div>
      </div>
    );
  }

  const completionRate = data.performanceMetrics.totalJobs
    ? ((data.performanceMetrics.completedJobs || 0) / data.performanceMetrics.totalJobs * 100).toFixed(1)
    : "0";

  return (
    <div className="property-overview">
      <div className="overview-header">
        <h3>Property Performance Overview</h3>
        <p>Comprehensive insights into your managed properties</p>
      </div>

      {/* Performance Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon properties">
            <RiBuildingLine />
          </div>
          <div className="metric-value">{data.propertiesManaged}</div>
          <div className="metric-label">Properties Managed</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon jobs">
            <RiLineChartLine />
          </div>
          <div className="metric-value">{data.performanceMetrics.totalJobs || 0}</div>
          <div className="metric-label">Total Jobs</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon completion">
            <RiTrophyLine />
          </div>
          <div className="metric-value">{completionRate}%</div>
          <div className="metric-label">Completion Rate</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon time">
            <RiTimeLine />
          </div>
          <div className="metric-value">
            {data.performanceMetrics.avgCompletionTime
              ? `${data.performanceMetrics.avgCompletionTime.toFixed(1)} days`
              : "N/A"}
          </div>
          <div className="metric-label">Avg Completion Time</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon cost">
            <RiMoneyDollarCircleLine />
          </div>
          <div className="metric-value">
            ${(data.performanceMetrics.totalCost || 0).toLocaleString()}
          </div>
          <div className="metric-label">Total Cost</div>
        </div>
      </div>

      {/* Monthly Trends */}
      {data.monthlyTrends.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h4>Monthly Performance Trends</h4>
            <p>Last 12 months job activity and completion rates</p>
          </div>
          <div className="trends-chart">
            <div className="trends-table">
              <div className="table-header">
                <div>Month</div>
                <div>Total Jobs</div>
                <div>Completed</div>
                <div>Completion Rate</div>
                <div>Total Cost</div>
              </div>
              {data.monthlyTrends.slice(-6).map((trend) => (
                <div key={trend.month} className="table-row">
                  <div className="month">
                    {new Date(trend.month + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="total-jobs">{trend.totalJobs}</div>
                  <div className="completed-jobs">{trend.completedJobs}</div>
                  <div className="completion-rate">
                    <div className="rate-bar">
                      <div
                        className="rate-fill"
                        style={{ width: `${trend.completionRate}%` }}
                      ></div>
                    </div>
                    <span>{trend.completionRate}%</span>
                  </div>
                  <div className="total-cost">
                    ${trend.totalCost.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Properties */}
      {data.topPerformingProperties.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h4>Top Performing Properties</h4>
            <p>Properties ranked by job completion rate</p>
          </div>
          <div className="properties-list">
            {data.topPerformingProperties.map((property, index) => (
              <div key={property.propertyId} className="property-item">
                <div className="property-rank">#{index + 1}</div>
                <div className="property-info">
                  <div className="property-address">
                    {property.address.street}, {property.address.suburb}{" "}
                    {property.address.postcode}
                  </div>
                  <div className="property-state">{property.address.state}</div>
                </div>
                <div className="property-stats">
                  <div className="stat">
                    <span className="stat-value">{property.totalJobs}</span>
                    <span className="stat-label">Total Jobs</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{property.completedJobs}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat completion-rate">
                    <span className="stat-value">{property.completionRate}%</span>
                    <span className="stat-label">Completion Rate</span>
                  </div>
                </div>
                <div className="completion-indicator">
                  <div
                    className="completion-circle"
                    style={{
                      background: `conic-gradient(#10b981 ${property.completionRate}%, #e5e7eb 0)`,
                    }}
                  >
                    <div className="completion-center">
                      <span>{property.completionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats from Dashboard */}
      {dashboardData && (
        <div className="chart-container">
          <div className="chart-header">
            <h4>Current Status Overview</h4>
            <p>Real-time job status distribution</p>
          </div>
          <div className="status-grid">
            <div className="status-card active">
              <div className="status-value">{dashboardData.activeJobs}</div>
              <div className="status-label">Active Jobs</div>
            </div>
            <div className="status-card pending">
              <div className="status-value">{dashboardData.pendingJobs}</div>
              <div className="status-label">Pending Jobs</div>
            </div>
            <div className="status-card completed">
              <div className="status-value">{dashboardData.completedJobs}</div>
              <div className="status-label">Completed Jobs</div>
            </div>
            <div className="status-card overdue">
              <div className="status-value">{dashboardData.overdueJobs}</div>
              <div className="status-label">Overdue Jobs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyOverview;