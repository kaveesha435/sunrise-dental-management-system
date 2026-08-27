import api from './api';

/**
 * Service to handle appointment APIs.
 */
const appointmentService = {
  
  /**
   * Get all appointments (paginated and filtered).
   */
  getAll({ search = '', date = '', patientId = '', dentistId = '', treatmentId = '', status = '', page = 0, size = 10, sortBy = 'appointmentDate', sortDir = 'desc' } = {}) {
    const params = { search, status, page, size, sortBy, sortDir };
    if (dentistId) params.dentistId = dentistId;
    if (treatmentId) params.treatmentId = treatmentId;
    if (date) params.date = date;
    if (patientId) params.patientId = patientId;
    
    return api.get('/appointments', { params });
  },

  /**
   * Get appointment by ID.
   */
  getById(id) {
    return api.get(`/appointments/${id}`);
  },

  /**
   * Create a new appointment.
   */
  create(data) {
    return api.post('/appointments', data);
  },

  /**
   * Update an existing appointment.
   */
  update(id, data) {
    return api.put(`/appointments/${id}`, data);
  },

  /**
   * Cancel an appointment.
   */
  cancel(id) {
    return api.put(`/appointments/${id}/cancel`);
  },

  /**
   * Check if dentist is available for a time slot.
   */
  checkAvailability(dentistId, date, time, duration, excludeId = null) {
    const params = { dentistId, date, time, duration };
    if (excludeId) params.excludeId = excludeId;
    return api.get('/appointments/dentist-availability', { params });
  },

  /**
   * Get appointment statistics summary.
   */
  getSummary() {
    return api.get('/appointments/summary');
  }
};

export default appointmentService;
