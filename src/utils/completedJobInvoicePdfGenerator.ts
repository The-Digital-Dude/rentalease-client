import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Invoice } from "../services/invoiceService";

export interface CompletedJobInvoicePdfPayload {
  invoice: Invoice;
  jobNumber: string;
  jobType: string;
  propertyAddress: string;
  agencyName?: string;
  hasReport: boolean;
}

interface GeneratedInvoicePdfResult {
  pdf: jsPDF;
  blob: Blob;
  fileName: string;
}

const PAGE_WIDTH = 794;

const loadLogoDataUrl = async (): Promise<string | null> => {
  try {
    const response = await fetch("/rentalease-logo.png");
    if (!response.ok) throw new Error("Logo not found");

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("Failed to load logo"));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Unable to load logo for completed job invoice PDF:", error);
    return null;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount || 0);

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatQuantity = (quantity: number) =>
  Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(2);

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getStatusClassName = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "draft" || normalizedStatus === "pending") {
    return "status-pending";
  }

  if (normalizedStatus === "sent") {
    return "status-sent";
  }

  if (normalizedStatus === "paid") {
    return "status-paid";
  }

  return "status-pending";
};

const buildHtml = (
  payload: CompletedJobInvoicePdfPayload,
  logoDataUrl: string | null
) => {
  const { invoice, jobNumber, jobType, propertyAddress, agencyName, hasReport } =
    payload;

  const lineItems = invoice.items
    .map(
      (item) => `
        <div class="preview-items-row">
          <span>${escapeHtml(item.name || "-")}</span>
          <span>${escapeHtml(formatQuantity(item.quantity))}</span>
          <span>${escapeHtml(formatCurrency(item.rate))}</span>
          <span>${escapeHtml(formatCurrency(item.amount))}</span>
        </div>
      `
    )
    .join("");

  return `
    <div class="pdf-shell">
      <div class="completed-job-invoice-preview compact-preview pdf-preview">
        <div class="brand-banner">
          <div class="brand-lockup">
            ${
              logoDataUrl
                ? `<img src="${logoDataUrl}" alt="RentalEase" class="brand-logo" />`
                : ""
            }
            <div class="brand-copy">
              <span class="brand-name">RentalEase</span>
              <span class="brand-tagline">Property Compliance and Billing</span>
            </div>
          </div>
          <div class="brand-meta">
            <span>Generated Invoice</span>
            <strong>${escapeHtml(jobNumber)}</strong>
          </div>
        </div>

        <div class="invoice-header-section">
          <div class="invoice-number">
            <p class="preview-kicker">Invoice Number</p>
            <h3>${escapeHtml(invoice.invoiceNumber || "Draft")}</h3>
            <span class="status-badge ${getStatusClassName(invoice.status)}">${escapeHtml(
              invoice.status || "Draft"
            )}</span>
          </div>
          <div class="invoice-amount">
            <p class="amount-label">Total Amount</p>
            <p class="amount-value">${escapeHtml(
              formatCurrency(invoice.totalCost)
            )}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-section">
            <h4>Property Information</h4>
            <div class="detail-item">
              <span class="label">Property Address</span>
              <span class="value">${escapeHtml(propertyAddress)}</span>
            </div>
            <div class="detail-item">
              <span class="label">Agency</span>
              <span class="value">${escapeHtml(agencyName || "-")}</span>
            </div>
            <div class="detail-item">
              <span class="label">Inspection Report</span>
              <span class="value">${escapeHtml(hasReport ? "Available" : "Missing")}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>Invoice Information</h4>
            <div class="detail-item">
              <span class="label">Job Number</span>
              <span class="value">${escapeHtml(jobNumber)}</span>
            </div>
            <div class="detail-item">
              <span class="label">Service</span>
              <span class="value">${escapeHtml(jobType)}</span>
            </div>
            <div class="detail-item">
              <span class="label">Created</span>
              <span class="value">${escapeHtml(formatDate(invoice.createdAt))}</span>
            </div>
            <div class="detail-item">
              <span class="label">Updated</span>
              <span class="value">${escapeHtml(formatDate(invoice.updatedAt))}</span>
            </div>
          </div>

          <div class="detail-section full-width">
            <h4>Invoice Items</h4>
            <div class="preview-items-table">
              <div class="preview-items-head">
                <span>Item</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Amount</span>
              </div>
              ${lineItems}
            </div>

            <div class="preview-totals">
              <div>
                <span>Subtotal</span>
                <strong>${escapeHtml(formatCurrency(invoice.subtotal))}</strong>
              </div>
              <div>
                <span>Tax</span>
                <strong>${escapeHtml(formatCurrency(invoice.tax))}</strong>
              </div>
              <div class="total-row">
                <span>Total</span>
                <strong>${escapeHtml(formatCurrency(invoice.totalCost))}</strong>
              </div>
            </div>
          </div>

          <div class="detail-section full-width">
            <h4>Description</h4>
            <p class="description-text">${escapeHtml(invoice.description || "-")}</p>
          </div>

          ${
            invoice.notes
              ? `
                <div class="detail-section full-width">
                  <h4>Notes</h4>
                  <p class="response-notes">${escapeHtml(invoice.notes)}</p>
                </div>
              `
              : ""
          }
        </div>

        <div class="pdf-footer">
          <span>Generated by RentalEase CRM</span>
          <span>Generated on ${escapeHtml(formatDate(new Date().toISOString()))}</span>
        </div>
      </div>
    </div>
  `;
};

