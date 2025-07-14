import type { Staff as ServiceStaff } from '../services/staffService';

export interface ComponentTechnician {
  id: string;
  name: string;
  specialties: string[];
  availability: "Available" | "Busy" | "Off Duty";
  currentJobs: number;
}

export const adaptServiceStaffToComponentTechnician = (serviceStaff: ServiceStaff): ComponentTechnician => {
  return {
    id: serviceStaff.id,
    name: serviceStaff.fullName,
    specialties: [serviceStaff.tradeType], // Convert tradeType to specialties array
    availability: serviceStaff.availabilityStatus,
    currentJobs: serviceStaff.currentJobs || 0 // Use the currentJobs from service data
  };
}; 