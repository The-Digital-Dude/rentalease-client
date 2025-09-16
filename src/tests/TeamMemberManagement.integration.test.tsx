import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import TeamMemberManagement from '../pages/TeamMemberManagement/TeamMemberManagement';
import teamMemberService from '../services/teamMemberService';
import userSlice from '../store/userSlice';

// Mock the service
vi.mock('../services/teamMemberService');
const mockedTeamMemberService = vi.mocked(teamMemberService);

// Mock toast notifications
vi.mock('react-hot-toast');
const mockedToast = vi.mocked(toast);

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      user: userSlice.reducer,
    },
    preloadedState: {
      user: {
        isLoggedIn: true,
        email: 'admin@rentalease.com.au',
        userType: 'super_user',
        name: 'Super User',
        id: '507f1f77bcf86cd799439012',
        avatar: null,
        phone: null,
      },
    },
  });
};

describe('TeamMemberManagement Integration Tests', () => {
  let store: ReturnType<typeof createMockStore>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createMockStore();
    user = userEvent.setup();

    // Mock initial team members fetch
    mockedTeamMemberService.getTeamMembers.mockResolvedValue({
      status: 'success',
      message: 'Team members fetched successfully',
      data: {
        teamMembers: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      },
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  describe('TC18: Add Team Members', () => {
    it('should successfully create a new team member and refresh the list', async () => {
      // Arrange
      const mockNewTeamMember = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'Active' as const,
        createdBy: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Super User',
          email: 'admin@rentalease.com.au'
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z'
      };

      mockedTeamMemberService.createTeamMember.mockResolvedValue({
        status: 'success',
        message: 'Team member created successfully',
        data: {
          teamMember: mockNewTeamMember
        }
      });

      // Mock the refreshed list after creation
      mockedTeamMemberService.getTeamMembers.mockResolvedValueOnce({
        status: 'success',
        message: 'Team members fetched successfully',
        data: {
          teamMembers: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          },
        },
      }).mockResolvedValueOnce({
        status: 'success',
        message: 'Team members fetched successfully',
        data: {
          teamMembers: [mockNewTeamMember],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            itemsPerPage: 10,
          },
        },
      });

      renderWithProvider(<TeamMemberManagement />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Team Members')).toBeInTheDocument();
      });

      // Step 1: Go to Team Members (already there)
      expect(screen.getByText('Team Members')).toBeInTheDocument();

      // Step 2: Click Add Team Members
      const addButton = screen.getByText('Add Team Member');
      await user.click(addButton);

      // Verify modal opened
      await waitFor(() => {
        expect(screen.getByText('Create Team Member')).toBeInTheDocument();
      });

      // Step 3: Fill the form
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      // Step 4: Click Create Team Member
      const createButton = screen.getByRole('button', { name: 'Create Team Member' });
      await user.click(createButton);

      // Assert
      await waitFor(() => {
        expect(mockedTeamMemberService.createTeamMember).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      });

      // Verify success toast
      expect(mockedToast.success).toHaveBeenCalledWith('Team member created successfully!');

      // Verify modal closed
      await waitFor(() => {
        expect(screen.queryByText('Create Team Member')).not.toBeInTheDocument();
      });

      // Verify list was refreshed
      expect(mockedTeamMemberService.getTeamMembers).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors and show appropriate error messages', async () => {
      // Arrange
      const validationError = {
        response: {
          status: 400,
          data: {
            status: 'error',
            message: 'Name is required, Please enter a valid email, Password must be at least 8 characters long'
          }
        }
      };

      mockedTeamMemberService.createTeamMember.mockRejectedValue(validationError);

      renderWithProvider(<TeamMemberManagement />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Team Members')).toBeInTheDocument();
      });

      // Click Add Team Member
      const addButton = screen.getByText('Add Team Member');
      await user.click(addButton);

      // Fill form with invalid data
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(nameInput, ''); // Empty name
      await user.type(emailInput, 'invalid-email'); // Invalid email
      await user.type(passwordInput, '123'); // Short password

      // Submit form
      const createButton = screen.getByRole('button', { name: 'Create Team Member' });
      await user.click(createButton);

      // Assert error handling
      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith(
          'Name is required, Please enter a valid email, Password must be at least 8 characters long'
        );
      });

      // Verify modal remains open
      expect(screen.getByText('Create Team Member')).toBeInTheDocument();
    });

    it('should handle duplicate email errors', async () => {
      // Arrange
      const duplicateEmailError = {
        response: {
          status: 400,
          data: {
            status: 'error',
            message: 'Team member with this email already exists'
          }
        }
      };

      mockedTeamMemberService.createTeamMember.mockRejectedValue(duplicateEmailError);

      renderWithProvider(<TeamMemberManagement />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Team Members')).toBeInTheDocument();
      });

      // Click Add Team Member
      const addButton = screen.getByText('Add Team Member');
      await user.click(addButton);

      // Fill form with existing email
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');

      // Submit form
      const createButton = screen.getByRole('button', { name: 'Create Team Member' });
      await user.click(createButton);

      // Assert error handling
      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith(
          'Team member with this email already exists'
        );
      });
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = {
        response: {
          status: 500,
          data: {
            status: 'error',
            message: 'Internal server error'
          }
        }
      };

      mockedTeamMemberService.createTeamMember.mockRejectedValue(networkError);

      renderWithProvider(<TeamMemberManagement />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Team Members')).toBeInTheDocument();
      });

      // Click Add Team Member
      const addButton = screen.getByText('Add Team Member');
      await user.click(addButton);

      // Fill form with valid data
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      // Submit form
      const createButton = screen.getByRole('button', { name: 'Create Team Member' });
      await user.click(createButton);

      // Assert error handling
      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('Internal server error');
      });
    });
  });
});