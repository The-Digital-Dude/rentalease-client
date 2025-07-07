import api from './api';

export interface PropertyManager {
  id: string;
  name: string;
  abn: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  region: string;
  complianceLevel: string;
  status: "active" | "inactive" | "pending";
  outstandingAmount: number;
}

// Server response format for property manager
export interface ServerPropertyManager {
  id: string;
  companyName: string;
  abn: string;
  contactPerson: string;
  email: string;
  phone: string;
  region: string;
  compliance: string;
  status: string;
  outstandingAmount: number;
  totalProperties: number;
  lastLogin?: string | null;
  joinedDate?: string;
  createdAt?: string;
}

export interface ServerResponse {
  status: string;
  data: {
    propertyManagers: ServerPropertyManager[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Response format for create property manager
export interface CreatePropertyManagerResponse {
  status: string;
  message: string;
  data: {
    propertyManager: ServerPropertyManager;
    createdBy: string;
  };
}

export interface PropertyManagerResponse {
  success: boolean;
  data: PropertyManager[];
  message?: string;
}

// Helper function to map server data to client format
const mapServerToClient = (serverData: ServerPropertyManager): PropertyManager => ({
  id: serverData.id,
  name: serverData.companyName,
  abn: serverData.abn,
  contactPerson: serverData.contactPerson,
  contactEmail: serverData.email,
  contactPhone: serverData.phone,
  region: serverData.region,
  complianceLevel: serverData.compliance,
  status: serverData.status.toLowerCase() as "active" | "inactive" | "pending",
  outstandingAmount: serverData.outstandingAmount,
});

export const propertyManagerService = {
  // Get all property managers
  getAllPropertyManagers: async (): Promise<PropertyManagerResponse> => {
    try {
      const response = await api.get<ServerResponse>('/v1/property-manager/auth/all');
      
      if (response.data.status === 'success' && response.data.data.propertyManagers) {
        const mappedData = response.data.data.propertyManagers.map(mapServerToClient);
        return {
          success: true,
          data: mappedData,
        };
      } else {
        return {
          success: false,
          data: [],
          message: 'Invalid response format from server',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch property managers',
      };
    }
  },

  // Create new property manager
  createPropertyManager: async (propertyManager: Omit<PropertyManager, 'id'> & { password?: string }): Promise<PropertyManagerResponse> => {
    try {
      // Map client data to server format
      const serverData = {
        companyName: propertyManager.name,
        abn: propertyManager.abn,
        contactPerson: propertyManager.contactPerson,
        email: propertyManager.contactEmail,
        phone: propertyManager.contactPhone,
        region: propertyManager.region,
        compliance: propertyManager.complianceLevel,
        password: propertyManager.password, // Required for new property managers
      };
      
      const response = await api.post<CreatePropertyManagerResponse>('/v1/property-manager/auth/register', serverData);
      
      if (response.data.status === 'success' && response.data.data?.propertyManager) {
        const mappedData = mapServerToClient(response.data.data.propertyManager);
        return {
          success: true,
          data: [mappedData],
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.data.message || 'Failed to create property manager',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to create property manager',
      };
    }
  },

  // Update property manager
  updatePropertyManager: async (id: string, propertyManager: Partial<PropertyManager>): Promise<PropertyManagerResponse> => {
    try {
      // Map client data to server format
      const serverData: any = {};
      if (propertyManager.name) serverData.companyName = propertyManager.name;
      if (propertyManager.abn) serverData.abn = propertyManager.abn;
      if (propertyManager.contactPerson) serverData.contactPerson = propertyManager.contactPerson;
      if (propertyManager.contactEmail) serverData.email = propertyManager.contactEmail;
      if (propertyManager.contactPhone) serverData.phone = propertyManager.contactPhone;
      if (propertyManager.region) serverData.region = propertyManager.region;
      if (propertyManager.complianceLevel) serverData.compliance = propertyManager.complianceLevel;
      if (propertyManager.status) serverData.status = propertyManager.status;
      if (propertyManager.outstandingAmount !== undefined) serverData.outstandingAmount = propertyManager.outstandingAmount;
      
      const response = await api.put(`/v1/property-manager/auth/${id}`, serverData);
      
      if (response.data.status === 'success' && response.data.data) {
        const mappedData = mapServerToClient(response.data.data);
        return {
          success: true,
          data: [mappedData],
        };
      } else {
        return {
          success: false,
          data: [],
          message: response.data.message || 'Failed to update property manager',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to update property manager',
      };
    }
  },

  // Delete property manager
  deletePropertyManager: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.delete(`/v1/property-manager/auth/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete property manager',
      };
    }
  },
}; 