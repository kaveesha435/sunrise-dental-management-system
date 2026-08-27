import api from './api';

export const reportService = {
  getSummary: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.dentistId) params.append('dentistId', filters.dentistId);
      if (filters.treatmentId) params.append('treatmentId', filters.treatmentId);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/reports/summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getExportUrl: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.dentistId) params.append('dentistId', filters.dentistId);
    if (filters.treatmentId) params.append('treatmentId', filters.treatmentId);
    if (filters.status) params.append('status', filters.status);

    return `${api.defaults.baseURL}/reports/export?${params.toString()}`;
  }
};