const buildStyles = () => `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #ffffff;
  }

  .pdf-shell {
    width: ${PAGE_WIDTH}px;
    padding: 18px;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
  }

  .completed-job-invoice-preview {
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    background: #ffffff;
    color: #1e293b;
    padding: 1.25rem;
    display: grid;
    gap: 1.1rem;
  }

  .brand-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.15rem;
    border-radius: 16px;
    background: linear-gradient(135deg, #0f4c81 0%, #1565a8 100%);
    color: #ffffff;
  }

  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
  }

  .brand-logo {
    width: 64px;
    height: auto;
    object-fit: contain;
    flex-shrink: 0;
  }

  .brand-copy {
    display: grid;
    gap: 0.1rem;
  }

  .brand-name {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .brand-tagline {
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .brand-meta {
    display: grid;
    gap: 0.15rem;
    text-align: right;
    flex-shrink: 0;
  }

  .brand-meta span {
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
  }

  .brand-meta strong {
    font-size: 0.98rem;
    font-weight: 700;
  }

  .invoice-header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding-bottom: 0.95rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .preview-kicker {
    margin: 0 0 0.3rem;
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .invoice-number h3 {
    margin: 0 0 0.45rem;
    color: #111827;
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.34rem 0.68rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .status-badge.status-pending {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .status-badge.status-sent {
    background: #ede9fe;
    color: #6d28d9;
  }

  .status-badge.status-paid {
    background: #dcfce7;
    color: #166534;
  }

  .invoice-amount {
    text-align: right;
  }

  .amount-label {
    margin: 0 0 0.22rem;
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .amount-value {
    margin: 0;
    color: #059669;
    font-size: 1.7rem;
    font-weight: 700;
    line-height: 1;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .detail-section {
    padding: 0.95rem 1rem;
    border: 1px solid #e8eef5;
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  }

  .detail-section.full-width {
    grid-column: 1 / -1;
  }

  .detail-section h4 {
    margin: 0 0 0.85rem;
    color: #111827;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .detail-item {
    display: grid;
    grid-template-columns: 112px 1fr;
    align-items: start;
    gap: 0.7rem;
    padding: 0.58rem 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .label {
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .value {
    color: #111827;
    font-size: 0.8rem;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .preview-items-table {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 0.95rem;
    background: #ffffff;
  }

  .preview-items-head,
  .preview-items-row {
    display: grid;
    grid-template-columns: minmax(0, 2fr) 0.8fr 1fr 1fr;
    gap: 0.75rem;
    padding: 0.82rem 0.95rem;
  }

  .preview-items-head {
    background: #f8fafc;
    color: #64748b;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
  }

  .preview-items-row {
    border-top: 1px solid #e5e7eb;
    color: #111827;
    font-size: 0.8rem;
  }

  .preview-totals {
    display: grid;
    gap: 0.65rem;
    margin-left: auto;
    width: 100%;
    max-width: 320px;
  }

  .preview-totals > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.82rem;
  }

  .preview-totals .total-row {
    padding-top: 0.62rem;
    border-top: 1px solid #e5e7eb;
  }

  .preview-totals .total-row strong {
    color: #059669;
    font-size: 0.98rem;
  }

  .description-text,
  .response-notes {
    margin: 0;
    color: #475569;
    font-size: 0.8rem;
    line-height: 1.55;
    white-space: pre-wrap;
    background: #f8fafc;
    padding: 0.92rem 1rem;
    border-radius: 12px;
    border-left: 4px solid #3b82f6;
  }

  .response-notes {
    border-left-color: #059669;
  }

  .pdf-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.2rem;
    padding-top: 0.9rem;
    border-top: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 0.68rem;
  }
`;

export const createCompletedJobInvoicePDF = async (
  payload: CompletedJobInvoicePdfPayload
): Promise<GeneratedInvoicePdfResult> => {
  const logoDataUrl = await loadLogoDataUrl();
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
  container.innerHTML = `
    <style>${buildStyles()}</style>
    ${buildHtml(payload, logoDataUrl)}
  `;

  document.body.appendChild(container);

  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 80));

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
