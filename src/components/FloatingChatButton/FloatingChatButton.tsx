import React, { useState, useEffect } from 'react';
import { RiMessage3Line, RiCloseLine, RiNotification3Line } from 'react-icons/ri';
import './FloatingChatButton.scss';

interface FloatingChatButtonProps {
  isOpen: boolean;
  hasUnreadMessages: boolean;
  unreadCount: number;
  onClick: () => void;
  onClose: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  isOpen,
  hasUnreadMessages,
  unreadCount,
  onClick,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Pulse animation when there are unread messages
  useEffect(() => {
    if (hasUnreadMessages && !isOpen) {
      setShouldPulse(true);
      const pulseInterval = setInterval(() => {
        setShouldPulse(false);
        setTimeout(() => setShouldPulse(true), 100);
      }, 2000);

      return () => clearInterval(pulseInterval);
    } else {
      setShouldPulse(false);
    }
  }, [hasUnreadMessages, isOpen]);

  const handleClick = () => {
    if (isOpen) {
      onClose();
    } else {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      onClick();
    }
  };

  const formatUnreadCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };

  return (
    <div className="floating-chat-button">
      {/* Chat Button */}
      <button
        className={`chat-button ${isOpen ? 'open' : ''} ${shouldPulse ? 'pulse' : ''} ${isAnimating ? 'animating' : ''}`}
        onClick={handleClick}
        aria-label={isOpen ? 'Close chat' : 'Open chat support'}
        type="button"
      >
        {/* Button Content */}
        <div className="button-content">
          {/* Icon */}
          <div className="icon-container">
            {isOpen ? (
              <RiCloseLine className="icon close-icon" />
            ) : (
              <RiMessage3Line className="icon message-icon" />
            )}
          </div>

          {/* Text (only show when closed) */}
          {!isOpen && (
            <span className="button-text">
              Chat with us
            </span>
          )}

          {/* Unread Badge */}
          {hasUnreadMessages && unreadCount > 0 && (
            <div className="unread-badge">
              <span className="unread-count">
                {formatUnreadCount(unreadCount)}
              </span>
            </div>
          )}
        </div>

        {/* Ripple Effect */}
        <div className="ripple-effect"></div>
      </button>

      {/* Notification Indicator (shows when there are unread messages) */}
      {hasUnreadMessages && !isOpen && (
        <div className="notification-indicator">
          <RiNotification3Line className="notification-icon" />
          <div className="notification-dot"></div>
        </div>
      )}

      {/* Background Overlay for Mobile */}
      {isOpen && (
        <div 
          className="mobile-overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FloatingChatButton;