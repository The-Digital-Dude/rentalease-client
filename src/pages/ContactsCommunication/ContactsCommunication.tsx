import { useState } from "react";
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

  // Sample contacts data
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Property Manager",
      email: "sarah.johnson@agency.com",
      phone: "+1 (555) 123-4567",
      notes: "Prefers email for routine communications",
      preferredContact: "Email",
    },
    {
      id: "2",
      name: "Mike Chen",
      role: "Admin",
      email: "mike.chen@agency.com",
      phone: "+1 (555) 987-6543",
      notes: "Available for urgent calls until 8 PM",
      preferredContact: "Phone",
    },
    {
      id: "3",
      name: "Lisa Rodriguez",
      role: "Finance",
      email: "lisa.rodriguez@agency.com",
      phone: "+1 (555) 456-7890",
      notes: "Best reached via email for financial matters",
      preferredContact: "Email",
    },
  ]);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || contact.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roles = ["Property Manager", "Admin", "Finance"];

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

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      setContacts((prev) =>
        prev.filter((contact) => contact.id !== deleteConfirmId)
      );
      setDeleteConfirmId(null);
    }
  };

  const handleSubmitContact = (formData: ContactFormData) => {
    if (editingContact) {
      // Update existing contact
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === editingContact.id
            ? { ...editingContact, ...formData }
            : contact
        )
      );
    } else {
      // Add new contact
      const newContact: Contact = {
        id: Date.now().toString(),
        ...formData,
      };
      setContacts((prev) => [...prev, newContact]);
    }

    setShowContactModal(false);
    setEditingContact(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Contacts & Communication</h1>
        <p>Manage property manager contacts and automated notifications</p>
      </div>

      {/* Property Manager Contacts Section */}
      <div className="content-card contacts-section">
        <div className="section-header">
          <h2>Property Manager Contacts</h2>
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
            {filteredContacts.map((contact) => (
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredContacts.length === 0 && (
          <div className="no-results">
            <p>No contacts found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Automated Notifications Section */}
      <div className="content-card notifications-section">
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
      </div>

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
    </div>
  );
};

export default ContactsCommunication;
