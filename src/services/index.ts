export { default as api, technicianAPI } from "./api";
export { default as authService } from "./authService";
export { default as jobService } from "./jobService";
export { agencyService } from "./agencyService";
export { default as technicianService } from "./technicianService";
export { default as propertyManagerService } from "./propertyManagerService";
export { default as staffService } from "./staffService";
export { notificationService } from "./notificationService";

// Re-export types from jobService
export type {
  Job,
  CreateJobData,
  UpdateJobData,
  JobFilters,
  JobApiResponse,
} from "./jobService";

// Re-export types from staffService
export type {
  Staff,
  StaffFilters,
  CreateStaffData,
  UpdateStaffData,
  StaffApiResponse,
} from "./staffService";

// Re-export types from propertyManagerService
export type {
  PropertyManager,
  AssignedProperty,
  PropertyManagerFilters,
  CreatePropertyManagerData,
  UpdatePropertyManagerData,
  PropertyManagerApiResponse,
  AssignPropertyManagerData,
  BulkAssignPropertyManagerData,
} from "./propertyManagerService";

// Technician-related types
export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  experience: number;
  availabilityStatus: "Available" | "Busy" | "Unavailable" | "On Leave";
  currentJobs: number;
  maxJobs: number;
  assignedJobs: AssignedJob[];
  completedJobs: number;
  averageRating: number;
  totalRatings: number;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  owner: {
    ownerType: "SuperUser" | "Agency";
    ownerId: string;
  };
  address: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    fullAddress?: string;
  };

  createdAt: string;
  lastUpdated: string;
  lastLogin?: string;
  lastActive?: string;
}

export interface AssignedJob {
  jobId: string;
  assignedDate: string;
  status: "Active" | "Completed" | "Cancelled";
}

export interface TechnicianFilters {
  page?: number;
  limit?: number;
  experience?: number;
  availabilityStatus?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateTechnicianData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  experience?: number;
  availabilityStatus?: string;
  maxJobs?: number;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
}

export interface UpdateTechnicianData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  experience?: number;
  availabilityStatus?: string;
  maxJobs?: number;
  status?: string;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
}

export interface TechnicianApiResponse {
  status: "success" | "error";
  message: string;
  data: {
    technician?: Technician;
    technicians?: Technician[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}
