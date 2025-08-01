import React from "react";
import { RiCheckboxCircleLine, RiStarLine } from "react-icons/ri";
import "./JobProfileStats.scss";

interface JobProfileStatsProps {
  job: {
    status: string;
    priority: string;
  };
  statistics: {
    isOverdue: boolean;
    daysUntilDue: number;
  };
}

const JobProfileStats: React.FC<JobProfileStatsProps> = ({
  job,
  statistics,
}) => {
  const statsCards = [
    {
      title: "Job Status",
      value: job.status,
      change: statistics.isOverdue
        ? `${Math.abs(statistics.daysUntilDue)} days overdue`
        : `${statistics.daysUntilDue} days until due`,
      changeType: statistics.isOverdue
        ? "negative"
        : statistics.daysUntilDue <= 1
        ? "warning"
        : "positive",
      icon: RiCheckboxCircleLine,
      color: "blue",
    },
    {
      title: "Priority",
      value: job.priority,
      change: "Job priority level",
      changeType: "neutral",
      icon: RiStarLine,
      color:
        job.priority === "Urgent"
          ? "red"
          : job.priority === "High"
          ? "orange"
          : "green",
    },
  ];

  return (
    <div className="stats-grid">
      {statsCards.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.color}`}>
          <div className="stat-icon">
            <stat.icon />
          </div>
          <div className="stat-content">
            <h3>{stat.value}</h3>
            <p className="stat-title">{stat.title}</p>
            <span className={`stat-change ${stat.changeType}`}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobProfileStats;
