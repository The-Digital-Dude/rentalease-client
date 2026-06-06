import type { Invoice, InvoiceDocumentReviewData } from "../services/invoiceService";

export const COMPLETED_JOB_INVOICE_COMPANY = {
  name: "RentalEase Property Services Pty Ltd",
  abn: "63 625 625 872",
  addressLines: ["3/581 Dohertys Road", "Truganina VIC 3029"],
  phone: "03 5906 7723",
  email: "info@rentalease.com.au",
  logoPath: "/rentalease-logo.png",
  tagline: "Property Compliance and Billing",
};

export const COMPLETED_JOB_INVOICE_BANK_DETAILS = {
  accountName: "RENTALEASE Pty Ltd",
  bankName: "CBA",
  bsb: "063779",
  accountNumber: "10578573",
  paymentTerms: "30 Days",
};

export const COMPLETED_JOB_INVOICE_TERMS = [
  "Our work comes with a 24-month workmanship warranty.",
  "No call-out charge applies if a second visit is required within 24 months from the date of work and our workmanship is at fault.",
  "If the issue is not related to our workmanship, call-out and rectification charges will apply and must be paid before fixes are carried out.",
  "If the invoice is not paid within 50 days, the responsibility for payment falls upon the landlord. If the landlord does not pay, the agency is responsible for payment and is legally obligated to do so.",
  "Failure to make payment may result in late payment fees and legal action.",
  "Interest on overdue invoices accrues daily from the due date until payment at a rate of 2.5% per calendar month, compounded monthly at the Contractor's discretion, after as well as before any judgment.",
  "If the Client defaults in payment of any invoice when due for fifty days (50), the Client shall indemnify the Contractor from and against all costs and disbursements incurred in pursuing the debt, including legal costs on a solicitor and own client basis and the Contractor's collection agency costs.",
  "Without prejudice to any other remedies the Contractor may have, if at any time the Client breaches any obligation under these terms and conditions, including payment obligations, the Contractor may suspend or terminate the supply of goods or services and is not liable for loss or damage arising from that action.",
];

const DAYS_TO_PAYMENT = 30;

export const formatInvoiceDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount || 0);

export const addDays = (dateValue: string | Date | null | undefined, days: number) => {
  if (!dateValue) return null;
  const date = typeof dateValue === "string" ? new Date(dateValue) : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date;
};

export const formatAddressLines = (address?: string | null) => {
  if (!address) return ["Address not available"];
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [address.trim()];
  }

  if (parts.length === 2) {
    return parts;
  }

  return [parts.slice(0, -1).join(", "), parts[parts.length - 1]];
};

export const getAttentionName = (reviewData?: InvoiceDocumentReviewData | null) => {
  if (!reviewData) return "Landlord";
  const fromRecipient = reviewData.recipients?.to?.[0]?.name?.trim();
  return (
    reviewData.attentionName?.trim() ||
    fromRecipient ||
    reviewData.agencyName?.trim() ||
    "Landlord"
  );
};

export const getWorksAuthorisedBy = (reviewData?: InvoiceDocumentReviewData | null) => {
  const attentionName = getAttentionName(reviewData);
  return `Works authorised by ${attentionName} on behalf of the Landlord`;
};

export const getReportStatusLabel = (
  reviewData?: InvoiceDocumentReviewData | null,
  job?: { reportFile?: string | null }
) => {
  if (reviewData?.reportSource === "latestInspectionReport") {
    return "Available from latest inspection report";
  }

  if (reviewData?.reportSource === "job") {
    return "Available";
  }

  if (reviewData?.reportFile) {
    return job?.reportFile
      ? "Available"
      : "Available from latest inspection report";
  }

  return "Missing";
};

export const buildInvoiceDisplayDates = (
  invoice: Invoice,
  reviewData?: InvoiceDocumentReviewData | null
) => {
  const invoiceDate = reviewData?.invoiceDate || invoice.createdAt;
  const dueDate = reviewData?.dueDate || addDays(invoiceDate, DAYS_TO_PAYMENT);
  const dueDateValue =
    typeof dueDate === "string" ? dueDate : dueDate?.toISOString?.() || null;

  return {
    invoiceDate,
    dueDate,
    invoiceDateLabel: formatInvoiceDate(invoiceDate),
    dueDateLabel: formatInvoiceDate(dueDateValue),
  };
};

export const buildInvoiceDocumentTitle = (invoiceNumber?: string | null) =>
  invoiceNumber || "Draft";
