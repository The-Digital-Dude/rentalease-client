import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import jobService from "../services/jobService";
import type { Job } from "../services/jobService";

// Available Job interface for the component
export interface AvailableJob {
  id: string;
  job_id: string;
  propertyAddress: string;
  propertyId: string;
  propertyStreet: string;
  propertySuburb: string;
  propertyState: string;
  propertyPostcode: string;
  propertyType: string;
  agencyName: string;
  jobType: string;
  priority: string;
  status: string;
  dueDate: string;
  createdDate: string;
  estimatedDuration?: string;
  description?: string;
  urgency?: string;
  notes?: string;
}

// Filter interface
export interface AvailableJobFilters {
  search?: string;
  selectedDate?: string;
  selectedPriority?: string;
  selectedJobType?: string;
  selectedStatus?: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  propertyType?: string;
}

// State interface
interface AvailableJobsState {
  jobs: AvailableJob[];
  filteredJobs: AvailableJob[];
  loading: boolean;
  error: string | null;
  filters: AvailableJobFilters;
  totalJobs: number;
  claimingJobs: Record<string, boolean>; // Track which jobs are being claimed
}

// Initial state
const initialState: AvailableJobsState = {
  jobs: [],
  filteredJobs: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    selectedDate: "",
    selectedPriority: "all",
    selectedJobType: "all",
    selectedStatus: "all",
  },
  totalJobs: 0,
  claimingJobs: {},
};

// Async thunk to fetch available jobs
export const fetchAvailableJobs = createAsyncThunk(
  "availableJobs/fetchAvailableJobs",
  async (
    filters: {
      jobType?: string;
      status?: string;
      priority?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      property?: string;
      region?: string;
      propertyType?: string;
      minPriority?: string;
      maxPriority?: string;
      estimatedDuration?: number;
      costRange?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // Use the new available jobs endpoint
      const response = await jobService.getAvailableJobs(filters);

      if (response.success && response.data) {
        const jobs = response.data as Job[];

        // Transform jobs to AvailableJob format
        const availableJobs: AvailableJob[] = jobs.map((job) => {
          // Extract property information
          const property =
            typeof job.property === "string" ? null : job.property;

          return {
            id: job.id,
            job_id: job.job_id,
            propertyAddress:
              property?.address?.fullAddress ||
              property?.address?.street ||
              "Address not available",
            propertyId:
              typeof job.property === "string"
                ? job.property
                : property?._id || "",
            propertyStreet: property?.address?.street || "",
            propertySuburb: property?.address?.suburb || "",
            propertyState: property?.address?.state || "",
            propertyPostcode: property?.address?.postcode || "",
            propertyType: property?.propertyType || "Property",
            agencyName: property?.agency?.companyName || "",
            jobType: job.jobType,
            priority: job.priority,
            status: job.status,
            dueDate: job.dueDate,
            createdDate: job.createdAt,
            estimatedDuration: job.estimatedDuration
              ? `${job.estimatedDuration} hours`
              : undefined,
            description: job.description,
            urgency:
              job.priority === "Urgent" || job.priority === "High"
                ? "Urgent"
                : "Normal",
            notes: job.notes,
          };
        });

        return {
          jobs: availableJobs,
          totalJobs: availableJobs.length,
        };
      } else {
        return rejectWithValue(
          response.message || "Failed to fetch available jobs"
        );
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch available jobs");
    }
  }
);

// Async thunk to claim a job
export const claimJob = createAsyncThunk(
  "availableJobs/claimJob",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobService.claimJob(jobId);

      if (response.success && response.data) {
        return {
          jobId,
          message: response.message,
          data: response.data,
        };
      } else {
        return rejectWithValue(response.message || "Failed to claim job");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to claim job");
    }
  }
);

// Create the slice
const availableJobsSlice = createSlice({
  name: "availableJobs",
  initialState,
  reducers: {
    // Set filters
    setFilters: (
      state,
      action: PayloadAction<Partial<AvailableJobFilters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters immediately
      availableJobsSlice.caseReducers.applyFilters(state);
    },

    // Clear all filters
    clearFilters: (state) => {
      state.filters = {
        search: "",
        selectedDate: "",
        selectedPriority: "all",
        selectedJobType: "all",
        selectedStatus: "all",
        startDate: "",
        endDate: "",
        region: "all",
        propertyType: "all",
      };
      // Reset filtered jobs to all jobs
      state.filteredJobs = state.jobs;
    },

    // Apply filters to jobs
    applyFilters: (state) => {
      let filtered = [...state.jobs];

      // Search filter
      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase();
        filtered = filtered.filter(
          (job) =>
            job.propertyAddress.toLowerCase().includes(searchTerm) ||
            job.jobType.toLowerCase().includes(searchTerm) ||
            (job.description &&
              job.description.toLowerCase().includes(searchTerm))
        );
      }

      // Date filter
      if (state.filters.selectedDate) {
        filtered = filtered.filter(
          (job) => job.createdDate.split("T")[0] === state.filters.selectedDate
        );
      }

      // Priority filter
      if (
        state.filters.selectedPriority &&
        state.filters.selectedPriority !== "all"
      ) {
        filtered = filtered.filter(
          (job) => job.priority === state.filters.selectedPriority
        );
      }

      // Job type filter
      if (
        state.filters.selectedJobType &&
        state.filters.selectedJobType !== "all"
      ) {
        filtered = filtered.filter(
          (job) => job.jobType === state.filters.selectedJobType
        );
      }

      // Status filter
      if (
        state.filters.selectedStatus &&
        state.filters.selectedStatus !== "all"
      ) {
        filtered = filtered.filter(
          (job) => job.status === state.filters.selectedStatus
        );
      }

      state.filteredJobs = filtered;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available jobs
      .addCase(fetchAvailableJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.filteredJobs = action.payload.jobs;
        state.totalJobs = action.payload.totalJobs;
        state.error = null;
      })
      .addCase(fetchAvailableJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Claim job
      .addCase(claimJob.pending, (state, action) => {
        // Set loading state for specific job
        state.claimingJobs[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(claimJob.fulfilled, (state, action) => {
        // Remove loading state for specific job
        delete state.claimingJobs[action.payload.jobId];

        // Remove the claimed job from the list
        state.jobs = state.jobs.filter(
          (job) => job.id !== action.payload.jobId
        );
        state.filteredJobs = state.filteredJobs.filter(
          (job) => job.id !== action.payload.jobId
        );
        state.totalJobs = state.jobs.length;
        state.error = null;
      })
      .addCase(claimJob.rejected, (state, action) => {
        // Remove loading state for specific job
        if (action.meta.arg) {
          delete state.claimingJobs[action.meta.arg];
        }
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setFilters, clearFilters, applyFilters, clearError } =
  availableJobsSlice.actions;

// Export reducer
export default availableJobsSlice.reducer;
