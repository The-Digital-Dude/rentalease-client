import type { EmailContact, Email, EmailThread, EmailFolder } from '../types/emailTypes';

export const emailContacts: EmailContact[] = [
  {
    id: '1',
    name: 'Kenda Jenner',
    email: 'kenda.jenner@email.com',
    role: 'super_user',
  },
  {
    id: '2',
    name: 'Kevin Nicholas',
    email: 'kevin.nicholas@email.com',
    role: 'agency',
  },
  {
    id: '3',
    name: 'Lydia Paulina',
    email: 'lydia.paulina@email.com',
    role: 'property_manager',
  },
  {
    id: '4',
    name: 'Gabriel Jesus',
    email: 'gabriel.jesus@email.com',
    role: 'technician',
  },
  {
    id: '5',
    name: 'Katherina Imani',
    email: 'katherina.imani@email.com',
    role: 'team_member',
  },
  {
    id: '6',
    name: 'Kevin de Bruyne',
    email: 'kevin.debruyne@email.com',
    role: 'technician',
  },
  {
    id: '7',
    name: 'Lukaku Tolong',
    email: 'lukaku.tolong@email.com',
    role: 'property_manager',
  },
];

export const emails: Email[] = [
  {
    id: 'e1',
    threadId: 't1',
    from: emailContacts[1], // Kevin Nicholas
    to: [emailContacts[0]], // Current User
    subject: 'Property Maintenance Request - Urgent',
    body: 'Hey there! We have an urgent maintenance request for Property #1234. The tenant reports a water leak in the bathroom. Can you please assign a technician ASAP?',
    timestamp: '2024-05-06T18:30:00Z',
    isRead: false,
    priority: 'urgent',
    attachments: [
      {
        id: 'a1',
        name: 'leak_photos.jpg',
        size: 2048576, // 2MB
        type: 'image/jpeg',
        url: '/attachments/leak_photos.jpg'
      }
    ]
  },
  {
    id: 'e2',
    threadId: 't2',
    from: emailContacts[0], // Current User
    to: [emailContacts[1]], // Kevin Nicholas
    subject: 'Re: Property Maintenance Request - Urgent',
    body: 'Hi Kevin, I\'ve received your request. I\'ll assign Gabriel Jesus to handle this immediately. He should be there within the hour.',
    timestamp: '2024-05-06T18:45:00Z',
    isRead: true,
    priority: 'high'
  },
  {
    id: 'e3',
    threadId: 't3',
    from: emailContacts[2], // Lydia Paulina
    to: [emailContacts[0]],
    subject: 'Monthly Property Report - April 2024',
    body: 'Hi, Please find attached the monthly property report for April 2024. All properties are performing well with 95% occupancy rate. Let me know if you need any additional information.',
    timestamp: '2024-05-06T15:20:00Z',
    isRead: false,
    priority: 'normal',
    attachments: [
      {
        id: 'a2',
        name: 'april_report.pdf',
        size: 1048576, // 1MB
        type: 'application/pdf',
        url: '/attachments/april_report.pdf'
      }
    ]
  },
  {
    id: 'e4',
    threadId: 't4',
    from: emailContacts[3], // Gabriel Jesus
    to: [emailContacts[0]],
    subject: 'Job Completion - Water Leak Repair',
    body: 'Hi, I have successfully completed the water leak repair at Property #1234. The issue was a loose pipe connection which has been fixed. Tenant is satisfied with the work. Please find the completion report attached.',
    timestamp: '2024-05-06T12:15:00Z',
    isRead: true,
    priority: 'normal',
    attachments: [
      {
        id: 'a3',
        name: 'completion_report.pdf',
        size: 512000, // 500KB
        type: 'application/pdf',
        url: '/attachments/completion_report.pdf'
      }
    ]
  },
  {
    id: 'e5',
    threadId: 't5',
    from: emailContacts[4], // Katherina Imani
    to: [emailContacts[0]],
    subject: 'Team Meeting Reminder - Tomorrow 2PM',
    body: 'Hi Team, Just a reminder about our team meeting tomorrow at 2PM. We\'ll be discussing the new property assignments and Q2 targets. Please come prepared with your status updates.',
    timestamp: '2024-05-06T10:30:00Z',
    isRead: true,
    priority: 'normal'
  },
  {
    id: 'e6',
    threadId: 't6',
    from: emailContacts[5], // Kevin de Bruyne
    to: [emailContacts[0]],
    subject: 'Payment Request - May 2024',
    body: 'Hi, I\'ve completed all assigned jobs for May 2024. Please find my invoice attached for the payment processing. Total amount: $2,850 for 15 completed jobs.',
    timestamp: '2024-05-06T09:45:00Z',
    isRead: false,
    priority: 'normal',
    attachments: [
      {
        id: 'a4',
        name: 'may_invoice.pdf',
        size: 256000, // 250KB
        type: 'application/pdf',
        url: '/attachments/may_invoice.pdf'
      }
    ]
  },
  {
    id: 'e7',
    threadId: 't7',
    from: emailContacts[6], // Lukaku Tolong
    to: [emailContacts[0]],
    subject: 'Property Inspection Schedule',
    body: 'Good morning, I\'ve scheduled the property inspections for this week. Please review the schedule and let me know if any changes are needed. All tenants have been notified about the inspection times.',
    timestamp: '2024-05-05T08:00:00Z',
    isRead: true,
    priority: 'low'
  }
];

