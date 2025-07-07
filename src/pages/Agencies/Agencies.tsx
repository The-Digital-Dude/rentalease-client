import { useState, useEffect } from "react";
import { RiAddLine, RiSearchLine, RiFilterLine } from "react-icons/ri";
import { AgencyFormModal } from "../../components";
import { propertyManagerService } from "../../services/propertyManagerService";
import type { PropertyManager } from "../../services/propertyManagerService";
import "./Agencies.scss";

// Using PropertyManager interface from service  
type Agency = PropertyManager;

const complianceLevels = [
  "Full Package",
  "Gas & Electrical",
  "Smoke Alarm Only",
  "Basic Compliance",
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

  // Fetch property managers from API
  useEffect(() => {
    const fetchPropertyManagers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await propertyManagerService.getAllPropertyManagers();
        
        if (response.success) {
          // Ensure we always have an array
          setAgencies(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || "Failed to fetch property managers");
          setAgencies([]); // Set empty array on error
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch property managers");
        setAgencies([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyManagers();
  }, []);

  const filteredAgencies = (Array.isArray(agencies) ? agencies : []).filter((agency) => {
    const matchesSearch = agency.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || agency.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleFormSubmit = async (formData: {
    name: string;
    abn: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    region: string;
    complianceLevel: string;
    status: "active" | "inactive" | "pending";
    password?: string;
  }) => {
    try {
      setSubmitLoading(true);
      setError("");
      setSuccessMessage("");

      if (editingAgency) {
        // Update existing property manager (exclude password)
        const updateData = {
          name: formData.name,
          abn: formData.abn,
          contactPerson: formData.contactPerson,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          region: formData.region,
          complianceLevel: formData.complianceLevel,
          status: formData.status,
          outstandingAmount: editingAgency.outstandingAmount, // Preserve existing amount
        };
        
        const response = await propertyManagerService.updatePropertyManager(
          editingAgency.id,
          updateData
        );
        
        if (response.success) {
          setAgencies((prevAgencies) =>
            prevAgencies.map((agency) =>
              agency.id === editingAgency.id
                ? {
                    ...agency,
                    ...updateData,
                  }
                : agency
            )
          );
          setSuccessMessage("Property manager updated successfully!");
        } else {
          setError(response.message || "Failed to update property manager");
          return;
        }
      } else {
        // Add new property manager (include password)
        if (!formData.password) {
          setError("Password is required for new property managers");
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
          outstandingAmount: 0, // Default outstanding amount for new property managers
          password: formData.password,
        };
        
        const response = await propertyManagerService.createPropertyManager(newAgencyData);
        
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          setAgencies((prevAgencies) => [...prevAgencies, response.data[0]]);
          setSuccessMessage(response.message || "Property manager created successfully!");
        } else {
          setError(response.message || "Failed to create property manager");
          return;
        }
      }

      setShowForm(false);
      setEditingAgency(null);
    } catch (error: any) {
      setError(error.message || "Failed to save property manager");
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
            <h1>Property Manager Management</h1>
            <p>Manage your property managers and compliance</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setError("");
            setSuccessMessage("");
            setShowForm(true);
          }}>
            <RiAddLine /> Add New Property Manager
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message" style={{ 
          background: '#dcfce7', 
          border: '1px solid #bbf7d0', 
          color: '#166534', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          {successMessage}
        </div>
      )}

      <div className="agencies-controls">
        <div className="search-box">
          <RiSearchLine />
          <input
            type="text"
            placeholder="Search property managers..."
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
          </select>
        </div>
      </div>

      <div className="agencies-list">
        {loading ? (
          <div className="loading-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '2rem',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div className="loading-spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(2, 73, 116, 0.2)',
              borderTop: '3px solid #024974',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Loading property managers...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="no-data" style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#6b7280'
          }}>
            {searchTerm || selectedStatus !== 'all' ? 
              'No property managers found matching your criteria.' : 
              'No property managers available. Add one to get started.'
            }
          </div>
        ) : (
          filteredAgencies.map((agency) => (
          <div key={agency.id} className="agency-card">
            <div className="agency-header">
              <h3>{agency.name}</h3>
              <span className={`status-badge ${agency.status}`}>
                {agency.status}
              </span>
            </div>
            <div className="agency-details">
              <div className="detail-group">
                <div className="detail-item">
                  <span className="label">ABN</span>
                  <span>{agency.abn}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Contact</span>
                  <span>{agency.contactPerson}</span>
                </div>
              </div>
              <div className="detail-group">
                <div className="detail-item">
                  <span className="label">Email</span>
                  <span>{agency.contactEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone</span>
                  <span>{agency.contactPhone}</span>
                </div>
              </div>
              <div className="detail-group">
                <div className="detail-item">
                  <span className="label">Region</span>
                  <span>{agency.region}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Compliance</span>
                  <span>{agency.complianceLevel}</span>
                </div>
              </div>
            </div>
            <div className="agency-footer">
              <div className="outstanding-amount">
                <span className="label">Outstanding</span>
                <span className="amount">${agency.outstandingAmount}</span>
              </div>
              <button
                className="btn-secondary"
                onClick={() => handleEdit(agency)}
              >
                Edit
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      <AgencyFormModal
        isOpen={showForm}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        editingAgency={editingAgency}
        complianceLevels={complianceLevels}
      />
    </div>
  );
};

export default Agencies;
