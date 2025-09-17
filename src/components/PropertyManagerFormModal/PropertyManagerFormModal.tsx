import { useState, useEffect } from "react";
import { RiCloseLine, RiLoader4Line, RiSaveLine } from "react-icons/ri";
import toast from "react-hot-toast";
import Modal from "../Modal";
import AgencySearchDropdown from "../AgencySearchDropdown";
import { propertyManagerService, type Agency } from "../../services";
import "./PropertyManagerFormModal.scss";

interface PropertyManagerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agencyId: string;
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

interface PropertyManagerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialFormData: PropertyManagerFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agencyId: "",
  address: {
    street: "",
    suburb: "",
    state: "",
    postcode: "",
  },
};

const PropertyManagerFormModal = ({
  isOpen,
  onClose,
  onSuccess,
}: PropertyManagerFormModalProps) => {
  const [formData, setFormData] = useState<PropertyManagerFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<PropertyManagerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setFormErrors({});
      setSelectedAgency(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validate form data
  const validateForm = (): boolean => {
    const errors: PropertyManagerFormErrors = {};

    // Basic information validation
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

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Agency validation
    if (!selectedAgency) {
      errors.agencyId = "Please select an agency";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  // Handle agency selection
  const handleAgencySelect = (agency: Agency) => {
    setSelectedAgency(agency);
    setFormData((prev) => ({
      ...prev,
      agencyId: agency.id,
    }));

    // Clear agency error
    if (formErrors.agencyId) {
      setFormErrors((prev) => ({
        ...prev,
        agencyId: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const propertyManagerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        agencyId: formData.agencyId,
        address: {
          street: formData.address.street || undefined,
          suburb: formData.address.suburb || undefined,
          state: formData.address.state || undefined,
          postcode: formData.address.postcode || undefined,
        },
      };

      const response = await propertyManagerService.createPropertyManager(propertyManagerData);

      if (response.success) {
        toast.success(
          `Property Manager ${formData.firstName} ${formData.lastName} created successfully!`
        );
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || "Failed to create Property Manager");
      }
    } catch (error: any) {
      console.error("Error creating Property Manager:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create Property Manager. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Property Manager"
      size="large"
    >
      <form onSubmit={handleSubmit} className="property-manager-form">
        {/* Agency Selection - First and Required */}
        <div className="form-section">
          <h4>Agency Assignment</h4>
          <div className="form-group">
            <label htmlFor="agency">
              Agency <span className="required">*</span>
            </label>
            <AgencySearchDropdown
              selectedAgency={selectedAgency}
              onAgencySelect={handleAgencySelect}
              placeholder="Search and select an agency..."
              error={formErrors.agencyId}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="form-section">
          <h4>Basic Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={formErrors.firstName ? "error" : ""}
                placeholder="Enter first name"
                disabled={isSubmitting}
                required
              />
              {formErrors.firstName && (
                <span className="error-message">{formErrors.firstName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={formErrors.lastName ? "error" : ""}
                placeholder="Enter last name"
                disabled={isSubmitting}
                required
              />
              {formErrors.lastName && (
                <span className="error-message">{formErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={formErrors.email ? "error" : ""}
                placeholder="Enter email address"
                disabled={isSubmitting}
                required
              />
              {formErrors.email && (
                <span className="error-message">{formErrors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={formErrors.phone ? "error" : ""}
                placeholder="Enter phone number"
                disabled={isSubmitting}
                required
              />
              {formErrors.phone && (
                <span className="error-message">{formErrors.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="form-section">
          <h4>Account Security</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={formErrors.password ? "error" : ""}
                placeholder="Enter password (min 8 characters)"
                disabled={isSubmitting}
                required
              />
              {formErrors.password && (
                <span className="error-message">{formErrors.password}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={formErrors.confirmPassword ? "error" : ""}
                placeholder="Confirm password"
                disabled={isSubmitting}
                required
              />
              {formErrors.confirmPassword && (
                <span className="error-message">{formErrors.confirmPassword}</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address.state">State</label>
              <select
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="">Select state</option>
                <option value="NSW">New South Wales</option>
                <option value="VIC">Victoria</option>
                <option value="QLD">Queensland</option>
                <option value="WA">Western Australia</option>
                <option value="SA">South Australia</option>
                <option value="TAS">Tasmania</option>
                <option value="ACT">Australian Capital Territory</option>
                <option value="NT">Northern Territory</option>
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
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <RiCloseLine /> Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RiLoader4Line className="loading-spinner" />
                Creating Property Manager...
              </>
            ) : (
              <>
                <RiSaveLine />
                Create Property Manager
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PropertyManagerFormModal;