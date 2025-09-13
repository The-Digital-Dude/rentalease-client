import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  RiMessage3Line,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiSearchLine,
  RiFilterLine,
  RiUser3Line,
  RiCustomerService2Line,
  RiLoader4Line,
  RiRefreshLine,
} from "react-icons/ri";
import { type RootState, type AppDispatch } from "../../store";
import {
  fetchChatSessions,
  fetchChatSession,
  acceptChatSession,
  closeChatSession,
  sendChatMessage,
  clearCurrentSession,
  selectChatSessions,
  selectCurrentSession,
  selectCurrentMessages,
  selectIsLoading,
  handleWebSocketMessage,
} from "../../store/chatSlice";
import ChatPopup from "../../components/ChatPopup";
import { useWebSocket } from "../../contexts/WebSocketContext";
import "./Messages.scss";

interface MessagePageProps {}

const Messages: React.FC<MessagePageProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sessions = useSelector(selectChatSessions);
  const currentSession = useSelector(selectCurrentSession);
  const currentMessages = useSelector(selectCurrentMessages);
  const isLoading = useSelector(selectIsLoading);
  const currentUser = useSelector((state: RootState) => state.user);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get WebSocket connection from context
  const { isConnected, sendMessage, sendTypingIndicator, lastMessage, lastMessageTimestamp } = useWebSocket();
  
  // Add a debug state to track when lastMessage changes
  const [debugMessageCount, setDebugMessageCount] = useState(0);

  // Define fetchSessions callback first (before useEffect hooks that use it)
  const fetchSessions = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(
      fetchChatSessions({
        status: statusFilter === "all" ? undefined : statusFilter,
      })
    );
    setIsRefreshing(false);
  }, [dispatch, statusFilter]);

  // Debug effect to track lastMessage changes
  useEffect(() => {
    console.log('🔍 [Messages] DEBUG - lastMessage changed:', {
      lastMessage,
      lastMessageTimestamp,
      count: debugMessageCount + 1
    });
    setDebugMessageCount(prev => prev + 1);
  }, [lastMessage, lastMessageTimestamp]);

  // Fetch sessions on mount and when filter changes
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Listen for WebSocket messages to update sessions in real-time
  useEffect(() => {
    console.log('🔍 [Messages] WebSocket effect triggered:', { 
      hasMessage: !!lastMessage, 
      messageType: lastMessage?.type, 
      timestamp: lastMessageTimestamp,
      isConnected,
      lastMessage: lastMessage // Log the full message object for debugging
    });
    
    if (lastMessage && lastMessageTimestamp > 0) {
      console.log('🔍 [Messages] Processing WebSocket message:', lastMessage.type, lastMessage);
      
      // Immediately call fetchSessions for any chat-related messages
      if (['chat_request', 'chat_message', 'chat_accepted', 'chat_closed'].includes(lastMessage.type)) {
        console.log('🚨 [Messages] CALLING FETCHSESSIONS FOR:', lastMessage.type);
        fetchSessions();
      }
      
      switch (lastMessage.type) {
        case 'chat_request':
          // New chat session created - refresh sessions list immediately
          console.log('🆕 New chat request received via WebSocket:', lastMessage);
          
          // Play notification sound for new chat requests
          try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // High pitch for new chat
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (error) {
            console.log('Could not play notification sound:', error);
            // Fallback vibration if available
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
          }
          break;
          
        case 'chat_message':
          // New message received - refresh current session if it matches
          if (selectedSessionId && lastMessage.sessionId === selectedSessionId) {
            dispatch(fetchChatSession({ sessionId: selectedSessionId }));
          }
          // Also refresh sessions list to update last activity
          fetchSessions();
          
          // Play message sound (softer than new chat)
          try {
            // Create a softer sound for messages
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 400; // Lower pitch for messages
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
          } catch (error) {
            console.log('Could not play message sound:', error);
          }
          break;
          
        case 'chat_accepted':
        case 'chat_closed':
          // Session status changed - refresh sessions list
          console.log(`Chat ${lastMessage.type} received via WebSocket, refreshing sessions`);
          fetchSessions();
          break;
          
        default:
          // Handle other message types if needed
          break;
      }
    }
  }, [lastMessage, lastMessageTimestamp, selectedSessionId, dispatch, fetchSessions]);

  // Auto-refresh sessions when WebSocket connection is established
  useEffect(() => {
    if (isConnected) {
      console.log('🔗 WebSocket connected, refreshing sessions to ensure we have latest data');
      // Add a small delay to ensure WebSocket is fully ready
      setTimeout(() => {
        fetchSessions();
      }, 250);
    }
  }, [isConnected, fetchSessions]);

  // Force refresh sessions every 5 minutes as fallback (WebSocket should handle real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Periodic refresh of sessions (fallback - WebSocket should handle real-time updates)');
      fetchSessions();
    }, 300000); // 5 minutes (300 seconds)

    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Fetch specific session when selected
  useEffect(() => {
    if (selectedSessionId) {
      dispatch(fetchChatSession({ sessionId: selectedSessionId }));
    } else {
      dispatch(clearCurrentSession());
    }
  }, [selectedSessionId, dispatch]);

  const handleAcceptChat = async (sessionId: string) => {
    await dispatch(acceptChatSession(sessionId));
    // Status will update via WebSocket, but refresh sessions to ensure list is current
    await fetchSessions();
  };

  const handleCloseChat = async (sessionId: string, reason?: string) => {
    await dispatch(
      closeChatSession({ sessionId, reason: reason || "resolved" })
    );
    await fetchSessions();
    setSelectedSessionId(null);
  };

  const handleSendMessage = async (message: string) => {
    if (currentSession) {
      await dispatch(
        sendChatMessage({
          sessionId: currentSession.id,
          content: { text: message },
          messageType: "text",
        })
      );
      // Message will appear instantly via WebSocket, no refresh needed
    }
  };

  const getSessionStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <RiTimeLine className="status-icon waiting" />;
      case "active":
        return <RiCheckboxCircleLine className="status-icon active" />;
      case "closed":
        return <RiCloseCircleLine className="status-icon closed" />;
      default:
        return <RiMessage3Line className="status-icon" />;
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "status-waiting";
      case "active":
        return "status-active";
      case "closed":
        return "status-closed";
      default:
        return "";
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.initiatedBy.userName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      session.initiatedBy.userEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Header */}
        <div className="messages-header">
          <div className="header-content">
            <h1>
              <RiMessage3Line /> Chat Support
            </h1>
            <p>Manage and respond to customer chat requests</p>
          </div>

          <div className="header-actions">
            <button
              className="refresh-button"
              onClick={fetchSessions}
              disabled={isRefreshing}
            >
              <RiRefreshLine className={isRefreshing ? "spinning" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="messages-content">
          {/* Sidebar - Chat List */}
          <div className="chat-sidebar">
            {/* Filters */}
            <div className="sidebar-header">
              <div className="search-bar">
                <RiSearchLine className="search-icon" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-tabs">
                <button
                  className={`filter-tab ${
                    statusFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </button>
                <button
                  className={`filter-tab ${
                    statusFilter === "waiting" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("waiting")}
                >
                  Waiting
                </button>
                <button
                  className={`filter-tab ${
                    statusFilter === "active" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </button>
                <button
                  className={`filter-tab ${
                    statusFilter === "closed" ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter("closed")}
                >
                  Closed
                </button>
              </div>
            </div>

            {/* Chat List */}
            <div className="chat-list">
              {isLoading && filteredSessions.length === 0 ? (
                <div className="loading-state">
                  <RiLoader4Line className="loading-icon" />
                  <p>Loading chats...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="empty-state">
                  <RiMessage3Line className="empty-icon" />
                  <p>No chat sessions found</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`chat-item ${
                      selectedSessionId === session.id ? "selected" : ""
                    } ${getSessionStatusColor(session.status)}`}
                    onClick={() => setSelectedSessionId(session.id)}
                  >
                    <div className="chat-item-header">
                      <div className="chat-info">
                        <div className="chat-title">
                          <span className="agency-name">
                            {session.initiatedBy.userName}
                          </span>
                          {session.unreadMessageCount &&
                            session.unreadMessageCount > 0 && (
                              <span className="unread-badge">
                                {session.unreadMessageCount}
                              </span>
                            )}
                        </div>
                        <span className="chat-time">
                          {formatTime(session.metadata.lastActivity)}
                        </span>
                      </div>
                    </div>

                    <div className="chat-item-body">
                      <p className="chat-subject">{session.subject}</p>
                      <div className="chat-meta">
                        {getSessionStatusIcon(session.status)}
                        <span className="status-text">{session.status}</span>
                        {session.assignedTo && (
                          <>
                            <span className="separator">•</span>
                            <RiCustomerService2Line className="agent-icon" />
                            <span className="agent-name">
                              {session.assignedTo.userName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {session.priority === "urgent" && (
                      <div className="priority-indicator urgent">Urgent</div>
                    )}
                    {session.priority === "high" && (
                      <div className="priority-indicator high">High</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="chat-main">
            {selectedSessionId && currentSession ? (
              <div className="chat-view">
                {/* Chat Header */}
                <div className="chat-view-header">
                  <div className="session-info">
                    <h2>{currentSession.subject}</h2>
                    <div className="session-meta">
                      <RiUser3Line />
                      <span>{currentSession.initiatedBy.userName}</span>
                      <span className="separator">•</span>
                      <span>{currentSession.initiatedBy.userEmail}</span>
                      <span className="separator">•</span>
                      <span className={`status ${currentSession.status}`}>
                        {currentSession.status}
                      </span>
                    </div>
                  </div>

                  <div className="session-actions">
                    {currentSession.status === "waiting" && (
                      <button
                        className="accept-button"
                        onClick={() => handleAcceptChat(currentSession.id)}
                        disabled={isLoading}
                      >
                        Accept Chat
                      </button>
                    )}
                    {currentSession.status === "active" && (
                      <button
                        className="close-button"
                        onClick={() => handleCloseChat(currentSession.id)}
                        disabled={isLoading}
                      >
                        Close Chat
                      </button>
                    )}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${
                        message.sender.userId === currentUser.id
                          ? "own"
                          : "other"
                      } ${message.messageType}`}
                    >
                      <div className="message-header">
                        <span className="sender-name">
                          {message.sender.userName}
                        </span>
                        <span className="message-time">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div className="message-content">
                        {message.content.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                {currentSession.status === "active" && (
                  <div className="message-input">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.querySelector(
                          "input"
                        ) as HTMLInputElement;
                        if (input.value.trim()) {
                          handleSendMessage(input.value.trim());
                          input.value = "";
                        }
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Type your message..."
                        disabled={isLoading}
                      />
                      <button type="submit" disabled={isLoading}>
                        Send
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-chat-selected">
                <RiMessage3Line className="no-chat-icon" />
                <h3>Select a chat to view</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
