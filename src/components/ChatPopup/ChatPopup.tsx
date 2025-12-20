import React, { useState, useRef, useEffect } from "react";
import {
  RiSendPlaneFill,
  RiAttachment2,
  RiCloseLine,
  RiUser3Line,
  RiCustomerService2Line,
  RiTimeLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiFileTextLine,
  RiImageLine,
  RiCloseCircleLine,
  RiDownloadLine,
} from "react-icons/ri";
import chatService from "../../services/chatService";
import toast from "react-hot-toast";
import "./ChatPopup.scss";

// Types
interface ChatMessage {
  id: string;
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
  attachment?: {
    type: "image" | "document";
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  };
  metadata?: {
    deliveryStatus: "sent" | "delivered" | "failed";
    readBy?: Array<{
      userId: string;
      userType: string;
      readAt: string;
    }>;
  };
}

interface ChatSession {
  id: string;
  status: "waiting" | "active" | "closed";
  subject: string;
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
  };
  createdAt: string;
  acceptedAt?: string;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    type: "agency" | "super_user" | "team_member";
    name: string;
    email: string;
  };
  session?: ChatSession;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  typingUser?: string;
  onSendMessage: (message: string) => void;
  onInitiateChat: (subject: string, initialMessage: string) => void;
  onAcceptChat?: (sessionId: string) => void;
  onCloseChat?: (sessionId: string) => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({
  isOpen,
  onClose,
  currentUser,
  session,
  messages,
  isLoading,
  isTyping,
  typingUser,
  onSendMessage,
  onInitiateChat,
  onAcceptChat,
  onCloseChat,
}) => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [showInitialForm, setShowInitialForm] = useState(
    !session || session?.status === "closed"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current && !showInitialForm) {
      inputRef.current.focus();
    }
  }, [isOpen, showInitialForm]);

  // Update showInitialForm when session changes
  useEffect(() => {
    setShowInitialForm(!session || session?.status === "closed");
  }, [session]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleInitiateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialMessage.trim() && !isLoading) {
      onInitiateChat(
        subject.trim() || "Support Request",
        initialMessage.trim()
      );
      setShowInitialForm(false);
      setSubject("");
      setInitialMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showInitialForm) {
        handleInitiateChat(e);
      } else {
        handleSendMessage(e);
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Supported: Images, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP"
      );
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Reset file input
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSendWithAttachment = async () => {
    if (!selectedFile || !session?.id) return;

    setIsUploadingFile(true);
    try {
      // Call chatService directly - no Redux needed for file uploads
      await chatService.sendAttachment(
        session.id,
        selectedFile,
        message.trim() || undefined
      );

      // Clear after successful upload
      setSelectedFile(null);
      setFilePreview(null);
      setMessage("");
      toast.success("File sent successfully");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to send file");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getMessageStatusIcon = (msg: ChatMessage) => {
    if (msg.sender.userId === currentUser.id) {
      const status = msg.metadata?.deliveryStatus;
      switch (status) {
        case "sent":
          return <RiLoader4Line className="status-icon sending" />;
        case "delivered":
          return <RiCheckDoubleLine className="status-icon delivered" />;
        case "failed":
          return <RiErrorWarningLine className="status-icon failed" />;
        default:
          return null;
      }
    }
    return null;
  };

  const getSenderIcon = (userType: string) => {
    switch (userType) {
      case "Agency":
        return <RiUser3Line className="sender-icon agency" />;
      case "SuperUser":
      case "TeamMember":
        return <RiCustomerService2Line className="sender-icon support" />;
      case "System":
        return <RiTimeLine className="sender-icon system" />;
      default:
        return <RiUser3Line className="sender-icon" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-popup">
      <div className={`chat-container ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <div className="header-info">
              <div className="header-title">
                {session ? (
                  <>
                    <span className="title">{session.subject}</span>
                    <div className="status-indicator">
                      <div className={`status-dot ${session.status}`}></div>
                      <span className="status-text">
                        {session.status === "waiting" && "Waiting for support"}
                        {session.status === "active" &&
                          session.assignedTo &&
                          "Connected"}
                        {session.status === "active" &&
                          !session.assignedTo &&
                          "Waiting for agent"}
                        {session.status === "closed" && "Chat ended"}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="title">Chat Support</span>
                )}
              </div>
              {session?.assignedTo && (
                <div className="agent-info">
                  <RiCustomerService2Line className="agent-icon" />
                  <span className="agent-name">
                    {session.assignedTo.userName}
                  </span>
                </div>
              )}
            </div>
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Close chat"
              type="button"
            >
              <RiCloseLine />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="chat-content">
          {showInitialForm ? (
            /* Initial Chat Form */
            <div className="initial-form">
              <div className="form-header">
                <RiCustomerService2Line className="form-icon" />
                <h3>Start a conversation</h3>
                <p>
                  We're here to help! Tell us what you need assistance with.
                </p>
              </div>

              <form onSubmit={handleInitiateChat} className="chat-form">
                <div className="input-group">
                  <label htmlFor="chat-subject">Subject (optional)</label>
                  <input
                    id="chat-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What do you need help with?"
                    maxLength={200}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="initial-message">Your message *</label>
                  <textarea
                    id="initial-message"
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your question or issue..."
                    rows={4}
                    maxLength={2000}
                    required
                  />
                  <div className="char-count">{initialMessage.length}/2000</div>
                </div>

                <button
                  type="submit"
                  className="start-chat-button"
                  disabled={!initialMessage.trim() || isLoading}
                >
                  {isLoading ? (
                    <RiLoader4Line className="loading-icon" />
                  ) : (
                    <RiSendPlaneFill />
                  )}
                  Start Chat
                </button>
              </form>
            </div>
          ) : (
            /* Chat Messages */
            <>
              <div className="messages-container">
                {messages.length === 0 && !isLoading ? (
                  <div className="empty-messages">
                    <RiCustomerService2Line className="empty-icon" />
                    <p>Your conversation will appear here</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${
                        msg.sender.userId === currentUser.id ? "own" : "other"
                      } ${msg.messageType}`}
                    >
                      <div className="message-content">
                        <div className="message-header">
                          {getSenderIcon(msg.sender.userType)}
                          <span className="sender-name">
                            {msg.sender.userName}
                          </span>
                          <span className="message-time">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>

                        <div className="message-body">
                          {msg.messageType === "system" ? (
                            <div className="system-message">
                              <RiTimeLine className="system-icon" />
                              <span>{msg.content.text}</span>
                            </div>
                          ) : (
                            <>
                              {msg.attachment?.url && (
                                <div className="message-attachment">
                                  {msg.attachment.type === "image" ? (
                                    <div className="attachment-image">
                                      <img
                                        src={msg.attachment.url}
                                        alt={msg.attachment.originalName}
                                        loading="lazy"
                                      />
                                      <a
                                        href={msg.attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="download-overlay"
                                        title="Open in new tab"
                                      >
                                        <RiDownloadLine />
                                      </a>
                                    </div>
                                  ) : (
                                    <a
                                      href={msg.attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="attachment-file"
                                    >
                                      <RiFileTextLine className="file-icon" />
                                      <div className="file-details">
                                        <span className="file-name">
                                          {msg.attachment.originalName}
                                        </span>
                                        <span className="file-size">
                                          {formatFileSize(msg.attachment.size)}
                                        </span>
                                      </div>
                                      <RiDownloadLine className="download-icon" />
                                    </a>
                                  )}
                                </div>
                              )}
                              {msg.content?.text && (
                                <div className="text-message">
                                  <p>{msg.content.text}</p>
                                  {getMessageStatusIcon(msg)}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {isTyping && typingUser && (
                  <div className="typing-indicator">
                    <div className="typing-content">
                      <RiCustomerService2Line className="typing-icon" />
                      <span className="typing-text">
                        {typingUser} is typing
                      </span>
                      <div className="typing-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Action Buttons (for support agents) */}
              {(currentUser.type === "super_user" ||
                currentUser.type === "team_member") &&
                session?.status === "waiting" && (
                  <div className="action-buttons">
                    <button
                      className="accept-button"
                      onClick={() => onAcceptChat?.(session.id)}
                      disabled={isLoading}
                    >
                      Accept Chat
                    </button>
                  </div>
                )}

              {/* Message Input */}
              {session?.status !== "closed" && (
                <div className="message-input-container">
                  {/* File Preview */}
                  {selectedFile && (
                    <div className="file-preview">
                      <div className="preview-content">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="preview-image"
                          />
                        ) : (
                          <div className="file-icon-preview">
                            <RiFileTextLine className="file-icon" />
                          </div>
                        )}
                        <div className="file-info">
                          <span className="file-name">
                            {selectedFile.name}
                          </span>
                          <span className="file-size">
                            {formatFileSize(selectedFile.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="remove-file-button"
                          onClick={handleRemoveFile}
                          aria-label="Remove file"
                        >
                          <RiCloseCircleLine />
                        </button>
                      </div>
                      {message.trim() && (
                        <div className="file-caption">
                          <span>Caption: {message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="message-form">
                    <div className="input-container">
                      <textarea
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          selectedFile
                            ? "Add a caption (optional)..."
                            : "Type your message..."
                        }
                        rows={1}
                        maxLength={2000}
                        disabled={isLoading || session?.status === "closed"}
                      />

                      <div className="input-actions">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                        />
                        <button
                          type="button"
                          className="attachment-button"
                          onClick={handleAttachmentClick}
                          aria-label="Attach file"
                          disabled={isLoading || isUploadingFile}
                        >
                          <RiAttachment2 />
                        </button>

                        <button
                          type={selectedFile ? "button" : "submit"}
                          className="send-button"
                          onClick={
                            selectedFile
                              ? handleSendWithAttachment
                              : undefined
                          }
                          disabled={
                            selectedFile
                              ? isUploadingFile
                              : !message.trim() || isLoading
                          }
                          aria-label="Send message"
                        >
                          {isLoading || isUploadingFile ? (
                            <RiLoader4Line className="loading-icon" />
                          ) : (
                            <RiSendPlaneFill />
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {session &&
          (session.status === "active" ||
            (session.status === "waiting" &&
              currentUser.type === "agency")) && (
            <div className="chat-footer">
              <button
                className="end-chat-button"
                onClick={() => onCloseChat?.(session.id)}
                disabled={isLoading}
              >
                {currentUser.type === "agency" ? "Close Chat" : "End Chat"}
              </button>
            </div>
          )}
      </div>

      {/* Backdrop */}
      {/* <div className="chat-backdrop" onClick={onClose} /> */}
    </div>
  );
};

export default ChatPopup;
