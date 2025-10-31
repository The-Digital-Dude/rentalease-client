import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiHomeLine,
  RiUser3Line,
  RiShieldCheckLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiUploadLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiHistoryLine,
} from "react-icons/ri";
import { jsPDF } from "jspdf";
import propertyService, {
  type Property,
  type PropertyDocument,
} from "../../services/propertyService";
import { agencyService } from "../../services";
import EmailContactModal from "../../components/EmailContactModal";
import PropertyLogsModal from "../../components/PropertyLogsModal";
import { formatDateTime } from "../../utils";
import "./PropertyProfile.scss";
import jobService from "../../services/jobService";
import type { Job } from "../../services/jobService";
import invoiceService, { type Invoice } from "../../services/invoiceService";
import inspectionReportService, { type InspectionReport } from "../../services/inspectionReportService";
import toast from "react-hot-toast";
import { useAppSelector } from "../../store";

const PropertyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get current user info for role-based access
  const { userType } = useAppSelector((state) => state.user);

  // Check if user can send emails (only super_user and team_member)
  const canSendEmail = userType === "super_user" || userType === "team_member";
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [inspectionReports, setInspectionReports] = useState<InspectionReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentDeleting, setDocumentDeleting] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [firstDeleteConfirmation, setFirstDeleteConfirmation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoDataUrlRef = useRef<string | null>(null);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<{
    email: string;
    name: string;
    type: 'agency' | 'tenant' | 'landlord';
  } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Logs modal state
  const [showLogsModal, setShowLogsModal] = useState(false);

  const loadProperty = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await propertyService.getProperty(id);
      if (response.status === "success") {
        setProperty(response.data.property);
        setDocuments(response.data.property.documents ?? []);
      } else {
        setError(response.message || "Failed to load property");
        setProperty(null);
        setDocuments([]);
      }
    } catch (loadError: any) {
      console.error("Error loading property:", loadError);
      setError(loadError.message || "Failed to load property");
      setProperty(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadJobs = useCallback(async () => {
    if (!id) return;

    try {
      setJobsLoading(true);
      setJobsError(null);
      const response = await jobService.getJobs({ property: id, limit: 100 });
      if (response.success && Array.isArray(response.data)) {
        const jobsData = response.data.filter(
          (item: any) => item.job_id && item.property && item.jobType
        ) as Job[];
        setJobs(jobsData);
      } else {
        setJobsError(response.message || "Failed to load jobs");
        setJobs([]);
      }
    } catch (loadJobsError: any) {
      setJobsError(loadJobsError.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [id]);

  const loadInspectionReports = useCallback(async () => {
    if (!id) return;

    try {
      setReportsLoading(true);
      setReportsError(null);
      const response = await inspectionReportService.getReportsForProperty(id, {
        limit: 50, // Load more reports for comprehensive view
      });

      if (response.status === "success" && response.data) {
        setInspectionReports(response.data.reports);
      } else {
        setReportsError(response.message || "Failed to load inspection reports");
        setInspectionReports([]);
      }
    } catch (loadReportsError: any) {
      console.error("Error loading inspection reports:", loadReportsError);
      setReportsError(loadReportsError.message || "Failed to load inspection reports");
      setInspectionReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
    loadJobs();
    loadInspectionReports();
  }, [loadProperty, loadJobs, loadInspectionReports]);

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "compliant";
      case "Due Soon":
        return "due-soon";
      case "Overdue":
        return "overdue";
      case "Not Required":
        return "not-required";
      default:
        return "default";
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit property:", property?.id);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Add quick action handlers (mocked for now)
  const handleCreateJob = () => alert("Create Job action");
  const handleContactTenant = () => alert("Contact Tenant action");
  const handleContactLandlord = () => alert("Contact Landlord action");
  const handleContactAgency = () => alert("Contact Agency action");

  // Email handlers
  const handleOpenEmailModal = (email: string, name: string, type: 'agency' | 'tenant' | 'landlord') => {
    setEmailRecipient({ email, name, type });
    setShowEmailModal(true);
    setEmailError(null);
    setEmailSuccess(null);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailRecipient(null);
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(false);
  };

  const handleSendEmail = async (subject: string, html: string, attachments?: File[]) => {
    if (!emailRecipient) return;

    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const response = await agencyService.sendEmailToAgency(
        emailRecipient.email,
        { subject, html, attachments }
      );

      if (response.success) {
        setEmailSuccess("Email sent successfully!");
        toast.success(`✅ Email sent to ${emailRecipient.name}`);

        setTimeout(() => {
          handleCloseEmailModal();
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to send email");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send email";
      setEmailError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocumentUpload = async (files: File[]) => {
    if (!id || files.length === 0) {
      return;
    }

    try {
      setDocumentUploading(true);
      const responses = await Promise.all(
        files.map((file) => propertyService.uploadDocument(id, file))
      );

      const latest = responses[responses.length - 1];

      if (latest?.status === "success") {
        const updatedProperty = latest.data.property;
        setProperty(updatedProperty);
        setDocuments(updatedProperty.documents ?? []);
        toast.success(
          files.length === 1
            ? "Document uploaded successfully."
            : `${files.length} documents uploaded successfully.`
        );
      } else {
        toast.error(latest?.message || "Failed to upload documents.");
      }
    } catch (uploadError: any) {
      console.error("Document upload error:", uploadError);
      toast.error(uploadError?.message || "Failed to upload documents.");
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length) {
      void handleDocumentUpload(selectedFiles);
    }
    event.target.value = "";
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (!id) return;

    // First confirmation
    if (firstDeleteConfirmation !== documentId) {
      setFirstDeleteConfirmation(documentId);
      toast("Click delete again to confirm deletion of " + documentName, {
        icon: "⚠️",
        duration: 4000,
      });

      // Clear first confirmation after 5 seconds
      setTimeout(() => {
        setFirstDeleteConfirmation(null);
      }, 5000);
      return;
    }

    // Second confirmation
    try {
      setDocumentDeleting(documentId);
      setDeletingDocumentId(documentId);
      setFirstDeleteConfirmation(null);

      const response = await propertyService.deleteDocument(id, documentId);

      if (response.status === "success") {
        const updatedProperty = response.data.property;
        setProperty(prev => prev ? { ...prev, documents: updatedProperty.documents ?? [] } : null);
        setDocuments(updatedProperty.documents ?? []);
        toast.success("Document deleted successfully.");
      } else {
        toast.error(response.message || "Failed to delete document.");
      }
    } catch (deleteError: any) {
      console.error("Document deletion error:", deleteError);
      toast.error(deleteError?.message || "Failed to delete document.");
    } finally {
      setDocumentDeleting(null);
      setDeletingDocumentId(null);
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size || Number.isNaN(size)) {
      return "—";
    }
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fetchInvoicesForJobs = useCallback(
    async (jobList: Job[]) => {
      const invoiceIds = new Set<string>();
      const jobsNeedingLookup: string[] = [];

      jobList.forEach((job) => {
        const invoiceRef = job.invoice;

        if (typeof invoiceRef === "string" && invoiceRef.trim().length > 0) {
          invoiceIds.add(invoiceRef);
          return;
        }

        if (invoiceRef && typeof invoiceRef === "object") {
          const derivedId = invoiceRef._id || invoiceRef.id;

          if (derivedId) {
            invoiceIds.add(derivedId);
            return;
          }
        }

        if (job.hasInvoice && job.id) {
          jobsNeedingLookup.push(job.id);
        }
      });

      const fetchedInvoicesMap = new Map<string, Invoice>();
      const errors: string[] = [];

      for (const invoiceId of invoiceIds) {
        try {
          const response = await invoiceService.getInvoiceById(invoiceId);
          if (response.status === "success" && response.data?.invoice) {
            fetchedInvoicesMap.set(response.data.invoice.id, response.data.invoice);
          }
        } catch (error) {
          console.error(`Failed to load invoice ${invoiceId}:`, error);
          errors.push(`Invoice ${invoiceId}`);
        }
      }

      for (const jobId of jobsNeedingLookup) {
        try {
          const response = await invoiceService.getInvoiceByJobId(jobId);
          if (response.status === "success" && response.data?.invoice) {
            fetchedInvoicesMap.set(response.data.invoice.id, response.data.invoice);
          }
        } catch (error) {
          console.error(`Failed to load invoice for job ${jobId}:`, error);
          errors.push(`Job ${jobId}`);
        }
      }

      const fetchedInvoices = Array.from(fetchedInvoicesMap.values()).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      return { invoices: fetchedInvoices, errors };
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadInvoicesForProperty = async () => {
      if (jobsLoading) {
        return;
      }

      if (jobs.length === 0) {
        if (isMounted) {
          setInvoices([]);
          setInvoicesError(null);
          setInvoicesLoading(false);
        }
        return;
      }

      if (isMounted) {
        setInvoicesLoading(true);
        setInvoicesError(null);
      }

      try {
        const { invoices: fetchedInvoices, errors } = await fetchInvoicesForJobs(jobs);

        if (!isMounted) {
          return;
        }

        setInvoices(fetchedInvoices);
        setInvoicesError(
          fetchedInvoices.length === 0 && errors.length > 0
            ? "Failed to load invoices for this property."
            : null
        );
      } catch (error) {
        console.error("Failed to fetch invoices for property:", error);
        if (isMounted) {
          setInvoices([]);
          setInvoicesError("Failed to load invoices for this property.");
        }
      } finally {
        if (isMounted) {
          setInvoicesLoading(false);
        }
      }
    };

    void loadInvoicesForProperty();

    return () => {
      isMounted = false;
    };
  }, [jobs, jobsLoading, fetchInvoicesForJobs]);

  const getInvoiceJobDetails = (invoice: Invoice) => {
    const invoiceJobId =
      typeof invoice.jobId === "string"
        ? invoice.jobId
        : invoice.jobId?._id || (invoice.jobId as { id?: string })?.id;

    if (!invoiceJobId) {
      return null;
    }

    return jobs.find((job) => job.id === invoiceJobId);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "—";
    }

    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getInvoiceStatusLabel = (invoice: Invoice) => {
    switch (invoice.status) {
      case "Paid":
        return invoice.paidAt
          ? `Paid on ${formatDateTime(invoice.paidAt)}`
          : "Paid";
      case "Sent":
        return "Sent - awaiting payment";
      case "Pending":
      default:
        return "Pending payment";
    }
  };

  const hexToRgb = (hex: string) => {
    const sanitized = hex.replace("#", "");
    const bigint = parseInt(sanitized, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const ensureLogoDataUrl = async () => {
    if (logoDataUrlRef.current) {
      return logoDataUrlRef.current;
    }

    try {
      const isDark = document.documentElement.classList.contains('dark-mode');
      const logoPath = isDark ? "/rentalease-logo-light.png" : "/rentalease-logo.png";
      const response = await fetch(logoPath);
      if (!response.ok) {
        throw new Error("Logo not found");
      }
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read logo"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      logoDataUrlRef.current = dataUrl;
      return dataUrl;
    } catch (loadLogoError) {
      console.error("Unable to load logo for PDF:", loadLogoError);
      return null;
    }
  };

  const getTechnicianDisplayName = (
    technician: Job["assignedTechnician"]
  ): string => {
    if (!technician) {
      return "Unassigned";
    }

    if (typeof technician === "string") {
      return technician.trim() || "Unassigned";
    }

    if (technician.fullName && technician.fullName.trim()) {
      return technician.fullName.trim();
    }

    if (technician.name && technician.name.trim()) {
      return technician.name.trim();
    }

    const firstName = technician.firstName?.trim();
    const lastName = technician.lastName?.trim();
    const combined = [firstName, lastName].filter(Boolean).join(" ");

    return combined || "Unassigned";
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const relatedJob = getInvoiceJobDetails(invoice);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageMargin = 20;
      const primaryBlue = hexToRgb("#0f4c75");
      const deepBlue = hexToRgb("#103a5c");
      const softTeal = hexToRgb("#46b48c");
      const textPrimary = hexToRgb("#1f2a36");
      const textMuted = hexToRgb("#6b7280");
      const divider = hexToRgb("#e2e8f0");

      doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b);
      doc.rect(0, 0, pageWidth, 58, "F");

      const logoDataUrl = await ensureLogoDataUrl();
      if (logoDataUrl) {
        const logoHeight = 24;
        const logoWidth = 24 * (802 / 404); // maintain supplied ratio
        doc.addImage(logoDataUrl, "PNG", pageMargin, 16, logoWidth, logoHeight);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("RentalEase Invoice", pageMargin + 70, 25, { baseline: "alphabetic" });

      doc.setFontSize(12);
      doc.text(
        `Invoice #: ${invoice.invoiceNumber || invoice.id}`,
        pageMargin + 70,
        38
      );

      doc.setFont("helvetica", "normal");
      doc.setTextColor(226, 232, 240);
      doc.text(
        property.address.fullAddress,
        pageMargin + 70,
        50,
        {
          maxWidth: pageWidth - (pageMargin + 70) - 20,
        }
      );

      doc.setTextColor(210, 224, 237);
      doc.text(
        `Status: ${getInvoiceStatusLabel(invoice)}`,
        pageWidth - pageMargin,
        20,
        { align: "right" }
      );
      doc.text(
        `Issued: ${formatDateTime(invoice.sentAt || invoice.createdAt)}`,
        pageWidth - pageMargin,
        32,
        { align: "right" }
      );

      doc.setDrawColor(0, 0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageMargin, 70, pageWidth - pageMargin * 2, 40, 6, 6, "F");

      doc.setTextColor(textPrimary.r, textPrimary.g, textPrimary.b);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Summary", pageMargin + 12, 84);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text(
        `Payment Reference: ${invoice.paymentReference || "Not provided"}`,
        pageMargin + 12,
        96
      );
      doc.text(
        `Payment Method: ${invoice.paymentMethod || "—"}`,
        pageMargin + 12,
        108
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryBlue.r, primaryBlue.g, primaryBlue.b);
      doc.text(
        formatCurrency(invoice.totalCost),
        pageWidth - pageMargin - 12,
        108,
        { align: "right" }
      );

      const formatDateForPdf = (value?: string | null) => {
        if (!value) {
          return "—";
        }
        return new Date(value).toLocaleDateString("en-AU", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
      };

      const formatCurrencyForPdf = (value?: number | null) => {
        if (value === null || value === undefined || Number.isNaN(value)) {
          return "—";
        }

        return new Intl.NumberFormat("en-AU", {
          style: "currency",
          currency: "AUD",
          minimumFractionDigits: 2,
        }).format(value);
      };

      let cursorY = 128;

      if (relatedJob) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(pageMargin, cursorY - 6, pageWidth - pageMargin * 2, 38, 6, 6, "F");
        doc.setTextColor(textPrimary.r, textPrimary.g, textPrimary.b);
        doc.setFont("helvetica", "bold");
        doc.text("Job & Compliance", pageMargin + 12, cursorY + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
        doc.text(`Job ID: ${relatedJob.job_id}`, pageMargin + 12, cursorY + 16);
        doc.text(`Type: ${relatedJob.jobType}`, pageMargin + 12, cursorY + 24);
        doc.text(
          `Technician: ${getTechnicianDisplayName(relatedJob.assignedTechnician)}`,
          pageMargin + 140,
          cursorY + 16
        );
        doc.text(
          `Scheduled / Completed: ${formatDateForPdf(
            relatedJob.completedAt || relatedJob.dueDate
          )}`,
          pageMargin + 140,
          cursorY + 24
        );
        cursorY += 50;
      }

      const tableX = pageMargin;
      const tableWidth = pageWidth - pageMargin * 2;
      const columnWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.15, tableWidth * 0.2];
      const columnTitles = ["Line Item", "Qty", "Rate", "Amount"];

      doc.setFillColor(deepBlue.r, deepBlue.g, deepBlue.b);
      doc.roundedRect(tableX, cursorY - 6, tableWidth, 18, 6, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      let columnCursorX = tableX + 10;
      columnTitles.forEach((title, index) => {
        doc.text(title, columnCursorX, cursorY + 4);
        columnCursorX += columnWidths[index];
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(textPrimary.r, textPrimary.g, textPrimary.b);

      cursorY += 18;
      let rowStripe = false;

      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          if (rowStripe) {
            doc.setFillColor(248, 250, 252);
            doc.rect(tableX, cursorY - 6, tableWidth, 14, "F");
          }
          rowStripe = !rowStripe;

          columnCursorX = tableX + 10;
          doc.text(item.name || "Item", columnCursorX, cursorY);
          columnCursorX += columnWidths[0];

          doc.text(`${item.quantity ?? 0}`, columnCursorX, cursorY);
          columnCursorX += columnWidths[1];

          doc.text(
            formatCurrencyForPdf(item.rate),
            columnCursorX,
            cursorY
          );
          columnCursorX += columnWidths[2];

          doc.text(
            formatCurrencyForPdf(item.amount),
            columnCursorX,
            cursorY
          );

          cursorY += 14;
        });
      } else {
        doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
        doc.text("No invoice line items available.", tableX + 10, cursorY);
        cursorY += 14;
      }

      doc.setTextColor(divider.r, divider.g, divider.b);
      doc.setLineWidth(0.6);
      doc.line(tableX, cursorY, tableX + tableWidth, cursorY);

      cursorY += 10;
      const totalsX = tableX + tableWidth * 0.55;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text("Subtotal", totalsX, cursorY);
      doc.setTextColor(textPrimary.r, textPrimary.g, textPrimary.b);
      doc.text(
        formatCurrencyForPdf(invoice.subtotal),
        tableX + tableWidth,
        cursorY,
        { align: "right" }
      );

      cursorY += 8;
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text("Tax", totalsX, cursorY);
      doc.setTextColor(textPrimary.r, textPrimary.g, textPrimary.b);
      doc.text(
        formatCurrencyForPdf(invoice.tax),
        tableX + tableWidth,
        cursorY,
        { align: "right" }
      );

      cursorY += 9;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryBlue.r, primaryBlue.g, primaryBlue.b);
      doc.text("Amount Due", totalsX, cursorY);
      doc.setFontSize(13);
      doc.setTextColor(softTeal.r, softTeal.g, softTeal.b);
      doc.text(
        formatCurrencyForPdf(invoice.totalCost),
        tableX + tableWidth,
        cursorY,
        { align: "right" }
      );

      cursorY += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text(
        invoice.notes?.trim() || invoice.description || "Thank you for partnering with RentalEase.",
        pageMargin,
        cursorY,
        {
          maxWidth: pageWidth - pageMargin * 2,
        }
      );

      doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b);
      doc.rect(0, doc.internal.pageSize.getHeight() - 28, pageWidth, 28, "F");
      doc.setFontSize(10);
      doc.setTextColor(226, 232, 240);
      doc.text(
        "RentalEase • Simplifying Property Compliance & Billing",
        pageMargin,
        doc.internal.pageSize.getHeight() - 12
      );

      doc.save(`Invoice-${invoice.invoiceNumber || invoice.id}.pdf`);
      toast.success("Invoice PDF downloaded.");
    } catch (error) {
      console.error("Failed to generate invoice PDF:", error);
      toast.error("Unable to generate invoice PDF.");
    }
  };

  // Add mock activity log data
  const mockActivityLog = [
    {
      date: "2024-04-01",
      event: "Rent paid",
      details: "April rent received from tenant.",
    },
    {
      date: "2024-03-15",
      event: "Maintenance completed",
      details: "Plumbing repair completed by technician.",
    },
    {
      date: "2024-02-15",
      event: "Smoke alarm inspection",
      details: "Annual smoke alarm inspection passed.",
    },
    {
      date: "2024-01-10",
      event: "Gas compliance certificate uploaded",
      details: "New certificate uploaded by agency.",
    },
    {
      date: "2023-12-20",
      event: "Safety certificate uploaded",
      details: "Certificate uploaded by landlord.",
    },
    {
      date: "2023-11-01",
      event: "Tenant moved in",
      details: "Lease started for current tenant.",
    },
  ];

  // Add mock gallery images
  const mockGallery = [
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      alt: "Front view",
    },
    {
      url: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=400&q=80",
      alt: "Living room",
    },
    {
      url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80",
      alt: "Kitchen",
    },
    {
      url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=400&q=80",
      alt: "Bedroom",
    },
    {
      url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
      alt: "Backyard",
    },
  ];

  // Add mock tags and notes
  const mockTags = ["Premium", "Long-term Tenant", "No Pets", "Renovated"];
  const mockInternalNotes =
    "This property is a high-value asset with a reliable tenant. Consider for future investment upgrades.";

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Error Loading Property</h2>
          <p>{error || "Property not found"}</p>
          <button onClick={handleBack} className="btn btn-primary">
            <RiArrowLeftLine />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container property-profile-page">
      {/* Header */}
      <div className="profile-header redesigned-header">
        <div className="header-content">
          <div className="header-title">
            <button onClick={handleBack} className="back-btn">
              <RiArrowLeftLine />
              Back
            </button>
            <h1>{property.address.fullAddress}</h1>
          </div>
          <p className="property-type">{property.propertyType}</p>
        </div>
        {/* <div className="header-actions">
          <button onClick={handleEdit} className="edit-btn main-action">
            <RiEditLine />
            Edit Property
          </button>
        </div> */}
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <h2>
            <RiHomeLine />
            Property Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Address</label>
              <p>{property.address.fullAddress}</p>
            </div>
            <div className="info-item">
              <label>Property Type</label>
              <p>{property.propertyType}</p>
            </div>
            <div className="info-item">
              <label>Region</label>
              <p>{property.region}</p>
            </div>
          </div>
        </div>

        {/* Agency */}
        <div className="profile-section">
          <h2>
            <RiUser3Line />
            Agency
          </h2>
          <div className="contact-card">
            <div className="contact-info">
              <h3>{property.agency.companyName}</h3>
              <p className="contact-person">{property.agency.contactPerson}</p>
              <div className="contact-details">
                <div className="contact-item">
                  <RiMailLine />
                  <span>{property.agency.email}</span>
                </div>
                <div className="contact-item">
                  <RiPhoneLine />
                  <span>{property.agency.phone}</span>
                </div>
              </div>
            </div>
            {canSendEmail && (
              <button
                className="btn-email"
                onClick={() => handleOpenEmailModal(
                  property.agency.email,
                  property.agency.companyName,
                  'agency'
                )}
                title="Send Email to Agency"
              >
                <RiMailLine />
                Email
              </button>
            )}
          </div>
        </div>

        {/* Tenant Information */}
        {property.currentTenant && (
          <div className="profile-section">
            <h2>
              <RiUser3Line />
              Current Tenant
            </h2>
            <div className="contact-card">
              <div className="contact-info">
                <h3>{property.currentTenant.name}</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <RiMailLine />
                    <span>{property.currentTenant.email}</span>
                  </div>
                  <div className="contact-item">
                    <RiPhoneLine />
                    <span>{property.currentTenant.phone}</span>
                  </div>
                </div>
              </div>
              {canSendEmail && (
                <button
                  className="btn-email"
                  onClick={() => handleOpenEmailModal(
                    property.currentTenant!.email,
                    property.currentTenant!.name,
                    'tenant'
                  )}
                  title="Send Email to Tenant"
                >
                  <RiMailLine />
                  Email
                </button>
              )}
            </div>
          </div>
        )}

        {/* Landlord Information */}
        {property.currentLandlord && (
          <div className="profile-section">
            <h2>
              <RiUser3Line />
              Landlord
            </h2>
            <div className="contact-card">
              <div className="contact-info">
                <h3>{property.currentLandlord.name}</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <RiMailLine />
                    <span>{property.currentLandlord.email}</span>
                  </div>
                  <div className="contact-item">
                    <RiPhoneLine />
                    <span>{property.currentLandlord.phone}</span>
                  </div>
                </div>
              </div>
              {canSendEmail && (
                <button
                  className="btn-email"
                  onClick={() => handleOpenEmailModal(
                    property.currentLandlord!.email,
                    property.currentLandlord!.name,
                    'landlord'
                  )}
                  title="Send Email to Landlord"
                >
                  <RiMailLine />
                  Email
                </button>
              )}
            </div>
          </div>
        )}

        {/* Compliance Schedule */}
        <div className="profile-section">
          <h2>
            <RiShieldCheckLine />
            Next Compliance Schedule
          </h2>
          <div className="compliance-grid">
            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.gasCompliance?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Gas Compliance</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.gasCompliance?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.gasCompliance?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.gasCompliance?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.gasCompliance.nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.electricalSafety?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Electrical Safety</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.electricalSafety?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.electricalSafety?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.electricalSafety
                ?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.electricalSafety
                        .nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.smokeAlarms?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Smoke Alarms</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.smokeAlarms?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.smokeAlarms?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.smokeAlarms?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.smokeAlarms.nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.minimumSafetyStandard?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Minimum Safety Standard</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.minimumSafetyStandard?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.minimumSafetyStandard?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.minimumSafetyStandard?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.minimumSafetyStandard.nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Notes */}
        {property.notes && (
          <div className="profile-section">
            <h2>Notes</h2>
            <div className="notes-content">
              <p>{property.notes}</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="profile-section">
          <h2>Property Details</h2>
          <div className="metadata-grid">
            <div className="metadata-item">
              <label>Created</label>
              <p>{formatDateTime(property.createdAt)}</p>
            </div>
            {property.updatedAt && (
              <div className="metadata-item">
                <label>Last Updated</label>
                <p>{formatDateTime(property.updatedAt)}</p>
              </div>
            )}
            {property.hasOverdueCompliance && (
              <div className="metadata-item">
                <label>Compliance Status</label>
                <p className="status overdue">Has Overdue Compliance</p>
              </div>
            )}
            <div className="metadata-item">
              <label>Change History</label>
              <button
                className="btn-view-logs"
                onClick={() => setShowLogsModal(true)}
                title="View property change history"
              >
                <RiHistoryLine />
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="profile-section">
          <h2>
            <RiCalendarLine /> Jobs
          </h2>
          {jobsLoading ? (
            <div>Loading jobs...</div>
          ) : jobsError ? (
            <div className="error-state">{jobsError}</div>
          ) : (
            <>
              <h3>Job History</h3>
              {jobs.length === 0 ? (
                <div>No job history.</div>
              ) : (
                <table className="jobs-table">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Type</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Technician</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>{job.job_id}</td>
                        <td>{job.jobType}</td>
                        <td>{formatDateTime(job.dueDate)}</td>
                        <td>{job.status}</td>
                        <td>{job.priority}</td>
                        <td>{getTechnicianDisplayName(job.assignedTechnician)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Inspection Reports Section */}
        <div className="profile-section">
          <h2>
            <RiFileListLine /> Inspection Reports
          </h2>
          {reportsLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading inspection reports...</p>
            </div>
          ) : reportsError ? (
            <div className="error-state">
              <p>{reportsError}</p>
            </div>
          ) : inspectionReports.length === 0 ? (
            <div className="empty-state">
              <p>No inspection reports found for this property.</p>
            </div>
          ) : (
            <div className="inspection-reports-grid">
              {inspectionReports.map((report) => (
                <div key={report.id} className="inspection-report-card">
                  <div className="report-header">
                    <h3 className="report-type">
                      {inspectionReportService.getJobTypeDisplayName(report.jobType)}
                    </h3>
                    <span className="report-date">
                      {formatDateTime(report.submittedAt)}
                    </span>
                  </div>

                  <div className="report-details">
                    <div className="report-field">
                      <label>Technician:</label>
                      <span>{inspectionReportService.formatTechnicianName(report.technician)}</span>
                    </div>

                    {report.technician.email && (
                      <div className="report-field">
                        <label>Contact:</label>
                        <span>{report.technician.email}</span>
                      </div>
                    )}

                    {report.notes && (
                      <div className="report-field">
                        <label>Notes:</label>
                        <span>{report.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="report-actions">
                    {report.pdf?.url && (
                      <button
                        className="btn btn-outline"
                        onClick={() => window.open(report.pdf!.url, '_blank')}
                        title="View PDF Report"
                      >
                        <RiDownloadLine />
                        View PDF
                      </button>
                    )}

                    {report.media && report.media.length > 0 && (
                      <span className="media-count">
                        {report.media.length} photo{report.media.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing/Payment History Section */}
        <div className="profile-section">
          <h2>
            <RiMoneyDollarBoxLine /> Billing & Payment History
          </h2>
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoicesLoading ? (
                <tr>
                  <td colSpan={6}>Loading invoices...</td>
                </tr>
              ) : invoicesError && invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="error-state">
                    {invoicesError}
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6}>No invoices found for this property yet.</td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const relatedJob = getInvoiceJobDetails(invoice);
                  const issueDate = invoice.paidAt || invoice.sentAt || invoice.createdAt;

                  return (
                    <tr key={invoice.id}>
                      <td>{formatDateTime(issueDate)}</td>
                      <td>{relatedJob?.jobType || invoice.description || "Invoice"}</td>
                      <td>{formatCurrency(invoice.totalCost)}</td>
                      <td>{getInvoiceStatusLabel(invoice)}</td>
                      <td>
                        <div className="invoice-notes">
                          <span>{invoice.description || "No description provided."}</span>
                          <small>
                            Invoice #{invoice.invoiceNumber}
                            {relatedJob?.job_id ? ` - Job ${relatedJob.job_id}` : ""}
                          </small>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="download-invoice-btn"
                          onClick={() => {
                            void handleDownloadInvoice(invoice);
                          }}
                          title="Download invoice (PDF)"
                          aria-label={`Download invoice ${invoice.invoiceNumber}`}
                        >
                          <RiDownloadLine />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="profile-section">
          <h2>
            <RiFileListLine /> Documents
          </h2>
          <div className="documents-upload">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              hidden
            />
            <button
              type="button"
              className="documents-upload__button"
              onClick={handleUploadClick}
              disabled={documentUploading}
            >
              <RiUploadLine />
              <span>{documentUploading ? "Uploading…" : "Upload documents"}</span>
            </button>
            <p className="documents-upload__hint">
              Supports PDF, DOC, DOCX, JPG, PNG (max 10MB per file)
            </p>
          </div>

          {documents.length > 0 ? (
            <div className="documents-list">
              {documents.map((doc) => (
                <div
                  key={doc.id || doc.url || `${doc.name}-${doc.uploadDate}`}
                  className="document-item"
                >
                  <div className="document-info">
                    <div className="document-header">
                      <span className="document-name">{doc.name}</span>
                      <span className="document-size">{formatFileSize(doc.size)}</span>
                    </div>
                    <div className="document-meta">
                      <span className="document-type">{doc.type || "Document"}</span>
                      {doc.uploadDate && (
                        <span className="document-date">
                          {formatDateTime(doc.uploadDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="document-actions">
                    {doc.url ? (
                      <button
                        type="button"
                        className="download-btn"
                        title="Download"
                        onClick={() => window.open(doc.url!, "_blank", "noopener")}
                      >
                        <RiDownloadLine />
                      </button>
                    ) : (
                      <button type="button" className="download-btn" disabled>
                        <RiDownloadLine />
                      </button>
                    )}
                    <button
                      type="button"
                      className={`delete-btn ${
                        firstDeleteConfirmation === doc.id ? "confirm-delete" : ""
                      }`}
                      title={
                        firstDeleteConfirmation === doc.id
                          ? "Click again to confirm deletion"
                          : "Delete document"
                      }
                      onClick={() => handleDeleteDocument(doc.id!, doc.name)}
                      disabled={documentDeleting === doc.id}
                    >
                      {documentDeleting === doc.id ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <RiDeleteBinLine />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="documents-empty">No documents uploaded yet.</div>
          )}
        </div>

        {/* Activity Log Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiCalendarLine /> Activity Log
          </h2>
          <div className="activity-log">
            {mockActivityLog.map((log, idx) => (
              <div className="activity-log-item" key={idx}>
                <div className="activity-log-date">{log.date}</div>
                <div className="activity-log-event">{log.event}</div>
                <div className="activity-log-details">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Map Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiMapPinLine /> Location Map
          </h2>
          <div
            style={{
              width: "100%",
              height: 320,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <iframe
              title="Property Location"
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                property.address.fullAddress || ""
              )}&output=embed`}
            ></iframe>
          </div>
        </div>
        */}

        {/* Gallery Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiHomeLine /> Property Gallery
          </h2>
          <div className="property-gallery">
            {mockGallery.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.alt}
                className="gallery-img"
                style={{
                  width: 160,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginRight: 12,
                  marginBottom: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              />
            ))}
          </div>
        </div>
        */}

        {/* Notes/Tags Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiFileListLine /> Internal Notes & Tags
          </h2>
          <div style={{ marginBottom: 12 }}>
            {mockTags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  background: "#f1c40f",
                  color: "#2c3e50",
                  borderRadius: 12,
                  padding: "4px 12px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  marginRight: 8,
                  marginBottom: 4,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <textarea
            value={mockInternalNotes}
            readOnly
            style={{
              width: "100%",
              minHeight: 60,
              borderRadius: 8,
              border: "1px solid #e1e5e9",
              padding: 10,
              fontSize: "1rem",
              color: "#374151",
              background: "#fffbe6",
            }}
          />
        </div>
        */}
      </div>

      {/* Email Contact Modal */}
      {emailRecipient && (
        <EmailContactModal
          isOpen={showEmailModal}
          onClose={handleCloseEmailModal}
          onSend={handleSendEmail}
          to={emailRecipient.email}
          contactName={emailRecipient.name}
          loading={emailLoading}
          error={emailError}
          success={emailSuccess}
        />
      )}

      {/* Property Logs Modal */}
      <PropertyLogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        propertyId={id || ""}
        propertyAddress={property?.address?.fullAddress || ""}
      />
    </div>
  );
};

export default PropertyProfile;
