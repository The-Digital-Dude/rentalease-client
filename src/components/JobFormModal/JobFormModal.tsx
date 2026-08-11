import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal from "../Modal";
import type { ComponentTechnician } from "../../utils/technicianAdapter";
import propertyService from "../../services/propertyService";
import technicianService from "../../services/technicianService";
import "./JobFormModal.scss";

export interface JobFormData {
  id?: string;
  job_id?: string;
  propertyId: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "MinimumSafetyStandard" | "Repairs" | "Routine Inspection";
  dueDate: string;
  scheduledTime?: string;
  shift?: "morning" | "afternoon" | "evening";
  assignedTechnician: string;
  status?: "Pending" | "Scheduled" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
}

interface Property {
  id: string;
  fullAddress: string;
}

interface PropertyResult {
  id: string;
  fullAddress: string;
}

interface PropertyComboboxProps {
  value: string;
  disabled: boolean;
  onChange: (id: string, label: string) => void;
  // Initial label when value is already set (edit mode)
  initialLabel?: string;
}

const PropertyCombobox: React.FC<PropertyComboboxProps> = ({
  value,
  disabled,
  onChange,
  initialLabel = "",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PropertyResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep selectedLabel in sync when parent provides an initialLabel (e.g., edit mode)
  useEffect(() => {
    if (initialLabel) setSelectedLabel(initialLabel);
  }, [initialLabel]);

  const fetchProperties = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      const response = await propertyService.getProperties({
        search: search || undefined,
        limit: 20,
      });
      if (response.status === "success" && response.data?.properties) {
        setResults(
          response.data.properties.map((p: any) => ({
            id: p._id || p.id,
            fullAddress:
              p.address?.fullAddress ||
              p.fullAddress ||
              [p.address?.street, p.address?.suburb, p.address?.state]
                .filter(Boolean)
                .join(", ") ||
              "Unknown address",
          }))
        );
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search as user types
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchProperties(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, fetchProperties]);

  // Load initial results when dropdown opens
  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
    void fetchProperties("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: PropertyResult) => {
    setSelectedLabel(result.fullAddress);
    setIsOpen(false);
    setQuery("");
    onChange(result.id, result.fullAddress);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLabel("");
    setResults([]);
    onChange("", "");
  };

  const hasValue = Boolean(value);

  return (
    <div
      ref={containerRef}
      className={`property-combobox ${isOpen ? "is-open" : ""} ${isFocused ? "is-focused" : ""} ${disabled ? "is-disabled" : ""}`}
    >
      {/* Trigger — shows selected value or placeholder */}
      {!isOpen ? (
        <div
          className={`pcb-trigger ${!hasValue ? "pcb-placeholder" : ""}`}
          onClick={handleOpen}
          tabIndex={disabled ? -1 : 0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpen();
            }
          }}
          role="combobox"
          aria-expanded={false}
          aria-haspopup="listbox"
        >
          <span className="pcb-trigger-text">
            {hasValue ? selectedLabel || "Selected property" : "Search and select a property…"}
          </span>
          <span className="pcb-trigger-icons">
            {hasValue && !disabled && (
              <button
                type="button"
                className="pcb-clear"
                onClick={handleClear}
                aria-label="Clear selection"
                tabIndex={-1}
              >
                ✕
              </button>
            )}
            <span className="pcb-chevron">▾</span>
          </span>
        </div>
      ) : (
        <div className="pcb-search-wrap">
          <span className="pcb-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="pcb-search-input"
            placeholder="Type to search by address, suburb…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
                setQuery("");
              }
            }}
            autoComplete="off"
          />
          {isLoading && <span className="pcb-spin" />}
        </div>
      )}

      {/* Dropdown results */}
      {isOpen && (
        <ul className="pcb-dropdown" role="listbox">
          {isLoading && results.length === 0 ? (
            <li className="pcb-status">Searching…</li>
          ) : results.length === 0 ? (
            <li className="pcb-status pcb-empty">
              {query ? `No properties found for "${query}"` : "No properties found"}
            </li>
          ) : (
            results.map((result) => (
              <li
                key={result.id}
                className={`pcb-option ${result.id === value ? "pcb-option-selected" : ""}`}
                role="option"
                aria-selected={result.id === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(result);
                }}
              >
                <span className="pcb-option-icon">🏠</span>
                <span className="pcb-option-text">{result.fullAddress}</span>
                {result.id === value && <span className="pcb-option-check">✓</span>}
              </li>
            ))
          )}
          {!isLoading && results.length === 20 && (
            <li className="pcb-status pcb-hint">
              Showing first 20 results — type to narrow down
            </li>
          )}
        </ul>
      )}

      {/* Hidden native input for form validation */}
      <input
        type="text"
        name="propertyId"
        value={value}
        readOnly
        required
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
      />
    </div>
  );
};

