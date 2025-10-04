import { jsPDF } from "jspdf";

// Interface for quotation data
export interface QuotationPdfData {
  _id: string;
  quotationNumber: string;
  agency: {
    _id: string;
    companyName?: string;
    email?: string;
    contactPerson?: string;
  } | string;
  jobType: string;
  property: {
    _id: string;
    title: string;
    address: string | {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    };
    fullAddress?: string;
  } | string;
  dueDate: string;
  amount?: number;
  notes?: string;
  validUntil?: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  description: string;
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
  agencyResponse?: {
    responseNotes?: string;
    responseDate?: string;
  };
}

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Helper function to format date with time
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get property address string
const getPropertyAddress = (property: any): string => {
  if (typeof property === 'string') return 'Unknown Property';
  if (!property) return 'Unknown Property';

  if (property.fullAddress) return property.fullAddress;

  if (typeof property.address === 'string') return property.address;

  if (property.address && typeof property.address === 'object') {
    if (property.address.fullAddress) return property.address.fullAddress;
    const { street, suburb, state, postcode } = property.address;
    if (street && suburb && state && postcode) {
      return `${street}, ${suburb}, ${state} ${postcode}`;
    }
  }

  return 'Unknown Property';
};

// Helper function to get agency name
const getAgencyName = (agency: any): string => {
  if (typeof agency === 'string') return 'Unknown Agency';
  if (!agency) return 'Unknown Agency';
  return agency.companyName || agency.contactPerson || agency.email || 'Unknown Agency';
};

