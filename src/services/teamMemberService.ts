import api from './api';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  lastLogin?: string;
}

export interface CreateTeamMemberRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateTeamMemberRequest {
  name?: string;
  email?: string;
  status?: 'Active' | 'Inactive';
}

export interface TeamMemberResponse {
  status: string;
  message: string;
  data: {
    teamMember: TeamMember;
  };
}

export interface TeamMembersListResponse {
  status: string;
  message: string;
  data: {
    teamMembers: TeamMember[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

class TeamMemberService {
  /**
   * Get all team members with pagination and search
   */
  async getTeamMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<TeamMembersListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);

    const response = await api.get(`/v1/team-members?${searchParams.toString()}`);
    return response.data;
  }

  /**
   * Get a single team member by ID
   */
  async getTeamMember(id: string): Promise<TeamMemberResponse> {
    const response = await api.get(`/v1/team-members/${id}`);
    return response.data;
  }

  /**
   * Create a new team member
   */
  async createTeamMember(data: CreateTeamMemberRequest): Promise<TeamMemberResponse> {
    const response = await api.post('/v1/team-members', data);
    return response.data;
  }

  /**
   * Update a team member
   */
  async updateTeamMember(id: string, data: UpdateTeamMemberRequest): Promise<TeamMemberResponse> {
    const response = await api.put(`/v1/team-members/${id}`, data);
    return response.data;
  }

  /**
   * Delete a team member
   */
  async deleteTeamMember(id: string): Promise<{ status: string; message: string }> {
    const response = await api.delete(`/v1/team-members/${id}`);
    return response.data;
  }

  /**
   * Reset team member password
   */
  async resetPassword(id: string, newPassword: string): Promise<{ status: string; message: string }> {
    const response = await api.put(`/v1/team-members/${id}/reset-password`, {
      newPassword
    });
    return response.data;
  }
}

export default new TeamMemberService();