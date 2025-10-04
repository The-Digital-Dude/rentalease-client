import api from "./api";

export interface TechnicianCalendarEvent {
  id: string;
  jobId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  jobType: string;
  priority: string;
  status: string;
  shift?: string;
  estimatedDuration?: number;
  location?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  property?: {
    id?: string;
    type?: string;
  };
}

export interface TechnicianCalendarSummary {
  totalEvents: number;
  dateRange?: {
    start: string;
    end: string;
  };
  statusCounts?: Record<string, number>;
}

export interface TechnicianCalendarResponse {
  technician?: {
    id: string;
    name: string;
  };
  events: TechnicianCalendarEvent[];
  summary?: TechnicianCalendarSummary;
}

export interface CalendarFeedInstructions {
  ios?: string;
  android?: string;
  outlook?: string;
}

export interface CalendarFeedResponse {
  feedUrl: string;
  instructions?: CalendarFeedInstructions;
}

export interface CalendarFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const calendarService = {
  async getTechnicianCalendar(
    filters: CalendarFilters = {}
  ): Promise<TechnicianCalendarResponse> {
    try {
      const params: Record<string, string> = { format: "json" };

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await api.get("/v1/calendar/my-calendar", { params });

      if (response.data?.status === "success" && response.data?.data) {
        return {
          technician: response.data.data.technician,
          events: response.data.data.events || [],
          summary: response.data.data.summary,
        };
      }

      return {
        technician: undefined,
        events: [],
        summary: undefined,
      };
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to load calendar events"
      );
    }
  },

  async getTechnicianCalendarFeed(technicianId: string): Promise<CalendarFeedResponse> {
    try {
      const response = await api.get(
        `/v1/calendar/technician/${technicianId}/feed-url`
      );

      if (response.data?.status === "success" && response.data?.data) {
        return {
          feedUrl: response.data.data.feedUrl,
          instructions: response.data.data.instructions,
        };
      }

      throw new Error("Unable to generate calendar feed link");
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to generate calendar feed"
      );
    }
  },
};

export default calendarService;
