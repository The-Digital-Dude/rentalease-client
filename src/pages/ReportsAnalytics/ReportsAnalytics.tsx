import { useState, useEffect } from "react";
import { RiBarChartBoxLine, RiLineChartLine, RiUserStarLine, RiShieldCheckLine, RiMoneyDollarCircleLine, RiCalendarLine, RiFilterLine, RiDownloadLine, RiArrowUpLine, RiArrowDownLine, RiCheckboxCircleLine, RiCloseLine, RiTimeLine, RiStarLine, RiDashboardLine, RiBuildingLine } from "react-icons/ri";
import reportService, {
  type ComplianceData,
  type RevenueData,
  type TechnicianPerformance,
  type ExecutiveDashboard,
  type OperationalAnalytics,
} from "../../services/reportService";
import dashboardService from "../../services/dashboardService";
import toast from "react-hot-toast";
import { unparse } from "papaparse";
import TechnicianPaymentsReport from "../../components/TechnicianPaymentsReport/TechnicianPaymentsReport";
import "./ReportsAnalytics.scss";

interface ComplianceData {
  id: string;
  name: string;
  type: "agency" | "region" | "property";
  totalJobs: number;
  completedJobs: number;
  compliantJobs: number;
  overdueJobs: number;
  complianceRate: number;
  avgCompletionTime: number;
}

interface RevenueData {
  period: string;
  agency: string;
  region: string;
  jobType: string;
  amount: number;
  jobCount: number;
  avgJobValue: number;
}