interface TechnicianResult {
  id: string;
  name: string;
  tradeType: string;
  availabilityStatus: string;
}

interface TechnicianComboboxProps {
  value: string;
  disabled: boolean;
  onChange: (id: string, label: string) => void;
  initialLabel?: string;
  mode: "create" | "edit";
}

const TechnicianCombobox: React.FC<TechnicianComboboxProps> = ({
  value,
  disabled,
  onChange,
  initialLabel = "",
  mode,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TechnicianResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialLabel) setSelectedLabel(initialLabel);
  }, [initialLabel]);

  const fetchTechnicians = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      const response = await technicianService.getTechnicians({
        search: search || undefined,
        limit: 20,
      });
      if (response.status === "success" && response.data?.technicians) {
        const all = response.data.technicians as any[];
        const filtered = all.filter((t: any) => {
          if (mode === "create") return t.availabilityStatus === "Available";
          return (
            t.availabilityStatus === "Available" ||
            t.availabilityStatus === "Busy" ||
            t._id === value ||
            t.id === value
          );
        });
        setResults(
          filtered.map((t: any) => ({
            id: t._id || t.id,
            name: t.fullName || `${t.firstName} ${t.lastName}`.trim(),
            tradeType: t.tradeType || "Technician",
            availabilityStatus: t.availabilityStatus || "",
          }))
        );
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [mode, value]);

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchTechnicians(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, fetchTechnicians]);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
    void fetchTechnicians("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: TechnicianResult) => {
    setSelectedLabel(`${result.name} - ${result.tradeType}`);
    setIsOpen(false);
    setQuery("");
    onChange(result.id, `${result.name} - ${result.tradeType}`);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLabel("");
    setResults([]);
    onChange("", "");
  };

  const hasValue = Boolean(value);

  return (
    <div
      ref={containerRef}
      className={`technician-combobox ${isOpen ? "is-open" : ""} ${isFocused ? "is-focused" : ""} ${disabled ? "is-disabled" : ""}`}
    >
      {!isOpen ? (
        <div
          className={`tcb-trigger ${!hasValue ? "tcb-placeholder" : ""}`}
          onClick={handleOpen}
          tabIndex={disabled ? -1 : 0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpen();
            }
          }}
          role="combobox"
          aria-expanded={false}
          aria-haspopup="listbox"
        >
          <span className="tcb-trigger-text">
            {hasValue ? selectedLabel || "Selected technician" : "Search and select a technician…"}
          </span>
          <span className="tcb-trigger-icons">
            {hasValue && !disabled && (
              <button
                type="button"
                className="tcb-clear"
                onClick={handleClear}
                aria-label="Clear selection"
                tabIndex={-1}
              >
                ✕
              </button>
            )}
            <span className="tcb-chevron">▾</span>
          </span>
        </div>
      ) : (
        <div className="tcb-search-wrap">
          <span className="tcb-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="tcb-search-input"
            placeholder="Type name, trade, or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
                setQuery("");
              }
            }}
            autoComplete="off"
          />
          {isLoading && <span className="tcb-spin" />}
        </div>
      )}

      {isOpen && (
        <ul className="tcb-dropdown" role="listbox">
          {isLoading && results.length === 0 ? (
            <li className="tcb-status">Searching…</li>
          ) : results.length === 0 ? (
            <li className="tcb-status tcb-empty">
              {query ? `No technicians found for "${query}"` : "No available technicians"}
            </li>
          ) : (
            results.map((result) => (
              <li
                key={result.id}
                className={`tcb-option ${result.id === value ? "tcb-option-selected" : ""}`}
                role="option"
                aria-selected={result.id === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(result);
                }}
              >
                <span className="tcb-option-icon">👤</span>
                <span className="tcb-option-text">
                  <span className="tcb-option-name">{result.name}</span>
                  <span className="tcb-option-meta">{result.tradeType}</span>
                </span>
                <span className={`tcb-availability tcb-avail-${result.availabilityStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                  {result.availabilityStatus}
                </span>
                {result.id === value && <span className="tcb-option-check">✓</span>}
              </li>
            ))
          )}
          {!isLoading && results.length === 20 && (
            <li className="tcb-status tcb-hint">
              Showing first 20 results — type to narrow down
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: JobFormData) => void;
  formData: JobFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  technicians: ComponentTechnician[];
  properties: Property[]; // kept for backward compatibility, no longer used by the combobox
  mode: "create" | "edit";
  isSubmitting?: boolean;
  allowTechnicianAssignment?: boolean;
  disableCompletedStatus?: boolean;
  // Optional: pass the current property's address when editing so it shows immediately
  currentPropertyLabel?: string;
  // Optional: pass the current technician's name when editing so it shows immediately
  currentTechnicianLabel?: string;
}

const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  technicians,
  mode,
  isSubmitting = false,
  allowTechnicianAssignment = true,
  disableCompletedStatus = false,
  currentPropertyLabel = "",
  currentTechnicianLabel = "",
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmit(formData);
  };

  const modalTitle = mode === "create" ? "Create New Job" : "Edit Job";
  const submitButtonText = mode === "create" ? "Create Job" : "Save Changes";

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handlePropertyChange = (id: string) => {
    const syntheticEvent = {
      target: { name: "propertyId", value: id },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  const handleTechnicianChange = (id: string) => {
    const syntheticEvent = {
      target: { name: "assignedTechnician", value: id === "" ? "null" : id },
    } as React.ChangeEvent<HTMLSelectElement>;
    onInputChange(syntheticEvent);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="medium">
      <form onSubmit={handleSubmit} className={`job-form ${isSubmitting ? "form-disabled" : ""}`}>
        <div className="form-group">
          <label>Property *</label>
          <PropertyCombobox
            value={formData.propertyId}
            disabled={isSubmitting}
            onChange={handlePropertyChange}
            initialLabel={currentPropertyLabel}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="jobType">Job Type *</label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={onInputChange}
              disabled={isSubmitting}
              required
            >
              <optgroup label="Compliance Jobs">
                <option value="Gas">Gas Safety</option>
                <option value="Electrical">Electrical Safety</option>
                <option value="Smoke">Smoke Alarm</option>
                <option value="MinimumSafetyStandard">Minimum Safety Standard</option>
              </optgroup>
              <optgroup label="General Jobs">
                <option value="Repairs">Repairs</option>
                <option value="Routine Inspection">Routine Inspection</option>
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority *</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={onInputChange}
              disabled={isSubmitting}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {mode === "edit" && (
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onInputChange}
              disabled={isSubmitting}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed" disabled={disableCompletedStatus}>
                {disableCompletedStatus ? "Completed (report required)" : "Completed"}
              </option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={onInputChange}
              min={new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" })}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shift">Shift</label>
            <select
              id="shift"
              name="shift"
              value={formData.shift || "morning"}
              onChange={onInputChange}
              disabled={isSubmitting}
            >
              <option value="morning">Morning (8am – 12pm)</option>
              <option value="afternoon">Afternoon (1pm – 5pm)</option>
              <option value="evening">Evening (5pm – 9pm)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          {allowTechnicianAssignment && (
            <div className="form-group">
              <label>Assigned Technician</label>
              <TechnicianCombobox
                value={formData.assignedTechnician && formData.assignedTechnician !== "null" ? formData.assignedTechnician : ""}
                disabled={isSubmitting}
                onChange={handleTechnicianChange}
                initialLabel={currentTechnicianLabel}
                mode={mode}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Enter job description or special instructions"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="submit-loading">
                <div className="spinner"></div>
                <span>{mode === "create" ? "Creating Job..." : "Saving Changes..."}</span>
              </div>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JobFormModal;
