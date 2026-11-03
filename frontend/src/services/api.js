import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('omni_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Also attach session id for Redis guest cart
    let sessionId = localStorage.getItem('omni_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('omni_session_id', sessionId);
    }
    config.headers['x-session-id'] = sessionId;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: don't auto-redirect on public routes
    }
    return Promise.reject(error);
  }
);

export default api;

