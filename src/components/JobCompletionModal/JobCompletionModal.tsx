import React, { useState, useRef } from "react";
import {
  RiUploadLine,
  RiAddLine,
  RiDeleteBinLine,
  RiFileTextLine,
} from "react-icons/ri";
import Modal from "../Modal/Modal";
import "./JobCompletionModal.scss";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface JobCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reportFile: File | null;
    hasInvoice: boolean;
    invoiceData?: {
      description: string;
      items: InvoiceItem[];
      subtotal: number;
      tax: number;
      taxPercentage: number;
      totalCost: number;
      notes: string;
    };
  }) => void;
  jobId: string;
  dueDate: string;
  loading?: boolean;
}

const JobCompletionModal: React.FC<JobCompletionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  jobId,
  dueDate,
  loading = false,
}) => {
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: "1", name: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [invoiceTaxPercentage, setInvoiceTaxPercentage] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDueToday =
    new Date(dueDate).toDateString() === new Date().toDateString();

  const calculateItemAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const updateInvoiceItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = calculateItemAmount(
              updatedItem.quantity,
              updatedItem.rate
            );
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addInvoiceItem = () => {
    const newId = (invoiceItems.length + 1).toString();
    setInvoiceItems((prev) => [
      ...prev,
      { id: newId, name: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * invoiceTaxPercentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!reportFile) {
      newErrors.reportFile = "Please upload a job report PDF";
    }

    if (showInvoice) {
      if (!invoiceDescription.trim()) {
        newErrors.invoiceDescription = "Invoice description is required";
      }

      const hasEmptyItems = invoiceItems.some(
        (item) => !item.name.trim() || item.quantity <= 0 || item.rate <= 0
      );
      if (hasEmptyItems) {
        newErrors.invoiceItems = "Please fill in all invoice item details";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const invoiceData = showInvoice
      ? {
          description: invoiceDescription,
          items: invoiceItems,
          subtotal: calculateSubtotal(),
          tax: calculateTaxAmount(),
          taxPercentage: invoiceTaxPercentage,
          totalCost: calculateTotal(),
          notes: invoiceNotes,
        }
      : undefined;

    onSubmit({
      reportFile,
      hasInvoice: showInvoice,
      invoiceData,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setReportFile(file);
      setErrors((prev) => ({ ...prev, reportFile: "" }));
    } else if (file) {
      setErrors((prev) => ({
        ...prev,
        reportFile: "Please select a PDF file",
      }));
    }
  };

  const handleClose = () => {
    setReportFile(null);
    setShowInvoice(false);
    setInvoiceDescription("");
    setInvoiceItems([{ id: "1", name: "", quantity: 1, rate: 0, amount: 0 }]);
    setInvoiceTaxPercentage(0);
    setInvoiceNotes("");
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Complete Job"
      size="large"
    >
      <div className="job-completion-modal">
        {/* Due Date Warning */}
        {!isDueToday && (
          <div className="warning-banner">
            <RiFileTextLine />
            <div>
              <strong>Warning:</strong> This job is not due today. Due date:{" "}
              {new Date(dueDate).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Job Report Upload Section */}
        <div className="section">
          <h4>Job Report</h4>
          <p style={{ paddingBottom: "10px" }}>
            Upload the completed job report as a PDF file.
          </p>

          <div className="file-upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {!reportFile ? (
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <RiUploadLine />
                <span>Choose PDF File</span>
              </button>
            ) : (
              <div className="file-preview">
                <RiFileTextLine />
                <span>{reportFile.name}</span>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => setReportFile(null)}
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            )}

            {errors.reportFile && (
              <div className="error-message">{errors.reportFile}</div>
            )}
          </div>
        </div>

        {/* Invoice Toggle */}
        <div className="section">
          <div className="invoice-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showInvoice}
                onChange={(e) => setShowInvoice(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <div className="toggle-label">
              <h4>Include Invoice</h4>
              <p>Add additional charges for materials or services</p>
            </div>
          </div>
        </div>

        {/* Invoice Builder */}
        {showInvoice && (
          <div className="section invoice-section">
            <h4>Invoice Details</h4>

            {/* Invoice Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={invoiceDescription}
                onChange={(e) => setInvoiceDescription(e.target.value)}
                placeholder="Describe the additional work or materials..."
                rows={3}
              />
              {errors.invoiceDescription && (
                <div className="error-message">{errors.invoiceDescription}</div>
              )}
            </div>

            {/* Invoice Items Table */}
            <div className="invoice-items">
              <div className="invoice-header">
                <div className="header-item">Item</div>
                <div className="header-quantity">Quantity</div>
                <div className="header-rate">Rate</div>
                <div className="header-amount">Amount</div>
                <div className="header-actions"></div>
              </div>

              {invoiceItems.map((item) => (
                <div key={item.id} className="invoice-row">
                  <div className="item-name">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateInvoiceItem(item.id, "name", e.target.value)
                      }
                      placeholder="Item name"
                    />
                  </div>
                  <div className="item-quantity">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateInvoiceItem(
                          item.id,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="item-rate">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateInvoiceItem(
                          item.id,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="$"
                    />
                  </div>
                  <div className="item-amount">${item.amount.toFixed(2)}</div>
                  <div className="item-actions">
                    {invoiceItems.length > 1 && (
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeInvoiceItem(item.id)}
                      >
                        <RiDeleteBinLine />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {errors.invoiceItems && (
                <div className="error-message">{errors.invoiceItems}</div>
              )}

              <button
                type="button"
                className="add-item-btn"
                onClick={addInvoiceItem}
              >
                <RiAddLine />
                Line Item
              </button>
            </div>

            {/* Invoice Totals */}
            <div className="invoice-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoiceTaxPercentage}
                  onChange={(e) =>
                    setInvoiceTaxPercentage(parseFloat(e.target.value) || 0)
                  }
                  placeholder="%"
                  className="tax-input"
                />
              </div>
              <div className="total-row">
                <span>Tax Amount:</span>
                <span>${calculateTaxAmount().toFixed(2)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Invoice Notes */}
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Additional notes for the invoice..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Completing..." : "Complete Job"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default JobCompletionModal;
