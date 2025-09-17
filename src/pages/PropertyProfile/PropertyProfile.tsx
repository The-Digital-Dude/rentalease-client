import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiHomeLine,
  RiUser3Line,
  RiShieldCheckLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiMoneyDollarBoxLine,
  RiFileListLine,
  RiUploadLine,
  RiDownloadLine,
} from "react-icons/ri";
import propertyService, {
  type Property,
  type PropertyDocument,
} from "../../services/propertyService";
import { formatDateTime } from "../../utils";
import "./PropertyProfile.scss";
import jobService from "../../services/jobService";
import type { Job } from "../../services/jobService";
import toast from "react-hot-toast";

const PropertyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [documentUploading, setDocumentUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProperty = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await propertyService.getProperty(id);
      if (response.status === "success") {
        setProperty(response.data.property);
        setDocuments(response.data.property.documents ?? []);
      } else {
        setError(response.message || "Failed to load property");
        setProperty(null);
        setDocuments([]);
      }
    } catch (loadError: any) {
      console.error("Error loading property:", loadError);
      setError(loadError.message || "Failed to load property");
      setProperty(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadJobs = useCallback(async () => {
    if (!id) return;

    try {
      setJobsLoading(true);
      setJobsError(null);
      const response = await jobService.getJobs({ property: id, limit: 100 });
      if (response.success && Array.isArray(response.data)) {
        const jobsData = response.data.filter(
          (item: any) => item.job_id && item.property && item.jobType
        ) as Job[];
        setJobs(jobsData);
      } else {
        setJobsError(response.message || "Failed to load jobs");
        setJobs([]);
      }
    } catch (loadJobsError: any) {
      setJobsError(loadJobsError.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
    loadJobs();
  }, [loadProperty, loadJobs]);

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "compliant";
      case "Due Soon":
        return "due-soon";
      case "Overdue":
        return "overdue";
      case "Not Required":
        return "not-required";
      default:
        return "default";
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit property:", property?.id);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Add quick action handlers (mocked for now)
  const handleCreateJob = () => alert("Create Job action");
  const handleContactTenant = () => alert("Contact Tenant action");
  const handleContactLandlord = () => alert("Contact Landlord action");
  const handleContactAgency = () => alert("Contact Agency action");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocumentUpload = async (files: File[]) => {
    if (!id || files.length === 0) {
      return;
    }

    try {
      setDocumentUploading(true);
      const responses = await Promise.all(
        files.map((file) => propertyService.uploadDocument(id, file))
      );

      const latest = responses[responses.length - 1];

      if (latest?.status === "success") {
        const updatedProperty = latest.data.property;
        setProperty(updatedProperty);
        setDocuments(updatedProperty.documents ?? []);
        toast.success(
          files.length === 1
            ? "Document uploaded successfully."
            : `${files.length} documents uploaded successfully.`
        );
      } else {
        toast.error(latest?.message || "Failed to upload documents.");
      }
    } catch (uploadError: any) {
      console.error("Document upload error:", uploadError);
      toast.error(uploadError?.message || "Failed to upload documents.");
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length) {
      void handleDocumentUpload(selectedFiles);
    }
    event.target.value = "";
  };

  const formatFileSize = (size?: number) => {
    if (!size || Number.isNaN(size)) {
      return "—";
    }
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to group jobs
  const upcomingJobs = jobs.filter(
    (job) => job.status === "Pending" || job.status === "Scheduled"
  );
  const historyJobs = jobs.filter(
    (job) => job.status === "Completed" || job.status === "Overdue"
  );

  // Add mock billing data
  const mockBilling = [
    {
      date: "2024-04-01",
      type: "Rent",
      amount: 2200,
      status: "Paid",
      notes: "April rent",
    },
    {
      date: "2024-03-01",
      type: "Rent",
      amount: 2200,
      status: "Paid",
      notes: "March rent",
    },
    {
      date: "2024-02-01",
      type: "Rent",
      amount: 2200,
      status: "Paid",
      notes: "February rent",
    },
    {
      date: "2024-01-15",
      type: "Maintenance",
      amount: 350,
      status: "Paid",
      notes: "Plumbing repair",
    },
    {
      date: "2024-01-01",
      type: "Rent",
      amount: 2200,
      status: "Paid",
      notes: "January rent",
    },
    {
      date: "2023-12-01",
      type: "Rent",
      amount: 2200,
      status: "Paid",
      notes: "December rent",
    },
    {
      date: "2023-11-01",
      type: "Rent",
      amount: 2200,
      status: "Paid",
      notes: "November rent",
    },
    {
      date: "2023-10-01",
      type: "Rent",
      amount: 2200,
      status: "Paid",
      notes: "October rent",
    },
  ];

  // Add mock activity log data
  const mockActivityLog = [
    {
      date: "2024-04-01",
      event: "Rent paid",
      details: "April rent received from tenant.",
    },
    {
      date: "2024-03-15",
      event: "Maintenance completed",
      details: "Plumbing repair completed by technician.",
    },
    {
      date: "2024-02-15",
      event: "Smoke alarm inspection",
      details: "Annual smoke alarm inspection passed.",
    },
    {
      date: "2024-01-10",
      event: "Gas compliance certificate uploaded",
      details: "New certificate uploaded by agency.",
    },
    {
      date: "2023-12-20",
      event: "Pool safety certificate uploaded",
      details: "Certificate uploaded by landlord.",
    },
    {
      date: "2023-11-01",
      event: "Tenant moved in",
      details: "Lease started for current tenant.",
    },
  ];

  // Add mock gallery images
  const mockGallery = [
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      alt: "Front view",
    },
    {
      url: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=400&q=80",
      alt: "Living room",
    },
    {
      url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80",
      alt: "Kitchen",
    },
    {
      url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=400&q=80",
      alt: "Bedroom",
    },
    {
      url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
      alt: "Backyard",
    },
  ];

  // Add mock tags and notes
  const mockTags = ["Premium", "Long-term Tenant", "No Pets", "Renovated"];
  const mockInternalNotes =
    "This property is a high-value asset with a reliable tenant. Consider for future investment upgrades.";

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Error Loading Property</h2>
          <p>{error || "Property not found"}</p>
          <button onClick={handleBack} className="btn btn-primary">
            <RiArrowLeftLine />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container property-profile-page">
      {/* Header */}
      <div className="profile-header redesigned-header">
        <button onClick={handleBack} className="back-btn">
          <RiArrowLeftLine />
          Back
        </button>
        <div className="header-content">
          <h1>{property.address.fullAddress}</h1>
          <p className="property-type">{property.propertyType}</p>
        </div>
        {/* <div className="header-actions">
          <button onClick={handleEdit} className="edit-btn main-action">
            <RiEditLine />
            Edit Property
          </button>
        </div> */}
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <h2>
            <RiHomeLine />
            Property Information
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Address</label>
              <p>{property.address.fullAddress}</p>
            </div>
            <div className="info-item">
              <label>Property Type</label>
              <p>{property.propertyType}</p>
            </div>
            <div className="info-item">
              <label>Region</label>
              <p>{property.region}</p>
            </div>
          </div>
        </div>

        {/* Agency */}
        <div className="profile-section">
          <h2>
            <RiUser3Line />
            Agency
          </h2>
          <div className="contact-card">
            <div className="contact-info">
              <h3>{property.agency.companyName}</h3>
              <p className="contact-person">{property.agency.contactPerson}</p>
              <div className="contact-details">
                <div className="contact-item">
                  <RiMailLine />
                  <span>{property.agency.email}</span>
                </div>
                <div className="contact-item">
                  <RiPhoneLine />
                  <span>{property.agency.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Information */}
        {property.currentTenant && (
          <div className="profile-section">
            <h2>
              <RiUser3Line />
              Current Tenant
            </h2>
            <div className="contact-card">
              <div className="contact-info">
                <h3>{property.currentTenant.name}</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <RiMailLine />
                    <span>{property.currentTenant.email}</span>
                  </div>
                  <div className="contact-item">
                    <RiPhoneLine />
                    <span>{property.currentTenant.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Landlord Information */}
        {property.currentLandlord && (
          <div className="profile-section">
            <h2>
              <RiUser3Line />
              Landlord
            </h2>
            <div className="contact-card">
              <div className="contact-info">
                <h3>{property.currentLandlord.name}</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <RiMailLine />
                    <span>{property.currentLandlord.email}</span>
                  </div>
                  <div className="contact-item">
                    <RiPhoneLine />
                    <span>{property.currentLandlord.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Schedule */}
        <div className="profile-section">
          <h2>
            <RiShieldCheckLine />
            Next Compliance Schedule
          </h2>
          <div className="compliance-grid">
            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.gasCompliance?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Gas Compliance</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.gasCompliance?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.gasCompliance?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.gasCompliance?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.gasCompliance.nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.electricalSafety?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Electrical Safety</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.electricalSafety?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.electricalSafety?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.electricalSafety
                ?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.electricalSafety
                        .nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            <div
              className={`compliance-card ${getComplianceStatusColor(
                property.complianceSchedule?.smokeAlarms?.status ||
                  "Not Required"
              )}`}
            >
              <h3>Smoke Alarms</h3>
              <div className="compliance-status">
                <span
                  className={`status-badge ${getComplianceStatusColor(
                    property.complianceSchedule?.smokeAlarms?.status ||
                      "Not Required"
                  )}`}
                >
                  {property.complianceSchedule?.smokeAlarms?.status ||
                    "Not Required"}
                </span>
              </div>
              {property.complianceSchedule?.smokeAlarms?.nextInspection && (
                <div className="inspection-date">
                  <RiCalendarLine />
                  <span>
                    Next Inspection:{" "}
                    {formatDateTime(
                      property.complianceSchedule.smokeAlarms.nextInspection
                    )}
                  </span>
                </div>
              )}
            </div>

            {property.complianceSchedule?.poolSafety?.required && (
              <div
                className={`compliance-card ${getComplianceStatusColor(
                  property.complianceSchedule?.poolSafety?.status ||
                    "Not Required"
                )}`}
              >
                <h3>Pool Safety</h3>
                <div className="compliance-status">
                  <span
                    className={`status-badge ${getComplianceStatusColor(
                      property.complianceSchedule?.poolSafety?.status ||
                        "Not Required"
                    )}`}
                  >
                    {property.complianceSchedule?.poolSafety?.status ||
                      "Not Required"}
                  </span>
                </div>
                {property.complianceSchedule?.poolSafety?.nextInspection && (
                  <div className="inspection-date">
                    <RiCalendarLine />
                    <span>
                      Next Inspection:{" "}
                      {formatDateTime(
                        property.complianceSchedule.poolSafety.nextInspection
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {property.notes && (
          <div className="profile-section">
            <h2>Notes</h2>
            <div className="notes-content">
              <p>{property.notes}</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="profile-section">
          <h2>Property Details</h2>
          <div className="metadata-grid">
            <div className="metadata-item">
              <label>Created</label>
              <p>{formatDateTime(property.createdAt)}</p>
            </div>
            {property.updatedAt && (
              <div className="metadata-item">
                <label>Last Updated</label>
                <p>{formatDateTime(property.updatedAt)}</p>
              </div>
            )}
            {property.hasOverdueCompliance && (
              <div className="metadata-item">
                <label>Compliance Status</label>
                <p className="status overdue">Has Overdue Compliance</p>
              </div>
            )}
          </div>
        </div>

        {/* Jobs Section */}
        <div className="profile-section">
          <h2>
            <RiCalendarLine /> Jobs
          </h2>
          {jobsLoading ? (
            <div>Loading jobs...</div>
          ) : jobsError ? (
            <div className="error-state">{jobsError}</div>
          ) : (
            <>
              <h3>Job History</h3>
              {jobs.length === 0 ? (
                <div>No job history.</div>
              ) : (
                <table className="jobs-table">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Type</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Technician</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>{job.job_id}</td>
                        <td>{job.jobType}</td>
                        <td>{formatDateTime(job.dueDate)}</td>
                        <td>{job.status}</td>
                        <td>{job.priority}</td>
                        <td>
                          {typeof job.assignedTechnician === "string"
                            ? job.assignedTechnician
                            : job.assignedTechnician?.fullName || "Unassigned"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Billing/Payment History Section */}
        <div className="profile-section">
          <h2>
            <RiMoneyDollarBoxLine /> Billing & Payment History
          </h2>
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {mockBilling.map((bill, idx) => (
                <tr key={idx}>
                  <td>{bill.date}</td>
                  <td>{bill.type}</td>
                  <td>${bill.amount.toLocaleString()}</td>
                  <td>{bill.status}</td>
                  <td>{bill.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="profile-section">
          <h2>
            <RiFileListLine /> Documents
          </h2>
          <div className="documents-upload">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              hidden
            />
            <button
              type="button"
              className="documents-upload__button"
              onClick={handleUploadClick}
              disabled={documentUploading}
            >
              <RiUploadLine />
              <span>{documentUploading ? "Uploading…" : "Upload documents"}</span>
            </button>
            <p className="documents-upload__hint">
              Supports PDF, DOC, DOCX, JPG, PNG (max 10MB per file)
            </p>
          </div>

          {documents.length > 0 ? (
            <div className="documents-list">
              {documents.map((doc) => (
                <div
                  key={doc.id || doc.url || `${doc.name}-${doc.uploadDate}`}
                  className="document-item"
                >
                  <div className="document-info">
                    <div className="document-header">
                      <span className="document-name">{doc.name}</span>
                      <span className="document-size">{formatFileSize(doc.size)}</span>
                    </div>
                    <div className="document-meta">
                      <span className="document-type">{doc.type || "Document"}</span>
                      {doc.uploadDate && (
                        <span className="document-date">
                          {formatDateTime(doc.uploadDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  {doc.url ? (
                    <button
                      type="button"
                      className="download-btn"
                      title="Download"
                      onClick={() => window.open(doc.url!, "_blank", "noopener")}
                    >
                      <RiDownloadLine />
                    </button>
                  ) : (
                    <button type="button" className="download-btn" disabled>
                      <RiDownloadLine />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="documents-empty">No documents uploaded yet.</div>
          )}
        </div>

        {/* Activity Log Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiCalendarLine /> Activity Log
          </h2>
          <div className="activity-log">
            {mockActivityLog.map((log, idx) => (
              <div className="activity-log-item" key={idx}>
                <div className="activity-log-date">{log.date}</div>
                <div className="activity-log-event">{log.event}</div>
                <div className="activity-log-details">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Map Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiMapPinLine /> Location Map
          </h2>
          <div
            style={{
              width: "100%",
              height: 320,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <iframe
              title="Property Location"
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                property.address.fullAddress || ""
              )}&output=embed`}
            ></iframe>
          </div>
        </div>
        */}

        {/* Gallery Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiHomeLine /> Property Gallery
          </h2>
          <div className="property-gallery">
            {mockGallery.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.alt}
                className="gallery-img"
                style={{
                  width: 160,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginRight: 12,
                  marginBottom: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              />
            ))}
          </div>
        </div>
        */}

        {/* Notes/Tags Section */}
        {/*
        <div className="profile-section">
          <h2>
            <RiFileListLine /> Internal Notes & Tags
          </h2>
          <div style={{ marginBottom: 12 }}>
            {mockTags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  background: "#f1c40f",
                  color: "#2c3e50",
                  borderRadius: 12,
                  padding: "4px 12px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  marginRight: 8,
                  marginBottom: 4,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <textarea
            value={mockInternalNotes}
            readOnly
            style={{
              width: "100%",
              minHeight: 60,
              borderRadius: 8,
              border: "1px solid #e1e5e9",
              padding: 10,
              fontSize: "1rem",
              color: "#374151",
              background: "#fffbe6",
            }}
          />
        </div>
        */}
      </div>
    </div>
  );
};

export default PropertyProfile;
