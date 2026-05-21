import { useState, useEffect } from "react";
import styles from "./SuperUserDashboard.module.scss";
import {
  RiUserLine,
  RiBuildingLine,
  RiTeamLine,
  RiBarChartLine,
  RiSettingsLine,
  RiShieldLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiCheckLine,
  RiRefreshLine,
  RiAlertLine,
  RiEditLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiArrowUpLine as RiTrendingUpLine,
  RiArrowDownLine as RiTrendingDownLine,
  RiEyeLine,
  RiUserStarLine,
  RiPieChartLine,
  RiLineChartLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiLoaderLine,
  RiToolsLine,
  RiHomeSmileLine,
  RiHandHeartLine,
  RiDownloadLine,
  RiPriceTag3Line,
} from "react-icons/ri";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import { TECHNICIAN_PAYMENTS_ENABLED } from "../../config/features";
import { useAppSelector } from "../../store";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import dashboardService, {
  type DashboardStats as DashboardData,
} from "../../services/dashboardService";
import invoiceService, { type Invoice } from "../../services/invoiceService";
import propertyManagerInvoiceService, {
  type PropertyManagerInvoice,
} from "../../services/propertyManagerInvoiceService";

const INVOICE_STATS_CHANGED_EVENT = "invoice-stats-changed";

type DashboardSystemHealth = {
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
};

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const hasNestedInvoiceStatsShape = (invoiceStats: any) =>
  Boolean(invoiceStats?.completedJob && invoiceStats?.extraServices);

const getNormalizedInvoiceStats = (invoiceStats: any) => {
  if (invoiceStats?.completedJob && invoiceStats?.extraServices) {
    const completedDraftAmount = toNumber(invoiceStats.completedJob.draftAmount);
    const completedSentAmount = toNumber(invoiceStats.completedJob.sentAmount);
    const completedPaidAmount = toNumber(invoiceStats.completedJob.paidAmount);
    const completedTotalAmount =
      completedDraftAmount + completedSentAmount + completedPaidAmount;

    const extraPendingAmount = toNumber(invoiceStats.extraServices.pendingAmount);
    const extraAcceptedAmount = toNumber(
      invoiceStats.extraServices.acceptedAmount
    );
    const extraRejectedAmount = toNumber(
      invoiceStats.extraServices.rejectedAmount
    );
    const extraTotalAmount =
      extraPendingAmount + extraAcceptedAmount + extraRejectedAmount;

    return {
      completedJob: {
        totalInvoices: toNumber(invoiceStats.completedJob.totalInvoices),
        totalAmount: completedTotalAmount,
        draftAmount: completedDraftAmount,
        draftCount: toNumber(invoiceStats.completedJob.draftCount),
        sentAmount: completedSentAmount,
        sentCount: toNumber(invoiceStats.completedJob.sentCount),
        paidAmount: completedPaidAmount,
        paidCount: toNumber(invoiceStats.completedJob.paidCount),
      },
      extraServices: {
        totalInvoices: toNumber(invoiceStats.extraServices.totalInvoices),
        totalAmount: extraTotalAmount,
        pendingAmount: extraPendingAmount,
        pendingCount: toNumber(invoiceStats.extraServices.pendingCount),
        acceptedAmount: extraAcceptedAmount,
        acceptedCount: toNumber(invoiceStats.extraServices.acceptedCount),
        rejectedAmount: extraRejectedAmount,
        rejectedCount: toNumber(invoiceStats.extraServices.rejectedCount),
      },
    };
  }

  const legacyDraftAmount = toNumber(invoiceStats?.draftAmount);
  const legacySentAmount = toNumber(invoiceStats?.pendingAmount);
  const legacyPaidAmount = toNumber(invoiceStats?.paidAmount);

  return {
    completedJob: {
      totalInvoices: toNumber(invoiceStats?.completedJobInvoices),
      totalAmount: legacyDraftAmount + legacySentAmount + legacyPaidAmount,
      draftAmount: legacyDraftAmount,
      draftCount: toNumber(invoiceStats?.draftCount),
      sentAmount: legacySentAmount,
      sentCount: toNumber(invoiceStats?.pendingCount),
      paidAmount: legacyPaidAmount,
      paidCount: toNumber(invoiceStats?.paidCount),
    },
    extraServices: {
      totalInvoices: toNumber(invoiceStats?.propertyManagerInvoices),
      totalAmount: 0,
      pendingAmount: 0,
      pendingCount: 0,
      acceptedAmount: 0,
      acceptedCount: 0,
      rejectedAmount: toNumber(invoiceStats?.rejectedAmount),
      rejectedCount: toNumber(invoiceStats?.rejectedCount),
    },
  };
};

