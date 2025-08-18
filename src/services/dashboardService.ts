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

interface FilteredDashboardParams {
  startDate?: string;
  endDate?: string;
  viewType?: 'daily' | 'weekly' | 'monthly';
  statusFilter?: string;
}

interface FilteredDashboardData {
  trends: Array<{
    period: string;
    totalJobs: number;
    completedJobs: number;
    pendingJobs: number;
    inProgressJobs: number;
    overdueJobs: number;
    completionRate: string;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  totalJobs: number;
  dateRange: { startDate?: string; endDate?: string };
  viewType: string;
  statusFilter: string;
  lastUpdated: string;
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

  // Get filtered admin dashboard statistics
  getFilteredAdminStats: async (params: FilteredDashboardParams): Promise<{
    status: string;
    data: FilteredDashboardData;
  }> => {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.viewType) queryParams.append('viewType', params.viewType);
    if (params.statusFilter) queryParams.append('statusFilter', params.statusFilter);
    
    const response = await api.get(`/v1/dashboard/admin-stats-filtered?${queryParams.toString()}`);
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
