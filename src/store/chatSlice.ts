import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/api";

// Types
export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: {
    userId: string;
    userType: "Agency" | "SuperUser" | "TeamMember" | "System";
    userName: string;
    userEmail: string;
  };
  content: {
    text?: string;
    html?: string;
  };
  messageType: "text" | "image" | "file" | "system";
  createdAt: string;
  metadata?: {
    deliveryStatus: "sent" | "delivered" | "failed";
    readBy?: Array<{
      userId: string;
      userType: string;
      readAt: string;
    }>;
  };
}

export interface ChatSession {
  id: string;
  sessionId: string;
  status: "waiting" | "active" | "closed" | "transferred";
  subject: string;
  priority: "low" | "medium" | "high" | "urgent";
  initiatedBy: {
    userId: string;
    userType: string;
    userName: string;
    userEmail: string;
  };
  assignedTo?: {
    userId: string;
    userType: string;
    userName: string;
    userEmail: string;
    assignedAt: string;
  };
  createdAt: string;
  acceptedAt?: string;
  closedAt?: string;
  metadata: {
    totalMessages: number;
    lastActivity: string;
    firstResponseTime?: number;
    avgResponseTime?: number;
  };
  unreadMessageCount?: number;
}

export interface ChatState {
  // Current session and messages
  currentSession: ChatSession | null;
  currentMessages: ChatMessage[];

  // All sessions (for support dashboard)
  sessions: ChatSession[];
  sessionsPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // UI State
  isChatOpen: boolean;
  isLoading: boolean;
  isInitiating: boolean;
  isSendingMessage: boolean;
  error: string | null;

  // Real-time state
  isTyping: boolean;
  typingUser: string | null;

  // Unread counts
  totalUnreadCount: number;
  sessionUnreadCounts: Record<string, number>;

  // WebSocket connection state
  isConnected: boolean;
  connectionError: string | null;
}

const initialState: ChatState = {
  currentSession: null,
  currentMessages: [],
  sessions: [],
  sessionsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  },
  isChatOpen: false,
  isLoading: false,
  isInitiating: false,
  isSendingMessage: false,
  error: null,
  isTyping: false,
  typingUser: null,
  totalUnreadCount: 0,
  sessionUnreadCounts: {},
  isConnected: false,
  connectionError: null,
};

// Async Thunks
export const initiateChat = createAsyncThunk(
  "chat/initiateChat",
  async ({
    subject,
    initialMessage,
    priority = "medium",
  }: {
    subject: string;
    initialMessage: string;
    priority?: "low" | "medium" | "high" | "urgent";
  }) => {
    const response = await api.post("/chat/initiate", {
      subject,
      initialMessage,
      priority,
    });
    return response.data;
  }
);