interface TechnicianPerformance {
  id: string;
  name: string;
  tradeType: string;
  jobsCompleted: number;
  avgCompletionTime: number;
  rating: number;
  onTimeRate: number;
  totalRevenue: number;
  efficiency: number;
}

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState("executive");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("month");
  const [revenueBreakdown, setRevenueBreakdown] = useState("agency");
  const [technicianSort, setTechnicianSort] = useState("rating");
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [loadingCompliance, setLoadingCompliance] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [technicianData, setTechnicianData] = useState<TechnicianPerformance[]>([]);
  const [loadingTechnicianPerformance, setLoadingTechnicianPerformance] = useState(true);
  const [executiveDashboard, setExecutiveDashboard] = useState<ExecutiveDashboard | null>(null);
  const [loadingExecutive, setLoadingExecutive] = useState(true);
  const [operationalAnalytics, setOperationalAnalytics] = useState<OperationalAnalytics | null>(null);
  const [loadingOperational, setLoadingOperational] = useState(true);
  const [realComplianceStats, setRealComplianceStats] = useState<any>(null);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoadingCompliance(true);
        const response = await reportService.getComplianceReport(
          complianceFilter as any
        );
        setComplianceData(response.data);
      } catch (error) {
        toast.error("Failed to fetch compliance report");
      } finally {
        setLoadingCompliance(false);
      }
    };

    if (activeTab === "compliance") {
      fetchComplianceData();
    }

    const fetchRevenueData = async () => {
      try {
        setLoadingRevenue(true);
        const response = await reportService.getRevenueReport(
          revenueBreakdown as any,
          revenueFilter as any
        );
        setRevenueData(response.data);
      } catch (error) {
        toast.error("Failed to fetch revenue report");
      } finally {
        setLoadingRevenue(false);
      }
    };

    if (activeTab === "revenue") {
      fetchRevenueData();
    }

    const fetchTechnicianPerformanceData = async () => {
      try {
        setLoadingTechnicianPerformance(true);
        const response = await reportService.getTechnicianPerformanceReport();
        setTechnicianData(response.data);
      } catch (error) {
        toast.error("Failed to fetch technician performance report");
      } finally {
        setLoadingTechnicianPerformance(false);
      }
    };

    if (activeTab === "performance") {
      fetchTechnicianPerformanceData();
    }

    const fetchExecutiveDashboard = async () => {
      try {
        setLoadingExecutive(true);
        const response = await reportService.getExecutiveDashboard();
        setExecutiveDashboard(response.data);
      } catch (error) {
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
      } catch (error) {
        toast.error("Failed to fetch operational analytics");
      } finally {
        setLoadingOperational(false);
      }
    };

    if (activeTab === "operational") {
      fetchOperationalAnalytics();
    }

    // Fetch real dashboard stats for compliance cards
    const fetchRealStats = async () => {
      try {
        const response = await dashboardService.getAdminStats();
        setRealComplianceStats(response.data);
      } catch (error) {
        console.error("Failed to fetch real dashboard stats:", error);
      }
    };

    if (activeTab === "compliance") {
      fetchRealStats();
    }
  }, [activeTab, complianceFilter, revenueBreakdown, revenueFilter, technicianSort]);

  const handleExportCompliance = () => {
    const csv = unparse(filteredCompliance, {
      header: true,
      columns: [
        "name",
        "type",
        "totalJobs",
        "completedJobs",
        "compliantJobs",
        "overdueJobs",
        "complianceRate",
        "avgCompletionTime",
      ],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "compliance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRevenue = () => {
    const csv = unparse(revenueData, {
      header: true,
      columns: ["period", "agency", "region", "jobType", "amount", "jobCount", "avgJobValue"],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "revenue_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTechnicianPerformance = () => {
    const csv = unparse(sortedTechnicians, {
      header: true,
      columns: [
        "name",
        "tradeType",
        "jobsCompleted",
        "avgCompletionTime",
        "rating",
        "onTimeRate",
        "totalRevenue",
        "efficiency",
      ],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "technician_performance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  

  

  const filteredCompliance = complianceData.filter((item) => {
    if (complianceFilter === "all") return true;
    return item.type === complianceFilter;
  });

  const groupedRevenue = revenueData.reduce((acc, item) => {
    const key = item[revenueBreakdown as keyof RevenueData];
    if (!acc[key]) {
      acc[key] = { amount: 0, jobCount: 0, avgJobValue: 0 };
    }
    acc[key].amount += item.amount;
    acc[key].jobCount += item.jobCount;
    acc[key].avgJobValue = acc[key].amount / acc[key].jobCount;
    return acc;
  }, {} as Record<string, { amount: number; jobCount: number; avgJobValue: number }>);

  const sortedTechnicians = [...technicianData].sort((a, b) => {
    switch (technicianSort) {
      case "rating":
        return b.rating - a.rating;
      case "jobs":
        return b.jobsCompleted - a.jobsCompleted;
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      case "efficiency":
        return b.efficiency - a.efficiency;
      default:
        return 0;
    }
  });

  const getTrendIcon = (value: number, threshold: number) => {
    if (value >= threshold) {
      return <RiArrowUpLine className="trend-up" />;
    }
    return <RiArrowDownLine className="trend-down" />;
  };

  const getComplianceStatus = (rate: number) => {
    if (rate >= 95) return { status: "excellent", color: "status-excellent" };
    if (rate >= 90) return { status: "good", color: "status-good" };
    if (rate >= 80) return { status: "fair", color: "status-fair" };
    return { status: "poor", color: "status-poor" };
  };

  const tabs = [
    { id: "executive", label: "Executive Dashboard", icon: RiDashboardLine },
    { id: "operational", label: "Operational Analytics", icon: RiBuildingLine },
    { id: "compliance", label: "Compliance Status", icon: RiShieldCheckLine },
    { id: "revenue", label: "Revenue Reports", icon: RiMoneyDollarCircleLine },
    {
      id: "performance",
      label: "Technician Performance",
      icon: RiUserStarLine,
    },
    {
      id: "payments",
      label: "Technician Payments",
      icon: RiMoneyDollarCircleLine,
    },
  ];

  const renderComplianceReport = () => (
    <div className="compliance-report">
      <div className="report-header">
        <div className="header-content">
          <h3>Compliance Status Report</h3>
          <p>Overview of job completion and compliance status</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <RiFilterLine className="filter-icon" />
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="agency">Agencies</option>
              <option value="region">Regions</option>
              <option value="property">Properties</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={handleExportCompliance}>
            <RiDownloadLine /> Export Report
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon compliance">
            <RiShieldCheckLine />
          </div>
          <div className="card-content">
            <h4>
              {realComplianceStats ?
                ((realComplianceStats.overview.completedJobs / realComplianceStats.overview.totalJobs * 100).toFixed(1) + '%') :
                '96.2%'
              }
            </h4>
            <p>Overall Compliance Rate</p>
            {getTrendIcon(
              realComplianceStats ?
                (realComplianceStats.overview.completedJobs / realComplianceStats.overview.totalJobs * 100) :
                96.2,
              95
            )}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon completed">
            <RiCheckboxCircleLine />
          </div>
          <div className="card-content">
            <h4>{realComplianceStats?.overview.completedJobs || 363}</h4>
            <p>Jobs Completed</p>
            {getTrendIcon(realComplianceStats?.overview.completedJobs || 363, 350)}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon overdue">
            <RiCloseLine />
          </div>
          <div className="card-content">
            <h4>{realComplianceStats?.overview.overdueJobs || 36}</h4>
            <p>Overdue Jobs</p>
            {getTrendIcon(realComplianceStats?.overview.overdueJobs || 36, 40)}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon time">
            <RiTimeLine />
          </div>
          <div className="card-content">
            <h4>2.4</h4>
            <p>Avg Completion Days</p>
            {getTrendIcon(2.4, 3)}
          </div>
        </div>
      </div>

      <div className="compliance-table">
        {loadingCompliance ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading compliance data...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Total Jobs</th>
                <th>Completed</th>
                <th>Compliant</th>
                <th>Overdue</th>
                <th>Compliance Rate</th>
                <th>Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompliance.map((item) => {
                const compliance = getComplianceStatus(item.complianceRate);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="name-cell">
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${item.type}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td>{item.totalJobs}</td>
                    <td>
                      <span className="job-count completed">
                        {item.completedJobs}
                      </span>
                    </td>
                    <td>
                      <span className="job-count compliant">
                        {item.compliantJobs}
                      </span>
                    </td>
                    <td>
                      <span className="job-count overdue">
                        {item.overdueJobs}
                      </span>
                    </td>
                    <td>
                      <div className="compliance-rate">
                        <span className={`rate ${compliance.color}`}>
                          {item.complianceRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>{item.avgCompletionTime.toFixed(1)} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderRevenueReport = () => (
    <div className="revenue-report">
      <div className="report-header">
        <div className="header-content">
          <h3>Revenue Reports</h3>
          <p>Financial performance breakdown and analysis</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <RiCalendarLine className="filter-icon" />
            <select
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="filter-group">
            <RiFilterLine className="filter-icon" />
            <select
              value={revenueBreakdown}
              onChange={(e) => setRevenueBreakdown(e.target.value)}
            >
              <option value="agency">By Agency</option>
              <option value="region">By Region</option>
              <option value="jobType">By Job Type</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={handleExportRevenue}>
            <RiDownloadLine /> Export Report
          </button>
        </div>
      </div>

      {loadingRevenue ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading revenue data...</p>
        </div>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon revenue">
                <RiMoneyDollarCircleLine />
              </div>
              <div className="card-content">
                <h4>
                  $
                  {revenueData
                    .reduce((acc, item) => acc + item.amount, 0)
                    .toLocaleString()}
                </h4>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon jobs">
                <RiBarChartBoxLine />
              </div>
              <div className="card-content">
                <h4>
                  {revenueData.reduce((acc, item) => acc + item.jobCount, 0)}
                </h4>
                <p>Total Jobs</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon average">
                <RiLineChartLine />
              </div>
              <div className="card-content">
                <h4>
                  $
                  {(revenueData.reduce((acc, item) => acc + item.avgJobValue, 0) /
                    revenueData.length || 0).toFixed(0)}
                </h4>
                <p>Average Job Value</p>
              </div>
            </div>
          </div>

          <div className="revenue-breakdown">
            <h4>
              Revenue Breakdown -{" "}
              {revenueBreakdown.charAt(0).toUpperCase() +
                revenueBreakdown.slice(1)}
            </h4>
            <div className="breakdown-grid">
              {Object.entries(groupedRevenue).map(([key, data]) => (
                <div key={key} className="breakdown-card">
                  <div className="breakdown-header">
                    <h5>{key}</h5>
                    <span className="revenue-amount">
                      ${data.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="breakdown-stats">
                    <div className="stat">
                      <span className="stat-label">Jobs:</span>
                      <span>{data.jobCount}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Avg Value:</span>
                      <span>${data.avgJobValue.toFixed(0)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Share:</span>
                      <span>
                        {(
                          (data.amount /
                            Object.values(groupedRevenue).reduce(
                              (sum, d) => sum + d.amount,
                              0
                            )) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

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
                    <div className="kpi-value">{executiveDashboard.kpis.today.newJobs}</div>
                    <div className="kpi-label">New Jobs</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.today.growth.newJobs) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.today.growth.newJobs) >= 0 ? '+' : ''}{executiveDashboard.kpis.today.growth.newJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{executiveDashboard.kpis.today.completedJobs}</div>
                    <div className="kpi-label">Completed Jobs</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.today.growth.completedJobs) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.today.growth.completedJobs) >= 0 ? '+' : ''}{executiveDashboard.kpis.today.growth.completedJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">${executiveDashboard.kpis.today.revenue.toLocaleString()}</div>
                    <div className="kpi-label">Revenue</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.today.growth.revenue) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.today.growth.revenue) >= 0 ? '+' : ''}{executiveDashboard.kpis.today.growth.revenue}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="kpi-period">
                <h5>This Week</h5>
                <div className="kpi-cards">
                  <div className="kpi-card">
                    <div className="kpi-value">{executiveDashboard.kpis.thisWeek.newJobs}</div>
                    <div className="kpi-label">New Jobs</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.thisWeek.growth.newJobs) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.thisWeek.growth.newJobs) >= 0 ? '+' : ''}{executiveDashboard.kpis.thisWeek.growth.newJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{executiveDashboard.kpis.thisWeek.completedJobs}</div>
                    <div className="kpi-label">Completed Jobs</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.thisWeek.growth.completedJobs) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.thisWeek.growth.completedJobs) >= 0 ? '+' : ''}{executiveDashboard.kpis.thisWeek.growth.completedJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">${executiveDashboard.kpis.thisWeek.revenue.toLocaleString()}</div>
                    <div className="kpi-label">Revenue</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.thisWeek.growth.revenue) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.thisWeek.growth.revenue) >= 0 ? '+' : ''}{executiveDashboard.kpis.thisWeek.growth.revenue}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="kpi-period">
                <h5>This Month</h5>
                <div className="kpi-cards">
                  <div className="kpi-card">
                    <div className="kpi-value">{executiveDashboard.kpis.thisMonth.newJobs}</div>
                    <div className="kpi-label">New Jobs</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.thisMonth.growth.newJobs) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.thisMonth.growth.newJobs) >= 0 ? '+' : ''}{executiveDashboard.kpis.thisMonth.growth.newJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">{executiveDashboard.kpis.thisMonth.completedJobs}</div>
                    <div className="kpi-label">Completed Jobs</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.thisMonth.growth.completedJobs) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.thisMonth.growth.completedJobs) >= 0 ? '+' : ''}{executiveDashboard.kpis.thisMonth.growth.completedJobs}%
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-value">${executiveDashboard.kpis.thisMonth.revenue.toLocaleString()}</div>
                    <div className="kpi-label">Revenue</div>
                    <div className={`kpi-growth ${parseFloat(executiveDashboard.kpis.thisMonth.growth.revenue) >= 0 ? 'positive' : 'negative'}`}>
                      {parseFloat(executiveDashboard.kpis.thisMonth.growth.revenue) >= 0 ? '+' : ''}{executiveDashboard.kpis.thisMonth.growth.revenue}%
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
                  <div className="health-value">{executiveDashboard.businessHealth.totalActiveEntities.total}</div>
                  <div className="health-label">Total Active Entities</div>
                  <div className="health-breakdown">
                    {executiveDashboard.businessHealth.totalActiveEntities.agencies} Agencies • {' '}
                    {executiveDashboard.businessHealth.totalActiveEntities.properties} Properties • {' '}
                    {executiveDashboard.businessHealth.totalActiveEntities.technicians} Technicians
                  </div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiCheckboxCircleLine />
                </div>
                <div className="health-content">
                  <div className="health-value">{executiveDashboard.businessHealth.jobCompletionRate.toFixed(1)}%</div>
                  <div className="health-label">Job Completion Rate</div>
                  <div className={`health-status ${executiveDashboard.businessHealth.jobCompletionRate >= 90 ? 'excellent' : executiveDashboard.businessHealth.jobCompletionRate >= 80 ? 'good' : 'needs-improvement'}`}>
                    {executiveDashboard.businessHealth.jobCompletionRate >= 90 ? 'Excellent' : executiveDashboard.businessHealth.jobCompletionRate >= 80 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiMoneyDollarCircleLine />
                </div>
                <div className="health-content">
                  <div className="health-value">${executiveDashboard.businessHealth.avgJobValue.toLocaleString()}</div>
                  <div className="health-label">Average Job Value</div>
                  <div className="health-trend">Monthly Average</div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiStarLine />
                </div>
                <div className="health-content">
                  <div className="health-value">{executiveDashboard.businessHealth.customerSatisfaction.toFixed(1)}/5</div>
                  <div className="health-label">Customer Satisfaction</div>
                  <div className={`health-status ${executiveDashboard.businessHealth.customerSatisfaction >= 4.5 ? 'excellent' : executiveDashboard.businessHealth.customerSatisfaction >= 4.0 ? 'good' : 'needs-improvement'}`}>
                    {executiveDashboard.businessHealth.customerSatisfaction >= 4.5 ? 'Excellent' : executiveDashboard.businessHealth.customerSatisfaction >= 4.0 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">
                  <RiUserStarLine />
                </div>
                <div className="health-content">
                  <div className="health-value">{executiveDashboard.businessHealth.technicianUtilization.toFixed(1)}%</div>
                  <div className="health-label">Technician Utilization</div>
                  <div className={`health-status ${executiveDashboard.businessHealth.technicianUtilization >= 80 ? 'excellent' : executiveDashboard.businessHealth.technicianUtilization >= 60 ? 'good' : 'needs-improvement'}`}>
                    {executiveDashboard.businessHealth.technicianUtilization >= 80 ? 'Excellent' : executiveDashboard.businessHealth.technicianUtilization >= 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {(executiveDashboard.alerts.critical > 0 || executiveDashboard.alerts.warnings > 0 || executiveDashboard.alerts.info > 0) && (
            <div className="alerts-section">
              <h4>System Alerts</h4>
              <div className="alerts-grid">
                {executiveDashboard.alerts.critical > 0 && (
                  <div className="alert critical">
                    <RiCloseLine className="alert-icon" />
                    <div className="alert-content">
                      <div className="alert-count">{executiveDashboard.alerts.critical}</div>
                      <div className="alert-label">Overdue Jobs</div>
                    </div>
                  </div>
                )}
                {executiveDashboard.alerts.warnings > 0 && (
                  <div className="alert warning">
                    <RiTimeLine className="alert-icon" />
                    <div className="alert-content">
                      <div className="alert-count">{executiveDashboard.alerts.warnings}</div>
                      <div className="alert-label">Pending Payments</div>
                    </div>
                  </div>
                )}
                {executiveDashboard.alerts.info > 0 && (
                  <div className="alert info">
                    <RiBuildingLine className="alert-icon" />
                    <div className="alert-content">
                      <div className="alert-count">{executiveDashboard.alerts.info}</div>
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
                <span className="summary-value">{operationalAnalytics.resourceUtilization.totalActiveTechnicians}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Utilization:</span>
                <span className="summary-value">{operationalAnalytics.resourceUtilization.avgUtilization}%</span>
              </div>
            </div>

            <div className="technician-workload">
              <h5>Technician Workload Distribution</h5>
              <div className="workload-grid">
                {operationalAnalytics.resourceUtilization.technicianWorkload.slice(0, 8).map((tech, index) => (
                  <div key={index} className="workload-card">
                    <div className="workload-header">
                      <strong>{tech.name}</strong>
                      <span className="trade-type">{tech.tradeType}</span>
                    </div>
                    <div className="workload-metrics">
                      <div className="metric-row">
                        <span>Active Jobs:</span>
                        <span className="metric-value">{tech.activeJobs}</span>
                      </div>
                      <div className="metric-row">
                        <span>Completed This Month:</span>
                        <span className="metric-value">{tech.completedThisMonth}</span>
                      </div>
                      <div className="metric-row">
                        <span>Utilization:</span>
                        <span className={`metric-value ${tech.utilizationRate >= 80 ? 'high' : tech.utilizationRate >= 60 ? 'medium' : 'low'}`}>
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
                  {operationalAnalytics.jobAnalytics.typeDistribution.map((jobType, index) => (
                    <div key={index} className="job-type-item">
                      <div className="job-type-header">
                        <span className="job-type-name">{jobType.jobType}</span>
                        <span className="job-type-count">{jobType.count} jobs</span>
                      </div>
                      <div className="job-type-metrics">
                        <div className="metric">
                          <span>Completion Rate:</span>
                          <span className="value">{jobType.completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="metric">
                          <span>Avg Completion Time:</span>
                          <span className="value">{jobType.avgCompletionTime?.toFixed(1) || 'N/A'} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card">
                <h5>Time to Completion Analysis</h5>
                <div className="completion-time-list">
                  {operationalAnalytics.jobAnalytics.timeToCompletion.map((item, index) => (
                    <div key={index} className="completion-item">
                      <div className="completion-header">
                        <span className="job-type">{item.jobType}</span>
                        <span className="avg-time">{item.avgCompletionTime} days avg</span>
                      </div>
                      <div className="completion-range">
                        <span>Range: {item.minCompletionTime} - {item.maxCompletionTime} days</span>
                        <span className="sample-size">({item.count} jobs)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Property Insights Section */}
          <div className="property-insights-section">
            <h4>Property Insights</h4>
            <div className="insights-summary">
              <span>Properties with jobs: {operationalAnalytics.propertyInsights.totalPropertiesWithJobs}</span>
            </div>
            <div className="property-frequency">
              <h5>High-Activity Properties</h5>
              <div className="property-list">
                {operationalAnalytics.propertyInsights.jobFrequency.slice(0, 10).map((property, index) => (
                  <div key={index} className="property-item">
                    <div className="property-address">
                      {property.address?.street}, {property.address?.suburb} {property.address?.postcode}
                    </div>
                    <div className="property-stats">
                      <span>Total: {property.totalJobs}</span>
                      <span>Recent: {property.recentJobs}</span>
                      <span>Avg/Month: {property.avgJobsPerMonth.toFixed(1)}</span>
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
              {operationalAnalytics.regionalPerformance.slice(0, 8).map((region, index) => (
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
                      <span className={`completion-rate ${region.completionRate >= 90 ? 'excellent' : region.completionRate >= 80 ? 'good' : 'needs-improvement'}`}>
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

  const renderPerformanceReport = () => (
    <div className="performance-report">
      <div className="report-header">
        <div className="header-content">
          <h3>Technician Performance</h3>
          <p>Individual performance metrics and ratings</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <RiFilterLine className="filter-icon" />
            <select
              value={technicianSort}
              onChange={(e) => setTechnicianSort(e.target.value)}
            >
              <option value="rating">By Rating</option>
              <option value="jobs">By Jobs Completed</option>
              <option value="revenue">By Revenue</option>
              <option value="efficiency">By Efficiency</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={handleExportTechnicianPerformance}>
            <RiDownloadLine /> Export Report
          </button>
        </div>
      </div>

      {loadingTechnicianPerformance ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading technician performance data...</p>
        </div>
      ) : (
        <div className="performance-grid">
          {sortedTechnicians.map((tech) => (
            <div key={tech.id} className="performance-card">
              <div className="card-header">
                <div className="tech-info">
                  <h4>{tech.name}</h4>
                  <span className="trade-type">{tech.tradeType}</span>
                </div>
                <div className="rating">
                  <RiStarLine className="star-icon" />
                  <span>{tech.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="performance-metrics">
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Jobs Completed</span>
                    <span className="metric-value">{tech.jobsCompleted}</span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-fill jobs"
                      style={{ width: `${(tech.jobsCompleted / 120) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Avg Completion Time</span>
                    <span className="metric-value">
                      {tech.avgCompletionTime.toFixed(1)} days
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-fill time"
                      style={{
                        width: `${
                          Math.max(0, (4 - tech.avgCompletionTime) / 4) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">On-Time Rate</span>
                    <span className="metric-value">
                      {tech.onTimeRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-fill ontime"
                      style={{ width: `${tech.onTimeRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Revenue Generated</span>
                    <span className="metric-value">
                      ${tech.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-fill revenue"
                      style={{ width: `${(tech.totalRevenue / 40000) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Efficiency Score</span>
                    <span className="metric-value">
                      {tech.efficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-fill efficiency"
                      style={{ width: `${tech.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
        {activeTab === "compliance" && renderComplianceReport()}
        {activeTab === "revenue" && renderRevenueReport()}
        {activeTab === "performance" && renderPerformanceReport()}
        {activeTab === "payments" && <TechnicianPaymentsReport />}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
