import { useState } from "react";
import { RiAddLine, RiSearchLine, RiFilterLine } from "react-icons/ri";
import { AgencyFormModal } from "../../components";
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
  {
    id: "3",
    name: "Brisbane Property Partners",
    abn: "45 789 123 456",
    contactPerson: "Michael Chen",
    contactEmail: "m.chen@brisbaneproperty.com",
    contactPhone: "0434 567 890",
    region: "Brisbane Metro",
    complianceLevel: "Smoke Alarm Only",
    status: "active",
    outstandingAmount: 950,
  },
  {
    id: "4",
    name: "Perth Home Solutions",
    abn: "78 456 789 123",
    contactPerson: "Emma Wilson",
    contactEmail: "emma@perthsolutions.com",
    contactPhone: "0456 789 012",
    region: "Perth Metro",
    complianceLevel: "Basic Compliance",
    status: "inactive",
    outstandingAmount: 0,
  },
  {
    id: "5",
    name: "Adelaide Elite Properties",
    abn: "23 678 901 234",
    contactPerson: "David Thompson",
    contactEmail: "david@adelaideelite.com",
    contactPhone: "0467 890 123",
    region: "Adelaide Metro",
    complianceLevel: "Full Package",
    status: "active",
    outstandingAmount: 3200,
  },
  {
    id: "6",
    name: "Gold Coast Rentals",
    abn: "56 901 234 567",
    contactPerson: "Lisa Rodriguez",
    contactEmail: "lisa@goldcoastrentals.com",
    contactPhone: "0478 901 234",
    region: "Gold Coast",
    complianceLevel: "Gas & Electrical",
    status: "active",
    outstandingAmount: 1250,
  },
  {
    id: "7",
    name: "Canberra Capital Properties",
    abn: "89 234 567 890",
    contactPerson: "James Anderson",
    contactEmail: "james@canberracapital.com",
    contactPhone: "0489 012 345",
    region: "Australian Capital Territory",
    complianceLevel: "Full Package",
    status: "active",
    outstandingAmount: 4100,
  },
  {
    id: "8",
    name: "Newcastle Property Group",
    abn: "34 567 890 123",
    contactPerson: "Rachel Green",
    contactEmail: "rachel@newcastlegroup.com",
    contactPhone: "0401 234 567",
    region: "Newcastle",
    complianceLevel: "Smoke Alarm Only",
    status: "inactive",
    outstandingAmount: 750,
  },
  {
    id: "9",
    name: "Darwin Territory Homes",
    abn: "67 890 123 456",
    contactPerson: "Mark O'Connor",
    contactEmail: "mark@darwinhomes.com",
    contactPhone: "0412 345 678",
    region: "Northern Territory",
    complianceLevel: "Basic Compliance",
    status: "active",
    outstandingAmount: 1650,
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

  const handleFormSubmit = (formData: {
    name: string;
    abn: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    region: string;
    complianceLevel: string;
    status: "active" | "inactive";
  }) => {
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
    setEditingAgency(null);
  };

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingAgency(null);
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