export const emailThreads: EmailThread[] = [
  {
    id: 't1',
    subject: 'Property Maintenance Request - Urgent',
    participants: [emailContacts[1], emailContacts[0]],
    emails: emails.filter(e => e.threadId === 't1'),
    lastActivity: '2024-05-06T18:30:00Z',
    isRead: false,
    hasAttachments: true
  },
  {
    id: 't2',
    subject: 'Re: Property Maintenance Request - Urgent',
    participants: [emailContacts[0], emailContacts[1]],
    emails: emails.filter(e => e.threadId === 't2'),
    lastActivity: '2024-05-06T18:45:00Z',
    isRead: true,
    hasAttachments: false
  },
  {
    id: 't3',
    subject: 'Monthly Property Report - April 2024',
    participants: [emailContacts[2], emailContacts[0]],
    emails: emails.filter(e => e.threadId === 't3'),
    lastActivity: '2024-05-06T15:20:00Z',
    isRead: false,
    hasAttachments: true
  },
  {
    id: 't4',
    subject: 'Job Completion - Water Leak Repair',
    participants: [emailContacts[3], emailContacts[0]],
    emails: emails.filter(e => e.threadId === 't4'),
    lastActivity: '2024-05-06T12:15:00Z',
    isRead: true,
    hasAttachments: true
  },
  {
    id: 't5',
    subject: 'Team Meeting Reminder - Tomorrow 2PM',
    participants: [emailContacts[4], emailContacts[0]],
    emails: emails.filter(e => e.threadId === 't5'),
    lastActivity: '2024-05-06T10:30:00Z',
    isRead: true,
    hasAttachments: false
  },
  {
    id: 't6',
    subject: 'Payment Request - May 2024',
    participants: [emailContacts[5], emailContacts[0]],
    emails: emails.filter(e => e.threadId === 't6'),
    lastActivity: '2024-05-06T09:45:00Z',
    isRead: false,
    hasAttachments: true
  },
  {
    id: 't7',
    subject: 'Property Inspection Schedule',
    participants: [emailContacts[6], emailContacts[0]],
    emails: emails.filter(e => e.threadId === 't7'),
    lastActivity: '2024-05-05T08:00:00Z',
    isRead: true,
    hasAttachments: false
  }
];

export const emailFolders: EmailFolder[] = [
  {
    id: 'inbox',
    name: 'Inbox',
    icon: 'MdInbox',
    count: 4, // Unread emails count
    type: 'inbox'
  },
  {
    id: 'sent',
    name: 'Sent',
    icon: 'MdSend',
    count: 12,
    type: 'sent'
  },
  {
    id: 'drafts',
    name: 'Drafts',
    icon: 'MdDrafts',
    count: 2,
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