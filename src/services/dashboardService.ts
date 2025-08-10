import api from "./api";

interface DashboardStats {
  overview: {
    totalAgencies: number;
    totalProperties: number;
    totalTechnicians: number;
    totalPropertyManagers: number;
    totalTeamMembers: number;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    pendingJobs: number;
    overdueJobs: number;
  };
  jobStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  recentActivity: {
    newAgencies: number;
    newProperties: number;
    newTechnicians: number;
    newJobs: number;
    completedJobsWeek: number;
  };
  paymentStats: {
    totalPayments: number;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    pendingCount: number;
    paidCount: number;
  };
  monthlyTrends: Array<{
    month: string;
    totalJobs: number;
    completedJobs: number;
  }>;
  topTechnicians: Array<{
    name: string;
    completedJobs: number;
  }>;
  recentJobs: Array<{
    id: string;
    job_id: string;
    jobType: string;
    status: string;
    dueDate: string;
    createdAt: string;
    technicianName: string;
    propertyAddress: string;
  }>;
  lastUpdated: string;
}

interface SystemHealth {
  totalActiveUsers: number;
  jobsCompletionRate: number;
  avgResponseTime: string;
  systemAlerts: Array<{
    type: "warning" | "info" | "error";
    message: string;
    count: number;
  }>;
  uptime: string;
  serverStatus: string;
  lastChecked: string;
}

const dashboardService = {
  // Get admin dashboard statistics
  getAdminStats: async (): Promise<{
    status: string;
    data: DashboardStats;
  }> => {
    const response = await api.get("/v1/dashboard/admin-stats");
    console.log(response.data, "response.data...");
    return response.data;
  },

  // Get system health metrics
  getSystemHealth: async (): Promise<{
    status: string;
    data: SystemHealth;
  }> => {
    const response = await api.get("/v1/dashboard/system-health");
    return response.data;
  },
};

export default dashboardService;
