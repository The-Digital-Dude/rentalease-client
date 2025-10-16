import type { Job as ServiceJob } from "../services/jobService";
import type { ComponentTechnician } from "./technicianAdapter";

export interface ComponentJob {
  id: string;
  job_id: string;
  propertyAddress: string;
  propertyId: string;
  jobType: "Gas" | "Electrical" | "Smoke" | "MinimumSafetyStandard" | "Repairs" | "Pool Safety" | "Routine Inspection";
  dueDate: string;
  assignedTechnician: string; // Display name for table
  assignedTechnicianId: string; // ID for form submission
  status: "Pending" | "Scheduled" | "Completed" | "Overdue" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Urgent";
  description?: string;
  createdDate: string;
}

export const adaptServiceJobToComponentJob = (
  serviceJob: ServiceJob,
  technicians?: ComponentTechnician[]
): ComponentJob => {
  let assignedTechnicianName = "";
  let assignedTechnicianId = "";

  if (serviceJob.assignedTechnician) {
    if (typeof serviceJob.assignedTechnician === "string") {
      assignedTechnicianId = serviceJob.assignedTechnician;
      if (technicians) {
        const technician = technicians.find(
          (tech) => tech.id === serviceJob.assignedTechnician
        );
        assignedTechnicianName =
          technician?.name || serviceJob.assignedTechnician;
      } else {
        assignedTechnicianName = serviceJob.assignedTechnician;
      }
    } else {
      const technicianObj = serviceJob.assignedTechnician as {
        fullName?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
      };

      // Try to get the name from various possible fields
      if (technicianObj.fullName) {
        assignedTechnicianName = technicianObj.fullName;
      } else if (technicianObj.firstName && technicianObj.lastName) {
        assignedTechnicianName = `${technicianObj.firstName} ${technicianObj.lastName}`;
      } else if (technicianObj.name) {
        assignedTechnicianName = technicianObj.name;
      } else {
        assignedTechnicianName = "Unknown Technician";
      }

      if (technicians) {
        const technician = technicians.find(
          (tech) => tech.name === assignedTechnicianName
        );
        assignedTechnicianId = technician?.id || "";
      }
    }
  }

  // Property address extraction
  let propertyAddress = "";
  let propertyId = "";
  if (serviceJob.property && typeof serviceJob.property === "object") {
    if (
      "address" in serviceJob.property &&
      serviceJob.property.address &&
      typeof serviceJob.property.address === "object" &&
      "fullAddress" in serviceJob.property.address
    ) {
      propertyAddress = String(serviceJob.property.address.fullAddress);
    } else if ("fullAddress" in serviceJob.property) {
      propertyAddress = String((serviceJob.property as any).fullAddress);
    }
    if ("_id" in serviceJob.property && serviceJob.property._id) {
      propertyId = String(serviceJob.property._id);
    } else if ("id" in serviceJob.property && serviceJob.property.id) {
      propertyId = String(serviceJob.property.id);
    }
  } else if (typeof serviceJob.property === "string") {
    propertyId = serviceJob.property;
    propertyAddress = serviceJob.property;
  }

  return {
    id: serviceJob.id,
    job_id: serviceJob.job_id,
    propertyAddress,
    propertyId,
    jobType: serviceJob.jobType,
    dueDate: serviceJob.dueDate,
    assignedTechnician: assignedTechnicianName,
    assignedTechnicianId: assignedTechnicianId,
    status: serviceJob.status,
    priority: serviceJob.priority,
    description: serviceJob.description,
    createdDate: serviceJob.createdAt,
  };
};

// Helper function to resolve technician ID from name
export const resolveTechnicianId = (
  technicianName: string,
  technicians: ComponentTechnician[]
): string => {
  const technician = technicians.find((tech) => tech.name === technicianName);
  return technician?.id || "";
};
