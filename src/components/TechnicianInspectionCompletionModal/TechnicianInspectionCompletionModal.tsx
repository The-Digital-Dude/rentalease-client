import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  RiAddLine,
  RiAlertLine,
  RiCalendarCheckLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiLoader4Line,
  RiUploadCloud2Line,
} from "react-icons/ri";
import inspectionService, {
  getMediaStorageKey,
  type InspectionField,
  type InspectionFieldOption,
  type InspectionSection,
  type InspectionTableColumn,
  type InspectionTemplate,
} from "../../services/inspectionService";
import jobService from "../../services/jobService";
import "./TechnicianInspectionCompletionModal.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
  jobId: string;
  jobType?: string;
};

const multiSelectTypes = new Set(["multi-select", "checkbox-group"]);
const selectTypes = new Set(["select", "yes-no", "yes-no-na", "pass-fail", "pass-fail-na", "radio"]);
const checkboxTypes = new Set(["boolean", "checkbox"]);

const defaultOptionsByType: Record<string, InspectionFieldOption[]> = {
  "yes-no": [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ],
  "yes-no-na": [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "na", label: "N/A" },
  ],
  "pass-fail": [
    { value: "pass", label: "Pass" },
    { value: "fail", label: "Fail" },
  ],
  "pass-fail-na": [
    { value: "pass", label: "Pass" },
    { value: "fail", label: "Fail" },
    { value: "na", label: "N/A" },
  ],
  radio: [],
};

const toDateValue = (value: unknown) => {
  if (!value || typeof value !== "string") return "";
  return value.includes("T") ? value.split("T")[0] : value;
};

const getFieldLabel = (field: Pick<InspectionField, "label" | "question" | "id">) =>
  field.question || field.label || field.id;

const getFieldOptions = (field: Pick<InspectionField, "type" | "options">) =>
  field.options && field.options.length
    ? field.options
    : defaultOptionsByType[field.type] || [];

const evaluateCondition = (
  visibleWhen: any,
  scopeValues: Record<string, any> | undefined
) => {
  if (!visibleWhen || !scopeValues) return true;
  if (visibleWhen.equals !== undefined) {
    return scopeValues?.[visibleWhen.fieldId] === visibleWhen.equals;
  }
  return true;
};

const isFieldVisible = (
  field: Pick<InspectionField, "metadata">,
  scopeValues: Record<string, any> | undefined
) => evaluateCondition(field.metadata?.visibleWhen, scopeValues);

const isFieldRequired = (
  field: Pick<InspectionField, "required" | "metadata">,
  scopeValues: Record<string, any> | undefined
) => {
  if (!field.required) return false;
  const requiredWhen = field.metadata?.requiredWhen;
  if (!requiredWhen) return true;
  return evaluateCondition(requiredWhen, scopeValues);
};

const getDefaultFieldValue = (field: InspectionField) => {
  if (field.defaultValue !== undefined && field.defaultValue !== null) {
    if (field.type === "date") return toDateValue(field.defaultValue);
    return field.defaultValue;
  }

  if (multiSelectTypes.has(field.type)) return [];
  if (field.type === "table") return [];
  if (field.type === "photo" || field.type === "photo-multi") return [];
  if (checkboxTypes.has(field.type)) return false;
  if (field.type === "number") return "";
  return "";
};

const createSectionState = (section: InspectionSection) => {
  const sectionState: Record<string, any> = {};
  section.fields.forEach((field) => {
    sectionState[field.id] = getDefaultFieldValue(field);
  });
  return sectionState;
};

const initializeFormValues = (template: InspectionTemplate) => {
  const values: Record<string, any> = {};
  template.sections.forEach((section) => {
    if (section.repeatable) {
      const count = Math.max(section.minItems || 0, 1);
      values[section.id] = Array.from({ length: count }, () =>
        createSectionState(section)
      );
    } else {
      values[section.id] = createSectionState(section);
    }
  });
  return values;
};

const createTableRow = (columns: InspectionTableColumn[]) =>
  columns.reduce((acc, column) => {
    if (column.type === "number") {
      acc[column.id] = "";
    } else if (column.type === "photo" || column.type === "photo-multi") {
      acc[column.id] = [];
    } else {
      acc[column.id] = "";
    }
    return acc;
  }, {} as Record<string, any>);

