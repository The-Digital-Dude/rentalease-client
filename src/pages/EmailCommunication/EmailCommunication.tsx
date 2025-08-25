import React, { useState } from 'react';
import { MdMenu, MdEmail } from 'react-icons/md';
import { EmailSidebar } from '../../components/EmailSidebar';
import { EmailDetail } from '../../components/EmailDetail';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { emailThreads } from '../../data/emailDummyData';
import type { EmailThread } from '../../types/emailTypes';
import './EmailCommunication.scss';

export const EmailCommunication: React.FC = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedThread = selectedThreadId 
    ? emailThreads.find(thread => thread.id === selectedThreadId) || null
    : null;

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleComposeNew = () => {
    // TODO: Open compose modal
    console.log('Open compose new email modal');
  };

  const handleReply = (emailId: string) => {
    // TODO: Open reply modal
    console.log('Reply to email:', emailId);
  };

  const handleReplyAll = (emailId: string) => {
    // TODO: Open reply all modal
    console.log('Reply all to email:', emailId);
  };

  const handleForward = (emailId: string) => {
    // TODO: Open forward modal
    console.log('Forward email:', emailId);
  };

  const handleDelete = (threadId: string) => {
    // TODO: Delete thread
    console.log('Delete thread:', threadId);
    if (selectedThreadId === threadId) {
      setSelectedThreadId(null);
    }
  };

  return (
    <div className="email-communication">
      <EmailSidebar
        threads={emailThreads}
        selectedThreadId={selectedThreadId}
        onThreadSelect={handleThreadSelect}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="email-main">
        <EmailDetail
          thread={selectedThread}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
          onForward={handleForward}
          onDelete={handleDelete}
        />
      </div>

      <FloatingActionButton
        onClick={handleComposeNew}
        tooltip="Compose new email"
      />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};