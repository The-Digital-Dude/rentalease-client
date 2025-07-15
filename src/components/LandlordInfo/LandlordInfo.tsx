import React from 'react';
import { RiUser3Line, RiMailLine, RiPhoneLine, RiUserStarLine } from 'react-icons/ri';
import type { PropertyLandlord } from '../../services/propertyService';
import './LandlordInfo.scss';

interface LandlordInfoProps {
  landlord: PropertyLandlord;
}

const LandlordInfo: React.FC<LandlordInfoProps> = ({ landlord }) => {
  return (
    <div className="landlord-info-card">
      <div className="landlord-header">
        <div className="landlord-icon">
          <RiUserStarLine />
        </div>
        <div className="landlord-title">
          <h4>Landlord Information</h4>
        </div>
      </div>
      
      <div className="landlord-details">
        <div className="detail-item">
          <div className="detail-icon">
            <RiUser3Line />
          </div>
          <div className="detail-content">
            <span className="detail-label">Name</span>
            <span className="detail-value">{landlord.name}</span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-icon">
            <RiMailLine />
          </div>
          <div className="detail-content">
            <span className="detail-label">Email</span>
            <span className="detail-value">{landlord.email}</span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-icon">
            <RiPhoneLine />
          </div>
          <div className="detail-content">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{landlord.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordInfo; 