import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../store";
import {
  RiPhoneLine,
  RiPhoneFill,
  RiMicLine,
  RiMicOffLine,
  RiUserLine,
  RiTimeLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
  RiStickyNoteLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiLoaderLine,
  RiHistoryLine,
  RiArrowRightLine,
} from "react-icons/ri";
import callService from "../../services/callService";
import { contactsAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./Calling.scss";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface CallRecord {
  _id: string;
  from: string;
  to: string;
  contactId?: Contact;
  status: string;
  duration: number;
  direction: string;
  notes?: string;
  createdAt: string;
  formattedDuration?: string;
  metadata?: {
    contactName?: string;
    contactRole?: string;
  };
}

interface CallStats {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  totalDuration: number;
  avgDuration: number;
}

const Calling = () => {
  const { user } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState<"dial" | "history" | "stats">(
    "dial"
  );

  // Dialer state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callerPhone, setCallerPhone] = useState("+8801620692839"); // Default caller number
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [isSearchingContacts, setIsSearchingContacts] = useState(false);

  // Active call state
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callNotes, setCallNotes] = useState("");

  // History state
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historySearch, setHistorySearch] = useState("");

  // Stats state
  const [callStats, setCallStats] = useState<CallStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadContacts();
    if (activeTab === "history") {
      loadCallHistory();
    } else if (activeTab === "stats") {
      loadCallStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (isCallInProgress && callTimerRef.current === null) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (!isCallInProgress && callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallInProgress]);

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getContacts();
      if (response.data.success && response.data.data) {
        setContacts(response.data.data.contacts || []);
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  const loadCallHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await callService.getCallHistory({
        status: historyFilter !== "all" ? historyFilter : undefined,
      });
      if (response.success && response.data) {
        setCallHistory(response.data.calls || []);
      }
    } catch (error) {
      toast.error("Failed to load call history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadCallStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await callService.getCallStatistics();
      if (response.success && response.data) {
        setCallStats(response.data.stats);
      }
    } catch (error) {
      toast.error("Failed to load call statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const initiateCall = async () => {
    const numberToCall = selectedContact?.phone || phoneNumber;

    if (!numberToCall) {
      toast.error("Please enter a phone number or select a contact");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanNumber = numberToCall.replace(/[\s\-\(\)]/g, '');

    if (!phoneRegex.test(cleanNumber)) {
      toast.error("Please enter a valid phone number with country code (e.g., +1234567890)");
      return;
    }

    // Ensure the number starts with +
    const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;

    try {
      setIsCallInProgress(true);
      const response = await callService.initiateCall({
        to: formattedNumber,
        contactId: selectedContact?._id,
        notes: callNotes,
        callerPhone: callerPhone,
      });

      if (response.success) {
        setActiveCall(response.data);
        toast.success("Call initiated successfully");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setIsCallInProgress(false);

      // Provide helpful error messages
      if (error.error?.includes("not authorized to call")) {
        toast.error("This number cannot be called. Please check Twilio international permissions or try a US number (+1...)");
      } else if (error.error?.includes("Account")) {
        toast.error("Twilio account issue: " + error.error);
      } else {
        toast.error(error.message || error.error || "Failed to initiate call");
      }
    }
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      const response = await callService.endCall(activeCall.callId);
      if (response.success) {
        setIsCallInProgress(false);
        setActiveCall(null);
        toast.success("Call ended");

        // Save notes if any
        if (callNotes) {
          await callService.updateCallNotes(activeCall.callId, callNotes);
        }

        // Refresh history
        if (activeTab === "history") {
          loadCallHistory();
        }
      }
    } catch (error) {
      toast.error("Failed to end call");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Unmuted" : "Muted");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "badge-success";
      case "failed":
      case "busy":
      case "no-answer":
        return "badge-error";
      case "in-progress":
      case "ringing":
        return "badge-warning";
      default:
        return "badge-default";
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.phone.includes(contactSearch)
  );

  const filteredHistory = callHistory.filter((call) => {
    const matchesSearch =
      historySearch === "" ||
      call.to.includes(historySearch) ||
      call.from.includes(historySearch) ||
      call.metadata?.contactName
        ?.toLowerCase()
        .includes(historySearch.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="calling-page">
      <div className="page-header">
        <h1>Call Management</h1>
        <div className="header-actions">
          <div className="tab-switcher">
            <button
              className={activeTab === "dial" ? "active" : ""}
              onClick={() => setActiveTab("dial")}
            >
              <RiPhoneLine /> Dialer
            </button>
            <button
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              <RiHistoryLine /> History
            </button>
            <button
              className={activeTab === "stats" ? "active" : ""}
              onClick={() => setActiveTab("stats")}
            >
              <RiHistoryLine /> Statistics
            </button>
          </div>
        </div>
      </div>

      {activeTab === "dial" && (
        <div className="dialer-section">
          <div className="dialer-grid">
            {/* Contact Selection */}
            <div className="contact-panel glass-card">
              <h3>Select Contact</h3>
              <div className="search-box">
                <RiSearchLine />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>
              <div className="contacts-list">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`contact-item ${
                      selectedContact?._id === contact._id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedContact(contact);
                      setPhoneNumber(contact.phone);
                    }}
                  >
                    <div className="contact-info">
                      <div className="contact-name">{contact.name}</div>
                      <div className="contact-phone">{contact.phone}</div>
                      <div className="contact-role">{contact.role}</div>
                    </div>
                    {selectedContact?._id === contact._id && (
                      <RiCheckboxCircleLine className="selected-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dialer Panel */}
            <div className="dialer-panel glass-card">
              <h3>Make a Call</h3>

              {!isCallInProgress ? (
                <>
                  <div className="caller-phone-input">
                    <label style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      Your Phone Number (will receive the call)
                    </label>
                    <input
                      type="tel"
                      placeholder="Your phone number (e.g., +8801620692839)"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      style={{ marginBottom: '1rem' }}
                    />
                  </div>

                  <div className="phone-input">
                    <label style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      Number to Call
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number with country code (e.g., +14155552671)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <small style={{ color: '#6b7280', marginTop: '0.5rem', display: 'block' }}>
                      Include country code (e.g., +1 for USA, +44 for UK, +880 for Bangladesh)
                    </small>
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#374151' }}>Test Numbers:</strong>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        • +15005550006 (Twilio Test - Valid number)
                        • +15005550001 (Twilio Test - Invalid number)
                        • +8801620692839 (Your own number for testing)
                      </div>
                    </div>
                  </div>

                  <div className="notes-input">
                    <RiStickyNoteLine />
                    <textarea
                      placeholder="Add notes for this call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <button className="call-button" onClick={initiateCall}>
                    <RiPhoneLine /> Start Call
                  </button>
                </>
              ) : (
                <div className="active-call">
                  <div className="call-status">
                    <div className="pulse-animation">
                      <RiPhoneFill />
                    </div>
                    <h2>Call in Progress</h2>
                  </div>

                  <div className="call-info">
                    <div className="calling-to">
                      {selectedContact ? selectedContact.name : phoneNumber}
                    </div>
                    <div className="call-timer">
                      <RiTimeLine /> {formatDuration(callDuration)}
                    </div>
                  </div>

                  <div className="call-controls">
                    <button
                      className={`control-btn ${isMuted ? "active" : ""}`}
                      onClick={toggleMute}
                    >
                      {isMuted ? <RiMicOffLine /> : <RiMicLine />}
                    </button>
                    <button className="end-call-btn" onClick={endCall}>
                      <RiCloseCircleLine /> End Call
                    </button>
                  </div>

                  <div className="call-notes">
                    <textarea
                      placeholder="Add notes during call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="history-section">
          <div className="history-controls">
            <div className="search-box">
              <RiSearchLine />
              <input
                type="text"
                placeholder="Search call history..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              >
                <option value="all">All Calls</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="busy">Busy</option>
                <option value="no-answer">No Answer</option>
              </select>

              <button className="export-btn">
                <RiDownloadLine /> Export CSV
              </button>
            </div>
          </div>

          <div className="history-table glass-card">
            {isLoadingHistory ? (
              <div className="loading-state">
                <RiLoaderLine className="spinner" />
                <p>Loading call history...</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Contact</th>
                    <th>Number</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Direction</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((call) => (
                    <tr key={call._id}>
                      <td>{formatDate(call.createdAt)}</td>
                      <td>
                        {call.metadata?.contactName ||
                          call.contactId?.name ||
                          "-"}
                      </td>
                      <td>
                        {call.direction === "outbound" ? call.to : call.from}
                      </td>
                      <td>
                        {call.formattedDuration ||
                          formatDuration(call.duration)}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            call.status
                          )}`}
                        >
                          {call.status}
                        </span>
                      </td>
                      <td>
                        <span className={`direction-badge ${call.direction}`}>
                          {call.direction}
                        </span>
                      </td>
                      <td className="notes-cell">{call.notes || "-"}</td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        No calls found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="stats-section">
          {isLoadingStats ? (
            <div className="loading-state">
              <RiLoaderLine className="spinner" />
              <p>Loading statistics...</p>
            </div>
          ) : callStats ? (
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div className="stat-icon">
                  <RiPhoneLine />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{callStats.totalCalls}</div>
                  <div className="stat-label">Total Calls</div>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon success">
                  <RiCheckboxCircleLine />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{callStats.completedCalls}</div>
                  <div className="stat-label">Completed Calls</div>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon error">
                  <RiCloseCircleLine />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{callStats.failedCalls}</div>
                  <div className="stat-label">Failed Calls</div>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div className="stat-icon">
                  <RiTimeLine />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatDuration(Math.round(callStats.avgDuration))}
                  </div>
                  <div className="stat-label">Average Duration</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">No statistics available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calling;
