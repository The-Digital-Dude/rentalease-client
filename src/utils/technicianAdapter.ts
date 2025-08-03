import type { Technician as ServiceTechnician } from "../services/technicianService";

export interface ComponentTechnician {
  id: string;
  name: string;
  specialties: string[];
  availability: "Available" | "Busy" | "Unavailable" | "On Leave";
  currentJobs: number;
  maxJobs: number;
  experience: number;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  completedJobs: number;
  averageRating: number;
  totalRatings: number;
}

export const adaptServiceTechnicianToComponentTechnician = (
  serviceTechnician: ServiceTechnician
): ComponentTechnician => {
  return {
    id: serviceTechnician.id,
    name: `${serviceTechnician.firstName} ${serviceTechnician.lastName}`,
    specialties: [], // Technicians don't have specialties in the current schema, but we can add them later
    availability: serviceTechnician.availabilityStatus,
    currentJobs: serviceTechnician.currentJobs || 0,
    maxJobs: serviceTechnician.maxJobs || 5,
    experience: serviceTechnician.experience || 0,
    email: serviceTechnician.email,
    phone: serviceTechnician.phone,
    status: serviceTechnician.status,
    completedJobs: serviceTechnician.completedJobs || 0,
    averageRating: serviceTechnician.averageRating || 0,
    totalRatings: serviceTechnician.totalRatings || 0,
  };
};
