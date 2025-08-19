import { useState, useEffect } from "react";
import {
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiStarLine,
  RiToolsLine,
  RiCalendarLine,
  RiLoaderLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import Modal from "../Modal/Modal";
import { agencyService } from "../../services/agencyService";
import "./TechnicianInfoModal.scss";

interface TechnicianInfo {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  experience?: number;
  hourlyRate?: number;
  availabilityStatus: string;
  currentJobs?: number;
  maxJobs?: number;
  completedJobs?: number;
  averageRating?: number;
  totalRatings?: number;
  status: string;
  address?: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    fullAddress: string;
  };
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  lastActive?: string;
}

interface TechnicianInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicianId: string;
}

const TechnicianInfoModal = ({
  isOpen,
  onClose,
  technicianId,
}: TechnicianInfoModalProps) => {
  const [technician, setTechnician] = useState<TechnicianInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && technicianId) {
      fetchTechnicianInfo();
    }
  }, [isOpen, technicianId]);

  const fetchTechnicianInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await agencyService.getTechnicianInfo(technicianId);
      
      if (result.status === "success") {
        setTechnician(result.data.technician);
      } else {
        throw new Error(result.message || "Failed to fetch technician info");
      }
    } catch (error: any) {
      console.error("Failed to fetch technician info:", error);
      setError(error.message || "Failed to load technician information");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <RiStarLine
        key={index}
        className={`star ${index < rating ? "filled" : ""}`}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Technician Information"
      size="medium"
    >
      <div className="technician-info-modal">
        {loading && (
          <div className="loading-container">
            <RiLoaderLine className="loading-spinner" />
            <p>Loading technician information...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <RiErrorWarningLine className="error-icon" />
            <p>{error}</p>
          </div>
        )}

        {technician && !loading && !error && (
          <div className="technician-details">
            <div className="technician-header">
              <div className="technician-avatar">
                {technician.profileImage ? (
                  <img src={technician.profileImage} alt={technician.name} />
                ) : (
                  <RiUserLine />
                )}
              </div>
              <div className="technician-basic">
                <h3 className="technician-name">
                  {technician.fullName}
                  {technician.status === 'Active' && (
                    <RiCheckboxCircleLine className="verified-icon" />
                  )}
                </h3>
                <p className="technician-trade">
                  <RiToolsLine />
                  Technician
                </p>
                {technician.averageRating && technician.averageRating > 0 && (
                  <div className="technician-rating">
                    <div className="stars">{renderStars(technician.averageRating)}</div>
                    <span className="rating-text">
                      {technician.averageRating.toFixed(1)}/5.0
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="technician-info-grid">
              <div className="info-section">
                <h4>Contact Information</h4>
                <div className="info-item">
                  <RiMailLine />
                  <span>{technician.email}</span>
                </div>
                <div className="info-item">
                  <RiPhoneLine />
                  <span>{technician.phone}</span>
                </div>
                {technician.address && (
                  <div className="info-item">
                    <RiMapPinLine />
                    <span>
                      {technician.address.suburb ? `${technician.address.suburb}, ` : ''}
                      {technician.address.state} {technician.address.postcode}
                    </span>
                  </div>
                )}
              </div>

              <div className="info-section">
                <h4>Statistics</h4>
                {technician.completedJobs !== undefined && (
                  <div className="info-item">
                    <RiCheckboxCircleLine />
                    <span>{technician.completedJobs} Jobs Completed</span>
                  </div>
                )}
                <div className="info-item">
                  <RiCalendarLine />
                  <span>
                    Member since{" "}
                    {new Date(technician.createdAt).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
                <div className="info-item">
                  <span className="availability-label">Availability:</span>
                  <span className={`availability ${technician.availabilityStatus.toLowerCase()}`}>
                    {technician.availabilityStatus}
                  </span>
                </div>
                {technician.currentJobs !== undefined && (
                  <div className="info-item">
                    <span className="jobs-label">Current Jobs:</span>
                    <span>{technician.currentJobs}/{technician.maxJobs || 4}</span>
                  </div>
                )}
              </div>

              {technician.experience !== undefined && (
                <div className="info-section">
                  <h4>Experience</h4>
                  <div className="info-item">
                    <span>{technician.experience} years of experience</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TechnicianInfoModal;