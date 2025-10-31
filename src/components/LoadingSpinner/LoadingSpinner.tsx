import React from "react";
import "./LoadingSpinner.scss";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  variant?: "primary" | "secondary" | "light";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  text,
  variant = "primary",
  className = "",
}) => {
  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${size} ${variant}`}>
        <div className="spinner-ring">
          <div className="spinner-segment"></div>
          <div className="spinner-segment"></div>
          <div className="spinner-segment"></div>
          <div className="spinner-segment"></div>
        </div>
        <div className="spinner-inner">
          <div className="spinner-dot"></div>
        </div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;