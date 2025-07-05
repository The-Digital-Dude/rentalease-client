import { useState } from "react";
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
  RiStarLine
} from "react-icons/ri";
import "./ReportsAnalytics.scss";

interface ComplianceData {
  id: string;
  name: string;
  type: 'agency' | 'region' | 'property';
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
  const [activeTab, setActiveTab] = useState("compliance");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("month");
  const [revenueBreakdown, setRevenueBreakdown] = useState("agency");
  const [technicianSort, setTechnicianSort] = useState("rating");

  // Mock data - in real app, this would come from an API
  const complianceData: ComplianceData[] = [
    {
      id: "1",
      name: "Premier Property Solutions",
      type: "agency",
      totalJobs: 145,
      completedJobs: 132,
      compliantJobs: 128,
      overdueJobs: 13,
      complianceRate: 97.0,
      avgCompletionTime: 2.3
    },
    {
      id: "2",
      name: "North Zone",
      type: "region",
      totalJobs: 89,
      completedJobs: 82,
      compliantJobs: 79,
      overdueJobs: 7,
      complianceRate: 96.3,
      avgCompletionTime: 2.1
    },
    {
      id: "3",
      name: "Luxury Apartments CBD",
      type: "property",
      totalJobs: 67,
      completedJobs: 61,
      compliantJobs: 58,
      overdueJobs: 6,
      complianceRate: 95.1,
      avgCompletionTime: 2.8
    },
    {
      id: "4",
      name: "Elite Realty Group",
      type: "agency",
      totalJobs: 98,
      completedJobs: 88,
      compliantJobs: 83,
      overdueJobs: 10,
      complianceRate: 94.3,
      avgCompletionTime: 2.5
    }
  ];

  const revenueData: RevenueData[] = [
    {
      period: "2024-01",
      agency: "Premier Property Solutions",
      region: "North Zone",
      jobType: "Plumbing",
      amount: 15750,
      jobCount: 45,
      avgJobValue: 350
    },
    {
      period: "2024-01",
      agency: "Elite Realty Group",
      region: "South Zone",
      jobType: "Electrical",
      amount: 12400,
      jobCount: 31,
      avgJobValue: 400
    },
    {
      period: "2024-01",
      agency: "Premier Property Solutions",
      region: "East Zone",
      jobType: "HVAC",
      amount: 18900,
      jobCount: 27,
      avgJobValue: 700
    },
    {
      period: "2024-01",
      agency: "Elite Realty Group",
      region: "Central Zone",
      jobType: "General Maintenance",
      amount: 8750,
      jobCount: 35,
      avgJobValue: 250
    }
  ];

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
      efficiency: 96.2
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
      efficiency: 97.8
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
      efficiency: 91.5
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
      efficiency: 98.5
    }
  ];

  const filteredCompliance = complianceData.filter(item => {
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
    { id: "compliance", label: "Compliance Status", icon: RiShieldCheckLine },
    { id: "revenue", label: "Revenue Reports", icon: RiMoneyDollarCircleLine },
    { id: "performance", label: "Technician Performance", icon: RiUserStarLine },
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
            <h4>96.2%</h4>
            <p>Overall Compliance Rate</p>
            {getTrendIcon(96.2, 95)}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon completed">
            <RiCheckboxCircleLine />
          </div>
          <div className="card-content">
            <h4>363</h4>
            <p>Jobs Completed</p>
            {getTrendIcon(363, 350)}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon overdue">
            <RiCloseCircleLine />
          </div>
          <div className="card-content">
            <h4>36</h4>
            <p>Overdue Jobs</p>
            {getTrendIcon(36, 40)}
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
            {filteredCompliance.map(item => {
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
                    <span className="job-count completed">{item.completedJobs}</span>
                  </td>
                  <td>
                    <span className="job-count compliant">{item.compliantJobs}</span>
                  </td>
                  <td>
                    <span className="job-count overdue">{item.overdueJobs}</span>
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
            <h4>$55,800</h4>
            <p>Total Revenue</p>
            {getTrendIcon(55800, 50000)}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon jobs">
            <RiBarChartBoxLine />
          </div>
          <div className="card-content">
            <h4>138</h4>
            <p>Total Jobs</p>
            {getTrendIcon(138, 130)}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon average">
            <RiLineChartLine />
          </div>
          <div className="card-content">
            <h4>$404</h4>
            <p>Average Job Value</p>
            {getTrendIcon(404, 400)}
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon growth">
            <RiArrowUpLine />
          </div>
          <div className="card-content">
            <h4>+12.5%</h4>
            <p>Growth Rate</p>
            {getTrendIcon(12.5, 10)}
          </div>
        </div>
      </div>

      <div className="revenue-breakdown">
        <h4>Revenue Breakdown - {revenueBreakdown.charAt(0).toUpperCase() + revenueBreakdown.slice(1)}</h4>
        <div className="breakdown-grid">
          {Object.entries(groupedRevenue).map(([key, data]) => (
            <div key={key} className="breakdown-card">
              <div className="breakdown-header">
                <h5>{key}</h5>
                <span className="revenue-amount">${data.amount.toLocaleString()}</span>
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
                    {((data.amount / Object.values(groupedRevenue).reduce((sum, d) => sum + d.amount, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
          <button className="btn-secondary">
            <RiDownloadLine /> Export Report
          </button>
        </div>
      </div>

      <div className="performance-grid">
        {sortedTechnicians.map(tech => (
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
                  <span className="metric-value">{tech.avgCompletionTime.toFixed(1)} days</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill time" 
                    style={{ width: `${Math.max(0, (4 - tech.avgCompletionTime) / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">On-Time Rate</span>
                  <span className="metric-value">{tech.onTimeRate.toFixed(1)}%</span>
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
                  <span className="metric-value">${tech.totalRevenue.toLocaleString()}</span>
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
                  <span className="metric-value">{tech.efficiency.toFixed(1)}%</span>
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
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
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