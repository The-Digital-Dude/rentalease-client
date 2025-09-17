import api from "./api";

export interface RegionalStats {
  overview: {
    totalProperties: number;
    activeProperties: number;
    totalTechnicians: number;
    availableTechnicians: number;
    totalPropertyManagers: number;
    activePropertyManagers: number;
    totalAgencies: number;
    activeAgencies: number;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    overdueJobs: number;
  };
  regionBreakdown: Record<string, number>;
  filters: {
    region: string;
    state: string;
  };
}

export interface RegionalProperty {
  id: string;
  address: string;
  propertyType: string;
  region: string;
  tenantName: string;
  tenantEmail: string;
  agency: {
    name: string;
    email: string;
    phone: string;
  } | null;
  propertyManager: {
    name: string;
    email: string;
    phone: string;
  } | null;
  createdAt: string;
}

export interface RegionalPropertyManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  region: string;
  status: string;
  propertyCount: number;
  createdAt: string;
}

export interface RegionalTechnician {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  region: string;
  availabilityStatus: string;
  status: string;
  experience: number;
  rating: number;
  totalRatings: number;
  completedJobs: number;
  currentJobs: number;
  createdAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RegionalPropertiesResponse {
  properties: RegionalProperty[];
  pagination: PaginationInfo;
}

export interface RegionalPropertyManagersResponse {
  propertyManagers: RegionalPropertyManager[];
  pagination: PaginationInfo;
}

export interface RegionalTechniciansResponse {
  technicians: RegionalTechnician[];
  pagination: PaginationInfo;
}

export interface RegionalFilters {
  region?: string;
  state?: string;
  page?: number;
  limit?: number;
}

class RegionalService {
  // Get regional statistics
  async getRegionalStats(filters: Partial<RegionalFilters> = {}): Promise<RegionalStats> {
    const params = new URLSearchParams();

    if (filters.region && filters.region !== "all") {
      params.append("region", filters.region);
    }

    if (filters.state && filters.state !== "all") {
      params.append("state", filters.state);
    }

    const response = await api.get(`/v1/regional/stats?${params.toString()}`);
    return response.data.data;
  }

  // Get properties by region/state
  async getRegionalProperties(filters: RegionalFilters = {}): Promise<RegionalPropertiesResponse> {
    const params = new URLSearchParams();

    if (filters.region && filters.region !== "all") {
      params.append("region", filters.region);
    }

    if (filters.state && filters.state !== "all") {
      params.append("state", filters.state);
    }

    if (filters.page) {
      params.append("page", filters.page.toString());
    }

    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }

    const response = await api.get(`/v1/regional/properties?${params.toString()}`);
    return response.data.data;
  }

  // Get property managers by state
  async getRegionalPropertyManagers(filters: RegionalFilters = {}): Promise<RegionalPropertyManagersResponse> {
    const params = new URLSearchParams();

    if (filters.state && filters.state !== "all") {
      params.append("state", filters.state);
    }

    if (filters.page) {
      params.append("page", filters.page.toString());
    }

    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }

    const response = await api.get(`/v1/regional/property-managers?${params.toString()}`);
    return response.data.data;
  }

  // Get technicians by state
  async getRegionalTechnicians(filters: RegionalFilters = {}): Promise<RegionalTechniciansResponse> {
    const params = new URLSearchParams();

    if (filters.state && filters.state !== "all") {
      params.append("state", filters.state);
    }

    if (filters.page) {
      params.append("page", filters.page.toString());
    }

    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }

    const response = await api.get(`/v1/regional/technicians?${params.toString()}`);
    return response.data.data;
  }
}

const regionalService = new RegionalService();
export default regionalService;