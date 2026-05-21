import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiCalendarCheckLine,
  RiCalendarLine,
  RiExternalLinkLine,
  RiLoader4Line,
  RiMapPinLine,
  RiRefreshLine,
} from "react-icons/ri";
import calendarService, {
  type CalendarFilters,
  type TechnicianCalendarEvent,
} from "../../services/calendarService";
import technicianService from "../../services/technicianService";
import "./TechnicianCalendar.scss";

const initialFilters: CalendarFilters = {
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    .toISOString()
    .split("T")[0],
  status: "",
};

const TechnicianCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<TechnicianCalendarEvent[]>([]);
  const [filters, setFilters] = useState<CalendarFilters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedUrl, setFeedUrl] = useState<string>("");

  const loadCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      const [calendar, profile] = await Promise.all([
        calendarService.getTechnicianCalendar(filters),
        technicianService.getProfile(),
      ]);
      setEvents(calendar.events || []);

      if (profile.id) {
        try {
          const feed = await calendarService.getTechnicianCalendarFeed(profile.id);
          setFeedUrl(feed.feedUrl || "");
        } catch {
          setFeedUrl("");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load your calendar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!filters.status) return events;
    return events.filter((event) => event.status === filters.status);
  }, [events, filters.status]);

  return (
    <div className="technician-calendar-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <RiCalendarLine />
          </div>
          <div className="header-text">
            <h1>Schedule & Calendar</h1>
            <p>
              Review scheduled work, open jobs directly from the calendar, and
              copy your calendar feed into Outlook, Apple Calendar, or Google Calendar.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={loadCalendar}>
            <RiRefreshLine /> Refresh
          </button>
          {feedUrl ? (
            <a
              href={feedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              <RiExternalLinkLine /> Open Feed URL
            </a>
          ) : null}
        </div>
      </div>

      <div className="calendar-filters">
        <label>
          Start Date
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, startDate: event.target.value }))
            }
          />
        </label>
        <label>
          End Date
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, endDate: event.target.value }))
            }
          />
        </label>
        <label>
          Status
          <select
            value={filters.status || ""}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, status: event.target.value }))
            }
          >
            <option value="">All statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </label>
        <button className="primary-btn" onClick={loadCalendar}>
          <RiCalendarCheckLine /> Apply Filters
        </button>
      </div>

      {loading ? (
        <div className="calendar-state">
          <RiLoader4Line className="spin" />
          <p>Loading your calendar…</p>
        </div>
      ) : error ? (
        <div className="calendar-state error">
          <p>{error}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="calendar-state">
          <p>No calendar events found for the selected range.</p>
        </div>
      ) : (
        <div className="calendar-list">
          {filteredEvents.map((event) => (
            <article key={event.id} className="calendar-card">
              <div className="calendar-card-header">
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.description || event.jobType}</p>
                </div>
                <span className={`status-pill ${event.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {event.status}
                </span>
              </div>

              <div className="calendar-meta">
                <div>
                  <strong>When</strong>
                  <span>
                    {new Date(event.startTime).toLocaleString()} to{" "}
                    {new Date(event.endTime).toLocaleString()}
                  </span>
                </div>
                <div>
                  <strong>Priority</strong>
                  <span>{event.priority || "Standard"}</span>
                </div>
                <div>
                  <strong>Location</strong>
                  <span>
                    <RiMapPinLine />
                    {[
                      event.location?.street,
                      event.location?.city,
                      event.location?.state,
                      event.location?.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Address not available"}
                  </span>
                </div>
              </div>

              <div className="calendar-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate(`/jobs/${event.jobId}`)}
                >
                  View Job Details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianCalendar;
