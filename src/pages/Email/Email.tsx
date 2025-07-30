import React, { useState } from "react";
import { RiSearchLine, RiAddLine, RiMoreLine, RiStarLine, RiArchiveLine, RiReplyLine, RiSendPlaneLine, RiFolderLine, RiDeleteBinLine, RiCloseLine, RiMenuLine } from "react-icons/ri";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Email.scss";

interface Contact {
  id: string;
  name: string;
  email: string;
  initials: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'clicked';
}

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'clicked';
  timestamp: string;
}

const Email = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    content: ""
  });
  const [formErrors, setFormErrors] = useState({
    to: "",
    subject: "",
    content: ""
  });

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  // Mock data
  const contacts: Contact[] = [
    { id: "1", name: "John Smith", email: "johnsmith@abc.com", initials: "JS", status: 'sent' },
    { id: "2", name: "Yousef Franklin", email: "yousef_franklin@email.com", initials: "YF", status: 'delivered' },
    { id: "3", name: "Damon Magana", email: "dm_magna@gmail.com", initials: "DM", status: 'opened' },
    { id: "4", name: "Ira Webb", email: "ira.webb@company.com", initials: "IW", status: 'clicked' },
    { id: "5", name: "Brittany Duarte", email: "brittany.d@startup.io", initials: "BD", status: 'sent' },
    { id: "6", name: "Janiyah Barrera", email: "janiyah.b@tech.com", initials: "JB", status: 'delivered' },
    { id: "7", name: "Harper Collier", email: "harper.c@design.co", initials: "HC", status: 'opened' },
    { id: "8", name: "Camila Mahoney", email: "camila.m@agency.net", initials: "CM", status: 'sent' },
  ];

  const emails: Email[] = [
    {
      id: "1",
      from: "Jane Smith hsmith@gmail.com",
      to: "DM Damon Magana dm_magna@gmail.com JS Jane Smith hsmith@gmail.com",
      subject: "Elevate Your User Experience: Let's Collaborate!",
      content: `Dear [Client's Name],

I hope this email finds you well. I'm reaching out because I believe your company could greatly benefit from enhanced User Experience (UX) design services.

Here's how I can help elevate your user experience:

1. UX Research and Analysis
   - User interviews and surveys
   - Competitor analysis
   - User journey mapping

2. Wireframing and Prototyping
   - Low and high-fidelity wireframes
   - Interactive prototypes
   - User flow optimization

3. UI Design
   - Modern, clean interface design
   - Responsive design implementation
   - Design system creation

4. Usability Testing
   - A/B testing
   - User feedback collection
   - Performance optimization

5. Accessibility Compliance
   - WCAG 2.1 compliance
   - Inclusive design principles
   - Cross-platform compatibility

I'd love to schedule a brief call to discuss how we can work together to improve your user experience and drive better results for your business.

Best regards,
Jane Smith
UX Design Consultant`,
      status: 'sent',
      timestamp: "16:00 PDT May 26, 2024"
    }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactClick = (contact: Contact) => {
    const email = emails.find(e => e.id === contact.id) || emails[0];
    setSelectedEmail(email);
    // Close sidebar on mobile/tablet when contact is selected
    if (window.innerWidth <= 1023) {
      setShowSidebar(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'opened': return '#f59e0b';
      case 'clicked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateNew = () => {
    setShowComposeModal(true);
  };

  const handleCloseModal = () => {
    setShowComposeModal(false);
    setComposeForm({ to: "", subject: "", content: "" });
    setFormErrors({ to: "", subject: "", content: "" });
  };

  const handleFormChange = (field: string, value: string) => {
    setComposeForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      to: "",
      subject: "",
      content: ""
    };

    // Validate email
    if (!composeForm.to) {
      errors.to = "Email address is required";
    } else if (!validateEmail(composeForm.to)) {
      errors.to = "Please enter a valid email address";
    }

    // Validate subject
    if (!composeForm.subject.trim()) {
      errors.subject = "Subject is required";
    }

    // Validate content - check for HTML content
    const contentText = composeForm.content.replace(/<[^>]*>/g, '').trim();
    if (!contentText) {
      errors.content = "Message content is required";
    }

    setFormErrors(errors);
    return !errors.to && !errors.subject && !errors.content;
  };

  const handleSendEmail = () => {
    if (validateForm()) {
      // Here you would typically send the email via API
      console.log("Sending email:", composeForm);
      alert("Email sent successfully!");
      handleCloseModal();
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="email-page">
      <div className="email-header">
        <div className="header-left">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <RiMenuLine />
          </button>
          <button className="create-new-btn" onClick={handleCreateNew}>
            <RiAddLine />
            Create New
          </button>
        </div>
        <div className="header-right">
          <div className="search-container">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search people, events, notes"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="email-content">
        {/* Left Panel - Contact List */}
        <div className={`contact-panel ${showSidebar ? 'sidebar-open' : ''}`}>
          <div className="panel-header">
            <div className="timestamp">16:00 PDT May 26, 2024</div>
            <div className="campaign-title">Cold Email Potential Clients (3rd Stage)</div>
          </div>
          
          <div className="contact-search">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search people, events, notes"
              className="search-input"
            />
          </div>

          <div className="contact-list">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item ${selectedEmail?.id === contact.id ? 'selected' : ''}`}
                onClick={() => handleContactClick(contact)}
              >
                <div className="contact-avatar">
                  {contact.initials}
                </div>
                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-email">{contact.email}</div>
                </div>
                <div className="contact-actions">
                  <RiMoreLine />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Email Content */}
        <div className="email-panel">
          {selectedEmail ? (
            <>
              {/* Removed email-status buttons */}
              <div className="email-details">
                <div className="email-header-info">
                  <div className="email-field">
                    <span className="field-label">From:</span>
                    <span className="field-value">{selectedEmail.from}</span>
                  </div>
                  <div className="email-field">
                    <span className="field-label">To:</span>
                    <span className="field-value">{selectedEmail.to}</span>
                  </div>
                  <div className="email-field">
                    <span className="field-label">Subject:</span>
                    <span className="field-value">{selectedEmail.subject}</span>
                    <RiMoreLine className="more-icon" />
                  </div>
                </div>

                <div className="email-body">
                  <pre>{selectedEmail.content}</pre>
                </div>
              </div>
            </>
          ) : (
            <div className="no-email-selected">
              <p>Select a contact to view email details</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile/tablet when sidebar is open */}
      {showSidebar && (
        <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
      )}

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="compose-modal-overlay">
          <div className="compose-modal">
            <div className="modal-header">
              <h3>Compose New Email</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <RiCloseLine />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>To:</label>
                <input
                  type="email"
                  placeholder="Enter recipient email"
                  value={composeForm.to}
                  onChange={(e) => handleFormChange('to', e.target.value)}
                  className={formErrors.to ? 'error' : ''}
                />
                {formErrors.to && <div className="error-message">{formErrors.to}</div>}
              </div>
              
              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  placeholder="Enter email subject"
                  value={composeForm.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  className={formErrors.subject ? 'error' : ''}
                />
                {formErrors.subject && <div className="error-message">{formErrors.subject}</div>}
              </div>
              
              <div className="form-group">
                <label>Message:</label>
                <div className={`quill-container ${formErrors.content ? 'error' : ''}`}>
                  <ReactQuill
                    theme="snow"
                    value={composeForm.content}
                    onChange={(value) => handleFormChange('content', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Type your message here..."
                  />
                </div>
                {formErrors.content && <div className="error-message">{formErrors.content}</div>}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button 
                className="send-btn" 
                onClick={handleSendEmail}
              >
                <RiSendPlaneLine />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu (hidden by default, would be shown on right-click) */}
      <div className="context-menu" style={{ display: 'none' }}>
        <div className="menu-item">
          <RiStarLine />
          <span>Favorite</span>
        </div>
        <div className="menu-item">
          <RiArchiveLine />
          <span>Archive</span>
        </div>
        <div className="menu-item">
          <RiReplyLine />
          <span>Reply</span>
          <span className="shortcut">⇧ Z</span>
        </div>
        <div className="menu-item">
          <RiSendPlaneLine />
          <span>Forward</span>
          <span className="shortcut">⇧ ⌘ Z</span>
        </div>
        <div className="menu-item">
          <RiFolderLine />
          <span>Move to folder</span>
        </div>
        <div className="menu-item">
          <RiDeleteBinLine />
          <span>Delete</span>
        </div>
        <div className="menu-item">
          <span>Peace & Love</span>
        </div>
        <div className="menu-item">
          <RiSendPlaneLine />
          <span>Send to</span>
        </div>
      </div>
    </div>
  );
};

export default Email; 