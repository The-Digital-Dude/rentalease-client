import React, { useState } from 'react';
import { 
  MdReply, 
  MdReplyAll, 
  MdForward, 
  MdDelete, 
  MdMoreVert,
  MdAttachFile,
  MdDownload,
  MdPerson,
  MdSchedule
} from 'react-icons/md';
import type { EmailThread } from '../../types/emailTypes';
import './EmailDetail.scss';

interface EmailDetailProps {
  thread: EmailThread | null;
  onReply?: (emailId: string) => void;
  onReplyAll?: (emailId: string) => void;
  onForward?: (emailId: string) => void;
  onDelete?: (threadId: string) => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  thread,
  onReply,
  onReplyAll,
  onForward,
  onDelete
}) => {
  const [showActions, setShowActions] = useState<string | null>(null);

  if (!thread) {
    return (
      <div className="email-detail empty">
        <div className="empty-state">
          <MdPerson size={64} />
          <h3>No Email Selected</h3>
          <p>Select an email from the sidebar to view it here</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'normal': return '#64748b';
      case 'low': return '#16a34a';
      default: return '#64748b';
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="email-detail">
      <div className="email-header">
        <div className="email-subject-line">
          <h2 className="email-subject">{thread.subject}</h2>
          <div className="email-actions">
            <button
              className="action-button"
              onClick={() => onReply?.(thread._id || thread.id)}
              title="Reply"
            >
              <MdReply />
            </button>
            <button
              className="action-button"
              onClick={() => onReplyAll?.(thread._id || thread.id)}
              title="Reply All"
            >
              <MdReplyAll />
            </button>
            <button
              className="action-button"
              onClick={() => onForward?.(thread._id || thread.id)}
              title="Forward"
            >
              <MdForward />
            </button>
            <button
              className="action-button delete"
              onClick={() => onDelete?.(thread.id)}
              title="Delete"
            >
              <MdDelete />
            </button>
            <button
              className="action-button"
              onClick={() => setShowActions(showActions ? null : thread.id)}
              title="More Actions"
            >
              <MdMoreVert />
            </button>
          </div>
        </div>

        <div className="thread-info">
          <div className="participants">
            <span className="participant-count">
              {thread.participants.length} participant{thread.participants.length > 1 ? 's' : ''}
            </span>
            <div className="participant-list">
              {thread.participants.map((participant, index) => (
                <span key={participant.id} className="participant">
                  {participant.name}
                  {index < thread.participants.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
          <div className="thread-meta">
            <span className="message-count">
              {thread.emailCount} message{thread.emailCount > 1 ? 's' : ''}
            </span>
            {thread.hasAttachments && (
              <span className="attachment-indicator">
                <MdAttachFile />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="email-messages">
        {thread.lastMessage && (
          <div className="email-message">
            <div className="message-header">
              <div className="sender-info">
                <div className="sender-avatar">
                  {(thread.lastMessage.from.name || thread.lastMessage.from.email).charAt(0).toUpperCase()}
                </div>
                <div className="sender-details">
                  <div className="sender-name-line">
                    <span className="sender-name">{thread.lastMessage.from.name || thread.lastMessage.from.email}</span>
                  </div>
                  <div className="sender-email">{thread.lastMessage.from.email}</div>
                  <div className="recipients">
                    <span>To: </span>
                    {thread.participants
                      .filter((p: any) => p.email !== thread.lastMessage?.from.email)
                      .map((recipient: any, i: number) => (
                        <span key={recipient._id || recipient.email}>
                          {recipient.name || recipient.email}
                          {i < thread.participants.filter((p: any) => p.email !== thread.lastMessage?.from.email).length - 1 && ', '}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
              <div className="message-meta">
                <div className="timestamp">
                  <MdSchedule />
                  {formatTimestamp(thread.lastMessage.timestamp)}
                </div>
              </div>
            </div>

            <div className="message-body">
              <p>{thread.lastMessage.preview}</p>
            </div>
          </div>
        )}
        
        {thread.emailCount > 1 && (
          <div className="show-more-messages">
            <p>This thread contains {thread.emailCount} messages. Click to load full conversation.</p>
          </div>
        )}
      </div>

      <div className="email-compose-area">
        <div className="compose-actions">
          <button className="compose-button primary">
            <MdReply />
            Reply
          </button>
          <button className="compose-button secondary">
            <MdReplyAll />
            Reply All
          </button>
          <button className="compose-button secondary">
            <MdForward />
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};