const buildInvoiceStatsFromInvoices = (
  completedInvoices: Invoice[],
  extraServiceInvoices: PropertyManagerInvoice[]
) => {
  const completedJob = {
    totalInvoices: completedInvoices.length,
    draftAmount: completedInvoices
      .filter((invoice) => invoice.status === "Draft")
      .reduce((sum, invoice) => sum + toNumber(invoice.totalCost), 0),
    draftCount: completedInvoices.filter((invoice) => invoice.status === "Draft")
      .length,
    sentAmount: completedInvoices
      .filter((invoice) => invoice.status === "Sent")
      .reduce((sum, invoice) => sum + toNumber(invoice.totalCost), 0),
    sentCount: completedInvoices.filter((invoice) => invoice.status === "Sent")
      .length,
    paidAmount: completedInvoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + toNumber(invoice.totalCost), 0),
    paidCount: completedInvoices.filter((invoice) => invoice.status === "Paid")
      .length,
  };

  const extraServices = {
    totalInvoices: extraServiceInvoices.length,
    pendingAmount: extraServiceInvoices
      .filter((invoice) => invoice.status === "Pending")
      .reduce((sum, invoice) => sum + toNumber(invoice.amount), 0),
    pendingCount: extraServiceInvoices.filter(
      (invoice) => invoice.status === "Pending"
    ).length,
    acceptedAmount: extraServiceInvoices
      .filter((invoice) => invoice.status === "Accepted")
      .reduce((sum, invoice) => sum + toNumber(invoice.amount), 0),
    acceptedCount: extraServiceInvoices.filter(
      (invoice) => invoice.status === "Accepted"
    ).length,
    rejectedAmount: extraServiceInvoices
      .filter((invoice) => invoice.status === "Rejected")
      .reduce((sum, invoice) => sum + toNumber(invoice.amount), 0),
    rejectedCount: extraServiceInvoices.filter(
      (invoice) => invoice.status === "Rejected"
    ).length,
  };

  return {
    completedJob: {
      ...completedJob,
      totalAmount:
        completedJob.draftAmount +
        completedJob.sentAmount +
        completedJob.paidAmount,
    },
    extraServices: {
      ...extraServices,
      totalAmount:
        extraServices.pendingAmount +
        extraServices.acceptedAmount +
        extraServices.rejectedAmount,
    },
  };
};

