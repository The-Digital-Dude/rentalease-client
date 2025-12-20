import api from './api';

// Types
export interface ChatSession {
  id: string;
  sessionId: string;
  status: 'waiting' | 'active' | 'closed' | 'transferred';
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
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

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: {
    userId: string;
    userType: 'Agency' | 'SuperUser' | 'TeamMember' | 'System';
    userName: string;
    userEmail: string;
  };
  content: {
    text?: string;
    html?: string;
  };
  messageType: 'text' | 'image' | 'file' | 'system';
  createdAt: string;
  metadata?: {
    deliveryStatus: 'sent' | 'delivered' | 'failed';
    readBy?: Array<{
      userId: string;
      userType: string;
      readAt: string;
    }>;
  };
}

export interface InitiateChatParams {
  subject: string;
  initialMessage: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SendMessageParams {
  sessionId: string;
  content: {
    text: string;
  };
  messageType?: string;
}

export interface ChatSessionsResponse {
  success: boolean;
  data: {
    sessions: ChatSession[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ChatSessionResponse {
  success: boolean;
  data: {
    session: ChatSession;
    messages: ChatMessage[];
    pagination: {
      limit: number;
      offset: number;
      totalCount: number;
      hasMore: boolean;
    };
  };
}

const chatService = {
  // Initiate a new chat session
  initiateChat: async (params: InitiateChatParams) => {
    try {
      const response = await api.post('/chat/initiate', params);
      return response.data;
    } catch (error) {
      console.error('Error initiating chat:', error);
      throw error;
    }
  },

  // Get all chat sessions
  getSessions: async (status?: string, page = 1, limit = 20): Promise<ChatSessionsResponse> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await api.get(`/chat/sessions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  },

  // Get a specific chat session with messages
  getSession: async (sessionId: string, limit = 50, offset = 0): Promise<ChatSessionResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await api.get(`/chat/session/${sessionId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat session:', error);
      throw error;
    }
  },

  // Send a message in a chat session
  sendMessage: async (params: SendMessageParams) => {
    try {
      const response = await api.post('/chat/message', params);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Accept a chat session (for support agents)
  acceptSession: async (sessionId: string) => {
    try {
      const response = await api.put(`/chat/session/${sessionId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting chat session:', error);
      throw error;
    }
  },

  // Close a chat session
  closeSession: async (sessionId: string, reason = 'resolved') => {
    try {
      const response = await api.put(`/chat/session/${sessionId}/close`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error closing chat session:', error);
      throw error;
    }
  },

  // Get chat statistics (SuperUser only)
  getStats: async () => {
    try {
      const response = await api.get('/chat/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat statistics:', error);
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (sessionId: string) => {
    try {
      // This will be handled automatically when fetching session
      // But we can add explicit endpoint if needed
      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Send typing indicator
  sendTypingIndicator: async (sessionId: string, isTyping: boolean) => {
    try {
      // This will be sent via WebSocket
      // We'll implement this in the WebSocket hook
      return { success: true };
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      throw error;
    }
  },

  // Send attachment
  sendAttachment: async (sessionId: string, file: File, text?: string) => {
    try {
      console.log('📎 sendAttachment called with:', {
        sessionId,
        file,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        text
      });

      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('attachment', file);
      if (text) {
        formData.append('text', text);
      }

      // Log FormData contents
      console.log('📦 FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Axios will automatically set Content-Type with boundary for FormData
      const response = await api.post('/chat/message/attachment', formData);

      console.log('✅ Attachment upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error sending attachment:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
};

export default chatService;