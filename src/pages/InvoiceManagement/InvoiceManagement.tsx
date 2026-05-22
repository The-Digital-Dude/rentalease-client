import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdCancel,
  MdCheckCircle,
  MdDelete,
  MdDownload,
  MdEdit,
  MdFilterList,
  MdPendingActions,
  MdReceipt,
  MdSearch,
  MdTrendingUp,
  MdVisibility,
} from "react-icons/md";
import { toast } from "react-toastify";
import Button from "../../components/Button/Button";
import CompletedJobInvoicePreview from "../../components/CompletedJobInvoicePreview/CompletedJobInvoicePreview";
import { InvoiceCreateModal } from "../../components/InvoiceCreateModal/InvoiceCreateModal";
import { InvoiceDetailsModal } from "../../components/InvoiceDetailsModal/InvoiceDetailsModal";
import { InvoiceResponseModal } from "../../components/InvoiceResponseModal/InvoiceResponseModal";
import Modal from "../../components/Modal";
import invoiceService, {
  type Invoice,
  type InvoiceDocumentReviewData,
} from "../../services/invoiceService";
import propertyManagerInvoiceService, {
  type PropertyManagerInvoice,
} from "../../services/propertyManagerInvoiceService";
import propertyService from "../../services/propertyService";
import { useAppSelector } from "../../store";
import { generateCompletedJobInvoicePDF } from "../../utils/completedJobInvoicePdfGenerator";
import "./InvoiceManagement.scss";

interface PropertyOption {
  id: string;
  fullAddress: string;
  assignedPropertyManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  agency?: {
    companyName: string;
    contactPerson: string;
  };
}

interface CompletedInvoiceListItem {
  id: string;
  invoiceNumber: string;
  jobId: Invoice["jobId"];
  technicianId: Invoice["technicianId"];
  agencyId: Invoice["agencyId"];
  description: string;
  totalCost: number;
  status: Invoice["status"];
  createdAt: string;
  sentAt?: string | null;
  paidAt?: string | null;
  updatedAt?: string;
  jobNumber: string;
  jobType: string;
  propertyId: string;
  propertyAddress: string;
  agencyName: string;
  technicianName: string;
}

