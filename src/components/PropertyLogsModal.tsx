import React, { useState, useEffect } from "react";
import {
  RiCloseLine,
  RiHistoryLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiUserLine,
  RiCalendarLine,
  RiArrowRightLine,
} from "react-icons/ri";
import propertyService, {
  type PropertyLog,
  type PropertyLogChange,
} from "../services/propertyService";
import { formatDateTime } from "../utils";
import "./PropertyLogsModal.scss";

interface PropertyLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyAddress: string;
}

const PropertyLogsModal: React.FC<PropertyLogsModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyAddress,
}) => {
  const [logs, setLogs] = useState<PropertyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, propertyId, filterType, currentPage]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: 10,
      };

      if (filterType && filterType !== "all") {
        filters.changeType = filterType;
      }

      const response = await propertyService.getPropertyLogs(propertyId, filters);

      if (response.status === "success") {
        setLogs(response.data.logs);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        setError(response.message || "Failed to load logs");
      }
    } catch (err: any) {
      console.error("Error loading property logs:", err);
      setError(err.message || "Failed to load property logs");
    } finally {
      setLoading(false);
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const getChangeTypeLabel = (changeType: string) => {
    const typeLabels: { [key: string]: string } = {
      property_created: "Property Created",
      agency_changed: "Agency Changed",
      tenant_changed: "Tenant Changed",
      landlord_changed: "Landlord Changed",
      property_manager_changed: "Property Manager Changed",
      address_changed: "Address Changed",
      compliance_updated: "Compliance Updated",
      property_type_changed: "Property Type Changed",
      region_changed: "Region Changed",
      notes_updated: "Notes Updated",
    };

    return typeLabels[changeType] || changeType;
  };

  const getChangeTypeColor = (changeType: string) => {
    if (changeType === "property_created") return "created";
    if (
      changeType === "agency_changed" ||
      changeType === "tenant_changed" ||
      changeType === "landlord_changed" ||
      changeType === "property_manager_changed"
    )
      return "important";
    if (changeType === "compliance_updated") return "compliance";
    return "default";
  };

  const renderChangeValue = (value: any) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderSnapshotDetails = (log: PropertyLog) => {
    if (!log.previousSnapshot) return null;

    const { agency, tenant, landlord, propertyManager } = log.previousSnapshot;

    return (
      <div className="log-snapshot">
        <h4>Previous Values:</h4>
        {agency && (
          <div className="snapshot-section">
            <strong>Agency:</strong>
            <div className="snapshot-details">
              <p>Name: {agency.name}</p>
              {agency.email && <p>Email: {agency.email}</p>}
              {agency.phone && <p>Phone: {agency.phone}</p>}
            </div>
          </div>
        )}
        {tenant && (
          <div className="snapshot-section">
            <strong>Tenant:</strong>
            <div className="snapshot-details">
              <p>Name: {tenant.name}</p>
              <p>Email: {tenant.email}</p>
              <p>Phone: {tenant.phone}</p>
            </div>
          </div>
        )}
        {landlord && (
          <div className="snapshot-section">
            <strong>Landlord:</strong>
            <div className="snapshot-details">
              <p>Name: {landlord.name}</p>
              <p>Email: {landlord.email}</p>
              <p>Phone: {landlord.phone}</p>
            </div>
          </div>
        )}
        {propertyManager && (
          <div className="snapshot-section">
            <strong>Property Manager:</strong>
            <div className="snapshot-details">
              <p>Name: {propertyManager.name}</p>
              {propertyManager.email && <p>Email: {propertyManager.email}</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="property-logs-modal-overlay" onClick={onClose}>
      <div
        className="property-logs-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <RiHistoryLine />
            <div>
              <h2>Property Change History</h2>
              <p className="property-address">{propertyAddress}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <div className="modal-filters">
          <label>Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Changes</option>
            <option value="agency_changed">Agency Changes</option>
            <option value="tenant_changed">Tenant Changes</option>
            <option value="landlord_changed">Landlord Changes</option>
            <option value="property_manager_changed">Property Manager Changes</option>
            <option value="compliance_updated">Compliance Updates</option>
            <option value="address_changed">Address Changes</option>
          </select>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading change history...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <RiHistoryLine />
              <p>No change history found for this property.</p>
            </div>
          ) : (
            <div className="logs-list">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className={`log-item ${getChangeTypeColor(log.changeType)}`}
                >
                  <div
                    className="log-header"
                    onClick={() => toggleLogExpansion(log._id)}
                  >
                    <div className="log-main-info">
                      <span
                        className={`log-type-badge ${getChangeTypeColor(
                          log.changeType
                        )}`}
                      >
                        {getChangeTypeLabel(log.changeType)}
                      </span>
                      <p className="log-description">{log.description}</p>
                    </div>
                    <div className="log-meta">
                      <div className="log-meta-item">
                        <RiCalendarLine />
                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>
                      <div className="log-meta-item">
                        <RiUserLine />
                        <span>{log.changedBy.userName}</span>
                        <span className="user-type">
                          ({log.changedBy.userType})
                        </span>
                      </div>
                      <button className="expand-btn">
                        {expandedLogId === log._id ? (
                          <RiArrowUpSLine />
                        ) : (
                          <RiArrowDownSLine />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedLogId === log._id && (
                    <div className="log-details">
                      {log.changes && log.changes.length > 0 && (
                        <div className="log-changes">
                          <h4>Changes:</h4>
                          {log.changes.map((change, index) => (
                            <div key={index} className="change-item">
                              <div className="change-label">
                                {change.fieldLabel}:
                              </div>
                              <div className="change-values">
                                <div className="old-value">
                                  <span className="value-label">Before:</span>
                                  <span className="value">
                                    {renderChangeValue(change.oldValue)}
                                  </span>
                                </div>
                                <RiArrowRightLine className="arrow-icon" />
                                <div className="new-value">
                                  <span className="value-label">After:</span>
                                  <span className="value">
                                    {renderChangeValue(change.newValue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {renderSnapshotDetails(log)}

                      {log.metadata && (
                        <div className="log-metadata">
                          <h4>Additional Information:</h4>
                          {log.metadata.ipAddress && (
                            <p>IP Address: {log.metadata.ipAddress}</p>
                          )}
                          {log.metadata.userAgent && (
                            <p className="user-agent">
                              User Agent: {log.metadata.userAgent}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && logs.length > 0 && totalPages > 1 && (
          <div className="modal-pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyLogsModal;
