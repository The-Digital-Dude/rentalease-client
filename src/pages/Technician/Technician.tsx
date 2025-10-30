import { useState, useEffect, useCallback, useRef } from "react";
import {
  RiTeamLine,
  RiCalendarLine,
  RiUserAddLine,
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiSaveLine,
  RiCloseLine,
  RiMapPinLine,
  RiStarLine,
  RiPhoneLine,
  RiMailLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import {
  technicianService,
  jobService,
  type Technician,
  type TechnicianFilters,
  type CreateTechnicianData,
  type Job,
} from "../../services";
import TechnicianCard from "../../components/TechnicianCard";
import EmailContactModal from "../../components/EmailContactModal";
import "./Technician.scss";
import toast from "react-hot-toast";

interface CreateTechnicianFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  experience: string;
  availabilityStatus: string;
  status: string;
  maxJobs: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
}

interface TechnicianFormErrors {
  [key: string]: string;
}

const TechnicianPage = () => {
  const [activeTab, setActiveTab] = useState("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Form state for creating/editing technician
  const [formData, setFormData] = useState<CreateTechnicianFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    experience: "",
    availabilityStatus: "Available",
    status: "Active",
    maxJobs: "4",
    address: {
      street: "",
      suburb: "",
      state: "",
      postcode: "",
    },
  });
  const [formErrors, setFormErrors] = useState<TechnicianFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(
    null
  );

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTechnician, setViewingTechnician] = useState<Technician | null>(
    null
  );
  const [technicianJobs, setTechnicianJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailingTechnician, setEmailingTechnician] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Get current user info for role-based display
  const { userType, name } = useAppSelector((state) => state.user);

  // Check if user can send emails (only super_user and team_member)
  const canSendEmail = userType === "super_user" || userType === "team_member";

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState<number | null>(null);

  // Handle search with debounce
  const handleSearch = useCallback(
    (term: string) => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }

      const timeout = setTimeout(() => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when searching
      }, 300);

      setSearchDebounce(timeout);
    },
    [searchDebounce]
  );

  // Fetch technicians from API
  const fetchTechnicians = async (filters?: TechnicianFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await technicianService.getTechnicians({
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        availabilityStatus: [
          "Available",
          "Unavailable",
          "Busy",
          "On Leave",
        ].includes(filterBy)
          ? filterBy
          : undefined,
        status:
          filterBy === "active"
            ? "Active"
            : filterBy === "inactive"
            ? "Inactive"
            : filterBy === "pending"
            ? "Pending"
            : filterBy === "suspended"
            ? "Suspended"
            : undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...filters,
      });

      if (response.status === "success") {
        setTechnicians(response.data.technicians || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } else {
        setError("Failed to fetch technicians");
        toast.error("❌ Failed to fetch technicians. Please try again.");
      }
    } catch (err: any) {
      console.error("Error fetching technicians:", err);
      setError(err.response?.data?.message || "Failed to fetch technicians");
      toast.error(
        `❌ ${err.response?.data?.message || "Failed to fetch technicians"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch technicians on component mount and when filters change
  useEffect(() => {
    fetchTechnicians();
  }, [searchTerm, filterBy, currentPage]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: TechnicianFormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters long";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!editingTechnician) {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    if (
      formData.experience &&
      (isNaN(Number(formData.experience)) || Number(formData.experience) < 0)
    ) {
      errors.experience = "Experience must be a valid positive number";
    }

    if (
      formData.maxJobs &&
      (isNaN(Number(formData.maxJobs)) || Number(formData.maxJobs) < 1)
    ) {
      errors.maxJobs = "Maximum jobs must be at least 1";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      experience: "",
      availabilityStatus: "Available",
      status: "Active",
      maxJobs: "4",
      address: {
        street: "",
        suburb: "",
        state: "",
        postcode: "",
      },
    });
    setFormErrors({});
  };

  // Open edit modal with technician data
  const handleEditTechnician = (technician: Technician) => {
    setEditingTechnician(technician);
    setFormData({
      firstName: technician.firstName,
      lastName: technician.lastName,
      email: technician.email,
      phone: technician.phone,
      password: "",
      confirmPassword: "",
      experience: technician.experience.toString(),
      availabilityStatus: technician.availabilityStatus,
      status: technician.status,
      maxJobs: technician.maxJobs.toString(),
      address: {
        street: technician.address.street || "",
        suburb: technician.address.suburb || "",
        state: technician.address.state || "",
        postcode: technician.address.postcode || "",
      },
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Open view modal
  const handleViewTechnician = async (technician: Technician) => {
    setViewingTechnician(technician);
    setShowViewModal(true);
    setLoadingJobs(true);
    try {
      const response = await jobService.getJobs({
        assignedTechnician: technician.id,
      });
      if (response.success) {
        setTechnicianJobs(response.data as Job[]);
      } else {
        toast.error("Failed to load technician's jobs.");
      }
    } catch (error) {
      toast.error("Failed to load technician's jobs.");
    } finally {
      setLoadingJobs(false);
    }
  };

  // Close modals
  const closeModals = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingTechnician(null);
    setViewingTechnician(null);
    resetForm();
  };

  // Handle form submission (create or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Please fix the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingTechnician) {
        // Update existing technician
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience
            ? parseInt(formData.experience)
            : undefined,
          availabilityStatus: formData.availabilityStatus,
          status: formData.status,
          maxJobs: parseInt(formData.maxJobs),
          address: formData.address,
        };

        const response = await technicianService.updateTechnician(
          editingTechnician.id,
          updateData
        );

        if (response.status === "success") {
          toast.success(
            `✅ Technician ${formData.firstName} ${formData.lastName} updated successfully!`
          );
          closeModals();
          fetchTechnicians(); // Refresh the technician list
        } else {
          throw new Error(response.message || "Failed to update technician");
        }
      } else {
        // Create new technician
        const technicianData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          experience: formData.experience ? parseInt(formData.experience) : 0,
          availabilityStatus: formData.availabilityStatus,
          status: formData.status,
          maxJobs: parseInt(formData.maxJobs),
          address: {
            street: formData.address.street || undefined,
            suburb: formData.address.suburb || undefined,
            state: formData.address.state || undefined,
            postcode: formData.address.postcode || undefined,
          },
        };

        const response = await technicianService.createTechnician(
          technicianData
        );

        if (response.status === "success") {
          toast.success(
            `✅ Technician ${formData.firstName} ${formData.lastName} created successfully!`
          );
          resetForm();
          setActiveTab("directory");
          fetchTechnicians(); // Refresh the technician list
        } else {
          throw new Error(response.message || "Failed to create technician");
        }
      }
    } catch (err: any) {
      console.error("Error saving technician:", err);
      toast.error(
        `❌ ${
          err.response?.data?.message ||
          `Failed to ${
            editingTechnician ? "update" : "create"
          } technician. Please try again.`
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle technician deletion
  const handleDeleteTechnician = async (technicianId: string) => {
    if (!confirm("Are you sure you want to delete this technician?")) {
      return;
    }

    try {
      const response = await technicianService.deleteTechnician(technicianId);
      if (response.status === "success") {
        fetchTechnicians(); // Refresh the technician list
        toast.success("🗑️ Technician deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete technician");
      }
    } catch (err: any) {
      console.error("Error deleting technician:", err);
      toast.error(
        `❌ ${err.response?.data?.message || "Failed to delete technician"}`
      );
    }
  };

  // Handle opening email modal
  const handleSendEmail = (cardTechnician: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    availability: string;
    accountStatus: string;
    completedJobs: number;
    avgRating: number;
    hourlyRate: number;
  }) => {
    setEmailingTechnician({
      email: cardTechnician.email,
      name: cardTechnician.name,
    });
    setShowEmailModal(true);
    setEmailError(null);
    setEmailSuccess(null);
  };

  // Handle closing email modal
  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailingTechnician(null);
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(false);
  };

  // Handle actual email sending
  const handleOnSendEmail = async (subject: string, html: string, attachments?: File[]) => {
    if (!emailingTechnician) return;

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const response = await technicianService.sendEmailToTechnician(emailingTechnician.email, {
        subject,
        html,
        attachments,
      });
      
      // Check if email was sent successfully
      if (response?.success) {
        setEmailSuccess("Email sent successfully!");
        toast.success(`✅ Email sent to ${emailingTechnician.name}`);
        setTimeout(() => {
          handleCloseEmailModal();
        }, 1500);
      } else {
        throw new Error(response?.message || "Failed to send email");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send email";
      setEmailError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setEmailLoading(false);
    }
  };

  // Filter technicians based on current filters
  const filteredTechnicians = technicians.filter((technician) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      `${technician.firstName} ${technician.lastName}`
        .toLowerCase()
        .includes(searchTermLower) ||
      technician.email.toLowerCase().includes(searchTermLower) ||
      technician.phone.includes(searchTerm) ||
      (technician.address.fullAddress &&
        technician.address.fullAddress.toLowerCase().includes(searchTermLower));

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "active" && technician.status === "Active") ||
      (filterBy === "inactive" && technician.status === "Inactive") ||
      (filterBy === "pending" && technician.status === "Pending") ||
      (filterBy === "suspended" && technician.status === "Suspended") ||
      (filterBy === "Available" &&
        technician.availabilityStatus === "Available") ||
      (filterBy === "Unavailable" &&
        technician.availabilityStatus === "Unavailable") ||
      (filterBy === "Busy" && technician.availabilityStatus === "Busy") ||
      (filterBy === "On Leave" && technician.availabilityStatus === "On Leave");

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "status-available";
      case "Unavailable":
      case "Busy":
        return "status-booked";
      case "On Leave":
        return "status-leave";
      case "Active":
        return "status-valid";
      case "Inactive":
      case "Suspended":
        return "status-expired";
      case "Pending":
        return "status-pending";
      default:
        return "status-pending";
    }
  };

  const tabs = [
    { id: "directory", label: "Technician Directory", icon: RiTeamLine },
    { id: "calendar", label: "Availability Calendar", icon: RiCalendarLine },
    { id: "add", label: "Add Technician", icon: RiUserAddLine },
  ];

  const availabilityStatuses = ["Available", "Busy", "Unavailable", "On Leave"];
  const statuses = ["Active", "Inactive", "Suspended", "Pending"];

  const renderDirectory = () => (
    <div className="technician-directory">
      <div className="directory-header">
        <div className="header-info">
          <h3>
            Technician Directory
            {!loading && (
              <span className="technician-count">
                {pagination.totalItems} technicians
              </span>
            )}
          </h3>
          <p>Manage your team of technicians and track their availability</p>
        </div>
        <div className="search-filter-bar">
          <div className="search-input">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search technicians..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <RiFilterLine className="filter-icon" />
            <select
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Technicians</option>
              <optgroup label="Status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </optgroup>
              <optgroup label="Availability">
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Unavailable">Unavailable</option>
                <option value="On Leave">On Leave</option>
              </optgroup>
            </select>
          </div>
          <button className="btn-primary" onClick={() => setActiveTab("add")}>
            <RiUserAddLine /> Add Technician
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <RiLoaderLine className="loading-icon" />
          <p>Loading technicians...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <RiErrorWarningLine className="error-icon" />
          <p>{error}</p>
          <button onClick={() => fetchTechnicians()} className="btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredTechnicians.length === 0 && (
        <div className="empty-state">
          <RiTeamLine className="empty-icon" />
          <h3>No Technicians Found</h3>
          <p>
            {searchTerm || filterBy !== "all"
              ? "Try adjusting your search or filters"
              : "Start building your team by adding technicians"}
          </p>
          <button className="btn-primary" onClick={() => setActiveTab("add")}>
            <RiUserAddLine /> Add First Technician
          </button>
        </div>
      )}

      {!loading && !error && filteredTechnicians.length > 0 && (
        <>
          <div className="technician-grid">
            {filteredTechnicians.map((technician) => (
              <TechnicianCard
                key={technician.id}
                technician={{
                  _id: technician.id,
                  name: `${technician.firstName} ${technician.lastName}`,
                  email: technician.email,
                  phone: technician.phone,
                  location:
                    technician.address.fullAddress || "No address provided",
                  availability: technician.availabilityStatus,
                  accountStatus: technician.status,
                  completedJobs: technician.completedJobs,
                  avgRating: technician.averageRating,
                  hourlyRate: technician.hourlyRate || 0,
                }}
                onView={() => handleViewTechnician(technician)}
                onEdit={() => handleEditTechnician(technician)}
                onDelete={() => handleDeleteTechnician(technician.id)}
                onSendEmail={canSendEmail ? handleSendEmail : undefined}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`page-btn ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1)
                  )
                }
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                Next
              </button>

              <div className="pagination-info">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} technicians
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="availability-calendar">
      <h3>Availability Calendar</h3>
      <p>Calendar view coming soon...</p>
    </div>
  );

  const renderTechnicianForm = (isModal = false) => (
    <div
      className={`technician-form-container ${
        isModal ? "modal-form" : "tab-form"
      }`}
    >
      <div className="form-header">
        <h3>{editingTechnician ? "Edit Technician" : "Add New Technician"}</h3>
        <p>
          {editingTechnician
            ? "Update the technician details"
            : "Fill in the details to add a new technician to your team"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="technician-form">
        <div className="form-grid">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              className={formErrors.firstName ? "error" : ""}
            />
            {formErrors.firstName && (
              <span className="error-message">{formErrors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              className={formErrors.lastName ? "error" : ""}
            />
            {formErrors.lastName && (
              <span className="error-message">{formErrors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className={formErrors.email ? "error" : ""}
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className={formErrors.phone ? "error" : ""}
            />
            {formErrors.phone && (
              <span className="error-message">{formErrors.phone}</span>
            )}
          </div>

          {!editingTechnician && (
            <>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className={formErrors.password ? "error" : ""}
                />
                {formErrors.password && (
                  <span className="error-message">{formErrors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className={formErrors.confirmPassword ? "error" : ""}
                />
                {formErrors.confirmPassword && (
                  <span className="error-message">
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Experience (years)</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="Enter years of experience"
              min="0"
              className={formErrors.experience ? "error" : ""}
            />
            {formErrors.experience && (
              <span className="error-message">{formErrors.experience}</span>
            )}
          </div>

          <div className="form-group">
            <label>Availability Status</label>
            <select
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleInputChange}
            >
              {availabilityStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="form-group">
            <label>Maximum Jobs</label>
            <input
              type="number"
              name="maxJobs"
              value={formData.maxJobs}
              onChange={handleInputChange}
              placeholder="Enter maximum jobs"
              min="1"
              className={formErrors.maxJobs ? "error" : ""}
            />
            {formErrors.maxJobs && (
              <span className="error-message">{formErrors.maxJobs}</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <h4>Address Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Enter street address"
              />
            </div>

            <div className="form-group">
              <label>Suburb</label>
              <input
                type="text"
                name="address.suburb"
                value={formData.address.suburb}
                onChange={handleInputChange}
                placeholder="Enter suburb"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                placeholder="Enter state"
              />
            </div>

            <div className="form-group">
              <label>Postcode</label>
              <input
                type="text"
                name="address.postcode"
                value={formData.address.postcode}
                onChange={handleInputChange}
                placeholder="Enter postcode"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (isModal) {
                closeModals();
              } else {
                resetForm();
                setActiveTab("directory");
              }
            }}
            disabled={isSubmitting}
          >
            <RiCloseLine /> Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RiLoaderLine className="spinning" />{" "}
                {editingTechnician ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <RiSaveLine />{" "}
                {editingTechnician ? "Update Technician" : "Create Technician"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAddEditForm = () => (
    <div className="add-edit-form">{renderTechnicianForm(false)}</div>
  );

  const renderViewModal = () => {
    if (!viewingTechnician) return null;

    return (
      <div className="modal-overlay" onClick={closeModals}>
        <div
          className="modal-content view-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Technician Details</h3>
            <button className="close-btn" onClick={closeModals}>
              <RiCloseLine />
            </button>
          </div>
          <div className="modal-body">
            <div className="technician-details-grid">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-row">
                  <span className="label">Full Name:</span>
                  <span>
                    {viewingTechnician.firstName} {viewingTechnician.lastName}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span>{viewingTechnician.experience} years</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="contact-info">
                    {viewingTechnician.phone}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="contact-info">
                    {viewingTechnician.email}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Work Information</h4>
                <div className="detail-row">
                  <span className="label">Availability:</span>
                  <span
                    className={`status ${getStatusColor(
                      viewingTechnician.availabilityStatus
                    )}`}
                  >
                    {viewingTechnician.availabilityStatus}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Account Status:</span>
                  <span
                    className={`status ${getStatusColor(
                      viewingTechnician.status
                    )}`}
                  >
                    {viewingTechnician.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Current Jobs:</span>
                  <span>
                    {viewingTechnician.currentJobs}/{viewingTechnician.maxJobs}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Completed Jobs:</span>
                  <span>{viewingTechnician.completedJobs}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Performance</h4>
                <div className="detail-row">
                  <span className="label">Average Rating:</span>
                  <span className="rating">
                    <RiStarLine /> {viewingTechnician.averageRating.toFixed(1)}
                    /5
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Ratings:</span>
                  <span>{viewingTechnician.totalRatings}</span>
                </div>
              </div>

              {viewingTechnician.address.fullAddress && (
                <div className="detail-section">
                  <h4>Address</h4>
                  <div className="detail-row">
                    <span className="label">Full Address:</span>
                    <span className="address">
                      <RiMapPinLine /> {viewingTechnician.address.fullAddress}
                    </span>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Account Information</h4>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span>
                    {new Date(viewingTechnician.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Updated:</span>
                  <span>
                    {new Date(
                      viewingTechnician.lastUpdated
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Login:</span>
                  <span>
                    {viewingTechnician.lastLogin
                      ? new Date(
                          viewingTechnician.lastLogin
                        ).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Active:</span>
                  <span>
                    {viewingTechnician.lastActive
                      ? new Date(
                          viewingTechnician.lastActive
                        ).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn-primary"
              onClick={() => {
                closeModals();
                handleEditTechnician(viewingTechnician);
              }}
            >
              <RiEditLine /> Edit Technician
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!showEditModal) return null;

    return (
      <div className="modal-overlay" onClick={closeModals}>
        <div
          className="modal-content edit-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Edit Technician</h3>
            <button className="close-btn" onClick={closeModals}>
              <RiCloseLine />
            </button>
          </div>
          <div className="modal-body">{renderTechnicianForm(true)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Technician Directory</h1>
        <p>
          {userType === "super_user"
            ? "Manage your technicians, contractors, and their availability"
            : "Manage your technicians and their availability"}
        </p>
      </div>

      <div className="technician-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === "directory" && renderDirectory()}
        {activeTab === "calendar" && renderCalendar()}
        {activeTab === "add" && renderAddEditForm()}
      </div>

      {/* Modals */}
      {showViewModal && renderViewModal()}
      {showEditModal && renderEditModal()}

      {/* Email Modal */}
      {showEmailModal && emailingTechnician && (
        <EmailContactModal
          isOpen={showEmailModal}
          onClose={handleCloseEmailModal}
          to={emailingTechnician.email}
          contactName={emailingTechnician.name}
          onSend={handleOnSendEmail}
          loading={emailLoading}
          error={emailError}
          success={emailSuccess}
        />
      )}
    </div>
  );
};

export default TechnicianPage;
