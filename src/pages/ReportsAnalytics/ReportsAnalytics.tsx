import { useState, useEffect, useMemo } from "react";
import {
  RiMoneyDollarCircleLine,
  RiCheckboxCircleLine,
  RiStarLine,
  RiDashboardLine,
  RiBuildingLine,
  RiUserStarLine,
  RiCloseLine,
  RiTimeLine,
} from "react-icons/ri";
import reportService, {
  type ExecutiveDashboard,
  type OperationalAnalytics,
} from "../../services/reportService";
import toast from "react-hot-toast";
import TechnicianPaymentsReport from "../../components/TechnicianPaymentsReport/TechnicianPaymentsReport";
import { useAppSelector } from "../../store";
import "./ReportsAnalytics.scss";

const ReportsAnalytics = () => {
  const { userType } = useAppSelector(state => state.user);
  const [activeTab, setActiveTab] = useState("executive");
  const [executiveDashboard, setExecutiveDashboard] =
    useState<ExecutiveDashboard | null>(null);
  const [loadingExecutive, setLoadingExecutive] = useState(true);
  const [operationalAnalytics, setOperationalAnalytics] =
    useState<OperationalAnalytics | null>(null);
  const [loadingOperational, setLoadingOperational] = useState(true);

  useEffect(() => {

    const fetchExecutiveDashboard = async () => {
      try {
        setLoadingExecutive(true);
        const response = await reportService.getExecutiveDashboard();
        setExecutiveDashboard(response.data);
      } catch {
        toast.error("Failed to fetch executive dashboard");
      } finally {
        setLoadingExecutive(false);
      }
    };

    if (activeTab === "executive") {
      fetchExecutiveDashboard();
    }

    const fetchOperationalAnalytics = async () => {
      try {
        setLoadingOperational(true);
        const response = await reportService.getOperationalAnalytics();
        setOperationalAnalytics(response.data);
      } catch {
        toast.error("Failed to fetch operational analytics");
      } finally {
        setLoadingOperational(false);
      }
    };

    if (activeTab === "operational") {
      fetchOperationalAnalytics();
    }

  }, [activeTab]);





  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "executive", label: "Executive Dashboard", icon: RiDashboardLine },
      { id: "operational", label: "Operational Analytics", icon: RiBuildingLine },
      {
        id: "payments",
        label: "Technician Payments",
        icon: RiMoneyDollarCircleLine,
      },
    ];

    if (userType === "property_manager") {
      return baseTabs.filter(tab => tab.id !== "payments");
    }

    return baseTabs;
  }, [userType]);

  useEffect(() => {
    if (userType === "property_manager" && activeTab === "payments") {
      setActiveTab("executive");
    }
  }, [userType, activeTab]);


  const renderExecutiveDashboard = () => (
    <div className="executive-dashboard">
      <div className="report-header">
        <div className="header-content">
          <h3>Executive Dashboard</h3>
          <p>High-level KPIs and business performance metrics</p>
        </div>
      </div>

      {loadingExecutive ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading executive dashboard...</p>
        </div>
      ) : executiveDashboard ? (
        <>
          {/* KPI Summary Section */}
          <div className="kpi-section">
            <h4>Key Performance Indicators</h4>
            <div className="kpi-grid">
              <div className="kpi-period">
                <h5>Today</h5>
                <div className="kpi-cards">
                  <div className="kpi-card">
                    <div className="kpi-value">
                      {executiveDashboard.kpis.today.newJobs}
                    </div>
                    <div className="kpi-label">New Jobs</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.today.growth.newJobs
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.today.growth.newJobs
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.today.growth.newJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">
                      {executiveDashboard.kpis.today.completedJobs}
                    </div>
                    <div className="kpi-label">Completed Jobs</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.today.growth.completedJobs
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.today.growth.completedJobs
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.today.growth.completedJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">
                      ${executiveDashboard.kpis.today.revenue.toLocaleString()}
                    </div>
                    <div className="kpi-label">Revenue</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.today.growth.revenue
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.today.growth.revenue
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.today.growth.revenue}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="kpi-period">
                <h5>This Week</h5>
                <div className="kpi-cards">
                  <div className="kpi-card">
                    <div className="kpi-value">
                      {executiveDashboard.kpis.thisWeek.newJobs}
                    </div>
                    <div className="kpi-label">New Jobs</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.thisWeek.growth.newJobs
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.thisWeek.growth.newJobs
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.thisWeek.growth.newJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">
                      {executiveDashboard.kpis.thisWeek.completedJobs}
                    </div>
                    <div className="kpi-label">Completed Jobs</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.thisWeek.growth.completedJobs
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.thisWeek.growth.completedJobs
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.thisWeek.growth.completedJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">
                      $
                      {executiveDashboard.kpis.thisWeek.revenue.toLocaleString()}
                    </div>
                    <div className="kpi-label">Revenue</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.thisWeek.growth.revenue
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.thisWeek.growth.revenue
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.thisWeek.growth.revenue}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="kpi-period">
                <h5>This Month</h5>
                <div className="kpi-cards">
                  <div className="kpi-card">
                    <div className="kpi-value">
                      {executiveDashboard.kpis.thisMonth.newJobs}
                    </div>
                    <div className="kpi-label">New Jobs</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.thisMonth.growth.newJobs
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.thisMonth.growth.newJobs
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.thisMonth.growth.newJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">
                      {executiveDashboard.kpis.thisMonth.completedJobs}
                    </div>
                    <div className="kpi-label">Completed Jobs</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.thisMonth.growth.completedJobs
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.thisMonth.growth.completedJobs
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.thisMonth.growth.completedJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">
                      $
                      {executiveDashboard.kpis.thisMonth.revenue.toLocaleString()}
                    </div>
                    <div className="kpi-label">Revenue</div>
                    <div
                      className={`kpi-growth ${
                        parseFloat(
                          executiveDashboard.kpis.thisMonth.growth.revenue
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {parseFloat(
                        executiveDashboard.kpis.thisMonth.growth.revenue
                      ) >= 0
                        ? "+"
                        : ""}
                      {executiveDashboard.kpis.thisMonth.growth.revenue}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Health Section */}
          <div className="business-health-section">
            <h4>Business Health Indicators</h4>
            <div className="health-grid">
              <div className="health-card">
                <div className="health-icon">
                  <RiBuildingLine />
                </div>
                <div className="health-content">
                  <div className="health-value">
                    {
                      executiveDashboard.businessHealth.totalActiveEntities
                        .total
                    }
                  </div>
                  <div className="health-label">Total Active Entities</div>
                  <div className="health-breakdown">
                    {
                      executiveDashboard.businessHealth.totalActiveEntities
                        .agencies
                    }{" "}
                    Agencies •{" "}
                    {
                      executiveDashboard.businessHealth.totalActiveEntities
                        .properties
                    }{" "}
                    Properties •{" "}
                    {
                      executiveDashboard.businessHealth.totalActiveEntities
                        .technicians
                    }{" "}
                    Technicians
                  </div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiCheckboxCircleLine />
                </div>
                <div className="health-content">
                  <div className="health-value">
                    {executiveDashboard.businessHealth.jobCompletionRate.toFixed(
                      1
                    )}
                    %
                  </div>
                  <div className="health-label">Job Completion Rate</div>
                  <div
                    className={`health-status ${
                      executiveDashboard.businessHealth.jobCompletionRate >= 90
                        ? "excellent"
                        : executiveDashboard.businessHealth.jobCompletionRate >=
                          80
                        ? "good"
                        : "needs-improvement"
                    }`}
                  >
                    {executiveDashboard.businessHealth.jobCompletionRate >= 90
                      ? "Excellent"
                      : executiveDashboard.businessHealth.jobCompletionRate >=
                        80
                      ? "Good"
                      : "Needs Improvement"}
                  </div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiMoneyDollarCircleLine />
                </div>
                <div className="health-content">
                  <div className="health-value">
                    $
                    {executiveDashboard.businessHealth.avgJobValue.toLocaleString()}
                  </div>
                  <div className="health-label">Average Job Value</div>
                  <div className="health-trend">Monthly Average</div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiStarLine />
                </div>
                <div className="health-content">
                  <div className="health-value">
                    {executiveDashboard.businessHealth.customerSatisfaction.toFixed(
                      1
                    )}
                    /5
                  </div>
                  <div className="health-label">Customer Satisfaction</div>
                  <div
                    className={`health-status ${
                      executiveDashboard.businessHealth.customerSatisfaction >=
                      4.5
                        ? "excellent"
                        : executiveDashboard.businessHealth
                            .customerSatisfaction >= 4.0
                        ? "good"
                        : "needs-improvement"
                    }`}
                  >
                    {executiveDashboard.businessHealth.customerSatisfaction >=
                    4.5
                      ? "Excellent"
                      : executiveDashboard.businessHealth
                          .customerSatisfaction >= 4.0
                      ? "Good"
                      : "Needs Improvement"}
                  </div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiUserStarLine />
                </div>
                <div className="health-content">
                  <div className="health-value">
                    {executiveDashboard.businessHealth.technicianUtilization.toFixed(
                      1
                    )}
                    %
                  </div>
                  <div className="health-label">Technician Utilization</div>
                  <div
                    className={`health-status ${
                      executiveDashboard.businessHealth.technicianUtilization >=
                      80
                        ? "excellent"
                        : executiveDashboard.businessHealth
                            .technicianUtilization >= 60
                        ? "good"
                        : "needs-improvement"
                    }`}
                  >
                    {executiveDashboard.businessHealth.technicianUtilization >=
                    80
                      ? "Excellent"
                      : executiveDashboard.businessHealth
                          .technicianUtilization >= 60
                      ? "Good"
                      : "Needs Improvement"}
                  </div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiMoneyDollarCircleLine />
                </div>
                <div className="health-content">
                  <div className="health-value">
                    $
                    {executiveDashboard.quotations.acceptedValue.toLocaleString()}
                  </div>
                  <div className="health-label">Accepted Quotations Value</div>
                  <div className="health-breakdown">
                    {executiveDashboard.quotations.acceptedQuotations} of{" "}
                    {executiveDashboard.quotations.totalQuotations} quotations
                    ({executiveDashboard.quotations.acceptanceRate}% acceptance rate)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {(executiveDashboard.alerts.critical > 0 ||
            executiveDashboard.alerts.warnings > 0 ||
            executiveDashboard.alerts.info > 0) && (
            <div className="alerts-section">
              <h4>System Alerts</h4>
              <div className="alerts-grid">
                {executiveDashboard.alerts.critical > 0 && (
                  <div className="alert critical">
                    <RiCloseLine className="alert-icon" />
                    <div className="alert-content">
                      <div className="alert-count">
                        {executiveDashboard.alerts.critical}
                      </div>
                      <div className="alert-label">Overdue Jobs</div>
                    </div>
                  </div>
                )}
                {executiveDashboard.alerts.warnings > 0 && (
                  <div className="alert warning">
                    <RiTimeLine className="alert-icon" />
                    <div className="alert-content">
                      <div className="alert-count">
                        {executiveDashboard.alerts.warnings}
                      </div>
                      <div className="alert-label">Pending Payments</div>
                    </div>
                  </div>
                )}
                {executiveDashboard.alerts.info > 0 && (
                  <div className="alert info">
                    <RiBuildingLine className="alert-icon" />
                    <div className="alert-content">
                      <div className="alert-count">
                        {executiveDashboard.alerts.info}
                      </div>
                      <div className="alert-label">Inactive Agencies</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="error-state">
          <p>Failed to load executive dashboard data</p>
        </div>
      )}
    </div>
  );

  const renderOperationalAnalytics = () => (
    <div className="operational-analytics">
      <div className="report-header">
        <div className="header-content">
          <h3>Operational Analytics</h3>
          <p>Detailed operational metrics and resource utilization</p>
        </div>
      </div>

      {loadingOperational ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading operational analytics...</p>
        </div>
      ) : operationalAnalytics ? (
        <>
          {/* Resource Utilization Section */}
          <div className="resource-section">
            <h4>Resource Utilization</h4>
            <div className="utilization-summary">
              <div className="summary-item">
                <span className="summary-label">Active Technicians:</span>
                <span className="summary-value">
                  {
                    operationalAnalytics.resourceUtilization
                      .totalActiveTechnicians
                  }
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Utilization:</span>
                <span className="summary-value">
                  {operationalAnalytics.resourceUtilization.avgUtilization}%
                </span>
              </div>
            </div>

            <div className="technician-workload">
              <h5>Technician Workload Distribution</h5>
              <div className="workload-grid">
                {operationalAnalytics.resourceUtilization.technicianWorkload
                  .slice(0, 8)
                  .map((tech, index) => (
                    <div key={index} className="workload-card">
                      <div className="workload-header">
                        <strong>{tech.name}</strong>
                        <span className="trade-type">{tech.tradeType}</span>
                      </div>
                      <div className="workload-metrics">
                        <div className="metric-row">
                          <span>Active Jobs:</span>
                          <span className="metric-value">
                            {tech.activeJobs}
                          </span>
                        </div>
                        <div className="metric-row">
                          <span>Completed This Month:</span>
                          <span className="metric-value">
                            {tech.completedThisMonth}
                          </span>
                        </div>
                        <div className="metric-row">
                          <span>Utilization:</span>
                          <span
                            className={`metric-value ${
                              tech.utilizationRate >= 80
                                ? "high"
                                : tech.utilizationRate >= 60
                                ? "medium"
                                : "low"
                            }`}
                          >
                            {tech.utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Job Analytics Section */}
          <div className="job-analytics-section">
            <h4>Job Analytics</h4>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h5>Job Type Distribution (Last 30 Days)</h5>
                <div className="job-type-list">
                  {operationalAnalytics.jobAnalytics.typeDistribution.map(
                    (jobType, index) => (
                      <div key={index} className="job-type-item">
                        <div className="job-type-header">
                          <span className="job-type-name">
                            {jobType.jobType}
                          </span>
                          <span className="job-type-count">
                            {jobType.count} jobs
                          </span>
                        </div>
                        <div className="job-type-metrics">
                          <div className="metric">
                            <span>Completion Rate:</span>
                            <span className="value">
                              {jobType.completionRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="metric">
                            <span>Avg Completion Time:</span>
                            <span className="value">
                              {jobType.avgCompletionTime?.toFixed(1) || "N/A"}{" "}
                              days
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="analytics-card">
                <h5>Time to Completion Analysis</h5>
                <div className="completion-time-list">
                  {operationalAnalytics.jobAnalytics.timeToCompletion.map(
                    (item, index) => (
                      <div key={index} className="completion-item">
                        <div className="completion-header">
                          <span className="job-type">{item.jobType}</span>
                          <span className="avg-time">
                            {item.avgCompletionTime} days avg
                          </span>
                        </div>
                        <div className="completion-range">
                          <span>
                            Range: {item.minCompletionTime} -{" "}
                            {item.maxCompletionTime} days
                          </span>
                          <span className="sample-size">
                            ({item.count} jobs)
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Property Insights Section */}
          <div className="property-insights-section">
            <h4>Property Insights</h4>
            <div className="insights-summary">
              <span>
                Properties with jobs:{" "}
                {operationalAnalytics.propertyInsights.totalPropertiesWithJobs}
              </span>
            </div>
            <div className="property-frequency">
              <h5>High-Activity Properties</h5>
              <div className="property-list">
                {operationalAnalytics.propertyInsights.jobFrequency
                  .slice(0, 10)
                  .map((property, index) => (
                    <div key={index} className="property-item">
                      <div className="property-address">
                        {property.address?.street}, {property.address?.suburb}{" "}
                        {property.address?.postcode}
                      </div>
                      <div className="property-stats">
                        <span>Total: {property.totalJobs}</span>
                        <span>Recent: {property.recentJobs}</span>
                        <span>
                          Avg/Month: {property.avgJobsPerMonth.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Regional Performance Section */}
          <div className="regional-performance-section">
            <h4>Regional Performance</h4>
            <div className="performance-grid">
              {operationalAnalytics.regionalPerformance
                .slice(0, 8)
                .map((region, index) => (
                  <div key={index} className="performance-card">
                    <div className="performance-header">
                      <strong>{region.companyName}</strong>
                      <span className="region-state">{region.state}</span>
                    </div>
                    <div className="performance-metrics">
                      <div className="metric-row">
                        <span>Properties:</span>
                        <span>{region.totalProperties}</span>
                      </div>
                      <div className="metric-row">
                        <span>Total Jobs:</span>
                        <span>{region.totalJobs}</span>
                      </div>
                      <div className="metric-row">
                        <span>Completed:</span>
                        <span>{region.completedJobs}</span>
                      </div>
                      <div className="metric-row">
                        <span>Completion Rate:</span>
                        <span
                          className={`completion-rate ${
                            region.completionRate >= 90
                              ? "excellent"
                              : region.completionRate >= 80
                              ? "good"
                              : "needs-improvement"
                          }`}
                        >
                          {region.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="error-state">
          <p>Failed to load operational analytics data</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive reporting and performance analytics</p>
      </div>

      <div className="reports-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === "executive" && renderExecutiveDashboard()}
        {activeTab === "operational" && renderOperationalAnalytics()}
        {activeTab === "payments" && <TechnicianPaymentsReport />}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
