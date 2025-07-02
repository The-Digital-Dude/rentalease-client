import { useState } from "react";
import {
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
} from "react-icons/ri";
import "./Agencies.scss";

interface Agency {
  id: string;
  name: string;
  abn: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  complianceLevel: string;
  status: "active" | "inactive";
  outstandingAmount: number;
}

interface AgencyFormData {
  name: string;
  abn: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  complianceLevel: string;
  status: "active" | "inactive";
}

const initialFormData: AgencyFormData = {
  name: "",
  abn: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  region: "",
  complianceLevel: "",
  status: "active",
};

const initialAgencies: Agency[] = [
  {
    id: "1",
    name: "Sydney Property Experts",
    abn: "12 345 678 901",
    contactPerson: "John Smith",
    contactEmail: "john@sydneyexperts.com",
    contactPhone: "0412 345 678",
    region: "Sydney Metro",
    complianceLevel: "Full Package",
    status: "active",
    outstandingAmount: 2500,
  },
  {
    id: "2",
    name: "Melbourne Real Estate",
    abn: "98 765 432 109",
    contactPerson: "Sarah Johnson",
    contactEmail: "sarah@melbournere.com",
    contactPhone: "0423 456 789",
    region: "Melbourne Metro",
    complianceLevel: "Gas & Electrical",
    status: "active",
    outstandingAmount: 1800,
  },
];

const complianceLevels = [
  "Full Package",
  "Gas & Electrical",
  "Smoke Alarm Only",
  "Basic Compliance",
];

const Agencies = () => {
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState<AgencyFormData>(initialFormData);

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch = agency.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || agency.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAgency) {
      // Update existing agency
      setAgencies((prevAgencies) =>
        prevAgencies.map((agency) =>
          agency.id === editingAgency.id
            ? {
                ...agency,
                ...formData,
                outstandingAmount: agency.outstandingAmount,
              }
            : agency
        )
      );
    } else {
      // Add new agency
      const newAgency: Agency = {
        id: generateId(),
        ...formData,
        outstandingAmount: 0, // Default outstanding amount for new agencies
      };
      setAgencies((prevAgencies) => [...prevAgencies, newAgency]);
    }

    setShowForm(false);
    setFormData(initialFormData);
    setEditingAgency(null);
  };

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      abn: agency.abn,
      contactPerson: agency.contactPerson,
      contactEmail: agency.contactEmail,
      contactPhone: agency.contactPhone,
      region: agency.region,
      complianceLevel: agency.complianceLevel,
      status: agency.status,
    });
    setShowForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            <p>Manage your property agencies and compliance</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <RiAddLine /> Add New Agency
          </button>
        </div>
      </div>

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
          </select>
        </div>
      </div>

      <div className="agencies-list">
        {filteredAgencies.map((agency) => (
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
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingAgency ? "Edit Agency" : "Add New Agency"}</h2>
              <button
                className="close-button"
                onClick={() => {
                  setShowForm(false);
                  setFormData(initialFormData);
                  setEditingAgency(null);
                }}
              >
                <RiCloseLine />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Agency Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="abn">ABN</label>
                  <input
                    type="text"
                    id="abn"
                    name="abn"
                    value={formData.abn}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactPerson">Contact Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactEmail">Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactPhone">Phone</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="region">Region</label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="complianceLevel">Compliance Level</label>
                  <select
                    id="complianceLevel"
                    name="complianceLevel"
                    value={formData.complianceLevel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Compliance Level</option>
                    {complianceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(initialFormData);
                    setEditingAgency(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingAgency ? "Update Agency" : "Add Agency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agencies;
