/**
 * Email Redux Slice
 * Manages email state across the application
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import emailService, { type Email, type EmailThread, type EmailListResponse, type ThreadListResponse, type EmailStats } from '../services/emailService';

// Types for state
interface EmailState {
  // Data
  emails: Email[];
  threads: EmailThread[];
  selectedEmail: Email | null;
  selectedThread: EmailThread | null;
  stats: EmailStats | null;
  
  // UI State
  currentFolder: string;
  currentView: 'emails' | 'threads';
  
  // Counts
  unreadCount: number;
  totalEmails: number;
  
  // Loading states
  loading: boolean;
  sendingEmail: boolean;
  loadingThread: boolean;
  
  // Error handling
  error: string | null;
  
  // Search and filters
  searchQuery: string;
  filters: {
    unread: boolean;
    starred: boolean;
    hasAttachments: boolean;
  };
  
  // Pagination
  currentPage: number;
  totalPages: number;
  
  // Compose state
  composeOpen: boolean;
  replyTo: Email | null;
  draftEmail: Partial<Email> | null;
}

const initialState: EmailState = {
  emails: [],
  threads: [],
  selectedEmail: null,
  selectedThread: null,
  stats: null,
  currentFolder: 'inbox',
  currentView: 'threads',
  unreadCount: 0,
  totalEmails: 0,
  loading: false,
  sendingEmail: false,
  loadingThread: false,
  error: null,
  searchQuery: '',
  filters: {
    unread: false,
    starred: false,
    hasAttachments: false,
  },
  currentPage: 1,
  totalPages: 1,
  composeOpen: false,
  replyTo: null,
  draftEmail: null,
};

// Async thunks
export const fetchEmails = createAsyncThunk(
  'email/fetchEmails',
  async (params: {
    page?: number;
    folder?: string;
    unread?: boolean;
    starred?: boolean;
    search?: string;
  } = {}) => {
    const response = await emailService.getEmails({
      page: params.page || 1,
      folder: params.folder || 'inbox',
      unread: params.unread,
      starred: params.starred,
      search: params.search,
      limit: 50,
    });
    return response;
  }
);

export const fetchThreads = createAsyncThunk(
  'email/fetchThreads',
  async (params: {
    page?: number;
    unread?: boolean;
    starred?: boolean;
    search?: string;
  } = {}) => {
    const response = await emailService.getThreads({
      page: params.page || 1,
      unread: params.unread,
      starred: params.starred,
      search: params.search,
      limit: 50,
    });
    return response;
  }
);

export const fetchEmailById = createAsyncThunk(
  'email/fetchEmailById',
  async (id: string) => {
    const email = await emailService.getEmailById(id);
    return email;
  }
);

export const fetchThreadById = createAsyncThunk(
  'email/fetchThreadById',
  async (id: string) => {
    const thread = await emailService.getThreadById(id);
    return thread;
  }
);

export const sendEmail = createAsyncThunk(
  'email/sendEmail',
  async (data: {
    to: any[];
    cc?: any[];
    bcc?: any[];
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    attachments?: File[];
  }) => {
    const response = await emailService.sendEmail(data);
    return response;
  }
);

export const replyToEmail = createAsyncThunk(
  'email/replyToEmail',
  async ({ emailId, data }: {
    emailId: string;
    data: {
      bodyHtml: string;
      bodyText?: string;
      replyAll?: boolean;
      attachments?: File[];
    };
  }) => {
    const response = await emailService.replyToEmail(emailId, data);
    return response;
  }
);

export const markEmailAsRead = createAsyncThunk(
  'email/markAsRead',
  async ({ emailId, isRead = true }: { emailId: string; isRead?: boolean }) => {
    const email = await emailService.markAsRead(emailId, isRead);
    return email;
  }
);

export const toggleEmailStar = createAsyncThunk(
  'email/toggleStar',
  async (emailId: string) => {
    const email = await emailService.toggleStar(emailId);
    return email;
  }
);

export const deleteEmail = createAsyncThunk(
  'email/deleteEmail',
  async ({ emailId, permanent = false }: { emailId: string; permanent?: boolean }) => {
    await emailService.deleteEmail(emailId, permanent);
    return { emailId, permanent };
  }
);

export const searchEmails = createAsyncThunk(
  'email/searchEmails',
  async ({ query, page = 1 }: { query: string; page?: number }) => {
    const response = await emailService.searchEmails(query, { page, limit: 50 });
    return response;
  }
);

export const fetchEmailStats = createAsyncThunk(
  'email/fetchStats',
  async () => {
    const stats = await emailService.getEmailStats();
    return stats;
  }
);

// Slice
const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    // UI actions
    setCurrentFolder: (state, action: PayloadAction<string>) => {
      state.currentFolder = action.payload;
      state.currentPage = 1; // Reset pagination
    },
    
    setCurrentView: (state, action: PayloadAction<'emails' | 'threads'>) => {
      state.currentView = action.payload;
    },
    
    setSelectedEmail: (state, action: PayloadAction<Email | null>) => {
      state.selectedEmail = action.payload;
    },
    
    setSelectedThread: (state, action: PayloadAction<EmailThread | null>) => {
      state.selectedThread = action.payload;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<EmailState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Compose actions
    openCompose: (state, action: PayloadAction<{ replyTo?: Email } | undefined>) => {
      state.composeOpen = true;
      state.replyTo = action?.payload?.replyTo || null;
    },
    
    closeCompose: (state) => {
      state.composeOpen = false;
      state.replyTo = null;
      state.draftEmail = null;
    },
    
    saveDraft: (state, action: PayloadAction<Partial<Email>>) => {
      state.draftEmail = action.payload;
    },
    
    // Real-time updates
    addNewEmail: (state, action: PayloadAction<Email>) => {
      // Add to beginning of list if in correct folder
      if (action.payload.folder === state.currentFolder) {
        state.emails = [action.payload, ...state.emails];
        state.totalEmails += 1;
        
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    
    updateEmail: (state, action: PayloadAction<Email>) => {
      const index = state.emails.findIndex(e => e._id === action.payload._id);
      if (index !== -1) {
        state.emails[index] = action.payload;
      }
      
      if (state.selectedEmail?._id === action.payload._id) {
        state.selectedEmail = action.payload;
      }
    },
    
    removeEmail: (state, action: PayloadAction<string>) => {
      state.emails = state.emails.filter(e => e._id !== action.payload);
      state.totalEmails = Math.max(0, state.totalEmails - 1);
      
      if (state.selectedEmail?._id === action.payload) {
        state.selectedEmail = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch emails
    builder
      .addCase(fetchEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload.emails;
        state.totalEmails = action.payload.totalEmails;
        state.unreadCount = action.payload.unreadCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch emails';
      });
    
    // Fetch threads
    builder
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload.threads;
        state.totalEmails = action.payload.totalThreads;
        state.unreadCount = action.payload.unreadThreads;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch threads';
      });
    
    // Fetch single email
    builder
      .addCase(fetchEmailById.fulfilled, (state, action) => {
        state.selectedEmail = action.payload;
        
        // Update in list if exists
        const index = state.emails.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.emails[index] = action.payload;
        }
      });
    
    // Fetch single thread
    builder
      .addCase(fetchThreadById.pending, (state) => {
        state.loadingThread = true;
      })
      .addCase(fetchThreadById.fulfilled, (state, action) => {
        state.loadingThread = false;
        state.selectedThread = action.payload;
      })
      .addCase(fetchThreadById.rejected, (state) => {
        state.loadingThread = false;
      });
    
    // Send email
    builder
      .addCase(sendEmail.pending, (state) => {
        state.sendingEmail = true;
        state.error = null;
      })
      .addCase(sendEmail.fulfilled, (state, action) => {
        state.sendingEmail = false;
        state.composeOpen = false;
        
        // Add to sent folder if currently viewing it
        if (state.currentFolder === 'sent') {
          state.emails = [action.payload.email, ...state.emails];
        }
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.sendingEmail = false;
        state.error = action.error.message || 'Failed to send email';
      });
    
    // Reply to email
    builder
      .addCase(replyToEmail.pending, (state) => {
        state.sendingEmail = true;
        state.error = null;
      })
      .addCase(replyToEmail.fulfilled, (state, action) => {
        state.sendingEmail = false;
        state.composeOpen = false;
        
        // Update thread if selected
        if (state.selectedThread?._id === action.payload.thread._id) {
          state.selectedThread = action.payload.thread;
        }
      })
      .addCase(replyToEmail.rejected, (state, action) => {
        state.sendingEmail = false;
        state.error = action.error.message || 'Failed to send reply';
      });
    
    // Mark as read
    builder
      .addCase(markEmailAsRead.fulfilled, (state, action) => {
        const email = action.payload;
        
        // Update in list
        const index = state.emails.findIndex(e => e._id === email._id);
        if (index !== -1) {
          const wasUnread = !state.emails[index].isRead;
          state.emails[index] = email;
          
          // Update unread count
          if (wasUnread && email.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          } else if (!wasUnread && !email.isRead) {
            state.unreadCount += 1;
          }
        }
        
        // Update selected
        if (state.selectedEmail?._id === email._id) {
          state.selectedEmail = email;
        }
      });
    
    // Toggle star
    builder
      .addCase(toggleEmailStar.fulfilled, (state, action) => {
        const email = action.payload;
        
        // Update in list
        const index = state.emails.findIndex(e => e._id === email._id);
        if (index !== -1) {
          state.emails[index] = email;
        }
        
        // Update selected
        if (state.selectedEmail?._id === email._id) {
          state.selectedEmail = email;
        }
      });
    
    // Delete email
    builder
      .addCase(deleteEmail.fulfilled, (state, action) => {
        const { emailId } = action.payload;
        
        // Remove from list
        state.emails = state.emails.filter(e => e._id !== emailId);
        state.totalEmails = Math.max(0, state.totalEmails - 1);
        
        // Clear selected if deleted
        if (state.selectedEmail?._id === emailId) {
          state.selectedEmail = null;
        }
      });
    
    // Search emails
    builder
      .addCase(searchEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload.emails;
        state.totalEmails = action.payload.totalResults;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(searchEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      });
    
    // Fetch stats
    builder
      .addCase(fetchEmailStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.unreadCount = action.payload.totalUnread;
      });
  },
});

// Export actions
export const {
  setCurrentFolder,
  setCurrentView,
  setSelectedEmail,
  setSelectedThread,
  setSearchQuery,
  updateFilters,
  clearError,
  openCompose,
  closeCompose,
  saveDraft,
  addNewEmail,
  updateEmail,
  removeEmail,
} = emailSlice.actions;

// Export reducer
export default emailSlice.reducer;