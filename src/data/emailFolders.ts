import type { EmailFolder } from '../types/emailTypes';

export const emailFolders: EmailFolder[] = [
  {
    id: 'sent',
    name: 'Sent',
    icon: 'MdSend',
    count: 0,
    type: 'sent'
  },
  {
    id: 'drafts',
    name: 'Drafts',
    icon: 'MdDrafts',
    count: 0,
    type: 'drafts'
  },
  {
    id: 'trash',
    name: 'Trash',
    icon: 'MdDelete',
    count: 0,
    type: 'trash'
  }
];