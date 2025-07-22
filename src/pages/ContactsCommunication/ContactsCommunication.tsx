import { useState, useEffect } from "react";
import {
  RiSearchLine,
  RiFilterLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMailLine,
  RiPhoneLine,
  RiNotificationLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
} from "react-icons/ri";
import { ContactFormModal, ConfirmationModal } from "../../components";
import "./ContactsCommunication.scss";
import { contactsAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import EmailContactModal from "../../components/EmailContactModal";

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  notes: string;
  preferredContact: string;
}

interface NotificationSettings {
  jobConfirmations: boolean;
  upcomingAppointments: boolean;
  invoiceReminders: boolean;
}

interface ContactFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  notes: string;
  preferredContact: string;
}

const ContactsCommunication = () => {
  const userType = useAppSelector((state) => state.user.userType);
  const isSuperUser = userType === "super_user";

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    jobConfirmations: true,
    upcomingAppointments: true,
    invoiceReminders: false,
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailContact, setEmailContact] = useState<Contact | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contactsAPI.getContacts();
      // API returns { status, data: { contacts } }
      setContacts(
        (res.data.data.contacts || []).map((c: any) => ({
          id: c._id,
          name: c.name,
          role: c.role,
          email: c.email,
          phone: c.phone,
          notes: c.notes,
          preferredContact: c.preferredContact,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || contact.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Roles: for superuser, do not include 'Agency' in the list
  const roles = isSuperUser
    ? ["Admin", "Finance"]
    : ["Agency", "Admin", "Finance"];

  const handleNotificationToggle = (setting: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setShowContactModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const handleDeleteContact = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      setLoading(true);
      setError(null);
      try {
        await contactsAPI.deleteContact(deleteConfirmId);
        setContacts((prev) => prev.filter((c) => c.id !== deleteConfirmId));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete contact");
      } finally {
        setLoading(false);
        setDeleteConfirmId(null);
      }
    }
  };

  const handleSubmitContact = async (formData: ContactFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (editingContact) {
        // Update existing contact
        const res = await contactsAPI.updateContact(
          editingContact.id,
          formData
        );
        setContacts((prev) =>
          prev.map((c) =>
            c.id === editingContact.id ? { ...c, ...formData } : c
          )
        );
      } else {
        // Add new contact
        const res = await contactsAPI.createContact(formData);
        const newContact = res.data.data.contact;
        setContacts((prev) => [
          ...prev,
          {
            id: newContact._id,
            name: newContact.name,
            role: newContact.role,
            email: newContact.email,
            phone: newContact.phone,
            notes: newContact.notes,
            preferredContact: newContact.preferredContact,
          },
        ]);
      }
      setShowContactModal(false);
      setEditingContact(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmailModal = (contact: Contact) => {
    setEmailContact(contact);
    setEmailModalOpen(true);
    setEmailError(null);
    setEmailSuccess(null);
  };

  const handleSendEmail = async (subject: string, html: string) => {
    if (!emailContact) return;
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      await contactsAPI.sendEmailToContact(emailContact.id, { subject, html });
      setEmailSuccess("Email sent successfully!");
    } catch (err: any) {
      setEmailError(err.response?.data?.message || "Failed to send email");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Contacts & Communication</h1>
        <p>
          Manage{" "}
          {isSuperUser
            ? "contacts and automated notifications"
            : "agency contacts and automated notifications"}
        </p>
      </div>

      {/* Contacts Section */}
      <div className="content-card contacts-section">
        <div className="section-header">
          <h2>{isSuperUser ? "Contacts" : "Agency Contacts"}</h2>
          <button className="btn-primary" onClick={handleAddContact}>
            <RiAddLine />
            Add Contact
          </button>
        </div>

        <div className="search-filter-bar">
          <div className="search-box">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search contacts by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <RiFilterLine className="filter-icon" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="contacts-table">
          <div className="table-header">
            <div className="col-name">Name</div>
            <div className="col-role">Role</div>
            <div className="col-contact">Contact Info</div>
            <div className="col-notes">Notes / Preferred Method</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="table-body">
            {loading ? (
              <p>Loading contacts...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : filteredContacts.length === 0 ? (
              <div className="no-results">
                <p>No contacts found matching your criteria.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div key={contact.id} className="table-row">
                  <div className="col-name">
                    <div className="contact-name">{contact.name}</div>
                  </div>
                  <div className="col-role">
                    <span
                      className={`role-badge ${contact.role
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {contact.role}
                    </span>
                  </div>
                  <div className="col-contact">
                    <div className="contact-info">
                      <div className="email">
                        <RiMailLine />
                        <span>{contact.email}</span>
                      </div>
                      <div className="phone">
                        <RiPhoneLine />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-notes">
                    <div className="notes-content">
                      <p>{contact.notes}</p>
                      <span className="preferred-method">
                        Preferred: {contact.preferredContact}
                      </span>
                    </div>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditContact(contact)}
                      title="Edit Contact"
                    >
                      <RiEditLine />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteContact(contact.id)}
                      title="Delete Contact"
                    >
                      <RiDeleteBinLine />
                    </button>
                    <button
                      className="action-btn email-btn"
                      onClick={() => handleOpenEmailModal(contact)}
                      title="Send Email"
                    >
                      <RiMailLine />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Automated Notifications Section */}
      {/* <div className="content-card notifications-section">
        <div className="section-header">
          <h2>Automated Notifications</h2>
          <RiNotificationLine className="section-icon" />
        </div>

        <p className="section-description">
          Set up automatic emails or SMS notifications for important events
        </p>

        <div className="notification-settings">
          <div className="notification-item">
            <button
              className="notification-toggle"
              onClick={() => handleNotificationToggle("jobConfirmations")}
            >
              {notifications.jobConfirmations ? (
                <RiCheckboxCircleLine className="checkbox-checked" />
              ) : (
                <RiCheckboxBlankCircleLine className="checkbox-unchecked" />
              )}
            </button>
            <div className="notification-content">
              <h4>Job Confirmations</h4>
              <p>
                Automatically notify relevant parties when jobs are confirmed
              </p>
            </div>
          </div>

          <div className="notification-item">
            <button
              className="notification-toggle"
              onClick={() => handleNotificationToggle("upcomingAppointments")}
            >
              {notifications.upcomingAppointments ? (
                <RiCheckboxCircleLine className="checkbox-checked" />
              ) : (
                <RiCheckboxBlankCircleLine className="checkbox-unchecked" />
              )}
            </button>
            <div className="notification-content">
              <h4>Upcoming Appointments</h4>
              <p>Send reminders for scheduled appointments and inspections</p>
            </div>
          </div>

          <div className="notification-item">
            <button
              className="notification-toggle"
              onClick={() => handleNotificationToggle("invoiceReminders")}
            >
              {notifications.invoiceReminders ? (
                <RiCheckboxCircleLine className="checkbox-checked" />
              ) : (
                <RiCheckboxBlankCircleLine className="checkbox-unchecked" />
              )}
            </button>
            <div className="notification-content">
              <h4>Invoice Reminders</h4>
              <p>Automatically send payment reminders for overdue invoices</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSubmit={handleSubmitContact}
        editingContact={editingContact}
        roles={roles}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonType="danger"
      />

      {/* Email Contact Modal */}
      <EmailContactModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSend={handleSendEmail}
        to={emailContact?.email || ""}
        contactName={emailContact?.name}
        loading={emailLoading}
        error={emailError}
        success={emailSuccess}
      />
    </div>
  );
};

export default ContactsCommunication;