export const fetchChatSessions = createAsyncThunk(
  "chat/fetchSessions",
  async ({
    status,
    page = 1,
    limit = 20,
  }: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/chat/sessions?${params.toString()}`);
    return response.data;
  }
);

export const fetchChatSession = createAsyncThunk(
  "chat/fetchSession",
  async ({
    sessionId,
    limit = 50,
    offset = 0,
  }: {
    sessionId: string;
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    const response = await api.get(
      `/chat/session/${sessionId}?${params.toString()}`
    );
    return response.data;
  }
);

export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({
    sessionId,
    content,
    messageType = "text",
  }: {
    sessionId: string;
    content: { text: string };
    messageType?: string;
  }) => {
    const response = await api.post("/chat/message", {
      sessionId,
      content,
      messageType,
    });
    return response.data;
  }
);

export const acceptChatSession = createAsyncThunk(
  "chat/acceptSession",
  async (sessionId: string) => {
    const response = await api.put(`/chat/session/${sessionId}/accept`);
    return response.data;
  }
);

export const closeChatSession = createAsyncThunk(
  "chat/closeSession",
  async ({
    sessionId,
    reason = "resolved",
  }: {
    sessionId: string;
    reason?: string;
  }) => {
    const response = await api.put(`/chat/session/${sessionId}/close`, {
      reason,
    });
    return response.data;
  }
);

// Chat Slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // UI Actions
    openChat: (state) => {
      state.isChatOpen = true;
    },

    closeChat: (state) => {
      state.isChatOpen = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.currentMessages = [];
      state.isTyping = false;
      state.typingUser = null;
    },

    // Real-time WebSocket actions
    setConnectionStatus: (
      state,
      action: PayloadAction<{
        isConnected: boolean;
        connectionError?: string | null;
      }>
    ) => {
      state.isConnected = action.payload.isConnected;
      state.connectionError = action.payload.connectionError || null;
    },

    // Handle incoming WebSocket messages
    handleWebSocketMessage: (
      state,
      action: PayloadAction<{
        type: string;
        payload: any;
      }>
    ) => {
      const { type, payload } = action.payload;

      switch (type) {
        case "chat_request":
          // Add new chat request to sessions if we're viewing waiting chats
          if (payload.sessionData) {
            const newSession = {
              ...payload.sessionData,
              unreadMessageCount: 0,
            };

            // Check if session already exists
            const existingIndex = state.sessions.findIndex(
              (s) => s.id === newSession.id
            );
            if (existingIndex === -1) {
              state.sessions.unshift(newSession);
            }
          }
          break;

        case "chat_message":
          // Add message to current session if it matches
          if (
            state.currentSession &&
            payload.sessionId === state.currentSession.id
          ) {
            const newMessage: ChatMessage = {
              id: payload.message.id,
              sessionId: payload.sessionId,
              sender: payload.message.sender,
              content: payload.message.content,
              messageType: payload.message.messageType,
              createdAt: payload.message.createdAt,
              metadata: payload.message.metadata,
            };

            state.currentMessages.push(newMessage);

            // Update session metadata
            state.currentSession.metadata.totalMessages += 1;
            state.currentSession.metadata.lastActivity =
              new Date().toISOString();
          } else {
            // Update unread count for other sessions
            const sessionId = payload.sessionId;
            state.sessionUnreadCounts[sessionId] =
              (state.sessionUnreadCounts[sessionId] || 0) + 1;
            state.totalUnreadCount += 1;

            // Update session in sessions list
            const sessionIndex = state.sessions.findIndex(
              (s) => s.id === sessionId
            );
            if (sessionIndex !== -1) {
              state.sessions[sessionIndex].metadata.lastActivity =
                new Date().toISOString();
              state.sessions[sessionIndex].unreadMessageCount =
                state.sessionUnreadCounts[sessionId];
            }
          }
          break;

        case "chat_accepted":
          // Update session status if it's the current session
          if (
            state.currentSession &&
            payload.sessionId === state.currentSession.id
          ) {
            state.currentSession.status = "active";
            state.currentSession.acceptedAt = new Date().toISOString();
            state.currentSession.assignedTo = {
              userId: payload.acceptedBy.id,
              userType:
                payload.acceptedBy.userType === "super_user"
                  ? "SuperUser"
                  : "TeamMember",
              userName: payload.acceptedBy.name,
              userEmail: "", // Will be filled by backend
              assignedAt: new Date().toISOString(),
            };
          }

          // Update in sessions list
          const acceptedSessionIndex = state.sessions.findIndex(
            (s) => s.id === payload.sessionId
          );
          if (acceptedSessionIndex !== -1) {
            state.sessions[acceptedSessionIndex].status = "active";
            state.sessions[acceptedSessionIndex].acceptedAt =
              new Date().toISOString();
          }
          break;

        case "chat_closed":
          // Update session status
          if (
            state.currentSession &&
            payload.sessionId === state.currentSession.id
          ) {
            state.currentSession.status = "closed";
            state.currentSession.closedAt = new Date().toISOString();
          }

          // Update in sessions list
          const closedSessionIndex = state.sessions.findIndex(
            (s) => s.id === payload.sessionId
          );
          if (closedSessionIndex !== -1) {
            state.sessions[closedSessionIndex].status = "closed";
            state.sessions[closedSessionIndex].closedAt =
              new Date().toISOString();
          }
          break;

        case "typing_start":
          if (
            state.currentSession &&
            payload.sessionId === state.currentSession.id
          ) {
            state.isTyping = true;
            state.typingUser = payload.userName;
          }
          break;

        case "typing_stop":
          if (
            state.currentSession &&
            payload.sessionId === state.currentSession.id
          ) {
            state.isTyping = false;
            state.typingUser = null;
          }
          break;
      }
    },

    // Typing indicators
    setTyping: (
      state,
      action: PayloadAction<{
        isTyping: boolean;
        userName?: string;
      }>
    ) => {
      state.isTyping = action.payload.isTyping;
      state.typingUser = action.payload.userName || null;
    },

    // Unread counts
    clearUnreadCount: (state, action: PayloadAction<string>) => {
      const sessionId = action.payload;
      const previousCount = state.sessionUnreadCounts[sessionId] || 0;
      state.sessionUnreadCounts[sessionId] = 0;
      state.totalUnreadCount = Math.max(
        0,
        state.totalUnreadCount - previousCount
      );

      // Update session in list
      const sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1) {
        state.sessions[sessionIndex].unreadMessageCount = 0;
      }
    },

    updateUnreadCount: (
      state,
      action: PayloadAction<{
        sessionId: string;
        count: number;
      }>
    ) => {
      const { sessionId, count } = action.payload;
      const previousCount = state.sessionUnreadCounts[sessionId] || 0;
      state.sessionUnreadCounts[sessionId] = count;
      state.totalUnreadCount = state.totalUnreadCount - previousCount + count;

      // Update session in list
      const sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);
      if (sessionIndex !== -1) {
        state.sessions[sessionIndex].unreadMessageCount = count;
      }
    },
  },

  extraReducers: (builder) => {
    // Initiate Chat
    builder
      .addCase(initiateChat.pending, (state) => {
        state.isInitiating = true;
        state.error = null;
      })
      .addCase(initiateChat.fulfilled, (state, action) => {
        state.isInitiating = false;
        // Session will be loaded via WebSocket or separate fetch
      })
      .addCase(initiateChat.rejected, (state, action) => {
        state.isInitiating = false;
        state.error = action.error.message || "Failed to initiate chat";
      });

    // Fetch Chat Sessions
    builder
      .addCase(fetchChatSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.data.sessions;
        state.sessionsPagination = action.payload.data.pagination;

        // Update unread counts
        action.payload.data.sessions.forEach((session: ChatSession) => {
          if (session.unreadMessageCount && session.unreadMessageCount > 0) {
            state.sessionUnreadCounts[session.id] = session.unreadMessageCount;
          }
        });

        // Recalculate total unread count
        state.totalUnreadCount = Object.values(
          state.sessionUnreadCounts
        ).reduce((total, count) => total + count, 0);
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch chat sessions";
      });

    // Fetch Chat Session
    builder
      .addCase(fetchChatSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload.data.session;
        state.currentMessages = action.payload.data.messages;

        // Clear unread count for this session
        if (state.currentSession) {
          state.sessionUnreadCounts[state.currentSession.id] = 0;
        }

        // Recalculate total unread count
        state.totalUnreadCount = Object.values(
          state.sessionUnreadCounts
        ).reduce((total, count) => total + count, 0);
      })
      .addCase(fetchChatSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch chat session";
      });

    // Send Chat Message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state) => {
        state.isSendingMessage = false;
        // Message will be added via WebSocket
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.error.message || "Failed to send message";
      });

    // Accept Chat Session
    builder
      .addCase(acceptChatSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptChatSession.fulfilled, (state) => {
        state.isLoading = false;
        // Status will be updated via WebSocket
      })
      .addCase(acceptChatSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to accept chat session";
      });

    // Close Chat Session
    builder
      .addCase(closeChatSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(closeChatSession.fulfilled, (state) => {
        state.isLoading = false;
        // Status will be updated via WebSocket
      })
      .addCase(closeChatSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to close chat session";
      });
  },
});

// Actions
export const {
  openChat,
  closeChat,
  clearError,
  clearCurrentSession,
  setConnectionStatus,
  handleWebSocketMessage,
  setTyping,
  clearUnreadCount,
  updateUnreadCount,
} = chatSlice.actions;

// Selectors
export const selectChatState = (state: { chat: ChatState }) => state.chat;
export const selectCurrentSession = (state: { chat: ChatState }) =>
  state.chat.currentSession;
export const selectCurrentMessages = (state: { chat: ChatState }) =>
  state.chat.currentMessages;
export const selectChatSessions = (state: { chat: ChatState }) =>
  state.chat.sessions;
export const selectIsChatOpen = (state: { chat: ChatState }) =>
  state.chat.isChatOpen;
export const selectIsLoading = (state: { chat: ChatState }) =>
  state.chat.isLoading;
export const selectTotalUnreadCount = (state: { chat: ChatState }) =>
  state.chat.totalUnreadCount;
export const selectIsConnected = (state: { chat: ChatState }) =>
  state.chat.isConnected;
export const selectChatError = (state: { chat: ChatState }) => state.chat.error;

export default chatSlice.reducer;
