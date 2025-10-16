import api from "./api";
import type { AxiosResponse } from "axios";

export interface InspectionReport {
  id: string;
  property: string;
  jobType: string;
  submittedAt: string;
  technician: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  template?: {
    jobType: string;
    title: string;
    version: number;
  };
  pdf?: {
    url: string;
    size?: number;
  };
  formData?: Record<string, any>;
  media?: Array<{
    id: string;
    label: string;
    url: string;
    type: string;
    size?: number;
  }>;
  notes?: string;
}

export interface InspectionReportsResponse {
  status: "success" | "error";
  data?: {
    reports: InspectionReport[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface InspectionReportFilters {
  page?: number;
  limit?: number;
  jobType?: string;
  startDate?: string;
  endDate?: string;
}

class InspectionReportService {
  async getReportsForProperty(
    propertyId: string,
    filters: InspectionReportFilters = {}
  ): Promise<InspectionReportsResponse> {
    try {
      const params: Record<string, string | number> = {};

      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response: AxiosResponse = await api.get(
        `/v1/inspections/properties/${propertyId}`,
        { params }
      );

      return {
        status: "success",
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Error fetching inspection reports:", error);
      return {
        status: "error",
        message: error.response?.data?.message || error.message || "Failed to fetch inspection reports",
      };
    }
  }

  async getReportById(reportId: string): Promise<{
    status: "success" | "error";
    data?: {
      report: InspectionReport;
      pdf?: { url: string };
      formData?: Record<string, any>;
      media?: Array<{
        id: string;
        label: string;
        url: string;
        type: string;
        size?: number;
      }>;
    };
    message?: string;
  }> {
    try {
      const response: AxiosResponse = await api.get(`/v1/inspections/reports/${reportId}`);

      return {
        status: "success",
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Error fetching inspection report:", error);
      return {
        status: "error",
        message: error.response?.data?.message || error.message || "Failed to fetch inspection report",
      };
    }
  }

  formatTechnicianName(technician: InspectionReport["technician"]): string {
    if (!technician) return "Unknown";

    const firstName = technician.firstName?.trim() || "";
    const lastName = technician.lastName?.trim() || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    return firstName || lastName || technician.email || "Unknown";
  }

  getJobTypeDisplayName(jobType: string): string {
    switch (jobType) {
      case "Gas":
        return "Gas Safety";
      case "Electrical":
        return "Electrical Safety";
      case "Smoke":
        return "Smoke Alarm";
      case "MinimumSafetyStandard":
        return "Minimum Safety Standard";
      default:
        return jobType;
    }
  }
}

const inspectionReportService = new InspectionReportService();
export default inspectionReportService;