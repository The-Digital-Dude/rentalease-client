import React from 'react';
import { useAppSelector } from '../../store';
import { getAccessibleRoutes } from '../../config/roleBasedRoutes';
import './RoleDisplay.scss';

const RoleDisplay: React.FC = () => {
  const { isLoggedIn, userType, email, name } = useAppSelector((state) => state.user);

  if (!isLoggedIn) {
    return null;
  }

  const accessibleRoutes = getAccessibleRoutes(userType);

  return (
    <div className="role-display">
      <h3>Current User Info</h3>
      <div className="user-info">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Role:</strong> <span className={`role-badge ${userType}`}>{userType}</span></p>
      </div>
      <div className="accessible-routes">
        <h4>Accessible Routes:</h4>
        <ul>
          {accessibleRoutes.map((route) => (
            <li key={route}>{route}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoleDisplay; 