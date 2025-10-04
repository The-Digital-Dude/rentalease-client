import React from "react";
import { RiCalendarTodoLine, RiCalendarCheckLine } from "react-icons/ri";
import "./TechnicianCalendar.scss";

const TechnicianCalendar: React.FC = () => {
  return (
    <div className="technician-calendar-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <RiCalendarTodoLine />
          </div>
          <div className="header-text">
            <h1>Schedule & Calendar</h1>
            <p>
              View upcoming jobs, sync events, and stay on top of your workload. A
              full web calendar experience is on the way – for now you can review
              your assigned jobs and download the calendar feed below.
            </p>
          </div>
        </div>
      </div>

      <div className="calendar-content">
        <section className="coming-soon-card">
          <RiCalendarCheckLine className="card-icon" />
          <div className="card-text">
            <h2>Calendar View Coming Soon</h2>
            <p>
              Our technician mobile app already provides a rich calendar with job
              syncing and reminders. We are bringing the same functionality to the
              web so you can plan your week from any device. This page will soon
              include:
            </p>
            <ul>
              <li>Monthly view with colour-coded job statuses</li>
              <li>Day-by-day schedules and event details</li>
              <li>Calendar feed link for Outlook, Google, and Apple Calendar</li>
              <li>Quick links to job details and completion workflows</li>
            </ul>
            <p>
              In the meantime, keep using the mobile app for calendar syncing—or
              head to the Available Jobs and My Jobs sections to manage your
              schedule from here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TechnicianCalendar;
