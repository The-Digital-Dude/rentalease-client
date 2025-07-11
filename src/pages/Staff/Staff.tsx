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
  RiUploadLine
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import { staffAPI, type StaffMember, type StaffFilters, type CreateStaffData } from "../../services";
import "./Staff.scss";

interface CreateStaffFormData {
  fullName: string;
  tradeType: string;
  phone: string;
  email: string;
  availabilityStatus: string;
  startDate: string;
  serviceRegions: string[];
  notes: string;
  hourlyRate: string;
}

interface StaffFormErrors {
  [key: string]: string;
}

const Staff = () => {
  const [activeTab, setActiveTab] = useState("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Form state for creating/editing staff
  const [formData, setFormData] = useState<CreateStaffFormData>({
    fullName: '',
    tradeType: '',
    phone: '',
    email: '',
    availabilityStatus: 'Available',
    startDate: '',
    serviceRegions: [],
    notes: '',
    hourlyRate: ''
  });
  const [formErrors, setFormErrors] = useState<StaffFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licensingFiles, setLicensingFiles] = useState<File[]>([]);
  const [insuranceFiles, setInsuranceFiles] = useState<File[]>([]);

  // File input refs
  const licensingInputRef = useRef<HTMLInputElement>(null);
  const insuranceInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);

  // Get current user info for role-based display
  const { userType, name } = useAppSelector((state) => state.user);

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState<number | null>(null);

  // Handle search with debounce
  const handleSearch = useCallback((term: string) => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timeout = setTimeout(() => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    
    setSearchDebounce(timeout);
  }, [searchDebounce]);

  // Fetch staff members from API
  const fetchStaff = async (filters?: StaffFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await staffAPI.getStaff({
        page: currentPage,
        limit: 12, // More reasonable pagination
        search: searchTerm || undefined,
        tradeType: filterBy !== "all" && !["active", "inactive", "Available", "Unavailable", "Busy", "On Leave"].includes(filterBy) ? filterBy : undefined,
        availabilityStatus: ["Available", "Unavailable", "Busy", "On Leave"].includes(filterBy) ? filterBy : undefined,
        status: filterBy === "active" ? "Active" : filterBy === "inactive" ? "Inactive" : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...filters
      });

      if (response.data?.status === 'success') {
        setStaffMembers(response.data.data.staff || []);
        setPagination(response.data.data.pagination);
      } else {
        setError('Failed to fetch staff members');
      }
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.response?.data?.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff on component mount and when filters change
  useEffect(() => {
    fetchStaff();
  }, [searchTerm, filterBy, currentPage]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: StaffFormErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.tradeType) {
      errors.tradeType = 'Trade type is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (formData.serviceRegions.length === 0) {
      errors.serviceRegions = 'At least one service region is required';
    }

    if (formData.hourlyRate && (isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) < 0)) {
      errors.hourlyRate = 'Hourly rate must be a valid positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle service regions checkbox changes
  const handleRegionChange = (region: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceRegions: checked 
        ? [...prev.serviceRegions, region]
        : prev.serviceRegions.filter(r => r !== region)
    }));
    
    // Clear error for regions
    if (formErrors.serviceRegions) {
      setFormErrors(prev => ({
        ...prev,
        serviceRegions: ''
      }));
    }
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'licensing' | 'insurance') => {
    const files = Array.from(e.target.files || []);
    if (type === 'licensing') {
      setLicensingFiles(files);
    } else {
      setInsuranceFiles(files);
    }
  };

  // Handle file upload area clicks
  const handleLicensingUploadClick = () => {
    licensingInputRef.current?.click();
  };

  const handleInsuranceUploadClick = () => {
    insuranceInputRef.current?.click();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      tradeType: '',
      phone: '',
      email: '',
      availabilityStatus: 'Available',
      startDate: '',
      serviceRegions: [],
      notes: '',
      hourlyRate: ''
    });
    setFormErrors({});
    setLicensingFiles([]);
    setInsuranceFiles([]);
  };

  // Open edit modal with staff data
  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      tradeType: staff.tradeType,
      phone: staff.phone,
      email: staff.email,
      availabilityStatus: staff.availabilityStatus,
      startDate: staff.startDate.split('T')[0], // Format date for input
      serviceRegions: staff.serviceRegions,
      notes: staff.notes || '',
      hourlyRate: staff.hourlyRate?.toString() || ''
    });
    setFormErrors({});
    setLicensingFiles([]);
    setInsuranceFiles([]);
    setShowEditModal(true);
  };

  // Open view modal
  const handleViewStaff = (staff: StaffMember) => {
    setViewingStaff(staff);
    setShowViewModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setEditingStaff(null);
    setViewingStaff(null);
    resetForm();
  };

  // Handle form submission (create or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingStaff) {
        // Update existing staff
        const updateData: any = {
          fullName: formData.fullName,
          tradeType: formData.tradeType,
          phone: formData.phone,
          email: formData.email,
          availabilityStatus: formData.availabilityStatus,
          startDate: formData.startDate,
          serviceRegions: formData.serviceRegions,
          notes: formData.notes || undefined,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined
        };

        const response = await staffAPI.updateStaff(editingStaff.id, updateData);

        if (response.data?.status === 'success') {
          alert('Staff member updated successfully!');
          closeModals();
          fetchStaff(); // Refresh the staff list
        } else {
          throw new Error(response.data?.message || 'Failed to update staff member');
        }
      } else {
        // Create new staff
        const formDataToSubmit = new FormData();
        
        // Add form fields
        formDataToSubmit.append('fullName', formData.fullName);
        formDataToSubmit.append('tradeType', formData.tradeType);
        formDataToSubmit.append('phone', formData.phone);
        formDataToSubmit.append('email', formData.email);
        formDataToSubmit.append('availabilityStatus', formData.availabilityStatus);
        formDataToSubmit.append('startDate', formData.startDate);
        
        // Add service regions
        formData.serviceRegions.forEach(region => {
          formDataToSubmit.append('serviceRegions', region);
        });
        
        if (formData.notes) {
          formDataToSubmit.append('notes', formData.notes);
        }
        
        if (formData.hourlyRate) {
          formDataToSubmit.append('hourlyRate', formData.hourlyRate);
        }
        
        // Add files
        licensingFiles.forEach(file => {
          formDataToSubmit.append('licensingDocuments', file);
        });
        
        insuranceFiles.forEach(file => {
          formDataToSubmit.append('insuranceDocuments', file);
        });

        const response = await staffAPI.createStaff(formDataToSubmit);

        if (response.data?.status === 'success') {
          alert('Staff member created successfully!');
          resetForm();
          setActiveTab('directory');
          fetchStaff(); // Refresh the staff list
        } else {
          throw new Error(response.data?.message || 'Failed to create staff member');
        }
      }
    } catch (err: any) {
      console.error('Error saving staff:', err);
      alert(err.response?.data?.message || `Failed to ${editingStaff ? 'update' : 'create'} staff member. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle staff deletion
  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await staffAPI.deleteStaff(staffId);
      fetchStaff(); // Refresh the staff list
      alert('Staff member deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      alert(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  // Filter staff members based on current filters
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = searchTerm === "" || 
                         staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.tradeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "active" && staff.status === "Active") ||
                         (filterBy === "inactive" && staff.status !== "Active") ||
                         (filterBy === "Available" && staff.availabilityStatus === "Available") ||
                         (filterBy === "Unavailable" && staff.availabilityStatus === "Unavailable") ||
                         (filterBy === "Busy" && staff.availabilityStatus === "Busy") ||
                         (filterBy === "On Leave" && staff.availabilityStatus === "On Leave") ||
                         (filterBy === staff.tradeType); // Filter by trade type
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "status-available";
      case "Unavailable": 
      case "Busy": return "status-booked";
      case "On Leave": return "status-leave";
      case "Active": return "status-valid";
      case "Inactive":
      case "Suspended":
      case "Terminated": return "status-expired";
      default: return "status-pending";
    }
  };

  const getDocumentStatus = (documents: any[]) => {
    if (!documents || documents.length === 0) return "Missing";
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const hasRecentDocs = documents.some(doc => 
      new Date(doc.uploadDate) > oneYearAgo
    );
    
    return hasRecentDocs ? "Valid" : "Expired";
  };

  const tabs = [
    { id: "directory", label: "Staff Directory", icon: RiTeamLine },
    { id: "calendar", label: "Availability Calendar", icon: RiCalendarLine },
    { id: "add", label: "Add/Edit Staff", icon: RiUserAddLine },
  ];

  const tradeTypes = [
    'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner', 'Gardener', 
    'Handyman', 'HVAC Technician', 'Pest Control', 'Locksmith', 
    'Flooring Specialist', 'Appliance Repair', 'Other'
  ];

  const serviceRegions = ['North', 'South', 'East', 'West', 'Central'];

  const renderDirectory = () => (
    <div className="staff-directory">
      <div className="directory-header">
        <div className="header-info">
          <h3>
            {userType === 'super_user' ? 'Your Staff Members' : 'Your Team'}
            {!loading && <span className="staff-count">({pagination.totalItems})</span>}
          </h3>
          <p>
          Manage staff members
          </p>
        </div>
        <div className="search-filter-bar">
          <div className="search-input">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, trade type, or email..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <RiFilterLine className="filter-icon" />
            <select value={filterBy} onChange={(e) => {
              setFilterBy(e.target.value);
              setCurrentPage(1);
            }}>
              <option value="all">All Staff</option>
              <optgroup label="Status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </optgroup>
              <optgroup label="Availability">
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </optgroup>
              <optgroup label="Trade Types">
                {tradeTypes.map(trade => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setActiveTab("add")}
        >
          <RiUserAddLine /> Add Staff Member
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <RiLoaderLine className="loading-icon" />
          <p>Loading staff members...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <RiErrorWarningLine className="error-icon" />
          <p>{error}</p>
          <button onClick={() => fetchStaff()} className="btn-secondary">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredStaff.length === 0 && (
        <div className="empty-state">
          <RiTeamLine className="empty-icon" />
          <h3>No Staff Members Found</h3>
          <p>
            {searchTerm || filterBy !== "all" 
              ? "Try adjusting your search or filters"
              : "Start building your team by adding staff members"
            }
          </p>
          <button 
            className="btn-primary"
            onClick={() => setActiveTab("add")}
          >
            <RiUserAddLine /> Add First Staff Member
          </button>
        </div>
      )}

      {!loading && !error && filteredStaff.length > 0 && (
        <>
          <div className="staff-grid">
            {filteredStaff.map(staff => (
              <div key={staff.id} className="staff-card">
                <div className="staff-header">
                  <div className="staff-info">
                    <h3>{staff.fullName}</h3>
                    <p className="trade-type">{staff.tradeType}</p>
                  </div>
                  <div className="staff-actions">
                    <button 
                      className="action-btn view-btn" 
                      title="View Details"
                      onClick={() => handleViewStaff(staff)}
                    >
                      <RiEyeLine />
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      title="Edit Staff"
                      onClick={() => handleEditStaff(staff)}
                    >
                      <RiEditLine />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      title="Delete Staff"
                      onClick={() => handleDeleteStaff(staff.id)}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>
                
                <div className="staff-details">
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className={`status ${getStatusColor(staff.availabilityStatus)}`}>
                      {staff.availabilityStatus}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Regions:</span>
                    <span className="regions">
                      {staff.serviceRegions.join(", ")}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Licensing:</span>
                    <span className={`status ${getStatusColor(getDocumentStatus(staff.licensingDocuments))}`}>
                      {getDocumentStatus(staff.licensingDocuments)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Insurance:</span>
                    <span className={`status ${getStatusColor(getDocumentStatus(staff.insuranceDocuments))}`}>
                      {getDocumentStatus(staff.insuranceDocuments)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="contact-info">{staff.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="contact-info">{staff.email}</span>
                  </div>
                  {staff.hourlyRate && (
                    <div className="detail-row">
                      <span className="label">Rate:</span>
                      <span className="rate">${staff.hourlyRate}/hr</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Jobs:</span>
                    <span className="job-stats">
                      {staff.completedJobs}/{staff.totalJobs} completed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                Next
              </button>
              
              <div className="pagination-info">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} staff members
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

  const renderStaffForm = (isModal = false) => (
    <div className={`staff-form-container ${isModal ? 'modal-form' : 'tab-form'}`}>
      <div className="form-header">
        <h3>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
        <p>{editingStaff ? 'Update the staff member details' : 'Fill in the details to add a new staff member to your team'}</p>
      </div>

      <form onSubmit={handleSubmit} className="staff-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className={formErrors.fullName ? 'error' : ''}
            />
            {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Trade Type *</label>
            <select
              name="tradeType"
              value={formData.tradeType}
              onChange={handleInputChange}
              className={formErrors.tradeType ? 'error' : ''}
            >
              <option value="">Select trade type</option>
              {tradeTypes.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
            {formErrors.tradeType && <span className="error-message">{formErrors.tradeType}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className={formErrors.phone ? 'error' : ''}
            />
            {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label>Availability Status</label>
            <select
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleInputChange}
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={formErrors.startDate ? 'error' : ''}
            />
            {formErrors.startDate && <span className="error-message">{formErrors.startDate}</span>}
          </div>

          <div className="form-group">
            <label>Hourly Rate (optional)</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleInputChange}
              placeholder="Enter hourly rate"
              min="0"
              step="0.01"
              className={formErrors.hourlyRate ? 'error' : ''}
            />
            {formErrors.hourlyRate && <span className="error-message">{formErrors.hourlyRate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Service Regions *</label>
          <div className="checkbox-group">
            {serviceRegions.map(region => (
              <label key={region} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.serviceRegions.includes(region)}
                  onChange={(e) => handleRegionChange(region, e.target.checked)}
                />
                {region}
              </label>
            ))}
          </div>
          {formErrors.serviceRegions && <span className="error-message">{formErrors.serviceRegions}</span>}
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes about the staff member"
            rows={3}
          />
        </div>

        {!editingStaff && (
          <div className="file-upload-section">
            <div className="form-group">
              <label>Licensing Documents</label>
              <div className="file-upload" onClick={handleLicensingUploadClick}>
                <input
                  ref={licensingInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileChange(e, 'licensing')}
                  style={{ display: 'none' }}
                />
                <div className="file-upload-content">
                  {licensingFiles.length > 0 ? (
                    <>
                      <RiUploadLine className="upload-icon" />
                      <div className="uploaded-files-preview">
                        <span className="upload-status">📋 {licensingFiles.length} file(s) selected:</span>
                        <div className="file-names">
                          {licensingFiles.map((file, index) => (
                            <span key={index} className="file-name-preview">{file.name}</span>
                          ))}
                        </div>
                        <span className="click-to-change">Click to change files</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <RiUploadLine className="upload-icon" />
                      <span>Upload licensing documents (PDF, JPG, PNG)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Insurance Documents</label>
              <div className="file-upload" onClick={handleInsuranceUploadClick}>
                <input
                  ref={insuranceInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileChange(e, 'insurance')}
                  style={{ display: 'none' }}
                />
                <div className="file-upload-content">
                  {insuranceFiles.length > 0 ? (
                    <>
                      <RiUploadLine className="upload-icon" />
                      <div className="uploaded-files-preview">
                        <span className="upload-status">📄 {insuranceFiles.length} file(s) selected:</span>
                        <div className="file-names">
                          {insuranceFiles.map((file, index) => (
                            <span key={index} className="file-name-preview">{file.name}</span>
                          ))}
                        </div>
                        <span className="click-to-change">Click to change files</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <RiUploadLine className="upload-icon" />
                      <span>Upload insurance documents (PDF, JPG, PNG)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              if (isModal) {
                closeModals();
              } else {
                resetForm();
                setActiveTab('directory');
              }
            }}
            disabled={isSubmitting}
          >
            <RiCloseLine /> Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RiLoaderLine className="spinning" /> {editingStaff ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <RiSaveLine /> {editingStaff ? 'Update Staff Member' : 'Create Staff Member'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAddEditForm = () => (
    <div className="add-edit-form">
      {renderStaffForm(false)}
    </div>
  );

  const renderViewModal = () => {
    if (!viewingStaff) return null;

    return (
      <div className="modal-overlay" onClick={closeModals}>
        <div className="modal-content view-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Staff Member Details</h3>
            <button className="close-btn" onClick={closeModals}>
              <RiCloseLine />
            </button>
          </div>
          <div className="modal-body">
            <div className="staff-details-grid">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-row">
                  <span className="label">Full Name:</span>
                  <span>{viewingStaff.fullName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Trade Type:</span>
                  <span>{viewingStaff.tradeType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="contact-info">{viewingStaff.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="contact-info">{viewingStaff.email}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Work Information</h4>
                <div className="detail-row">
                  <span className="label">Availability:</span>
                  <span className={`status ${getStatusColor(viewingStaff.availabilityStatus)}`}>
                    {viewingStaff.availabilityStatus}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Service Regions:</span>
                  <span>{viewingStaff.serviceRegions.join(", ")}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Start Date:</span>
                  <span>{new Date(viewingStaff.startDate).toLocaleDateString()}</span>
                </div>
                {viewingStaff.hourlyRate && (
                  <div className="detail-row">
                    <span className="label">Hourly Rate:</span>
                    <span className="rate">${viewingStaff.hourlyRate}/hr</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Documents & Compliance</h4>
                <div className="detail-row">
                  <span className="label">Licensing:</span>
                  <span className={`status ${getStatusColor(getDocumentStatus(viewingStaff.licensingDocuments))}`}>
                    {getDocumentStatus(viewingStaff.licensingDocuments)} 
                    {viewingStaff.licensingDocuments.length > 0 && ` (${viewingStaff.licensingDocuments.length} files)`}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Insurance:</span>
                  <span className={`status ${getStatusColor(getDocumentStatus(viewingStaff.insuranceDocuments))}`}>
                    {getDocumentStatus(viewingStaff.insuranceDocuments)}
                    {viewingStaff.insuranceDocuments.length > 0 && ` (${viewingStaff.insuranceDocuments.length} files)`}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Performance</h4>
                <div className="detail-row">
                  <span className="label">Total Jobs:</span>
                  <span>{viewingStaff.totalJobs}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Completed Jobs:</span>
                  <span>{viewingStaff.completedJobs}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Completion Rate:</span>
                  <span>{viewingStaff.totalJobs > 0 ? Math.round((viewingStaff.completedJobs / viewingStaff.totalJobs) * 100) : 0}%</span>
                </div>
                <div className="detail-row">
                  <span className="label">Rating:</span>
                  <span>{viewingStaff.rating}/5 ⭐</span>
                </div>
              </div>

              {viewingStaff.notes && (
                <div className="detail-section full-width">
                  <h4>Notes</h4>
                  <p className="notes">{viewingStaff.notes}</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn-primary"
              onClick={() => {
                closeModals();
                handleEditStaff(viewingStaff);
              }}
            >
              <RiEditLine /> Edit Staff Member
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
        <div className="modal-content edit-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Edit Staff Member</h3>
            <button className="close-btn" onClick={closeModals}>
              <RiCloseLine />
            </button>
          </div>
          <div className="modal-body">
            {renderStaffForm(true)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Staff Directory</h1>
        <p>
          {userType === 'super_user' 
            ? 'Manage your staff members, contractors, and their availability'
            : 'Manage your team members and their availability'
          }
        </p>
        
      </div>

      <div className="staff-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
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
    </div>
  );
};

export default Staff; 