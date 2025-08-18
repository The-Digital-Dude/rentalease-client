import { useState, useEffect } from "react";
import {
  RiSearchLine,
  RiAddLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiKeyLine,
  RiUserLine,
  RiTeamLine,
  RiFilterLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import teamMemberService, {
  type TeamMember,
} from "../../services/teamMemberService";
import "./TeamMemberManagement.scss";

interface TeamMemberFormData {
  name: string;
  email: string;
  password: string;
  status: "Active" | "Inactive";
}

const TeamMemberManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: "",
    email: "",
    password: "",
    status: "Active",
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await teamMemberService.getTeamMembers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });

      setTeamMembers(response.data.teamMembers);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await teamMemberService.createTeamMember({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Team member created successfully!");
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", status: "Active" });
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to create team member");
    }
  };

  const handleEditTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamMember) return;

    try {
      await teamMemberService.updateTeamMember(selectedTeamMember._id, {
        name: formData.name,
        email: formData.email,
        status: formData.status,
      });

      toast.success("Team member updated successfully!");
      setShowEditModal(false);
      setSelectedTeamMember(null);
      setFormData({ name: "", email: "", password: "", status: "Active" });
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update team member");
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) {
      return;
    }

    try {
      await teamMemberService.deleteTeamMember(id);
      toast.success("Team member deleted successfully!");
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete team member");
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password for this team member:");
    if (!newPassword) return;

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await teamMemberService.resetPassword(id, newPassword);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  const openEditModal = (teamMember: TeamMember) => {
    setSelectedTeamMember(teamMember);
    setFormData({
      name: teamMember.name,
      email: teamMember.email,
      password: "",
      status: teamMember.status,
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="team-member-management">
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <div className="header-icon">
              <RiTeamLine />
            </div>
            <div className="header-text">
              <h1>Team Members</h1>
              <p>Manage team members with admin-level access</p>
            </div>
          </div>
          <button
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <RiAddLine />
            Add Team Member
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="filters-section">
          <div className="search-bar">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <div className="filter-group">
              <RiFilterLine className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="team-members-table">
          <div className="table-header">
            <div className="table-title">
              <RiUserLine />
              <span>Team Members ({teamMembers.length})</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading team members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="empty-state">
              <RiTeamLine />
              <h3>No team members found</h3>
              <p>Create your first team member to get started</p>
              <button
                className="create-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <RiAddLine style={{ margin: 0 }} />
                Add Team Member
              </button>
            </div>
          ) : (
            <div className="table-content">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Created</th>
                    <th>Created By</th>
                    <th>Updated By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((teamMember, index) => (
                    <tr key={teamMember._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {teamMember.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <span className="user-name">{teamMember.name}</span>
                          </div>
                        </div>
                      </td>
                      <td>{teamMember.email}</td>
                      <td>
                        <span
                          className={`status-badge ${teamMember.status.toLowerCase()}`}
                        >
                          {teamMember.status}
                        </span>
                      </td>
                      <td>
                        {teamMember.lastLogin
                          ? formatDate(teamMember.lastLogin)
                          : "Never"}
                      </td>
                      <td>{formatDate(teamMember.createdAt)}</td>
                      <td>{teamMember.createdBy?.name || "N/A"}</td>
                      <td>{teamMember.updatedBy?.name || "N/A"}</td>
                      <td>
                        <div className="actions">
                          <div className="dropdown">
                            <button
                              className="dropdown-toggle"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(
                                  activeDropdown === teamMember._id
                                    ? null
                                    : teamMember._id
                                );
                              }}
                            >
                              <RiMoreLine />
                            </button>
                            {activeDropdown === teamMember._id && (
                              <div className={`dropdown-menu ${index < 2 ? 'show-below' : 'show-above'}`}>
                                <button
                                  onClick={() => openEditModal(teamMember)}
                                  className="dropdown-item"
                                >
                                  <RiEditLine />
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleResetPassword(teamMember._id)
                                  }
                                  className="dropdown-item"
                                >
                                  <RiKeyLine />
                                  Reset Password
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteTeamMember(teamMember._id)
                                  }
                                  className="dropdown-item danger"
                                >
                                  <RiDeleteBinLine />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Team Member</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTeamMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    minLength={8}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Team Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditTeamMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "Active" | "Inactive",
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Update Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberManagement;
