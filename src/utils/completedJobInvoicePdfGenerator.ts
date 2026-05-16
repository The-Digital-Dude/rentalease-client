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

const loadLogoDataUrl = async (): Promise<string | null> => {
  try {
    const response = await fetch("/rentalease-logo.png");
    if (!response.ok) {
      throw new Error("Logo not found");
    }

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
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
  } catch (error) {
    console.error("Unable to load logo for PDF:", error);
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

const formatQuantity = (quantity: number) => {
  const numericQuantity = Number(quantity || 0);
  return Number.isInteger(numericQuantity)
    ? String(numericQuantity)
    : numericQuantity.toFixed(2);
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildInvoiceHtml = (
  payload: CompletedJobInvoicePdfPayload,
  logoDataUrl: string | null
) => {
  const { invoice, jobNumber, jobType, propertyAddress, agencyName, hasReport } =
    payload;

  const lineItems = invoice.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name || "-")}</td>
          <td class="center">${escapeHtml(formatQuantity(item.quantity))}</td>
          <td class="right">${escapeHtml(formatCurrency(item.rate))}</td>
          <td class="right">${escapeHtml(formatCurrency(item.amount))}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div class="invoice-sheet">
      <div class="brand-banner">
        <div class="brand-lockup">
          ${
            logoDataUrl
              ? `<div class="logo-badge"><img src="${logoDataUrl}" alt="RentalEase" /></div>`
              : ""
          }
          <div class="brand-copy">
            <div class="brand-name">RentalEase</div>
            <div class="brand-tagline">Property Compliance and Billing</div>
          </div>
        </div>
        <div class="brand-meta">
          <span>Generated Invoice</span>
          <strong>${escapeHtml(jobNumber)}</strong>
        </div>
      </div>

      <div class="invoice-header">
        <div>
          <div class="kicker">Invoice Number</div>
          <div class="invoice-number">${escapeHtml(
            invoice.invoiceNumber || "Draft"
          )}</div>
          <div class="status-chip">${escapeHtml(invoice.status || "Draft")}</div>
        </div>
        <div class="amount-block">
          <div class="amount-label">Total Amount</div>
          <div class="amount-value">${escapeHtml(
            formatCurrency(invoice.totalCost)
          )}</div>
        </div>
      </div>

      <div class="two-column">
        <section class="info-card">
          <h3>Property Information</h3>
          <div class="info-grid">
            <div class="label">Property Address</div>
            <div class="value">${escapeHtml(propertyAddress)}</div>
            <div class="label">Agency</div>
            <div class="value">${escapeHtml(agencyName || "-")}</div>
            <div class="label">Inspection Report</div>
            <div class="value">${escapeHtml(hasReport ? "Available" : "Missing")}</div>
          </div>
        </section>

        <section class="info-card">
          <h3>Invoice Information</h3>
          <div class="info-grid">
            <div class="label">Job Number</div>
            <div class="value">${escapeHtml(jobNumber)}</div>
            <div class="label">Service</div>
            <div class="value">${escapeHtml(jobType)}</div>
            <div class="label">Created</div>
            <div class="value">${escapeHtml(formatDate(invoice.createdAt))}</div>
            <div class="label">Updated</div>
            <div class="value">${escapeHtml(formatDate(invoice.updatedAt))}</div>
          </div>
        </section>
      </div>

      <section class="content-card">
        <h3>Invoice Items</h3>
        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
                <th class="right">Rate</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div><span>Subtotal</span><strong>${escapeHtml(
            formatCurrency(invoice.subtotal)
          )}</strong></div>
          <div><span>Tax</span><strong>${escapeHtml(
            formatCurrency(invoice.tax)
          )}</strong></div>
          <div class="total-row"><span>Total</span><strong>${escapeHtml(
            formatCurrency(invoice.totalCost)
          )}</strong></div>
        </div>
      </section>

      <section class="content-card">
        <h3>Description</h3>
        <div class="text-panel">${escapeHtml(invoice.description || "-")}</div>
      </section>

      ${
        invoice.notes
          ? `
            <section class="content-card">
              <h3>Notes</h3>
              <div class="text-panel notes">${escapeHtml(invoice.notes)}</div>
            </section>
          `
          : ""
      }

      <div class="footer">
        <span>Generated by RentalEase CRM</span>
        <span>Generated on ${escapeHtml(
          new Date().toLocaleDateString("en-US")
        )}</span>
      </div>
    </div>
  `;
};

const buildInvoiceStyles = () => `
  .invoice-sheet {
    width: 794px;
    box-sizing: border-box;
    padding: 24px;
    background: #ffffff;
    color: #0f172a;
    font-family: Arial, Helvetica, sans-serif;
  }

  .brand-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 18px 22px;
    border-radius: 18px;
    background: linear-gradient(135deg, #0f4c81 0%, #1565a8 100%);
    color: #ffffff;
    margin-bottom: 22px;
  }

  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-badge {
    width: 72px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }

  .logo-badge img {
    width: 62px;
    height: auto;
    display: block;
  }

  .brand-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .brand-name {
    font-size: 30px;
    font-weight: 700;
    line-height: 1;
  }

  .brand-tagline {
    font-size: 17px;
    color: rgba(255, 255, 255, 0.85);
  }

  .brand-meta {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .brand-meta span {
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.82);
    font-weight: 700;
  }

  .brand-meta strong {
    font-size: 24px;
    font-weight: 700;
  }

  .invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 22px;
    padding-bottom: 18px;
    border-bottom: 2px solid #dbe4ef;
  }

  .kicker {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 8px;
  }

  .invoice-number {
    font-size: 42px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 10px;
  }

  .status-chip {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 999px;
    background: #dbeafe;
    color: #1d4ed8;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .amount-block {
    text-align: right;
  }

  .amount-label {
    font-size: 15px;
    color: #64748b;
    margin-bottom: 8px;
  }

  .amount-value {
    font-size: 38px;
    font-weight: 700;
    color: #059669;
    line-height: 1;
  }

  .two-column {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-spacing: 0 0;
    margin-bottom: 20px;
  }

  .two-column > .info-card {
    display: table-cell;
    width: 50%;
    vertical-align: top;
  }

  .two-column > .info-card:first-child {
    padding-right: 10px;
  }

  .two-column > .info-card:last-child {
    padding-left: 10px;
  }

  .info-card,
  .content-card {
    border: 1px solid #dbe4ef;
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    padding: 18px 18px 16px;
    box-sizing: border-box;
  }

  .content-card {
    margin-bottom: 18px;
  }

  .info-card h3,
  .content-card h3 {
    margin: 0 0 14px;
    font-size: 20px;
    line-height: 1.2;
  }

  .info-grid {
    display: table;
    width: 100%;
    border-collapse: collapse;
  }

  .info-grid .label,
  .info-grid .value {
    display: table-cell;
    padding: 10px 0;
    vertical-align: top;
    border-bottom: 1px solid #edf2f7;
    font-size: 15px;
    line-height: 1.45;
  }

  .info-grid .label {
    width: 38%;
    color: #64748b;
    font-weight: 600;
    padding-right: 12px;
  }

  .info-grid .value {
    color: #0f172a;
    font-weight: 500;
    word-break: break-word;
  }

  .table-shell {
    overflow: hidden;
    border: 1px solid #dbe4ef;
    border-radius: 12px;
    background: #ffffff;
    margin-bottom: 18px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 13px 16px;
    font-size: 15px;
    line-height: 1.4;
    border-bottom: 1px solid #e8eef5;
  }

  thead th {
    background: #f8fafc;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 12px;
    font-weight: 700;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }

  .totals {
    width: 260px;
    margin-left: auto;
  }

  .totals > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 15px;
  }

  .totals .total-row {
    border-top: 1px solid #dbe4ef;
    margin-top: 4px;
    padding-top: 12px;
  }

  .totals .total-row strong {
    color: #059669;
    font-size: 18px;
  }

  .text-panel {
    background: #f8fafc;
    border: 1px solid #e8eef5;
    border-left: 4px solid #3b82f6;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 15px;
    line-height: 1.6;
    color: #475569;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .text-panel.notes {
    border-left-color: #059669;
  }

  .footer {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #dbe4ef;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
  }
`;

export const generateCompletedJobInvoicePDF = async (
  payload: CompletedJobInvoicePdfPayload
) => {
  const logoDataUrl = await loadLogoDataUrl();
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-1";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.background = "#ffffff";
  container.innerHTML = `
    <style>${buildInvoiceStyles()}</style>
    ${buildInvoiceHtml(payload, logoDataUrl)}
  `;

  document.body.appendChild(container);

  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= usableHeight) {
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let offsetY = 0;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", margin, margin - offsetY, imgWidth, imgHeight);
        remainingHeight -= usableHeight;
        offsetY += usableHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    const fileName = `Invoice_${payload.invoice.invoiceNumber || "Draft"}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
};
