import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  RiCalendarLine,
  RiTimeLine,
  RiArrowLeftLine,
  RiCheckLine,
} from "react-icons/ri";
import Toast from "../../components/Toast";
import "./InspectionBooking.scss";
import getFrontendLink from "../../constants/frontendlinks";

interface ComplianceData {
  propertyAddress: string;
  isActive: boolean;
  compliance: {
    gasCompliance?: {
      required: boolean;
      status: string;
      nextInspection: string | null;
      dueDate: string | null;
    };
    electricalSafety?: {
      required: boolean;
      status: string;
      nextInspection: string | null;
      dueDate: string | null;
    };
    smokeAlarms?: {
      required: boolean;
      status: string;
      nextInspection: string | null;
      dueDate: string | null;
    };
    poolSafety?: {
      required: boolean;
      status: string;
      nextInspection: string | null;
      dueDate: string | null;
    };
  };
  summary: {
    totalCompliance: number;
    dueSoon: number;
    overdue: number;
    compliant: number;
    complianceScore: number;
  };
}

interface InspectionBookingData {
  complianceData: ComplianceData;
  dueDate: string;
  complianceType: string;
}

interface BookingFormData {
  selectedDate: string;
  selectedShift: "morning" | "afternoon";
}

const InspectionBooking: React.FC = () => {
  const { propertyId, complienceType } = useParams<{
    propertyId: string;
    complienceType: string;
  }>();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState<InspectionBookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: "",
    selectedShift: "morning",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  // Debug logging
  useEffect(() => {
    console.log("InspectionBooking mounted with params:", {
      propertyId,
      complienceType,
    });
  }, [propertyId, complienceType]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchComplianceData = async () => {
      if (!propertyId) {
        setError("Property ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching compliance data for property ID:", propertyId);
        const frontendLink = getFrontendLink();

        // Call the API endpoint
        const response = await fetch(
          `${frontendLink}/v1/properties/compliance/${propertyId}`
        );
        const data = await response.json();

        console.log("API response:", data);

        if (data.success) {
          // Get the specific compliance type data
          const complianceTypeKey =
            complienceType === "gasCompliance"
              ? "gasCompliance"
              : complienceType === "electricalSafety"
              ? "electricalSafety"
              : complienceType === "smokeAlarms"
              ? "smokeAlarms"
              : complienceType === "poolSafety"
              ? "poolSafety"
              : "gasCompliance";

          const complianceData = data.data.compliance[complianceTypeKey];
          const dueDate = ensureDateFormat(
            complianceData?.dueDate || new Date().toISOString()
          );

          setJobData({
            complianceData: data.data,
            dueDate: dueDate,
            complianceType: complienceType || "inspection",
          });
        } else {
          setError(data.message || "Failed to fetch compliance data");
        }
      } catch (err) {
        console.error("Error fetching compliance data:", err);
        setError("Failed to fetch compliance data");
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [propertyId, complienceType, searchParams]);

  const getAvailableDates = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const availableDates: string[] = [];

    console.log("Calculating available dates for due date:", dueDate);
    console.log("Due date object:", due);
    console.log("Today's date:", today);

    // Start from due date, allow 2 days after
    const startDate = new Date(due);
    const endDate = new Date(due);
    endDate.setDate(endDate.getDate() + 2);

    // If due date is in the past, start from today
    if (startDate < today) {
      startDate.setTime(today.getTime());
    }

    console.log("Start date (adjusted):", startDate);
    console.log("End date:", endDate);

    // Generate available dates
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Include all days (removed weekend filtering for now)
      availableDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("Available dates:", availableDates);
    return availableDates;
  };

  const handleDateChange = (date: string) => {
    console.log("Date selected:", date);
    setFormData((prev) => ({ ...prev, selectedDate: date }));
  };

  const handleShiftChange = (shift: "morning" | "afternoon") => {
    console.log("Shift selected:", shift);
    setFormData((prev) => ({ ...prev, selectedShift: shift }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.selectedDate) {
      setToast({
        message: "Please select a date",
        type: "error",
        isVisible: true,
      });
      return;
    }

    try {
      setSubmitting(true);

      // Get token from URL parameters
      const token = searchParams.get("token");

      // Prepare the request body for the API call
      const requestBody = {
        propertyId: propertyId,
        complianceType: complienceType,
        selectedDate: formData.selectedDate,
        selectedShift: formData.selectedShift,
        token: token,
      };

      console.log("API Request Body:", JSON.stringify(requestBody, null, 2));

      // Call the API to book the inspection
      const response = await fetch(
        `${getFrontendLink()}/v1/properties/book-inspection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to book inspection");
      }

      setToast({
        message: "Inspection booked successfully!",
        type: "success",
        isVisible: true,
      });

      // Show success message and stay on the page
      // In a real implementation, you might redirect to a confirmation page
      setTimeout(() => {
        setToast({
          message:
            "Thank you for booking your inspection. You will receive a confirmation email shortly.",
          type: "info",
          isVisible: true,
        });
      }, 2000);
    } catch (err) {
      console.error("Error booking inspection:", err);
      setToast({
        message: "Failed to book inspection. Please try again.",
        type: "error",
        isVisible: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to ensure date is in YYYY-MM-DD format
  const ensureDateFormat = (dateString: string): string => {
    return dateString.split("T")[0];
  };

  // Helper function to format compliance type for display
  const formatComplianceType = (complianceType: string): string => {
    switch (complianceType) {
      case "smokeAlarms":
        return "Smoke Alarms";
      case "electricalSafety":
        return "Electrical Safety";
      case "gasCompliance":
        return "Gas Compliance";
      case "poolSafety":
        return "Pool Safety";
      default:
        return complianceType;
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    // Ensure we're working with date-only strings (YYYY-MM-DD)
    const cleanDateString = ensureDateFormat(dateString);
    const date = new Date(cleanDateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="inspection-booking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="inspection-booking-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || "Failed to load job data"}</p>
          <button
            className="btn-secondary"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                window.close();
              }
            }}
          >
            <RiArrowLeftLine size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const availableDates = getAvailableDates(jobData.dueDate);

  return (
    <div className="inspection-booking-page">
      <div className="booking-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/rentalease-logo.png" alt="RentalEase" className="logo" />
            <span className="app-name">RentalEase</span>
          </div>
          <button
            className="btn-back"
            onClick={() => {
              // If there's a previous page, go back, otherwise go to a default page
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                // You can change this to any default page or just close the window
                window.close();
              }
            }}
          >
            <RiArrowLeftLine size={20} />
            Back
          </button>
        </div>
        <h1>Book Inspection</h1>
      </div>

      <div className="booking-container">
        <div className="job-info-card">
          <h2>Property Compliance Information</h2>
          <div className="job-details">
            <div className="detail-item">
              <strong>Property Address:</strong>{" "}
              {jobData.complianceData.propertyAddress}
            </div>
            <div className="detail-item">
              <strong>Compliance Type:</strong>{" "}
              {formatComplianceType(complienceType || "")}
            </div>

            <div className="detail-item">
              <strong>Due Date:</strong> {formatDateForDisplay(jobData.dueDate)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3>
              <RiCalendarLine size={20} />
              Select Date
            </h3>
            <p className="date-info">
              Available dates from due date to 2 days after (including
              weekends).
              {jobData.dueDate && (
                <span className="due-date-info">
                  Due date: {formatDateForDisplay(jobData.dueDate)}
                </span>
              )}
            </p>

            <div className="date-grid">
              {availableDates.length > 0 ? (
                <>
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      marginBottom: "0.5rem",
                      fontSize: "0.8rem",
                      color: "#6c757d",
                    }}
                  ></div>
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      className={`date-option ${
                        formData.selectedDate === date ? "selected" : ""
                      }`}
                      onClick={() => handleDateChange(date)}
                    >
                      <div className="date-day">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                      <div className="date-number">
                        {new Date(date).getDate()}
                      </div>
                      <div className="date-month">
                        {new Date(date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="no-dates-available">
                  <p>No available dates found within the allowed range.</p>
                  <p>Please contact support for assistance.</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>
              <RiTimeLine size={20} />
              Select Shift
            </h3>
            <div className="shift-options">
              <button
                type="button"
                className={`shift-option ${
                  formData.selectedShift === "morning" ? "selected" : ""
                }`}
                onClick={() => handleShiftChange("morning")}
              >
                <div className="shift-icon">🌅</div>
                <div className="shift-details">
                  <div className="shift-name">Morning</div>
                  <div className="shift-time">8:00 AM - 12:00 PM</div>
                </div>
                {formData.selectedShift === "morning" && (
                  <RiCheckLine size={20} className="check-icon" />
                )}
              </button>

              <button
                type="button"
                className={`shift-option ${
                  formData.selectedShift === "afternoon" ? "selected" : ""
                }`}
                onClick={() => handleShiftChange("afternoon")}
              >
                <div className="shift-icon">🌆</div>
                <div className="shift-details">
                  <div className="shift-name">Afternoon</div>
                  <div className="shift-time">1:00 PM - 5:00 PM</div>
                </div>
                {formData.selectedShift === "afternoon" && (
                  <RiCheckLine size={20} className="check-icon" />
                )}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  window.close();
                }
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.selectedDate || submitting}
            >
              {submitting ? "Booking..." : "Book Inspection"}
            </button>
          </div>
        </form>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default InspectionBooking;
