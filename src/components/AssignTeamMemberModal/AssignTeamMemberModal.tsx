import { useState, useEffect } from "react";
import { RiCloseLine, RiUserSearchLine } from "react-icons/ri";
import teamMemberService, {
  type TeamMember,
} from "../../services/teamMemberService";
import toast from "react-hot-toast";

interface AssignTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (teamMemberId: string) => void;
  propertyId: string;
}

const AssignTeamMemberModal = ({
  isOpen,
  onClose,
  onAssign,
  propertyId,
}: AssignTeamMemberModalProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await teamMemberService.getTeamMembers({ limit: 1000 }); // Fetch all team members
      setTeamMembers(response.data.teamMembers);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedTeamMember) {
      onAssign(selectedTeamMember);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Team Member</h2>
          <button onClick={onClose} className="close-btn">
            <RiCloseLine />
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <p>Loading team members...</p>
          ) : (
            <div className="form-group">
              <label>Select Team Member</label>
              <div className="select-wrapper">
                <RiUserSearchLine />
                <select
                  value={selectedTeamMember}
                  onChange={(e) => setSelectedTeamMember(e.target.value)}
                >
                  <option value="" disabled>
                    Select a team member
                  </option>
                  {teamMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleAssign}
            disabled={!selectedTeamMember}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTeamMemberModal;