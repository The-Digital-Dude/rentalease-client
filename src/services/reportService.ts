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
}

const reportService = new ReportService();
export default reportService;
