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
 * Request interceptor — attach auth token when available.
 * Will be expanded in the authentication commit.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — unwrap data and handle global errors.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auth expired — will redirect to login in auth commit
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;
