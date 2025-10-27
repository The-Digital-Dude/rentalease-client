import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiPhoneLine, RiMailLine, RiMapPinLine, RiEyeLine, RiEditLine, RiDeleteBinLine, RiStarFill } from 'react-icons/ri';
import styles from './TechnicianCard.module.scss';

interface TechnicianCardProps {
  technician: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    availability: string;
    accountStatus: string;
    completedJobs: number;
    avgRating: number;
    hourlyRate: number;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSendEmail: (technician: TechnicianCardProps['technician']) => void;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({
  technician,
  onView,
  onEdit,
  onDelete,
  onSendEmail
}) => {
  const navigate = useNavigate();

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Navigate to technician profile
  const handleNavigateToProfile = () => {
    navigate(`/technicians/${technician._id}`);
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return styles.statusAvailable;
      case 'booked':
        return styles.statusBooked;
      case 'leave':
        return styles.statusLeave;
      case 'valid':
        return styles.statusValid;
      case 'expired':
        return styles.statusExpired;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.technicianCard}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.avatarSection}>
          <div
            className={`${styles.avatar} ${styles.clickable}`}
            onClick={handleNavigateToProfile}
            title="View technician profile"
          >
            {getInitials(technician.name)}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3
            className={`${styles.name} ${styles.clickable}`}
            onClick={handleNavigateToProfile}
            title="View technician profile"
          >
            {technician.name}
          </h3>
          <div className={styles.statusBadges}>
            <span className={`${styles.statusBadge} ${getStatusClass(technician.availability)}`}>
              {technician.availability}
            </span>
            <span className={`${styles.statusBadge} ${getStatusClass(technician.accountStatus)}`}>
              {technician.accountStatus}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.viewBtn}`}
            onClick={() => onView(technician._id)}
            title="View Details"
          >
            <RiEyeLine />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() => onEdit(technician._id)}
            title="Edit Technician"
          >
            <RiEditLine />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete(technician._id)}
            title="Delete Technician"
          >
            <RiDeleteBinLine />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {technician.completedJobs}
          </div>
          <div className={styles.statLabel}>Jobs Done</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            <RiStarFill />
            {technician.avgRating.toFixed(1)}
          </div>
          <div className={styles.statLabel}>Rating</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            ${technician.hourlyRate}/hr
          </div>
          <div className={styles.statLabel}>Rate</div>
        </div>
      </div>

      {/* Contact Section */}
      <div className={styles.contactSection}>
        <div className={styles.contactItem}>
          <RiPhoneLine className={styles.contactIcon} />
          <span className={styles.contactLabel}>Phone</span>
          <span className={styles.contactValue}>{technician.phone}</span>
        </div>
        <div
          className={`${styles.contactItem} ${styles.clickableEmail}`}
          onClick={() => onSendEmail(technician)}
          title="Send email to technician"
        >
          <RiMailLine className={styles.contactIcon} />
          <span className={styles.contactLabel}>Email</span>
          <span className={styles.contactValue}>{technician.email}</span>
        </div>
      </div>

      {/* Location Section - Only show if location exists and is not "No address provided" */}
      {technician.location && technician.location !== 'No address provided' && (
        <div className={styles.locationSection}>
          <RiMapPinLine className={styles.locationIcon} />
          <span className={styles.locationText}>{technician.location}</span>
        </div>
      )}
    </div>
  );
};

export default TechnicianCard;