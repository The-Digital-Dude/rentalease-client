import React, { useState } from 'react';
import { MdInbox, MdSend, MdDrafts, MdDelete, MdAttachFile, MdCircle, MdSearch } from 'react-icons/md';
import type { EmailThread } from '../../types/emailTypes';
import { emailFolders } from '../../data/emailDummyData';
import './EmailSidebar.scss';

interface EmailSidebarProps {
  threads: EmailThread[];
  selectedThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const folderIcons: Record<string, React.ReactNode> = {
  MdInbox: <MdInbox />,
  MdSend: <MdSend />,
  MdDrafts: <MdDrafts />,
  MdDelete: <MdDelete />,
};

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  threads,
  selectedThreadId,
  onThreadSelect,
  isOpen,
  onClose
}) => {
  const [activeFolder, setActiveFolder] = useState<string>('inbox');

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getEmailPreview = (thread: EmailThread) => {
    const lastEmail = thread.emails[thread.emails.length - 1];
    return lastEmail?.body?.substring(0, 100) + (lastEmail?.body?.length > 100 ? '...' : '');
  };

  const getSenderName = (thread: EmailThread) => {
    const lastEmail = thread.emails[thread.emails.length - 1];
    return lastEmail?.from?.name || 'Unknown';
  };

  return (
    <div className={`email-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="email-sidebar-header">
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-input-container">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            className="search-input"
          />
        </div>
      </div>

      {/* Folder Navigation - 2x2 Grid */}
      <div className="folder-navigation-grid">
        {emailFolders.map((folder) => (
          <button
            key={folder.id}
            className={`folder-item-grid ${activeFolder === folder.id ? 'active' : ''}`}
            onClick={() => setActiveFolder(folder.id)}
          >
            <div className="folder-icon-grid">
              {folderIcons[folder.icon]}
            </div>
            <div className="folder-info">
              <span className="folder-name-grid">{folder.name}</span>
              {folder.count > 0 && (
                <span className="folder-count-grid">{folder.count}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Email Thread List */}
      <div className="email-thread-list">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`thread-item ${selectedThreadId === thread.id ? 'selected' : ''} ${!thread.isRead ? 'unread' : ''}`}
            onClick={() => onThreadSelect(thread.id)}
          >
            <div className="thread-header">
              <div className="sender-info">
                <span className="sender-name">{getSenderName(thread)}</span>
                <span className="thread-time">{formatTime(thread.lastActivity)}</span>
              </div>
              <div className="thread-indicators">
                {!thread.isRead && (
                  <MdCircle className="unread-indicator" />
                )}
                {thread.hasAttachments && (
                  <MdAttachFile className="attachment-indicator" />
                )}
              </div>
            </div>
            
            <div className="thread-content">
              <h4 className="thread-subject">{thread.subject}</h4>
              <p className="thread-preview">{getEmailPreview(thread)}</p>
            </div>
          </div>
        ))}
        
        {threads.length === 0 && (
          <div className="empty-state">
            <MdInbox size={48} />
            <p>No messages in this folder</p>
          </div>
        )}
      </div>
    </div>
  );
};