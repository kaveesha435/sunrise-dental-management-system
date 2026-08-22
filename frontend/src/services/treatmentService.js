import api from './api';

/**
 * treatmentService — all API calls for Treatments Catalog.
 */
const treatmentService = {

  getAll({ search = '', active = '', page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
    const params = { search, page, size, sortBy, sortDir };
    if (active !== '') params.active = active;

    return api.get('/treatments', { params });
  },

  getById(id) {
    return api.get(`/treatments/${id}`);
  },

  create(data) {
    return api.post('/treatments', data);
  },

  update(id, data) {
    return api.put(`/treatments/${id}`, data);
  },

  delete(id) {
    return api.delete(`/treatments/${id}`);
  },

  getSummary() {
    return api.get('/treatments/summary');
  },

  getActiveTreatments() {
    return api.get('/treatments/active');
  }
};

export default treatmentService;
