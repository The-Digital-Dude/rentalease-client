import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store";
import {
  openChat,
  closeChat,
  initiateChat,
  fetchChatSession,
  fetchChatSessions,
  sendChatMessage,
  closeChatSession,
  selectCurrentSession,
  selectCurrentMessages,
  selectIsLoading,
  selectTotalUnreadCount,
  selectIsChatOpen,
} from "../../store/chatSlice";
import FloatingChatButton from "../FloatingChatButton";
import ChatPopup from "../ChatPopup";
import { useWebSocket } from "../../contexts/WebSocketContext";
import "./ChatWithUs.scss";

const ChatWithUs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user);
  const currentSession = useSelector(selectCurrentSession);
  const currentMessages = useSelector(selectCurrentMessages);
  const isLoading = useSelector(selectIsLoading);
  const totalUnreadCount = useSelector(selectTotalUnreadCount);
  const isChatOpen = useSelector(selectIsChatOpen);

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Get WebSocket connection from context
  const { isConnected, sendTypingIndicator } = useWebSocket();

  // Try to resume existing session on mount
  useEffect(() => {
    const resumeSession = async () => {
      try {
        console.log("🔍 Looking for existing chat sessions...");
        
        // First, try to get the user's latest active/waiting session
        const result = await dispatch(
          fetchChatSessions({
            // Don't filter by status - get any active or waiting sessions
            page: 1,
            limit: 1,
          })
        ).unwrap();

        if (result?.data?.sessions?.length > 0) {
          const latestSession = result.data.sessions[0];
          
          // Only resume if it's not closed
          if (latestSession.status !== 'closed') {
            console.log("📍 Found existing session, loading it:", latestSession.id);
            await dispatch(fetchChatSession({ sessionId: latestSession.id }));
          } else {
            console.log("💤 Latest session is closed, no need to resume");
          }
        } else {
          console.log("📝 No existing sessions found");
        }
      } catch (error) {
        console.log("❌ Error checking for existing sessions:", error);
        // This is fine - user doesn't have an active session
      }
    };

    // Only try to resume if user is authenticated, WebSocket is connected, and we don't already have a session
    if (currentUser.isLoggedIn && isConnected && !currentSession) {
      // Add a small delay to ensure WebSocket is fully authenticated
      setTimeout(() => {
        resumeSession();
      }, 500);
    }
  }, [dispatch, currentUser.isLoggedIn, currentSession, isConnected]);

  // Handle opening chat
  const handleOpenChat = () => {
    dispatch(openChat());

    // If there's an existing session, load it
    if (currentSession) {
      dispatch(fetchChatSession({ sessionId: currentSession.id }));
    }
  };

  // Handle closing chat popup
  const handleCloseChat = () => {
    dispatch(closeChat());
  };

  // Handle initiating a new chat
  const handleInitiateChat = async (
    subject: string,
    initialMessage: string
  ) => {
    try {
      console.log("🚀 Initiating new chat session...", { subject, initialMessage });
      
      const result = await dispatch(
        initiateChat({
          subject,
          initialMessage,
          priority: "medium",
        })
      ).unwrap();

      console.log("✅ Chat initiated successfully:", result);

      // After initiating, fetch the session details with a small delay
      if (result.data?.sessionId) {
        // Add a delay to ensure the backend has fully processed the session
        setTimeout(async () => {
          try {
            console.log("📥 Fetching chat session details...");
            await dispatch(fetchChatSession({ sessionId: result.data.sessionId }));
            console.log("✅ Chat session loaded successfully");
          } catch (sessionError) {
            console.error("Error fetching chat session:", sessionError);
          }
        }, 200);
      }
    } catch (error) {
      console.error("❌ Error initiating chat:", error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    if (!currentSession) return;

    try {
      await dispatch(
        sendChatMessage({
          sessionId: currentSession.id,
          content: { text: message },
          messageType: "text",
        })
      ).unwrap();

      // Send typing stop indicator
      sendTypingIndicator(currentSession.id, false);
      // Message will appear instantly via WebSocket, no refresh needed
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle accepting chat (not applicable for agency users)
  const handleAcceptChat = async (sessionId: string) => {
    // This is only for support agents, not agencies
    console.log("Accept chat not available for agency users");
  };

  // Handle closing chat session
  const handleCloseChatSession = async (sessionId: string) => {
    try {
      await dispatch(
        closeChatSession({
          sessionId,
          reason: "user_closed",
        })
      ).unwrap();

      dispatch(closeChat());
    } catch (error) {
      console.error("Error closing chat session:", error);
    }
  };

  // Handle typing indicator
  useEffect(() => {
    if (!currentSession || !isConnected) return;

    let typingTimeout: NodeJS.Timeout;

    const handleKeyPress = () => {
      if (!isTyping) {
        setIsTyping(true);
        sendTypingIndicator(currentSession.id, true);
      }

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(currentSession.id, false);
      }, 2000);
    };

    // Add event listener for typing
    const chatInput = document.querySelector(
      '.message-form textarea, .message-form input[type="text"]'
    );
    if (chatInput) {
      chatInput.addEventListener("input", handleKeyPress);
    }

    return () => {
      clearTimeout(typingTimeout);
      if (chatInput) {
        chatInput.removeEventListener("input", handleKeyPress);
      }
    };
  }, [currentSession, isConnected, isTyping, sendTypingIndicator]);

  // Get user info for chat
  const chatUser = {
    id: currentUser.id || "",
    type: currentUser.userType as "agency" | "super_user" | "team_member",
    name: currentUser.name || currentUser.companyName || "User",
    email: currentUser.email || "",
  };

  return (
    <div className="chat-with-us">
      {/* Floating Chat Button */}
      <FloatingChatButton
        isOpen={isChatOpen}
        hasUnreadMessages={totalUnreadCount > 0}
        unreadCount={totalUnreadCount}
        onClick={handleOpenChat}
        onClose={handleCloseChat}
      />

      {/* Chat Popup */}
      {isChatOpen && (
        <ChatPopup
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          currentUser={chatUser}
          session={currentSession || undefined}
          messages={currentMessages}
          isLoading={isLoading}
          isTyping={typingUser !== null}
          typingUser={typingUser}
          onSendMessage={handleSendMessage}
          onInitiateChat={handleInitiateChat}
          onAcceptChat={handleAcceptChat}
          onCloseChat={handleCloseChatSession}
        />
      )}

      {/* Connection Status Indicator (for debugging, can be removed in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="connection-status">
          <div
            className={`status-dot ${
              isConnected ? "connected" : "disconnected"
            }`}
          />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      )}
    </div>
  );
};

export default ChatWithUs;
