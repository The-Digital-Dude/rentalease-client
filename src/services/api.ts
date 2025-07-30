import axios from "axios";
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Get base URL from environment variables
const getBaseURL = (): string => {
  const env =
    import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || "development";

  switch (env) {
    case "production":
      return (
        import.meta.env.VITE_API_BASE_URL_PROD || "https://api.rentalease.com"
      );
    case "development":
    default:
      return (
        import.meta.env.VITE_API_BASE_URL_DEV || "http://localhost:4000/api"
      );
  }
};

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem("authToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Check if we're currently on a login page - if so, don't redirect
      // This allows login forms to handle authentication errors properly
      const isOnLoginPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname === "/password-reset";

      if (!isOnLoginPage) {
        // Token expired or invalid for protected routes, redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        window.location.href = "/login";
      }

      // For login pages, just let the error propagate to be handled by the form
    }

    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error("Access denied: Insufficient permissions");
    }

    if (error.response?.status >= 500) {
      // Server error
      console.error("Server error occurred");
    }

    return Promise.reject(error);
  }
);

// Export types
export type { AxiosResponse, AxiosError };

// Technician API methods
export const technicianAPI = {
  // Get all technicians for the authenticated user
  getTechnicians: async (params?: {
    page?: number;
    limit?: number;
    experience?: number;
    availabilityStatus?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/v1/technicians${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return api.get(url);
  },

  // Get single technician
  getTechnicianById: async (id: string) => {
    return api.get(`/v1/technicians/${id}`);
  },

  // Create new technician
  createTechnician: async (data: any) => {
    return api.post("/v1/technicians", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Update technician
  updateTechnician: async (id: string, data: any) => {
    return api.put(`/v1/technicians/${id}`, data);
  },

  // Delete technician
  deleteTechnician: async (id: string) => {
    return api.delete(`/v1/technicians/${id}`);
  },
};

export const contactsAPI = {
  // Get all contacts for the authenticated user
  getContacts: async () => {
    return api.get("/v1/contacts");
  },

  // Get single contact by ID
  getContactById: async (id: string) => {
    return api.get(`/v1/contacts/${id}`);
  },

  // Create new contact
  createContact: async (data: any) => {
    return api.post("/v1/contacts", data);
  },

  // Update contact
  updateContact: async (id: string, data: any) => {
    return api.put(`/v1/contacts/${id}`, data);
  },

  // Delete contact
  deleteContact: async (id: string) => {
    return api.delete(`/v1/contacts/${id}`);
  },

  // Send custom email to a contact
  sendEmailToContact: async (
    id: string,
    data: { subject: string; html: string }
  ) => {
    return api.post(`/v1/contacts/${id}/send-email`, data);
  },
};

export default api;
