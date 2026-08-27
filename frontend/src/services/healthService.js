import api from './api';

/**
 * Health service — checks connectivity to the Spring Boot API.
 */
const healthService = {
  /**
   * GET /api/health
   * @returns {Promise<{status: string, service: string, version: string}>}
   */
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default healthService;
