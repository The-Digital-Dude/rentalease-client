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
        const sessionData = lastMessage.session || lastMessage.payload?.session || lastMessage;
        const requestId = sessionData?.id || sessionData?.sessionId || `chat-request-${lastMessageTimestamp}`;

        // Check if we've already shown notification for this request
        if (notifiedMessagesRef.current.has(requestId)) {
          return; // Skip duplicate notification
        }

        // Only show notification if user is NOT the one who initiated it
        if (
          sessionData &&
          sessionData.initiatedBy &&
          sessionData.initiatedBy.userId !== currentUser.id
        ) {
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

          // Show toast notification for new chat request
          toast.success(`🔔 New chat request from ${initiatorName}: ${subject}`, {
            duration: 8000,
            position: "top-right",
            style: {
              background: "#8b5cf6",
              color: "#fff",
              fontWeight: "500",
              fontSize: "14px",
              padding: "12px 20px",
            },
          });
        }
      }

      // Handle chat messages
      if (lastMessage.type === "chat_message") {
        const messageData =
          lastMessage.message || lastMessage.payload?.message || lastMessage;

        // Get message ID for deduplication
        const messageId = messageData?.id || messageData?.messageId || `${lastMessage.sessionId}-${lastMessageTimestamp}`;

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

          // Check if user is actively viewing this chat
          const isViewingThisChat =
            isChatOpen &&
            currentSession &&
            (lastMessage.sessionId === currentSession.id ||
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

            // Show toast notification with sender name only
            toast.success(`💬 New message from ${senderName}`, {
              duration: 6000,
              position: "top-right",
              style: {
                background: "#10b981",
                color: "#fff",
                fontWeight: "500",
                fontSize: "14px",
                padding: "12px 20px",
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
