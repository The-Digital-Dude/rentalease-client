import React, { useState, useRef } from "react";
import { 
  RiEditLine, 
  RiEyeLine, 
  RiMailLine, 
  RiMessage3Line, 
  RiFileTextLine,
  RiDownloadLine,
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiUploadLine,
  RiErrorWarningLine,
  RiUserAddLine,
} from "react-icons/ri";
import { formatDateTime } from "../../utils";
import propertyService from "../../services/propertyService";
import toast from "react-hot-toast";
import AssignTeamMemberModal from "../AssignTeamMemberModal/AssignTeamMemberModal";
import "./PropertyCard.scss";

export interface Property {
  id: string;
  address: {
    street: string;
    suburb: string;
    state: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "NT" | "ACT";
    postcode: string;
    fullAddress: string;
  };
  propertyType: "House" | "Apartment" | "Townhouse" | "Commercial" | "Other";
  agency: {
    _id: string;
    companyName: string;
    contactPerson: string;
    email?: string;
    phone?: string;
  };
  propertyManager?: string;
  assignedTeamMember?: {
    _id: string;
    name: string;
  };
  bedrooms?: number;
  rentAmount?: number;
  region:
    | "Sydney Metro"
    | "Melbourne Metro"
    | "Brisbane Metro"
    | "Perth Metro"
    | "Adelaide Metro"
    | "Darwin Metro"
    | "Hobart Metro"
    | "Canberra Metro"
    | "Regional NSW"
    | "Regional VIC"
    | "Regional QLD"
    | "Regional WA"
    | "Regional SA"
    | "Regional NT"
    | "Regional TAS";
  currentTenant?: {
    name: string;
    email: string;
    phone: string;
  };
  currentLandlord?: {
    name: string;
    email: string;
    phone: string;
  };
  complianceSchedule: {
    gasCompliance: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
    electricalSafety: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
    smokeAlarms: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
    poolSafety: {
      nextInspection?: string;
      required: boolean;
      status: "Compliant" | "Due Soon" | "Overdue" | "Not Required";
    };
  };
  notes?: string;
  hasDoubt?: boolean;
  emails?: Array<{
    id: string;
    subject: string;
    from: string;
    to: string;
    date: string;
    content?: string;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    content: string;
    date: string;
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    url?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onView?: (property: Property) => void;
  showActions?: boolean;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onView,
  showActions = true,
  className = "",
}) => {
  const [showEmails, setShowEmails] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDocuments, setShowDocuments] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasDoubt, setHasDoubt] = useState(property.hasDoubt);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = files.map((file) =>
      propertyService.uploadDocument(property.id, file)
    );

    try {
      await Promise.all(uploadPromises);
      toast.success("Document(s) uploaded successfully!");
      // TODO: Refresh property data to show new documents
    } catch (error) {
      toast.error("Failed to upload one or more documents.");
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleDoubt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await propertyService.togglePropertyDoubt(property.id);
      if (response.status === "success") {
        setHasDoubt(response.data.property.hasDoubt);
        toast.success("Property doubt status updated.");
      }
    } catch (error) {
      toast.error("Failed to update doubt status.");
    }
  };

  const handleAssignTeamMember = async (teamMemberId: string) => {
    try {
      const response = await propertyService.assignTeamMember(
        property.id,
        teamMemberId
      );
      if (response.status === "success") {
        toast.success("Team member assigned successfully.");
        // TODO: Refresh property data to show new assigned team member
      }
      setShowAssignModal(false);
    } catch (error) {
      toast.error("Failed to assign team member.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };
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

  return (
    <div
      className={`property-card ${className}${onView ? " clickable" : ""}${hasDoubt ? " has-doubt" : ""}`}
      onClick={onView ? () => onView(property) : undefined}
    >
      <div className="property-header">
        <div className="property-info">
          <h4>{property.address.fullAddress}</h4>
          <p className="property-type">{property.propertyType}</p>
        </div>
        {showActions && onEdit && (
          <div className="property-quick-actions">
            <button
              className={`quick-action-btn doubt-btn ${hasDoubt ? "active" : ""}`}
              onClick={handleToggleDoubt}
              title="Toggle Doubt Status"
            >
              <RiErrorWarningLine />
            </button>
            <button
              className="quick-action-btn edit"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onEdit(property);
              }}
              title="Edit Property"
            >
              <RiEditLine />
            </button>
            <button
              className="quick-action-btn assign-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowAssignModal(true);
              }}
              title="Assign Team Member"
            >
              <RiUserAddLine />
            </button>
          </div>
        )}
      </div>

      {/* Notes Section - Display under property address as requested */}
      {property.notes && (
        <div className="property-notes">
          <p className="notes-text">{property.notes}</p>
        </div>
      )}

      <div className="property-details">
        <div className="detail-row">
          <span>Region:</span>
          <span>{property.region}</span>
        </div>
        <div className="detail-row">
          <span>Agency:</span>
          <span>{property.agency?.companyName || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span>Assigned Team Member:</span>
          <span>{property.assignedTeamMember?.name || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span>Tenant:</span>
          <div className="contact-details">
            <span className="contact-name">
              {property.currentTenant?.name || "Vacant"}
            </span>
            {property.currentTenant && (
              <div className="contact-info">
                <span className="contact-email">
                  {property.currentTenant.email}
                </span>
                <span className="contact-phone">
                  {property.currentTenant.phone}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="detail-row">
          <span>Landlord:</span>
          <div className="contact-details">
            <span className="contact-name">
              {property.currentLandlord?.name || "N/A"}
            </span>
            {property.currentLandlord && (
              <div className="contact-info">
                <span className="contact-email">
                  {property.currentLandlord.email}
                </span>
                <span className="contact-phone">
                  {property.currentLandlord.phone}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Communication & Documents Section */}
      <div className="property-communication">
        {/* Emails Section */}
        <div className="communication-section">
          <div
            className="section-header"
            onClick={(e) => {
              e.stopPropagation();
              setShowEmails(!showEmails);
            }}
          >
            <div className="section-title">
              <RiMailLine />
              <span>Emails ({property.emails?.length || 0})</span>
            </div>
            <button className="expand-btn">
              {showEmails ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
            </button>
          </div>
          {showEmails && (
            <div className="section-content">
              {property.emails?.length ? (
                property.emails
                  .slice(0, 3)
                  .map((email) => (
                    <div key={email.id} className="email-item">
                      <div className="email-header">
                        <span className="email-subject">{email.subject}</span>
                        <span className="email-date">
                          {formatDateTime(email.date)}
                        </span>
                      </div>
                      <div className="email-meta">
                        <span>From: {email.from}</span>
                        <span>To: {email.to}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="no-items">No emails found</p>
              )}
              <button className="add-item-btn">
                <RiAddLine />
                Add Email
              </button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="communication-section">
          <div
            className="section-header"
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
          >
            <div className="section-title">
              <RiMessage3Line />
              <span>Comments ({property.comments?.length || 0})</span>
            </div>
            <button className="expand-btn">
              {showComments ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
            </button>
          </div>
          {showComments && (
            <div className="section-content">
              {property.comments?.length ? (
                property.comments
                  .slice(0, 3)
                  .map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">
                          {comment.author}
                        </span>
                        <span className="comment-date">
                          {formatDateTime(comment.date)}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))
              ) : (
                <p className="no-items">No comments found</p>
              )}
              <button className="add-item-btn">
                <RiAddLine />
                Add Comment
              </button>
            </div>
          )}
        </div>

        {/* Documents Section with Drag & Drop */}
        <div className="communication-section">
          <div
            className="section-header"
            onClick={(e) => {
              e.stopPropagation();
              setShowDocuments(!showDocuments);
            }}
          >
            <div className="section-title">
              <RiFileTextLine />
              <span>Documents ({property.documents?.length || 0})</span>
            </div>
            <button className="expand-btn">
              {showDocuments ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
            </button>
          </div>
          {showDocuments && (
            <div className="section-content">
              {/* Drag and Drop Zone */}
              <div
                className={`drag-drop-zone ${isDragOver ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.stopPropagation();
                  handleDragOver(e);
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  handleDragLeave(e);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <div className="drag-drop-content">
                  <RiUploadLine />
                  <p>
                    <strong>Drag & drop files here</strong> or click to browse
                  </p>
                  <span>Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="upload-status">
                  <div className="spinner"></div>
                  <p>Uploading documents...</p>
                </div>
              )}

              {/* Existing Documents List */}
              {property.documents?.length ? (
                <div className="documents-list">
                  {property.documents
                    .slice(0, 3)
                    .map((document) => (
                      <div key={document.id} className="document-item">
                        <div className="document-info">
                          <div className="document-header">
                            <span className="document-name">
                              {document.name}
                            </span>
                            <span className="document-size">
                              {(document.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="document-meta">
                            <span className="document-type">
                              {document.type}
                            </span>
                            <span className="document-date">
                              {formatDateTime(document.uploadDate)}
                            </span>
                          </div>
                        </div>
                        <button className="download-btn" title="Download">
                          <RiDownloadLine />
                        </button>
                      </div>
                    ))}
                  {property.documents.length > 3 && (
                    <div className="more-documents">
                      <span>
                        +{property.documents.length - 3} more documents
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-documents">
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="compliance-section">
        <h5>Compliance Status</h5>
        <div className="compliance-items">
          <div
            className={`compliance-item ${getComplianceStatusColor(
              property.complianceSchedule.gasCompliance.status
            )}`}
          >
            <span className="compliance-type">Gas</span>
            <span className="compliance-status">
              {property.complianceSchedule.gasCompliance.status}
            </span>
            {property.complianceSchedule.gasCompliance.nextInspection && (
              <span className="compliance-date">
                {formatDateTime(
                  property.complianceSchedule.gasCompliance.nextInspection
                )}
              </span>
            )}
          </div>
          <div
            className={`compliance-item ${getComplianceStatusColor(
              property.complianceSchedule.electricalSafety.status
            )}`}
          >
            <span className="compliance-type">Electrical</span>
            <span className="compliance-status">
              {property.complianceSchedule.electricalSafety.status}
            </span>
            {property.complianceSchedule.electricalSafety.nextInspection && (
              <span className="compliance-date">
                {formatDateTime(
                  property.complianceSchedule.electricalSafety.nextInspection
                )}
              </span>
            )}
          </div>
          <div
            className={`compliance-item ${getComplianceStatusColor(
              property.complianceSchedule.smokeAlarms.status
            )}`}
          >
            <span className="compliance-type">Smoke</span>
            <span className="compliance-status">
              {property.complianceSchedule.smokeAlarms.status}
            </span>
            {property.complianceSchedule.smokeAlarms.nextInspection && (
              <span className="compliance-date">
                {formatDateTime(
                  property.complianceSchedule.smokeAlarms.nextInspection
                )}
              </span>
            )}
          </div>
          {property.complianceSchedule.poolSafety.required && (
            <div
              className={`compliance-item ${getComplianceStatusColor(
                property.complianceSchedule.poolSafety.status
              )}`}
            >
              <span className="compliance-type">Pool Safety</span>
              <span className="compliance-status">
                {property.complianceSchedule.poolSafety.status}
              </span>
              {property.complianceSchedule.poolSafety.nextInspection && (
                <span className="compliance-date">
                  {formatDateTime(
                    property.complianceSchedule.poolSafety.nextInspection
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {showActions && onEdit && (
        <div className="property-actions">
          <button
            className="action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(property);
            }}
          >
            <RiEditLine />
            Edit Property
          </button>
        </div>
      )}
      <AssignTeamMemberModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignTeamMember}
        propertyId={property.id}
      />
    </div>
  );
};

export default PropertyCard;