const formatPropertyAddress = (
  property:
    | {
        _id?: string;
        fullAddress?: string;
        address?: {
          street?: string;
          suburb?: string;
          state?: string;
          postcode?: string;
          fullAddress?: string;
        };
      }
    | null
) => {
  if (!property) {
    return "Unknown Property";
  }

  if (property.fullAddress) {
    return property.fullAddress;
  }

  if (!property.address) {
    return "Unknown Property";
  }

  if (property.address.fullAddress) {
    return property.address.fullAddress;
  }

  const parts = [
    property.address.street,
    property.address.suburb,
    property.address.state,
    property.address.postcode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Unknown Property";
};

interface CompletedInvoiceModalState {
  invoice: Invoice;
  reviewData?: InvoiceDocumentReviewData | null;
  previewJob: {
    job_id: string;
    jobType: string;
    property: {
      address: {
        fullAddress: string;
      };
    };
    agency?: {
      name?: string;
    };
  };
}

interface CompletedInvoicePaymentState {
  paymentMethod: string;
  paymentReference: string;
}

type InvoiceSourceTab = "property-manager" | "completed-job";
type PropertyManagerStatusTab = "pending" | "accepted" | "rejected" | "all";
type CompletedJobStatusTab = "draft" | "sent" | "paid" | "all";
type ActiveStatusTab = PropertyManagerStatusTab | CompletedJobStatusTab;
const INVOICE_STATS_CHANGED_EVENT = "invoice-stats-changed";

const InvoiceManagement: React.FC = () => {
  const { userType } = useAppSelector((state) => state.user);

  const [propertyManagerInvoices, setPropertyManagerInvoices] = useState<
    PropertyManagerInvoice[]
  >([]);
  const [completedInvoices, setCompletedInvoices] = useState<
    CompletedInvoiceListItem[]
  >([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceSource, setInvoiceSource] =
    useState<InvoiceSourceTab>("property-manager");
  const [activeTab, setActiveTab] = useState<ActiveStatusTab>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    property: "",
    propertyManager: "",
    status: "",
  });
  const [selectedInvoice, setSelectedInvoice] =
    useState<PropertyManagerInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedCompletedInvoice, setSelectedCompletedInvoice] =
    useState<CompletedInvoiceModalState | null>(null);
  const [completedInvoiceModalOpen, setCompletedInvoiceModalOpen] =
    useState(false);
  const [completedInvoiceLoadingId, setCompletedInvoiceLoadingId] = useState<
    string | null
  >(null);
  const [completedInvoiceEditorOpen, setCompletedInvoiceEditorOpen] =
    useState(false);
  const [completedInvoiceSaving, setCompletedInvoiceSaving] = useState(false);
  const [completedInvoicePayment, setCompletedInvoicePayment] =
    useState<CompletedInvoicePaymentState>({
      paymentMethod: "Bank Transfer",
      paymentReference: "",
    });

  useEffect(() => {
    const loadInvoiceManagementData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchPropertyManagerInvoices(),
          fetchCompletedInvoices(),
          fetchProperties(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    void loadInvoiceManagementData();
  }, []);

  useEffect(() => {
    setActiveTab(invoiceSource === "property-manager" ? "pending" : "draft");
    setFilters({
      property: "",
      propertyManager: "",
      status: "",
    });
    setSearchTerm("");
  }, [invoiceSource]);

  const fetchPropertyManagerInvoices = async () => {
    try {
      const response =
        await propertyManagerInvoiceService.getAllPropertyManagerInvoices();

      if (response.status === "success" && response.data?.invoices) {
        const mappedInvoices = response.data.invoices.map((invoice: any) => ({
          ...invoice,
          _id: invoice.id || invoice._id,
          propertyId: invoice.propertyId,
          propertyManagerId: invoice.propertyManagerId,
          agencyId: invoice.agencyId,
          property: invoice.property || invoice.propertyId,
          propertyManager:
            invoice.propertyManager !== undefined
              ? invoice.propertyManager
              : invoice.propertyManagerId,
          agency: invoice.agency || invoice.agencyId,
        }));

        setPropertyManagerInvoices(mappedInvoices);
      } else {
        setPropertyManagerInvoices([]);
      }
    } catch (error: any) {
      console.error("Error fetching property manager invoices:", error);
      toast.error(error.message || "Failed to fetch invoices");
      setPropertyManagerInvoices([]);
    }
  };

  const fetchCompletedInvoices = async () => {
    try {
      const response = await invoiceService.getInvoices({
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.status !== "success" || !response.data?.invoices) {
        setCompletedInvoices([]);
        return;
      }

      const mappedInvoices = response.data.invoices.map((invoice) => {
        const job =
          typeof invoice.jobId === "object" && invoice.jobId !== null
            ? invoice.jobId
            : null;
        const property =
          job?.property && typeof job.property === "object" ? job.property : null;
        const agency =
          typeof invoice.agencyId === "object" && invoice.agencyId !== null
            ? invoice.agencyId
            : null;
        const technician =
          typeof invoice.technicianId === "object" &&
          invoice.technicianId !== null
            ? invoice.technicianId
            : null;

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          jobId: invoice.jobId,
          technicianId: invoice.technicianId,
          agencyId: invoice.agencyId,
          description: invoice.description,
          totalCost: invoice.totalCost,
          status: invoice.status,
          createdAt: invoice.createdAt,
          sentAt: invoice.sentAt,
          paidAt: invoice.paidAt,
          updatedAt: invoice.updatedAt,
          jobNumber: job?.job_id || "Unknown Job",
          jobType: job?.jobType || "Unknown Service",
          propertyId: property?._id || "",
          propertyAddress:
            invoice.propertyAddress || formatPropertyAddress(property),
          agencyName:
            agency?.companyName || agency?.contactPerson || "Unknown Agency",
          technicianName: technician
            ? `${technician.firstName || ""} ${technician.lastName || ""}`.trim() ||
              technician.email ||
              "Unassigned"
            : "Unassigned",
        };
      });

      setCompletedInvoices(mappedInvoices);
    } catch (error: any) {
      console.error("Error fetching compliance job invoices:", error);
      toast.error(error.message || "Failed to fetch compliance job invoices");
      setCompletedInvoices([]);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await propertyService.getProperties({ limit: 1000 });
      if (response.status === "success" && response.data.properties) {
        setProperties(
          response.data.properties.map((prop: any) => ({
            id: prop.id,
            fullAddress: prop.fullAddress,
            assignedPropertyManager: prop.assignedPropertyManager,
            agency: prop.agency,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const notifyInvoiceStatsChanged = () => {
    window.dispatchEvent(new Event(INVOICE_STATS_CHANGED_EVENT));
  };

  const getPropertyAddress = useCallback(
    (invoice: PropertyManagerInvoice): string => {
      if (invoice.propertyId && typeof invoice.propertyId === "object") {
        return invoice.propertyId.address?.fullAddress || "Unknown Property";
      }

      const property = invoice.property;
      if (typeof property === "string" || !property) return "Unknown Property";
      if (property.address?.fullAddress) return property.address.fullAddress;
      return property.fullAddress || "Unknown Property";
    },
    []
  );

  const getPropertyManagerName = useCallback(
    (invoice: PropertyManagerInvoice): string => {
      if (
        invoice.propertyManagerId &&
        typeof invoice.propertyManagerId === "object"
      ) {
        const propertyManager = invoice.propertyManagerId;
        return (
          `${propertyManager.firstName || ""} ${
            propertyManager.lastName || ""
          }`.trim() ||
          propertyManager.email ||
          ""
        );
      }

      const propertyManager = invoice.propertyManager;
      if (
        propertyManager &&
        typeof propertyManager === "object" &&
        propertyManager !== null
      ) {
        return (
          `${propertyManager.firstName || ""} ${
            propertyManager.lastName || ""
          }`.trim() ||
          propertyManager.email ||
          ""
        );
      }

      return "";
    },
    []
  );

  const getAgencyContactName = useCallback(
    (invoice: PropertyManagerInvoice): string => {
      if (invoice.agencyId && typeof invoice.agencyId === "object") {
        return (
          invoice.agencyId.contactPerson || invoice.agencyId.companyName || ""
        );
      }

      const agency = invoice.agency;
      if (agency && typeof agency === "object") {
        return (
          agency.contactPerson || agency.companyName || agency.agencyName || ""
        );
      }

      return "";
    },
    []
  );

  const getRecipientLabel = useCallback(
    (invoice: PropertyManagerInvoice) => {
      const propertyManagerName = getPropertyManagerName(invoice);
      if (propertyManagerName) {
        return {
          role: "Property Manager",
          name: propertyManagerName,
        };
      }

      return {
        role: "Agency Contact",
        name: getAgencyContactName(invoice) || "Agency Fallback",
      };
    },
    [getAgencyContactName, getPropertyManagerName]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Accepted":
        return "status-accepted";
      case "Rejected":
        return "status-rejected";
      case "Draft":
        return "status-pending";
      case "Sent":
        return "status-accepted";
      case "Paid":
        return "status-accepted";
      default:
        return "status-pending";
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const propertyManagers = useMemo(
    () =>
      Array.from(
        new Map(
          propertyManagerInvoices
            .filter(
              (invoice) =>
                invoice.propertyManager &&
                typeof invoice.propertyManager === "object"
            )
            .map((invoice: any) => [
              invoice.propertyManager._id,
              {
                id: invoice.propertyManager._id,
                firstName: invoice.propertyManager.firstName,
                lastName: invoice.propertyManager.lastName,
              },
            ])
        ).values()
      ),
    [propertyManagerInvoices]
  );

  const selectedPropertyManagerLabel = useMemo(() => {
    const propertyManager = propertyManagers.find(
      (item) => item.id === filters.propertyManager
    );

    if (!propertyManager) {
      return "Unknown Recipient";
    }

    return `${propertyManager.firstName} ${propertyManager.lastName}`;
  }, [filters.propertyManager, propertyManagers]);

  const propertyManagerTabs = useMemo(
    () => [
      {
        key: "pending" as PropertyManagerStatusTab,
        label: "Pending",
        count: propertyManagerInvoices.filter((invoice) => invoice.status === "Pending")
          .length,
      },
      {
        key: "accepted" as PropertyManagerStatusTab,
        label: "Accepted",
        count: propertyManagerInvoices.filter((invoice) => invoice.status === "Accepted")
          .length,
      },
      {
        key: "rejected" as PropertyManagerStatusTab,
        label: "Rejected",
        count: propertyManagerInvoices.filter((invoice) => invoice.status === "Rejected")
          .length,
      },
      {
        key: "all" as PropertyManagerStatusTab,
        label: "All",
        count: propertyManagerInvoices.length,
      },
    ],
    [propertyManagerInvoices]
  );

  const completedInvoiceTabs = useMemo(
    () => [
      {
        key: "draft" as CompletedJobStatusTab,
        label: "Draft",
        count: completedInvoices.filter((invoice) => invoice.status === "Draft").length,
      },
      {
        key: "sent" as CompletedJobStatusTab,
        label: "Sent",
        count: completedInvoices.filter((invoice) => invoice.status === "Sent").length,
      },
      {
        key: "paid" as CompletedJobStatusTab,
        label: "Paid",
        count: completedInvoices.filter((invoice) => invoice.status === "Paid").length,
      },
      {
        key: "all" as CompletedJobStatusTab,
        label: "All",
        count: completedInvoices.length,
      },
    ],
    [completedInvoices]
  );

  const filteredPropertyManagerInvoices = useMemo(() => {
    let filtered = [...propertyManagerInvoices];

    switch (activeTab as PropertyManagerStatusTab) {
      case "pending":
        filtered = filtered.filter((invoice) => invoice.status === "Pending");
        break;
      case "accepted":
        filtered = filtered.filter((invoice) => invoice.status === "Accepted");
        break;
      case "rejected":
        filtered = filtered.filter((invoice) => invoice.status === "Rejected");
        break;
      default:
        break;
    }

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((invoice) => {
        const recipient = getRecipientLabel(invoice);
        return (
          getPropertyAddress(invoice).toLowerCase().includes(normalizedSearch) ||
          invoice.description.toLowerCase().includes(normalizedSearch) ||
          recipient.name.toLowerCase().includes(normalizedSearch) ||
          invoice.invoiceNumber.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    if (filters.property) {
      filtered = filtered.filter((invoice) => {
        const propertyId =
          invoice.propertyId && typeof invoice.propertyId === "object"
            ? invoice.propertyId._id
            : typeof invoice.property === "object"
            ? invoice.property._id
            : invoice.property;
        return propertyId === filters.property;
      });
    }

    if (filters.propertyManager) {
      filtered = filtered.filter((invoice) => {
        const propertyManagerId =
          invoice.propertyManagerId && typeof invoice.propertyManagerId === "object"
            ? invoice.propertyManagerId._id
            : typeof invoice.propertyManager === "object"
            ? invoice.propertyManager?._id
            : invoice.propertyManager;
        return propertyManagerId === filters.propertyManager;
      });
    }

    return filtered;
  }, [
    activeTab,
    filters.property,
    filters.propertyManager,
    getPropertyAddress,
    getRecipientLabel,
    propertyManagerInvoices,
    searchTerm,
  ]);

  const filteredCompletedInvoices = useMemo(() => {
    let filtered = [...completedInvoices];

    switch (activeTab as CompletedJobStatusTab) {
      case "draft":
        filtered = filtered.filter((invoice) => invoice.status === "Draft");
        break;
      case "sent":
        filtered = filtered.filter((invoice) => invoice.status === "Sent");
        break;
      case "paid":
        filtered = filtered.filter((invoice) => invoice.status === "Paid");
        break;
      default:
        break;
    }

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((invoice) => {
        return (
          invoice.invoiceNumber.toLowerCase().includes(normalizedSearch) ||
          invoice.description.toLowerCase().includes(normalizedSearch) ||
          invoice.jobNumber.toLowerCase().includes(normalizedSearch) ||
          invoice.jobType.toLowerCase().includes(normalizedSearch) ||
          invoice.propertyAddress.toLowerCase().includes(normalizedSearch) ||
          invoice.agencyName.toLowerCase().includes(normalizedSearch) ||
          invoice.technicianName.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    if (filters.property) {
      filtered = filtered.filter(
        (invoice) => invoice.propertyId === filters.property
      );
    }

    return filtered;
  }, [activeTab, completedInvoices, filters.property, searchTerm]);

  const activePropertyManagerStats = useMemo(
    () => ({
      totalInvoices: propertyManagerInvoices.length,
      pendingInvoices: propertyManagerInvoices.filter((invoice) => invoice.status === "Pending")
        .length,
      acceptedInvoices: propertyManagerInvoices.filter((invoice) => invoice.status === "Accepted")
        .length,
      rejectedInvoices: propertyManagerInvoices.filter((invoice) => invoice.status === "Rejected")
        .length,
      totalValue: propertyManagerInvoices.reduce(
        (sum, invoice) => sum + (invoice.amount || 0),
        0
      ),
      acceptedValue: propertyManagerInvoices
        .filter((invoice) => invoice.status === "Accepted")
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
      pendingValue: propertyManagerInvoices
        .filter((invoice) => invoice.status === "Pending")
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
      rejectedValue: propertyManagerInvoices
        .filter((invoice) => invoice.status === "Rejected")
        .reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
    }),
    [propertyManagerInvoices]
  );

  const completedInvoiceStats = useMemo(
    () => ({
      totalInvoices: completedInvoices.length,
      draftCount: completedInvoices.filter((invoice) => invoice.status === "Draft")
        .length,
      sentCount: completedInvoices.filter((invoice) => invoice.status === "Sent")
        .length,
      paidCount: completedInvoices.filter((invoice) => invoice.status === "Paid")
        .length,
      draftValue: completedInvoices
        .filter((invoice) => invoice.status === "Draft")
        .reduce((sum, invoice) => sum + (invoice.totalCost || 0), 0),
      sentValue: completedInvoices
        .filter((invoice) => invoice.status === "Sent")
        .reduce((sum, invoice) => sum + (invoice.totalCost || 0), 0),
      paidValue: completedInvoices
        .filter((invoice) => invoice.status === "Paid")
        .reduce((sum, invoice) => sum + (invoice.totalCost || 0), 0),
      totalValue: completedInvoices.reduce(
        (sum, invoice) => sum + (invoice.totalCost || 0),
        0
      ),
    }),
    [completedInvoices]
  );

  const handleDeleteInvoice = async (invoice: PropertyManagerInvoice) => {
    if (
      !window.confirm(
        `Are you sure you want to delete invoice ${invoice.invoiceNumber}?`
      )
    ) {
      return;
    }

    try {
      await propertyManagerInvoiceService.deletePropertyManagerInvoice(
        invoice._id || invoice.id || ""
      );
      toast.success("Invoice deleted successfully");
      await fetchPropertyManagerInvoices();
      notifyInvoiceStatsChanged();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete invoice");
    }
  };

  const handleViewCompletedInvoice = async (invoiceId: string) => {
    try {
      setCompletedInvoiceLoadingId(invoiceId);
      const response = await invoiceService.getInvoiceById(invoiceId);
      const invoice = response.data.invoice;
      const reviewData = response.data.reviewData;

      const job =
        typeof invoice.jobId === "object" && invoice.jobId !== null
          ? invoice.jobId
          : null;
      const property =
        job?.property && typeof job.property === "object" ? job.property : null;
      const agency =
        typeof invoice.agencyId === "object" && invoice.agencyId !== null
          ? invoice.agencyId
          : null;

      setSelectedCompletedInvoice({
        invoice,
        reviewData,
        previewJob: {
          job_id: job?.job_id || reviewData?.jobNumber || "Unknown Job",
          jobType: job?.jobType || reviewData?.jobType || "Unknown Service",
          property: {
            address: {
              fullAddress:
                property?.address?.fullAddress ||
                reviewData?.propertyAddress ||
                "Unknown Property",
            },
          },
          agency: {
            name:
              reviewData?.agencyName ||
              agency?.companyName ||
              agency?.contactPerson ||
              "",
          },
        },
      });
      setCompletedInvoiceEditorOpen(false);
      setCompletedInvoicePayment({
        paymentMethod: invoice.paymentMethod || "Bank Transfer",
        paymentReference: invoice.paymentReference || "",
      });
      setCompletedInvoiceModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to load compliance job invoice");
    } finally {
      setCompletedInvoiceLoadingId(null);
    }
  };

  const handleDownloadCompletedInvoice = async () => {
    if (!selectedCompletedInvoice) return;

    const { invoice, reviewData, previewJob } = selectedCompletedInvoice;

    await generateCompletedJobInvoicePDF({
      invoice,
      jobNumber: reviewData?.jobNumber || previewJob.job_id,
      jobType: reviewData?.jobType || previewJob.jobType,
      propertyAddress:
        reviewData?.propertyAddress || previewJob.property.address.fullAddress,
      agencyName: reviewData?.agencyName || previewJob.agency?.name || "",
      hasReport: reviewData?.hasReport ?? false,
    });
  };

  const updateCompletedInvoiceDraft = (
    updater: (current: Invoice) => Invoice
  ) => {
    setSelectedCompletedInvoice((current) => {
      if (!current) return current;
      return {
        ...current,
        invoice: updater(current.invoice),
      };
    });
  };

  const updateCompletedInvoiceItem = (
    itemIndex: number,
    field: "name" | "quantity" | "rate",
    value: string
  ) => {
    updateCompletedInvoiceDraft((currentInvoice) => {
      const nextItems = currentInvoice.items.map((item, index) => {
        if (index !== itemIndex) return item;
        const updated = {
          ...item,
          [field]: field === "name" ? value : Number(value),
        };
        updated.amount = Number(updated.quantity) * Number(updated.rate);
        return updated;
      });

      const subtotal = nextItems.reduce((sum, item) => sum + item.amount, 0);

      return {
        ...currentInvoice,
        items: nextItems,
        subtotal,
        totalCost: subtotal + Number(currentInvoice.tax || 0),
      };
    });
  };

  const handleSaveCompletedInvoice = async () => {
    if (!selectedCompletedInvoice) return;

    try {
      setCompletedInvoiceSaving(true);
      const { invoice } = selectedCompletedInvoice;
      const response = await invoiceService.updateInvoice(invoice.id, {
        description: invoice.description,
        items: invoice.items.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
        tax: Number(invoice.tax || 0),
        notes: invoice.notes || "",
      });

      setSelectedCompletedInvoice((current) =>
        current
          ? {
              ...current,
              invoice: response.data.invoice,
            }
          : current
      );
      setCompletedInvoiceEditorOpen(false);
      await fetchCompletedInvoices();
      notifyInvoiceStatsChanged();
      toast.success("Invoice updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoice");
    } finally {
      setCompletedInvoiceSaving(false);
    }
  };

  const handleMarkCompletedInvoicePaid = async () => {
    if (!selectedCompletedInvoice) return;

    try {
      setCompletedInvoiceSaving(true);
      const response = await invoiceService.updateInvoiceStatus(
        selectedCompletedInvoice.invoice.id,
        {
          status: "Paid",
          paymentMethod: completedInvoicePayment.paymentMethod || "Other",
          paymentReference: completedInvoicePayment.paymentReference,
        }
      );

      setSelectedCompletedInvoice((current) =>
        current
          ? {
              ...current,
              invoice: response.data.invoice,
              reviewData: response.data.reviewData || current.reviewData,
            }
          : current
      );
      await fetchCompletedInvoices();
      notifyInvoiceStatsChanged();
      toast.success("Invoice marked as paid");
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoice status");
    } finally {
      setCompletedInvoiceSaving(false);
    }
  };

  const sourceTabs = [
    {
      key: "property-manager" as InvoiceSourceTab,
      label: "Extra Services Invoices",
      count: propertyManagerInvoices.length,
    },
    {
      key: "completed-job" as InvoiceSourceTab,
      label: "Compliance Job Invoices",
      count: completedInvoices.length,
    },
  ];

  const visibleStatusTabs =
    invoiceSource === "property-manager"
      ? propertyManagerTabs
      : completedInvoiceTabs;

  const filteredInvoices =
    invoiceSource === "property-manager"
      ? filteredPropertyManagerInvoices
      : filteredCompletedInvoices;

  const statCards =
    invoiceSource === "property-manager"
      ? [
          {
            key: "total",
            icon: <MdReceipt />,
            value: activePropertyManagerStats.totalInvoices,
            label: "Total Invoices",
          },
          {
            key: "pending",
            icon: <MdPendingActions />,
            value: formatCurrency(activePropertyManagerStats.pendingValue),
            label: `${activePropertyManagerStats.pendingInvoices} Pending`,
          },
          {
            key: "accepted",
            icon: <MdCheckCircle />,
            value: formatCurrency(activePropertyManagerStats.acceptedValue),
            label: `${activePropertyManagerStats.acceptedInvoices} Accepted`,
          },
          {
            key: "rejected",
            icon: <MdCancel />,
            value: formatCurrency(activePropertyManagerStats.rejectedValue),
            label: `${activePropertyManagerStats.rejectedInvoices} Rejected`,
          },
          {
            key: "value",
            icon: <MdTrendingUp />,
            value: formatCurrency(activePropertyManagerStats.totalValue),
            label: "Total Value",
            highlight: true,
          },
        ]
      : [
          {
            key: "total",
            icon: <MdReceipt />,
            value: completedInvoiceStats.totalInvoices,
            label: "Total Invoices",
          },
          {
            key: "draft",
            icon: <MdPendingActions />,
            value: formatCurrency(completedInvoiceStats.draftValue),
            label: `${completedInvoiceStats.draftCount} Draft`,
          },
          {
            key: "sent",
            icon: <MdCheckCircle />,
            value: formatCurrency(completedInvoiceStats.sentValue),
            label: `${completedInvoiceStats.sentCount} Sent`,
          },
          {
            key: "paid",
            icon: <MdCheckCircle />,
            value: formatCurrency(completedInvoiceStats.paidValue),
            label: `${completedInvoiceStats.paidCount} Paid`,
          },
          {
            key: "value",
            icon: <MdTrendingUp />,
            value: formatCurrency(completedInvoiceStats.totalValue),
            label: "Total Value",
            highlight: true,
          },
        ];

  if (loading) {
    return (
      <div className="invoice-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading invoice management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-management">
      <div className="page-header">
        <div className="header-content">
          <div>
            <div className="header-title">
              <MdReceipt className="page-icon" />
              <h1>Invoice Management</h1>
            </div>
            <p className="header-subtitle">
              {invoiceSource === "property-manager"
                ? userType === "agency"
                  ? "View invoices for property managers and agency fallback recipients"
                  : "Create and manage invoices for property managers and agency fallback recipients"
                : "Review compliance job invoices generated from the main invoice system"}
            </p>
          </div>
          {invoiceSource === "property-manager" &&
            (userType === "super_user" || userType === "team_member") && (
              <Button
                variant="primary"
                size="lg"
                leftIcon={<MdAdd />}
                className="create-invoice-btn"
                onClick={() => {
                  setSelectedInvoice(null);
                  setShowCreateModal(true);
                }}
              >
                Create Invoice
              </Button>
            )}
        </div>
      </div>

      <div className="source-tabs-container">
        {sourceTabs.map((tab) => (
          <button
            key={tab.key}
            className={`source-tab-button ${
              invoiceSource === tab.key ? "active" : ""
            }`}
            onClick={() => setInvoiceSource(tab.key)}
            type="button"
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-stats">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`stat-card ${card.highlight ? "highlight" : ""}`}
          >
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="invoice-filters-panel">
        <div className="search-filter-toolbar">
          <div className="search-section">
            <div className="search-input-container">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder={
                  invoiceSource === "property-manager"
                    ? "Search extra services invoices..."
                    : "Search compliance job invoices..."
                }
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-controls">
              <select
                value={filters.property}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    property: event.target.value,
                  }))
                }
                className="compact-filter-select"
              >
                <option value="">All Properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.fullAddress}
                  </option>
                ))}
              </select>

              {invoiceSource === "property-manager" && (
                <select
                  value={filters.propertyManager}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      propertyManager: event.target.value,
                    }))
                  }
                  className="compact-filter-select"
                >
                  <option value="">All Recipients</option>
                  {propertyManagers.map((propertyManager) => (
                    <option key={propertyManager.id} value={propertyManager.id}>
                      {`${propertyManager.firstName} ${propertyManager.lastName}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {(searchTerm || filters.property || filters.propertyManager) && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<MdCancel />}
                className="clear-all-btn"
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    property: "",
                    propertyManager: "",
                    status: "",
                  });
                }}
                title="Clear all filters"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {(searchTerm || filters.property || filters.propertyManager) && (
          <div className="active-filters-row">
            {searchTerm && (
              <span className="filter-chip">
                <MdSearch className="chip-icon" />
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="chip-remove"
                  type="button"
                >
                  <MdCancel />
                </button>
              </span>
            )}
            {filters.property && (
              <span className="filter-chip">
                <MdFilterList className="chip-icon" />
                {properties.find((property) => property.id === filters.property)
                  ?.fullAddress || "Unknown Property"}
                <button
                  onClick={() =>
                    setFilters((current) => ({ ...current, property: "" }))
                  }
                  className="chip-remove"
                  type="button"
                >
                  <MdCancel />
                </button>
              </span>
            )}
            {invoiceSource === "property-manager" && filters.propertyManager && (
              <span className="filter-chip">
                <MdFilterList className="chip-icon" />
                {selectedPropertyManagerLabel}
                <button
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      propertyManager: "",
                    }))
                  }
                  className="chip-remove"
                  type="button"
                >
                  <MdCancel />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="tabs-container">
        {visibleStatusTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="invoices-table-container">
        <div className="table-header">
          <h3>
            {visibleStatusTabs.find((tab) => tab.key === activeTab)?.label}
            <span className="count">({filteredInvoices.length})</span>
          </h3>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <MdReceipt className="empty-icon" />
            <h3>No invoices found</h3>
            <p>
              {invoiceSource === "property-manager"
                ? "No extra services invoices match the current filters."
                : "No compliance job invoices match the current filters."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            {invoiceSource === "property-manager" ? (
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Property</th>
                    <th>Recipient</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPropertyManagerInvoices.map((invoice) => {
                    const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                    const isOverdue = daysUntilDue < 0;
                    const recipient = getRecipientLabel(invoice);

                    return (
                      <tr
                        key={invoice._id || invoice.id}
                        className={
                          isOverdue && invoice.status === "Pending"
                            ? "overdue-row"
                            : ""
                        }
                      >
                        <td className="invoice-number">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="property-cell">
                          <div className="property-info">
                            <span className="property-address">
                              {getPropertyAddress(invoice)}
                            </span>
                          </div>
                        </td>
                        <td className="property-manager-cell">
                          <div className="property-manager-info">
                            <span className="property-manager-name">
                              {recipient.name}
                            </span>
                            <small className="property-manager-role">
                              {recipient.role}
                            </small>
                          </div>
                        </td>
                        <td className="description">
                          {invoice.description.length > 50
                            ? `${invoice.description.substring(0, 50)}...`
                            : invoice.description}
                        </td>
                        <td className="amount">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td
                          className={`due-date ${
                            isOverdue && invoice.status === "Pending"
                              ? "overdue"
                              : ""
                          }`}
                        >
                          <div className="date-info">
                            <span>{formatDate(invoice.dueDate)}</span>
                            <small>
                              {daysUntilDue >= 0 ? `${daysUntilDue} days` : "Overdue"}
                            </small>
                          </div>
                        </td>
                        <td className="status">
                          <span
                            className={`status-badge ${getStatusColor(invoice.status)}`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="created-date">
                          {formatDate(invoice.createdAt)}
                        </td>
                        <td className="actions">
                          <div className="action-buttons">
                            <Button
                              variant="outline"
                              size="sm"
                              iconOnly
                              className="action-btn view-btn"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowDetailsModal(true);
                              }}
                              title="View Details"
                              aria-label="View Details"
                            >
                              <MdVisibility />
                            </Button>
                            {userType === "property_manager" && (
                              <Button
                                variant="success"
                                size="sm"
                                iconOnly
                                className="action-btn status-btn"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowResponseModal(true);
                                }}
                                title="Update Status"
                                aria-label="Update Status"
                              >
                                <MdCheckCircle />
                              </Button>
                            )}
                            {(userType === "super_user" ||
                              userType === "team_member") && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  iconOnly
                                  className="action-btn edit-btn"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setShowCreateModal(true);
                                  }}
                                  title={
                                    invoice.status === "Accepted" ||
                                    invoice.status === "Rejected"
                                      ? "Cannot edit accepted or rejected invoices"
                                      : "Edit Invoice"
                                  }
                                  aria-label="Edit Invoice"
                                  disabled={
                                    invoice.status === "Accepted" ||
                                    invoice.status === "Rejected"
                                  }
                                >
                                  <MdEdit />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  iconOnly
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteInvoice(invoice)}
                                  title={
                                    invoice.status === "Accepted" ||
                                    invoice.status === "Rejected"
                                      ? "Cannot delete accepted or rejected invoices"
                                      : "Delete Invoice"
                                  }
                                  aria-label="Delete Invoice"
                                  disabled={
                                    invoice.status === "Accepted" ||
                                    invoice.status === "Rejected"
                                  }
                                >
                                  <MdDelete />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Job</th>
                    <th>Property</th>
                    <th>Agency</th>
                    <th>Description</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompletedInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="invoice-number">{invoice.invoiceNumber}</td>
                      <td className="property-manager-cell">
                        <div className="property-manager-info">
                          <span className="property-manager-name">
                            {invoice.jobNumber}
                          </span>
                          <small className="property-manager-role">
                            {invoice.jobType}
                          </small>
                        </div>
                      </td>
                      <td className="property-cell">
                        <div className="property-info">
                          <span className="property-address">
                            {invoice.propertyAddress}
                          </span>
                        </div>
                      </td>
                      <td className="property-manager-cell">
                        <div className="property-manager-info">
                          <span className="property-manager-name">
                            {invoice.agencyName}
                          </span>
                          <small className="property-manager-role">
                            {invoice.technicianName}
                          </small>
                        </div>
                      </td>
                      <td className="description">
                        {invoice.description.length > 50
                          ? `${invoice.description.substring(0, 50)}...`
                          : invoice.description}
                      </td>
                      <td className="amount">
                        {formatCurrency(invoice.totalCost)}
                      </td>
                      <td className="status">
                        <span
                          className={`status-badge ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="created-date">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="actions">
                        <div className="action-buttons">
                          <Button
                            variant="outline"
                            size="sm"
                            iconOnly
                            className="action-btn view-btn"
                            onClick={() => handleViewCompletedInvoice(invoice.id)}
                            title="View Invoice"
                            aria-label="View Invoice"
                            disabled={completedInvoiceLoadingId === invoice.id}
                          >
                            <MdVisibility />
                          </Button>
                          {(userType === "super_user" ||
                            userType === "team_member") && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                iconOnly
                                className="action-btn edit-btn"
                                onClick={async () => {
                                  await handleViewCompletedInvoice(invoice.id);
                                  setCompletedInvoiceEditorOpen(true);
                                }}
                                title={
                                  invoice.status === "Sent" ||
                                  invoice.status === "Paid"
                                    ? "Sent or paid invoices cannot be edited"
                                    : "Edit Invoice"
                                }
                                aria-label="Edit Invoice"
                                disabled={
                                  completedInvoiceLoadingId === invoice.id ||
                                  invoice.status === "Sent" ||
                                  invoice.status === "Paid"
                                }
                              >
                                <MdEdit />
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                iconOnly
                                className="action-btn status-btn"
                                onClick={async () => {
                                  await handleViewCompletedInvoice(invoice.id);
                                }}
                                title={
                                  invoice.status === "Paid"
                                    ? "Invoice is already paid"
                                    : "Mark as Paid"
                                }
                                aria-label="Mark as Paid"
                                disabled={
                                  completedInvoiceLoadingId === invoice.id ||
                                  invoice.status === "Paid"
                                }
                              >
                                <MdCheckCircle />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <InvoiceCreateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => {
          void fetchPropertyManagerInvoices();
          notifyInvoiceStatsChanged();
        }}
        invoice={selectedInvoice}
      />

      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedInvoice(null);
        }}
      />

      <InvoiceResponseModal
        invoice={selectedInvoice}
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => {
          void fetchPropertyManagerInvoices();
          notifyInvoiceStatsChanged();
        }}
      />

      <Modal
        isOpen={completedInvoiceModalOpen}
        onClose={() => {
          setCompletedInvoiceModalOpen(false);
          setSelectedCompletedInvoice(null);
        }}
        title="Compliance Job Invoice"
        size="large"
      >
        {selectedCompletedInvoice && (
          <div className="completed-invoice-modal">
            <div className="completed-invoice-modal-actions">
              {(userType === "super_user" || userType === "team_member") && (
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<MdEdit />}
                  className="create-invoice-btn secondary-action"
                  onClick={() =>
                    setCompletedInvoiceEditorOpen((current) => !current)
                  }
                  disabled={
                    selectedCompletedInvoice.invoice.status === "Sent" ||
                    selectedCompletedInvoice.invoice.status === "Paid"
                  }
                >
                  {completedInvoiceEditorOpen ? "Close Editor" : "Edit Invoice"}
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                leftIcon={<MdDownload />}
                className="create-invoice-btn"
                onClick={() => void handleDownloadCompletedInvoice()}
              >
                Download Invoice
              </Button>
            </div>
            {(userType === "super_user" || userType === "team_member") && (
              <div className="completed-invoice-management-card">
                <div className="management-card-header">
                  <div>
                    <h4>Invoice Actions</h4>
                    <p>
                      Edit draft invoices, then mark them paid when
                      payment is received.
                    </p>
                  </div>
                  <span
                    className={`status-badge ${getStatusColor(
                      selectedCompletedInvoice.invoice.status
                    )}`}
                  >
                    {selectedCompletedInvoice.invoice.status}
                  </span>
                </div>

                {completedInvoiceEditorOpen && (
                  <div className="completed-invoice-editor">
                    <label>
                      <span>Description</span>
                      <textarea
                        value={selectedCompletedInvoice.invoice.description}
                        onChange={(event) =>
                          updateCompletedInvoiceDraft((invoice) => ({
                            ...invoice,
                            description: event.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </label>

                    <div className="editor-items">
                      {selectedCompletedInvoice.invoice.items.map((item, index) => (
                        <div
                          key={item._id || item.id || index}
                          className="editor-item-row"
                        >
                          <label className="editor-field editor-field-name">
                            <span>Item</span>
                            <input
                              value={item.name}
                              onChange={(event) =>
                                updateCompletedInvoiceItem(
                                  index,
                                  "name",
                                  event.target.value
                                )
                              }
                            />
                          </label>
                          <label className="editor-field">
                            <span>Qty</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateCompletedInvoiceItem(
                                  index,
                                  "quantity",
                                  event.target.value
                                )
                              }
                            />
                          </label>
                          <label className="editor-field">
                            <span>Rate</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(event) =>
                                updateCompletedInvoiceItem(
                                  index,
                                  "rate",
                                  event.target.value
                                )
                              }
                            />
                          </label>
                          <label className="editor-field">
                            <span>Amount</span>
                            <input type="number" value={item.amount} readOnly />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="editor-financials">
                      <label>
                        <span>Tax</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={selectedCompletedInvoice.invoice.tax}
                          onChange={(event) => {
                            const tax = Number(event.target.value || 0);
                            updateCompletedInvoiceDraft((invoice) => ({
                              ...invoice,
                              tax,
                              totalCost: Number(invoice.subtotal || 0) + tax,
                            }));
                          }}
                        />
                      </label>
                      <label>
                        <span>Notes</span>
                        <textarea
                          value={selectedCompletedInvoice.invoice.notes || ""}
                          onChange={(event) =>
                            updateCompletedInvoiceDraft((invoice) => ({
                              ...invoice,
                              notes: event.target.value,
                            }))
                          }
                          rows={3}
                        />
                      </label>
                    </div>

                    <div className="editor-actions">
                      <Button
                        variant="primary"
                        onClick={() => void handleSaveCompletedInvoice()}
                        disabled={completedInvoiceSaving}
                      >
                        Save Invoice
                      </Button>
                    </div>
                  </div>
                )}

                {selectedCompletedInvoice.invoice.status !== "Paid" && (
                  <div className="completed-invoice-payment-panel">
                    <label>
                      <span>Payment Method</span>
                      <select
                        value={completedInvoicePayment.paymentMethod}
                        onChange={(event) =>
                          setCompletedInvoicePayment((current) => ({
                            ...current,
                            paymentMethod: event.target.value,
                          }))
                        }
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Cash">Cash</option>
                        <option value="Check">Check</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label>
                      <span>Payment Reference</span>
                      <input
                        type="text"
                        value={completedInvoicePayment.paymentReference}
                        onChange={(event) =>
                          setCompletedInvoicePayment((current) => ({
                            ...current,
                            paymentReference: event.target.value,
                          }))
                        }
                        placeholder="Optional receipt or transfer reference"
                      />
                    </label>
                    <Button
                      variant="success"
                      leftIcon={<MdCheckCircle />}
                      onClick={() => void handleMarkCompletedInvoicePaid()}
                      disabled={completedInvoiceSaving}
                    >
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </div>
            )}
            <CompletedJobInvoicePreview
              invoice={selectedCompletedInvoice.invoice}
              job={selectedCompletedInvoice.previewJob}
              reviewData={selectedCompletedInvoice.reviewData}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceManagement;
