import { useState } from "react";
import { 
  RiTeamLine, 
  RiCalendarLine, 
  RiUserAddLine, 
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine
} from "react-icons/ri";
import "./Staff.scss";

interface StaffMember {
  id: string;
  name: string;
  tradeType: string;
  availabilityStatus: "Available" | "Booked" | "Leave";
  regions: string[];
  licensingStatus: "Valid" | "Expired" | "Pending";
  insuranceStatus: "Valid" | "Expired" | "Pending";
  isActive: boolean;
  phone: string;
  email: string;
  startDate: string;
}

const Staff = () => {
  const [activeTab, setActiveTab] = useState("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data - in real app, this would come from an API
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "John Smith",
      tradeType: "Plumber",
      availabilityStatus: "Available",
      regions: ["North", "Central"],
      licensingStatus: "Valid",
      insuranceStatus: "Valid",
      isActive: true,
      phone: "555-0123",
      email: "john.smith@example.com",
      startDate: "2023-01-15"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      tradeType: "Electrician",
      availabilityStatus: "Booked",
      regions: ["South", "East"],
      licensingStatus: "Valid",
      insuranceStatus: "Valid",
      isActive: true,
      phone: "555-0124",
      email: "sarah.johnson@example.com",
      startDate: "2023-03-10"
    },
    {
      id: "3",
      name: "Mike Davis",
      tradeType: "HVAC",
      availabilityStatus: "Leave",
      regions: ["West"],
      licensingStatus: "Expired",
      insuranceStatus: "Valid",
      isActive: false,
      phone: "555-0125",
      email: "mike.davis@example.com",
      startDate: "2022-11-20"
    },
    {
      id: "4",
      name: "Emily Brown",
      tradeType: "General Maintenance",
      availabilityStatus: "Available",
      regions: ["Central", "East"],
      licensingStatus: "Valid",
      insuranceStatus: "Pending",
      isActive: true,
      phone: "555-0126",
      email: "emily.brown@example.com",
      startDate: "2023-05-01"
    }
  ]);

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.tradeType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "active" && staff.isActive) ||
                         (filterBy === "inactive" && !staff.isActive) ||
                         (filterBy === "available" && staff.availabilityStatus === "Available") ||
                         (filterBy === "booked" && staff.availabilityStatus === "Booked") ||
                         (filterBy === "leave" && staff.availabilityStatus === "Leave");
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "status-available";
      case "Booked": return "status-booked";
      case "Leave": return "status-leave";
      case "Valid": return "status-valid";
      case "Expired": return "status-expired";
      case "Pending": return "status-pending";
      default: return "";
    }
  };

  const tabs = [
    { id: "directory", label: "Staff Directory", icon: RiTeamLine },
    { id: "calendar", label: "Availability Calendar", icon: RiCalendarLine },
    { id: "add", label: "Add/Edit Staff", icon: RiUserAddLine },
  ];

  const renderDirectory = () => (
    <div className="staff-directory">
      <div className="directory-header">
        <div className="search-filter-bar">
          <div className="search-input">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or trade type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <RiFilterLine className="filter-icon" />
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
              <option value="all">All Staff</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="leave">On Leave</option>
            </select>
          </div>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setActiveTab("add")}
        >
          <RiUserAddLine /> Add Staff Member
        </button>
      </div>

      <div className="staff-grid">
        {filteredStaff.map(staff => (
          <div key={staff.id} className="staff-card">
            <div className="staff-header">
              <div className="staff-info">
                <h3>{staff.name}</h3>
                <p className="trade-type">{staff.tradeType}</p>
              </div>
              <div className="staff-actions">
                <button className="action-btn view-btn">
                  <RiEyeLine />
                </button>
                <button className="action-btn edit-btn">
                  <RiEditLine />
                </button>
                <button className="action-btn delete-btn">
                  <RiDeleteBinLine />
                </button>
              </div>
            </div>
            
            <div className="staff-details">
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status ${getStatusColor(staff.availabilityStatus)}`}>
                  {staff.availabilityStatus}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Regions:</span>
                <span className="regions">
                  {staff.regions.join(", ")}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Licensing:</span>
                <span className={`status ${getStatusColor(staff.licensingStatus)}`}>
                  {staff.licensingStatus}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Insurance:</span>
                <span className={`status ${getStatusColor(staff.insuranceStatus)}`}>
                  {staff.insuranceStatus}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span>{staff.phone}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{staff.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="availability-calendar">
      <div className="calendar-header">
        <h3>Weekly Availability Calendar</h3>
        <div className="calendar-filters">
          <select className="filter-select">
            <option value="all">All Staff</option>
            {staffMembers.map(staff => (
              <option key={staff.id} value={staff.id}>{staff.name}</option>
            ))}
          </select>
          <select className="filter-select">
            <option value="all">All Regions</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="central">Central</option>
          </select>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-week">
          <div className="day-header">Staff</div>
          <div className="day-header">Mon</div>
          <div className="day-header">Tue</div>
          <div className="day-header">Wed</div>
          <div className="day-header">Thu</div>
          <div className="day-header">Fri</div>
          <div className="day-header">Sat</div>
          <div className="day-header">Sun</div>
        </div>
        
        {filteredStaff.map(staff => (
          <div key={staff.id} className="calendar-row">
            <div className="staff-name">{staff.name}</div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div 
                key={day} 
                className={`day-cell ${staff.availabilityStatus.toLowerCase()}`}
                onClick={() => {
                  // Handle day click for editing availability
                  alert(`Edit availability for ${staff.name} on ${day}`);
                }}
              >
                <div className="availability-indicator"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color leave"></div>
          <span>On Leave</span>
        </div>
      </div>
    </div>
  );

  const renderAddEditForm = () => (
    <div className="add-edit-form">
      <h3>Add New Staff Member</h3>
      <form className="staff-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter full name" />
          </div>
          <div className="form-group">
            <label>Trade Type</label>
            <select>
              <option value="">Select trade type</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="HVAC">HVAC</option>
              <option value="General Maintenance">General Maintenance</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="Enter phone number" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter email address" />
          </div>
          <div className="form-group">
            <label>Availability Status</label>
            <select>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Leave">On Leave</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" />
          </div>
        </div>

        <div className="form-group">
          <label>Service Regions</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" /> North
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> South
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> East
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> West
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Central
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Licensing Documents</label>
          <div className="file-upload">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple />
            <span>Upload licensing documents</span>
          </div>
        </div>

        <div className="form-group">
          <label>Insurance Documents</label>
          <div className="file-upload">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple />
            <span>Upload insurance documents</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add Staff Member
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Staff Directory</h1>
        <p>Manage your team, contractors, and their availability</p>
      </div>

      <div className="staff-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === "directory" && renderDirectory()}
        {activeTab === "calendar" && renderCalendar()}
        {activeTab === "add" && renderAddEditForm()}
      </div>
    </div>
  );
};

export default Staff; 