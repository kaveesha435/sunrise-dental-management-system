import axios from 'axios';

/**
 * Axios instance pre-configured with the API base URL.
 * All service modules import this instance to make HTTP calls.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request interceptor — attach JWT Bearer token when available.
 * Reads from localStorage or sessionStorage depending on remember-me preference,
 * matching the storage strategy in AuthContext.
 */
api.interceptors.request.use(
  (config) => {
    const storageType = localStorage.getItem('sd_storage_type');
    const store = storageType === 'session' ? sessionStorage : localStorage;
    const token = store.getItem('sd_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — handle global 401 (token expired / invalid).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth storage — AuthContext logout will handle the redirect
      localStorage.removeItem('sd_auth_token');
      localStorage.removeItem('sd_auth_user');
      localStorage.removeItem('sd_storage_type');
      sessionStorage.removeItem('sd_auth_token');
      sessionStorage.removeItem('sd_auth_user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
