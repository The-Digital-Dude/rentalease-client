import { useState, useEffect } from "react";
import { RiAddLine, RiSearchLine, RiFilterLine } from "react-icons/ri";
import toast from "react-hot-toast";
import {
  AgencyCard,
  AgencyFormModal,
  ConfirmationModal,
} from "../../components";
import { agencyService } from "../../services";
import type { Agency } from "../../services/agencyService";
import { VALID_REGIONS } from "../../constants";
import "./Agencies.scss";

const complianceLevels = [
  "Basic Package",
  "Standard Package",
  "Premium Package",
  "Full Package",
];

const Agencies = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch agencies from API
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await agencyService.getAllAgencies();

      if (response.success) {
        // Ensure we always have an array
        setAgencies(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response.message || "Failed to fetch agencies");
        setAgencies([]); // Set empty array on error
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch agencies");
      setAgencies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const filteredAgencies = (Array.isArray(agencies) ? agencies : []).filter(
    (agency) => {
      const matchesSearch = agency.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || agency.status === selectedStatus;
      return matchesSearch && matchesStatus;
    }
  );

  const handleFormSubmit = async (formData: {
    name: string;
    abn: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    region: string;
    complianceLevel: string;
    status: "active" | "inactive" | "pending" | "suspended";
    password?: string;
    subscriptionAmount?: number;
  }) => {
    try {
      setSubmitLoading(true);
      setError("");
      setSuccessMessage("");

      if (editingAgency) {
        // Update existing agency (exclude password)
        const updateData = {
          name: formData.name,
          abn: formData.abn,
          contactPerson: formData.contactPerson,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          region: formData.region,
          complianceLevel: formData.complianceLevel,
          status: formData.status,
          outstandingAmount: editingAgency.outstandingAmount, // Keep for now to satisfy interface
        };

        const response = await agencyService.updateAgency(
          editingAgency.id,
          updateData
        );

        if (response.success) {
          toast.success("Agency updated successfully!");
          // Refetch agencies from server to ensure list is synchronized
          await fetchAgencies();
        } else {
          toast.error(response.message || "Failed to update agency");
          return;
        }
      } else {
        // Add new agency (include password and subscription amount)
        if (!formData.password) {
          toast.error("Password is required for new agencies");
          return;
        }

        if (!formData.subscriptionAmount || formData.subscriptionAmount < 1 || formData.subscriptionAmount > 100000) {
          toast.error("Subscription amount must be between $1 and $100,000");
          return;
        }

        const newAgencyData = {
          name: formData.name,
          abn: formData.abn,
          contactPerson: formData.contactPerson,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          region: formData.region,
          complianceLevel: formData.complianceLevel,
          status: formData.status,
          outstandingAmount: 0, // Keep for now to satisfy interface
          password: formData.password,
          subscriptionAmount: formData.subscriptionAmount,
        };

        const response = await agencyService.createAgency(newAgencyData);

        if (response.success) {
          toast.success(response.message || "Agency created successfully!");
          // Refetch agencies from server to ensure list is synchronized
          await fetchAgencies();
        } else {
          toast.error(response.message || "Failed to create agency");
          return;
        }
      }

      setShowForm(false);
      setEditingAgency(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save agency");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (agency: Agency) => {
    setError("");
    setSuccessMessage("");
    setEditingAgency(agency);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setError("");
      setSuccessMessage("");

      const response = await agencyService.deleteAgency(id);

      if (response.success) {
        setAgencies((prevAgencies) =>
          prevAgencies.filter((agency) => agency.id !== id)
        );
        toast.success("Agency deleted successfully!");
      } else {
        toast.error(response.message || "Failed to delete agency");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete agency");
    }
  };

  const handleResendCredentials = async (id: string) => {
    try {
      setError("");
      setSuccessMessage("");

      const response = await agencyService.resendCredentialsEmail(id);

      if (response.success) {
        toast.success(
          response.message || "Credentials email sent successfully!"
        );
      } else {
        toast.error(response.message || "Failed to send credentials email");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send credentials email");
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingAgency(null);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1>Agency Management</h1>
            <p>Manage your agencies and compliance</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setError("");
              setSuccessMessage("");
              setShowForm(true);
            }}
          >
            <RiAddLine /> Add New Agency
          </button>
        </div>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          className="success-message"
          style={{
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {successMessage}
        </div>
      )}

      <div className="agencies-controls">
        <div className="search-box">
          <RiSearchLine />
          <input
            type="text"
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <RiFilterLine />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="agencies-list">
        {loading ? (
          <div
            className="loading-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              className="loading-spinner"
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid rgba(2, 73, 116, 0.2)",
                borderTop: "3px solid #024974",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p>Loading agencies...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div
            className="no-data"
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#6b7280",
            }}
          >
            {searchTerm || selectedStatus !== "all"
              ? "No agencies found matching your criteria."
              : "No agencies available. Add one to get started."}
          </div>
        ) : (
          filteredAgencies.map((agency) => (
            <AgencyCard
              key={agency.id}
              agency={agency}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResendCredentials={handleResendCredentials}
            />
          ))
        )}
      </div>

      <AgencyFormModal
        isOpen={showForm}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        editingAgency={editingAgency}
        complianceLevels={complianceLevels}
        regions={VALID_REGIONS}
        isSubmitting={submitLoading}
      />
    </div>
  );
};

export default Agencies;