const extractFiles = (event: React.ChangeEvent<HTMLInputElement>) =>
  Array.from(event.target.files || []);

const TechnicianInspectionCompletionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCompleted,
  jobId,
}) => {
  const [template, setTemplate] = useState<InspectionTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [mediaByField, setMediaByField] = useState<Record<string, File[]>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !jobId) return;

    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await inspectionService.fetchJobInspectionTemplate(jobId);
        setTemplate(response.template);
        setFormValues(initializeFormValues(response.template));
        setMediaByField({});
        setNotes("");
      } catch (err: any) {
        setError(err.message || "Failed to load inspection workflow");
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [isOpen, jobId]);

  const summary = useMemo(() => {
    if (!template) return null;
    return {
      sections: template.sections.length,
      repeatableSections: template.sections.filter((section) => section.repeatable)
        .length,
      photoFields: template.sections.reduce((count, section) => {
        return (
          count +
          section.fields.filter(
            (field) => field.type === "photo" || field.type === "photo-multi"
          ).length
        );
      }, 0),
    };
  }, [template]);

  const updateSectionField = (
    sectionId: string,
    fieldId: string,
    value: any,
    itemIndex?: number
  ) => {
    setFormValues((prev) => {
      const next = { ...prev };
      if (itemIndex === undefined) {
        next[sectionId] = {
          ...(next[sectionId] || {}),
          [fieldId]: value,
        };
      } else {
        const items = Array.isArray(next[sectionId]) ? [...next[sectionId]] : [];
        items[itemIndex] = {
          ...(items[itemIndex] || {}),
          [fieldId]: value,
        };
        next[sectionId] = items;
      }
      return next;
    });
  };

  const updateTableCell = (
    sectionId: string,
    fieldId: string,
    rowIndex: number,
    columnId: string,
    value: any
  ) => {
    setFormValues((prev) => {
      const next = { ...prev };
      const sectionValues = { ...(next[sectionId] || {}) };
      const rows = Array.isArray(sectionValues[fieldId])
        ? [...sectionValues[fieldId]]
        : [];
      rows[rowIndex] = {
        ...(rows[rowIndex] || {}),
        [columnId]: value,
      };
      sectionValues[fieldId] = rows;
      next[sectionId] = sectionValues;
      return next;
    });
  };

  const setMediaFiles = (storageKey: string, files: File[], multiple = false) => {
    setMediaByField((prev) => ({
      ...prev,
      [storageKey]: multiple ? files : files.slice(0, 1),
    }));
  };

  const addRepeatableItem = (section: InspectionSection) => {
    setFormValues((prev) => {
      const items = Array.isArray(prev[section.id]) ? [...prev[section.id]] : [];
      items.push(createSectionState(section));
      return {
        ...prev,
        [section.id]: items,
      };
    });
  };

  const removeRepeatableItem = (sectionId: string, itemIndex: number) => {
    setFormValues((prev) => {
      const items = Array.isArray(prev[sectionId]) ? [...prev[sectionId]] : [];
      items.splice(itemIndex, 1);
      return {
        ...prev,
        [sectionId]: items,
      };
    });
  };

  const addTableRow = (sectionId: string, field: InspectionField) => {
    setFormValues((prev) => {
      const next = { ...prev };
      const sectionValues = { ...(next[sectionId] || {}) };
      const rows = Array.isArray(sectionValues[field.id]) ? [...sectionValues[field.id]] : [];
      rows.push(createTableRow(field.columns || []));
      sectionValues[field.id] = rows;
      next[sectionId] = sectionValues;
      return next;
    });
  };

  const removeTableRow = (sectionId: string, fieldId: string, rowIndex: number) => {
    setFormValues((prev) => {
      const next = { ...prev };
      const sectionValues = { ...(next[sectionId] || {}) };
      const rows = Array.isArray(sectionValues[fieldId]) ? [...sectionValues[fieldId]] : [];
      rows.splice(rowIndex, 1);
      sectionValues[fieldId] = rows;
      next[sectionId] = sectionValues;
      return next;
    });
  };

  const validate = () => {
    if (!template) return ["Inspection template is missing"];

    const missing: string[] = [];

    const validateField = (
      sectionId: string,
      field: InspectionField,
      scopeValues: Record<string, any>,
      itemIndex?: number
    ) => {
      if (!isFieldVisible(field, scopeValues)) return;
      if (!isFieldRequired(field, scopeValues)) return;

      const labelPrefix =
        itemIndex === undefined
          ? getFieldLabel(field)
          : `${template.sections.find((section) => section.id === sectionId)?.itemLabel || "Item"} ${itemIndex + 1}: ${getFieldLabel(field)}`;
      const value = scopeValues[field.id];

      if (field.type === "photo" || field.type === "photo-multi") {
        const storageKey = getMediaStorageKey(sectionId, field.id, itemIndex);
        const files = mediaByField[storageKey] || [];
        if (!files.length) missing.push(labelPrefix);
        return;
      }

      if (field.type === "table") {
        const rows = Array.isArray(value) ? value : [];
        if (!rows.length) {
          missing.push(labelPrefix);
          return;
        }
        return;
      }

      if (multiSelectTypes.has(field.type) && Array.isArray(value) && value.length === 0) {
        missing.push(labelPrefix);
        return;
      }

      if (checkboxTypes.has(field.type) && !value) {
        missing.push(labelPrefix);
        return;
      }

      if (value === undefined || value === null || value === "") {
        missing.push(labelPrefix);
      }
    };

    template.sections.forEach((section) => {
      if (section.repeatable) {
        const items = Array.isArray(formValues[section.id]) ? formValues[section.id] : [];
        if (!items.length) {
          missing.push(section.title);
          return;
        }
        items.forEach((item: Record<string, any>, itemIndex: number) => {
          section.fields.forEach((field) =>
            validateField(section.id, field, item || {}, itemIndex)
          );
        });
        return;
      }

      const sectionValues = formValues[section.id] || {};
      section.fields.forEach((field) =>
        validateField(section.id, field, sectionValues)
      );
    });

    return missing;
  };

  const handleSubmit = async () => {
    if (!template) return;

    const missing = validate();
    if (missing.length) {
      toast.error(`Complete required fields: ${missing.slice(0, 5).join(", ")}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const submission = await inspectionService.submitInspectionReport(jobId, {
        template,
        formValues,
        mediaByField,
        notes,
      });
      const inspectionReportId =
        submission.report.id || submission.report._id || undefined;

      if (!inspectionReportId) {
        throw new Error("Inspection report was created without an ID");
      }

      await jobService.completeJob(jobId, {
        inspectionReportId,
        hasInvoice: false,
      });

      toast.success("Job completed successfully");
      onCompleted?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to complete this job");
      toast.error(err.message || "Failed to complete this job");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPrimitiveField = (
    sectionId: string,
    field: InspectionField,
    scopeValues: Record<string, any>,
    itemIndex?: number
  ) => {
    if (!isFieldVisible(field, scopeValues)) {
      return null;
    }

    const label = getFieldLabel(field);
    const value = scopeValues[field.id];
    const disabled = Boolean(field.metadata?.readOnly);
    const required = isFieldRequired(field, scopeValues);

    if (field.type === "photo" || field.type === "photo-multi") {
      const storageKey = getMediaStorageKey(sectionId, field.id, itemIndex);
      const files = mediaByField[storageKey] || [];

      return (
        <div className="inspection-field" key={`${sectionId}-${field.id}-${itemIndex ?? "root"}`}>
          <label>
            {label}
            {required ? <span className="required">*</span> : null}
          </label>
          <label className="file-drop">
            <input
              type="file"
              accept="image/*,.pdf"
              multiple={field.type === "photo-multi"}
              disabled={disabled}
              onChange={(event) =>
                setMediaFiles(
                  storageKey,
                  extractFiles(event),
                  field.type === "photo-multi"
                )
              }
            />
            <span>
              <RiUploadCloud2Line />
              {files.length
                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                : field.helpText || "Upload evidence files"}
            </span>
          </label>
          {files.length ? (
            <ul className="file-list">
              {files.map((file) => (
                <li key={`${storageKey}-${file.name}`}>{file.name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    if (field.type === "table") {
      const rows = Array.isArray(value) ? value : [];

      return (
        <div className="inspection-field table-field" key={`${sectionId}-${field.id}`}>
          <div className="table-header">
            <label>
              {label}
              {required ? <span className="required">*</span> : null}
            </label>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => addTableRow(sectionId, field)}
            >
              <RiAddLine /> Add Row
            </button>
          </div>

          {!rows.length ? (
            <div className="empty-inline">No rows added yet.</div>
          ) : (
            rows.map((row: Record<string, any>, rowIndex: number) => (
              <div className="table-row-card" key={`${sectionId}-${field.id}-${rowIndex}`}>
                <div className="table-row-header">
                  <strong>Row {rowIndex + 1}</strong>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeTableRow(sectionId, field.id, rowIndex)}
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
                <div className="field-grid">
                  {(field.columns || []).map((column) => {
                    const columnValue = row[column.id];
                    const columnField: InspectionField = {
                      id: column.id,
                      label: column.label,
                      type: column.type as InspectionField["type"],
                      required: column.required,
                      placeholder: column.placeholder,
                      helpText: column.helpText,
                      metadata: column.metadata,
                      options: column.options,
                    };

                    if (column.type === "photo" || column.type === "photo-multi") {
                      const nestedFieldId = `${field.id}.${column.id}`;
                      const storageKey = getMediaStorageKey(
                        sectionId,
                        nestedFieldId,
                        rowIndex
                      );
                      const files = mediaByField[storageKey] || [];

                      return (
                        <div className="inspection-field" key={storageKey}>
                          <label>
                            {column.label}
                            {column.required ? <span className="required">*</span> : null}
                          </label>
                          <label className="file-drop">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              multiple={column.type === "photo-multi"}
                              onChange={(event) =>
                                setMediaFiles(
                                  storageKey,
                                  extractFiles(event),
                                  column.type === "photo-multi"
                                )
                              }
                            />
                            <span>
                              <RiUploadCloud2Line />
                              {files.length
                                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                                : column.helpText || "Upload evidence files"}
                            </span>
                          </label>
                        </div>
                      );
                    }

                    return renderInputControl(
                      columnField,
                      columnValue,
                      (nextValue) =>
                        updateTableCell(
                          sectionId,
                          field.id,
                          rowIndex,
                          column.id,
                          nextValue
                        ),
                      row
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    return renderInputControl(
      field,
      value,
      (nextValue) => updateSectionField(sectionId, field.id, nextValue, itemIndex),
      scopeValues,
      `${sectionId}-${field.id}-${itemIndex ?? "root"}`
    );
  };

  const renderSection = (section: InspectionSection) => {
    if (section.repeatable) {
      const items = Array.isArray(formValues[section.id]) ? formValues[section.id] : [];
      return (
        <section className="inspection-section" key={section.id}>
          <div className="section-header">
            <div>
              <h3>{section.title}</h3>
              {section.description ? <p>{section.description}</p> : null}
            </div>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => addRepeatableItem(section)}
            >
              <RiAddLine /> {section.addButtonLabel || "Add Item"}
            </button>
          </div>

          <div className="repeatable-items">
            {items.map((item: Record<string, any>, itemIndex: number) => (
              <div className="repeatable-card" key={`${section.id}-${itemIndex}`}>
                <div className="repeatable-card-header">
                  <h4>{section.itemLabel || "Item"} {itemIndex + 1}</h4>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeRepeatableItem(section.id, itemIndex)}
                    >
                      <RiDeleteBinLine />
                    </button>
                  ) : null}
                </div>
                <div className="field-grid">
                  {section.fields.map((field) =>
                    renderPrimitiveField(section.id, field, item || {}, itemIndex)
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    const sectionValues = formValues[section.id] || {};

    return (
      <section className="inspection-section" key={section.id}>
        <div className="section-header">
          <div>
            <h3>{section.title}</h3>
            {section.description ? <p>{section.description}</p> : null}
          </div>
        </div>
        <div className="field-grid">
          {section.fields.map((field) =>
            renderPrimitiveField(section.id, field, sectionValues)
          )}
        </div>
      </section>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="technician-inspection-modal-overlay">
      <div className="technician-inspection-modal">
        <div className="modal-header">
          <div>
            <h2>Complete Job</h2>
            <p>Submit the inspection report and close the job from the web portal.</p>
          </div>
          <button type="button" className="icon-btn close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">
            <RiLoader4Line className="spin" />
            <p>Loading inspection workflow…</p>
          </div>
        ) : error ? (
          <div className="modal-error">
            <RiAlertLine />
            <div>
              <h3>Unable to load inspection workflow</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : template ? (
          <>
            <div className="summary-strip">
              <div>
                <span className="summary-label">Template</span>
                <strong>{template.title}</strong>
              </div>
              <div>
                <span className="summary-label">Job Type</span>
                <strong>{template.jobType}</strong>
              </div>
              <div>
                <span className="summary-label">Sections</span>
                <strong>{summary?.sections || 0}</strong>
              </div>
              <div>
                <span className="summary-label">Evidence Fields</span>
                <strong>{summary?.photoFields || 0}</strong>
              </div>
            </div>

            <div className="modal-body">
              {template.sections.map(renderSection)}

              <section className="inspection-section">
                <div className="section-header">
                  <div>
                    <h3>Completion Notes</h3>
                    <p>Optional notes to include with the inspection report.</p>
                  </div>
                </div>
                <textarea
                  className="notes-input"
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any site notes, access notes, or follow-up items"
                />
              </section>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RiLoader4Line className="spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <RiCalendarCheckLine /> Submit Report & Complete Job
                  </>
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

const renderInputControl = (
  field: InspectionField,
  value: any,
  onChange: (value: any) => void,
  scopeValues: Record<string, any>,
  key?: string
) => {
  const label = getFieldLabel(field);
  const disabled = Boolean(field.metadata?.readOnly);
  const required = isFieldRequired(field, scopeValues);
  const options = getFieldOptions(field);

  if (multiSelectTypes.has(field.type)) {
    const currentValue = Array.isArray(value) ? value : [];
    return (
      <div className="inspection-field" key={key || field.id}>
        <label>
          {label}
          {required ? <span className="required">*</span> : null}
        </label>
        <div className="checkbox-list">
          {options.map((option) => (
            <label className="checkbox-item" key={`${field.id}-${option.value}`}>
              <input
                type="checkbox"
                checked={currentValue.includes(option.value)}
                disabled={disabled}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange([...currentValue, option.value]);
                  } else {
                    onChange(currentValue.filter((entry: string) => entry !== option.value));
                  }
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (checkboxTypes.has(field.type)) {
    return (
      <div className="inspection-field checkbox-field" key={key || field.id}>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span>
            {label}
            {required ? <span className="required">*</span> : null}
          </span>
        </label>
      </div>
    );
  }

  if (selectTypes.has(field.type)) {
    return (
      <div className="inspection-field" key={key || field.id}>
        <label>
          {label}
          {required ? <span className="required">*</span> : null}
        </label>
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={`${field.id}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="inspection-field" key={key || field.id}>
        <label>
          {label}
          {required ? <span className="required">*</span> : null}
        </label>
        <textarea
          rows={4}
          value={value ?? ""}
          disabled={disabled}
          placeholder={field.placeholder || ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  const inputType =
    field.type === "number"
      ? "number"
      : field.type === "date"
      ? "date"
      : field.type === "time"
      ? "time"
      : "text";

  return (
    <div className="inspection-field" key={key || field.id}>
      <label>
        {label}
        {required ? <span className="required">*</span> : null}
      </label>
      <input
        type={inputType}
        value={field.type === "date" ? toDateValue(value) : value ?? ""}
        disabled={disabled}
        placeholder={field.placeholder || ""}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(event) => onChange(event.target.value)}
      />
      {field.helpText ? <small>{field.helpText}</small> : null}
      {field.type === "signature" ? (
        <small>Type the technician name/signature as confirmation.</small>
      ) : null}
    </div>
  );
};

export default TechnicianInspectionCompletionModal;
