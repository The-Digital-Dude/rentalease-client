import type { Job as ServiceJob } from '../services/jobService';
import type { ComponentTechnician } from './staffAdapter';

export interface ComponentJob {
  id: string;
  job_id: string;
  propertyAddress: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
  dueDate: string;
  assignedTechnician: string; // Display name for table
  assignedTechnicianId: string; // ID for form submission
  status: "Pending" | "Scheduled" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
  createdDate: string;
}

export const adaptServiceJobToComponentJob = (
  serviceJob: ServiceJob, 
  technicians?: ComponentTechnician[]
): ComponentJob => {
  let assignedTechnicianName = '';
  let assignedTechnicianId = '';
  
  if (serviceJob.assignedTechnician) {
    if (typeof serviceJob.assignedTechnician === 'string') {
      // If it's a string, it could be either an ID or a name
      assignedTechnicianId = serviceJob.assignedTechnician;
      
      // Try to find the technician by ID to get the name
      if (technicians) {
        const technician = technicians.find(tech => tech.id === serviceJob.assignedTechnician);
        assignedTechnicianName = technician?.name || serviceJob.assignedTechnician;
      } else {
        assignedTechnicianName = serviceJob.assignedTechnician;
      }
    } else {
      // If it's an object with fullName, try to find the ID
      const technicianObj = serviceJob.assignedTechnician as { fullName: string };
      assignedTechnicianName = technicianObj.fullName;
      
      if (technicians) {
        const technician = technicians.find(tech => tech.name === technicianObj.fullName);
        assignedTechnicianId = technician?.id || '';
      }
    }
  }

  return {
    id: serviceJob.id,
    job_id: serviceJob.job_id,
    propertyAddress: serviceJob.propertyAddress,
    jobType: serviceJob.jobType,
    dueDate: serviceJob.dueDate,
    assignedTechnician: assignedTechnicianName,
    assignedTechnicianId: assignedTechnicianId,
    status: serviceJob.status,
    priority: serviceJob.priority,
    description: serviceJob.description,
    createdDate: serviceJob.createdAt
  };
};

// Helper function to resolve technician ID from name
export const resolveTechnicianId = (
  technicianName: string,
  technicians: ComponentTechnician[]
): string => {
  const technician = technicians.find(tech => tech.name === technicianName);
  return technician?.id || '';
}; 