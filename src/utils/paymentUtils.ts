/**
 * Shared utility functions for payment management
 */

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Pending":
      return "status-pending";
    case "Paid":
      return "status-paid";
    case "Cancelled":
      return "status-cancelled";
    default:
      return "status-default";
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const getJobTypeIcon = (jobType: string): string => {
  switch (jobType) {
    case "Gas":
      return "🔥";
    case "Electrical":
      return "⚡";
    case "Smoke":
      return "🚨";
    case "Repairs":
      return "🔧";
    case "Routine Inspection":
      return "📋";
    default:
      return "📋";
  }
};