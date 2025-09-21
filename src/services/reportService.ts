import api from "./api";
import type { AxiosResponse } from "axios";

export interface ComplianceData {
  id: string;
  name: string;
  type: "agency" | "region" | "property";
  totalJobs: number;
  completedJobs: number;
  compliantJobs: number;
  overdueJobs: number;
  complianceRate: number;
  avgCompletionTime: number;
}

export interface RevenueData {
  period: string;
  agency: string;
  region: string;
  jobType: string;
  amount: number;
  jobCount: number;
  avgJobValue: number;
}

export interface TechnicianPerformance {
  id: string;
  name: string;
  tradeType: string;
  jobsCompleted: number;
  avgCompletionTime: number;
  rating: number;
  onTimeRate: number;
  totalRevenue: number;
  efficiency: number;
}

export interface TechnicianPayment {
  id: string;
  technicianName: string;
  amount: number;
  status: string;
  paymentDate: string;
}

export interface ComplianceReportResponse {
  status: "success" | "error";
  data: ComplianceData[];
}

export interface RevenueReportResponse {
  status: "success" | "error";
  data: RevenueData[];
}

export interface TechnicianPerformanceReportResponse {
  status: "success" | "error";
  data: TechnicianPerformance[];
}

export interface TechnicianPaymentsReportResponse {
  status: "success" | "error";
  data: TechnicianPayment[];
}

export interface ExecutiveDashboard {
  kpis: {
    today: {
      newJobs: number;
      completedJobs: number;
      revenue: number;
      growth: {
        newJobs: string;
        completedJobs: string;
        revenue: string;
      };
    };
    thisWeek: {
      newJobs: number;
      completedJobs: number;
      revenue: number;
      growth: {
        newJobs: string;
        completedJobs: string;
        revenue: string;
      };
    };
    thisMonth: {
      newJobs: number;
      completedJobs: number;
      revenue: number;
      growth: {
        newJobs: string;
        completedJobs: string;
        revenue: string;
      };
    };
    yearToDate: {
      newJobs: number;
      completedJobs: number;
      revenue: number;
    };
  };
  businessHealth: {
    totalActiveEntities: {
      agencies: number;
      properties: number;
      technicians: number;
      managers: number;
      total: number;
    };
    jobCompletionRate: number;
    avgJobValue: number;
    customerSatisfaction: number;
    technicianUtilization: number;
  };
  alerts: {
    critical: number;
    warnings: number;
    info: number;
  };
  lastUpdated: string;
}

export interface OperationalAnalytics {
  resourceUtilization: {
    technicianWorkload: Array<{
      name: string;
      tradeType: string;
      totalJobs: number;
      activeJobs: number;
      completedThisMonth: number;
      utilizationRate: number;
    }>;
    totalActiveTechnicians: number;
    avgUtilization: string;
  };
  jobAnalytics: {
    typeDistribution: Array<{
      jobType: string;
      count: number;
      completed: number;
      completionRate: number;
      avgCompletionTime: number;
    }>;
    timeToCompletion: Array<{
      jobType: string;
      avgCompletionTime: number;
      minCompletionTime: number;
      maxCompletionTime: number;
      count: number;
    }>;
    totalJobTypes: number;
  };
  propertyInsights: {
    jobFrequency: Array<{
      address: any;
      totalJobs: number;
      recentJobs: number;
      avgJobsPerMonth: number;
    }>;
    totalPropertiesWithJobs: number;
  };
  regionalPerformance: Array<{
    companyName: string;
    state: string;
    totalProperties: number;
    totalJobs: number;
    completedJobs: number;
    completionRate: number;
  }>;
  lastUpdated: string;
}

export interface ExecutiveDashboardResponse {
  status: "success" | "error";
  data: ExecutiveDashboard;
}

export interface OperationalAnalyticsResponse {
  status: "success" | "error";
  data: OperationalAnalytics;
}

class ReportService {
  private baseUrl = "/v1/properties/reports";

  async getComplianceReport(
    groupBy: "agency" | "region" | "property"
  ): Promise<ComplianceReportResponse> {
    try {
      const response: AxiosResponse<ComplianceReportResponse> = await api.get(
        `${this.baseUrl}/compliance?groupBy=${groupBy}`
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

  async getRevenueReport(
    groupBy: "agency" | "region" | "jobType",
    period: "week" | "month" | "quarter" | "year"
  ): Promise<RevenueReportResponse> {
    try {
      const response: AxiosResponse<RevenueReportResponse> = await api.get(
        `${this.baseUrl}/revenue?groupBy=${groupBy}&period=${period}`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch revenue report",
        }
      );
    }
  }

  async getTechnicianPerformanceReport(): Promise<TechnicianPerformanceReportResponse> {
    try {
      const response: AxiosResponse<TechnicianPerformanceReportResponse> = await api.get(
        `/v1/technicians/reports/performance`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch technician performance report",
        }
      );
    }
  }

  async getTechnicianPaymentsReport(): Promise<TechnicianPaymentsReportResponse> {
    try {
      const response: AxiosResponse<TechnicianPaymentsReportResponse> = await api.get(
        `/v1/technicians/reports/payments`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch technician payments report",
        }
      );
    }
  }

  async getExecutiveDashboard(): Promise<ExecutiveDashboardResponse> {
    try {
      const response: AxiosResponse<ExecutiveDashboardResponse> = await api.get(
        `/v1/dashboard/executive-dashboard`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch executive dashboard data",
        }
      );
    }
  }

  async getOperationalAnalytics(): Promise<OperationalAnalyticsResponse> {
    try {
      const response: AxiosResponse<OperationalAnalyticsResponse> = await api.get(
        `/v1/dashboard/operational-analytics`
      );
      return response.data;
    } catch (error: any) {
      throw (
        error?.response?.data || {
          status: "error",
          message: "Failed to fetch operational analytics data",
        }
      );
    }
  }
}

const reportService = new ReportService();
export default reportService;
