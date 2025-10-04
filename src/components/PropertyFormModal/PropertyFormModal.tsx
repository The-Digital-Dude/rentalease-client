import { useState, useEffect, useCallback, useRef } from "react";
import {
  RiSaveLine,
  RiCloseLine,
  RiHomeLine,
  RiUser3Line,
  RiCalendarCheckLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiUserLine,
  RiBuildingLine,
} from "react-icons/ri";
import { useAppSelector } from "../../store";
import type {
  Property,
  CreatePropertyData,
  PropertyAddress,
} from "../../services/propertyService";
import { VALID_STATES } from "../../services/propertyService";
import { agencyService, type Agency } from "../../services/agencyService";
import "./PropertyFormModal.scss";
import { loadGooglePlacesLibrary } from "../../utils";

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePropertyData) => void;
  editingProperty?: Property | null;
  isSubmitting?: boolean;
}

interface PropertyFormData {
  // Address (all required)
  street: string;
  suburb: string;
  state: string;
  postcode: string;

  // Agency Selection (required for super users)
  agencyId: string;

  // Tenant Information (all required)
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;

  // Landlord Information (all required)
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;

  // Inspection Dates (optional)
  gasInspectionDate: string;
  electricalInspectionDate: string;
  smokeAlarmInspectionDate: string;
  poolSafetyInspectionDate: string;

  // Additional
  notes: string;
}

const initialFormData: PropertyFormData = {
  // Address
  street: "",
  suburb: "",
  state: "NSW",
  postcode: "",

  // Agency Selection
  agencyId: "",

  // Tenant Information
  tenantName: "",
  tenantEmail: "",
  tenantPhone: "",

  // Landlord Information
  landlordName: "",
  landlordEmail: "",
  landlordPhone: "",

  // Inspection Dates
  gasInspectionDate: "",
  electricalInspectionDate: "",
  smokeAlarmInspectionDate: "",
  poolSafetyInspectionDate: "",

  // Additional
  notes: "",
};

const PropertyFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingProperty,
  isSubmitting = false,
}: PropertyFormModalProps) => {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<"basic" | "inspections">("basic");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const { userType, id: userId, agencyId: userAgencyId, agencyName } =
    useAppSelector((state) => state.user);
  const streetInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const autocompleteListenerRef = useRef<any>(null);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setActiveTab("basic");
    onClose();
  }, [onClose]);

  // Load agencies for super users
  useEffect(() => {
    const loadAgencies = async () => {
      if (userType === "super_user" && isOpen) {
        try {
          setLoadingAgencies(true);
          const response = await agencyService.getAllAgencies();
          if (response.success) {
            setAgencies(response.data);
          }
        } catch (error) {
          console.error("Error loading agencies:", error);
        } finally {
          setLoadingAgencies(false);
        }
      }
    };

    loadAgencies();
  }, [userType, isOpen]);

  // Update form data when editing property changes
  useEffect(() => {
    if (editingProperty) {
      setFormData({
        // Address
        street: editingProperty.address.street || "",
        suburb: editingProperty.address.suburb || "",
        state: editingProperty.address.state || "NSW",
        postcode: editingProperty.address.postcode || "",

        // Agency Selection
        agencyId: editingProperty.agency?._id || "",

        // Tenant Information
        tenantName: editingProperty.currentTenant?.name || "",
        tenantEmail: editingProperty.currentTenant?.email || "",
        tenantPhone: editingProperty.currentTenant?.phone || "",

        // Landlord Information
        landlordName: editingProperty.currentLandlord?.name || "",
        landlordEmail: editingProperty.currentLandlord?.email || "",
        landlordPhone: editingProperty.currentLandlord?.phone || "",

        // Inspection Dates
        gasInspectionDate:
          editingProperty.complianceSchedule?.gasCompliance?.nextInspection ||
          "",
        electricalInspectionDate:
          editingProperty.complianceSchedule?.electricalSafety
            ?.nextInspection || "",
        smokeAlarmInspectionDate:
          editingProperty.complianceSchedule?.smokeAlarms?.nextInspection || "",
        poolSafetyInspectionDate:
          editingProperty.complianceSchedule?.poolSafety?.nextInspection || "",

        // Additional
        notes: editingProperty.notes || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingProperty]);

  useEffect(() => {
    if (!isOpen || editingProperty) {
      return;
    }

    if (userType === "agency" && userId) {
      setFormData((prev) => ({ ...prev, agencyId: userId }));
    } else if (userType === "team_member" && userAgencyId) {
      setFormData((prev) => ({ ...prev, agencyId: userAgencyId }));
    }
  }, [isOpen, editingProperty, userType, userId, userAgencyId]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  const handleInputChange = useCallback(
    (field: keyof PropertyFormData, value: string | number | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const setupAutocomplete = useCallback(() => {
    if (!streetInputRef.current || !window.google?.maps?.places?.Autocomplete) {
      return;
    }

    if (!autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        streetInputRef.current,
        {
          fields: ["address_components", "formatted_address", "name"],
          types: ["address"],
        }
      );
    }

    if (autocompleteListenerRef.current && window.google?.maps?.event) {
      window.google.maps.event.removeListener(autocompleteListenerRef.current);
      autocompleteListenerRef.current = null;
    }

    autocompleteListenerRef.current = autocompleteRef.current.addListener(
      "place_changed",
      () => {
        const place = autocompleteRef.current?.getPlace?.();
        const inputValue = streetInputRef.current?.value ?? "";

        if (inputValue) {
          handleInputChange("street", inputValue);
        }

        const addressComponents = place?.address_components;
        if (!addressComponents || !Array.isArray(addressComponents)) {
          return;
        }

        const getComponent = (type: string) =>
          addressComponents.find((component: any) =>
            component.types.includes(type)
          );

        const streetNumber = getComponent("street_number")?.long_name ?? "";
        const route = getComponent("route")?.long_name ?? "";
        const suburbComponent =
          getComponent("locality") ?? getComponent("sublocality_level_1");
        const stateComponent = getComponent("administrative_area_level_1");
        const postcodeComponent = getComponent("postal_code");

        const formattedAddress =
          place?.formatted_address ||
          [streetNumber, route].filter(Boolean).join(" ") ||
          inputValue;

        if (formattedAddress) {
          handleInputChange("street", formattedAddress);
          if (streetInputRef.current) {
            streetInputRef.current.value = formattedAddress;
          }
        }

        if (suburbComponent?.long_name) {
          handleInputChange("suburb", suburbComponent.long_name);
        }
        if (stateComponent?.short_name) {
          handleInputChange("state", stateComponent.short_name);
        }
        if (postcodeComponent?.long_name) {
          handleInputChange("postcode", postcodeComponent.long_name);
        }
      }
    );
  }, [handleInputChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
      | string
      | undefined;

    const cleanup = () => {
      if (autocompleteListenerRef.current && window.google?.maps?.event) {
        window.google.maps.event.removeListener(autocompleteListenerRef.current);
        autocompleteListenerRef.current = null;
      }
      autocompleteRef.current = null;
    };

    if (window.google?.maps?.places?.Autocomplete) {
      setupAutocomplete();
      return cleanup;
    }

    if (!googleMapsApiKey) {
      console.warn(
        "Google Maps API key not configured; address autocomplete disabled."
      );
      return cleanup;
    }

    let isCancelled = false;

    loadGooglePlacesLibrary(googleMapsApiKey)
      .then(() => {
        if (!isCancelled) {
          setupAutocomplete();
        }
      })
      .catch((error) => {
        console.warn("Google Places autocomplete unavailable", error);
      });

    return () => {
      isCancelled = true;
      cleanup();
    };
  }, [isOpen, setupAutocomplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.street ||
      !formData.suburb ||
      !formData.postcode ||
      !formData.tenantName ||
      !formData.tenantEmail ||
      !formData.tenantPhone ||
      !formData.landlordName ||
      !formData.landlordEmail ||
      !formData.landlordPhone
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate agency selection for super users
    if (userType === "super_user" && !formData.agencyId) {
      alert("Please select an agency for the property");
      return;
    }

    if (userType === "team_member" && !userAgencyId) {
      alert(
        "Your profile is missing an agency assignment. Please contact support."
      );
      return;
    }

    // Prepare data for submission
    const propertyData: CreatePropertyData = {
      address: {
        street: formData.street,
        suburb: formData.suburb,
        state: formData.state as PropertyAddress["state"],
        postcode: formData.postcode,
      },
      propertyType: "House" as
        | "House"
        | "Apartment"
        | "Townhouse"
        | "Commercial"
        | "Other",
      region: "",
      currentTenant: {
        name: formData.tenantName,
        email: formData.tenantEmail,
        phone: formData.tenantPhone,
      },
      currentLandlord: {
        name: formData.landlordName,
        email: formData.landlordEmail,
        phone: formData.landlordPhone,
      },
      complianceSchedule: {
        gasCompliance: formData.gasInspectionDate
          ? {
              nextInspection: formData.gasInspectionDate,
              required: true,
            }
          : undefined,
        electricalSafety: formData.electricalInspectionDate
          ? {
              nextInspection: formData.electricalInspectionDate,
              required: true,
            }
          : undefined,
        smokeAlarms: formData.smokeAlarmInspectionDate
          ? {
              nextInspection: formData.smokeAlarmInspectionDate,
            }
          : undefined,
        poolSafety: formData.poolSafetyInspectionDate
          ? {
              nextInspection: formData.poolSafetyInspectionDate,
              required: true,
            }
          : { required: false, status: "Not Required" },
      },
      notes: formData.notes,
    };

    // Add agencyId for super users
    if (userType === "super_user" && formData.agencyId) {
      propertyData.agencyId = formData.agencyId;
    } else if (userType === "agency" && userId) {
      propertyData.agencyId = userId;
    } else if (userType === "team_member" && userAgencyId) {
      propertyData.agencyId = userAgencyId;
    }

    onSubmit(propertyData);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="property-form-modal-backdrop" onClick={handleBackdropClick}>
      <div className="property-form-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="property-form-modal__header">
          <div className="header-content">
            <div className="header-icon">
              <RiHomeLine />
            </div>
            <div className="header-text">
              <h2>{editingProperty ? "Edit Property" : "Add New Property"}</h2>
              <p>Fill in the property and tenant details</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose} type="button">
            <RiCloseLine />
          </button>
        </div>

        {/* Navigation */}
        <div className="property-form-modal__nav">
          <button
            className={`nav-btn ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
            type="button"
          >
            <div className="nav-btn__icon">
              <RiMapPinLine />
            </div>
            <div className="nav-btn__content">
              <span className="nav-btn__title">Property & Tenant</span>
              <span className="nav-btn__subtitle">
                Address and tenant details
              </span>
            </div>
          </button>

          <button
            className={`nav-btn ${activeTab === "inspections" ? "active" : ""}`}
            onClick={() => setActiveTab("inspections")}
            type="button"
          >
            <div className="nav-btn__icon">
              <RiCalendarCheckLine />
            </div>
            <div className="nav-btn__content">
              <span className="nav-btn__title">Inspections</span>
              <span className="nav-btn__subtitle">
                Schedule compliance checks
              </span>
            </div>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="property-form-modal__form">
          <div className="form-content">
            {activeTab === "basic" && (
              <div className="form-sections">
                {/* Property Address Section */}
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">
                      <RiHomeLine />
                    </div>
                    <div className="section-title">
                      <h3>Property Address</h3>
                      <p>Enter the complete property address</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label>
                        <RiMapPinLine />
                        Street Address
                        <span className="required">*</span>
                      </label>
                      <input
                        ref={streetInputRef}
                        type="text"
                        value={formData.street}
                        onChange={(e) =>
                          handleInputChange("street", e.target.value)
                        }
                        placeholder="123 Collins Street"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        Suburb
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.suburb}
                        onChange={(e) =>
                          handleInputChange("suburb", e.target.value)
                        }
                        placeholder="Melbourne"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        State
                        <span className="required">*</span>
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        required
                      >
                        {VALID_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>
                        Postcode
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.postcode}
                        onChange={(e) =>
                          handleInputChange("postcode", e.target.value)
                        }
                        placeholder="3000"
                        pattern="[0-9]{4}"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Agency Selection Section */}
                {userType === "super_user" ? (
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <RiBuildingLine />
                      </div>
                      <div className="section-title">
                        <h3>Agency Assignment</h3>
                        <p>Select the agency to manage this property</p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field full-width">
                        <label>
                          <RiBuildingLine />
                          Agency
                          <span className="required">*</span>
                        </label>
                        <select
                          value={formData.agencyId}
                          onChange={(e) =>
                            handleInputChange("agencyId", e.target.value)
                          }
                          required
                          disabled={loadingAgencies}
                        >
                          <option value="">
                            {loadingAgencies
                              ? "Loading agencies..."
                              : "Select an agency"}
                          </option>
                          {agencies.map((agency) => (
                            <option key={agency.id} value={agency.id}>
                              {agency.name} - {agency.region}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (userType === "agency" || userType === "team_member") && (
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <RiBuildingLine />
                      </div>
                      <div className="section-title">
                        <h3>Agency Assignment</h3>
                        <p>
                          This property will be created under your associated agency.
                        </p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field full-width">
                        <label>Assigned Agency</label>
                        <div className="assigned-agency-info">
                          <strong>
                            {agencyName || editingProperty?.agency?.companyName ||
                              "Your agency"}
                          </strong>
                          <span>
                            ID: {userType === "agency" ? userId : userAgencyId || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tenant Information Section */}
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">
                      <RiUser3Line />
                    </div>
                    <div className="section-title">
                      <h3>Tenant Information</h3>
                      <p>Current tenant contact details</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label>
                        <RiUserLine />
                        Full Name
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tenantName}
                        onChange={(e) =>
                          handleInputChange("tenantName", e.target.value)
                        }
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        <RiMailLine />
                        Email Address
                        <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.tenantEmail}
                        onChange={(e) =>
                          handleInputChange("tenantEmail", e.target.value)
                        }
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        <RiPhoneLine />
                        Phone Number
                        <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.tenantPhone}
                        onChange={(e) =>
                          handleInputChange("tenantPhone", e.target.value)
                        }
                        placeholder="0412 345 678"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Landlord Information Section */}
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">
                      <RiUser3Line />
                    </div>
                    <div className="section-title">
                      <h3>Landlord Information</h3>
                      <p>Property owner contact details</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label>
                        <RiUserLine />
                        Full Name
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.landlordName}
                        onChange={(e) =>
                          handleInputChange("landlordName", e.target.value)
                        }
                        placeholder="Jane Doe"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        <RiMailLine />
                        Email Address
                        <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.landlordEmail}
                        onChange={(e) =>
                          handleInputChange("landlordEmail", e.target.value)
                        }
                        placeholder="jane@example.com"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        <RiPhoneLine />
                        Phone Number
                        <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.landlordPhone}
                        onChange={(e) =>
                          handleInputChange("landlordPhone", e.target.value)
                        }
                        placeholder="0423 456 789"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inspections" && (
              <div className="form-sections">
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">
                      <RiCalendarCheckLine />
                    </div>
                    <div className="section-title">
                      <h3>Compliance Inspections</h3>
                      <p>Schedule upcoming inspection dates (optional)</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Gas Compliance Check</label>
                      <input
                        type="date"
                        value={formData.gasInspectionDate}
                        onChange={(e) =>
                          handleInputChange("gasInspectionDate", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Electrical Safety Check</label>
                      <input
                        type="date"
                        value={formData.electricalInspectionDate}
                        onChange={(e) =>
                          handleInputChange(
                            "electricalInspectionDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Smoke Alarm Check</label>
                      <input
                        type="date"
                        value={formData.smokeAlarmInspectionDate}
                        onChange={(e) =>
                          handleInputChange(
                            "smokeAlarmInspectionDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Pool Safety Check</label>
                      <input
                        type="date"
                        value={formData.poolSafetyInspectionDate}
                        onChange={(e) =>
                          handleInputChange(
                            "poolSafetyInspectionDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-title">
                      <h3>Additional Notes</h3>
                      <p>Any additional information about the property</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full-width">
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder="Enter any additional notes..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="property-form-modal__footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <RiSaveLine />
              {isSubmitting
                ? "Saving..."
                : editingProperty
                ? "Update Property"
                : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;
