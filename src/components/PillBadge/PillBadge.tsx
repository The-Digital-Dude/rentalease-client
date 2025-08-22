import React from "react";
import { RiVipCrown2Line } from "react-icons/ri";
import "./PillBadge.scss";

interface PillBadgeProps {
  planType: "starter" | "pro" | "enterprise" | "trial";
  status: "trial" | "active" | "past_due" | "canceled" | "incomplete" | "unpaid";
  showIcon?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

const PillBadge: React.FC<PillBadgeProps> = ({
  planType,
  status,
  showIcon = true,
  size = "medium",
  className = "",
}) => {
  const getDisplayName = (plan: string, statusValue: string) => {
    const planNames = {
      starter: "Starter",
      pro: "Pro",
      enterprise: "Enterprise",
      trial: "Trial"
    };
    
    const statusNames = {
      trial: "Trial",
      active: "Active",
      past_due: "Past Due",
      canceled: "Canceled",
      incomplete: "Incomplete",
      unpaid: "Unpaid"
    };

    const planName = planNames[plan as keyof typeof planNames] || planNames.starter;
    const statusName = statusNames[statusValue as keyof typeof statusNames] || statusNames.active;
    
    return `${planName} Plan - ${statusName}`;
  };

  return (
    <div 
      className={`subscription-badge ${planType} ${status} ${size} ${className}`}
      title={getDisplayName(planType, status)}
    >
      {showIcon && <RiVipCrown2Line className="subscription-icon" />}
      <span>{getDisplayName(planType, status)}</span>
    </div>
  );
};

export default PillBadge;