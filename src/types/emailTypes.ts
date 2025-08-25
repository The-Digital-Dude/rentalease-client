export interface EmailContact {
  id: string;
  name: string;
  email: string;
  role: 'super_user' | 'agency' | 'property_manager' | 'technician' | 'team_member';
  avatar?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Email {
  id: string;
  threadId: string;
  from: EmailContact;
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  attachments?: EmailAttachment[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: EmailContact[];
  emails: Email[];
  lastActivity: string;
  isRead: boolean;
  hasAttachments: boolean;
}

export interface EmailFolder {
  id: string;
  name: string;
  icon: string;
  count: number;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom';
}

export type EmailStatus = 'draft' | 'sent' | 'delivered' | 'read' | 'failed';

export type EmailFilter = 'all' | 'unread' | 'important' | 'attachments';