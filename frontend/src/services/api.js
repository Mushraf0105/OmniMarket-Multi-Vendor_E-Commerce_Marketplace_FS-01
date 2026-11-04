import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

export const downloadOrderInvoicePDF = async (orderId, orderNumber) => {
  const token = localStorage.getItem('omni_token');
  try {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-${orderNumber || orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    return true;
  } catch (err) {
    if (token) {
      window.open(`/api/orders/${orderId}/invoice?token=${encodeURIComponent(token)}`, '_blank');
      return true;
    }
    throw err;
  }
};

export default api;

