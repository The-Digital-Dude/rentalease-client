import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
  userType?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      userType: string;
    };
    token: string;
  };
}

// Generic API response format
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Backend API response format (for non-login endpoints)
export interface BackendApiResponse {
  status: string;
  message: string;
  data?: any;
}

// Backend response format
export interface BackendLoginResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: {
    superUser?: {
      id: string;
      name: string;
      email: string;
    };
    agent?: {
      id: string;
      name: string;
      email: string;
    };
    agency?: {
      id: string;
      companyName: string;
      contactPerson: string;
      email: string;
      phone: string;
      region: string;
      compliance: string;
      status: string;
      abn: string;
      outstandingAmount: number;
      totalProperties: number;
      lastLogin: string;
      joinedDate: string;
    };
    propertyManager?: {
      id: string;
      name: string;
      email: string;
      fullName?: string; // Added for property manager
      contactPerson?: string; // Added for property manager
      companyName?: string; // Added for property manager
    };
    staff?: {
      id: string;
      name: string;
      email: string;
    };
    tenant?: {
      id: string;
      name: string;
      email: string;
    };
    technician?: {
      id: string;
      name: string;
      email: string;
    };
    token: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

class AuthService {
  /**
   * Map backend user types to frontend user types
   */
  private mapUserType(backendType: string): string {
    const typeMapping: Record<string, string> = {
      superUser: "super_user",
      admin: "super_user",
      propertyManager: "property_manager",
      staff: "staff",
      tenant: "tenant",
      agent: "agency", // Agents are now mapped to agency type
      technician: "technician",
    };

    return typeMapping[backendType] || "staff"; // Default to staff if unknown
  }

  /**
   * Login user with email and password
   */
  async login(
    email: string,
    password: string,
    userType = "admin"
  ): Promise<LoginResponse> {
    try {
      // Determine the correct endpoint based on user type
      let endpoint = "/v1/auth/login"; // Default for admin/superUser

      if (userType === "agent") {
        endpoint = "/v1/agency/auth/login";
      } else if (userType === "propertyManager") {
        endpoint = "/v1/property-manager/auth/login";
      } else if (userType === "technician") {
        endpoint = "/v1/technician/auth/login";
      }

      const response = await api.post<BackendLoginResponse>(endpoint, {
        email,
        password,
        // Note: Don't send userType for property manager endpoint
      });

      // Check if login was successful
      // Handle both old format (status: "success") and new PropertyManager format (success: true)
      const isSuccess =
        response.data.status === "success" || response.data.success === true;
      const hasToken = response.data.data?.token || response.data.data?.token;

      if (isSuccess && hasToken) {
        // Extract user data based on what's present in the response
        let user: { id: string; email: string; name: string } | null = null;
        let mappedUserType = "staff"; // default

        const responseData = response.data.data;

        // Handle agency login response structure
        if (responseData.agency) {
          user = {
            id: responseData.agency.id,
            email: responseData.agency.email,
            name:
              responseData.agency.contactPerson ||
              responseData.agency.companyName ||
              "Agency User",
          };
          mappedUserType = this.mapUserType("agent");
        } else if (responseData.superUser) {
          user = responseData.superUser;
          mappedUserType = this.mapUserType("superUser");
        } else if (responseData.agent) {
          user = responseData.agent;
          mappedUserType = this.mapUserType("agent");
        } else if (responseData.propertyManager) {
          // For property manager, map the response fields correctly
          user = {
            id: responseData.propertyManager.id,
            email: responseData.propertyManager.email,
            name:
              responseData.propertyManager.fullName ||
              responseData.propertyManager.contactPerson ||
              responseData.propertyManager.companyName ||
              "Property Manager",
          };
          mappedUserType = this.mapUserType("propertyManager");
        } else if (responseData.staff) {
          user = responseData.staff;
          mappedUserType = this.mapUserType("staff");
        } else if (responseData.tenant) {
          user = responseData.tenant;
          mappedUserType = this.mapUserType("tenant");
        } else if (responseData.technician) {
          user = responseData.technician;
          mappedUserType = this.mapUserType("technician");
        }

        if (!user) {
          throw new Error("Invalid user data received from server");
        }

        // Transform backend response to frontend format
        const transformedResponse: LoginResponse = {
          success: true,
          message: response.data.message || "Login successful",
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              userType: mappedUserType,
            },
            token: response.data.data.token,
          },
        };

        // Store token in localStorage
        const token = response.data.data.token;
        localStorage.setItem("authToken", token);
        localStorage.setItem(
          "userData",
          JSON.stringify(transformedResponse.data!.user)
        );

        return transformedResponse;
      } else {
        return {
          success: false,
          message: "Login failed",
        };
      }
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Login failed");
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    // Just clear localStorage - Redux state will be cleared by the logout action
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  /**
   * Get stored user data
   */
  getUserData(): any | null {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Forgot password - Send OTP to email
   */
  async forgotPassword(email: string, userType: string): Promise<ApiResponse> {
    try {
      let endpoint = "/v1/auth/forgot-password";

      // Use different endpoint for property managers
      if (userType === "agent") {
        endpoint = "/v1/agency/auth/forgot-password";
      } else if (userType === "propertyManager") {
        endpoint = "/v1/property-manager/auth/forgot-password";
      }

      const response = await api.post<BackendApiResponse>(endpoint, {
        email,
      });

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message || "OTP sent successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to send OTP",
        };
      }
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to send OTP");
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }

  /**
   * Verify OTP without resetting password
   */
  async verifyOTP(
    email: string,
    otp: string,
    userType: string
  ): Promise<ApiResponse> {
    try {
      let endpoint = "/v1/auth/verify-otp";

      // Use different endpoint for property managers
      if (userType === "agent") {
        endpoint = "/v1/agency/auth/verify-otp";
      } else if (userType === "propertyManager") {
        endpoint = "/v1/property-manager/auth/verify-otp";
      }

      const response = await api.post<BackendApiResponse>(endpoint, {
        email,
        otp,
      });

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message || "OTP verified successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Invalid OTP",
        };
      }
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        throw new Error(
          error.response.data.message || "OTP verification failed"
        );
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPasswordWithOTP(
    email: string,
    otp: string,
    newPassword: string,
    userType: string
  ): Promise<ApiResponse> {
    try {
      let endpoint = "/v1/auth/reset-password";

      // Use different endpoint for property managers
      if (userType === "agent") {
        endpoint = "/v1/agency/auth/reset-password";
      } else if (userType === "propertyManager") {
        endpoint = "/v1/property-manager/auth/reset-password";
      }

      const response = await api.post<BackendApiResponse>(endpoint, {
        email,
        otp,
        newPassword,
      });

      if (response.data.status === "success") {
        return {
          success: true,
          message: response.data.message || "Password reset successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to reset password",
        };
      }
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Password reset failed");
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }
}

export default new AuthService();
