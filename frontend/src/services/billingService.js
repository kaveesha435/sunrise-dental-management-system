import api from './api';

/**
 * Service to handle billing/invoice APIs.
 */
const billingService = {
  
  /**
   * Get appointment billing metadata before invoice generation.
   */
  getAppointmentBillingInfo(appointmentId) {
    return api.get(`/billing/appointments/${appointmentId}`);
  },

  /**
   * Calculate a bill dynamically without saving.
   */
  calculateBill(appointmentId, consultationFee) {
    const params = { appointmentId };
    if (consultationFee !== undefined && consultationFee !== null) {
      params.consultationFee = consultationFee;
    }
    return api.get('/billing/calculate', { params });
  },

  /**
   * Save a new bill.
   */
  saveBill(data) {
    return api.post('/billing', data);
  },

  /**
   * Get all bills (paginated and filtered).
   */
  getAll({ search = '', status = '', page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
    const params = { search, status, page, size, sortBy, sortDir };
    return api.get('/billing', { params });
  },

  /**
   * Get a bill by ID.
   */
  getById(id) {
    return api.get(`/billing/${id}`);
  }
};

export default billingService;
