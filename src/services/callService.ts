import api from "./api";

interface InitiateCallParams {
  to: string;
  contactId?: string;
  notes?: string;
}

interface CallHistoryParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

class CallService {
  /**
   * Initiate a new call
   */
  async initiateCall(params: InitiateCallParams) {
    try {
      const response = await api.post("/v1/calls/initiate", params);
      return response.data;
    } catch (error: any) {
      console.error("Call service - initiate call error:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * End an active call
   */
  async endCall(callId: string) {
    try {
      const response = await api.post(`/v1/calls/${callId}/end`);
      return response.data;
    } catch (error: any) {
      console.error("Call service - end call error:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get call history
   */
  async getCallHistory(params?: CallHistoryParams) {
    try {
      const response = await api.get("/v1/calls/history", { params });
      return response.data;
    } catch (error: any) {
      console.error("Call service - get history error:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get specific call details
   */
  async getCallDetails(callId: string) {
    try {
      const response = await api.get(`/v1/calls/${callId}`);
      return response.data;
    } catch (error: any) {
      console.error("Call service - get details error:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Update call notes
   */
  async updateCallNotes(callId: string, notes: string) {
    try {
      const response = await api.patch(`/v1/calls/${callId}/notes`, { notes });
      return response.data;
    } catch (error: any) {
      console.error("Call service - update notes error:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get call statistics
   */
  async getCallStatistics(startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("/v1/calls/statistics", { params });
      return response.data;
    } catch (error: any) {
      console.error("Call service - get statistics error:", error);
      throw error.response?.data || error;
    }
  }

  /**
   * Export call history to CSV
   */
  async exportCallHistory(params?: CallHistoryParams) {
    try {
      const response = await api.get("/v1/calls/export", {
        params,
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `call-history-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      console.error("Call service - export history error:", error);
      throw error.response?.data || error;
    }
  }
}

export default new CallService();