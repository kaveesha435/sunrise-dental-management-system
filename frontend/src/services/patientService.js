import api from './api';

/**
 * patientService — all API calls for the Patient Management module.
 *
 * Every method wraps an axios call that uses the shared API instance
 * (base URL, JWT interceptor, 401 redirect are all handled by api.js).
 */
const patientService = {

  /**
   * GET /api/patients
   *
   * @param {Object} params
   * @param {string} [params.search='']      - searches name / contact / ID
   * @param {string} [params.status='']      - ACTIVE | INACTIVE | '' (all)
   * @param {number} [params.page=0]         - 0-indexed
   * @param {number} [params.size=10]
   * @param {string} [params.sortBy='createdAt']
   * @param {string} [params.sortDir='desc']
   */
  getAll({ search = '', status = '', page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
    return api.get('/patients', {
      params: { search, status, page, size, sortBy, sortDir },
    });
  },

  /**
   * GET /api/patients/summary
   * Returns { total, active, inactive, newThisMonth }
   */
  getSummary() {
    return api.get('/patients/summary');
  },

  /**
   * GET /api/patients/check-duplicate?contact=...&excludeId=...
   * Returns { data: boolean }
   */
  checkDuplicate(contact, excludeId = null) {
    const params = { contact };
    if (excludeId != null) params.excludeId = excludeId;
    return api.get('/patients/check-duplicate', { params });
  },

  /**
   * GET /api/patients/:id
   */
  getById(id) {
    return api.get(`/patients/${id}`);
  },

  /**
   * POST /api/patients
   * @param {Object} data - PatientRequest fields
   */
  create(data) {
    return api.post('/patients', data);
  },

  /**
   * PUT /api/patients/:id
   * @param {number} id
   * @param {Object} data - PatientRequest fields
   */
  update(id, data) {
    return api.put(`/patients/${id}`, data);
  },

  /**
   * DELETE /api/patients/:id
   */
  delete(id) {
    return api.delete(`/patients/${id}`);
  },
};

export default patientService;
