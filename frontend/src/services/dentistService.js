import api from './api';

/**
 * dentistService — all API calls for Dentist Management.
 */
const dentistService = {

  getAll({ search = '', specialization = '', status = '', active = '', page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
    const params = { search, specialization, page, size, sortBy, sortDir };
    if (status) params.status = status;
    if (active !== '') params.active = active;

    return api.get('/dentists', { params });
  },

  getById(id) {
    return api.get(`/dentists/${id}`);
  },

  create(data) {
    return api.post('/dentists', data);
  },

  update(id, data) {
    return api.put(`/dentists/${id}`, data);
  },

  delete(id) {
    return api.delete(`/dentists/${id}`);
  },

  getSummary() {
    return api.get('/dentists/summary');
  },

  getSpecializations() {
    return api.get('/dentists/specializations');
  },

  getActiveDentists() {
    return api.get('/dentists/active');
  }
};

export default dentistService;
