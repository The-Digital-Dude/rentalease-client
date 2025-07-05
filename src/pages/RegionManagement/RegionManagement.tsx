import { useState } from "react";
import { 
  RiMapPin2Line, 
  RiRoadMapLine, 
  RiTeamLine, 
  RiBarChartLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiEyeLine,
  RiUserLine
} from "react-icons/ri";
import "./RegionManagement.scss";

interface Region {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  postcodes: string[];
  suburbs: string[];
  assignedStaff: string[];
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
}

interface StaffMember {
  id: string;
  name: string;
  tradeType: string;
  regions: string[];
}

interface JobSummary {
  regionId: string;
  regionName: string;
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  scheduledJobs: number;
  overdueJobs: number;
}

const RegionManagement = () => {
  const [activeTab, setActiveTab] = useState("zones");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setShowAddRegionModal] = useState(false);
  // const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Mock data - in real app, this would come from an API
  const [regions] = useState<Region[]>([
    {
      id: "1",
      name: "North Zone",
      description: "Northern suburbs and industrial areas",
      color: "#3b82f6",
      isActive: true,
      postcodes: ["2000", "2001", "2002", "2010", "2011"],
      suburbs: ["Sydney CBD", "The Rocks", "Dawes Point", "Surry Hills", "Darlinghurst"],
      assignedStaff: ["1", "2"],
      totalJobs: 45,
      completedJobs: 32,
      pendingJobs: 13
    },
    {
      id: "2",
      name: "South Zone",
      description: "Southern residential and commercial areas",
      color: "#10b981",
      isActive: true,
      postcodes: ["2015", "2016", "2017", "2020", "2021"],
      suburbs: ["Alexandria", "Redfern", "Waterloo", "Mascot", "Botany"],
      assignedStaff: ["3", "4"],
      totalJobs: 38,
      completedJobs: 25,
      pendingJobs: 13
    },
    {
      id: "3",
      name: "East Zone",
      description: "Eastern beaches and surrounding areas",
      color: "#f59e0b",
      isActive: true,
      postcodes: ["2030", "2031", "2034", "2035", "2036"],
      suburbs: ["Bondi", "Coogee", "Maroubra", "Randwick", "Clovelly"],
      assignedStaff: ["1", "5"],
      totalJobs: 29,
      completedJobs: 18,
      pendingJobs: 11
    },
    {
      id: "4",
      name: "West Zone",
      description: "Western suburbs and growth areas",
      color: "#8b5cf6",
      isActive: false,
      postcodes: ["2145", "2146", "2147", "2148", "2150"],
      suburbs: ["Westmead", "Parramatta", "Harris Park", "Rosehill", "Granville"],
      assignedStaff: [],
      totalJobs: 0,
      completedJobs: 0,
      pendingJobs: 0
    }
  ]);

  const [staffMembers] = useState<StaffMember[]>([
    { id: "1", name: "John Smith", tradeType: "Plumber", regions: ["1", "3"] },
    { id: "2", name: "Sarah Johnson", tradeType: "Electrician", regions: ["1"] },
    { id: "3", name: "Mike Davis", tradeType: "HVAC", regions: ["2"] },
    { id: "4", name: "Emily Brown", tradeType: "General Maintenance", regions: ["2"] },
    { id: "5", name: "David Wilson", tradeType: "Carpenter", regions: ["3"] }
  ]);

  const jobSummaries: JobSummary[] = [
    {
      regionId: "1",
      regionName: "North Zone",
      totalJobs: 45,
      completedJobs: 32,
      inProgressJobs: 8,
      scheduledJobs: 3,
      overdueJobs: 2
    },
    {
      regionId: "2",
      regionName: "South Zone",
      totalJobs: 38,
      completedJobs: 25,
      inProgressJobs: 7,
      scheduledJobs: 4,
      overdueJobs: 2
    },
    {
      regionId: "3",
      regionName: "East Zone",
      totalJobs: 29,
      completedJobs: 18,
      inProgressJobs: 6,
      scheduledJobs: 3,
      overdueJobs: 2
    },
    {
      regionId: "4",
      regionName: "West Zone",
      totalJobs: 0,
      completedJobs: 0,
      inProgressJobs: 0,
      scheduledJobs: 0,
      overdueJobs: 0
    }
  ];


  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: "zones", label: "Region Zones", icon: RiMapPin2Line },
    { id: "clusters", label: "Suburb/Postcode Clusters", icon: RiRoadMapLine },
    { id: "assignments", label: "Staff Assignments", icon: RiTeamLine },
    { id: "reports", label: "Jobs by Region Report", icon: RiBarChartLine },
  ];

  const renderRegionZones = () => (
    <div className="region-zones">
      <div className="zones-header">
        <div className="search-filter-bar">
          <div className="search-input">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddRegionModal(true)}
        >
          <RiAddLine /> Add Region
        </button>
      </div>

      <div className="zones-grid">
        {filteredRegions.map(region => (
          <div key={region.id} className="zone-card">
            <div className="zone-header">
              <div className="zone-info">
                <div className="zone-color" style={{ backgroundColor: region.color }}></div>
                <div>
                  <h3>{region.name}</h3>
                  <p className="zone-description">{region.description}</p>
                </div>
              </div>
              <div className="zone-actions">
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
            
            <div className="zone-stats">
              <div className="stat-item">
                <span className="stat-label">Status:</span>
                <span className={`status ${region.isActive ? 'active' : 'inactive'}`}>
                  {region.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Postcodes:</span>
                <span>{region.postcodes.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Suburbs:</span>
                <span>{region.suburbs.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Staff:</span>
                <span>{region.assignedStaff.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Jobs:</span>
                <span>{region.totalJobs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed:</span>
                <span className="completed-jobs">{region.completedJobs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending:</span>
                <span className="pending-jobs">{region.pendingJobs}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClusters = () => (
    <div className="clusters-management">
      <div className="clusters-header">
        <h3>Suburb/Postcode Clusters</h3>
        <p>Manage suburbs and postcodes within each region</p>
      </div>

      <div className="clusters-list">
        {regions.map(region => (
          <div key={region.id} className="cluster-card">
            <div className="cluster-header">
              <div className="cluster-title">
                <div className="zone-color" style={{ backgroundColor: region.color }}></div>
                <h4>{region.name}</h4>
              </div>
              <button className="btn-secondary">
                <RiEditLine /> Edit Clusters
              </button>
            </div>
            
            <div className="cluster-content">
              <div className="cluster-section">
                <h5>Postcodes ({region.postcodes.length})</h5>
                <div className="cluster-tags">
                  {region.postcodes.map(postcode => (
                    <span key={postcode} className="cluster-tag postcode-tag">
                      {postcode}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="cluster-section">
                <h5>Suburbs ({region.suburbs.length})</h5>
                <div className="cluster-tags">
                  {region.suburbs.map(suburb => (
                    <span key={suburb} className="cluster-tag suburb-tag">
                      {suburb}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStaffAssignments = () => (
    <div className="staff-assignments">
      <div className="assignments-header">
        <h3>Staff Assignments by Region</h3>
        <p>Assign staff members to specific regions</p>
      </div>

      <div className="assignments-grid">
        {regions.map(region => (
          <div key={region.id} className="assignment-card">
            <div className="assignment-header">
              <div className="assignment-title">
                <div className="zone-color" style={{ backgroundColor: region.color }}></div>
                <h4>{region.name}</h4>
              </div>
              <button className="btn-secondary">
                <RiUserLine /> Assign Staff
              </button>
            </div>
            
            <div className="assigned-staff">
              <h5>Assigned Staff ({region.assignedStaff.length})</h5>
              {region.assignedStaff.length > 0 ? (
                <div className="staff-list">
                  {region.assignedStaff.map(staffId => {
                    const staff = staffMembers.find(s => s.id === staffId);
                    return staff ? (
                      <div key={staffId} className="staff-item">
                        <div className="staff-info">
                          <span className="staff-name">{staff.name}</span>
                          <span className="staff-trade">{staff.tradeType}</span>
                        </div>
                        <button className="remove-btn">
                          <RiDeleteBinLine />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="no-staff">No staff assigned to this region</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJobsReport = () => (
    <div className="jobs-report">
      <div className="report-header">
        <h3>Jobs by Region Report</h3>
        <p>Breakdown of jobs due or completed in each region</p>
      </div>

      <div className="report-summary">
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="card-icon">
              <RiBarChartLine />
            </div>
            <div className="card-content">
              <h4>{jobSummaries.reduce((sum, job) => sum + job.totalJobs, 0)}</h4>
              <p>Total Jobs</p>
            </div>
          </div>
          <div className="summary-card completed">
            <div className="card-icon">
              <RiBarChartLine />
            </div>
            <div className="card-content">
              <h4>{jobSummaries.reduce((sum, job) => sum + job.completedJobs, 0)}</h4>
              <p>Completed Jobs</p>
            </div>
          </div>
          <div className="summary-card in-progress">
            <div className="card-icon">
              <RiBarChartLine />
            </div>
            <div className="card-content">
              <h4>{jobSummaries.reduce((sum, job) => sum + job.inProgressJobs, 0)}</h4>
              <p>In Progress</p>
            </div>
          </div>
          <div className="summary-card overdue">
            <div className="card-icon">
              <RiBarChartLine />
            </div>
            <div className="card-content">
              <h4>{jobSummaries.reduce((sum, job) => sum + job.overdueJobs, 0)}</h4>
              <p>Overdue Jobs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="report-table">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Total Jobs</th>
              <th>Completed</th>
              <th>In Progress</th>
              <th>Scheduled</th>
              <th>Overdue</th>
              <th>Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            {jobSummaries.map(job => {
              const completionRate = job.totalJobs > 0 ? (job.completedJobs / job.totalJobs * 100).toFixed(1) : '0.0';
              const region = regions.find(r => r.id === job.regionId);
              
              return (
                <tr key={job.regionId}>
                  <td>
                    <div className="region-cell">
                      <div className="zone-color" style={{ backgroundColor: region?.color }}></div>
                      {job.regionName}
                    </div>
                  </td>
                  <td>{job.totalJobs}</td>
                  <td>
                    <span className="job-count completed">{job.completedJobs}</span>
                  </td>
                  <td>
                    <span className="job-count in-progress">{job.inProgressJobs}</span>
                  </td>
                  <td>
                    <span className="job-count scheduled">{job.scheduledJobs}</span>
                  </td>
                  <td>
                    <span className="job-count overdue">{job.overdueJobs}</span>
                  </td>
                  <td>
                    <div className="completion-rate">
                      <span>{completionRate}%</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Region Management</h1>
        <p>Manage service regions, staff assignments, and job allocation</p>
      </div>

      <div className="region-tabs">
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
        {activeTab === "zones" && renderRegionZones()}
        {activeTab === "clusters" && renderClusters()}
        {activeTab === "assignments" && renderStaffAssignments()}
        {activeTab === "reports" && renderJobsReport()}
      </div>
    </div>
  );
};

export default RegionManagement; 