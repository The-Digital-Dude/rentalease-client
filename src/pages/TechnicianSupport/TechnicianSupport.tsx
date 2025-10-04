import React from "react";
import {
  RiHeadphoneLine,
  RiBookOpenLine,
  RiChat3Line,
  RiSmartphoneLine,
} from "react-icons/ri";
import "./TechnicianSupport.scss";

const TechnicianSupport: React.FC = () => {
  return (
    <div className="technician-support-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <RiHeadphoneLine />
          </div>
          <div className="header-text">
            <h1>Help & Support</h1>
            <p>
              Quick access to knowledge base articles, chat support, and account
              actions designed for field technicians.
            </p>
          </div>
        </div>
      </div>

      <div className="support-grid">
        <section className="support-card">
          <RiBookOpenLine className="card-icon" />
          <h2>Knowledge Base</h2>
          <p>
            Need a refresher on safety checks, report uploads, or completing jobs?
            Browse technician-focused guides and best practices.
          </p>
          <a
            href="https://support.rentalease.com/technicians"
            target="_blank"
            rel="noopener noreferrer"
            className="link-button"
          >
            View Articles
          </a>
        </section>

        <section className="support-card">
          <RiChat3Line className="card-icon" />
          <h2>Talk to Support</h2>
          <p>
            Our operations team can help with urgent job issues, calendar
            conflicts, or app access. Start a live chat or send us an email.
          </p>
          <div className="action-list">
            <a href="mailto:support@rentalease.com">support@rentalease.com</a>
            <span>Live chat available 7am–7pm AEST</span>
          </div>
        </section>

        <section className="support-card">
          <RiSmartphoneLine className="card-icon" />
          <h2>Mobile App</h2>
          <p>
            The RentalEase Technician app remains the fastest way to capture
            onsite photos, upload reports, and sync your calendar while on the go.
          </p>
          <div className="store-links">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="store-link"
            >
              Download for iOS
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="store-link"
            >
              Download for Android
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TechnicianSupport;
