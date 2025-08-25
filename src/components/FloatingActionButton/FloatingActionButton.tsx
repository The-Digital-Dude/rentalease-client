import React from 'react';
import { MdAdd } from 'react-icons/md';
import './FloatingActionButton.scss';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <MdAdd />,
  tooltip = "Compose new email",
  disabled = false
}) => {
  return (
    <button
      className={`floating-action-button ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  );
};