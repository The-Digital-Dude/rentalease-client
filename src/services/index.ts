// Export existing services
export { default as authService } from './authService';
export { propertyManagerService } from './propertyManagerService';
export { default as jobService } from './jobService';

// Export API and staff API
export { default as api, staffAPI } from './api';

// Staff-related types
export interface StaffMember {
  id: string;
  fullName: string;
  tradeType: 'Plumber' | 'Electrician' | 'Carpenter' | 'Painter' | 'Cleaner' | 'Gardener' | 'Handyman' | 'HVAC Technician' | 'Pest Control' | 'Locksmith' | 'Flooring Specialist' | 'Appliance Repair' | 'Other';
  phone: string;
  email: string;
  availabilityStatus: 'Available' | 'Unavailable' | 'Busy' | 'On Leave';
  startDate: string;
  serviceRegions: ('North' | 'South' | 'East' | 'West' | 'Central')[];
  status: 'Active' | 'Inactive' | 'Suspended' | 'Terminated';
  rating: number;
  totalJobs: number;
  completedJobs: number;
  notes?: string;
  hourlyRate?: number;
  licensingDocuments: StaffDocument[];
  insuranceDocuments: StaffDocument[];
  owner: {
    ownerType: 'SuperUser' | 'PropertyManager';
    ownerId: string;
  };
  createdAt: string;
  updatedAt: string;
  lastActiveDate: string;
}

export interface StaffDocument {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadDate: string;
  path: string;
}

export interface StaffFilters {
  page?: number;
  limit?: number;
  tradeType?: string;
  availabilityStatus?: string;
  serviceRegion?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StaffApiResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    staff: StaffMember[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface CreateStaffData {
  fullName: string;
  tradeType: string;
  phone: string;
  email: string;
  availabilityStatus?: string;
  startDate: string;
  serviceRegions: string[];
  notes?: string;
  hourlyRate?: number;
}