import React from 'react';
import { MdMenu, MdMenuOpen } from 'react-icons/md';
import { useSidebar } from '../../contexts/SidebarContext';
import './SidebarToggle.scss';

export const SidebarToggle: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <button
      className="sidebar-toggle-btn"
      onClick={toggleSidebar}
      title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {isCollapsed ? <MdMenuOpen /> : <MdMenu />}
    </button>
  );
};