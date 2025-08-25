/**
 * Email Service for Frontend
 * Handles all email-related API calls
 */

import api from './api';

// Types
export interface EmailParticipant {
  email: string;
  name?: string;
  userId?: string;
  userType?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
}

export interface Email {
  _id: string;
  id: string;
  messageId: string;
  threadId?: string;
  from: EmailParticipant;
  to: EmailParticipant[];
  cc?: EmailParticipant[];
  bcc?: EmailParticipant[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  preview?: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant?: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive';
  labels?: string[];
  priority: 'high' | 'normal' | 'low';
  attachments?: EmailAttachment[];
  resendStatus?: string;
}

export interface EmailThread {
  _id: string;
  id: string;
  subject: string;
  participants: EmailParticipant[];
  emailIds: string[];
  emailCount: number;
  unreadCount: number;
  lastActivity: string;
  lastMessage?: {
    preview: string;
    from: EmailParticipant;
    timestamp: string;
  };
  hasAttachments: boolean;
  isStarred: boolean;
  isImportant?: boolean;
  isPinned?: boolean;
  labels?: string[];
  category?: string;
}

export interface EmailListResponse {
  emails: Email[];
  totalPages: number;
  currentPage: number;
  totalEmails: number;
  unreadCount: number;
}

export interface ThreadListResponse {
  threads: EmailThread[];
  totalPages: number;
  currentPage: number;
  totalThreads: number;
  unreadThreads: number;
}

export interface EmailStats {
  folders: {
    [key: string]: {
      total: number;
      unread: number;
    };
  };
  total: number;
  totalUnread: number;
}

class EmailService {
  /**
   * Get emails for current user
   */
  async getEmails(params?: {
    page?: number;
    limit?: number;
    folder?: string;
    unread?: boolean;
    starred?: boolean;
    search?: string;
  }): Promise<EmailListResponse> {
    console.log('📧 Fetching emails with params:', params);
    
    const response = await api.get('/v1/emails', { params });
    return response.data.data;
  }

  /**
   * Get email threads
   */
  async getThreads(params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
    starred?: boolean;
    category?: string;
    search?: string;
  }): Promise<ThreadListResponse> {
    console.log('📬 Fetching threads with params:', params);
    
    const response = await api.get('/v1/emails/threads', { params });
    return response.data.data;
  }

  /**
   * Get single email by ID
   */
  async getEmailById(id: string): Promise<Email> {
    const response = await api.get(`/v1/emails/${id}`);
    return response.data.data.email;
  }

  /**
   * Get single thread by ID
   */
  async getThreadById(id: string): Promise<EmailThread> {
    const response = await api.get(`/v1/emails/threads/${id}`);
    return response.data.data.thread;
  }

  /**
   * Send new email
   */
  async sendEmail(data: {
    to: EmailParticipant[];
    cc?: EmailParticipant[];
    bcc?: EmailParticipant[];
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    attachments?: File[];
  }): Promise<{ email: Email; thread: EmailThread }> {
    console.log('📤 Sending email to:', data.to);
    
    const formData = new FormData();
    
    // Add recipients
    formData.append('to', JSON.stringify(data.to));
    if (data.cc && data.cc.length > 0) {
      formData.append('cc', JSON.stringify(data.cc));
    }
    if (data.bcc && data.bcc.length > 0) {
      formData.append('bcc', JSON.stringify(data.bcc));
    }
    
    // Add content
    formData.append('subject', data.subject);
    formData.append('bodyHtml', data.bodyHtml);
    if (data.bodyText) {
      formData.append('bodyText', data.bodyText);
    }
    
    // Add attachments
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await api.post('/v1/emails/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  }

  /**
   * Reply to email
   */
  async replyToEmail(
    emailId: string,
    data: {
      bodyHtml: string;
      bodyText?: string;
      replyAll?: boolean;
      attachments?: File[];
    }
  ): Promise<{ email: Email; thread: EmailThread }> {
    console.log('💬 Replying to email:', emailId);
    
    const formData = new FormData();
    formData.append('bodyHtml', data.bodyHtml);
    if (data.bodyText) {
      formData.append('bodyText', data.bodyText);
    }
    formData.append('replyAll', String(data.replyAll || false));
    
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await api.post(`/v1/emails/${emailId}/reply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  }

  /**
   * Mark email as read/unread
   */
  async markAsRead(emailId: string, isRead = true): Promise<Email> {
    const response = await api.put(`/v1/emails/${emailId}/read`, { isRead });
    return response.data.data.email;
  }

  /**
   * Mark thread as read
   */
  async markThreadAsRead(threadId: string): Promise<EmailThread> {
    const response = await api.put(`/v1/emails/threads/${threadId}/read`);
    return response.data.data.thread;
  }

  /**
   * Toggle email star
   */
  async toggleStar(emailId: string): Promise<Email> {
    const response = await api.put(`/v1/emails/${emailId}/star`);
    return response.data.data.email;
  }

  /**
   * Delete email
   */
  async deleteEmail(emailId: string, permanent = false): Promise<void> {
    await api.delete(`/v1/emails/${emailId}`, {
      params: { permanent },
    });
  }

  /**
   * Search emails
   */
  async searchEmails(
    query: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    emails: Email[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
  }> {
    console.log('🔍 Searching emails for:', query);
    
    const response = await api.get('/v1/emails/search', {
      params: { q: query, ...params },
    });
    
    return response.data.data;
  }

  /**
   * Get email statistics
   */
  async getEmailStats(): Promise<EmailStats> {
    const response = await api.get('/v1/emails/stats');
    return response.data.data;
  }

  /**
   * Parse email addresses from string
   * Helper for compose form
   */
  parseEmailAddresses(input: string): EmailParticipant[] {
    if (!input || !input.trim()) return [];
    
    const addresses = input.split(/[,;]/);
    return addresses
      .map((addr) => {
        const trimmed = addr.trim();
        if (!trimmed) return null;
        
        // Check for "Name <email>" format
        const match = trimmed.match(/^(.+?)\s*<(.+?)>$/);
        if (match) {
          return {
            name: match[1].trim(),
            email: match[2].trim().toLowerCase(),
          };
        }
        
        // Plain email address
        return {
          email: trimmed.toLowerCase(),
        };
      })
      .filter((addr): addr is EmailParticipant => addr !== null);
  }

  /**
   * Format email address for display
   */
  formatEmailAddress(participant: EmailParticipant): string {
    if (participant.name) {
      return `${participant.name} <${participant.email}>`;
    }
    return participant.email;
  }

  /**
   * Format multiple addresses for display
   */
  formatEmailAddresses(participants: EmailParticipant[]): string {
    return participants.map(p => this.formatEmailAddress(p)).join(', ');
  }

  /**
   * Get initials from name or email
   */
  getInitials(participant: EmailParticipant): string {
    if (participant.name) {
      const parts = participant.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return participant.name.substring(0, 2).toUpperCase();
    }
    
    // Use email
    const localPart = participant.email.split('@')[0];
    return localPart.substring(0, 2).toUpperCase();
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if email address is valid
   */
  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Strip HTML tags from content
   */
  stripHtml(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;