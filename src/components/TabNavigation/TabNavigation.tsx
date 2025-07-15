import React from 'react';
import type { IconType } from 'react-icons';
import './TabNavigation.scss';

export interface TabItem {
  id: string;
  label: string;
  icon: IconType;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`tab-navigation ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
          >
            <Icon className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation; 