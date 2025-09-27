import api from "./api";
import type { AxiosResponse } from "axios";

// PropertyManager Report Interfaces
export interface PropertyManagerDashboard {
  propertiesManaged: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  pendingJobs: number;
  overdueJobs: number;
  complianceOverview: {
    compliant: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    jobId: string;
    jobType: string;
    status: string;
    propertyAddress: string;
    technicianName: string;
    dueDate: string;
    createdAt: string;
  }>;
  lastUpdated: string;
}

export interface PropertyManagerOverview {
  propertiesManaged: number;
  performanceMetrics: {
    totalJobs?: number;
    completedJobs?: number;
    avgCompletionTime?: number;
    totalCost?: number;
  };
  monthlyTrends: Array<{
    month: string;
    totalJobs: number;
    completedJobs: number;
    completionRate: string;
    totalCost: number;
  }>;
  topPerformingProperties: Array<{
    propertyId: string;
    address: any;
    totalJobs: number;
    completedJobs: number;
    completionRate: string;
  }>;
}

export interface PropertyManagerJobAnalytics {
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  typeDistribution: Array<{
    jobType: string;
    count: number;
    completed: number;
    completionRate: string;
    avgCompletionTime: string | null;
  }>;
  upcomingJobs: Array<{
    id: string;
    jobId: string;
    jobType: string;
    status: string;
    dueDate: string;
    priority: string;
    propertyAddress: string;
    technicianName: string;
  }>;
}

export interface PropertyManagerCompliance {
  overview: {
    totalProperties: number;
    compliant: number;
    dueSoon: number;
    overdue: number;
    complianceScore: number;
  };
  propertiesByStatus: Array<{
    propertyId: string;
    address: any;
    status: string;
    issues: string[];
    complianceSchedule: any;
  }>;
  upcomingInspections: Array<{
    propertyId: string;
    propertyAddress: string;
    inspectionType: string;
    dueDate: string;
    status: string;
    daysOverdue?: number;
    daysUntilDue?: number;
  }>;
}

export interface PropertyManagerFinancial {
  overview: {
    totalCost: number;
    averageJobCost: number;
    totalJobs: number;
  };
  costByProperty: Array<{
    propertyId: string;
    address: any;
    totalCost: number;
    jobCount: number;
    averageCost: number;
  }>;
  costByJobType: Array<{
    jobType: string;
    totalCost: number;
    jobCount: number;
    averageCost: number;
  }>;
  monthlySpending: Array<{
    month: string;
    totalCost: number;
    jobCount: number;
    averageCost: number;
  }>;
}

// Response Types
export interface PropertyManagerDashboardResponse {
  status: "success" | "error";
  message: string;
  data: PropertyManagerDashboard;
}

export interface PropertyManagerOverviewResponse {
  status: "success" | "error";
  data: PropertyManagerOverview;
}

export interface PropertyManagerJobAnalyticsResponse {
  status: "success" | "error";
  data: PropertyManagerJobAnalytics;
}

export interface PropertyManagerComplianceResponse {
  status: "success" | "error";
  data: PropertyManagerCompliance;
}

export interface PropertyManagerFinancialResponse {
  status: "success" | "error";
  data: PropertyManagerFinancial;
}

class PropertyManagerReportService {
  private baseUrl = "/v1/dashboard";
  private reportsBaseUrl = "/v1/reports/property-manager";

  // Get PropertyManager Dashboard Statistics
  async getPropertyManagerDashboard(): Promise<PropertyManagerDashboardResponse> {
    try {
      const response: AxiosResponse<PropertyManagerDashboardResponse> = await api.get(
        `${this.baseUrl}/property-manager-stats`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch PropertyManager dashboard data",
        }
      );
    }
  }

  // Get PropertyManager Overview Report
  async getOverviewReport(): Promise<PropertyManagerOverviewResponse> {
    try {
      const response: AxiosResponse<PropertyManagerOverviewResponse> = await api.get(
        `${this.reportsBaseUrl}/overview`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch overview report",
        }
      );
    }
  }

  // Get PropertyManager Job Analytics
  async getJobAnalytics(): Promise<PropertyManagerJobAnalyticsResponse> {
    try {
      const response: AxiosResponse<PropertyManagerJobAnalyticsResponse> = await api.get(
        `${this.reportsBaseUrl}/jobs`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch job analytics",
        }
      );
    }
  }

  // Get PropertyManager Compliance Report
  async getComplianceReport(): Promise<PropertyManagerComplianceResponse> {
    try {
      const response: AxiosResponse<PropertyManagerComplianceResponse> = await api.get(
        `${this.reportsBaseUrl}/compliance`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch compliance report",
        }
      );
    }
  }

  // Get PropertyManager Financial Overview
  async getFinancialOverview(): Promise<PropertyManagerFinancialResponse> {
    try {
      const response: AxiosResponse<PropertyManagerFinancialResponse> = await api.get(
        `${this.reportsBaseUrl}/financial`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch financial overview",
        }
      );
    }
  }

  // Get PropertyManager Technician Payments (uses existing endpoint with filtering)
  async getTechnicianPayments() {
    try {
      const response = await api.get("/v1/technicians/reports/payments");
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch technician payments",
        }
      );
    }
  }
}

const propertyManagerReportService = new PropertyManagerReportService();
export default propertyManagerReportService;