import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();

export const apiBaseUrl = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
export const apiRootUrl = `${apiBaseUrl}/api`;

const api = axios.create({
  baseURL: apiRootUrl,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('golf-charity-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV && !error.response) {
      console.error(`API request failed. Check that the backend is reachable at ${apiRootUrl}.`, error);
    }
    return Promise.reject(error);
  }
);

export default api;
