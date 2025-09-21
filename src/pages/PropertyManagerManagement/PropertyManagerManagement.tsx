import { useState, useEffect, useCallback, useRef } from "react";
import {
  RiBuilding2Line,
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
  RiBriefcaseLine,
  RiTimeLine,
  RiHomeLine,
  RiUserSettingsLine,
  RiMoreLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import {
  propertyManagerService,
  agencyService,
  VALID_STATES,
  type PropertyManager,
  type PropertyManagerFilters,
  type CreatePropertyManagerData,
} from "../../services";
import PropertyManagerFormModal from "../../components/PropertyManagerFormModal";
import "./PropertyManagerManagement.scss";
import toast from "react-hot-toast";

interface CreatePropertyManagerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
}

interface PropertyManagerFormErrors {
  [key: string]: string;
}

const PropertyManagerManagementPage = () => {
  const [activeTab, setActiveTab] = useState("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [agencies, setAgencies] = useState<any[]>([]);
  const [propertyManagers, setPropertyManagers] = useState<PropertyManager[]>(
    []
  );
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

  // Form state for creating/editing property manager
  const [formData, setFormData] = useState<CreatePropertyManagerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: {
      street: "",
      suburb: "",
      state: "",
      postcode: "",
    },
  });
  const [formErrors, setFormErrors] = useState<PropertyManagerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPropertyManager, setEditingPropertyManager] =
    useState<PropertyManager | null>(null);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPropertyManager, setViewingPropertyManager] =
    useState<PropertyManager | null>(null);

  // Add Property Manager Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get current user info for role-based display
  const { userType, name } = useAppSelector((state) => state.user);

  // Check if user can see all property managers
  const canSeeAllPropertyManagers =
    userType === "super_user" || userType === "team_member";
  const canEditPropertyManagers =
    userType === "agency" || userType === "super_user" || userType === "team_member";

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState<number | null>(null);

  // Fetch agencies for super users and team members
  useEffect(() => {
    const fetchAgencies = async () => {
      if (canSeeAllPropertyManagers) {
        try {
          const response = await agencyService.getAllAgencies();
          if (response.success && response.data) {
            setAgencies(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch agencies:", error);
        }
      }
    };
    fetchAgencies();
  }, [canSeeAllPropertyManagers]);

  // Handle search with debounce
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }

      const newDebounce = setTimeout(() => {
        setCurrentPage(1);
        fetchPropertyManagers({
          search: value,
          page: 1,
          limit: pagination.itemsPerPage,
          ...(selectedAgencyId && { agencyId: selectedAgencyId }),
        });
      }, 500);

      setSearchDebounce(newDebounce);
    },
    [searchDebounce, pagination.itemsPerPage]
  );

  // Fetch PropertyManagers
  const fetchPropertyManagers = async (filters?: PropertyManagerFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await propertyManagerService.getPropertyManagers({
        page: currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
        ...(selectedAgencyId && { agencyId: selectedAgencyId }),
      });

      if (response.success && response.data.propertyManagers) {
        setPropertyManagers(response.data.propertyManagers);

        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.page,
            totalPages: response.data.pagination.pages,
            totalItems: response.data.pagination.total,
            itemsPerPage: response.data.pagination.limit,
            hasNextPage:
              response.data.pagination.page < response.data.pagination.pages,
            hasPrevPage: response.data.pagination.page > 1,
          });
        }
      } else {
        setError(response.message || "Failed to fetch PropertyManagers");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch PropertyManagers";
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: PropertyManagerFormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    // Password is only required when creating new property manager
    if (!editingPropertyManager) {
      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
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

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
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
      address: {
        street: "",
        suburb: "",
        state: "",
        postcode: "",
      },
    });
    setFormErrors({});
    setIsSubmitting(false);
    setEditingPropertyManager(null);
  };

  // Handle edit PropertyManager
  const handleEditPropertyManager = (propertyManager: PropertyManager) => {
    setEditingPropertyManager(propertyManager);
    setFormData({
      firstName: propertyManager.firstName,
      lastName: propertyManager.lastName,
      email: propertyManager.email,
      phone: propertyManager.phone,
      password: "",
      confirmPassword: "",
      address: {
        street: propertyManager.address?.street || "",
        suburb: propertyManager.address?.suburb || "",
        state: propertyManager.address?.state || "",
        postcode: propertyManager.address?.postcode || "",
      },
    });
    setShowEditModal(true);
  };

  // Handle view PropertyManager
  const handleViewPropertyManager = (propertyManager: PropertyManager) => {
    setViewingPropertyManager(propertyManager);
    setShowViewModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingPropertyManager(null);
    setViewingPropertyManager(null);
    resetForm();
  };

  // Handle successful property manager creation
  const handleAddSuccess = () => {
    setShowAddModal(false);
    // Refresh the property manager list
    fetchPropertyManagers({
      page: 1,
      limit: pagination.itemsPerPage,
      search: searchTerm,
      ...(filterBy !== "all" && {
        ...(filterBy === "active" ||
        filterBy === "inactive" ||
        filterBy === "suspended" ||
        filterBy === "pending"
          ? {
              status: filterBy.charAt(0).toUpperCase() + filterBy.slice(1),
            }
          : { availabilityStatus: filterBy }),
      }),
    });
  };

  // Toggle dropdown
  const toggleDropdown = (propertyManagerId: string) => {
    setOpenDropdown(
      openDropdown === propertyManagerId ? null : propertyManagerId
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest(".dropdown")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Handle form submission (create or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Please fix the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingPropertyManager) {
        // Update existing property manager
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address.street || undefined,
            suburb: formData.address.suburb || undefined,
            state: formData.address.state || undefined,
            postcode: formData.address.postcode || undefined,
          },
        };

        const response = await propertyManagerService.updatePropertyManager(
          editingPropertyManager.id,
          updateData
        );

        console.log(response, "response...");

        if (response.success) {
          toast.success(
            `✅ ${
              response.message ||
              `PropertyManager ${formData.firstName} ${formData.lastName} updated successfully!`
            }`
          );
          closeModals();
          fetchPropertyManagers(); // Refresh the property manager list
        } else {
          throw new Error(
            response.message || "Failed to update PropertyManager"
          );
        }
      } else {
        // Create new property manager
        // TODO: This legacy form needs to be updated to include agency selection
        // For now, using a placeholder. The new modal form handles this properly.
        const propertyManagerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          agencyId: "placeholder-agency-id", // TODO: Add agency selection to this form
          address: {
            street: formData.address.street || undefined,
            suburb: formData.address.suburb || undefined,
            state: formData.address.state || undefined,
            postcode: formData.address.postcode || undefined,
          },
        };

        const response = await propertyManagerService.createPropertyManager(
          propertyManagerData
        );

        if (response.success) {
          toast.success(
            `✅ ${
              response.message ||
              `PropertyManager ${formData.firstName} ${formData.lastName} created successfully!`
            }`
          );
          resetForm();
          setActiveTab("directory");
          // Refresh the property manager list with current filters
          fetchPropertyManagers({
            page: 1,
            limit: pagination.itemsPerPage,
            search: searchTerm,
            ...(filterBy !== "all" && {
              ...(filterBy === "active" ||
              filterBy === "inactive" ||
              filterBy === "suspended" ||
              filterBy === "pending"
                ? {
                    status:
                      filterBy.charAt(0).toUpperCase() + filterBy.slice(1),
                  }
                : { availabilityStatus: filterBy }),
            }),
          });
        } else {
          throw new Error(
            response.message || "Failed to create PropertyManager"
          );
        }
      }
    } catch (err: any) {
      console.error("Error saving PropertyManager:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${
          editingPropertyManager ? "update" : "create"
        } PropertyManager. Please try again.`;

      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle PropertyManager status update
  const handleStatusUpdate = async (
    propertyManagerId: string,
    newStatus: string
  ) => {
    try {
      const response = await propertyManagerService.updatePropertyManagerStatus(
        propertyManagerId,
        newStatus
      );

      if (response.success) {
        toast.success(`✅ PropertyManager status updated to ${newStatus}`);
        fetchPropertyManagers(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(`❌ Failed to update status: ${err.message}`);
    }
  };

  // Handle PropertyManager availability update
  const handleAvailabilityUpdate = async (
    propertyManagerId: string,
    newAvailability: string
  ) => {
    try {
      const response =
        await propertyManagerService.updatePropertyManagerAvailability(
          propertyManagerId,
          newAvailability
        );

      if (response.success) {
        toast.success(
          `✅ PropertyManager availability updated to ${newAvailability}`
        );
        fetchPropertyManagers(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update availability");
      }
    } catch (err: any) {
      toast.error(`❌ Failed to update availability: ${err.message}`);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#10b981";
      case "inactive":
        return "#6b7280";
      case "suspended":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  // Get availability color
  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case "available":
        return "#10b981";
      case "busy":
        return "#f59e0b";
      case "unavailable":
        return "#ef4444";
      case "on leave":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPropertyManagers();
  }, [currentPage, selectedAgencyId]);

  // Filter change handler
  useEffect(() => {
    if (filterBy !== "all") {
      const filters: PropertyManagerFilters = {
        page: 1,
        limit: pagination.itemsPerPage,
      };

      if (
        filterBy === "active" ||
        filterBy === "inactive" ||
        filterBy === "suspended" ||
        filterBy === "pending"
      ) {
        filters.status = filterBy.charAt(0).toUpperCase() + filterBy.slice(1);
      } else {
        filters.availabilityStatus = filterBy;
      }

      setCurrentPage(1);
      fetchPropertyManagers(filters);
    } else {
      fetchPropertyManagers();
    }
  }, [filterBy]);

  // Tab configuration
  const tabs = canEditPropertyManagers
    ? [
        {
          id: "directory",
          label: "Directory",
          icon: RiBuilding2Line,
        },
        {
          id: "add",
          label: "Add Property Manager",
          icon: RiUserAddLine,
        },
      ]
    : [
        {
          id: "directory",
          label: "Directory",
          icon: RiBuilding2Line,
        },
      ];

  const statuses = ["Active", "Inactive", "Suspended", "Pending"];
  const availabilityStatuses = ["Available", "Busy", "Unavailable", "On Leave"];

  const renderDirectory = () => (
    <div className="property-manager-directory">
      <div className="directory-header">
        <div className="header-info">
          <h3>
            PropertyManager Directory
            {!loading && (
              <span className="property-manager-count">
                {pagination.totalItems} property managers
              </span>
            )}
          </h3>
          <p>
            Manage your team of property managers and track their assignments
          </p>
        </div>
        <div className="search-filter-bar">
          <div className="search-input">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search property managers..."
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
              <option value="all">All PropertyManagers</option>
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
          {canSeeAllPropertyManagers && (
            <div className="filter-select">
              <RiBuilding2Line className="filter-icon" />
              <select
                value={selectedAgencyId}
                onChange={(e) => {
                  setSelectedAgencyId(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Agencies</option>
                {agencies.map((agency) => (
                  <option
                    key={agency.id || agency._id}
                    value={agency.id || agency._id}
                  >
                    {agency.name || agency.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <RiLoaderLine className="loading-icon" />
          <p>Loading PropertyManagers...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <RiErrorWarningLine className="error-icon" />
          <p>{error}</p>
          <button
            onClick={() => {
              toast.success("🔄 Reloading property managers...");
              fetchPropertyManagers();
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && propertyManagers.length === 0 && (
        <div className="empty-state">
          <RiBuilding2Line className="empty-icon" />
          <h3>No PropertyManagers Found</h3>
          <p>Get started by adding your first PropertyManager</p>
          <button onClick={() => setActiveTab("add")}>
            Add PropertyManager
          </button>
        </div>
      )}

      {!loading && !error && propertyManagers.length > 0 && (
        <div className="property-managers-grid">
          {propertyManagers.map((propertyManager) => (
            <div key={propertyManager.id} className="property-manager-card">
              <div className="card-header">
                <div className="avatar">
                  <RiUserSettingsLine />
                </div>
                <div className="header-info">
                  <h4>{propertyManager.fullName}</h4>
                  <p className="email">{propertyManager.email}</p>
                  {canSeeAllPropertyManagers &&
                    propertyManager.owner?.ownerId &&
                    typeof propertyManager.owner.ownerId === "object" && (
                      <p className="agency-name">
                        <RiBuilding2Line />{" "}
                        {propertyManager.owner.ownerId.companyName}
                      </p>
                    )}
                </div>
                <div className="status-badges">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(propertyManager.status),
                    }}
                  >
                    {propertyManager.status}
                  </span>
                  <span
                    className="availability-badge"
                    style={{
                      backgroundColor: getAvailabilityColor(
                        propertyManager.availabilityStatus
                      ),
                    }}
                  >
                    {propertyManager.availabilityStatus}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <RiTimeLine className="info-icon" />
                  <span>Phone: {propertyManager.phone}</span>
                </div>
                <div className="info-row">
                  <RiHomeLine className="info-icon" />
                  <span>
                    Assigned Properties:{" "}
                    {propertyManager.assignedPropertiesCount}
                  </span>
                </div>
                <div className="info-row">
                  <RiStarLine className="info-icon" />
                  <span>
                    Active Properties: {propertyManager.activePropertiesCount}
                  </span>
                </div>
                {propertyManager.address?.fullAddress && (
                  <div className="info-row">
                    <RiMapPinLine className="info-icon" />
                    <span>{propertyManager.address.fullAddress}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleViewPropertyManager(propertyManager)}
                >
                  <RiEyeLine /> View
                </button>
                {canEditPropertyManagers && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleEditPropertyManager(propertyManager)}
                  >
                    <RiEditLine /> Edit
                  </button>
                )}
                {canEditPropertyManagers && (
                  <div className="dropdown">
                    <button
                      className="btn-icon dropdown-toggle"
                      onClick={() => toggleDropdown(propertyManager.id)}
                      title="More actions"
                    >
                      <RiMoreLine />
                    </button>
                    <div
                      className={`dropdown-menu ${
                        openDropdown === propertyManager.id ? "show" : ""
                      }`}
                    >
                      <div className="dropdown-section">
                        <h5>Status</h5>
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              handleStatusUpdate(propertyManager.id, status);
                              setOpenDropdown(null);
                            }}
                            className={
                              propertyManager.status === status ? "active" : ""
                            }
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                      <div className="dropdown-section">
                        <h5>Availability</h5>
                        {availabilityStatuses.map((availability) => (
                          <button
                            key={availability}
                            onClick={() => {
                              handleAvailabilityUpdate(
                                propertyManager.id,
                                availability
                              );
                              setOpenDropdown(null);
                            }}
                            className={
                              propertyManager.availabilityStatus ===
                              availability
                                ? "active"
                                : ""
                            }
                          >
                            {availability}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="content-card">
      <h3>PropertyManager Calendar</h3>
      <p>Calendar view coming soon...</p>
    </div>
  );

  const renderPropertyManagerForm = (isModal = false) => (
    <form onSubmit={handleSubmit} className="property-manager-form">
      <div className="form-section">
        <h4>Basic Information</h4>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={formErrors.firstName ? "error" : ""}
              placeholder="Enter first name"
            />
            {formErrors.firstName && (
              <span className="error-message">{formErrors.firstName}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={formErrors.lastName ? "error" : ""}
              placeholder="Enter last name"
            />
            {formErrors.lastName && (
              <span className="error-message">{formErrors.lastName}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? "error" : ""}
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={formErrors.phone ? "error" : ""}
              placeholder="Enter phone number"
            />
            {formErrors.phone && (
              <span className="error-message">{formErrors.phone}</span>
            )}
          </div>
        </div>
      </div>

      {!editingPropertyManager && (
        <div className="form-section">
          <h4>Account Security</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={formErrors.password ? "error" : ""}
                placeholder="Enter password (min 8 characters)"
              />
              {formErrors.password && (
                <span className="error-message">{formErrors.password}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={formErrors.confirmPassword ? "error" : ""}
                placeholder="Confirm password"
              />
              {formErrors.confirmPassword && (
                <span className="error-message">
                  {formErrors.confirmPassword}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="form-section">
        <h4>Address Information</h4>
        <div className="form-group">
          <label htmlFor="address.street">Street Address</label>
          <input
            type="text"
            id="address.street"
            name="address.street"
            value={formData.address.street}
            onChange={handleInputChange}
            placeholder="Enter street address"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address.suburb">Suburb</label>
            <input
              type="text"
              id="address.suburb"
              name="address.suburb"
              value={formData.address.suburb}
              onChange={handleInputChange}
              placeholder="Enter suburb"
            />
          </div>
          <div className="form-group">
            <label htmlFor="address.state">State</label>
            <select
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
            >
              <option value="">Select state</option>
              {VALID_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="address.postcode">Postcode</label>
            <input
              type="text"
              id="address.postcode"
              name="address.postcode"
              value={formData.address.postcode}
              onChange={handleInputChange}
              placeholder="Enter postcode"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        {isModal && (
          <button type="button" className="btn-secondary" onClick={closeModals}>
            <RiCloseLine /> Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RiLoaderLine className="loading-spinner" />
              {editingPropertyManager ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <RiSaveLine />
              {editingPropertyManager
                ? "Update PropertyManager"
                : "Create PropertyManager"}
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderAddEditForm = () => (
    <div className="content-card">
      <div className="form-header">
        <h3>
          {editingPropertyManager
            ? "Edit PropertyManager"
            : "Add New PropertyManager"}
        </h3>
        <p>
          {editingPropertyManager
            ? "Update PropertyManager information and settings"
            : "Create a new PropertyManager account with basic information"}
        </p>
      </div>
      {renderPropertyManagerForm()}
    </div>
  );

  const renderViewModal = () => {
    if (!viewingPropertyManager) return null;

    return (
      <div className="modal-overlay" onClick={closeModals}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>PropertyManager Details</h3>
            <button className="close-btn" onClick={closeModals}>
              <RiCloseLine />
            </button>
          </div>
          <div className="modal-body">
            <div className="property-manager-details">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-row">
                  <span className="label">Full Name:</span>
                  <span className="value">
                    {viewingPropertyManager.fullName}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{viewingPropertyManager.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{viewingPropertyManager.phone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Status & Availability</h4>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span
                    className="value status-badge"
                    style={{
                      backgroundColor: getStatusColor(
                        viewingPropertyManager.status
                      ),
                    }}
                  >
                    {viewingPropertyManager.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Availability:</span>
                  <span
                    className="value availability-badge"
                    style={{
                      backgroundColor: getAvailabilityColor(
                        viewingPropertyManager.availabilityStatus
                      ),
                    }}
                  >
                    {viewingPropertyManager.availabilityStatus}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Property Assignments</h4>
                <div className="detail-row">
                  <span className="label">Total Assigned:</span>
                  <span className="value">
                    {viewingPropertyManager.assignedPropertiesCount}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Active Properties:</span>
                  <span className="value">
                    {viewingPropertyManager.activePropertiesCount}
                  </span>
                </div>
              </div>

              {viewingPropertyManager.address?.fullAddress && (
                <div className="detail-section">
                  <h4>Address</h4>
                  <div className="detail-row">
                    <span className="label">Full Address:</span>
                    <span className="value">
                      {viewingPropertyManager.address.fullAddress}
                    </span>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Account Information</h4>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(
                      viewingPropertyManager.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
                {viewingPropertyManager.lastLogin && (
                  <div className="detail-row">
                    <span className="label">Last Login:</span>
                    <span className="value">
                      {new Date(
                        viewingPropertyManager.lastLogin
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={closeModals}>
              Close
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                handleEditPropertyManager(viewingPropertyManager);
                setShowViewModal(false);
              }}
            >
              <RiEditLine /> Edit PropertyManager
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingPropertyManager) return null;

    return (
      <div className="modal-overlay" onClick={closeModals}>
        <div
          className="modal-content large"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Edit PropertyManager</h3>
            <button className="close-btn" onClick={closeModals}>
              <RiCloseLine />
            </button>
          </div>
          <div className="modal-body">{renderPropertyManagerForm(true)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>PropertyManager Management</h1>
            <p>
              {userType === "agency"
                ? "Manage your property managers, contractors, and their property assignments"
                : "Manage your property managers and their property assignments"}
            </p>
          </div>
          {(userType === "super_user" || userType === "team_member") && (
            <button
              className="btn-primary add-property-manager-btn"
              onClick={() => setShowAddModal(true)}
            >
              <RiUserAddLine />
              Add Property Manager
            </button>
          )}
        </div>
      </div>

      <div className="property-manager-tabs">
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

      {/* Add Property Manager Modal */}
      <PropertyManagerFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default PropertyManagerManagementPage;
