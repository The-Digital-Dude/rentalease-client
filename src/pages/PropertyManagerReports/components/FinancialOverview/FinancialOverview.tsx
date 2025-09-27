import {
  RiMoneyDollarCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from "react-icons/ri";
import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";

import type { PropertyManagerFinancial } from "../../../../services/propertyManagerReportService";
import "./FinancialOverview.scss";

interface FinancialOverviewProps {
  data: PropertyManagerFinancial | null;
}

const FinancialOverview = ({ data }: FinancialOverviewProps) => {
  if (!data) {
    return (
      <div className="financial-overview">
        <div className="no-data">
          <RiMoneyDollarCircleLine size={48} />
          <h3>No Financial Data</h3>
          <p>
            No financial information available for your assigned properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-overview">
      <div className="financial-header">
        <h3>Financial Overview</h3>
        <p>Cost analysis and spending breakdown for your properties</p>
      </div>

      <div className="financial-summary">
        <div className="summary-card expenses">
          <div className="summary-value expenses">
            ${data.overview.totalCost.toLocaleString()}
          </div>
          <div className="summary-label">Total Expenses</div>
          <div className="summary-change negative">
            <IoIosTrendingUp />
            Monthly expense
          </div>
        </div>
        <div className="summary-card profit">
          <div className="summary-value profit">
            ${Math.round(data.overview.averageJobCost).toLocaleString()}
          </div>
          <div className="summary-label">Average Job Cost</div>
          <div className="summary-change positive">
            <IoIosTrendingDown />
            Per job average
          </div>
        </div>
        <div className="summary-card revenue">
          <div className="summary-value revenue">{data.overview.totalJobs}</div>
          <div className="summary-label">Total Jobs</div>
          <div className="summary-change positive">
            <RiArrowUpLine />
            Completed jobs
          </div>
        </div>
      </div>

      <div className="financial-metrics">
        <div className="metric-card">
          <div className="metric-value">
            ${(data.overview.totalCost / 12).toFixed(0)}
          </div>
          <div className="metric-label">Monthly Average</div>
          <div className="metric-trend positive">
            <RiArrowUpLine />
            +5.2%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {Math.round(data.overview.totalJobs / 12)}
          </div>
          <div className="metric-label">Jobs per Month</div>
          <div className="metric-trend positive">
            <RiArrowUpLine />
            +12.1%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            ${(data.overview.totalCost / data.overview.totalJobs).toFixed(0)}
          </div>
          <div className="metric-label">Cost Efficiency</div>
          <div className="metric-trend negative">
            <RiArrowDownLine />
            -2.8%
          </div>
        </div>
      </div>

      <div className="financial-charts">
        <div className="chart-container">
          <h4>Monthly Spending Trend</h4>
          <div className="chart-placeholder">
            Chart visualization will be implemented here
          </div>
        </div>
        <div className="chart-container">
          <h4>Cost by Job Type</h4>
          <div className="chart-placeholder">
            Job type breakdown chart will be implemented here
          </div>
        </div>
      </div>

      {data.costByJobType.length > 0 && (
        <div className="recent-transactions">
          <h4>Cost Breakdown by Job Type</h4>
          <div className="transactions-list">
            {data.costByJobType.slice(0, 8).map((jobType, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-icon expense">
                  <RiMoneyDollarCircleLine />
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">
                    {jobType.jobType}
                  </div>
                  <div className="transaction-category">
                    {jobType.jobCount} jobs completed
                  </div>
                </div>
                <div className="transaction-date">
                  Avg: ${Math.round(jobType.totalCost / jobType.jobCount)}
                </div>
                <div className="transaction-amount expense">
                  ${jobType.totalCost.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          {data.costByJobType.length > 8 && (
            <div className="view-all-transactions">
              <button className="view-all-button">
                View All Job Types ({data.costByJobType.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialOverview;
