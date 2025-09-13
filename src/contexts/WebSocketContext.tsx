import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import {
  setConnectionStatus,
  handleWebSocketMessage,
} from "../store/chatSlice";

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: number | undefined;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: Record<string, unknown>) => boolean;
  sendTypingIndicator: (sessionId: string, isTyping: boolean) => boolean;
  lastMessage: any | null;
  lastMessageTimestamp: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isLoggedIn
  );

  // Get token from localStorage since it's not in Redux state
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastMessage, setLastMessage] = React.useState<any | null>(null);
  const [lastMessageTimestamp, setLastMessageTimestamp] = React.useState(0);
  const [connectionAttempts, setConnectionAttempts] = React.useState(0);

  // Get WebSocket URL based on environment
  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_WS_URL || window.location.hostname;
    const port = import.meta.env.VITE_WS_PORT || "4000";

    // Always include port for WebSocket connections
    return `${protocol}//${host}:${port}`;
  };

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnect");
      wsRef.current = null;
    }

    dispatch(
      setConnectionStatus({ isConnected: false, connectionError: null })
    );
  }, [dispatch]);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    const token = getToken();
    if (!isAuthenticated || !token) {
      console.log("Not authenticated, skipping WebSocket connection");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log("Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔗 WebSocket connected successfully");
        dispatch(
          setConnectionStatus({ isConnected: true, connectionError: null })
        );
        reconnectAttemptsRef.current = 0;
        setConnectionAttempts(0);

        // Send authentication message
        if (token) {
          console.log("🔐 Sending authentication to WebSocket...");
          ws.send(
            JSON.stringify({
              type: "authenticate",
              token: token,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("🔍 [WebSocketContext] WebSocket message received:", message.type, message);

          // Store the latest message for components to react to
          const timestampNow = Date.now();
          const messageWithTimestamp = { ...message, receivedAt: timestampNow };
          
          console.log('🔍 [WebSocketContext] Setting lastMessage:', messageWithTimestamp);
          console.log('🔍 [WebSocketContext] Setting lastMessageTimestamp:', timestampNow);
          
          setLastMessage(messageWithTimestamp);
          setLastMessageTimestamp(timestampNow);

          // Handle different message types
          switch (message.type) {
            case "auth_success":
              console.log("WebSocket authentication successful");
              break;

            case "auth_error":
              console.error("WebSocket authentication failed");
              disconnect();
              break;

            case "chat_request":
              console.log("📨 Chat request received via WebSocket:", message);
              dispatch(
                handleWebSocketMessage({
                  type: message.type,
                  payload: message,
                })
              );
              break;
              
            case "chat_message":
              console.log("💬 Chat message received via WebSocket:", message);
              dispatch(
                handleWebSocketMessage({
                  type: message.type,
                  payload: message,
                })
              );
              break;
              
            case "chat_accepted":
            case "chat_closed":
            case "typing_start":
            case "typing_stop":
              console.log(`🔄 Chat ${message.type} received via WebSocket:`, message);
              dispatch(
                handleWebSocketMessage({
                  type: message.type,
                  payload: message,
                })
              );
              break;

            case "new_email":
              // Handle email notifications if needed
              console.log("New email notification:", message);
              break;

            default:
              console.log("Unknown WebSocket message type:", message.type, message);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        dispatch(
          setConnectionStatus({
            isConnected: false,
            connectionError: "Connection error occurred",
          })
        );
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        dispatch(
          setConnectionStatus({
            isConnected: false,
            connectionError: event.reason || "Connection closed",
          })
        );
        wsRef.current = null;

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current++;
          setConnectionAttempts(reconnectAttemptsRef.current);
          console.log(
            `🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/5)...`
          );

          const delay = Math.min(3000 * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isAuthenticated && getToken()) {
              connect();
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= 5) {
          console.log("❌ Max reconnection attempts reached");
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      dispatch(
        setConnectionStatus({
          isConnected: false,
          connectionError: "Failed to create connection",
        })
      );
    }
  }, [isAuthenticated, dispatch, disconnect]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn("WebSocket not connected, cannot send message", {
        readyState: wsRef.current?.readyState,
        message: message,
      });
      return false;
    }
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (sessionId: string, isTyping: boolean) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const sent = sendMessage({
        type: isTyping ? "typing_start" : "typing_stop",
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
      });

      if (sent && isTyping) {
        // Auto-stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(sessionId, false);
        }, 3000);
      }

      return sent;
    },
    [sendMessage]
  );

  // Effect to handle connection lifecycle
  useEffect(() => {
    if (isAuthenticated && getToken()) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  const value: WebSocketContextType = {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    connectionState: wsRef.current?.readyState,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
    lastMessage,
    lastMessageTimestamp,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
