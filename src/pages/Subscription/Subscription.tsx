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
  RiBarChartBoxLine,
  RiLineChartLine,
  RiArrowUpLine as RiTrendingUpLine,
  RiUserLine,
  RiCheckboxCircleFill,
  RiCalendarEventLine,
} from "react-icons/ri";
import subscriptionService, {
  type SubscriptionResponse,
  type AnalyticsData,
} from "../../services/subscriptionService";
import Toast from "../../components/Toast";
import "./Subscription.scss";

const Subscription: React.FC = () => {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
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
      const [subscriptionResult, analyticsResult] = await Promise.allSettled([
        subscriptionService.getSubscriptionStatus(),
        subscriptionService.getAnalyticsData()
      ]);
      
      if (subscriptionResult.status === 'fulfilled') {
        setSubscriptionData(subscriptionResult.value);
      } else {
        console.error("Error fetching subscription data:", subscriptionResult.reason);
        setError(subscriptionResult.reason?.message || "Failed to load subscription data");
      }
      
      if (analyticsResult.status === 'fulfilled') {
        setAnalyticsData(analyticsResult.value);
      } else {
        console.error("Error fetching analytics data:", analyticsResult.reason);
        // Don't set error for analytics failure, just log it
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };
;

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
      setLoadingCheckout(false);
    }
  };

  const handleSubscribe = async (planType: 'starter' | 'pro') => {
    try {
      setLoadingCheckout(true);
      const checkoutUrl = await subscriptionService.createCheckoutSession(planType, 'monthly');
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error("Error starting subscription:", err);
      setToast({
        message: err.message || "Failed to start subscription",
        type: "error",
      });
    } finally {
      setLoadingCheckout(false);
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
      <div className="page-container subscription-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Subscription Required</h1>
              <p>Choose a plan to continue using RentalEase CRM</p>
            </div>
          </div>
        </div>

        {/* No Subscription CTA */}
        <div className="no-subscription-cta">
          <div className="cta-icon">
            <RiVipCrown2Line />
          </div>
          <h2>Activate Your Subscription</h2>
          <p>You currently don't have an active subscription. Choose a plan to unlock all features and start your 14-day free trial.</p>
          <div className="plan-options">
            <button 
              className="btn-primary" 
              onClick={() => handleSubscribe('starter')}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? 'Redirecting...' : 'Start with Starter Plan'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => handleSubscribe('pro')}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? 'Redirecting...' : 'Start with Pro Plan'}
            </button>
          </div>
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

          {/* Usage Analytics & Insights Card */}
          <div className="status-card analytics-card">
            <div className="card-header">
              <h3>Usage Analytics & Insights</h3>
              <RiBarChartBoxLine />
            </div>
            <div className="analytics-info">
              <div className="analytics-metrics">
                <div className="metric-item">
                  <div className="metric-icon">
                    <RiBuildingFill />
                  </div>
                  <div className="metric-details">
                    <span className="metric-value">{analyticsData?.totalProperties.value || 0}</span>
                    <span className="metric-label">Total Properties</span>
                    <span className={`metric-trend ${analyticsData?.totalProperties.trendDirection || 'neutral'}`}>
                      {analyticsData?.totalProperties.trendDirection === 'positive' && <RiTrendingUpLine />}
                      {analyticsData?.totalProperties.trendDirection === 'negative' && <RiArrowDownSLine />}
                      {analyticsData?.totalProperties.trendDirection === 'neutral' && <RiLineChartLine />}
                      {analyticsData?.totalProperties.trend > 0 ? '+' : ''}{analyticsData?.totalProperties.trend || 0}% this month
                    </span>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">
                    <RiUserLine />
                  </div>
                  <div className="metric-details">
                    <span className="metric-value">{analyticsData?.totalPropertyManagers.value || 0}</span>
                    <span className="metric-label">Property Managers</span>
                    <span className={`metric-trend ${analyticsData?.totalPropertyManagers.trendDirection || 'neutral'}`}>
                      {analyticsData?.totalPropertyManagers.trendDirection === 'positive' && <RiTrendingUpLine />}
                      {analyticsData?.totalPropertyManagers.trendDirection === 'negative' && <RiArrowDownSLine />}
                      {analyticsData?.totalPropertyManagers.trendDirection === 'neutral' && <RiLineChartLine />}
                      {analyticsData?.totalPropertyManagers.trend > 0 ? '+' : ''}{analyticsData?.totalPropertyManagers.trend || 0}% this month
                    </span>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">
                    <RiCheckboxCircleFill />
                  </div>
                  <div className="metric-details">
                    <span className="metric-value">{analyticsData?.totalCompletedJobs.value || 0}</span>
                    <span className="metric-label">Completed Jobs</span>
                    <span className={`metric-trend ${analyticsData?.totalCompletedJobs.trendDirection || 'neutral'}`}>
                      {analyticsData?.totalCompletedJobs.trendDirection === 'positive' && <RiTrendingUpLine />}
                      {analyticsData?.totalCompletedJobs.trendDirection === 'negative' && <RiArrowDownSLine />}
                      {analyticsData?.totalCompletedJobs.trendDirection === 'neutral' && <RiLineChartLine />}
                      {analyticsData?.totalCompletedJobs.trend > 0 ? '+' : ''}{analyticsData?.totalCompletedJobs.trend || 0}% this month
                    </span>
                  </div>
                </div>
              </div>
              <div className="analytics-chart">
                <h4>Completed Jobs (Last 4 Weeks)</h4>
                <div className="mini-chart">
                  <div className="chart-bars">
                    {analyticsData?.weeklyActivity.map((activity, index) => {
                      const maxActivity = Math.max(...(analyticsData.weeklyActivity || [1]));
                      const height = maxActivity > 0 ? (activity / maxActivity) * 100 : 0;
                      return (
                        <div 
                          key={index} 
                          className="bar" 
                          style={{height: `${Math.max(height, 8)}%`}}
                          title={`Week ${index + 1}: ${activity} completed jobs`}
                        ></div>
                      );
                    }) || [
                      <div key={0} className="bar" style={{height: '8%'}}></div>,
                      <div key={1} className="bar" style={{height: '8%'}}></div>,
                      <div key={2} className="bar" style={{height: '8%'}}></div>,
                      <div key={3} className="bar" style={{height: '8%'}}></div>
                    ]}
                  </div>
                  <div className="chart-labels">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>
              </div>
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
                      width: `${Math.min(
                        100,
                        ((subscription.currentUsage?.properties || 0) /
                          subscription.limits.properties) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="usage-text">
                  {subscription.currentUsage?.properties || 0} /{" "}
                  {subscription.limits.properties === -1
                    ? "Unlimited"
                    : subscription.limits.properties}
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
          <div className="upgrade-section-new">
            <div className="upgrade-content">
                <div className="upgrade-icon">
                    <RiRocket2Line />
                </div>
                <div className="upgrade-text">
                    <h3>{subscription.planType === 'starter' ? 'Upgrade to Pro' : 'Need More Power?'}</h3>
                    <p>{subscription.planType === 'starter' ? 'Unlock advanced features like priority support and expanded limits.' : 'Explore our Enterprise plan for unlimited possibilities.'}</p>
                </div>
                <button 
                  onClick={handleManageBilling}
                  className="btn-upgrade"
                  disabled={loadingPortal}
                >
                    {loadingPortal ? 'Opening...' : (subscription.planType === 'starter' ? 'Upgrade Now' : 'Contact Sales')}
                </button>
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
