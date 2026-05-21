import api from "./api";

export type InspectionFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "multi-select"
  | "date"
  | "time"
  | "photo"
  | "photo-multi"
  | "rating"
  | "signature"
  | "yes-no"
  | "yes-no-na"
  | "pass-fail"
  | "pass-fail-na"
  | "checkbox"
  | "checkbox-group"
  | "table"
  | "radio";

export type InspectionFieldOption = {
  value: string;
  label: string;
};

export type InspectionTableColumn = {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "date"
    | "photo"
    | "photo-multi";
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  metadata?: Record<string, any>;
  options?: InspectionFieldOption[];
};

export type InspectionField = {
  id: string;
  label: string;
  question?: string;
  type: InspectionFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: InspectionFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  metadata?: Record<string, any>;
  columns?: InspectionTableColumn[];
  defaultValue?: any;
};

export type InspectionSection = {
  id: string;
  title: string;
  description?: string;
  repeatable?: boolean;
  minItems?: number;
  addButtonLabel?: string;
  itemLabel?: string;
  metadata?: Record<string, any>;
  fields: InspectionField[];
};

export type InspectionTemplate = {
  id?: string;
  jobType: string;
  title: string;
  version: number;
  metadata?: Record<string, any>;
  sections: InspectionSection[];
};

export type JobInspectionTemplateResponse = {
  template: InspectionTemplate;
  job: {
    id: string;
    job_id: string;
    jobType: string;
    status: string;
    dueDate: string;
  };
  property: {
    id: string;
    address?: any;
    propertyType?: string;
    bedroomCount?: number;
    bathroomCount?: number;
  } | null;
  technician: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    licenseNumber?: string;
  } | null;
};

export type InspectionSubmissionPayload = {
  template: InspectionTemplate;
  formValues: Record<string, any>;
  mediaByField: Record<string, File[]>;
  notes?: string;
};

export const getMediaStorageKey = (
  sectionId: string,
  fieldId: string,
  itemIndex?: number
) => {
  if (itemIndex === undefined) {
    return fieldId;
  }
  return `${sectionId}__${itemIndex}__${fieldId}`;
};

const normalizeSubmissionFormData = (
  template: InspectionTemplate,
  formValues: Record<string, any>
) => {
  const normalized = JSON.parse(JSON.stringify(formValues || {}));

  const isGasV3Template =
    template.jobType === "Gas" &&
    Array.isArray(template.sections) &&
    template.sections.some(
      (section) => section.id === "gas-appliances" && section.repeatable
    );

  if (isGasV3Template) {
    if (normalized["final-declaration"]) {
      delete normalized["final-declaration"]["final-compliance-outcome"];
    }
    if (normalized["compliance-assessment"]) {
      delete normalized["compliance-assessment"]["overall-assessment"];
    }
  }

  return normalized;
};

export const inspectionService = {
  async fetchJobInspectionTemplate(
    jobId: string
  ): Promise<JobInspectionTemplateResponse> {
    const response = await api.get(`/v1/inspections/jobs/${jobId}/template`);

    if (response.data?.status === "success" && response.data?.data) {
      return response.data.data as JobInspectionTemplateResponse;
    }

    throw new Error(
      response.data?.message || "Failed to load job inspection template"
    );
  },

  async submitInspectionReport(
    jobId: string,
    payload: InspectionSubmissionPayload
  ): Promise<{
    report: { id: string; _id?: string; pdf?: { url?: string } };
    pdf?: { url?: string };
  }> {
    const formData = new FormData();
    formData.append("jobType", payload.template.jobType);
    formData.append("templateVersion", String(payload.template.version));
    formData.append(
      "formData",
      JSON.stringify(
        normalizeSubmissionFormData(payload.template, payload.formValues)
      )
    );

    if (payload.notes) {
      formData.append("notes", payload.notes);
    }

    const mediaMeta: Record<string, any> = {};

    const appendFiles = (
      uploadFieldId: string,
      field: Pick<InspectionField, "id" | "label" | "question">,
      files: File[],
      metadata: Record<string, any>
    ) => {
      mediaMeta[uploadFieldId] = {
        label: field.question || field.label || field.id,
        metadata: {
          ...metadata,
          count: files.length,
        },
      };

      files.forEach((file) => {
        formData.append(`media__${uploadFieldId}`, file);
      });
    };

    payload.template.sections.forEach((section) => {
      if (section.repeatable) {
        const sectionItems = Array.isArray(payload.formValues[section.id])
          ? payload.formValues[section.id]
          : [];

        sectionItems.forEach((_: unknown, itemIndex: number) => {
          section.fields.forEach((field) => {
            const storageKey = getMediaStorageKey(section.id, field.id, itemIndex);
            const files = payload.mediaByField[storageKey];
            if (!files?.length) return;

            appendFiles(`${field.id}-${itemIndex}`, field, files, {
              sectionId: section.id,
              fieldId: field.id,
              itemIndex,
            });
          });
        });
        return;
      }

      section.fields.forEach((field) => {
        if (field.type === "table") {
          const rows = Array.isArray(payload.formValues[section.id]?.[field.id])
            ? payload.formValues[section.id][field.id]
            : [];
          const photoColumns = (field.columns || []).filter(
            (column) => column.type === "photo" || column.type === "photo-multi"
          );

          rows.forEach((_: unknown, rowIndex: number) => {
            photoColumns.forEach((column) => {
              const nestedFieldId = `${field.id}.${column.id}`;
              const storageKey = getMediaStorageKey(
                section.id,
                nestedFieldId,
                rowIndex
              );
              const files = payload.mediaByField[storageKey];
              if (!files?.length) return;

              appendFiles(
                `${field.id}-${column.id}-${rowIndex}`,
                {
                  id: column.id,
                  label: column.label,
                  question: column.label,
                },
                files,
                {
                  sectionId: section.id,
                  fieldId: column.id,
                  parentFieldId: field.id,
                  itemIndex: rowIndex,
                }
              );
            });
          });
        }

        const storageKey = getMediaStorageKey(section.id, field.id);
        const files = payload.mediaByField[storageKey];
        if (!files?.length) return;

        appendFiles(field.id, field, files, {
          sectionId: section.id,
          fieldId: field.id,
        });
      });
    });

    if (Object.keys(mediaMeta).length) {
      formData.append("mediaMeta", JSON.stringify(mediaMeta));
    }

    const response = await api.post(`/v1/inspections/jobs/${jobId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data?.status === "success" && response.data?.data) {
      return response.data.data;
    }

    throw new Error(
      response.data?.message || "Failed to submit inspection report"
    );
  },
};

export default inspectionService;
