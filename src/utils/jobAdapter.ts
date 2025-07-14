import type { Job as ServiceJob } from '../services/jobService';

export interface ComponentJob {
  id: string;
  job_id: string;
  propertyAddress: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "Repairs";
  dueDate: string;
  assignedTechnician: string;
  status: "Pending" | "Scheduled" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
  createdDate: string;
}

export const adaptServiceJobToComponentJob = (serviceJob: ServiceJob): ComponentJob => {
  return {
    id: serviceJob.id,
    job_id: serviceJob.job_id,
    propertyAddress: serviceJob.propertyAddress,
    jobType: serviceJob.jobType,
    dueDate: serviceJob.dueDate,
    assignedTechnician: serviceJob.assignedTechnician 
      ? (typeof serviceJob.assignedTechnician === 'string' 
          ? serviceJob.assignedTechnician 
          : serviceJob.assignedTechnician.fullName)
      : '',
    status: serviceJob.status,
    priority: serviceJob.priority,
    description: serviceJob.description,
    createdDate: serviceJob.createdAt
  };
}; 