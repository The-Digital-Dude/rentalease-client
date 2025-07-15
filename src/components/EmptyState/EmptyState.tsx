import React from 'react';
import type { IconType } from 'react-icons';
import './EmptyState.scss';

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-icon">
          <Icon />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {action && (
        <button
          className={`empty-action-btn ${action.variant || 'primary'}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 