import { renderToStaticMarkup } from "react-dom/server";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CompletedJobInvoicePreview from "../components/CompletedJobInvoicePreview/CompletedJobInvoicePreview";
import type { Invoice } from "../services/invoiceService";

export interface CompletedJobInvoicePdfPayload {
  invoice: Invoice;
  jobNumber: string;
  jobType: string;
  propertyAddress: string;
  agencyName?: string;
  hasReport: boolean;
  reportSource?: "job" | "latestInspectionReport" | "generated" | null;
}

interface GeneratedInvoicePdfResult {
  pdf: jsPDF;
  blob: Blob;
  fileName: string;
}

const PAGE_WIDTH = 794;

const buildPreviewMarkup = (payload: CompletedJobInvoicePdfPayload) =>
  renderToStaticMarkup(
    <CompletedJobInvoicePreview
      invoice={payload.invoice}
      job={{
        job_id: payload.jobNumber,
        jobType: payload.jobType,
        property: {
          address: {
            fullAddress: payload.propertyAddress,
          },
        },
        agency: payload.agencyName ? { name: payload.agencyName } : undefined,
        reportFile: payload.hasReport ? "available" : null,
      }}
      reviewData={{
        propertyAddress: payload.propertyAddress,
        jobType: payload.jobType,
        jobNumber: payload.jobNumber,
        agencyName: payload.agencyName || "",
        reportFile: payload.hasReport ? "available" : null,
        hasReport: payload.hasReport,
        reportSource: payload.reportSource || null,
        recipients: {
          to: [],
          cc: [],
          bcc: [],
        },
      }}
      compact
    />
  );

export const createCompletedJobInvoicePDF = async (
  payload: CompletedJobInvoicePdfPayload
): Promise<GeneratedInvoicePdfResult> => {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-20000px";
  container.style.top = "0";
  container.style.width = `${PAGE_WIDTH}px`;
  container.style.display = "block";
  container.style.visibility = "visible";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-1";
  container.style.overflow = "visible";
  container.style.background = "#ffffff";
  container.innerHTML = buildPreviewMarkup(payload);

  document.body.appendChild(container);

  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 120));

    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: PAGE_WIDTH,
    });

    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 16;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imageData = canvas.toDataURL("image/png");
    const widthScale = usableWidth / canvas.width;
    const heightScale = usableHeight / canvas.height;
    const renderScale = Math.min(widthScale, heightScale);
    const renderWidth = canvas.width * renderScale;
    const renderHeight = canvas.height * renderScale;
    const x = margin + (usableWidth - renderWidth) / 2;
    const y = margin + (usableHeight - renderHeight) / 2;

    pdf.addImage(imageData, "PNG", x, y, renderWidth, renderHeight);

    const fileName = `Invoice_${payload.invoice.invoiceNumber || "Draft"}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const blob = pdf.output("blob");

    return {
      pdf,
      blob,
      fileName,
    };
  } finally {
    document.body.removeChild(container);
  }
};

export const generateCompletedJobInvoicePDF = async (
  payload: CompletedJobInvoicePdfPayload
) => {
  const { pdf, fileName } = await createCompletedJobInvoicePDF(payload);
  pdf.save(fileName);
};
