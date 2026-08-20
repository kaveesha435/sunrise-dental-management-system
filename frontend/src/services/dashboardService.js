import api from './api';

/**
 * Dashboard service — fetches data for all dashboard sections.
 *
 * Each function maps to one section of the dashboard UI and
 * one API endpoint. When backend modules are ready (Commits 03–07),
 * only the service impl on the backend changes; these calls stay the same.
 */
const dashboardService = {
  /** GET /api/dashboard/stats — headline stat cards */
  getStats: () => api.get('/dashboard/stats'),

  /** GET /api/dashboard/appointments/today — today's appointments table */
  getTodayAppointments: () => api.get('/dashboard/appointments/today'),

  /** GET /api/dashboard/appointments/upcoming — upcoming widget */
  getUpcomingAppointments: () => api.get('/dashboard/appointments/upcoming'),

  /** GET /api/dashboard/chart/weekly — bar chart data */
  getWeeklyChart: () => api.get('/dashboard/chart/weekly'),
};

export default dashboardService;
