import React from 'react';
import { useAppDispatch, login, logout } from '../../store';
import type { UserType } from '../../store';
import { getFullRoute } from '../../config/roleBasedRoutes';
import { useNavigate } from 'react-router-dom';
import './RoleTestButtons.scss';

const RoleTestButtons: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const testUsers = [
    {
      userType: 'super_user' as UserType,
      name: 'Super Admin',
      email: 'admin@rentalease.com',
      id: 'super-1',
      color: 'red'
    },
    {
      userType: 'property_manager' as UserType,
      name: 'Property Manager',
      email: 'manager@rentalease.com',
      id: 'pm-1',
      color: 'blue'
    },
    {
      userType: 'staff' as UserType,
      name: 'Staff Member',
      email: 'staff@rentalease.com',
      id: 'staff-1',
      color: 'green'
    },
    {
      userType: 'tenant' as UserType,
      name: 'Tenant User',
      email: 'tenant@rentalease.com',
      id: 'tenant-1',
      color: 'yellow'
    }
  ];

  const handleRoleTest = (user: typeof testUsers[0]) => {
    dispatch(login({
      email: user.email,
      userType: user.userType,
      name: user.name,
      id: user.id
    }));
    // Navigate to user's dashboard after login
    const dashboardPath = getFullRoute(user.userType, 'dashboard');
    navigate(dashboardPath);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="role-test-buttons">
      <h3>Test Different User Roles</h3>
      <div className="button-grid">
        {testUsers.map((user) => (
          <button
            key={user.userType}
            className={`role-btn ${user.color}`}
            onClick={() => handleRoleTest(user)}
          >
            Login as {user.name}
          </button>
        ))}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default RoleTestButtons; 