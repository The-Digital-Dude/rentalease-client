import React, { useState, useEffect } from 'react';
import { MdMenu, MdEmail } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchThreads, 
  fetchEmailById,
  setSelectedThread,
  setSelectedEmail,
  openCompose,
  closeCompose,
  markEmailAsRead,
  deleteEmail,
  toggleEmailStar,
  setCurrentFolder
} from '../../store/emailSlice';
import { EmailSidebar } from '../../components/EmailSidebar';
import { EmailDetail } from '../../components/EmailDetail';
import { ComposeModal } from '../../components/ComposeModal';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import emailService from '../../services/emailService';
import './EmailCommunication.scss';

export const EmailCommunication: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    threads, 
    selectedThread, 
    selectedEmail,
    currentFolder,
    loading,
    composeOpen,
    replyTo
  } = useAppSelector(state => state.email);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch threads on mount and folder change
  useEffect(() => {
    dispatch(fetchThreads({}));
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchThreads({}));
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch, currentFolder]);
  
  // Set up WebSocket for real-time updates
  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('📡 WebSocket connected');
      // Authenticate with token
      const token = localStorage.getItem('authToken');
      if (token) {
        ws.send(JSON.stringify({ type: 'authenticate', token }));
      }
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_email') {
        console.log('📧 New email received:', data.email);
        // Refresh threads to show new email
        dispatch(fetchThreads({}));
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Email', {
            body: `From: ${data.email.from.name || data.email.from.email}\nSubject: ${data.email.subject}`,
            icon: '/logo192.png'
          });
        }
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('📡 WebSocket disconnected');
    };
    
    return () => {
      ws.close();
    };
  }, [dispatch]);
  
  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleThreadSelect = (threadId: string) => {
    const thread = threads.find((t: any) => t._id === threadId || t.id === threadId);
    if (thread) {
      dispatch(setSelectedThread(thread));
      
      // Mark thread as read
      if (thread.unreadCount > 0) {
        emailService.markThreadAsRead(threadId);
      }
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleComposeNew = () => {
    dispatch(openCompose());
  };

  const handleReply = (email: any) => {
    dispatch(openCompose({ replyTo: email }));
  };

  const handleReplyAll = (email: any) => {
    // Same as reply but with replyAll flag
    dispatch(openCompose({ replyTo: email }));
  };

  const handleForward = (email: any) => {
    // Open compose with email content
    dispatch(openCompose({ replyTo: email }));
  };

  const handleDelete = async (emailId: string) => {
    await dispatch(deleteEmail({ emailId }));
    dispatch(setSelectedEmail(null));
  };
  
  const handleStar = async (emailId: string) => {
    await dispatch(toggleEmailStar(emailId));
  };
  
  const handleMarkRead = async (emailId: string, isRead: boolean) => {
    await dispatch(markEmailAsRead({ emailId, isRead }));
  };
  
  const handleFolderChange = (folder: string) => {
    dispatch(setCurrentFolder(folder));
    dispatch(fetchThreads({}));
  };

  return (
    <div className="email-communication">
      <EmailSidebar
        threads={threads}
        selectedThreadId={selectedThread?._id || selectedThread?.id || null}
        onThreadSelect={handleThreadSelect}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="email-main">
        {selectedThread && (
          <EmailDetail
            thread={selectedThread}
            onReply={() => handleReply(selectedEmail)}
            onReplyAll={() => handleReplyAll(selectedEmail)}
            onForward={() => handleForward(selectedEmail)}
            onDelete={() => handleDelete(selectedThread._id || selectedThread.id)}
          />
        )}
        
        {!selectedThread && !loading && (
          <div className="empty-state">
            <MdEmail className="empty-icon" />
            <h3>Select an email to read</h3>
            <p>Choose from your inbox on the left</p>
          </div>
        )}
        
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading emails...</p>
          </div>
        )}
      </div>

      <FloatingActionButton
        onClick={handleComposeNew}
        tooltip="Compose new email"
      />
      
      {/* Compose Modal */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => dispatch(closeCompose())}
        replyTo={replyTo}
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