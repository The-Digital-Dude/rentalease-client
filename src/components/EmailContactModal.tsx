import { useState, useRef, useEffect } from "react";
import {
  RiImageLine,
  RiFilePdfLine,
  RiFileLine,
  RiEyeLine,
  RiCloseLine,
  RiAttachmentLine,
} from "react-icons/ri";
import Modal from "./Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EmailContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, html: string, attachments?: File[]) => void;
  to: string;
  contactName?: string;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

const EmailContactModal = ({
  isOpen,
  onClose,
  onSend,
  to,
  contactName,
  loading = false,
  error = null,
  success = null,
}: EmailContactModalProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    onSend(subject, body, attachments.length > 0 ? attachments : undefined);
  };

  const handleClose = () => {
    setSubject("");
    setBody("");
    setAttachments([]);
    setAttachmentError("");
    setPreviewFile(null);
    setPreviewUrl(null);
    setTextContent(null);
    setLoadingText(false);
    onClose();
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Check file size (10MB limit per file)
      const oversizedFiles = newFiles.filter((f) => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setAttachmentError(
          `Files exceed 10MB limit: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }

      setAttachments([...attachments, ...newFiles]);
      setAttachmentError("");
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

    // Check file size (10MB limit per file)
    const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setAttachmentError(
        `Files exceed 10MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    setAttachments([...attachments, ...files]);
    setAttachmentError("");
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setAttachmentError("");
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file type
  const getFileType = (file: File): string => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.startsWith("text/")) return "text";
    return "other";
  };

  // Handle preview
  const handlePreview = async (file: File) => {
    setPreviewFile(file);
    const fileType = getFileType(file);

    if (fileType === "image" || fileType === "pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setTextContent(null);
    } else if (fileType === "text") {
      setLoadingText(true);
      setTextContent(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target?.result as string);
        setLoadingText(false);
      };
      reader.onerror = () => {
        setTextContent("Error reading file");
        setLoadingText(false);
      };
      reader.readAsText(file);
    }
  };

  // Close preview
  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    setTextContent(null);
    setLoadingText(false);
  };

  // Cleanup preview URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Send Email to ${contactName || to}`}
      size="large"
    >
      <form onSubmit={handleSend} className="email-contact-form">
        <div className="form-group">
          <label>To</label>
          <input type="email" value={to} readOnly />
        </div>
        <div className="form-group">
          <label>Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Message *</label>
          <ReactQuill
            value={body}
            onChange={setBody}
            theme="snow"
            style={{ minHeight: 180, marginBottom: 16 }}
            readOnly={loading}
          />
        </div>

        {/* Attachments Section */}
        <div className="form-group">
          <label>Attachments</label>
          <div
            className={`attachment-dropzone ${isDragging ? "dragging" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #ccc",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: isDragging ? "#f0f8ff" : "#fafafa",
              transition: "all 0.2s ease",
              marginBottom: "10px",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
              disabled={loading}
            />
            <div
              style={{
                margin: 0,
                color: "#666",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <RiAttachmentLine style={{ fontSize: "18px" }} />
                <span>Click to select files or drag and drop here</span>
              </div>
              <small style={{ color: "#999" }}>(Max 10MB per file)</small>
            </div>
          </div>

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {attachments.map((file, index) => {
                const fileType = getFileType(file);
                const canPreview =
                  fileType === "image" ||
                  fileType === "pdf" ||
                  fileType === "text";

                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      cursor: canPreview ? "pointer" : "default",
                    }}
                    onClick={() => canPreview && handlePreview(file)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "18px",
                          color: "#64748b",
                        }}
                      >
                        {fileType === "image" ? (
                          <RiImageLine />
                        ) : fileType === "pdf" ? (
                          <RiFilePdfLine />
                        ) : (
                          <RiFileLine />
                        )}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.name}
                          {canPreview && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#2563eb",
                                marginLeft: "6px",
                              }}
                            >
                              (click to preview)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      {canPreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(file);
                          }}
                          disabled={loading}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            cursor: "pointer",
                            fontSize: "18px",
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Preview file"
                        >
                          <RiEyeLine />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(index);
                        }}
                        disabled={loading}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#d32f2f",
                          cursor: "pointer",
                          fontSize: "18px",
                          padding: "4px 8px",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title="Remove attachment"
                      >
                        <RiCloseLine />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {attachmentError && (
            <div style={{ color: "red", fontSize: "14px", marginTop: "8px" }}>
              {attachmentError}
            </div>
          )}
        </div>

        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        {success && (
          <div style={{ color: "green", marginBottom: 8 }}>{success}</div>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !subject.trim() || !body.trim()}
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={handleClosePreview}
          title={`Preview: ${previewFile.name}`}
          size="large"
        >
          <div style={{ maxHeight: "70vh", overflow: "auto" }}>
            {getFileType(previewFile) === "image" && previewUrl && (
              <div style={{ textAlign: "center" }}>
                <img
                  src={previewUrl}
                  alt={previewFile.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            {getFileType(previewFile) === "pdf" && previewUrl && (
              <div style={{ width: "100%", height: "70vh" }}>
                <iframe
                  src={previewUrl}
                  title={previewFile.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            {getFileType(previewFile) === "text" && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "70vh",
                  overflow: "auto",
                }}
              >
                {loadingText ? (
                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Loading text content...
                  </div>
                ) : textContent !== null ? (
                  <div>{textContent}</div>
                ) : (
                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Unable to preview this file
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClosePreview}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default EmailContactModal;
