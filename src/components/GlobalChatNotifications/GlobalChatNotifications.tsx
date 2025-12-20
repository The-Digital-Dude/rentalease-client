import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { type RootState } from "../../store";
import { selectIsChatOpen, selectCurrentSession } from "../../store/chatSlice";
import toast from "react-hot-toast";
import { notificationSound } from "../../utils/notificationSound";

const GlobalChatNotifications: React.FC = () => {
  const { lastMessage, lastMessageTimestamp } = useWebSocket();
  const currentUser = useSelector((state: RootState) => state.user);
  const isChatOpen = useSelector(selectIsChatOpen);
  const currentSession = useSelector(selectCurrentSession);

  // Track notified message IDs to prevent duplicates
  const notifiedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (lastMessage && lastMessageTimestamp > 0) {
      // Handle new chat requests (for SuperAdmins and support staff)
      if (lastMessage.type === "chat_request") {
        console.log("🔔 [GlobalChatNotifications] Processing chat_request:", lastMessage);
        
        // Try multiple possible structures for sessionData
        const sessionData = 
          lastMessage.sessionData || 
          lastMessage.payload?.sessionData || 
          lastMessage.payload ||
          lastMessage;
        
        console.log("🔔 [GlobalChatNotifications] Extracted sessionData:", sessionData);
        
        const requestId = 
          sessionData?.id || 
          sessionData?.sessionId || 
          `chat-request-${lastMessageTimestamp}`;

        // Check if we've already shown notification for this request
        if (notifiedMessagesRef.current.has(requestId)) {
          console.log("🔔 [GlobalChatNotifications] Already notified for request:", requestId);
          return; // Skip duplicate notification
        }

        // Only show notification if user is NOT the one who initiated it
        if (
          sessionData &&
          sessionData.initiatedBy &&
          sessionData.initiatedBy.userId !== currentUser.id
        ) {
          console.log("🔔 [GlobalChatNotifications] Showing toast for new chat request");
          const initiatorName = sessionData.initiatedBy.userName || "Someone";
          const subject = sessionData.subject || "Support Request";

          // Mark as notified
          notifiedMessagesRef.current.add(requestId);

          // Clean up old IDs (keep only last 100)
          if (notifiedMessagesRef.current.size > 100) {
            const idsArray = Array.from(notifiedMessagesRef.current);
            notifiedMessagesRef.current = new Set(idsArray.slice(-100));
          }

          // Play notification sound
          notificationSound.play().catch((error) => {
            console.warn("Failed to play notification sound:", error);
          });

          // Show toast notification for new chat request at top-center
          toast.success(`New chat request from ${initiatorName}: ${subject}`, {
            duration: 5000,
            position: "top-center",
            icon: "💬",
            style: {
              background: "#10b981",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
              padding: "12px 16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          });
        }
      }

      // Handle chat messages
      if (lastMessage.type === "chat_message") {
        // Try multiple possible structures for messageData
        const messageData =
          lastMessage.message || 
          lastMessage.payload?.message || 
          lastMessage.payload ||
          lastMessage;

        // Get message ID for deduplication
        const messageId = 
          messageData?.id || 
          messageData?.messageId || 
          `${lastMessage.sessionId || messageData?.sessionId || 'unknown'}-${lastMessageTimestamp}`;

        // Check if we've already shown notification for this message
        if (notifiedMessagesRef.current.has(messageId)) {
          return; // Skip duplicate notification
        }

        // Show toast notification if message is not from current user
        if (
          messageData &&
          messageData.sender &&
          messageData.sender.userId !== currentUser.id
        ) {
          const senderName = messageData.sender.userName || "Someone";
          const sessionId = lastMessage.sessionId || messageData.sessionId;

          // Check if user is actively viewing this chat
          const isViewingThisChat =
            isChatOpen &&
            currentSession &&
            (sessionId === currentSession.id ||
             messageData.sessionId === currentSession.id);

          // Only play sound and show toast if NOT actively viewing the chat
          if (!isViewingThisChat) {
            // Mark this message as notified
            notifiedMessagesRef.current.add(messageId);

            // Clean up old message IDs (keep only last 100)
            if (notifiedMessagesRef.current.size > 100) {
              const idsArray = Array.from(notifiedMessagesRef.current);
              notifiedMessagesRef.current = new Set(idsArray.slice(-100));
            }

            // Play notification sound
            notificationSound.play().catch((error) => {
              console.warn("Failed to play notification sound:", error);
            });

            // Show toast notification with sender name only at top-center
            toast.success(`New message from ${senderName}`, {
              duration: 5000,
              position: "top-center",
              icon: "💬",
              style: {
                background: "#10b981",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                padding: "12px 16px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
            });
          }
        }
      }
    }
  }, [lastMessage, lastMessageTimestamp, currentUser.id, isChatOpen, currentSession]);

  return null; // This component doesn't render anything
};

export default GlobalChatNotifications;
