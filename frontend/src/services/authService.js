import api from './api';

/**
 * Authentication service.
 * Handles all /api/auth calls.
 */
const authService = {
  /**
   * POST /api/auth/login
   * @param {string} usernameOrEmail
   * @param {string} password
   * @returns {Promise<import('./api').AxiosResponse>}
   */
  login: (usernameOrEmail, password) =>
    api.post('/auth/login', { usernameOrEmail, password }),

  /**
   * POST /api/auth/logout
   * Informs the server (for future token blacklisting); client clears storage separately.
   */
  logout: () =>
    api.post('/auth/logout').catch(() => {
      // Swallow network errors — logout should always succeed client-side
    }),
};

export default authService;