const SuperUserDashboard = () => {
  const userState = useAppSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Debug logging to check user state
  useEffect(() => {
    console.log("SuperUserDashboard - User State Debug:", {
      fullState: userState,
      userName: userState?.name,
      userNameTrimmed: userState?.name?.trim(),
      userNameLength: userState?.name?.length,
      localStorage: localStorage.getItem("userData"),
    });
  }, [userState]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [systemHealth, setSystemHealth] = useState<DashboardSystemHealth | null>(
    null
  );
  const [invoiceStatsOverride, setInvoiceStatsOverride] = useState<
    ReturnType<typeof getNormalizedInvoiceStats> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [selectedChartData, setSelectedChartData] = useState<any>(null);
  const [showChartDetails, setShowChartDetails] = useState(false);

  // Chart filtering states
  const [chartDateRange, setChartDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState("6");
  const [chartStatusFilter, setChartStatusFilter] = useState("all");
  const [chartViewType, setChartViewType] = useState<
    "monthly" | "weekly" | "daily"
  >("monthly");
  const [filteredChartData, setFilteredChartData] = useState<any>(null);
  const [loadingFilteredData, setLoadingFilteredData] = useState(false);
  const [chartValidationError, setChartValidationError] = useState<
    string | null
  >(null);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [dashboardResponse, healthResponse] = await Promise.all([
        dashboardService.getAdminStats(),
        dashboardService.getSystemHealth(),
      ]);
      if (dashboardResponse.status === "success") {
        setDashboardData(dashboardResponse.data);
        if (healthResponse.status === "success") {
          setSystemHealth(healthResponse.data);
        }

        if (hasNestedInvoiceStatsShape(dashboardResponse.data.invoiceStats)) {
          setInvoiceStatsOverride(null);
        } else {
          try {
            const [completedInvoicesResponse, extraServicesResponse] =
              await Promise.all([
                invoiceService.getInvoices({
                  limit: 1000,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                }),
                propertyManagerInvoiceService.getAllPropertyManagerInvoices(),
              ]);

            const completedInvoices =
              completedInvoicesResponse.status === "success"
                ? completedInvoicesResponse.data?.invoices || []
                : [];
            const extraServiceInvoices =
              extraServicesResponse.status === "success"
                ? extraServicesResponse.data?.invoices || []
                : [];

            setInvoiceStatsOverride(
              buildInvoiceStatsFromInvoices(
                completedInvoices,
                extraServiceInvoices
              )
            );
          } catch (invoiceStatsError) {
            console.error(
              "Failed to build fallback invoice stats for dashboard:",
              invoiceStatsError
            );
            setInvoiceStatsOverride(null);
          }
        }
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFilteredData = async () => {
    const hasOneDateOnly =
      (chartDateRange.startDate && !chartDateRange.endDate) ||
      (!chartDateRange.startDate && chartDateRange.endDate);

    if (hasOneDateOnly) {
      setChartValidationError("Select both a start date and an end date.");
      setFilteredChartData(null);
      return;
    }

    if (
      chartDateRange.startDate &&
      chartDateRange.endDate &&
      new Date(chartDateRange.startDate) > new Date(chartDateRange.endDate)
    ) {
      setChartValidationError("Start date cannot be later than end date.");
      setFilteredChartData(null);
      return;
    }

    setChartValidationError(null);

    if (
      !chartDateRange.startDate &&
      !chartDateRange.endDate &&
      chartStatusFilter === "all" &&
      chartViewType === "monthly"
    ) {
      setFilteredChartData(null);
      return;
    }

    try {
      setLoadingFilteredData(true);
      const params = {
        startDate: chartDateRange.startDate || undefined,
        endDate: chartDateRange.endDate || undefined,
        viewType: chartViewType,
        statusFilter: chartStatusFilter,
      };

      const response = await dashboardService.getFilteredAdminStats(params);
      if (response.status === "success") {
        setFilteredChartData(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch filtered data:", error);
    } finally {
      setLoadingFilteredData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleInvoiceStatsChanged = () => {
      fetchDashboardData();
    };

    window.addEventListener(
      INVOICE_STATS_CHANGED_EVENT,
      handleInvoiceStatsChanged
    );

    return () => {
      window.removeEventListener(
        INVOICE_STATS_CHANGED_EVENT,
        handleInvoiceStatsChanged
      );
    };
  }, []);

  useEffect(() => {
    fetchFilteredData();
  }, [chartDateRange, chartStatusFilter, chartViewType]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Navigation handlers for quick actions
  const handleQuickAction = (route: string) => {
    navigate(`/${route}`);
  };

  // Handler for job item clicks
  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Handler for stat card clicks
  const handleStatCardClick = (type: string) => {
    switch (type) {
      case "agencies":
        navigate("/agencies");
        break;
      case "properties":
        navigate("/properties");
        break;
      case "technicians":
        navigate("/technician");
        break;
      case "jobs":
        navigate("/jobs");
        break;
      case "payments":
      case "invoices":
        navigate("/invoice-management");
        break;
      case "teamMembers":
        navigate("/teamMembers");
        break;
      default:
        break;
    }
  };

  // Handle chart interactions
  const handleChartClick = (data: any) => {
    if (data && data.activePayload) {
      setSelectedChartData(data.activePayload[0].payload);
      setShowChartDetails(true);
    }
  };

  const handleChartExport = () => {
    const dataToExport = filteredChartData ? chartData.trends : monthlyTrends;
    const headers = filteredChartData
      ? "Period,Total Jobs,Completed Jobs,Pending Jobs,Active Jobs,Overdue Jobs\n"
      : "Month,Total Jobs,Completed Jobs\n";

    const csvRows = filteredChartData
      ? dataToExport.map(
          (row: any) =>
            `${row.month},${row.totalJobs},${row.completedJobs},${
              row.pendingJobs || 0
            },${row.activeJobs || 0},${row.overdueJobs || 0}`
        )
      : dataToExport.map(
          (row: any) => `${row.month},${row.totalJobs},${row.completedJobs}`
        );

    const csvContent =
      "data:text/csv;charset=utf-8," + headers + csvRows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `dashboard_trends_${filteredChartData ? "filtered_" : ""}${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return isDarkMode ? "#34d399" : "#10b981";
      case "scheduled":
      case "pending quotation":
      case "quotation sent":
        return isDarkMode ? "#fbbf24" : "#f59e0b";
      case "pending":
        return isDarkMode ? "#60a5fa" : "#3b82f6";
      case "overdue":
        return isDarkMode ? "#f87171" : "#ef4444";
      case "cancelled":
        return isDarkMode ? "#94a3b8" : "#6b7280";
      default:
        return isDarkMode ? "#94a3b8" : "#6b7280";
    }
  };

  const formatChartSeriesName = (name: string) => {
    switch (name) {
      case "totalJobs":
        return "Total Jobs";
      case "completedJobs":
        return "Completed Jobs";
      case "activeJobs":
        return "Active Jobs";
      case "pendingJobs":
        return "Pending Jobs";
      case "overdueJobs":
        return "Overdue Jobs";
      case "completionTrend":
        return "Completion Trend";
      default:
        return name;
    }
  };

  const COLORS = isDarkMode
    ? [
        "#60a5fa", // Blue
        "#34d399", // Green
        "#fbbf24", // Yellow
        "#f87171", // Red
        "#a78bfa", // Purple
        "#6ee7b7", // Light Green
      ]
    : ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  if (loading) {
    return (
      <div className={styles.superUserDashboard}>
        <div className={styles.loadingContainer}>
          <RiLoaderLine className={styles.loadingSpinner} />
          <p>Loading comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.superUserDashboard}>
        <div className={styles.errorContainer}>
          <RiErrorWarningLine className={styles.errorIcon} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <Button
            variant="primary"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleRefresh}
          >
            <RiRefreshLine />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const {
    overview,
    jobStatusDistribution,
    recentActivity,
      monthlyTrends,
      topTechnicians,
      recentJobs,
  } = dashboardData;

  const invoiceStats =
    invoiceStatsOverride ?? getNormalizedInvoiceStats(dashboardData.invoiceStats);

  const pricingSummary = dashboardData.pricingSummary || {
    totalConfiguredMonthlyRevenue: 0,
    averageAgencyPricing: 0,
    totalConfiguredServiceEntries: 0,
    serviceTypesInUse: 0,
    averageServicePrice: 0,
    topServices: [],
  };
  const paymentStats = dashboardData.paymentStats || {
    totalPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    pendingCount: 0,
    paidCount: 0,
  };

  const topPricingServices = pricingSummary.topServices.slice(0, 4);
  const systemAlerts = systemHealth?.systemAlerts || [];
  const attentionItems = [
    {
      title: "Overdue Jobs",
      value: overview.overdueJobs,
      description: "Jobs already past due and needing follow-up.",
      action: "Open Jobs",
      route: "/jobs",
      tone: "danger",
      icon: <RiAlertLine />,
    },
    ...(TECHNICIAN_PAYMENTS_ENABLED
      ? [
          {
            title: "Pending Technician Payments",
            value: paymentStats.pendingCount,
            description: `${formatCurrency(
              paymentStats.pendingAmount
            )} waiting to be paid out.`,
            action: "Open Payments",
            route: "/invoice-management",
            tone: "warning",
            icon: <RiMoneyDollarCircleLine />,
          },
        ]
      : []),
    {
      title: "Draft Completed Job Invoices",
      value: invoiceStats.completedJob.draftCount,
      description: `${formatCurrency(
        invoiceStats.completedJob.draftAmount
      )} still needs to be sent.`,
      action: "Open Invoices",
      route: "/invoice-management",
      tone: "info",
      icon: <RiEditLine />,
    },
    {
      title: "Rejected Extra Services",
      value: invoiceStats.extraServices.rejectedCount,
      description: `${formatCurrency(
        invoiceStats.extraServices.rejectedAmount
      )} has been rejected.`,
      action: "Review Extras",
      route: "/invoice-management",
      tone: "neutral",
      icon: <RiFileList3Line />,
    },
  ];
  const growthMetrics = [
    {
      label: "New agencies this week",
      value: recentActivity.newAgencies,
      support: `${overview.totalAgencies} total agencies`,
      icon: <RiBuildingLine />,
    },
    {
      label: "Properties added this week",
      value: recentActivity.newProperties,
      support: `${overview.totalProperties} active properties`,
      icon: <RiHomeSmileLine />,
    },
    {
      label: "Technicians added this week",
      value: recentActivity.newTechnicians,
      support: `${overview.totalTechnicians} technicians`,
      icon: <RiToolsLine />,
    },
    {
      label: "Jobs created this week",
      value: recentActivity.newJobs,
      support: `${recentActivity.completedJobsWeek} completed this week`,
      icon: <RiBriefcaseLine />,
    },
  ];

  // Filter recent jobs based on search and status
  const filteredRecentJobs = recentJobs.filter((job) => {
    const matchesSearch =
      job.job_id.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.jobType.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.technicianName.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.propertyAddress.toLowerCase().includes(jobSearchTerm.toLowerCase());

    const matchesStatus =
      jobStatusFilter === "all" ||
      job.status.toLowerCase() === jobStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(recentJobs.map((job) => job.status))];

  // Use filtered data if available, otherwise use original data
  const chartData = filteredChartData
    ? {
        trends: filteredChartData.trends.map((trend: any) => ({
          month: trend.period,
          totalJobs: trend.totalJobs,
          completedJobs: trend.completedJobs,
          pendingJobs: trend.pendingJobs,
          activeJobs: trend.activeJobs,
          overdueJobs: trend.overdueJobs,
        })),
        statusDistribution: filteredChartData.statusDistribution.filter(
          (item: any) => item.count > 0
        ),
      }
    : {
        trends: monthlyTrends,
        statusDistribution: jobStatusDistribution.filter(
          (item: any) => item.count > 0
        ),
      };

  // Get date range options (last 6 months by default)
  const getDateRangeOptions = () => {
    const options = [
      { value: "3", label: "Last 3 Months" },
      { value: "6", label: "Last 6 Months" },
      { value: "12", label: "Last 12 Months" },
      { value: "custom", label: "Custom Range" },
    ];
    return options;
  };

  return (
    <div className={styles.superUserDashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1>Welcome back, {userState?.name?.trim() || "Super User"}!</h1>
            <p>Comprehensive system overview and administration dashboard</p>
            <div className={styles.lastUpdated}>
              <RiInformationLine />
              <span>
                Last updated:{" "}
                {new Date(dashboardData.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RiRefreshLine className={refreshing ? styles.spinning : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className={styles.statsOverview}>
          <div
            className={`${styles.statCard} ${styles.primary} ${styles.clickable}`}
            onClick={() => handleStatCardClick("agencies")}
          >
            <div className={styles.statIcon}>
              <RiBuildingLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalAgencies}</h3>
              <p>Total Agencies</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newAgencies} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.pricing} ${styles.clickable}`}
            onClick={() => handleStatCardClick("agencies")}
          >
            <div className={styles.statIcon}>
              <RiPriceTag3Line />
            </div>
            <div className={styles.statContent}>
              <h3>
                {formatCurrency(pricingSummary.totalConfiguredMonthlyRevenue)}
              </h3>
              <p>Configured Monthly Revenue</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiInformationLine />
                <span>From agency service setup</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.pricingAlt} ${styles.clickable}`}
            onClick={() => handleStatCardClick("agencies")}
          >
            <div className={styles.statIcon}>
              <RiBarChartLine />
            </div>
            <div className={styles.statContent}>
              <h3>{formatCurrency(pricingSummary.averageAgencyPricing)}</h3>
              <p>Avg Agency Pricing</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiBuildingLine />
                <span>{pricingSummary.serviceTypesInUse} service types in use</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.properties} ${styles.clickable}`}
            onClick={() => handleStatCardClick("properties")}
          >
            <div className={styles.statIcon}>
              <RiHomeSmileLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalProperties}</h3>
              <p>Total Properties</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newProperties} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.technicians} ${styles.clickable}`}
            onClick={() => handleStatCardClick("technicians")}
          >
            <div className={styles.statIcon}>
              <RiToolsLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalTechnicians}</h3>
              <p>Total Technicians</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newTechnicians} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.jobs} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiBriefcaseLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalJobs}</h3>
              <p>Total Jobs</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.newJobs} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.active} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiCalendarLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.activeJobs}</h3>
              <p>Active Jobs</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiLoaderLine />
                <span>In progress</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.success} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiCheckLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.completedJobs}</h3>
              <p>Completed Jobs</p>
              <div className={`${styles.statTrend} ${styles.positive}`}>
                <RiTrendingUpLine />
                <span>+{recentActivity.completedJobsWeek} this week</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.warning} ${styles.clickable}`}
            onClick={() => handleStatCardClick("jobs")}
          >
            <div className={styles.statIcon}>
              <RiAlertLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.overdueJobs}</h3>
              <p>Overdue Jobs</p>
              <div className={`${styles.statTrend} ${styles.negative}`}>
                <RiTrendingDownLine />
                <span>Needs attention</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.earnings} ${styles.clickable}`}
            onClick={() => handleStatCardClick("invoices")}
          >
            <div className={styles.statIcon}>
              <RiMoneyDollarCircleLine />
            </div>
            <div className={styles.statContent}>
              <h3>{formatCurrency(invoiceStats.completedJob.totalAmount)}</h3>
              <p>Completed Job Invoiced</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiMoneyDollarCircleLine />
                <span>{invoiceStats.completedJob.totalInvoices} invoices</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.teamMembers} ${styles.clickable}`}
            onClick={() => handleStatCardClick("teamMembers")}
          >
            <div className={styles.statIcon}>
              <RiTeamLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalTeamMembers}</h3>
              <p>Team Members</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiUserLine />
                <span>Admin level access</span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.staff} ${styles.clickable}`}
            onClick={() => handleStatCardClick("properties")}
          >
            <div className={styles.statIcon}>
              <RiHandHeartLine />
            </div>
            <div className={styles.statContent}>
              <h3>{overview.totalPropertyManagers}</h3>
              <p>Property Managers</p>
              <div className={`${styles.statTrend} ${styles.neutral}`}>
                <RiUserLine />
                <span>Active users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.executiveSections}>
        <div className={styles.executivePanel}>
          <div className={styles.executivePanelHeader}>
            <div>
              <h3>Attention Required</h3>
              <p>Work that should be reviewed before the rest of the pipeline.</p>
            </div>
            {systemAlerts.length > 0 ? (
              <span className={styles.executivePanelMeta}>
                {systemAlerts.length} system alert{systemAlerts.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <div className={styles.attentionGrid}>
            {attentionItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className={`${styles.attentionCard} ${styles[item.tone]}`}
                onClick={() => navigate(item.route)}
              >
                <div className={styles.attentionIcon}>{item.icon}</div>
                <div className={styles.attentionContent}>
                  <span className={styles.attentionTitle}>{item.title}</span>
                  <strong>{item.value}</strong>
                  <p>{item.description}</p>
                  <span className={styles.attentionAction}>{item.action}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.executivePanel}>
          <div className={styles.executivePanelHeader}>
            <div>
              <h3>Growth Snapshot</h3>
              <p>What changed across the portfolio this week.</p>
            </div>
          </div>
          <div className={styles.growthGrid}>
            {growthMetrics.map((metric) => (
              <div key={metric.label} className={styles.growthCard}>
                <div className={styles.growthIcon}>{metric.icon}</div>
                <div className={styles.growthContent}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.support}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        {/* Monthly Trends - Full Width on Top */}
        <div className={styles.chartRowFull}>
          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <div className={styles.chartHeader}>
              <h3>Monthly Job Trends</h3>
              <div className={styles.chartActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  className={styles.chartExportBtn}
                  onClick={handleChartExport}
                  title="Export Data"
                  aria-label="Export Data"
                >
                  <RiDownloadLine />
                </Button>
              </div>
            </div>

            {/* Chart Filters */}
            <div className={styles.chartFilters}>
              <div className={styles.filterGroup}>
                <label>Time Range:</label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedTimeRange(value);
                    if (value !== "custom") {
                      const months = parseInt(value);
                      const endDate = new Date();
                      const startDate = new Date();
                      startDate.setMonth(startDate.getMonth() - months);
                      setChartDateRange({
                        startDate: startDate.toISOString().split("T")[0],
                        endDate: endDate.toISOString().split("T")[0],
                      });
                    }
                  }}
                  className={styles.filterSelect}
                >
                  {getDateRangeOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTimeRange === "custom" && (
                <div
                  className={`${styles.filterGroup} ${styles.customDateRange}`}
                >
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={chartDateRange.startDate}
                    onChange={(e) => {
                      setChartDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }));
                    }}
                    className={styles.filterSelect}
                  />
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={chartDateRange.endDate}
                    onChange={(e) => {
                      setChartDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }));
                    }}
                    className={styles.filterSelect}
                  />
                </div>
              )}

              <div className={styles.filterGroup}>
                <label>View:</label>
                <select
                  value={chartViewType}
                  onChange={(e) =>
                    setChartViewType(
                      e.target.value as "monthly" | "weekly" | "daily"
                    )
                  }
                  className={styles.filterSelect}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Status:</label>
                <select
                  value={chartStatusFilter}
                  onChange={(e) => setChartStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="active">Active Jobs Only</option>
                  <option value="overdue">Overdue Only</option>
                </select>
              </div>

              <div className={styles.filterActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.resetFiltersBtn}
                  onClick={() => {
                    setChartDateRange({ startDate: "", endDate: "" });
                    setSelectedTimeRange("6");
                    setChartStatusFilter("all");
                    setChartViewType("monthly");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
            {chartValidationError ? (
              <div className={styles.chartLoading}>
                <p>{chartValidationError}</p>
              </div>
            ) : loadingFilteredData ? (
              <div className={styles.chartLoading}>
                <RiLoaderLine className={styles.loadingSpinner} />
                <p>Loading filtered data...</p>
              </div>
            ) : chartData.trends.length === 0 ? (
              <div className={styles.chartLoading}>
                <p>No trend data is available for the selected filters.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                  data={chartData.trends}
                  onClick={handleChartClick}
                  style={{ cursor: "pointer" }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#f0f0f0"}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                  />
                  <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "white",
                      border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                        : "0 4px 12px rgba(0, 0, 0, 0.1)",
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                    }}
                    formatter={(value, name) => [
                      value,
                      formatChartSeriesName(String(name)),
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalJobs"
                    fill={isDarkMode ? "#60a5fa" : "#3b82f6"}
                    name="Total Jobs"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="completedJobs"
                    fill={isDarkMode ? "#34d399" : "#10b981"}
                    name="Completed Jobs"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                  <Line
                    type="monotone"
                    dataKey="completedJobs"
                    name="completionTrend"
                    stroke={isDarkMode ? "#34d399" : "#059669"}
                    strokeWidth={3}
                    dot={{
                      fill: isDarkMode ? "#34d399" : "#059669",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      stroke: isDarkMode ? "#34d399" : "#059669",
                      strokeWidth: 2,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            {selectedChartData && showChartDetails && (
              <div className={styles.chartDetailsModal}>
                <div className={styles.chartDetailsContent}>
                  <div className={styles.chartDetailsHeader}>
                    <h4>Details for {selectedChartData.month}</h4>
                    <button
                      className={styles.closeModalBtn}
                      onClick={() => setShowChartDetails(false)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  <div className={styles.chartDetailsBody}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Total Jobs:</span>
                      <span className={styles.detailValue}>
                        {selectedChartData.totalJobs}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        Completed Jobs:
                      </span>
                      <span className={styles.detailValue}>
                        {selectedChartData.completedJobs}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        Completion Rate:
                      </span>
                      <span className={styles.detailValue}>
                        {selectedChartData.totalJobs > 0
                          ? `${(
                              (selectedChartData.completedJobs /
                                selectedChartData.totalJobs) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Pending Jobs:</span>
                      <span className={styles.detailValue}>
                        {selectedChartData.pendingJobs ??
                          Math.max(
                            selectedChartData.totalJobs -
                              selectedChartData.completedJobs,
                            0
                          )}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Active Jobs:</span>
                      <span className={styles.detailValue}>
                        {selectedChartData.activeJobs ?? 0}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Overdue Jobs:</span>
                      <span className={styles.detailValue}>
                        {selectedChartData.overdueJobs ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className={styles.chartDetailsFooter}>
                    <button
                      className={styles.viewMonthJobsBtn}
                      onClick={() => {
                        navigate("/jobs");
                        setShowChartDetails(false);
                      }}
                      type="button"
                    >
                      View Jobs for {selectedChartData.month}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row - Status Distribution and Payment Overview */}
        <div className={styles.chartRowSplit}>
          <div className={`${styles.chartCard} ${styles.medium}`}>
            <div className={styles.chartHeader}>
              <h3>Job Status Distribution</h3>
              <RiPieChartLine />
            </div>
            {chartData.statusDistribution.length === 0 ? (
              <div className={styles.chartLoading}>
                <p>No status distribution data is available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {chartData.statusDistribution.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getStatusColor(entry.status)}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "white",
                      border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                        : "0 4px 12px rgba(0, 0, 0, 0.1)",
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                    }}
                    formatter={(value, _name, item: any) => [
                      `${value} jobs (${item?.payload?.percentage || "0.0"}%)`,
                      item?.payload?.status || "Status",
                    ]}
                  />
                  <Legend
                    formatter={(value) => String(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={`${styles.chartCard} ${styles.medium}`}>
            <div className={styles.chartHeader}>
              <h3>Invoice Overview</h3>
              <RiMoneyDollarCircleLine />
            </div>
            <div className={styles.paymentSummary}>
              <div className={styles.paymentSummaryNote}>
                Completed-job invoices and Extra Services invoices are tracked separately.
              </div>
              <div className={styles.invoiceAnalyticsSection}>
                <div className={styles.invoiceAnalyticsHeader}>
                  <div>
                    <h4>Completed Job Invoices</h4>
                    <p>{invoiceStats.completedJob.totalInvoices} invoices</p>
                  </div>
                  <strong>{formatCurrency(invoiceStats.completedJob.totalAmount)}</strong>
                </div>
                <div className={styles.invoiceAnalyticsGrid}>
                  <div className={styles.paymentItem}>
                    <div className={`${styles.paymentIcon} ${styles.pending}`}>
                      <RiEditLine />
                    </div>
                    <div className={styles.paymentDetails}>
                      <h4>{formatCurrency(invoiceStats.completedJob.draftAmount)}</h4>
                      <p>{invoiceStats.completedJob.draftCount} Draft</p>
                    </div>
                  </div>
                  <div className={styles.paymentItem}>
                    <div className={`${styles.paymentIcon} ${styles.pending}`}>
                      <RiTimeLine />
                    </div>
                    <div className={styles.paymentDetails}>
                      <h4>{formatCurrency(invoiceStats.completedJob.sentAmount)}</h4>
                      <p>{invoiceStats.completedJob.sentCount} Sent</p>
                    </div>
                  </div>
                  <div className={styles.paymentItem}>
                    <div className={`${styles.paymentIcon} ${styles.paid}`}>
                      <RiCheckboxCircleLine />
                    </div>
                    <div className={styles.paymentDetails}>
                      <h4>{formatCurrency(invoiceStats.completedJob.paidAmount)}</h4>
                      <p>{invoiceStats.completedJob.paidCount} Paid</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.invoiceAnalyticsSection}>
                <div className={styles.invoiceAnalyticsHeader}>
                  <div>
                    <h4>Extra Services Invoices</h4>
                    <p>{invoiceStats.extraServices.totalInvoices} invoices</p>
                  </div>
                  <strong>{formatCurrency(invoiceStats.extraServices.totalAmount)}</strong>
                </div>
                <div className={styles.invoiceAnalyticsGrid}>
                  <div className={styles.paymentItem}>
                    <div className={`${styles.paymentIcon} ${styles.pending}`}>
                      <RiTimeLine />
                    </div>
                    <div className={styles.paymentDetails}>
                      <h4>{formatCurrency(invoiceStats.extraServices.pendingAmount)}</h4>
                      <p>{invoiceStats.extraServices.pendingCount} Pending</p>
                    </div>
                  </div>
                  <div className={styles.paymentItem}>
                    <div className={`${styles.paymentIcon} ${styles.info}`}>
                      <RiCheckLine />
                    </div>
                    <div className={styles.paymentDetails}>
                      <h4>{formatCurrency(invoiceStats.extraServices.acceptedAmount)}</h4>
                      <p>{invoiceStats.extraServices.acceptedCount} Accepted</p>
                    </div>
                  </div>
                  <div className={styles.paymentItem}>
                    <div className={`${styles.paymentIcon} ${styles.warning}`}>
                      <RiFileList3Line />
                    </div>
                    <div className={styles.paymentDetails}>
                      <h4>{formatCurrency(invoiceStats.extraServices.rejectedAmount)}</h4>
                      <p>{invoiceStats.extraServices.rejectedCount} Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.paymentActions}>
                <Button
                  variant="primary"
                  fullWidth
                  className={styles.viewAllPaymentsBtn}
                  onClick={() => navigate("/invoice-management")}
                >
                  View All Invoices
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.pricingSection}>
        <div className={styles.pricingHeader}>
          <div>
            <h3>Agency Pricing Summary</h3>
            <p>Configured pricing totals from agency service setup, not collected payments.</p>
          </div>
          <Button
            variant="outline"
            className={styles.pricingCta}
            onClick={() => navigate("/reports")}
          >
            <RiEyeLine />
            View Detailed Reports
          </Button>
        </div>

        <div className={styles.pricingStats}>
          <div className={styles.pricingStatCard}>
            <span className={styles.pricingStatLabel}>Configured service entries</span>
            <strong>{pricingSummary.totalConfiguredServiceEntries}</strong>
          </div>
          <div className={styles.pricingStatCard}>
            <span className={styles.pricingStatLabel}>Service types in use</span>
            <strong>{pricingSummary.serviceTypesInUse}</strong>
          </div>
          <div className={styles.pricingStatCard}>
            <span className={styles.pricingStatLabel}>Average service price</span>
            <strong>{formatCurrency(pricingSummary.averageServicePrice)}</strong>
          </div>
        </div>

        {topPricingServices.length > 0 ? (
          <div className={styles.pricingGrid}>
            {topPricingServices.map((service) => (
              <div key={service.serviceType} className={styles.pricingCard}>
                <div className={styles.pricingCardHeader}>
                  <h4>{service.serviceType}</h4>
                  <span>{service.percentageOfAgencies}% of agencies</span>
                </div>
                <div className={styles.pricingMetrics}>
                  <div className={styles.pricingMetric}>
                    <span>Configured revenue</span>
                    <strong>{formatCurrency(service.totalConfiguredRevenue)}</strong>
                  </div>
                  <div className={styles.pricingMetric}>
                    <span>Avg price</span>
                    <strong>{formatCurrency(service.averagePrice)}</strong>
                  </div>
                  <div className={styles.pricingMetric}>
                    <span>Agencies using it</span>
                    <strong>{service.agenciesUsingService}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.pricingEmptyState}>
            <RiInformationLine />
            <p>
              No agency service pricing is configured yet. Add pricing to agencies to populate this section and improve invoice automation coverage.
            </p>
          </div>
        )}
      </div>

      {/* Top Technicians and Recent Jobs */}
      <div className={styles.dashboardContent}>
        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>System Health</h3>
              <RiShieldLine />
            </div>
            <div className={styles.healthSummary}>
              <div className={styles.healthStatsRow}>
                <div className={styles.healthMetric}>
                  <span>Status</span>
                  <strong>{systemHealth?.serverStatus || "Unknown"}</strong>
                </div>
                <div className={styles.healthMetric}>
                  <span>Uptime</span>
                  <strong>{systemHealth?.uptime || "N/A"}</strong>
                </div>
                <div className={styles.healthMetric}>
                  <span>Active Users</span>
                  <strong>{systemHealth?.totalActiveUsers || 0}</strong>
                </div>
                <div className={styles.healthMetric}>
                  <span>Completion Rate</span>
                  <strong>
                    {typeof systemHealth?.jobsCompletionRate === "number"
                      ? `${systemHealth.jobsCompletionRate.toFixed(1)}%`
                      : "0.0%"}
                  </strong>
                </div>
              </div>
              <div className={styles.systemAlertsList}>
                {systemAlerts.length > 0 ? (
                  systemAlerts.map((alert) => (
                    <div key={`${alert.type}-${alert.message}`} className={styles.systemAlertItem}>
                      <span className={`${styles.systemAlertBadge} ${styles[alert.type]}`}>
                        {alert.type}
                      </span>
                      <p>{alert.message}</p>
                    </div>
                  ))
                ) : (
                  <div className={styles.systemAlertEmpty}>
                    <RiCheckLine />
                    <p>No current system alerts. Core operations look healthy.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>Top Performing Technicians</h3>
              <RiUserStarLine />
            </div>
            <div className={styles.technicianList}>
              {topTechnicians.length === 0 ? (
                <p>No data available</p>
              ) : (
                topTechnicians.map((tech, index) => (
                  <div key={index} className={styles.technicianItem}>
                    <div className={styles.rank}>#{index + 1}</div>
                    <div className={styles.techInfo}>
                      <span className={styles.name}>{tech.name}</span>
                      <span className={styles.jobs}>
                        {tech.completedJobs} jobs completed
                      </span>
                    </div>
                    <div className={styles.completionBadge}>
                      <RiCheckLine />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>Recent Jobs</h3>
              <RiBriefcaseLine />
            </div>
            <div className={styles.jobsFilterSection}>
              <div className={styles.jobSearch}>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  className={styles.jobSearchInput}
                />
              </div>
              <div className={styles.jobStatusFilter}>
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className={styles.statusFilterSelect}
                >
                  <option value="all">All Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status.toLowerCase()}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.recentJobs}>
              {filteredRecentJobs.length === 0 ? (
                <div className={styles.noJobsFound}>
                  <p>No jobs found matching your criteria.</p>
                </div>
              ) : (
                filteredRecentJobs.slice(0, 8).map((job) => {
                  console.log(job, "job...");
                  return (
                    <div
                      key={job.id}
                      className={`${styles.jobItem} ${styles.clickable}`}
                      onClick={() => handleJobClick(job.id)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleJobClick(job.id);
                        }
                      }}
                    >
                      <div className={styles.jobInfo}>
                        <div className={styles.jobHeader}>
                          <span className={styles.jobId}>#{job.job_id}</span>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[job.status.toLowerCase().replace(" ", "-")]
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className={styles.jobDetails}>
                          <span className={styles.jobType}>{job.jobType}</span>
                          <span className={styles.technician}>
                            {job.technicianName}
                          </span>
                          {
                            <span className={styles.address}>
                              {job.propertyAddress}
                            </span>
                          }
                        </div>
                      </div>
                      <div className={styles.jobDate}>
                        <RiTimeLine />
                        <span>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              {filteredRecentJobs.length > 8 && (
                <div className={styles.viewMoreJobs}>
                  <Button
                    variant="outline"
                    className={styles.viewMoreBtn}
                    onClick={() => navigate("/jobs")}
                  >
                    View All Jobs ({filteredRecentJobs.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <div className={styles.quickActionsHeader}>
            <h3 className={styles.title}>Quick Actions</h3>
            <p className={styles.subtitle}>
              Navigate to frequently used sections
            </p>
          </div>
          <div className={styles.actionsGrid}>
            <button
              className={`${styles.actionCard} ${styles.agencies}`}
              onClick={() => handleQuickAction("agencies")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiBuildingLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Agencies</h4>
                <p className={styles.cardDescription}>
                  Manage and monitor agencies
                </p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.properties}`}
              onClick={() => handleQuickAction("properties")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiHomeSmileLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Properties</h4>
                <p className={styles.cardDescription}>View property listings</p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.technicians}`}
              onClick={() => handleQuickAction("technician")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiToolsLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Technicians</h4>
                <p className={styles.cardDescription}>
                  Manage service providers
                </p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button
              className={`${styles.actionCard} ${styles.team}`}
              onClick={() => handleQuickAction("teamMembers")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiTeamLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Team</h4>
                <p className={styles.cardDescription}>Manage team members</p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            {TECHNICIAN_PAYMENTS_ENABLED && (
              <button
                className={`${styles.actionCard} ${styles.payments}`}
                onClick={() => handleQuickAction("technicianPayments")}
                type="button"
              >
                <div className={styles.iconWrapper}>
                  <RiMoneyDollarCircleLine className={styles.icon} />
                </div>
                <div className={styles.content}>
                  <h4 className={styles.cardTitle}>Payments</h4>
                  <p className={styles.cardDescription}>
                    Technician payment tracking
                  </p>
                </div>
                <div className={styles.arrow}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 15L12.5 10L7.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            )}
            <button
              className={`${styles.actionCard} ${styles.reports}`}
              onClick={() => handleQuickAction("reports")}
              type="button"
            >
              <div className={styles.iconWrapper}>
                <RiBarChartLine className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h4 className={styles.cardTitle}>Reports</h4>
                <p className={styles.cardDescription}>
                  View analytics & insights
                </p>
              </div>
              <div className={styles.arrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperUserDashboard;
