import React, { useState, useEffect } from "react";
import { MdClose, MdAdd, MdEdit } from "react-icons/md";
import propertyManagerInvoiceService from "../../services/propertyManagerInvoiceService";
import type { PropertyManagerInvoice } from "../../services/propertyManagerInvoiceService";
import propertyService from "../../services/propertyService";
import { toast } from "react-toastify";
import "./InvoiceCreateModal.scss";

interface Property {
  id: string;
  fullAddress: string;
  assignedPropertyManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface InvoiceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice?: PropertyManagerInvoice | null;
}

export const InvoiceCreateModal: React.FC<InvoiceCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
}) => {
  const [formData, setFormData] = useState({
    property: "",
    description: "",
    amount: "",
    dueDate: "",
    notes: "",
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      if (invoice) {
        setFormData({
          property:
            typeof invoice.property === "object"
              ? invoice.property._id
              : invoice.property,
          description: invoice.description,
          amount: invoice.amount.toString(),
          dueDate: invoice.dueDate.split("T")[0], // Format for input[type="date"]
          notes: invoice.notes || "",
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, invoice]);

  const fetchProperties = async () => {
    try {
      const response = await propertyService.getProperties({ limit: 1000 });
      if (response.status === "success" && response.data.properties) {
        const transformedProperties = response.data.properties.map(
          (prop: any) => ({
            id: prop.id,
            fullAddress: prop.fullAddress,
            assignedPropertyManager: prop.assignedPropertyManager,
          })
        );
        setProperties(transformedProperties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to fetch properties");
    }
  };

  const resetForm = () => {
    setFormData({
      property: "",
      description: "",
      amount: "",
      dueDate: "",
      notes: "",
    });
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate form
    const validationData = {
      propertyId: formData.property,
      description: formData.description,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
    };

    const validation =
      propertyManagerInvoiceService.validatePropertyManagerInvoiceRequest(
        validationData
      );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      if (invoice) {
        // Update existing invoice
        await propertyManagerInvoiceService.updatePropertyManagerInvoice(
          invoice._id,
          {
            description: formData.description,
            amount: parseFloat(formData.amount),
            dueDate: formData.dueDate,
            notes: formData.notes || undefined,
          }
        );
        toast.success("Invoice updated successfully");
      } else {
        // Create new invoice
        await propertyManagerInvoiceService.createPropertyManagerInvoice({
          propertyId: formData.property,
          description: formData.description,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          notes: formData.notes || undefined,
        });
        toast.success("Invoice created successfully");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save invoice");
      setErrors([error.message || "Failed to save invoice"]);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyManagerName = (property: Property) => {
    if (!property.assignedPropertyManager) {
      return "No Property Manager";
    }
    return `${property.assignedPropertyManager.firstName} ${property.assignedPropertyManager.lastName}`;
  };

  if (!isOpen) return null;

  return (
    <div className="invoice-create-modal-overlay" onClick={onClose}>
      <div
        className="invoice-create-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {invoice ? (
              <>
                <MdEdit /> Edit Invoice
              </>
            ) : (
              <>
                <MdAdd /> Create Invoice
              </>
            )}
          </h2>
          <button className="close-btn" onClick={onClose} type="button">
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="property">
              Property <span className="required">*</span>
            </label>
            <select
              id="property"
              value={formData.property}
              onChange={(e) =>
                setFormData({ ...formData, property: e.target.value })
              }
              required
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.fullAddress} - {getPropertyManagerName(property)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter invoice description..."
              rows={4}
              required
              maxLength={1000}
            />
            <small className="char-count">
              {formData.description.length}/1000 characters
            </small>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label htmlFor="amount">
                Amount (AUD) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">
                Due Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes or comments..."
              rows={3}
              maxLength={500}
            />
            <small className="char-count">
              {formData.notes.length}/500 characters
            </small>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? "Saving..."
                : invoice
                ? "Update Invoice"
                : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCreateModal;
