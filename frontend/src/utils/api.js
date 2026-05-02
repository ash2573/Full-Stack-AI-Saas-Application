import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Attach Clerk token to every request
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Generic error message extractor
export const getErrorMessage = (err) => {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'An unexpected error occurred';
};

export default api;
