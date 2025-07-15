import React from 'react';
import './StatsGrid.scss';

interface StatItem {
  value: string | number;
  label: string;
  count?: string | number;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

interface StatsGridProps {
  stats: StatItem[];
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, className = '' }) => {
  const formatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className={`stats-grid ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.type || 'info'}`}>
          <div className="stat-value">{formatValue(stat.value)}</div>
          <div className="stat-label">{stat.label}</div>
          {stat.count && (
            <div className="stat-count">{formatValue(stat.count)}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid; 