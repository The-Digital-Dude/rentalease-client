import React from 'react';
import { RiUser3Line, RiMailLine, RiPhoneLine } from 'react-icons/ri';
import type { PropertyTenant } from '../../services/propertyService';
import './TenantInfo.scss';

interface TenantInfoProps {
  tenant: PropertyTenant;
}

const TenantInfo: React.FC<TenantInfoProps> = ({ tenant }) => {
  return (
    <div className="tenant-info-card">
      <div className="tenant-header">
        <div className="tenant-icon">
          <RiUser3Line />
        </div>
        <div className="tenant-title">
          <h4>Tenant Information</h4>
        </div>
      </div>
      
      <div className="tenant-details">
        <div className="detail-item">
          <div className="detail-icon">
            <RiUser3Line />
          </div>
          <div className="detail-content">
            <span className="detail-label">Name</span>
            <span className="detail-value">{tenant.name}</span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-icon">
            <RiMailLine />
          </div>
          <div className="detail-content">
            <span className="detail-label">Email</span>
            <span className="detail-value">{tenant.email}</span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-icon">
            <RiPhoneLine />
          </div>
          <div className="detail-content">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{tenant.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo; 