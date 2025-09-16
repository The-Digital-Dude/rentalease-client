import { describe, it, expect, vi, beforeEach } from 'vitest';
import teamMemberService, { type CreateTeamMemberRequest } from '../services/teamMemberService';
import api from '../services/api';

// Mock the API
vi.mock('../services/api');
const mockedApi = vi.mocked(api);

describe('Team Member Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('teamMemberService.createTeamMember', () => {
    it('should create a team member successfully', async () => {
      // Arrange
      const mockRequest: CreateTeamMemberRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const mockResponse = {
        data: {
          status: 'success',
          message: 'Team member created successfully',
          data: {
            teamMember: {
              _id: '507f1f77bcf86cd799439011',
              name: 'John Doe',
              email: 'john@example.com',
              status: 'Active',
              createdBy: {
                _id: '507f1f77bcf86cd799439012',
                name: 'Super User',
                email: 'admin@example.com'
              },
              createdAt: '2024-01-01T00:00:00.000Z',
              lastUpdated: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      // Act
      const result = await teamMemberService.createTeamMember(mockRequest);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith('/v1/team-members', mockRequest);
      expect(result).toEqual(mockResponse.data);
      expect(result.status).toBe('success');
      expect(result.data.teamMember.name).toBe('John Doe');
      expect(result.data.teamMember.email).toBe('john@example.com');
    });

    it('should handle validation errors', async () => {
      // Arrange
      const mockRequest: CreateTeamMemberRequest = {
        name: '',
        email: 'invalid-email',
        password: '123' // Too short
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            status: 'error',
            message: 'Name is required, Please enter a valid email, Password must be at least 8 characters long'
          }
        }
      };

      mockedApi.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(teamMemberService.createTeamMember(mockRequest))
        .rejects
        .toThrow();

      expect(mockedApi.post).toHaveBeenCalledWith('/v1/team-members', mockRequest);
    });

    it('should handle duplicate email error', async () => {
      // Arrange
      const mockRequest: CreateTeamMemberRequest = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            status: 'error',
            message: 'Team member with this email already exists'
          }
        }
      };

      mockedApi.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(teamMemberService.createTeamMember(mockRequest))
        .rejects
        .toThrow();

      expect(mockedApi.post).toHaveBeenCalledWith('/v1/team-members', mockRequest);
    });

    it('should handle network errors', async () => {
      // Arrange
      const mockRequest: CreateTeamMemberRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const mockError = {
        response: {
          status: 500,
          data: {
            status: 'error',
            message: 'Internal server error'
          }
        }
      };

      mockedApi.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(teamMemberService.createTeamMember(mockRequest))
        .rejects
        .toThrow();

      expect(mockedApi.post).toHaveBeenCalledWith('/v1/team-members', mockRequest);
    });

    it('should handle authentication errors', async () => {
      // Arrange
      const mockRequest: CreateTeamMemberRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const mockError = {
        response: {
          status: 401,
          data: {
            status: 'error',
            message: 'Access denied. Super user privileges required.'
          }
        }
      };

      mockedApi.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(teamMemberService.createTeamMember(mockRequest))
        .rejects
        .toThrow();

      expect(mockedApi.post).toHaveBeenCalledWith('/v1/team-members', mockRequest);
    });
  });

  describe('Integration Test Scenarios', () => {
    it('should create team member without agency (SuperUser scenario)', async () => {
      // Arrange
      const mockRequest: CreateTeamMemberRequest = {
        name: 'Admin User',
        email: 'admin@rentalease.com.au',
        password: 'securePassword123'
      };

      const mockResponse = {
        data: {
          status: 'success',
          message: 'Team member created successfully',
          data: {
            teamMember: {
              _id: '507f1f77bcf86cd799439011',
              name: 'Admin User',
              email: 'admin@rentalease.com.au',
              status: 'Active',
              createdBy: {
                _id: '507f1f77bcf86cd799439012',
                name: 'Super User',
                email: 'superuser@rentalease.com.au'
              },
              agency: null, // No agency for SuperUser-created team members
              createdAt: '2024-01-01T00:00:00.000Z',
              lastUpdated: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      // Act
      const result = await teamMemberService.createTeamMember(mockRequest);

      // Assert
      expect(result.data.teamMember.agency).toBeNull();
      expect(result.data.teamMember.createdBy).toBeDefined();
      expect(result.status).toBe('success');
    });
  });
});