import { useState, useEffect } from "react";
import { RiSaveLine } from "react-icons/ri";
import Modal from "../Modal";
import "./ContactFormModal.scss";

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  notes: string;
  preferredContact: string;
}

interface ContactFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  notes: string;
  preferredContact: string;
}

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => void;
  editingContact?: Contact | null;
  roles: string[];
}

const ContactFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingContact,
  roles,
}: ContactFormModalProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    role: "",
    email: "",
    phone: "",
    notes: "",
    preferredContact: "Email",
  });

  // Update form data when editing contact changes
  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name,
        role: editingContact.role,
        email: editingContact.email,
        phone: editingContact.phone,
        notes: editingContact.notes,
        preferredContact: editingContact.preferredContact,
      });
    } else {
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        notes: "",
        preferredContact: "Email",
      });
    }
  }, [editingContact]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      role: "",
      email: "",
      phone: "",
      notes: "",
      preferredContact: "Email",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingContact ? "Edit Contact" : "Add New Contact"}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="preferredContact">Preferred Contact Method</label>
          <select
            id="preferredContact"
            name="preferredContact"
            value={formData.preferredContact}
            onChange={handleInputChange}
          >
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Both">Both</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="Any additional notes or preferences..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            <RiSaveLine />
            {editingContact ? "Update Contact" : "Add Contact"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactFormModal;
