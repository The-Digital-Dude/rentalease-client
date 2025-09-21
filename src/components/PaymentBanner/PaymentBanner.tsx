import {
  RiAlertLine,
  RiSdCardLine,
  RiInformationLine,
  RiTimeLine,
} from "react-icons/ri";
import "./PaymentBanner.scss";

interface PaymentBannerProps {
  subscriptionStatus: string;
  subscriptionAmount: number;
  paymentLinkUrl?: string;
  trialEndsAt?: string;
  onStartPayment?: () => void;
}

const PaymentBanner = ({
  subscriptionStatus,
  subscriptionAmount,
  paymentLinkUrl,
  trialEndsAt,
  onStartPayment,
}: PaymentBannerProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePaymentClick = () => {
    if (paymentLinkUrl) {
      window.open(paymentLinkUrl, "_blank", "noopener,noreferrer");
    } else if (onStartPayment) {
      onStartPayment();
    }
  };

  // Don't show banner for active subscriptions
  if (subscriptionStatus === "active") {
    return null;
  }

  // Determine banner type and content based on status
  let bannerClass = "payment-banner";
  let icon = <RiInformationLine />;
  let title = "";
  let message = "";
  let actionText = "Start Subscription";

  switch (subscriptionStatus) {
    case "pending_payment":
      bannerClass += " warning";
      icon = <RiAlertLine />;
      title = "Subscription Payment Required";
      message = `Complete your ${formatCurrency(
        subscriptionAmount
      )}/month subscription to activate full CRM access and start your 14-day free trial.`;
      actionText = "Complete Payment";
      break;

    case "trial":
      bannerClass += " info";
      icon = <RiTimeLine />;
      title = "Free Trial Active";
      message = `You're currently on a 14-day free trial. Your subscription of ${formatCurrency(
        subscriptionAmount
      )}/month will begin ${
        trialEndsAt ? `on ${formatDate(trialEndsAt)}` : "after your trial ends"
      }.`;
      actionText = "Manage Subscription";
      break;

    case "past_due":
      bannerClass += " danger";
      icon = <RiAlertLine />;
      title = "Payment Failed";
      message = `Your ${formatCurrency(
        subscriptionAmount
      )}/month subscription payment failed. Please update your payment method to continue using the CRM.`;
      actionText = "Update Payment";
      break;

    case "incomplete":
      bannerClass += " warning";
      icon = <RiSdCardLine />;
      title = "Payment Setup Incomplete";
      message = `Please complete your subscription setup to access the full CRM features. Monthly cost: ${formatCurrency(
        subscriptionAmount
      )}.`;
      actionText = "Complete Setup";
      break;

    default:
      // Don't show banner for unknown statuses
      return null;
  }

  return (
    <div className={bannerClass}>
      <div className="banner-content">
        <div className="banner-icon">{icon}</div>
        <div className="banner-text">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
        <div className="banner-actions">
          <button
            className="btn btn-primary"
            onClick={handlePaymentClick}
            disabled={!paymentLinkUrl && !onStartPayment}
          >
            <RiSdCardLine />
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentBanner;
