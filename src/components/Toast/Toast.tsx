import React, { useEffect } from "react";
import { RiCheckLine, RiErrorWarningLine, RiCloseLine } from "react-icons/ri";
import "./Toast.scss";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <RiCheckLine />;
      case "error":
        return <RiErrorWarningLine />;
      case "warning":
        return <RiErrorWarningLine />;
      case "info":
        return <RiErrorWarningLine />;
      default:
        return <RiCheckLine />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <RiCloseLine />
      </button>
    </div>
  );
};

export default Toast;
