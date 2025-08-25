/**
 * Email Compose Modal Component
 * Rich email composition with attachments
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MdClose, 
  MdSend, 
  MdAttachFile, 
  MdDelete,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdLink,
  MdImage,
  MdMoreVert,
  MdMinimize,
  MdMaximize,
  MdSave
} from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { sendEmail, replyToEmail, saveDraft, closeCompose } from '../../store/emailSlice';
import emailService from '../../services/emailService';
import './ComposeModal.scss';

// For rich text editor - we'll use a simple contentEditable for now
// In production, consider using TinyMCE, Quill, or Slate

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: any;
  defaultTo?: string;
  defaultSubject?: string;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  replyTo,
  defaultTo = '',
  defaultSubject = ''
}) => {
  const dispatch = useAppDispatch();
  const { sendingEmail, error } = useAppSelector(state => state.email);
  const currentUser = useAppSelector(state => state.user.user);
  
  // Form state
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [bodyHtml, setBodyHtml] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // UI state
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout>();
  
  // Initialize for reply
  useEffect(() => {
    if (replyTo) {
      setTo(emailService.formatEmailAddress(replyTo.from));
      setSubject(replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`);
      
      // Add quoted text
      const quotedHtml = `
        <br><br>
        <div style="border-left: 2px solid #ccc; padding-left: 10px; color: #666;">
          On ${new Date(replyTo.timestamp).toLocaleString()}, ${replyTo.from.name || replyTo.from.email} wrote:<br>
          ${replyTo.bodyHtml || replyTo.bodyText}
        </div>
      `;
      setBodyHtml(quotedHtml);
    }
  }, [replyTo]);
  
  // Auto-save draft
  useEffect(() => {
    if (isOpen && (to || subject || bodyHtml)) {
      autoSaveTimer.current = setTimeout(() => {
        dispatch(saveDraft({
          to: emailService.parseEmailAddresses(to),
          cc: emailService.parseEmailAddresses(cc),
          bcc: emailService.parseEmailAddresses(bcc),
          subject,
          bodyHtml
        } as any));
        console.log('📝 Draft saved');
      }, 3000); // Save after 3 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [to, cc, bcc, subject, bodyHtml, dispatch, isOpen]);
  
  // Validate email addresses
  const validateEmails = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (!to.trim()) {
      newErrors.to = 'At least one recipient is required';
    } else {
      const toAddresses = emailService.parseEmailAddresses(to);
      const invalidTo = toAddresses.find(addr => !emailService.isValidEmail(addr.email));
      if (invalidTo) {
        newErrors.to = `Invalid email: ${invalidTo.email}`;
      }
    }
    
    if (cc.trim()) {
      const ccAddresses = emailService.parseEmailAddresses(cc);
      const invalidCc = ccAddresses.find(addr => !emailService.isValidEmail(addr.email));
      if (invalidCc) {
        newErrors.cc = `Invalid email: ${invalidCc.email}`;
      }
    }
    
    if (bcc.trim()) {
      const bccAddresses = emailService.parseEmailAddresses(bcc);
      const invalidBcc = bccAddresses.find(addr => !emailService.isValidEmail(addr.email));
      if (invalidBcc) {
        newErrors.bcc = `Invalid email: ${invalidBcc.email}`;
      }
    }
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!bodyHtml.trim() && !editorRef.current?.textContent?.trim()) {
      newErrors.body = 'Message body is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [to, cc, bcc, subject, bodyHtml]);
  
  // Handle send
  const handleSend = async () => {
    if (!validateEmails()) {
      return;
    }
    
    const emailData = {
      to: emailService.parseEmailAddresses(to),
      cc: emailService.parseEmailAddresses(cc),
      bcc: emailService.parseEmailAddresses(bcc),
      subject,
      bodyHtml: editorRef.current?.innerHTML || bodyHtml,
      bodyText: editorRef.current?.textContent || emailService.stripHtml(bodyHtml),
      attachments
    };
    
    if (replyTo) {
      await dispatch(replyToEmail({
        emailId: replyTo._id,
        data: {
          bodyHtml: emailData.bodyHtml,
          bodyText: emailData.bodyText,
          replyAll: emailData.cc.length > 0,
          attachments: emailData.attachments
        }
      }));
    } else {
      await dispatch(sendEmail(emailData));
    }
    
    if (!error) {
      onClose();
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size (10MB limit per file)
      const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrors({
          ...errors,
          attachments: `Files exceed 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`
        });
        return;
      }
      
      setAttachments([...attachments, ...newFiles]);
      setErrors({ ...errors, attachments: '' });
    }
  };
  
  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setAttachments([...attachments, ...files]);
  };
  
  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  // Format toolbar actions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={`compose-modal-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
      <div 
        className={`compose-modal ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="compose-header">
          <h3>{replyTo ? 'Reply' : 'New Message'}</h3>
          <div className="header-actions">
            <button 
              className="icon-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Restore" : "Minimize"}
            >
              {isMinimized ? <MdMaximize /> : <MdMinimize />}
            </button>
            <button 
              className="icon-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <MdMaximize />
            </button>
            <button className="icon-btn close-btn" onClick={onClose}>
              <MdClose />
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            {/* Recipients */}
            <div className="compose-form">
              <div className={`form-group ${errors.to ? 'has-error' : ''}`}>
                <label>To:</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className={errors.to ? 'error' : ''}
                  />
                  <div className="input-actions">
                    <button 
                      className="link-btn"
                      onClick={() => setShowCc(!showCc)}
                    >
                      Cc
                    </button>
                    <button 
                      className="link-btn"
                      onClick={() => setShowBcc(!showBcc)}
                    >
                      Bcc
                    </button>
                  </div>
                </div>
                {errors.to && <span className="error-message">{errors.to}</span>}
              </div>
              
              {showCc && (
                <div className={`form-group ${errors.cc ? 'has-error' : ''}`}>
                  <label>Cc:</label>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="cc@example.com"
                    className={errors.cc ? 'error' : ''}
                  />
                  {errors.cc && <span className="error-message">{errors.cc}</span>}
                </div>
              )}
              
              {showBcc && (
                <div className={`form-group ${errors.bcc ? 'has-error' : ''}`}>
                  <label>Bcc:</label>
                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="bcc@example.com"
                    className={errors.bcc ? 'error' : ''}
                  />
                  {errors.bcc && <span className="error-message">{errors.bcc}</span>}
                </div>
              )}
              
              <div className={`form-group ${errors.subject ? 'has-error' : ''}`}>
                <label>Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className={errors.subject ? 'error' : ''}
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>
              
              {/* Rich Text Editor */}
              <div className={`editor-wrapper ${errors.body ? 'has-error' : ''}`}>
                <div className="editor-toolbar">
                  <button 
                    className="toolbar-btn"
                    onClick={() => formatText('bold')}
                    title="Bold"
                  >
                    <MdFormatBold />
                  </button>
                  <button 
                    className="toolbar-btn"
                    onClick={() => formatText('italic')}
                    title="Italic"
                  >
                    <MdFormatItalic />
                  </button>
                  <button 
                    className="toolbar-btn"
                    onClick={() => formatText('underline')}
                    title="Underline"
                  >
                    <MdFormatUnderlined />
                  </button>
                  <div className="toolbar-separator" />
                  <button 
                    className="toolbar-btn"
                    onClick={() => formatText('insertUnorderedList')}
                    title="Bullet list"
                  >
                    <MdFormatListBulleted />
                  </button>
                  <button 
                    className="toolbar-btn"
                    onClick={() => formatText('insertOrderedList')}
                    title="Numbered list"
                  >
                    <MdFormatListNumbered />
                  </button>
                  <div className="toolbar-separator" />
                  <button 
                    className="toolbar-btn"
                    onClick={() => {
                      const url = prompt('Enter URL:');
                      if (url) formatText('createLink', url);
                    }}
                    title="Insert link"
                  >
                    <MdLink />
                  </button>
                </div>
                
                <div
                  ref={editorRef}
                  className="editor-content"
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  onInput={(e) => setBodyHtml(e.currentTarget.innerHTML)}
                  data-placeholder="Compose your email..."
                />
                {errors.body && <span className="error-message">{errors.body}</span>}
              </div>
              
              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="attachments-list">
                  <label>Attachments:</label>
                  <div className="attachment-items">
                    {attachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <MdAttachFile />
                        <span className="filename">{file.name}</span>
                        <span className="filesize">
                          {emailService.formatFileSize(file.size)}
                        </span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeAttachment(index)}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.attachments && (
                    <span className="error-message">{errors.attachments}</span>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="compose-actions">
                <div className="left-actions">
                  <button 
                    className="attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <MdAttachFile />
                    Attach Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileSelect}
                  />
                </div>
                
                <div className="right-actions">
                  <button className="save-draft-btn">
                    <MdSave />
                    Save Draft
                  </button>
                  <button className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button 
                    className="send-btn"
                    onClick={handleSend}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <MdSend />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="error-banner">
                  {error}
                </div>
              )}
            </div>
            
            {/* Drag overlay */}
            {isDragging && (
              <div className="drag-overlay">
                <div className="drag-content">
                  <MdAttachFile />
                  <p>Drop files here to attach</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};