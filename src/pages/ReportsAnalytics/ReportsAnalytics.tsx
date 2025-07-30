import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiBarChartBoxLine,
  RiLineChartLine,
  RiUserStarLine,
  RiShieldCheckLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiFilterLine,
  RiDownloadLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiStarLine,
  RiLoader4Line,
} from "react-icons/ri";
import { agencyService } from "../../services/agencyService";
import "./ReportsAnalytics.scss";

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
  const [activeTab, setActiveTab] = useState("compliance");
  const [revenueFilter, setRevenueFilter] = useState("month");
  const [revenueBreakdown, setRevenueBreakdown] = useState("agency");
  const [technicianSort, setTechnicianSort] = useState("rating");

  // Revenue report state
  const [revenueData, setRevenueData] = useState<{
    overallStatistics: {
      totalAgencies: number;
      totalJobs: number;
      completedJobs: number;
      overdueJobs: number;
      pendingJobs: number;
      scheduledJobs: number;
      totalRevenue: number;
      completedRevenue: number;
      pendingRevenue: number;
      scheduledRevenue: number;
      averageJobValue: number;
      completionRate: number;
    };
    agencyBreakdown: Array<{
      agency: {
        id: string;
        companyName: string;
        contactPerson: string;
        email: string;
        region: string;
        status: string;
        abn: string;
        outstandingAmount: number;
        totalProperties: number;
        joinedDate: string;
      };
      jobStatistics: {
        totalJobs: number;
        completedJobs: number;
        overdueJobs: number;
        pendingJobs: number;
        scheduledJobs: number;
        completionRate: number;
      };
      revenueStatistics: {
        totalRevenue: number;
        completedRevenue: number;
        pendingRevenue: number;
        scheduledRevenue: number;
        averageJobValue: number;
      };
    }>;
  } | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // Agency breakdown state for compliance page
  const [agencyBreakdownData, setAgencyBreakdownData] = useState<{
    agencies: Array<{
      id: string;
      companyName: string;
      contactPerson: string;
      email: string;
      phone: string;
      region: string;
      compliance: string;
      status: string;
      abn: string;
      outstandingAmount: number;
      totalProperties: number;
      lastLogin: string | null;
      joinedDate: string;
      createdAt: string;
      jobStatistics: {
        totalJobs: number;
        completedJobs: number;
        overdueJobs: number;
        pendingJobs: number;
        scheduledJobs: number;
        totalRevenue: number;
        completedRevenue: number;
        averageJobValue: number;
      };
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } | null>(null);
  const [agencyBreakdownLoading, setAgencyBreakdownLoading] = useState(false);
  const [agencyBreakdownError, setAgencyBreakdownError] = useState<
    string | null
  >(null);

  // Fetch revenue report data
  useEffect(() => {
    const fetchRevenueData = async () => {
      setRevenueLoading(true);
      setRevenueError(null);

      try {
        const result = await agencyService.getRevenueReport();
        if (result.success && result.data) {
          setRevenueData(result.data);
        } else {
          setRevenueError(result.message || "Failed to fetch revenue data");
        }
      } catch (error) {
        setRevenueError("An error occurred while fetching revenue data");
      } finally {
        setRevenueLoading(false);
      }
    };

    if (activeTab === "revenue") {
      fetchRevenueData();
    }
  }, [activeTab]);

  // Fetch agency breakdown data for compliance page
  useEffect(() => {
    const fetchAgencyBreakdownData = async () => {
      setAgencyBreakdownLoading(true);
      setAgencyBreakdownError(null);

      try {
        const result = await agencyService.getAgenciesWithStats({
          page: 1,
          limit: 10,
        });
        if (result.success && result.data) {
          setAgencyBreakdownData(result.data);
        } else {
          setAgencyBreakdownError(
            result.message || "Failed to fetch agency data"
          );
        }
      } catch (error) {
        setAgencyBreakdownError("An error occurred while fetching agency data");
      } finally {
        setAgencyBreakdownLoading(false);
      }
    };

    if (activeTab === "compliance") {
      fetchAgencyBreakdownData();
    }
  }, [activeTab]);

  const technicianData: TechnicianPerformance[] = [
    {
      id: "1",
      name: "John Smith",
      tradeType: "Plumber",
      jobsCompleted: 89,
      avgCompletionTime: 2.1,
      rating: 4.8,
      onTimeRate: 94.5,
      totalRevenue: 31150,
      efficiency: 96.2,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      tradeType: "Electrician",
      jobsCompleted: 76,
      avgCompletionTime: 1.9,
      rating: 4.7,
      onTimeRate: 96.1,
      totalRevenue: 28400,
      efficiency: 97.8,
    },
    {
      id: "3",
      name: "Mike Davis",
      tradeType: "HVAC",
      jobsCompleted: 54,
      avgCompletionTime: 3.2,
      rating: 4.6,
      onTimeRate: 88.9,
      totalRevenue: 37800,
      efficiency: 91.5,
    },
    {
      id: "4",
      name: "Emily Brown",
      tradeType: "General Maintenance",
      jobsCompleted: 112,
      avgCompletionTime: 1.5,
      rating: 4.9,
      onTimeRate: 98.2,
      totalRevenue: 22400,
      efficiency: 98.5,
    },
  ];

  // Process revenue data for breakdown
  const groupedRevenue =
    revenueData?.agencyBreakdown?.reduce(
      (
        acc: Record<
          string,
          {
            amount: number;
            jobCount: number;
            completedJobs: number;
            avgJobValue: number;
          }
        >,
        item
      ) => {
        const key =
          item.agency[
            revenueBreakdown === "agency"
              ? "companyName"
              : revenueBreakdown === "region"
              ? "region"
              : "companyName"
          ];
        if (!acc[key]) {
          acc[key] = {
            amount: 0,
            jobCount: 0,
            completedJobs: 0,
            avgJobValue: 0,
          };
        }
        acc[key].amount += item.revenueStatistics.totalRevenue;
        acc[key].jobCount += item.jobStatistics.totalJobs;
        acc[key].completedJobs += item.jobStatistics.completedJobs;
        acc[key].avgJobValue = acc[key].amount / Math.max(acc[key].jobCount, 1);
        return acc;
      },
      {} as Record<
        string,
        {
          amount: number;
          jobCount: number;
          completedJobs: number;
          avgJobValue: number;
        }
      >
    ) || {};

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

  const tabs = [
    { id: "compliance", label: "Compliance Status", icon: RiShieldCheckLine },
    { id: "revenue", label: "Revenue Reports", icon: RiMoneyDollarCircleLine },
    {
      id: "performance",
      label: "Technician Performance",
      icon: RiUserStarLine,
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
          <button className="btn-secondary">
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
              {agencyBreakdownData ? agencyBreakdownData.agencies.length : 0}
            </h4>
            <p>Total Agencies</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon jobs">
            <RiBarChartBoxLine />
          </div>
          <div className="card-content">
            <h4>
              {agencyBreakdownData
                ? agencyBreakdownData.agencies.reduce(
                    (sum, agency) => sum + agency.jobStatistics.totalJobs,
                    0
                  )
                : 0}
            </h4>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon completed">
            <RiCheckboxCircleLine />
          </div>
          <div className="card-content">
            <h4>
              {agencyBreakdownData
                ? agencyBreakdownData.agencies.reduce(
                    (sum, agency) => sum + agency.jobStatistics.completedJobs,
                    0
                  )
                : 0}
            </h4>
            <p>Completed Jobs</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon overdue">
            <RiCloseCircleLine />
          </div>
          <div className="card-content">
            <h4>
              {agencyBreakdownData
                ? agencyBreakdownData.agencies.reduce(
                    (sum, agency) => sum + agency.jobStatistics.overdueJobs,
                    0
                  )
                : 0}
            </h4>
            <p>Overdue Jobs</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon pending">
            <RiTimeLine />
          </div>
          <div className="card-content">
            <h4>
              {agencyBreakdownData
                ? agencyBreakdownData.agencies.reduce(
                    (sum, agency) => sum + agency.jobStatistics.pendingJobs,
                    0
                  )
                : 0}
            </h4>
            <p>Pending Jobs</p>
          </div>
        </div>
      </div>

      {/* Agency Breakdown Section */}
      <div className="agency-breakdown-section">
        <h4>Agency Breakdown</h4>
        {agencyBreakdownLoading ? (
          <div className="loading-state">
            <RiLoader4Line className="loading-icon" />
            <p>Loading agency data...</p>
          </div>
        ) : agencyBreakdownError ? (
          <div className="error-state">
            <p>Error: {agencyBreakdownError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setAgencyBreakdownError(null);
                setAgencyBreakdownData(null);
              }}
            >
              Retry
            </button>
          </div>
        ) : agencyBreakdownData ? (
          <div className="agency-breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Agency</th>
                  <th>Region</th>
                  <th>Compliance</th>
                  <th>Status</th>
                  <th>Total Jobs</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Overdue</th>
                  <th>Total Revenue</th>
                  <th>Avg Job Value</th>
                </tr>
              </thead>
              <tbody>
                {agencyBreakdownData.agencies.map((agency) => (
                  <tr key={agency.id}>
                    <td>
                      <div className="agency-info">
                        <Link
                          to={`/agencies/${agency.id}`}
                          className="agency-link"
                        >
                          <strong>{agency.companyName}</strong>
                        </Link>
                        <span className="contact-person">
                          {agency.contactPerson}
                        </span>
                      </div>
                    </td>
                    <td>{agency.region}</td>
                    <td>
                      <span
                        className={`compliance-badge ${agency.compliance
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {agency.compliance}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${agency.status.toLowerCase()}`}
                      >
                        {agency.status}
                      </span>
                    </td>
                    <td>{agency.jobStatistics.totalJobs}</td>
                    <td>
                      <span className="job-count completed">
                        {agency.jobStatistics.completedJobs}
                      </span>
                    </td>
                    <td>
                      <span className="job-count pending">
                        {agency.jobStatistics.pendingJobs}
                      </span>
                    </td>
                    <td>
                      <span className="job-count overdue">
                        {agency.jobStatistics.overdueJobs}
                      </span>
                    </td>
                    <td>
                      ${agency.jobStatistics.totalRevenue.toLocaleString()}
                    </td>
                    <td>
                      ${agency.jobStatistics.averageJobValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No agency data available</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRevenueReport = () => {
    if (revenueLoading) {
      return (
        <div className="revenue-report">
          <div className="loading-state">
            <RiLoader4Line className="loading-icon" />
            <p>Loading revenue data...</p>
          </div>
        </div>
      );
    }

    if (revenueError) {
      return (
        <div className="revenue-report">
          <div className="error-state">
            <p>Error: {revenueError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setRevenueError(null);
                setRevenueData(null);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!revenueData) {
      return (
        <div className="revenue-report">
          <div className="empty-state">
            <p>No revenue data available</p>
          </div>
        </div>
      );
    }

    const { overallStatistics, agencyBreakdown } = revenueData;

    return (
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
              </select>
            </div>
            <button className="btn-secondary">
              <RiDownloadLine /> Export Report
            </button>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon revenue">
              <RiMoneyDollarCircleLine />
            </div>
            <div className="card-content">
              <h4>${overallStatistics.totalRevenue.toLocaleString()}</h4>
              <p>Total Revenue</p>
              {getTrendIcon(overallStatistics.totalRevenue, 0)}
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon jobs">
              <RiBarChartBoxLine />
            </div>
            <div className="card-content">
              <h4>{overallStatistics.totalJobs}</h4>
              <p>Total Jobs</p>
              {getTrendIcon(overallStatistics.totalJobs, 0)}
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon average">
              <RiLineChartLine />
            </div>
            <div className="card-content">
              <h4>${overallStatistics.averageJobValue.toLocaleString()}</h4>
              <p>Average Job Value</p>
              {getTrendIcon(overallStatistics.averageJobValue, 0)}
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon growth">
              <RiArrowUpLine />
            </div>
            <div className="card-content">
              <h4>{overallStatistics.completionRate.toFixed(1)}%</h4>
              <p>Completion Rate</p>
              {getTrendIcon(overallStatistics.completionRate, 0)}
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
                    <span className="stat-label">Total Jobs</span>
                    <span>{data.jobCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Completed</span>
                    <span>{data.completedJobs}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Revenue</span>
                    <span>${data.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
          <button className="btn-secondary">
            <RiDownloadLine /> Export Report
          </button>
        </div>
      </div>

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
        {activeTab === "compliance" && renderComplianceReport()}
        {activeTab === "revenue" && renderRevenueReport()}
        {activeTab === "performance" && renderPerformanceReport()}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