// Main PDF generation function
export const generateQuotationPDF = async (quotation: QuotationPdfData): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageMargin = 20;
    const isInvoice = quotation.status === "Accepted";

    // Define colors
    const primaryBlue = hexToRgb("#0f4c75");
    const deepBlue = hexToRgb("#103a5c");
    const softTeal = hexToRgb("#46b48c");
    const textPrimary = hexToRgb("#1f2a36");
    const textMuted = hexToRgb("#6b7280");
    const divider = hexToRgb("#e2e8f0");
    const statusColors = {
      Draft: hexToRgb("#6b7280"),
      Sent: hexToRgb("#3b82f6"),
      Accepted: hexToRgb("#10b981"),
      Rejected: hexToRgb("#ef4444"),
      Expired: hexToRgb("#f59e0b"),
    };

    let currentY = 0;

    // Header with blue background
    doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b);
    doc.rect(0, 0, pageWidth, 65, "F");

    // Company logo placeholder (you can add actual logo here)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("RentalEase", pageMargin, 30, { baseline: "alphabetic" });

    // Document title
    doc.setFontSize(18);
    doc.text(
      isInvoice ? "Beyond Compliance Invoice" : "Beyond Compliance Quotation",
      pageMargin,
      50,
      { baseline: "alphabetic" }
    );

    // Quotation number and status
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${isInvoice ? "Invoice" : "Quotation"} #: ${quotation.quotationNumber}`, pageWidth - pageMargin, 30, {
      align: "right",
    });

    const statusColor = statusColors[quotation.status] || statusColors.Draft;
    doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
    doc.text(`Status: ${quotation.status}`, pageWidth - pageMargin, 45, {
      align: "right",
    });

    currentY = 80;

    // Section: Quotation Details
    doc.setTextColor(textPrimary.r, textPrimary.g, textPrimary.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(isInvoice ? "Invoice Details" : "Quotation Details", pageMargin, currentY);

    currentY += 5;
    doc.setLineWidth(0.5);
    doc.setDrawColor(divider.r, divider.g, divider.b);
    doc.line(pageMargin, currentY, pageWidth - pageMargin, currentY);
    currentY += 15;

    // Agency Information
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Agency:", pageMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(getAgencyName(quotation.agency), pageMargin + 25, currentY);
    currentY += 12;

    // Service Type
    doc.setFont("helvetica", "bold");
    doc.text("Service Type:", pageMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(quotation.jobType, pageMargin + 35, currentY);
    currentY += 12;

    // Property Address
    doc.setFont("helvetica", "bold");
    doc.text("Property:", pageMargin, currentY);
    doc.setFont("helvetica", "normal");
    const propertyAddress = getPropertyAddress(quotation.property);
    const addressLines = doc.splitTextToSize(propertyAddress, pageWidth - pageMargin - 35);
    doc.text(addressLines, pageMargin + 25, currentY);
    currentY += addressLines.length * 6 + 6;

    // Due Date
    doc.setFont("helvetica", "bold");
    doc.text("Due Date:", pageMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(quotation.dueDate), pageMargin + 30, currentY);
    currentY += 12;

    // Created Date
    doc.setFont("helvetica", "bold");
    doc.text("Created:", pageMargin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(quotation.createdAt), pageMargin + 25, currentY);
    currentY += 12;

    // Valid Until (if exists)
    if (quotation.validUntil) {
      doc.setFont("helvetica", "bold");
      doc.text("Valid Until:", pageMargin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(quotation.validUntil), pageMargin + 30, currentY);
      currentY += 12;
    }

    currentY += 10;

    // Section: Service Description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Service Description", pageMargin, currentY);

    currentY += 5;
    doc.line(pageMargin, currentY, pageWidth - pageMargin, currentY);
    currentY += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const descriptionLines = doc.splitTextToSize(quotation.description, pageWidth - 2 * pageMargin);
    doc.text(descriptionLines, pageMargin, currentY);
    currentY += descriptionLines.length * 6 + 15;

    // Section: Pricing (if exists)
    if (quotation.amount && quotation.amount > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Pricing Information", pageMargin, currentY);

      currentY += 5;
      doc.line(pageMargin, currentY, pageWidth - pageMargin, currentY);
      currentY += 15;

      // Amount box
      doc.setFillColor(250, 250, 250);
      doc.rect(pageMargin, currentY, pageWidth - 2 * pageMargin, 25, "F");
      doc.setDrawColor(divider.r, divider.g, divider.b);
      doc.rect(pageMargin, currentY, pageWidth - 2 * pageMargin, 25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(softTeal.r, softTeal.g, softTeal.b);
      doc.text(isInvoice ? "Invoice Amount:" : "Quoted Amount:", pageMargin + 10, currentY + 15);
      doc.text(formatCurrency(quotation.amount), pageWidth - pageMargin - 10, currentY + 15, {
        align: "right",
      });

      currentY += 35;

      // Notes (if exist)
      if (quotation.notes) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(textPrimary.r, textPrimary.g, textPrimary.b);
        doc.text("Additional Notes:", pageMargin, currentY);
        currentY += 10;

        doc.setFont("helvetica", "normal");
        const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - 2 * pageMargin);
        doc.text(notesLines, pageMargin, currentY);
        currentY += notesLines.length * 6 + 15;
      }
    }

    // Section: Agency Response (if exists)
    if (quotation.agencyResponse && quotation.agencyResponse.responseNotes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Agency Response", pageMargin, currentY);

      currentY += 5;
      doc.line(pageMargin, currentY, pageWidth - pageMargin, currentY);
      currentY += 15;

      if (quotation.respondedAt) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Response Date:", pageMargin, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(formatDate(quotation.respondedAt), pageMargin + 40, currentY);
        currentY += 12;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Response Notes:", pageMargin, currentY);
      currentY += 10;

      doc.setFont("helvetica", "normal");
      const responseLines = doc.splitTextToSize(quotation.agencyResponse.responseNotes, pageWidth - 2 * pageMargin);
      doc.text(responseLines, pageMargin, currentY);
      currentY += responseLines.length * 6 + 15;
    }

    // Footer
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 30;
    }

    doc.setDrawColor(divider.r, divider.g, divider.b);
    doc.line(pageMargin, pageHeight - 30, pageWidth - pageMargin, pageHeight - 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
    doc.text("Generated by RentalEase CRM", pageMargin, pageHeight - 20);
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-AU")}`,
      pageWidth - pageMargin,
      pageHeight - 20,
      { align: "right" }
    );

    // Save the PDF
    const documentLabel = isInvoice ? "Invoice" : "Quotation";
    const fileName = `${documentLabel}_${quotation.quotationNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};

// Export helper function for external use
export const downloadQuotationPDF = async (quotationData: QuotationPdfData): Promise<void> => {
  await generateQuotationPDF(quotationData);
};
