import axios from 'axios';
import { ENV } from '../config/env';

/**
 * Centralized Gateway Axios HTTP Client.
 * Auto-injects X-Correlation-Id UUID & Bearer tokens.
 * Clears stale tokens on 401 Unauthorized to prevent request cascades.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const client = axios.create({
  baseURL: ENV.API_GATEWAY_URL,
  timeout: ENV.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach X-Correlation-Id & Bearer Token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Attach user identity header for dev mode / gateway testing
  const userId = localStorage.getItem('user_id') || '1';
  config.headers['X-User-Id'] = userId;
  
  // Safe correlation ID generator (supports non-secure HTTP & HTTPS contexts)
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Inject Correlation ID
  config.headers['X-Correlation-Id'] = `corr_${generateUUID()}`;
  return config;
});

// Response Interceptor: Unwrap Standard Envelopes & Catch 401
client.interceptors.response.use(
  (response) => {
    // If the response is wrapped in our standardized envelope, return the raw data block to the caller
    if (response.data && response.data.hasOwnProperty('success') && response.data.hasOwnProperty('data')) {
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('[API Client] 401 Unauthorized detected. Clearing stale tokens.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_profile');
    }
    return Promise.reject(error);
  }
);
