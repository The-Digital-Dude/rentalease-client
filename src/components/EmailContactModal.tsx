import { useState } from "react";
import Modal from "./Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EmailContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, html: string) => void;
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    onSend(subject, body);
  };

  const handleClose = () => {
    setSubject("");
    setBody("");
    onClose();
  };

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
    </Modal>
  );
};

export default EmailContactModal;
