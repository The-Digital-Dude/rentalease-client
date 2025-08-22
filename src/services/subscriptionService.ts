import api from "./api";

export interface SubscriptionStatus {
  status:
    | "trial"
    | "active"
    | "past_due"
    | "canceled"
    | "incomplete"
    | "unpaid";
  planType: "starter" | "pro" | "enterprise";
  billingPeriod: "monthly" | "yearly";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialEndsAt?: string;
  limits: {
    properties: number;
  };
  currentUsage?: {
    properties: number;
  };
  canCreateProperty: boolean;
  hasActiveSubscription: boolean;
}

export interface StripeSubscriptionDetails {
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionResponse {
  subscription: SubscriptionStatus;
  stripe?: StripeSubscriptionDetails;
}

export interface BillingPortalResponse {
  url: string;
}

export interface AnalyticsMetric {
  value: number;
  trend: number;
  trendDirection: 'positive' | 'negative' | 'neutral';
}

export interface AnalyticsData {
  totalProperties: AnalyticsMetric;
  totalPropertyManagers: AnalyticsMetric;
  totalCompletedJobs: AnalyticsMetric;
  weeklyActivity: number[];
}

class SubscriptionService {
  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionResponse> {
    try {
      const response = await api.get("/v1/subscription/status");

      if (response.data.status === "success") {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch subscription status"
      );
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch subscription status"
      );
    }
  }

  /**
   * Create customer portal session for managing subscription
   */
  async createPortalSession(data: { agencyId?: string } = {}): Promise<string> {
    try {
      const response = await api.post("/v1/subscription/create-portal-session", data);

      if (response.data.status === "success") {
        return response.data.data.url;
      }

      throw new Error(
        response.data.message || "Failed to create portal session"
      );
    } catch (error: any) {
      console.error("Error creating portal session:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create portal session"
      );
    }
  }

  /**
   * Get analytics data for the agency
   */
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      const response = await api.get("/v1/subscription/analytics");

      if (response.data.status === "success") {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch analytics data"
      );
    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch analytics data"
      );
    }
  }

  /**
   * Create a checkout session for an existing agency to subscribe
   */
  async createCheckoutSession(planType: 'starter' | 'pro', billingPeriod: 'monthly' | 'yearly'): Promise<string> {
    try {
      const response = await api.post("/v1/subscription/create-checkout-session", { planType, billingPeriod });

      if (response.data.status === "success") {
        return response.data.data.url;
      }

      throw new Error(
        response.data.message || "Failed to create checkout session"
      );
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create checkout session"
      );
    }
  }

  /**
   * Get plan features and limits
   */
  getPlanFeatures(planType: string) {
    const plans = {
      starter: {
        name: "Starter",
        price: "$99/mo",
        features: ["Up to 50 Properties", "Full CRM Access", "Basic Support"],
      },
      pro: {
        name: "Pro",
        price: "$199/mo",
        features: [
          "Up to 150 Properties",
          "Priority Support",
          "Advanced Reporting",
        ],
      },
      enterprise: {
        name: "Enterprise",
        price: "Custom",
        features: [
          "Unlimited Properties",
          "Custom Features",
          "Dedicated Account Manager",
        ],
      },
    };

    return plans[planType as keyof typeof plans] || plans.starter;
  }

  /**
   * Format trial remaining time
   */
  getTrialRemainingTime(trialEndsAt?: string): string {
    if (!trialEndsAt) return "Unknown";

    const trialEnd = new Date(trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Trial Expired";
    if (diffDays === 1) return "1 day remaining";
    return `${diffDays} days remaining`;
  }

  /**
   * Get next billing date
   */
  getNextBillingDate(subscriptionEndDate?: string): string {
    if (!subscriptionEndDate) return "Unknown";

    const date = new Date(subscriptionEndDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Check if subscription allows certain actions
   */
  canPerformAction(
    subscription: SubscriptionStatus,
    action: "create_property" | "add_user" | "create_job"
  ): boolean {
    if (!subscription.hasActiveSubscription) return false;

    // During trial, allow all actions
    if (subscription.status === "trial") return true;

    // For active subscriptions, check based on limits
    if (subscription.status === "active") {
      return true; // Specific checks would be done against current usage
    }

    return false;
  }

  /**
   * Get status color and icon
   */
  getStatusDisplay(status: string) {
    const statusMap = {
      trial: { color: "blue", icon: "clock", label: "Free Trial" },
      active: { color: "green", icon: "check", label: "Active" },
      past_due: { color: "orange", icon: "warning", label: "Past Due" },
      canceled: { color: "red", icon: "x", label: "Cancelled" },
      incomplete: { color: "yellow", icon: "clock", label: "Incomplete" },
      unpaid: { color: "red", icon: "alert", label: "Unpaid" },
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
