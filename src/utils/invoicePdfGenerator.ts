import jsPDF from "jspdf";
import type { PropertyManagerInvoice } from "../services/propertyManagerInvoiceService";

export const generateInvoicePDF = (invoice: PropertyManagerInvoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number = 7
  ): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to get property address
  const getPropertyAddress = () => {
    if (invoice.propertyId && typeof invoice.propertyId === "object") {
      return invoice.propertyId.address?.fullAddress || "Unknown Property";
    }
    if (invoice.property && typeof invoice.property === "object") {
      if (invoice.property.address?.fullAddress) {
        return invoice.property.address.fullAddress;
      }
      return invoice.property.fullAddress || "Unknown Property";
    }
    return "Unknown Property";
  };

  // Helper function to get property manager name
  const getPropertyManagerName = () => {
    if (
      invoice.propertyManagerId &&
      typeof invoice.propertyManagerId === "object"
    ) {
      const pm = invoice.propertyManagerId;
      return (
        `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
      );
    }
    if (invoice.propertyId && typeof invoice.propertyId === "object") {
      const property = invoice.propertyId as any;
      if (property.assignedPropertyManager) {
        const pm = property.assignedPropertyManager;
        return (
          `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
        );
      }
    }
    if (
      invoice.propertyManager &&
      typeof invoice.propertyManager === "object"
    ) {
      const pm = invoice.propertyManager;
      return (
        `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
      );
    }
    if (invoice.property && typeof invoice.property === "object") {
      if (invoice.property.assignedPropertyManager) {
        const pm = invoice.property.assignedPropertyManager;
        return (
          `${pm.firstName || ""} ${pm.lastName || ""}`.trim() || pm.email || ""
        );
      }
    }
    return "";
  };

  // Helper function to get property manager email
  const getPropertyManagerEmail = () => {
    if (
      invoice.propertyManagerId &&
      typeof invoice.propertyManagerId === "object"
    ) {
      return invoice.propertyManagerId.email || "";
    }
    if (invoice.propertyId && typeof invoice.propertyId === "object") {
      const property = invoice.propertyId as any;
      if (property.assignedPropertyManager) {
        return property.assignedPropertyManager.email || "";
      }
    }
    if (
      invoice.propertyManager &&
      typeof invoice.propertyManager === "object"
    ) {
      return invoice.propertyManager.email || "";
    }
    if (invoice.property && typeof invoice.property === "object") {
      if (invoice.property.assignedPropertyManager) {
        return invoice.property.assignedPropertyManager.email || "";
      }
    }
    return "";
  };

  // Get agency name
  const getAgencyName = () => {
    if (invoice.agencyId && typeof invoice.agencyId === "object") {
      return invoice.agencyId.companyName || "";
    }
    if (invoice.agency && typeof invoice.agency === "object") {
      return (invoice.agency as any).agencyName || (invoice.agency as any).companyName || "";
    }
    return "";
  };

  // Get status color
  const getStatusColor = (status: string): [number, number, number] => {
    switch (status) {
      case "Pending":
        return [217, 119, 6]; // Orange
      case "Accepted":
        return [22, 101, 52]; // Green
      case "Rejected":
        return [220, 38, 38]; // Red
      case "Sent":
        return [29, 78, 216]; // Blue
      case "Paid":
        return [22, 101, 52]; // Green
      default:
        return [100, 116, 139]; // Gray
    }
  };

  // ===== HEADER SECTION =====
  // Blue header background
  doc.setFillColor(14, 73, 115); // Dark blue color similar to the image
  doc.rect(0, 0, pageWidth, 60, "F");

  // RentalEase logo/title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("RentalEase", margin, 25);

  // Invoice number (right side of header)
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const invoiceText = `Invoice #: ${invoice.invoiceNumber}`;
  const invoiceTextWidth = doc.getTextWidth(invoiceText);
  doc.text(invoiceText, pageWidth - margin - invoiceTextWidth, 25);

  // Subtitle
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Property Manager Invoice", margin, 42);

  // Status badge (right side)
  const statusColor = getStatusColor(invoice.status);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const statusText = `Status: ${invoice.status}`;
  const statusTextWidth = doc.getTextWidth(statusText);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusText, pageWidth - margin - statusTextWidth, 42);

  yPosition = 75;

  // ===== INVOICE DETAILS SECTION =====
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", margin, yPosition);
  yPosition += 3;

  // Divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Details in two columns
  const labelX = margin;
  const valueX = margin + 35;
  const col2LabelX = pageWidth / 2 + 10;
  const col2ValueX = col2LabelX + 35;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);

  // Left column
  const agencyName = getAgencyName();
  if (agencyName) {
    doc.text("Agency:", labelX, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(agencyName, valueX, yPosition);
  }

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text("Property:", col2LabelX, yPosition);
  doc.setFont("helvetica", "normal");
  const propertyAddress = getPropertyAddress();
  const wrappedProperty = doc.splitTextToSize(propertyAddress, pageWidth - col2ValueX - margin);
  doc.text(wrappedProperty[0], col2ValueX, yPosition);
  yPosition += 7;

  // Property Manager
  const pmName = getPropertyManagerName();
  if (pmName) {
    doc.setFont("helvetica", "bold");
    doc.text("Manager:", labelX, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(pmName, valueX, yPosition);
  }

  // Due Date
  doc.setFont("helvetica", "bold");
  doc.text("Due Date:", col2LabelX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice.dueDate), col2ValueX, yPosition);
  yPosition += 7;

  // Created Date
  doc.setFont("helvetica", "bold");
  doc.text("Created:", labelX, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice.createdAt), valueX, yPosition);

  // Manager Email
  const pmEmail = getPropertyManagerEmail();
  if (pmEmail) {
    doc.setFont("helvetica", "bold");
    doc.text("Email:", col2LabelX, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(14, 73, 115);
    doc.text(pmEmail, col2ValueX, yPosition);
    doc.setTextColor(0, 0, 0);
  }

  yPosition += 15;

  // ===== SERVICE DESCRIPTION SECTION =====
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Service Description", margin, yPosition);
  yPosition += 3;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  yPosition = addWrappedText(
    invoice.description,
    margin,
    yPosition,
    pageWidth - 2 * margin,
    6
  );

  yPosition += 15;

  // ===== NOTES SECTION (if exists) =====
  if (invoice.notes && invoice.notes.trim()) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Additional Notes", margin, yPosition);
    yPosition += 3;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    yPosition = addWrappedText(
      invoice.notes,
      margin,
      yPosition,
      pageWidth - 2 * margin,
      6
    );

    yPosition += 15;
  }

  // ===== PRICING INFORMATION SECTION =====
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Pricing Information", margin, yPosition);
  yPosition += 3;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Amount box (similar to the quotation design)
  const boxHeight = 25;
  const boxY = yPosition;

  // Light gray background
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, boxY, pageWidth - 2 * margin, boxHeight, "F");

  // Border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(margin, boxY, pageWidth - 2 * margin, boxHeight, "S");

  // "Invoiced Amount:" label
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105); // Teal/green color
  doc.text("Invoiced Amount:", margin + 10, boxY + 15);

  // Amount value (right aligned)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const amountText = formatCurrency(invoice.amount);
  const amountWidth = doc.getTextWidth(amountText);
  doc.text(amountText, pageWidth - margin - amountWidth - 10, boxY + 16);

  // ===== FOOTER SECTION =====
  const footerY = pageHeight - 20;

  // Divider line above footer
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  // Left side: "Generated by RentalEase CRM"
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Generated by RentalEase CRM", margin, footerY);

  // Right side: "Generated on [date]"
  const currentDate = new Date().toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const footerRightText = `Generated on ${currentDate}`;
  const footerRightWidth = doc.getTextWidth(footerRightText);
  doc.text(footerRightText, pageWidth - margin - footerRightWidth, footerY);

  // Save the PDF
  const fileName = `Invoice_${invoice.invoiceNumber}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};
