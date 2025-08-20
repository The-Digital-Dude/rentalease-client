import React, { useState, useEffect } from "react";
import {
  RiVipCrown2Line,
  RiCalendar2Line,
  RiCheckLine,
  RiTimeFill,
  RiAlertFill,
  RiStarFill,
  RiSettings2Line,
  RiRefreshLine,
  RiExternalLinkFill,
  RiShieldCheckFill,
  RiRocket2Line,
  RiBuildingFill,
  RiTeamFill,
  RiToolsFill,
  RiCodeSSlashLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiInformationFill,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import subscriptionService, {
  type SubscriptionResponse,
} from "../../services/subscriptionService";
import Toast from "../../components/Toast";
import "./Subscription.scss";

const Subscription: React.FC = () => {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getSubscriptionStatus();
      setSubscriptionData(data);
    } catch (err: any) {
      console.error("Error fetching subscription data:", err);
      setError(err.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoadingPortal(true);
      const portalUrl = await subscriptionService.createPortalSession();
      window.open(portalUrl, "_blank");
      setToast({
        message: "Billing portal opened in new tab",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error opening billing portal:", err);
      setToast({
        message: err.message || "Failed to open billing portal",
        type: "error",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleRefresh = () => {
    fetchSubscriptionData();
    setToast({ message: "Subscription data refreshed", type: "info" });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <RiAlertFill />
          <h3>Error Loading Subscription</h3>
          <p>{error}</p>
          <button onClick={fetchSubscriptionData} className="btn-primary">
            <RiRefreshLine />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="page-container">
        <div className="error-state">
          <RiAlertFill />
          <h3>No Subscription Data</h3>
          <p>Unable to load subscription information.</p>
          <button onClick={fetchSubscriptionData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { subscription, stripe } = subscriptionData;
  const statusDisplay = subscriptionService.getStatusDisplay(
    subscription.status
  );
  const planDetails = subscriptionService.getPlanFeatures(
    subscription.planType
  );
  const trialRemaining = subscriptionService.getTrialRemainingTime(
    subscription.trialEndsAt
  );
  const nextBilling = subscriptionService.getNextBillingDate(
    subscription.subscriptionEndDate
  );

  const isTrialExpired =
    subscription.status === "trial" &&
    subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt) < new Date();

  return (
    <div className="page-container subscription-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Subscription Management</h1>
            <p>Manage your RentalEase CRM subscription and billing</p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleRefresh}
              className="btn-secondary"
              disabled={loading}
            >
              <RiRefreshLine />
              Refresh
            </button>
            <button
              onClick={handleManageBilling}
              className="btn-primary"
              disabled={loadingPortal}
            >
              {loadingPortal ? (
                <>
                  <div className="spinner-small"></div>
                  Opening...
                </>
              ) : (
                <>
                  <RiExternalLinkFill />
                  Manage Billing
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="subscription-overview">
        <div className="status-cards">
          {/* Current Plan */}
          <div className={`status-card plan-card ${subscription.planType}`}>
            <div className="card-header">
              <div className="plan-info">
                <h3>{planDetails.name} Plan</h3>
                <div className="plan-price">{planDetails.price}</div>
              </div>
              <div className={`status-badge ${statusDisplay.color}`}>
                {statusDisplay.label}
              </div>
            </div>
            <div className="plan-features">
              {planDetails.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="feature-item">
                  <RiCheckLine />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Status */}
          <div className="status-card billing-card">
            <div className="card-header">
              <RiVipCrown2Line />
              <h3>Billing Status</h3>
            </div>
            <div className="billing-info">
              {subscription.status === "trial" ? (
                <div className="trial-info">
                  <div className="trial-remaining">
                    <RiTimeFill className={isTrialExpired ? "expired" : ""} />
                    <span className={isTrialExpired ? "expired" : ""}>
                      {trialRemaining}
                    </span>
                  </div>
                  {isTrialExpired && (
                    <div className="trial-expired-message">
                      <RiAlertFill />
                      <span>
                        Your trial has expired. Please update your billing
                        information.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="billing-details">
                  <div className="billing-item">
                    <label>Billing Period</label>
                    <span className="capitalize">
                      {subscription.billingPeriod}
                    </span>
                  </div>
                  <div className="billing-item">
                    <label>Next Billing</label>
                    <span>{nextBilling}</span>
                  </div>
                  {stripe?.cancelAtPeriodEnd && (
                    <div className="cancellation-notice">
                      <RiInformationFill />
                      <span>Subscription will cancel at period end</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="usage-section">
          <h2>
            <RiStarFill />
            Current Plan Limits
          </h2>
          <div className="usage-grid">
            <div className="usage-card">
              <div className="usage-header">
                <RiBuildingFill />
                <h4>Properties</h4>
              </div>
              <div className="usage-progress">
                <div className="usage-bar">
                  <div 
                    className="usage-fill" 
                    style={{ 
                      width: subscription.limits.properties === -1 || subscription.limits.properties === Infinity 
                        ? "0%" 
                        : `${Math.min(100, ((subscription.currentUsage?.properties || 0) / subscription.limits.properties) * 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="usage-text">
                  {subscription.limits.properties === -1 || subscription.limits.properties === Infinity
                    ? "Unlimited"
                    : `${subscription.currentUsage?.properties || 0} / ${subscription.limits.properties}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="features-section">
          <h2>
            <RiShieldCheckFill />
            Plan Features
          </h2>
          <div className="features-grid">
            {planDetails.features.map((feature, index) => (
              <div key={index} className="feature-card">
                <RiCheckboxCircleLine />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Section */}
        {subscription.planType !== "enterprise" && (
          <div className="upgrade-section">
            <div className="upgrade-card">
              <div className="upgrade-content">
                <RiRocket2Line />
                <h3>Need More?</h3>
                <p>
                  Upgrade to unlock more properties, users, and premium
                  features.
                </p>
                <button
                  onClick={handleManageBilling}
                  className="btn-primary"
                  disabled={loadingPortal}
                >
                  <RiArrowUpSLine />
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Subscription;
