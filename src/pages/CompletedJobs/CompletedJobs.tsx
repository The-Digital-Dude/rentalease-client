import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiSearchLine,
  RiRefreshLine,
  RiEyeLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiTimeLine,
  RiCheckLine,
  RiStarLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiAwardLine,
  RiMailSendLine,
  RiFileTextLine,
  RiArrowRightSLine,
  RiEditLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import { useAppSelector } from "../../store";
import { agencyService } from "../../services/agencyService";
import Modal from "../../components/Modal";
import Button from "../../components/Button/Button";
import invoiceService, { type Invoice } from "../../services/invoiceService";
import emailService from "../../services/emailService";
import ReactQuill from "react-quill";
import CompletedJobInvoicePreview from "../../components/CompletedJobInvoicePreview/CompletedJobInvoicePreview";
import {
  createCompletedJobInvoicePDF,
  generateCompletedJobInvoicePDF,
} from "../../utils/completedJobInvoicePdfGenerator";
import "react-quill/dist/quill.snow.css";
import "./CompletedJobs.scss";

// Types for job data
interface CompletedJob {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  priority: string;
  description?: string;
  dueDate: string;
  assignedDate?: string;
  completedAt: string;
  estimatedDuration?: string;
  actualDuration?: string;
  completionTime: number; // in hours
  rating?: number;
  feedback?: string;
  property: {
    _id: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
    propertyType: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  agency?: {
    _id: string;
    name: string;
  };
  reportFile?: string | null;
  hasInvoice?: boolean;
  invoice?: string | { id?: string; invoiceNumber?: string; totalCost?: number; status?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

const createManualInvoiceDraft = (job: CompletedJob): Invoice => ({
  id: "",
  invoiceNumber: "Draft",
  jobId: job.id,
  technicianId: "",
  agencyId: "",
  description: `${job.jobType} for completed job ${job.job_id}`,
  items: [
    {
      id: "manual-item-1",
      name: job.jobType,
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ],
  subtotal: 0,
  tax: 0,
  totalCost: 0,
  status: "Draft",
  notes: "",
  createdAt: new Date().toISOString(),
});

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface EmailComposerState {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  bodyHtml: string;
}

const buildCompletedJobReviewData = (job: CompletedJob) => ({
  propertyAddress: job.property.address.fullAddress,
  jobType: job.jobType,
  jobNumber: job.job_id,
  agencyName: job.agency?.name || "",
  reportFile: job.reportFile || null,
  hasReport: Boolean(job.reportFile),
  recipients: {
    to: [],
    cc: [],
    bcc: [],
  },
});

const CompletedJobs = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user);
  const isPropertyManager = user.userType === "property_manager";
  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterRating, setFilterRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("completedAt");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CompletedJob | null>(null);
  const [invoiceDraft, setInvoiceDraft] = useState<Invoice | null>(null);
  const [invoiceActionLoading, setInvoiceActionLoading] = useState(false);
  const [manualInvoiceMode, setManualInvoiceMode] = useState(false);
  const [reviewStep, setReviewStep] = useState<"review" | "compose">("review");
  const [invoiceEditorOpen, setInvoiceEditorOpen] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [emailComposer, setEmailComposer] = useState<EmailComposerState>({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    bodyHtml: "",
  });
  const [emailValidationError, setEmailValidationError] = useState<string | null>(
    null
  );
  const [invoiceWorkflowNotice, setInvoiceWorkflowNotice] = useState<string | null>(
    null
  );
  const [reviewData, setReviewData] = useState<
    NonNullable<
      Awaited<ReturnType<typeof invoiceService.getInvoiceByJobId>>["data"]["reviewData"]
    > | null
  >(null);

  // Safe date formatter to avoid invalid date
  const formatDateSafely = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
  };

  // Refs for debouncing and latest search value
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestSearchRef = useRef<string>("");

  // Normalize completed timestamp from various possible fields
  const getCompletedTimestamp = (job: any): string | undefined => {
    return (
      job?.completedAt ||
      job?.completionDate ||
      job?.jobCompletedAt ||
      job?.completed_at ||
      job?.completionDetails?.completedAt ||
      undefined
    );
  };

  const sortCompletedJobs = (jobList: CompletedJob[]) =>
    [...jobList].sort((left, right) => {
      const leftTime = left.completedAt ? new Date(left.completedAt).getTime() : 0;
      const rightTime = right.completedAt
        ? new Date(right.completedAt).getTime()
        : 0;

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      const leftUpdatedTime = left.updatedAt
        ? new Date(left.updatedAt).getTime()
        : 0;
      const rightUpdatedTime = right.updatedAt
        ? new Date(right.updatedAt).getTime()
        : 0;

      if (rightUpdatedTime !== leftUpdatedTime) {
        return rightUpdatedTime - leftUpdatedTime;
      }

      const leftCreatedTime = left.createdAt
        ? new Date(left.createdAt).getTime()
        : 0;
      const rightCreatedTime = right.createdAt
        ? new Date(right.createdAt).getTime()
        : 0;

      if (rightCreatedTime !== leftCreatedTime) {
        return rightCreatedTime - leftCreatedTime;
      }

      return right.job_id.localeCompare(left.job_id, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

  // Fetch completed jobs data
  const fetchCompletedJobs = useCallback(
    async (
      page: number = 1,
      resetPagination: boolean = false,
      searchValue?: string
    ) => {
      try {
        if (resetPagination) {
          setRefreshing(true);
        } else {
          setLoading(page === 1);
        }
        setError(null);

        // Build query parameters based on user role
        const params = new URLSearchParams({
          status: "Completed",
          page: page.toString(),
          limit: pagination.itemsPerPage.toString(),
          sortBy,
          sortOrder: sortBy === "completedAt" ? "desc" : "asc",
        });

        const searchToUse =
          searchValue !== undefined ? searchValue : latestSearchRef.current;
        if (searchToUse && searchToUse.trim()) {
          params.append("search", searchToUse.trim());
        }

        if (filterPriority) {
          params.append("priority", filterPriority);
        }

        if (filterRating) {
          params.append("rating", filterRating);
        }

        // Role-based filtering
        if (user.userType === "agency") {
          // Agency users only see their own jobs
          params.append("agencyId", user.id || "");
        }
        // Super users and team members see all jobs (no additional filter needed)

        const result = await agencyService.getJobs(params.toString());

        if (result.status === "success") {
          const completedJobs =
            result.data.jobs?.map((job: any) => {
              const completedTs = getCompletedTimestamp(job);
              return {
                ...job,
                completedAt: completedTs,
                completionTime: calculateCompletionTime(
                  job.assignedDate,
                  completedTs
                ),
              };
            }) || [];

          setJobs(sortCompletedJobs(completedJobs));
          setPagination({
            currentPage: result.data.pagination?.currentPage || 1,
            totalPages: result.data.pagination?.totalPages || 1,
            totalItems: result.data.pagination?.totalItems || 0,
            itemsPerPage: result.data.pagination?.itemsPerPage || 12,
          });
        } else {
          throw new Error(result.message || "Failed to fetch completed jobs");
        }
      } catch (error: any) {
        console.error("Failed to fetch completed jobs:", error);
        setError(error.message || "Failed to load completed jobs");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      pagination.itemsPerPage,
      sortBy,
      filterPriority,
      filterRating,
      user.userType,
      user.id,
    ]
  );

  // Debounced search like Scheduled Jobs
  const debouncedSearch = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        fetchCompletedJobs(1, true, value);
      }, 1000);
    },
    [fetchCompletedJobs]
  );

  const calculateCompletionTime = (
    assignedDate?: string,
    completedAt?: string
  ): number => {
    if (!assignedDate || !completedAt) return 0;
    const assigned = new Date(assignedDate);
    const completed = new Date(completedAt);
    const diffTime = completed.getTime() - assigned.getTime();
    const diffHours = Math.round(diffTime / (1000 * 60 * 60));
    return Math.max(0, diffHours);
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, [user.id, user.userType, fetchCompletedJobs]);

  // Trigger fetch when filters/sort change
  useEffect(() => {
    fetchCompletedJobs(1, true);
  }, [filterPriority, filterRating, sortBy, fetchCompletedJobs]);

  const handleRefresh = () => {
    setSearchTerm("");
    setFilterPriority("");
    setFilterRating("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    latestSearchRef.current = "";
    fetchCompletedJobs(1, true, "");
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    latestSearchRef.current = value;
    debouncedSearch(value);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      fetchCompletedJobs(1, true, searchTerm);
    }
  };

  const handleSearchBlur = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    fetchCompletedJobs(1, true, latestSearchRef.current);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "priority") {
      setFilterPriority(value);
    } else if (filterType === "rating") {
      setFilterRating(value);
    }
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    fetchCompletedJobs(page);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount || 0);

  const resetInvoiceWorkflow = () => {
    setInvoiceModalOpen(false);
    setSelectedJob(null);
    setInvoiceDraft(null);
    setManualInvoiceMode(false);
    setReviewStep("review");
    setInvoiceEditorOpen(false);
    setInvoicePreviewOpen(false);
    setReviewData(null);
    setEmailValidationError(null);
    setInvoiceWorkflowNotice(null);
    setEmailComposer({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      bodyHtml: "",
    });
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceDraft || !selectedJob) {
      return;
    }

    try {
      await generateCompletedJobInvoicePDF({
        invoice: invoiceDraft,
        jobNumber: reviewData?.jobNumber || selectedJob.job_id,
        jobType: reviewData?.jobType || selectedJob.jobType,
        propertyAddress:
          reviewData?.propertyAddress || selectedJob.property.address.fullAddress,
        agencyName: reviewData?.agencyName || selectedJob.agency?.name || "",
        hasReport: reviewData?.hasReport || false,
        reportSource: reviewData?.reportSource || null,
      });
    } catch (error) {
      console.error("Failed to download invoice PDF:", error);
      toast.error("Failed to download invoice PDF");
    }
  };

  const buildDefaultEmailBody = (
    job: CompletedJob,
    invoice: Invoice,
    reportFile: string | null,
    reportSource?: "job" | "latestInspectionReport" | "generated" | null
  ) => `
    <p>Hello,</p>
    <p>Please review the tax invoice and completed job documents for <strong>${job.property.address.fullAddress}</strong>.</p>
    <p>The draft invoice <strong>${invoice.invoiceNumber}</strong> for <strong>${formatCurrency(
      invoice.totalCost
    )}</strong> is ready.</p>
    <p>${
      reportFile
        ? reportSource === "latestInspectionReport"
          ? `The inspection report has been recovered from the latest inspection report and is available here: <a href="${reportFile}">Open report</a>.`
          : `The inspection report is available here: <a href="${reportFile}">Open report</a>.`
        : "The inspection report is currently missing."
    }</p>
    <p>Regards,<br />Rentalease</p>
  `;

  const initializeEmailComposer = (
    job: CompletedJob,
    invoice: Invoice,
    nextReviewData:
      | NonNullable<
          Awaited<
            ReturnType<typeof invoiceService.getInvoiceByJobId>
          >["data"]["reviewData"]
        >
      | null
  ) => {
    const to = nextReviewData?.recipients?.to || [];
    const cc = nextReviewData?.recipients?.cc || [];
    const bcc = nextReviewData?.recipients?.bcc || [];
    const propertyLabel =
      nextReviewData?.propertyAddress || job.property.address.fullAddress;
    const jobNumber = nextReviewData?.jobNumber || job.job_id;

      setEmailComposer({
        to: emailService.formatEmailAddresses(to),
        cc: emailService.formatEmailAddresses(cc),
        bcc: emailService.formatEmailAddresses(bcc),
      subject: `Tax Invoice - ${job.jobType} - ${propertyLabel} (${jobNumber})`,
      bodyHtml: buildDefaultEmailBody(
        job,
        invoice,
        nextReviewData?.reportFile || job.reportFile || null,
        nextReviewData?.reportSource || null
      ),
    });
    setEmailValidationError(null);
  };

  const loadInvoiceReview = async (job: CompletedJob) => {
    const response = await invoiceService.getInvoiceByJobId(job.id);
    const previousReviewData = reviewData;
    const fallbackReportFile =
      response.data.reviewData?.reportFile ||
      previousReviewData?.reportFile ||
      job.reportFile ||
      null;
    const mergedReviewData = {
      propertyAddress:
        response.data.reviewData?.propertyAddress ||
        previousReviewData?.propertyAddress ||
        job.property.address.fullAddress,
      jobType:
        response.data.reviewData?.jobType ||
        previousReviewData?.jobType ||
        job.jobType,
      jobNumber:
        response.data.reviewData?.jobNumber ||
        previousReviewData?.jobNumber ||
        job.job_id,
      agencyName:
        response.data.reviewData?.agencyName ||
        previousReviewData?.agencyName ||
        job.agency?.name ||
        "",
      attentionName:
        response.data.reviewData?.attentionName ||
        previousReviewData?.attentionName ||
        job.agency?.name ||
        "",
      reportFile: fallbackReportFile,
      hasReport: Boolean(fallbackReportFile),
      reportSource:
        response.data.reviewData?.reportSource ||
        previousReviewData?.reportSource ||
        (job.reportFile ? "job" : null),
      recipients: {
        to:
          response.data.reviewData?.recipients?.to ||
          previousReviewData?.recipients?.to ||
          [],
        cc:
          response.data.reviewData?.recipients?.cc ||
          previousReviewData?.recipients?.cc ||
          [],
        bcc:
          response.data.reviewData?.recipients?.bcc ||
          previousReviewData?.recipients?.bcc ||
          [],
      },
    };
    setSelectedJob(job);
    setInvoiceDraft(response.data.invoice);
    setReviewData(mergedReviewData);
    setManualInvoiceMode(false);
    initializeEmailComposer(job, response.data.invoice, mergedReviewData);
    return response;
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }

    return fallback;
  };

  const jobHasInvoiceAccess = (job: CompletedJob) => {
    if (job.hasInvoice) return true;

    if (typeof job.invoice === "string") {
      return Boolean(job.invoice);
    }

    if (job.invoice && typeof job.invoice === "object") {
      return Boolean(job.invoice.id || job.invoice.invoiceNumber);
    }

    return false;
  };

  const handleOpenInvoice = async (job: CompletedJob) => {
    try {
      setInvoiceActionLoading(true);
      setInvoiceWorkflowNotice(null);
      await loadInvoiceReview(job);
      setReviewStep("review");
      setInvoiceEditorOpen(false);
      setInvoiceModalOpen(true);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to load invoice");
      const missingInvoice =
        message.toLowerCase().includes("failed to fetch invoice for job") ||
        message.toLowerCase().includes("no invoice");

      if (!isPropertyManager && missingInvoice) {
        handleOpenManualInvoice(
          job,
          "No linked invoice could be loaded for this completed job. You can create one manually and send it to custom recipients."
        );
      }
      toast.error(message);
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const updateInvoiceItem = (
    itemIndex: number,
    field: "name" | "quantity" | "rate",
    value: string
  ) => {
    if (!invoiceDraft) return;
    const nextItems = invoiceDraft.items.map((item, index) => {
      if (index !== itemIndex) return item;
      const updated = {
        ...item,
        [field]: field === "name" ? value : Number(value),
      };
      updated.amount = Number(updated.quantity) * Number(updated.rate);
      return updated;
    });
    const subtotal = nextItems.reduce((sum, item) => sum + item.amount, 0);
    setInvoiceDraft({
      ...invoiceDraft,
      items: nextItems,
      subtotal,
      totalCost: subtotal + Number(invoiceDraft.tax || 0),
    });
  };

  const handleSaveInvoice = async () => {
    if (!invoiceDraft || !selectedJob) return;
    try {
      setInvoiceActionLoading(true);
      const payload = {
        description: invoiceDraft.description,
        items: invoiceDraft.items.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
        tax: Number(invoiceDraft.tax || 0),
        notes: invoiceDraft.notes || "",
      };
      const response = manualInvoiceMode
        ? await invoiceService.createInvoice({
            jobId: selectedJob.id,
            ...payload,
          })
        : await invoiceService.updateInvoice(invoiceDraft.id, payload);
      setInvoiceDraft(response.data.invoice);
      await loadInvoiceReview(selectedJob);
      setInvoiceEditorOpen(false);
      setReviewStep("review");
      toast.success(
        manualInvoiceMode ? "Draft invoice created" : "Invoice updated"
      );
      fetchCompletedJobs(pagination.currentPage, true);
    } catch (error: any) {
      toast.error(
        error.message ||
          (manualInvoiceMode
            ? "Failed to create invoice"
            : "Failed to update invoice")
      );
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const handleSendDocuments = async () => {
    if (!invoiceDraft || !selectedJob) return;

    const toRecipients = emailService.parseEmailAddresses(emailComposer.to);
    const ccRecipients = emailService.parseEmailAddresses(emailComposer.cc);
    const bccRecipients = emailService.parseEmailAddresses(emailComposer.bcc);

    if (!toRecipients.length) {
      setEmailValidationError("At least one valid To recipient is required.");
      return;
    }

    const invalidRecipient = [...toRecipients, ...ccRecipients, ...bccRecipients].find(
      (recipient) => !emailService.isValidEmail(recipient.email)
    );
    if (invalidRecipient) {
      setEmailValidationError(`Invalid email address: ${invalidRecipient.email}`);
      return;
    }

    if (!emailComposer.subject.trim()) {
      setEmailValidationError("Email subject is required.");
      return;
    }

    if (!emailComposer.bodyHtml.trim()) {
      setEmailValidationError("Email body is required.");
      return;
    }

    if (!reviewData?.hasReport) {
      setEmailValidationError(
        "Inspection report is required before sending completed job documents."
      );
      return;
    }

    try {
      setInvoiceActionLoading(true);
      setEmailValidationError(null);
      const { blob, fileName } = await createCompletedJobInvoicePDF({
        invoice: invoiceDraft,
        jobNumber: reviewData?.jobNumber || selectedJob.job_id,
        jobType: reviewData?.jobType || selectedJob.jobType,
        propertyAddress:
          reviewData?.propertyAddress ||
          selectedJob.property.address.fullAddress,
        agencyName: reviewData?.agencyName || selectedJob.agency?.name,
        hasReport: Boolean(reviewData?.hasReport),
        reportSource: reviewData?.reportSource || null,
      });
      const attachmentFile = new File([blob], fileName, {
        type: "application/pdf",
      });
      const response = await invoiceService.sendInvoice(invoiceDraft.id, {
        to: toRecipients,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject: emailComposer.subject.trim(),
        bodyHtml: emailComposer.bodyHtml,
        bodyText: emailService.stripHtml(emailComposer.bodyHtml),
        attachments: [attachmentFile],
      });
      setInvoiceDraft(response.data.invoice);
      toast.success("Documents sent");
      fetchCompletedJobs(pagination.currentPage, true);
      await loadInvoiceReview(selectedJob);
    } catch (error: any) {
      if (
        error?.details?.currentStatus &&
        ["Sent", "Paid"].includes(error.details.currentStatus)
      ) {
        const currentStatus = error.details.currentStatus;
        if (error?.data?.invoice) {
          setInvoiceDraft(error.data.invoice);
        }
        toast.success(
          currentStatus === "Sent"
            ? "Documents were already sent."
            : "Invoice is already marked as paid."
        );
        setEmailValidationError(null);
        fetchCompletedJobs(pagination.currentPage, true);
        await loadInvoiceReview(selectedJob);
        return;
      }

      const message = error.message || "Failed to send documents";
      setEmailValidationError(message);
      toast.error(message);
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const handleGenerateInvoice = async (job: CompletedJob) => {
    try {
      setInvoiceActionLoading(true);
      setInvoiceWorkflowNotice(null);
      await invoiceService.generateDraftForJob(job.id);
      await loadInvoiceReview(job);
      setReviewStep("review");
      setInvoiceEditorOpen(false);
      setInvoiceModalOpen(true);
      toast.success("Draft invoice generated");
      fetchCompletedJobs(pagination.currentPage, true);
    } catch (error: any) {
      const message = getErrorMessage(
        error,
        "Failed to generate draft invoice"
      );
      handleOpenManualInvoice(
        job,
        `${
          message.endsWith(".") ? message.slice(0, -1) : message
        }. You can still assign pricing manually and send the invoice to custom recipients.`
      );
      toast.error(message);
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const handleOpenManualInvoice = (job: CompletedJob, notice?: string) => {
    const nextDraft = createManualInvoiceDraft(job);
    const nextReviewData = buildCompletedJobReviewData(job);
    setSelectedJob(job);
    setInvoiceDraft(nextDraft);
    setManualInvoiceMode(true);
    setReviewData(nextReviewData);
    setInvoiceWorkflowNotice(notice || null);
    initializeEmailComposer(job, nextDraft, nextReviewData);
    setReviewStep("review");
    setInvoiceEditorOpen(true);
    setInvoiceModalOpen(true);
  };

  const getStatusColor = () => {
    return "success"; // All jobs are completed
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  const getCompletionBadge = (
    completionTime: number,
    estimatedDuration?: string
  ) => {
    if (!estimatedDuration) return "completed";

    const estimated = parseFloat(estimatedDuration) || 0;
    if (completionTime <= estimated * 0.8) return "fast";
    if (completionTime <= estimated * 1.2) return "on-time";
    return "delayed";
  };

  const renderRatingStars = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <RiStarLine
            key={star}
            className={star <= rating ? "filled" : "empty"}
          />
        ))}
        <span>{rating}/5</span>
      </div>
    );
  };

  const renderJobCard = (job: CompletedJob) => (
    <div key={job.id} className="job-card completed">
      <div className="job-header">
        <div className="job-type">
          <RiBriefcaseLine />
          <span>{job.jobType}</span>
          <span className="job-id">#{job.job_id}</span>
        </div>
        <div className="job-status">
          <span className={`status-badge ${getStatusColor(job.status)}`}>
            <RiCheckLine />
            Completed
          </span>
          <div
            className={`completion-badge ${getCompletionBadge(
              job.completionTime,
              job.estimatedDuration
            )}`}
          >
            {getCompletionBadge(job.completionTime, job.estimatedDuration) ===
              "fast" && (
              <>
                <RiAwardLine />
                <span>Fast Completion</span>
              </>
            )}
            {getCompletionBadge(job.completionTime, job.estimatedDuration) ===
              "on-time" && (
              <>
                <RiCheckLine />
                <span>On Time</span>
              </>
            )}
            {getCompletionBadge(job.completionTime, job.estimatedDuration) ===
              "delayed" && (
              <>
                <RiTimeLine />
                <span>Delayed</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="job-details">
        <div className="job-property">
          <RiMapPinLine />
          <span>{job.property.address.fullAddress}</span>
        </div>

        {job.description && (
          <div className="job-description">
            <p>{job.description}</p>
          </div>
        )}

        <div className="job-meta">
          <div className="job-priority">
            <span
              className={`priority-badge ${getPriorityColor(job.priority)}`}
            >
              {job.priority} Priority
            </span>
          </div>
          <div className="job-duration">
            <RiTimeLine />
            <span>
              {job.actualDuration || `${job.completionTime}h`}
              {job.estimatedDuration && ` (est. ${job.estimatedDuration})`}
            </span>
          </div>
        </div>

        <div className="job-dates">
          <div className="completion-date">
            <RiCalendarLine />
            <span>Completed: {formatDateSafely(job.completedAt)}</span>
          </div>
          <div className="due-date">
            <RiCalendarLine />
            <span>
              Was due: {formatDateSafely(job.dueDate)}
            </span>
          </div>
        </div>

        {job.assignedTo && (
          <div className="job-assignee">
            <RiUserLine />
            <span>Completed by: {job.assignedTo.name}</span>
          </div>
        )}

        {user.userType !== "agency" && job.agency && (
          <div className="job-agency">
            <RiBriefcaseLine />
            <span>Agency: {job.agency.name}</span>
          </div>
        )}

        {job.rating && (
          <div className="job-rating">
            {renderRatingStars(job.rating)}
            {job.feedback && (
              <div className="job-feedback">
                <p>"{job.feedback}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="job-actions">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RiEyeLine />}
          onClick={() => handleViewJob(job.id)}
        >
          View Details
        </Button>
        {jobHasInvoiceAccess(job) && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RiInformationLine />}
          onClick={() => handleOpenInvoice(job)}
          disabled={invoiceActionLoading}
        >
            {isPropertyManager ? "View Invoice" : "Invoice & Send"}
          </Button>
        )}
        {!isPropertyManager && !jobHasInvoiceAccess(job) && (
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RiInformationLine />}
              onClick={() => handleGenerateInvoice(job)}
              disabled={invoiceActionLoading}
            >
              Generate Draft
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RiInformationLine />}
              onClick={() => handleOpenManualInvoice(job)}
              disabled={invoiceActionLoading}
            >
              Manual Invoice
            </Button>
          </>
        )}
        {job.reportFile && (
          <Button
            href={job.reportFile}
            variant="secondary"
            size="sm"
            leftIcon={<RiDownloadLine />}
            target="_blank"
            rel="noreferrer"
          >
            View Report
          </Button>
        )}
      </div>
      {!isPropertyManager && !jobHasInvoiceAccess(job) && (
        <div className="job-meta">
          <span className="meta-item">
            <RiInformationLine />
            No invoice is linked to this completed job yet. Generate a draft or
            create one manually, then send it to agency contacts or custom
            recipients from here.
          </span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="completed-jobs">
        <div className="loading-container">
          <RiLoaderLine className="loading-spinner" />
          <p>Loading completed jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="completed-jobs">
        <div className="error-container">
          <RiErrorWarningLine className="error-icon" />
          <h3>Error Loading Completed Jobs</h3>
          <p>{error}</p>
          <Button
            variant="primary"
            leftIcon={<RiRefreshLine />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const averageRating =
    jobs.length > 0
      ? jobs
          .filter((j) => j.rating)
          .reduce((sum, j) => sum + (j.rating || 0), 0) /
        jobs.filter((j) => j.rating).length
      : 0;

  return (
    <div className="completed-jobs">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <RiCheckLine />
            Completed Jobs
          </h1>
          <p>
            {user.userType === "agency"
              ? "Successfully completed jobs from your agency"
              : user.userType === "property_manager"
                ? "Completed jobs for properties currently assigned to you"
                : "All completed jobs across the system"}
          </p>
          <div className="header-stats">
            <span className="stat">
              <strong>{pagination.totalItems}</strong> completed jobs
            </span>
            {averageRating > 0 && (
              <span className="stat">
                <strong>{averageRating.toFixed(1)}</strong> avg rating
              </span>
            )}
            <span className="stat">
              <strong>
                {
                  jobs.filter(
                    (j) =>
                      getCompletionBadge(
                        j.completionTime,
                        j.estimatedDuration
                      ) === "fast"
                  ).length
                }
              </strong>{" "}
              fast completions
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            leftIcon={<RiRefreshLine className={refreshing ? "spinning" : ""} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div
        className={`filters-section ${
          searchTerm || filterPriority || filterRating
            ? "has-active-filters"
            : ""
        }`}
      >
        <div className="search-form">
          <div className="search-input">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search completed jobs by job ID, property address, job type, or description..."
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleSearchBlur}
            />
          </div>
        </div>

        <div className="filter-options">
          <div className="filter-row">
            <div className="filter-group">
              <label>Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Rating:</label>
              <select
                value={filterRating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="completedAt">Completion Date</option>
                <option value="rating">Rating</option>
                <option value="priority">Priority</option>
                <option value="completionTime">Completion Time</option>
                <option value="jobType">Job Type</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="jobs-content">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <RiCheckLine />
            <h3>No Completed Jobs</h3>
            <p>
              {searchTerm || filterPriority || filterRating
                ? "No completed jobs match your current filters."
                : "No jobs have been completed yet."}
            </p>
            {(searchTerm || filterPriority || filterRating) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("");
                  setFilterRating("");
                  fetchCompletedJobs(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="jobs-grid">{jobs.map(renderJobCard)}</div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <Button
                  variant="secondary"
                  leftIcon={<RiArrowLeftLine />}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>

                <div className="page-info">
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <span>({pagination.totalItems} total completed jobs)</span>
                </div>

                <Button
                  variant="secondary"
                  rightIcon={<RiArrowRightLine />}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Modal
        isOpen={invoiceModalOpen}
        onClose={resetInvoiceWorkflow}
        title={isPropertyManager ? "View Documents" : "Review & Send Documents"}
        size="large"
      >
        {invoiceDraft && (
          <div className="completed-job-documents-modal">
            {invoiceWorkflowNotice && (
              <div className="workflow-notice">
                <RiInformationLine />
                <p>{invoiceWorkflowNotice}</p>
              </div>
            )}
            {!isPropertyManager && (
              <div className="workflow-steps">
                <button
                  type="button"
                  className={`workflow-step ${reviewStep === "review" ? "active" : ""}`}
                  onClick={() => setReviewStep("review")}
                >
                  <span className="step-index">1</span>
                  <span>Review Documents</span>
                </button>
                <button
                  type="button"
                  className={`workflow-step ${reviewStep === "compose" ? "active" : ""}`}
                  onClick={() => {
                    if (!manualInvoiceMode) {
                      setReviewStep("compose");
                    }
                  }}
                  disabled={manualInvoiceMode}
                >
                  <span className="step-index">2</span>
                  <span>Compose & Send</span>
                </button>
              </div>
            )}

            <div className="review-header-card">
              <div>
                <p className="eyebrow">Completed Job</p>
                <h4>
                  {selectedJob?.jobType} <span>#{selectedJob?.job_id}</span>
                </h4>
                <p>{selectedJob?.property.address.fullAddress}</p>
              </div>
              <div className="status-stack">
                <span className={`invoice-status invoice-${invoiceDraft.status.toLowerCase()}`}>
                  {invoiceDraft.status}
                </span>
                <strong>{formatCurrency(invoiceDraft.totalCost)}</strong>
              </div>
            </div>

            {reviewStep === "review" && (
              <div className="review-step-layout">
                <div className="invoice-preview-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Invoice Preview</p>
                      <h4>{invoiceDraft.invoiceNumber}</h4>
                    </div>
                    <div className="panel-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<RiDownloadLine />}
                        onClick={handleDownloadInvoice}
                      >
                        Download Invoice
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<RiEyeLine />}
                        onClick={() => setInvoicePreviewOpen(true)}
                      >
                        Open Full Preview
                      </Button>
                      {!isPropertyManager && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<RiEditLine />}
                          onClick={() => setInvoiceEditorOpen((current) => !current)}
                          disabled={
                            invoiceActionLoading ||
                            (!manualInvoiceMode &&
                              (invoiceDraft.status === "Sent" ||
                                invoiceDraft.status === "Paid"))
                          }
                        >
                          {invoiceEditorOpen ? "Close Editor" : "Edit Invoice"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <CompletedJobInvoicePreview
                    invoice={invoiceDraft}
                    job={selectedJob}
                    reviewData={reviewData}
                    compact
                  />
                </div>

                <div className="document-readiness-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Document Readiness</p>
                      <h4>Check everything before sending</h4>
                    </div>
                  </div>

                  <div className={`readiness-card ${reviewData?.hasReport ? "ready" : "warning"}`}>
                    <div>
                      <strong>Inspection Report</strong>
                      <p>
                        {reviewData?.hasReport
                          ? isPropertyManager
                            ? "The completed inspection report is available to view."
                            : "The completed report is ready to be included in the email."
                          : isPropertyManager
                            ? "The completed inspection report is not available yet."
                            : "The completed report is missing. Sending is blocked until it exists."}
                      </p>
                    </div>
                    {reviewData?.reportFile ? (
                      <Button
                        href={reviewData.reportFile}
                        variant="secondary"
                        size="sm"
                        leftIcon={<RiFileTextLine />}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Report
                      </Button>
                    ) : (
                      <span className="document-tag missing">Missing</span>
                    )}
                  </div>

                  <div className="readiness-card ready">
                    <div>
                      <strong>Invoice Review</strong>
                      <p>
                        {isPropertyManager
                          ? "This invoice is available in read-only mode."
                          : manualInvoiceMode
                            ? "Create the draft invoice before moving to the email step."
                            : "Invoice draft is ready for admin review and sending."}
                      </p>
                    </div>
                    <span className="document-tag">
                      {isPropertyManager
                        ? "View only"
                        : manualInvoiceMode
                          ? "Draft not created"
                          : "Ready"}
                    </span>
                  </div>

                  {!isPropertyManager && (
                    <div className="recipients-preview">
                      <p className="eyebrow">Default Recipients</p>
                      {reviewData?.recipients.to?.length ? (
                        reviewData.recipients.to.map((recipient) => (
                          <div key={recipient.email} className="recipient-pill">
                            <RiMailSendLine />
                            <span>
                              {recipient.name
                                ? `${recipient.name} <${recipient.email}>`
                                : recipient.email}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="empty-copy">
                          Recipients will be reviewed in the compose step.
                        </p>
                      )}
                    </div>
                  )}

                  {!isPropertyManager && invoiceEditorOpen && (
                    <div className="invoice-editor">
                      <label>
                        <span>Description</span>
                        <textarea
                          value={invoiceDraft.description}
                          onChange={(e) =>
                            setInvoiceDraft({
                              ...invoiceDraft,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </label>
                      <div className="editor-items">
                        <div className="editor-item-label-row">
                          <span>Item Name</span>
                          <span>Quantity</span>
                          <span>Rate</span>
                          <span>Amount</span>
                        </div>
                        {invoiceDraft.items.map((item, index) => (
                          <div
                            key={item._id || item.id || index}
                            className="editor-item-row"
                          >
                            <label className="editor-field editor-field-name">
                              <span className="mobile-field-label">
                                Item Name
                              </span>
                              <input
                                aria-label={`Invoice item ${index + 1} name`}
                                value={item.name}
                                onChange={(e) =>
                                  updateInvoiceItem(index, "name", e.target.value)
                                }
                                placeholder="Service or item name"
                              />
                            </label>
                            <label className="editor-field">
                              <span className="mobile-field-label">
                                Quantity
                              </span>
                              <input
                                aria-label={`Invoice item ${index + 1} quantity`}
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateInvoiceItem(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                min="0"
                                step="1"
                                placeholder="Qty"
                              />
                            </label>
                            <label className="editor-field">
                              <span className="mobile-field-label">Rate</span>
                              <input
                                aria-label={`Invoice item ${index + 1} rate`}
                                type="number"
                                value={item.rate}
                                onChange={(e) =>
                                  updateInvoiceItem(index, "rate", e.target.value)
                                }
                                min="0"
                                step="0.01"
                                placeholder="Rate"
                              />
                            </label>
                            <label className="editor-field">
                              <span className="mobile-field-label">Amount</span>
                              <input
                                aria-label={`Invoice item ${index + 1} amount`}
                                type="number"
                                value={item.amount}
                                readOnly
                                tabIndex={-1}
                                placeholder="Amount"
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                      <label>
                        <span>Tax</span>
                        <input
                          type="number"
                          value={invoiceDraft.tax}
                          onChange={(e) => {
                            const tax = Number(e.target.value || 0);
                            const subtotal = invoiceDraft.items.reduce(
                              (sum, item) => sum + item.amount,
                              0
                            );
                            setInvoiceDraft({
                              ...invoiceDraft,
                              tax,
                              subtotal,
                              totalCost: subtotal + tax,
                            });
                          }}
                          min="0"
                          step="0.01"
                        />
                      </label>
                      <label>
                        <span>Notes</span>
                        <textarea
                          value={invoiceDraft.notes || ""}
                          onChange={(e) =>
                            setInvoiceDraft({
                              ...invoiceDraft,
                              notes: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </label>
                      <div className="editor-actions">
                        <Button
                          variant="secondary"
                          onClick={handleSaveInvoice}
                          disabled={
                            invoiceActionLoading ||
                            (!manualInvoiceMode &&
                              (invoiceDraft.status === "Sent" ||
                                invoiceDraft.status === "Paid"))
                          }
                        >
                          {manualInvoiceMode
                            ? "Create Draft Invoice"
                            : "Save Invoice"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isPropertyManager && (
                    <div className="review-actions">
                      <Button
                        variant="primary"
                        rightIcon={<RiArrowRightSLine />}
                        onClick={() => setReviewStep("compose")}
                        disabled={
                          invoiceActionLoading ||
                          manualInvoiceMode ||
                          !invoiceDraft.id ||
                          invoiceDraft.status === "Sent" ||
                          invoiceDraft.status === "Paid"
                        }
                      >
                        Continue to Compose
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isPropertyManager && reviewStep === "compose" && (
              <div className="compose-step-layout">
                <div className="compose-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Compose Email</p>
                      <h4>Review recipients, subject, body, and attachments</h4>
                    </div>
                  </div>

                  <div className="compose-grid">
                    <label>
                      <span>To *</span>
                      <input
                        type="text"
                        value={emailComposer.to}
                        onChange={(e) =>
                          setEmailComposer((current) => ({
                            ...current,
                            to: e.target.value,
                          }))
                        }
                        placeholder="Agency and property managers"
                      />
                    </label>
                    <label>
                      <span>CC</span>
                      <input
                        type="text"
                        value={emailComposer.cc}
                        onChange={(e) =>
                          setEmailComposer((current) => ({
                            ...current,
                            cc: e.target.value,
                          }))
                        }
                        placeholder="cc@example.com, second@example.com"
                      />
                    </label>
                    <label>
                      <span>BCC</span>
                      <input
                        type="text"
                        value={emailComposer.bcc}
                        onChange={(e) =>
                          setEmailComposer((current) => ({
                            ...current,
                            bcc: e.target.value,
                          }))
                        }
                        placeholder="Optional blind copies"
                      />
                    </label>
                    <label>
                      <span>Subject *</span>
                      <input
                        type="text"
                        value={emailComposer.subject}
                        onChange={(e) =>
                          setEmailComposer((current) => ({
                            ...current,
                            subject: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <div className="editor-group">
                      <span>Body *</span>
                      <ReactQuill
                        value={emailComposer.bodyHtml}
                        onChange={(value) =>
                          setEmailComposer((current) => ({
                            ...current,
                            bodyHtml: value,
                          }))
                        }
                        theme="snow"
                      />
                    </div>
                  </div>
                  {emailValidationError && (
                    <div className="validation-banner">{emailValidationError}</div>
                  )}
                </div>

                <div className="send-preview-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Send Review</p>
                      <h4>What will be sent</h4>
                    </div>
                  </div>

                  <div className="send-preview-block">
                    <span>Recipients</span>
                    <p>{emailComposer.to || "No recipients yet"}</p>
                    {emailComposer.cc && <p>CC: {emailComposer.cc}</p>}
                    {emailComposer.bcc && <p>BCC: {emailComposer.bcc}</p>}
                  </div>

                  <div className="send-preview-block">
                    <span>Subject</span>
                    <p>{emailComposer.subject || "No subject"}</p>
                  </div>

                  <div className="send-preview-block">
                    <span>Document Checklist</span>
                    <div className="checklist-row">
                      <RiCheckboxCircleLine className="ready" />
                      <p>
                        Invoice {invoiceDraft.invoiceNumber} for{" "}
                        {formatCurrency(invoiceDraft.totalCost)}
                      </p>
                    </div>
                    <div className="checklist-row">
                      <RiCheckboxCircleLine
                        className={reviewData?.hasReport ? "ready" : "missing"}
                      />
                      <p>
                        {reviewData?.hasReport
                          ? "Inspection report link is included."
                          : "Inspection report is missing."}
                      </p>
                    </div>
                  </div>

                  <div className="send-preview-block">
                    <span>Email Preview</span>
                    <div
                      className="email-preview-html"
                      dangerouslySetInnerHTML={{
                        __html:
                          emailComposer.bodyHtml ||
                          "<p class='empty'>No email body yet.</p>",
                      }}
                    />
                  </div>

                  <div className="compose-actions">
                    <Button
                      variant="secondary"
                      onClick={() => setReviewStep("review")}
                      disabled={invoiceActionLoading}
                    >
                      Back to Review
                    </Button>
                    <Button
                      variant="primary"
                      leftIcon={<RiMailSendLine />}
                      onClick={handleSendDocuments}
                      disabled={
                        invoiceActionLoading ||
                        invoiceDraft.status === "Sent" ||
                        invoiceDraft.status === "Paid" ||
                        !reviewData?.hasReport
                      }
                    >
                      Send Documents
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal
        isOpen={invoicePreviewOpen}
        onClose={() => setInvoicePreviewOpen(false)}
        title="Generated Invoice Preview"
        size="large"
      >
        {invoiceDraft && selectedJob && (
          <div className="invoice-preview-modal-content">
            <div className="invoice-preview-modal-actions">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RiDownloadLine />}
                onClick={handleDownloadInvoice}
              >
                Download Invoice
              </Button>
            </div>
            <CompletedJobInvoicePreview
              invoice={invoiceDraft}
              job={selectedJob}
              reviewData={reviewData}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompletedJobs;
