import { useState, useEffect, useRef } from "react";
import { RiSearchLine, RiLoader4Line, RiArrowDownSLine } from "react-icons/ri";
import { agencyService, type Agency } from "../../services";
import "./AgencySearchDropdown.scss";

interface AgencySearchDropdownProps {
  selectedAgency: Agency | null;
  onAgencySelect: (agency: Agency) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const AgencySearchDropdown = ({
  selectedAgency,
  onAgencySelect,
  placeholder = "Search and select an agency...",
  error,
  disabled = false,
  required = false,
}: AgencySearchDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch agencies with debouncing
  const fetchAgencies = async (query: string = "") => {
    try {
      setLoading(true);
      const response = await agencyService.getAllAgencies();

      if (response.success && response.data) {
        // Filter agencies based on search query
        const filteredAgencies = query
          ? response.data.filter((agency) =>
              agency.name.toLowerCase().includes(query.toLowerCase()) ||
              agency.contactEmail.toLowerCase().includes(query.toLowerCase()) ||
              agency.abn.includes(query)
            )
          : response.data;

        setAgencies(filteredAgencies);
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error fetching agencies:", error);
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (isOpen) {
        fetchAgencies(searchTerm);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, isOpen]);

  // Handle dropdown toggle
  const toggleDropdown = () => {
    if (disabled) return;

    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      // Focus the search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle agency selection
  const handleAgencySelect = (agency: Agency) => {
    onAgencySelect(agency);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load initial agencies when component mounts
  useEffect(() => {
    fetchAgencies();
  }, []);

  return (
    <div className="agency-search-dropdown" ref={dropdownRef}>
      <div
        className={`dropdown-trigger ${error ? "error" : ""} ${disabled ? "disabled" : ""}`}
        onClick={toggleDropdown}
      >
        <div className="selected-value">
          {selectedAgency ? (
            <div className="selected-agency">
              <span className="agency-name">{selectedAgency.name}</span>
              <span className="agency-email">{selectedAgency.contactEmail}</span>
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
        <div className="dropdown-icon">
          <RiArrowDownSLine className={isOpen ? "rotated" : ""} />
        </div>
      </div>

      {error && <span className="error-message">{error}</span>}

      {isOpen && (
        <div className="dropdown-menu">
          <div className="search-input-wrapper">
            <RiSearchLine className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Type to search agencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="dropdown-content">
            {loading ? (
              <div className="loading-state">
                <RiLoader4Line className="spinner" />
                <span>Searching agencies...</span>
              </div>
            ) : agencies.length > 0 ? (
              <ul className="agency-list">
                {agencies.map((agency) => (
                  <li
                    key={agency.id}
                    className={`agency-option ${
                      selectedAgency?.id === agency.id ? "selected" : ""
                    }`}
                    onClick={() => handleAgencySelect(agency)}
                  >
                    <div className="agency-info">
                      <div className="agency-name">{agency.name}</div>
                      <div className="agency-details">
                        <span className="agency-email">{agency.contactEmail}</span>
                        <span className="agency-abn">ABN: {agency.abn}</span>
                      </div>
                      <div className="agency-meta">
                        <span className={`status ${agency.status.toLowerCase()}`}>
                          {agency.status}
                        </span>
                        <span className="region">{agency.region}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : hasSearched ? (
              <div className="empty-state">
                <span>No agencies found</span>
                {searchTerm && (
                  <small>Try adjusting your search terms</small>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencySearchDropdown;